/**
 * 게임 상태 훅
 * - Socket 연결 시 서버 이벤트(round_started / betting_timer / betting_closed / ...)로 동기화
 * - 오프라인 시 클라이언트 로컬 Mock 엔진이 동일한 페이즈로 순환합니다.
 *   페이즈: BETTING(30s) → CLOSED(5s) → RESULT_PENDING(4s) → SETTLED(3s) → 다음 라운드
 */
import { useEffect, useRef, useState } from "react";
import { getSocket } from "./useSocket.js";

export const BETTING_SECONDS = 30;

const PHASES = [
  { status: "BETTING", seconds: 30 },
  { status: "CLOSED", seconds: 5 },
  { status: "RESULT_PENDING", seconds: 4 },
  { status: "SETTLED", seconds: 3 },
];

function initialState(baseRound) {
  return {
    roundNumber: baseRound,
    status: "BETTING",
    secondsLeft: BETTING_SECONDS,
    phaseTotal: BETTING_SECONDS,
    result: null,
    connected: false,
  };
}

export function useGame(roomId, baseRound = 142) {
  const [round, setRound] = useState(() => initialState(baseRound));
  const phaseRef = useRef(0);
  const roundRef = useRef(baseRound);

  // 소켓 이벤트 동기화
  useEffect(() => {
    const socket = getSocket();
    if (!socket?.connected || !roomId) return undefined;

    setRound((r) => ({ ...r, connected: true }));

    socket.emit("join_room", roomId, (res) => {
      if (res?.success && res.round) {
        setRound((r) => ({ ...r, ...res.round, connected: true }));
      }
    });

    const onTimer = (p) =>
      setRound((r) => ({ ...r, secondsLeft: p.secondsLeft, phaseTotal: p.total, status: "BETTING" }));
    const onRoundStarted = (p) =>
      setRound((r) => ({
        ...r,
        roundNumber: p.roundNumber ?? r.roundNumber,
        status: "BETTING",
        secondsLeft: BETTING_SECONDS,
        phaseTotal: BETTING_SECONDS,
        result: null,
      }));
    const onClosed = () => setRound((r) => ({ ...r, status: "CLOSED", secondsLeft: 0 }));
    const onPending = (p) => setRound((r) => ({ ...r, status: "RESULT_PENDING", result: p?.result ?? null }));
    const onConfirmed = (p) => setRound((r) => ({ ...r, status: "RESULT_PENDING", result: p?.result ?? r.result }));
    const onSettled = () => setRound((r) => ({ ...r, status: "SETTLED" }));

    socket.on("betting_timer", onTimer);
    socket.on("round_started", onRoundStarted);
    socket.on("betting_closed", onClosed);
    socket.on("result_pending", onPending);
    socket.on("result_confirmed", onConfirmed);
    socket.on("settlement_done", onSettled);

    return () => {
      socket.emit("leave_room", roomId);
      socket.off("betting_timer", onTimer);
      socket.off("round_started", onRoundStarted);
      socket.off("betting_closed", onClosed);
      socket.off("result_pending", onPending);
      socket.off("result_confirmed", onConfirmed);
      socket.off("settlement_done", onSettled);
    };
  }, [roomId]);

  // 오프라인 로컬 Mock 엔진
  useEffect(() => {
    if (round.connected) return undefined;
    const id = setInterval(() => {
      setRound((r) => {
        if (r.secondsLeft > 1) return { ...r, secondsLeft: r.secondsLeft - 1 };
        const nextPhase = phaseRef.current + 1;
        if (nextPhase < PHASES.length) {
          phaseRef.current = nextPhase;
          const p = PHASES[nextPhase];
          return { ...r, status: p.status, secondsLeft: p.seconds, phaseTotal: p.seconds };
        }
        phaseRef.current = 0;
        roundRef.current += 1;
        return {
          ...r,
          roundNumber: roundRef.current,
          status: "BETTING",
          secondsLeft: BETTING_SECONDS,
          phaseTotal: BETTING_SECONDS,
          result: null,
        };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [round.connected]);

  return { round, isBettingOpen: round.status === "BETTING" };
}
