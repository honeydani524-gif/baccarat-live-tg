/**
 * Telegram initData 서버 검증
 * 공식 규격: secret = HMAC_SHA256("WebAppData", bot_token)
 *           hash   = HMAC_SHA256(secret, data_check_string)
 * 절대 클라이언트의 initDataUnsafe를 신뢰하지 않습니다.
 */
import crypto from "node:crypto";

export function validateInitData(initData, botToken, { maxAgeSec = 60 * 60 * 24 } = {}) {
  if (!initData || typeof initData !== "string") {
    return { valid: false, reason: "EMPTY_INIT_DATA" };
  }
  if (!botToken) {
    return { valid: false, reason: "BOT_TOKEN_NOT_CONFIGURED" };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { valid: false, reason: "MISSING_HASH" };
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");

  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(hash, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false, reason: "HASH_MISMATCH" };
  }

  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Math.floor(Date.now() / 1000) - authDate > maxAgeSec) {
    return { valid: false, reason: "INIT_DATA_EXPIRED" };
  }

  let user = null;
  try {
    user = JSON.parse(params.get("user") || "null");
  } catch {
    return { valid: false, reason: "INVALID_USER_PAYLOAD" };
  }
  if (!user?.id) return { valid: false, reason: "INVALID_USER_PAYLOAD" };

  return { valid: true, user };
}
