/**
 * 게임방 컨트롤러
 * GET /api/rooms
 * GET /api/rooms/:roomId
 * GET /api/rooms/:roomId/current-round
 */
import { ok, fail, handler } from "../utils/respond.js";
import { store, getRoom, getCurrentRound } from "../store/memoryStore.js";

export const listRooms = handler(async (req, res) => {
  // TODO(2차): Firestore rooms 컬렉션 조회 + isActive 필터로 교체
  const rooms = store.rooms.map((room) => {
    const round = getCurrentRound(room.id);
    return { ...room, status: round?.status || room.status, currentRound: round?.roundNumber ?? room.currentRound };
  });
  return ok(res, { rooms });
});

export const getRoomById = handler(async (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room) return fail(res, 404, "ROOM_NOT_FOUND", "게임방을 찾을 수 없습니다.");
  return ok(res, { room });
});

export const currentRound = handler(async (req, res) => {
  const round = getCurrentRound(req.params.roomId);
  if (!round) return fail(res, 404, "ROOM_NOT_FOUND", "게임방을 찾을 수 없습니다.");
  return ok(res, { round });
});
