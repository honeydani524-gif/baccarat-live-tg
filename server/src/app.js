/**
 * Express 앱 구성
 * - CORS / JSON 파싱 / 전역 레이트리밋 / 규약화된 에러 응답
 */
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import apiRouter from "./routes/api.js";
import { ok, fail } from "./utils/respond.js";
import { rateLimit } from "./middlewares/rateLimiter.js";
import { logger } from "./utils/logger.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin: env.corsOrigin.includes("*") ? true : env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// 전역 완만한 레이트리밋
app.use("/api", rateLimit({ windowMs: 10_000, max: 200, key: "api" }));

// 헬스 체크
app.get("/health", (req, res) => ok(res, { status: "ok", uptime: process.uptime(), time: Date.now() }));

// API
app.use("/api", apiRouter);

// 404
app.use((req, res) => fail(res, 404, "NOT_FOUND", "요청한 리소스를 찾을 수 없습니다."));

// 에러 핸들러 — 규약 유지 + 민사정보 로그 금지
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";
  if (status >= 500) logger.error("[http] 서버 오류", { code, message: err.message });
  return fail(res, status, code, status >= 500 ? "서버 오류가 발생했습니다." : err.message);
});

export default app;
