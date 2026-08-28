/**
 * 충전 컨트롤러 (Skeleton)
 * - 입금 주소/네트워크는 환경변수로만 관리 (코드 하드코딩 금지)
 * - 실제 반영은 관리자 승인 플로우 + Transaction으로 구현 예정 (2차)
 */
import { ok, fail, handler, requireFields } from "../utils/respond.js";
import { assertMicro } from "../utils/moneyUtil.js";
import { store } from "../store/memoryStore.js";

export const createDeposit = handler(async (req, res) => {
  requireFields(req.body, ["amountMicro"]);
  const { amountMicro, txHash = null } = req.body;
  try {
    assertMicro(Number(amountMicro));
  } catch {
    return fail(res, 400, "INVALID_AMOUNT", "금액 형식이 올바르지 않습니다.");
  }
  if (Number(amountMicro) <= 0) return fail(res, 400, "INVALID_AMOUNT", "금액은 0보다 커야 합니다.");

  const deposit = {
    id: `dep_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    telegramId: String(req.user.telegramId),
    amountMicro: Number(amountMicro),
    txHash,
    address: process.env.PLATFORM_WALLET_ADDRESS || null,
    network: process.env.PLATFORM_WALLET_NETWORK || "TRC-20",
    status: "PENDING", // PENDING → CONFIRMED / REJECTED
    createdAt: Date.now(),
  };
  store.deposits.push(deposit);
  // TODO(2차): 온체인 검증 → db.runTransaction으로 잔액 반영 + 상태 CONFIRMED
  return ok(res, { deposit }, 201);
});

export const myDeposits = handler(async (req, res) => {
  const deposits = store.deposits.filter((d) => d.telegramId === String(req.user.telegramId));
  return ok(res, { deposits });
});
