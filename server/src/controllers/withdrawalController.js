/**
 * 출금 컨트롤러 (Skeleton)
 * - 요청 즉시 잔액 홀딩(Transaction), 승인/거절에 따라 확정/환불 (2차)
 */
import { ok, fail, handler, requireFields } from "../utils/respond.js";
import { assertMicro } from "../utils/moneyUtil.js";
import { store, getUser } from "../store/memoryStore.js";

const MIN_WITHDRAW_MICRO = 10_000_000; // 10 USDT

export const createWithdrawal = handler(async (req, res) => {
  requireFields(req.body, ["amountMicro", "address"]);
  const { amountMicro, address, network = process.env.PLATFORM_WALLET_NETWORK || "TRC-20" } = req.body;
  try {
    assertMicro(Number(amountMicro));
  } catch {
    return fail(res, 400, "INVALID_AMOUNT", "금액 형식이 올바르지 않습니다.");
  }
  if (Number(amountMicro) < MIN_WITHDRAW_MICRO) {
    return fail(res, 400, "AMOUNT_BELOW_MIN", "최소 출금 금액은 10 USDT입니다.");
  }
  if (typeof address !== "string" || address.length < 10) {
    return fail(res, 400, "INVALID_ADDRESS", "지갑 주소가 올바르지 않습니다.");
  }

  // TODO(2차): db.runTransaction으로 잔액 홀딩 처리
  const user = getUser(req.user.telegramId);
  if (!user) return fail(res, 404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
  if (user.balanceMicro < amountMicro) return fail(res, 400, "INSUFFICIENT_BALANCE", "잔액이 부족합니다.");
  user.balanceMicro -= Number(amountMicro);

  const withdrawal = {
    id: `wd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    telegramId: String(req.user.telegramId),
    amountMicro: Number(amountMicro),
    address,
    network,
    status: "PENDING", // PENDING → APPROVED / REJECTED(환불)
    createdAt: Date.now(),
  };
  store.withdrawals.push(withdrawal);
  return ok(res, { withdrawal, balanceMicro: user.balanceMicro }, 201);
});

export const myWithdrawals = handler(async (req, res) => {
  const withdrawals = store.withdrawals.filter((w) => w.telegramId === String(req.user.telegramId));
  return ok(res, { withdrawals });
});
