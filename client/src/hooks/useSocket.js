/**
 * Socket.io 클라이언트 훅
 * - JWT를 auth payload로 전달해 서버에서 검증합니다.
 * - 서버 미연결 시 connected=false로 유지되며, UI는 로컬 Mock 엔진으로 폐기합니다.
 */
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getAuthToken, getBaseUrl } from "../services/api.js";

let socket = null;

export function getSocket() {
  return socket;
}

export function useSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return undefined;

    if (!socket) {
      socket = io(getBaseUrl(), {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        timeout: 4000,
      });
    }

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onError = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
    };
  }, []);

  return { socket, connected };
}
