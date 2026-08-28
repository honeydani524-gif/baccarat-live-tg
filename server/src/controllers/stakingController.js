/**
 * 스테이킹 컨트롤러
 * GET  /api/staking/pools
 * POST /api/staking/pools            (ADMIN+)
 * GET  /api/staking/pools/:poolId
 * POST /api/staking/pools/:poolId/join
 */
import { ok, fail, handler, requireFields } from "../utils/respond.js";
import { assertRange } from "../utils/moneyUtil.js";
import { validateJoin } from "../utils/stakingEngine.js";
import { store, getUser } from "../store/memoryStore.js";
import { logger } from "../utils/logger.js";

export const listPools = handler(async (req, res) => {
  return ok(res, { pools: store.pools });
});

export const getPoolById = handler(async (req, res) => {
  const pool = store.pools.find((p) => p.id === req.params.poolId);
  if (!pool) return fail(res, 404, "POOL_NOT_FOUND", "풀을 찾을 수 없습니다.");
  const participants = store.poolParticipants.get(pool.id) || [];
  return ok(res, { pool, participants });
});

/** 풀 생성 (ADMIN+) — 스켈레톤: 기본 검증 후 메모리 저장 */
export const createPool = handler(async (req, res) => {
  requireFields(req.body, ["name", "minAmountMicro", "maxAmountMicro"]);
  const { name, description = "", minAmountMicro, maxAmountMicro, earlyExitAllowed = true } = req.body;
  try {
    assertRange(minAmountMicro, 1, maxAmountMicro, "minAmountMicro");
    assertRange(maxAmountMicro, minAmountMicro, Number.MAX_SAFE_INTEGER, "maxAmountMicro");
  } catch {
    return fail(res, 400, "INVALID_AMOUNT_RANGE", "최소/최대 금액 범위가 올바르지 않습니다.");
  }
  const pool = {
    id: `pool_${Date.now().toString(36)}`,
    hostId: req.user.telegramId,
    hostName: req.user.telegramId,
    name,
    description,
    minAmountMicro,
    maxAmountMicro,
    earlyExitAllowed: Boolean(earlyExitAllowed),
    recruitmentStartsAt: null,
    recruitmentEndsAt: null,
    startsAt: null,
    endsAt: null,
    status: "OPEN",
    participants: 0,
    totalStakedMicro: 0,
    createdAt: Date.now(),
  };
  store.pools.push(pool);
  logger.info("[staking] 풀 생성", { poolId: pool.id, by: req.user.telegramId });
  return ok(res, { pool }, 201);
});

export const joinPool = handler(async (req, res) => {
  const pool = store.pools.find((p) => p.id === req.params.poolId);
  const { amountMicro } = req.body || {};

  try {
    validateJoin(pool, Number(amountMicro));
  } catch (e) {
    const codeMap = {
      POOL_NOT_FOUND: [404, "풀을 찾을 수 없습니다."],
      POOL_NOT_OPEN: [409, "현재 모집 중인 풀이 아닙니다."],
      RECRUITMENT_NOT_STARTED: [409, "모집이 시작되지 않았습니다."],
      RECRUITMENT_ENDED: [409, "모집이 마감되었습니다."],
    };
    const [status, message] = codeMap[e.message] || [400, "참여 금액이 범위를 벗어났습니다."];
    return fail(res, status, e.message === "UNKNOWN" ? "INVALID_JOIN" : e.message, message);
  }

  // TODO(2차): Firestore Transaction으로 잔액 차감 + participant 문서 생성
  const user = getUser(req.user.telegramId);
  if (!user) return fail(res, 404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
  if (user.balanceMicro < amountMicro) return fail(res, 400, "INSUFFICIENT_BALANCE", "잔액이 부족합니다.");
  user.balanceMicro -= amountMicro;

  const list = store.poolParticipants.get(pool.id) || [];
  const participant = { telegramId: String(req.user.telegramId), amountMicro, joinedAt: Date.now() };
  list.push(participant);
  store.poolParticipants.set(pool.id, list);
  pool.participants += 1;
  pool.totalStakedMicro += amountMicro;

  logger.info("[staking] 풀 참여", { poolId: pool.id, amountMicro });
  return ok(res, { joined: true, participant, balanceMicro: user.balanceMicro }, 201);
});
