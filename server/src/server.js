/**
 * 서버 부트스트랩
 * 1. 환경변수 검증 → 2. Firebase 초기화 → 3. HTTP + Socket.io 기동
 */
import http from "node:http";
import { Server } from "socket.io";
import { env, assertEnv } from "./config/env.js";
import { initFirebase, isFirebaseEnabled } from "./config/firebaseAdmin.js";
import { logger, setLogLevel } from "./utils/logger.js";
import { initGameSocket } from "./sockets/gameSocket.js";
import app from "./app.js";

async function main() {
  setLogLevel(env.logLevel);
  assertEnv();
  initFirebase();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: env.corsOrigin.includes("*") ? true : env.corsOrigin,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // 컨트롤러에서 브로드캐스트할 수 있도록 등록
  app.set("io", io);
  initGameSocket(io);

  server.listen(env.port, () => {
    logger.info(`[server] BaccaratLive TG API listening on :${env.port}`);
    logger.info(`[server] mode=${env.nodeEnv} firebase=${isFirebaseEnabled() ? "ON" : "OFF"} mockEngine=${env.mockGameEngine ? "ON" : "OFF"}`);
  });

  const shutdown = (signal) => {
    logger.info(`[server] ${signal} 수신 — 종료합니다.`);
    io.close();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[server] 부팅 실패:", err.message);
  process.exit(1);
});
