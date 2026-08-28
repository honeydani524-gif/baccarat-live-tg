/**
 * 환경변수 로딩 + 검증
 * - production에서 필수값이 없으면 부팅을 중단시킵니다.
 * - development에서는 누락 시 경고 후 안전한 기본값으로 동작합니다.
 */
import dotenv from "dotenv";
import crypto from "node:crypto";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd,
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || "",
  corsOrigin: (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramBotSecret: process.env.TELEGRAM_BOT_SECRET || "",
  firebaseServiceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "",
  firebaseDatabaseUrl: process.env.FIREBASE_DATABASE_URL || "",
  adminTelegramIds: (process.env.ADMIN_TELEGRAM_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  devAuthBypass: process.env.DEV_AUTH_BYPASS === "true" && !isProd,
  mockGameEngine: process.env.MOCK_GAME_ENGINE !== "false",
  logLevel: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  minStakeMicro: Number(process.env.MIN_STAKE_AMOUNT) || 100_000_000,
  maxStakeMicro: Number(process.env.MAX_STAKE_AMOUNT) || 5_000_000_000,
};

/** 부팅 시 필수 환경변수 검증 */
export function assertEnv() {
  const missing = [];
  if (!env.jwtSecret) missing.push("JWT_SECRET");
  if (!env.telegramBotToken) missing.push("TELEGRAM_BOT_TOKEN");

  if (isProd && missing.length) {
    throw new Error(`[env] production 필수 환경변수 누락: ${missing.join(", ")}`);
  }
  if (missing.length) {
    console.warn(`[env] 개발 모드 — 누락된 값: ${missing.join(", ")} (로컬 기본값으로 동작합니다)`);
  }
  if (!env.jwtSecret) {
    // 개발 전용: 부팅마다 새 랜덤 키를 생성합니다 (재시작 시 모든 토큰 만료).
    // ⚠️ 코드에 시크릿을 하드코딩하지 않습니다. production에서는 필수 환경변수입니다.
    env.jwtSecret = crypto.randomBytes(32).toString("hex");
  }
}
