/**
 * API 응답 규약 헬퍼
 * 성공: { success: true, data }
 * 실패: { success: false, error: { code, message } }
 */

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function ok(res, data = {}, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function fail(res, status, code, message) {
  return res.status(status).json({ success: false, error: { code, message } });
}

/** async 컨트롤러 래핑 — throw된 ApiError를 규약에 맞게 응답 */
export function handler(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

/** 요청 바디의 필수 필드 검증 */
export function requireFields(body, fields) {
  for (const f of fields) {
    if (body?.[f] === undefined || body?.[f] === null || body?.[f] === "") {
      throw new ApiError(400, "MISSING_FIELD", `필수 항목이 누락되었습니다: ${f}`);
    }
  }
}
