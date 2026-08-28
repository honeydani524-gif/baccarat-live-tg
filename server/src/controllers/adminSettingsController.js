/**
 * 관리자 설정 컨트롤러 (requireRole ADMIN으로 라우트 보호)
 * GET /api/admin/settings
 * PUT /api/admin/settings
 */
import { ok, fail, handler } from "../utils/respond.js";
import { assertMicro } from "../utils/moneyUtil.js";
import { store } from "../store/memoryStore.js";
import { logger } from "../utils/logger.js";

const EDITABLE = ["minBetMicro", "maxBetMicro", "commissionBps", "maintenanceMode", "minStakeMicro", "maxStakeMicro"];

export const getSettings = handler(async (req, res) => {
  // TODO(2차): Firestore adminSettings/global 문서로 교체
  return ok(res, { settings: store.settings });
});

export const updateSettings = handler(async (req, res) => {
  const patch = {};
  for (const key of EDITABLE) {
    if (req.body?.[key] === undefined) continue;
    if (key === "maintenanceMode") {
      patch[key] = Boolean(req.body[key]);
    } else if (key === "commissionBps") {
      const v = Number(req.body[key]);
      if (!Number.isSafeInteger(v) || v < 0 || v > 10_000) {
        return fail(res, 400, "INVALID_VALUE", `${key}: 0~10000 사이 정수`);
      }
      patch[key] = v;
    } else {
      const v = Number(req.body[key]);
      try {
        assertMicro(v);
      } catch {
        return fail(res, 400, "INVALID_VALUE", `${key}: 유효한 micro 정수가 아닙니다.`);
      }
      patch[key] = v;
    }
  }
  if (Object.keys(patch).length === 0) {
    return fail(res, 400, "EMPTY_PATCH", "변경할 항목이 없습니다.");
  }
  Object.assign(store.settings, patch, { updatedAt: Date.now() });
  // TODO(2차): Firestore 저장 + 감사 로그(adminAudit 컬렉션) 기록
  logger.info("[admin] 설정 변경", { by: req.user.telegramId, keys: Object.keys(patch) });
  return ok(res, { settings: store.settings });
});
