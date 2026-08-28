/**
 * Socket.io 게임 채널
 *
 * Client → Server : join_room / leave_room / place_bet / cancel_bet
 * Server → Client : room_joined / round_started / betting_timer / betting_closed /
 *                   result_pending / result_confirmed / settlement_done /
 *                   stream_updated / balance_updated / error
 *
 * - 연결 시 JWT를 검증합니다 (Telegram 권한과 동일 경로).
 * - MOCK_GAME_ENGINE 활성화 시 방별 라운드 사이클을 자동 방송합니다.
 */
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { getCurrentRound, getRoom, updateRound } from "../store/memoryStore.js";
import { computeSettlement } from "../utils/settlementEngine.js";

const PHASES = [
  { event: "round_started", status: "BETTING", seconds: 30 },
  { event: "betting_closed", status: "CLOSED", seconds: 5 },
  { event: "result_pending", status: "RESULT_PENDING", seconds: 4 },
  { event: "settlement_done", status: "SETTLED", seconds: 3 },
];

const engines = new Map(); // roomId -> { interval, phaseIndex, secondsLeft, memberCount }

function startMockEngine(io, roomId) {
  if (engines.has(roomId) || !env.mockGameEngine) return;

  logger.debug("[socket] 목업 엔진 시작", { roomId });
  let phaseIndex = 0;
  let secondsLeft = PHASES[0].seconds;
  const round = getCurrentRound(roomId);
  updateRound(roomId, { status: "BETTING" });

  const interval = setInterval(() => {
    const channel = `room:${roomId}`;
    const phase = PHASES[phaseIndex];

    if (phase.status === "BETTING") {
      io.to(channel).emit("betting_timer", { roundNumber: round.roundNumber, secondsLeft, total: phase.seconds });
    }

    secondsLeft -= 1;
    if (secondsLeft > 0) return;

    // 다음 페이즈로 전이
    phaseIndex += 1;
    if (phaseIndex >= PHASES.length) {
      // 라운드 종료 → 다음 라운드
      phaseIndex = 0;
      const next = PHASES[0];
      secondsLeft = next.seconds;
      round.roundNumber += 1;
      updateRound(roomId, { roundNumber: round.roundNumber, status: "BETTING", result: null, bettingStartedAt: Date.now() });
      io.to(channel).emit("round_started", { roundNumber: round.roundNumber });
      return;
    }

    const nextPhase = PHASES[phaseIndex];
    secondsLeft = nextPhase.seconds;
    updateRound(roomId, { status: nextPhase.status });

    let payload = { roundNumber: round.roundNumber };
    if (nextPhase.status === "RESULT_PENDING") {
      // 목업 결과 플래그 (카드 로직 없음 — 랜덤 시연용)
      const result = {
        dragon7: false,
        panda8: false,
        playerPair: Math.random() < 0.08,
        tie: Math.random() < 0.09,
        bankerPair: Math.random() < 0.08,
        player: Math.random() < 0.48,
        banker: false,
      };
      result.banker = !result.tie && !result.player;
      round.result = result;
      payload.result = result;
      io.to(channel).emit("result_pending", payload);
      io.to(channel).emit("result_confirmed", payload);
      return;
    }
    if (nextPhase.status === "SETTLED") {
      payload.summary = round.result ? computeSettlement([{ type: round.result.player ? "PLAYER" : "BANKER", amountMicro: 1_000_000 }], round.result) : null;
    }
    io.to(channel).emit(nextPhase.event, payload);
  }, 1000);

  engines.set(roomId, { interval, memberCount: 0 });
}

function stopMockEngine(roomId) {
  const engine = engines.get(roomId);
  if (!engine) return;
  if (engine.memberCount > 0) return;
  clearInterval(engine.interval);
  engines.delete(roomId);
  logger.debug("[socket] 목업 엔진 정지", { roomId });
}

export function initGameSocket(io) {
  // 연결 인증 — auth.token 기반 JWT 검증
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("UNAUTHORIZED"));

    if (env.devAuthBypass && token === "dev-token") {
      socket.user = { telegramId: "dev-user-0001", role: "SUPER_ADMIN" };
      return next();
    }
    try {
      const payload = jwt.verify(token, env.jwtSecret);
      socket.user = { telegramId: String(payload.sub), role: payload.role || "USER" };
      return next();
    } catch {
      return next(new Error("INVALID_TOKEN"));
    }
  });

  io.on("connection", (socket) => {
    logger.debug("[socket] 연결", { user: socket.user.telegramId });

    socket.on("join_room", (roomId, ack) => {
      const room = getRoom(roomId);
      if (!room || !room.isActive) {
        socket.emit("error", { code: "ROOM_NOT_FOUND", message: "게임방을 찾을 수 없습니다." });
        ack?.({ success: false });
        return;
      }
      socket.join(`room:${roomId}`);
      startMockEngine(io, roomId);
      const engine = engines.get(roomId);
      if (engine) engine.memberCount += 1;

      const round = getCurrentRound(roomId);
      socket.emit("room_joined", { roomId, round });
      socket.emit("stream_updated", { roomId }); // 스트림 상태는 RTDB 구독이 소스 (안내용 트리거)
      ack?.({ success: true, round });
    });

    socket.on("leave_room", (roomId) => {
      socket.leave(`room:${roomId}`);
      const engine = engines.get(roomId);
      if (engine) {
        engine.memberCount = Math.max(0, engine.memberCount - 1);
        stopMockEngine(roomId);
      }
    });

    // 베팅은 레이트리밋/멱등성이 적용된 REST 경로가 권장 경로입니다.
    socket.on("place_bet", (payload, ack) => {
      ack?.({
        success: false,
        error: {
          code: "USE_REST_API",
          message: "베팅은 POST /api/rooms/:roomId/bets 로 처리됩니다. (중복 방지/트랜잭션 적용)",
        },
      });
    });

    socket.on("cancel_bet", (payload, ack) => {
      ack?.({
        success: false,
        error: { code: "USE_REST_API", message: "베팅 취소는 DELETE /api/rooms/:roomId/bets/:betId 로 처리됩니다." },
      });
    });

    socket.on("disconnect", () => {
      for (const [roomId, engine] of engines) {
        if (socket.rooms.has(`room:${roomId}`)) {
          engine.memberCount = Math.max(0, engine.memberCount - 1);
          stopMockEngine(roomId);
        }
      }
    });
  });

  logger.info("[socket] 게임 소켓 초기화 완료");
}
