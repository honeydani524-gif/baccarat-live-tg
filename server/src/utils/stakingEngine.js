/**
 * 스테이킹 엔진 (Skeleton)
 * - 방장/운영자의 풀에 사용자가 USDT를 참여시키는 구조
 * - 지분 계산 및 정산은 정수 비율로만 처리합니다.
 */
import { assertMicro, assertRange } from "./moneyUtil.js";

export const POOL_STATUSES = ["OPEN", "CLOSED", "ACTIVE", "FINISHED", "SETTLING", "SETTLED"];

/** 풀 참여 가능 여부 + 금액 검증 */
export function validateJoin(pool, amountMicro) {
  if (!pool) throw new Error("POOL_NOT_FOUND");
  if (pool.status !== "OPEN") throw new Error("POOL_NOT_OPEN");

  const now = Date.now();
  if (pool.recruitmentStartsAt && now < pool.recruitmentStartsAt) throw new Error("RECRUITMENT_NOT_STARTED");
  if (pool.recruitmentEndsAt && now > pool.recruitmentEndsAt) throw new Error("RECRUITMENT_ENDED");

  assertRange(amountMicro, pool.minAmountMicro, pool.maxAmountMicro, "stake");
  return true;
}

/** 지분율 계산 (정수 비율: 참여금 / 풀 총액) — 소수점 없이 basis-point로 반환 */
export function shareBps(participantMicro, poolTotalMicro) {
  assertMicro(participantMicro);
  assertMicro(poolTotalMicro);
  if (poolTotalMicro === 0) return 0;
  return Number((BigInt(participantMicro) * 10_000n) / BigInt(poolTotalMicro));
}

/**
 * TODO(2차): 풀 정산
 * 1. status=SETTLING 검증
 * 2. 참여자 전원 지분 계산 (shareBps)
 * 3. 손익 배분 후 db.runTransaction으로 잔액 반영
 * 4. status=SETTLED + settledAt 기록
 */
export async function settlePoolWithTransaction(/* db, poolId, profitMicro */) {
  throw new Error("NOT_IMPLEMENTED — 2차 단계에서 Firestore Transaction으로 구현");
}
