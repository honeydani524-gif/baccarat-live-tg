/**
 * 실시간 스트리밍 구독 훅
 * - Firebase Realtime Database: live/rooms/{roomId} 구조를 구독합니다.
 * - 스트림 URL은 절대 코드에 하드코딩하지 않습니다.
 * - RTDB 미설정 시 Mock 스트림(썸네일 기반 플레이스홀더)으로 동작합니다.
 */
import { useEffect, useState } from "react";
import { subscribeRoomStreams, enabled } from "../services/firebase.js";
import { mockStreamsFor } from "../services/mockData.js";

export function useLiveStreams(roomId) {
  const [streams, setStreams] = useState(() => mockStreamsFor(roomId));
  const [source, setSource] = useState(enabled ? "rtdb" : "mock");

  useEffect(() => {
    if (!roomId) return undefined;
    if (!enabled) {
      setStreams(mockStreamsFor(roomId));
      setSource("mock");
      return undefined;
    }
    const unsub = subscribeRoomStreams(roomId, (val) => {
      if (val?.casinoStream || val?.tableStream) {
        setStreams({
          casinoStream: val.casinoStream ?? null,
          tableStream: val.tableStream ?? null,
        });
        setSource("rtdb");
      } else {
        setStreams(mockStreamsFor(roomId));
        setSource("mock");
      }
    });
    return unsub;
  }, [roomId]);

  return { streams, source };
}
