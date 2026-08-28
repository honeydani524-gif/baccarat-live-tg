/**
 * 인증 컨트롤러
 * - POST /api/auth/telegram : Telegram initData → 검증 → 사용자 upsert → JWT 발급
 * - GET  /api/auth/me       : 내 프로필 조회
 * ⚠️ initData는 반드시 서버에서 검증합니다. 프론트의 권한 판단은 신뢰하지 않습니다.
 */
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { validateInitData } from "../utils/telegramAuth.js";
import { ok, fail, handler } from "../utils/respond.js";
import { upsertUser, getUser } from "../store/memoryStore.js";
import { isFirebaseEnabled, getDb } from "../config/firebaseAdmin.js";
import { logger } from "../utils/logger.js";

function signToken(user) {
  return jwt.sign({ sub: user.telegramId, role: user.role }, env.jwtSecret, { expiresIn: "7d" });
}

/** Firestore upsert (설정되어 있을 때만) — 실패필드는 병합되며 잔액/role은 덮지 않습니다 */
async function upsertToFirestore(user) {
  if (!isFirebaseEnabled()) return;
  try {
    const ref = getDb().collection("users").doc(String(user.telegramId));
    await getDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists) {
        tx.update(ref, {
          username: user.username,
          displayName: user.displayName,
          lastLoginAt: Date.now(),
        });
      } else {
        tx.set(ref, user);
      }
    });
  } catch (err) {
    logger.warn("[auth] Firestore upsert 실패 — 메모리 상태로 계속 진행", { message: err.message });
  }
}

export const telegramLogin = handler(async (req, res) => {
  const { initData, dev } = req.body || {};

  // 개발 모드 진입 (production에서는 DEV_AUTH_BYPASS가 자동 비활성)
  if (dev === true) {
    if (!env.devAuthBypass) {
      return fail(res, 403, "DEV_MODE_DISABLED", "개발 모드가 비활성화되어 있습니다.");
    }
    const user = getUser("dev-user-0001") || upsertUser({ telegramId: "dev-user-0001", username: "dev_player", displayName: "DEV 플레이어", role: "SUPER_ADMIN" });
    return ok(res, { token: signToken(user), user });
  }

  if (!initData) {
    return fail(res, 400, "MISSING_INIT_DATA", "Telegram initData가 필요합니다.");
  }

  const result = validateInitData(initData, env.telegramBotToken);
  if (!result.valid) {
    logger.warn("[auth] initData 검증 실패", { reason: result.reason });
    return fail(res, 401, "INVALID_INIT_DATA", "Telegram 인증에 실패했습니다.");
  }

  const tg = result.user;
  const telegramId = String(tg.id);
  // 최초 관리자 시딩: ADMIN_TELEGRAM_IDS에 포함된 신규 사용자만 SUPER_ADMIN 부여
  const isSeedAdmin = !getUser(telegramId) && env.adminTelegramIds.includes(telegramId);

  const user = upsertUser({
    telegramId,
    username: tg.username || "",
    displayName: [tg.first_name, tg.last_name].filter(Boolean).join(" "),
    role: isSeedAdmin ? "SUPER_ADMIN" : undefined,
  });
  await upsertToFirestore(user);

  return ok(res, { token: signToken(user), user });
});

export const me = handler(async (req, res) => {
  const user = getUser(req.user.telegramId);
  if (!user) return fail(res, 404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
  return ok(res, { user });
});
