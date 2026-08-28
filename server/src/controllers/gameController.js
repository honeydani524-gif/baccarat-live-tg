/**
 * 게임 진행 컨트롤러 (딜러 운영 Skeleton)
 * - 결과는 카드 입력이 아닌 "결과 플래그"로만 확정합니다.
 * - 상태 전이: BETTING → CLOSED → RESULT_PENDING → (확정) → SETTLED
 */
import { ok, fail, handler, requireFields } from "../utils/respond.js";
import { getRoom, getCurrentRound, updateRound, store } from "../store/memoryStore.js";
import { logger } from "../utils/logger.js";

const VALID_RESULT_KEYS = ["dragon7", "panda8", "playerPair", "tie", "bankerPair", "player", "banker"];

/** POST /api/rooms/:roomId/dealer/close-betting */
export const closeBetting = handler(async (req, res) => {
  const round = getCurrentRound(req.params.roomId);
  if (!round) return fail(res, 404, "ROOM_NOT_FOUND", "게임방을 찾을 수 없습니다.");
  if (round.status !== "BETTING") return fail(res, 409, "NOT_BETTING", "베팅 진행 중이 아닙니다.");

  updateRound(req.params.roomId, { status: "CLOSED", bettingClosedAt: Date.now() });
  req.app.get("io")?.to(`room:${req.params.roomId}`).emit("betting_closed", { roundNumber: round.roundNumber });
  logger.info("[game] 베팅 마감", { roomId: req.params.roomId, roundNumber: round.roundNumber });
  return ok(res, { round: getCurrentRound(req.params.roomId) });
});

/** POST /api/rooms/:roomId/dealer/confirm-result  { result: {dragon7, panda8, playerPair, tie, bankerPair, player, banker} } */
export const confirmResult = handler(async (req, res) => {
  requireFields(req.body, ["result"]);
  const round = getCurrentRound(req.params.roomId);
  if (!round) return fail(res, 404, "ROOM_NOT_FOUND", "게임방을 찾을 수 없습니다.");
  if (round.status !== "CLOSED" && round.status !== "RESULT_PENDING") {
    return fail(res, 409, "INVALID_STATE", "결과를 확정할 수 있는 상태가 아닙니다.");
  }

  const result = {};
  for (const key of VALID_RESULT_KEYS) result[key] = Boolean(req.body.result[key]);
  if (!result.player && !result.banker && !result.tie) {
    return fail(res, 400, "INVALID_RESULT", "승자(PLAYER/BANKER/TIE)가 반드시 포함되어야 합니다.");
  }

  req.app.get("io")?.to(`room:${req.params.roomId}`).emit("result_pending", { roundNumber: round.roundNumber, result });
  updateRound(req.params.roomId, { status: "RESULT_PENDING", result });
  // TODO(2차): settleRoundWithTransaction(db, roundId, result) 호출 후 SETTLED 전이 + settlement_done 이벤트
  updateRound(req.params.roomId, { confirmedAt: Date.now() });
  req.app.get("io")?.to(`room:${req.params.roomId}`).emit("result_confirmed", { roundNumber: round.roundNumber, result });

  logger.info("[game] 결과 확정", { roomId: req.params.roomId, roundNumber: round.roundNumber });
  return ok(res, { round: getCurrentRound(req.params.roomId) });
});

/** POST /api/rooms/:roomId/dealer/next-round */
export const nextRound = handler(async (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room) return fail(res, 404, "ROOM_NOT_FOUND", "게임방을 찾을 수 없습니다.");
  const round = getCurrentRound(room.id);
  if (!["SETTLED", "RESULT_PENDING", "CLOSED", "PREPARING"].includes(round.status)) {
    return fail(res, 409, "INVALID_STATE", "아직 라운드를 전환할 수 없습니다.");
  }
  const next = round.roundNumber + 1;
  updateRound(room.id, {
    roundNumber: next,
    status: "BETTING",
    result: null,
    bettingStartedAt: Date.now(),
    bettingClosedAt: null,
    confirmedAt: null,
    settledAt: null,
  });
  store.rounds.set(room.id, getCurrentRound(room.id));
  req.app.get("io")?.to(`room:${room.id}`).emit("round_started", { roundNumber: next });
  logger.info("[game] 라운드 시작", { roomId: room.id, roundNumber: next });
  return ok(res, { round: getCurrentRound(room.id) });
});
