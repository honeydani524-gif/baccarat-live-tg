/**
 * Firebase Admin 초기화
 * - Firestore: 사용자/잔액/게임/베팅/스테이킹/입출금/설정
 * - Realtime Database: LIVE 스트리밍 설정 (live/rooms/{roomId})
 * - 서비스 계정이 없으면 비활성 상태로 부팅하고, 메모리 스토어로 폐기합니다.
 */
import admin from "firebase-admin";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let db = null;
let rtdb = null;
let enabled = false;

function parseServiceAccount(raw) {
  try {
    const json = JSON.parse(raw);
    // 일부 환경에서 private_key 개행이 이스케이프되어 들어오는 경우 보정
    if (json.private_key) json.private_key = json.private_key.replace(/\\n/g, "\n");
    return json;
  } catch {
    return null;
  }
}

export function initFirebase() {
  if (!env.firebaseServiceAccountKey) {
    logger.warn("[firebase] FIREBASE_SERVICE_ACCOUNT_KEY 없음 — 메모리 스토어로 동작합니다.");
    return { db, rtdb, enabled };
  }
  const serviceAccount = parseServiceAccount(env.firebaseServiceAccountKey);
  if (!serviceAccount) {
    logger.error("[firebase] 서비스 계정 JSON 파싱 실패 — 메모리 스토어로 동작합니다.");
    return { db, rtdb, enabled };
  }
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: env.firebaseDatabaseUrl || undefined,
    });
    db = admin.firestore();
    rtdb = env.firebaseDatabaseUrl ? admin.database() : null;
    enabled = true;
    logger.info("[firebase] Admin SDK 초기화 완료");
  } catch (err) {
    logger.error("[firebase] 초기화 실패", { message: err.message });
  }
  return { db, rtdb, enabled };
}

export function getDb() {
  return db;
}
export function getRtdb() {
  return rtdb;
}
export function isFirebaseEnabled() {
  return enabled;
}
export { admin };
