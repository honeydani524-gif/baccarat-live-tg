/**
 * Role 기반 권한 미들웨어
 * 사용: requireRole("ADMIN") / requireRole("DEALER", "ADMIN")
 * SUPER_ADMIN은 모든 권한을 포함합니다.
 * ⚠️ 권한 판단은 반드시 서버에서 수행 — 프론트는 UI 표시용입니다.
 */
import { fail } from "../utils/respond.js";

export const ROLES = ["USER", "DEALER", "HOST", "ADMIN", "SUPER_ADMIN"];

const RANK = { USER: 1, DEALER: 2, HOST: 3, ADMIN: 4, SUPER_ADMIN: 5 };

export function requireRole(...allowed) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !ROLES.includes(role)) {
      return fail(res, 401, "UNAUTHORIZED", "인증 정보가 없습니다.");
    }
    if (role === "SUPER_ADMIN") return next();
    const ok = allowed.some((r) => (RANK[role] || 0) >= (RANK[r] || 99) || role === r);
    if (!ok) {
      return fail(res, 403, "FORBIDDEN", "이 작업을 수행할 권한이 없습니다.");
    }
    return next();
  };
}
