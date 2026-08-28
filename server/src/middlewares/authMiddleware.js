/**
 * 인증 미들웨어
 * - Bearer JWT를 검증하고 req.user = { telegramId, role } 을 주입합니다.
 * - 개발 모드(DEV_AUTH_BYPASS)에서만 "dev-token"을 허용합니다. (production 무효)
 * - role은 매 요청 최신 상태로 조회합니다(권한 하향 즉시 반영).
 */
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { fail } from "../utils/respond.js";
import { getUser } from "../store/memoryStore.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return fail(res, 401, "UNAUTHORIZED", "인증 토큰이 필요합니다.");
  }

  // 개발 모드 전용 바이패스
  if (env.devAuthBypass && token === "dev-token") {
    req.user = { telegramId: "dev-user-0001", role: getUser("dev-user-0001")?.role || "SUPER_ADMIN" };
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const fresh = getUser(payload.sub);
    req.user = {
      telegramId: String(payload.sub),
      role: fresh?.role || payload.role || "USER",
    };
    return next();
  } catch {
    return fail(res, 401, "INVALID_TOKEN", "세션이 만료되었거나 유효하지 않습니다.");
  }
}
