/**
 * 간이 Rate Limiter (인메모리 고정 윈도우)
 * 운영 환경에서는 Redis 기반 분산 레이트리미터로 교체를 권장합니다.
 */
import { fail } from "../utils/respond.js";

export function rateLimit({ windowMs = 10_000, max = 20, key = "global" } = {}) {
  const hits = new Map(); // bucketKey -> { count, resetAt }
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
  }, windowMs);
  cleanup.unref?.();

  return (req, res, next) => {
    const id = req.user?.telegramId || req.ip || "unknown";
    const bucketKey = `${key}:${id}`;
    const now = Date.now();
    let entry = hits.get(bucketKey);
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(bucketKey, entry);
    }
    entry.count += 1;
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - entry.count));
    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return fail(res, 429, "RATE_LIMITED", "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.");
    }
    return next();
  };
}
