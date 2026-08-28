/**
 * 스트리밍 컨트롤러
 * - 스트림 URL은 코드에 하드코딩하지 않습니다. 소스: Firebase RTDB(live/rooms/{roomId})
 * - 조회: GET /api/rooms/:roomId/streams
 * - 갱신: PUT /api/rooms/:roomId/streams (딜러 이상) → RTDB 반영 + stream_updated 브로드캐스트
 */
import { ok, handler } from "../utils/respond.js";
import { getRtdb, isFirebaseEnabled } from "../config/firebaseAdmin.js";
import { getRoom } from "../store/memoryStore.js";
import { logger } from "../utils/logger.js";

async function readStreams(roomId) {
  if (isFirebaseEnabled() && getRtdb()) {
    const snap = await getRtdb().ref(`live/rooms/${roomId}`).get();
    const val = snap.val();
    if (val) return val;
  }
  // 비설정 환경 — 빈 스트림 구조 반환 (URL 없음)
  return {
    casinoStream: { url: null, type: "iframe", isLive: false, thumbnail: null, updatedAt: null },
    tableStream: { url: null, type: "iframe", isLive: false, thumbnail: null, updatedAt: null },
  };
}

export const getRoomStreams = handler(async (req, res) => {
  const streams = await readStreams(req.params.roomId);
  return ok(res, { streams });
});

export const updateRoomStreams = handler(async (req, res) => {
  const { roomId } = req.params;
  const room = getRoom(roomId);
  if (!room) {
    // RTDB 전용 모드에서는 방 문서가 없을 수 있으나, 스켈레톤에서는 404 처리
    return ok(res, { streams: null, note: "ROOM_NOT_FOUND" }, 200);
  }

  const { casinoStream, tableStream } = req.body || {};
  const payload = {};
  const stamp = Date.now();
  if (casinoStream) payload.casinoStream = { ...casinoStream, updatedAt: stamp };
  if (tableStream) payload.tableStream = { ...tableStream, updatedAt: stamp };

  if (isFirebaseEnabled() && getRtdb()) {
    await getRtdb().ref(`live/rooms/${roomId}`).update(payload);
  } else {
    logger.warn("[stream] RTDB 미설정 — 메모리로만 브로드캐스트합니다.");
  }
  req.app.get("io")?.to(`room:${roomId}`).emit("stream_updated", { roomId, ...payload });
  return ok(res, { streams: { ...(await readStreams(roomId)) } });
});
