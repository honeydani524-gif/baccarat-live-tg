/**
 * 금액 유틸 — 가장 중요한 규칙
 *
 * 1 USDT = 1,000,000 micro-USDT
 * 모든 금액은 정수(micro)로만 연산합니다. 부동소수점 연산 금지.
 * 대상: 잔액 / 베팅 / 충전 / 출금 / 스테이킹 / 정산
 */

export const MICRO_PER_USDT = 1_000_000;

/** micro 정수 유효성 검증 — 위반 시 Error */
export function assertMicro(value, name = "amount") {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`INVALID_MICRO_AMOUNT(${name}): ${value}`);
  }
  return value;
}

/** "150.50" | 12.5 → micro (문자열 파싱 기반 — float 곱셈 사용 안 함) */
export function usdtToMicro(input) {
  const str = String(input ?? "").replace(/,/g, "").trim();
  if (!/^\d+(\.\d{1,6})?$/.test(str)) throw new Error("INVALID_AMOUNT_FORMAT");
  const [whole, frac = ""] = str.split(".");
  const micro = BigInt(whole) * BigInt(MICRO_PER_USDT) + BigInt((frac + "000000").slice(0, 6));
  const value = Number(micro);
  if (!Number.isSafeInteger(value)) throw new Error("AMOUNT_OUT_OF_RANGE");
  return value;
}

/** 정수 범위 min/max 검증 */
export function assertRange(micro, minMicro, maxMicro, name = "amount") {
  assertMicro(micro, name);
  if (micro < minMicro) throw new Error(`AMOUNT_BELOW_MIN(${name})`);
  if (micro > maxMicro) throw new Error(`AMOUNT_ABOVE_MAX(${name})`);
  return micro;
}

/** 가감 (잔액 부족 시 Error) — Firestore Transaction 내에서 사용 */
export function addMicro(a, b) {
  const out = assertMicro(a, "a") + assertMicro(b, "b");
  if (!Number.isSafeInteger(out)) throw new Error("AMOUNT_OUT_OF_RANGE");
  return out;
}

export function subMicro(a, b) {
  const out = assertMicro(a, "a") - assertMicro(b, "b");
  if (out < 0) throw new Error("INSUFFICIENT_BALANCE");
  return out;
}

/** 배당 계산 — 정수 비율(numerator/denominator)로만 계산, 나머지는 버림(floor) */
export function payoutMicro(stakeMicro, oddsNumerator, oddsDenominator = 1) {
  assertMicro(stakeMicro, "stake");
  const profit = (BigInt(stakeMicro) * BigInt(oddsNumerator)) / BigInt(oddsDenominator);
  const value = Number(profit);
  if (!Number.isSafeInteger(value)) throw new Error("AMOUNT_OUT_OF_RANGE");
  return value;
}

/** 표시용 문자열 (로깅/응답 보조) */
export function microToDisplay(micro) {
  const n = assertMicro(micro);
  const whole = Math.floor(n / MICRO_PER_USDT);
  const frac = String(n % MICRO_PER_USDT).padStart(6, "0").replace(/0+$/, "").slice(0, 2);
  return `${whole.toLocaleString("en-US")}.${frac.padEnd(2, "0")}`;
}
