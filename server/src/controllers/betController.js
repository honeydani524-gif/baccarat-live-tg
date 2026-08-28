/**
 * 베팅 컨트롤러
 * POST   /api/rooms/:roomId/bets        베팅 확정 (clientBetId로 중복 요청 방지)
 * DELETE /api/rooms/:roomId/bets/:betId 베팅 취소 (마감 전만 가능)
 *
 * 금액 규칙: 모든 금액은 micro-USDT 정수, 잔액 차감은 Firestore Transaction 기반.
 * 프론트가 본 금액은 신뢰하지 않고 서버에서 재검증합니다.
 */
import { ok, fail, handler, requireFields } from "../utils/respond.js";
import { assertMicro } from "../utils/moneyUtil.js";
import { store, getRoom, getCurrentRound, getUser } from "../store/memoryStore.js";
import { isFirebaseEnabled } from "../config/firebaseAdmin.js";
import { logger } from "../utils/logger.js";

export const BET_TYPE_KEYS = [
  "DRAGON7",
  "PANDA8",
  "PLAYER_PAIR",
  "TIE",
  "BANKER_PAIR",
  "PLAYER",
  "BANKER",
];

const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/**
 * 베팅 검증 + 저장 핵심 로직 (HTTP와 Socket.io에서 공용으로 사용)
 * @returns {{ bet: object, balanceMicro: number }}
 */
export function placeBetForUser({ telegramId, roomId, payload }) {
  requireFields(payload, ["bets"]);
  const { bets, clientBetId } = payload;

  if (!Array.isArray(bets) || bets.length === 0 || bets.length > BET_TYPE_KEYS.length) {
    const e = new Error("INVALID_BETS");
    e.code = "INVALID_BETS";
    e.status = 400;
    throw e;
  }

  // 중복 요청 방지 — 동일 clientBetId는 기존 결과를 그대로 반환(idempotent)
  if (clientBetId && store.clientBetIndex.has(clientBetId)) {
    const prev = store.bets.get(store.clientBetIndex.get(clientBetId));
    const user = getUser(telegramId);
    if (prev) return { bet: prev, balanceMicro: user?.balanceMicro ?? 0, duplicated: true };
  }

  const room = getRoom(roomId);
  if (!room || !room.isActive) {
    const e = new Error("ROOM_NOT_FOUND");
    e.code = "ROOM_NOT_FOUND";
    e.status = 404;
    throw e;
  }
  const round = getCurrentRound(roomId);
  if (round?.status !== "BETTING") {
    const e = new Error("BETTING_CLOSED");
    e.code = "BETTING_CLOSED";
    e.status = 409;
    throw e;
  }

  const seen = new Set();
  let totalMicro = 0;
  for (const b of bets) {
    if (!BET_TYPE_KEYS.includes(b.type) || seen.has(b.type)) {
      const e = new Error("INVALID_BET_TYPE");
      e.code = "INVALID_BET_TYPE";
      e.status = 400;
      throw e;
    }
    seen.add(b.type);
    try {
      assertMicro(b.amountMicro, b.type);
    } catch {
      const e = new Error("INVALID_AMOUNT");
      e.code = "INVALID_AMOUNT";
      e.status = 400;
      throw e;
    }
    if (b.amountMicro < room.minBetMicro || b.amountMicro > room.maxBetMicro) {
      const e = new Error("AMOUNT_OUT_OF_LIMIT");
      e.code = "AMOUNT_OUT_OF_LIMIT";
      e.status = 400;
      throw e;
    }
    totalMicro += b.amountMicro;
  }

  // --- 잔액 차감 ---
  // TODO(2차): Firestore가 활성화되면 db.runTransaction으로 원자적 차감 + bet 문서 생성
  const user = getUser(telegramId);
  if (!user) {
    const e = new Error("USER_NOT_FOUND");
    e.code = "USER_NOT_FOUND";
    e.status = 404;
    throw e;
  }
  if (user.balanceMicro < totalMicro) {
    const e = new Error("INSUFFICIENT_BALANCE");
    e.code = "INSUFFICIENT_BALANCE";
    e.status = 400;
    throw e;
  }
  user.balanceMicro -= totalMicro;

  const bet = {
    id: newId("bet"),
    roomId,
    roundNumber: round.roundNumber,
    telegramId: String(telegramId),
    bets,
    totalMicro,
    clientBetId: clientBetId || null,
    status: "ACCEPTED",
    createdAt: Date.now(),
  };
  store.bets.set(bet.id, bet);
  if (clientBetId) store.clientBetIndex.set(clientBetId, bet.id);

  logger.info("[bet] 베팅 접수", { betId: bet.id, roomId, totalMicro, firebase: isFirebaseEnabled() });
  return { bet, balanceMicro: user.balanceMicro };
}

export const placeBet = handler(async (req, res) => {
  try {
    const result = placeBetForUser({
      telegramId: req.user.telegramId,
      roomId: req.params.roomId,
      payload: req.body,
    });
    // Socket으로 잔액 갱신 브로드캐스트 (2차: 유저 채널로 스코프)
    req.app.get("io")?.emit("balance_updated", {
      telegramId: req.user.telegramId,
      balanceMicro: result.balanceMicro,
    });
    return ok(res, result, result.duplicated ? 200 : 201);
  } catch (e) {
    return fail(res, e.status || 500, e.code || "BET_FAILED", e.message);
  }
});

export const cancelBet = handler(async (req, res) => {
  const { roomId, betId } = req.params;
  const bet = store.bets.get(betId);
  if (!bet || bet.roomId !== roomId || bet.telegramId !== String(req.user.telegramId)) {
    return fail(res, 404, "BET_NOT_FOUND", "베팅을 찾을 수 없습니다.");
  }
  const round = getCurrentRound(roomId);
  if (round?.status !== "BETTING" || round.roundNumber !== bet.roundNumber) {
    return fail(res, 409, "BET_LOCKED", "이미 마감된 베팅은 취소할 수 없습니다.");
  }
  // TODO(2차): Firestore Transaction으로 환불 처리
  const user = getUser(req.user.telegramId);
  if (user) user.balanceMicro += bet.totalMicro;
  bet.status = "CANCELLED";

  req.app.get("io")?.emit("balance_updated", { telegramId: req.user.telegramId, balanceMicro: user?.balanceMicro ?? 0 });
  return ok(res, { cancelled: true, betId, balanceMicro: user?.balanceMicro ?? 0 });
});
