/**
 * 금액 유틸 — 절대 부동소수점으로 금액을 계산하지 않습니다.
 * 남납 기준 단위: micro-USDT (1 USDT = 1,000,000 micro)
 * 모든 남납 금액은 정수(Number, safe-integer 범위)로만 다룹니다.
 */

export const MICRO_PER_USDT = 1_000_000;

/** micro → "1,250.35" 형태의 표시 문자열 */
export function formatUsdt(micro, { decimals = 2, trim = true } = {}) {
  const n = Number(micro);
  if (!Number.isFinite(n)) return "0.00";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(n));
  const whole = Math.floor(abs / MICRO_PER_USDT);
  let frac = String(abs % MICRO_PER_USDT).padStart(6, "0").slice(0, Math.min(6, Math.max(decimals, 2)));
  if (trim) frac = frac.replace(/0+$/, "");
  const head = whole.toLocaleString("en-US");
  return frac ? `${sign}${head}.${frac}` : `${sign}${head}.00`;
}

/** "1,250.5" / 12.5 / "0.000001" → micro 정수. 유효하지 않으면 Error */
export function parseUsdtToMicro(input) {
  const str = String(input ?? "").replace(/,/g, "").trim();
  if (!/^\d+(\.\d{1,6})?$/.test(str)) {
    throw new Error("INVALID_AMOUNT_FORMAT");
  }
  const [whole, frac = ""] = str.split(".");
  const micro =
    BigInt(whole) * BigInt(MICRO_PER_USDT) +
    BigInt((frac + "000000").slice(0, 6));
  const value = Number(micro);
  if (!Number.isSafeInteger(value)) throw new Error("AMOUNT_OUT_OF_RANGE");
  return value;
}

/** 칩 프리셋 (USDT 표시 단위) */
export const CHIP_PRESETS = [1, 5, 10, 50, 100, 500].map((usdt) => ({
  usdt,
  micro: usdt * MICRO_PER_USDT,
  label: String(usdt),
}));

/** 큰 숫자 축약 표시: 1.2K / 3.4M (풀 진행률 등 UI 전용) */
export function formatCompactUsdt(micro) {
  const usdt = Number(micro) / MICRO_PER_USDT;
  if (usdt >= 1_000_000) return `${(usdt / 1_000_000).toFixed(1)}M`;
  if (usdt >= 1_000) return `${(usdt / 1_000).toFixed(1)}K`;
  return formatUsdt(micro);
}

/** micro 정수 여부 검증 (서버 응답 방어) */
export function isMicro(value) {
  return Number.isSafeInteger(value) && value >= 0;
}
