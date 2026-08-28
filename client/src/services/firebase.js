/**
 * Firebase Client 초기화
 * - 스트리밍 설정만 Realtime Database에서 구독합니다.
 * - 잔액/베팅 등 민감 데이터는 절대 클라이언트에서 수정하지 않습니다.
 * - 환경변수가 없으면 null을 반환하고, 훅이 Mock으로 폴백합니다.
 */
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const enabled = Boolean(config.apiKey && config.databaseURL);

let app = null;
let rtdb = null;

if (enabled) {
  try {
    app = initializeApp(config);
    rtdb = getDatabase(app);
  } catch (e) {
    console.warn("[firebase] 초기화 실패 — Mock 스트림으로 동작합니다.", e);
  }
}

export { app, rtdb, enabled };

/**
 * live/rooms/{roomId} 하위의 casinoStream / tableStream 구독
 * @returns unsubscribe 함수
 */
export function subscribeRoomStreams(roomId, callback) {
  if (!rtdb) return () => {};
  const roomRef = ref(rtdb, `live/rooms/${roomId}`);
  const unsub = onValue(
    roomRef,
    (snap) => {
      callback(snap.val() || null);
    },
    (err) => {
      console.warn("[firebase] 스트림 구독 오류", err);
      callback(null);
    }
  );
  return unsub;
}
