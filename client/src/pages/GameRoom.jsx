import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Swords } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../hooks/useSocket.js";
import { useGame } from "../hooks/useGame.js";
import { useLiveStreams } from "../hooks/useLiveStreams.js";
import { useTelegram } from "../hooks/useTelegram.js";
import StreamView from "../components/StreamView.jsx";
import BettingSheet from "../components/BettingSheet.jsx";
import BettingConfirmModal from "../components/BettingConfirmModal.jsx";
import Timer from "../components/Timer.jsx";
import { toast } from "../components/Toast.jsx";
import { ROOM_STATUS_META } from "../services/mockData.js";
import { formatUsdt } from "../utils/formatMoney.js";

/**
 * 게임방 — 듀얼 스트리밍 + 베팅 Bottom Sheet
 * 보호 규칙: 1번(메인) 스트림은 어떤 UI로도 가려지지 않습니다.
 * 베팅 데이터: [{ type, amountMicro }] — micro-USDT 정수만 사용.
 */
export default function GameRoom() {
  const { roomId } = useParams();
  const { setBalanceMicro } = useAuth();
  const { haptic } = useTelegram();
  useSocket(); // 연결 보장 (오프라인 시 자동 Mock 엔진)

  const [room, setRoom] = useState(null);
  const [bets, setBets] = useState([]);
  const [chipMicro, setChipMicro] = useState(10_000_000);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { streams } = useLiveStreams(roomId);
  const { round, isBettingOpen } = useGame(roomId, room?.currentRound ?? 142);

  useEffect(() => {
    let mounted = true;
    api.rooms
      .get(roomId)
      .then((d) => mounted && setRoom(d.room))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [roomId]);

  // 라운드 변경 시 미확정 베팅 초기화
  useEffect(() => {
    setBets([]);
  }, [round.roundNumber]);

  const totalMicro = useMemo(() => bets.reduce((s, b) => s + b.amountMicro, 0), [bets]);
  const maxBet = room?.maxBetMicro ?? 100_000_000;
  const statusMeta = ROOM_STATUS_META[round.status] || ROOM_STATUS_META.PREPARING;

  const addChip = (type) => {
    if (!isBettingOpen) return;
    haptic("impact");
    setBets((prev) => {
      const found = prev.find((b) => b.type === type);
      if (found) {
        const next = Math.min(found.amountMicro + chipMicro, maxBet);
        return prev.map((b) => (b.type === type ? { ...b, amountMicro: next } : b));
      }
      return [...prev, { type, amountMicro: Math.min(chipMicro, maxBet) }];
    });
  };

  const clearBets = () => {
    haptic("impact");
    setBets([]);
  };

  const submitBets = async () => {
    if (submitting || bets.length === 0) return;
    setSubmitting(true);
    try {
      const clientBetId = `cb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const data = await api.bets.place(roomId, {
        bets,
        clientBetId,
        roundNumber: round.roundNumber,
      });
      // 잔액은 서버 응답을 신뢰 — 클라이언트 계산은 표시용
      if (typeof data.balanceMicro === "number") setBalanceMicro(data.balanceMicro);
      toast.success(`베팅이 접수되었습니다 · ${formatUsdt(data?.bet?.totalMicro ?? totalMicro)} USDT`);
      setBets([]);
      setConfirmOpen(false);
    } catch (e) {
      toast.error(e?.message || "베팅에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 3.5rem - 4rem)" }}>
      {/* 1. 카지노 메인 스트리밍 — 보호 영역 (오버레이/필터 금지) */}
      <div className="shrink-0 px-3 pt-3">
        <StreamView stream={streams?.casinoStream} title="CASINO MAIN" rounded="rounded-xl" />
      </div>

      {/* 룸 상태 스트립 */}
      <div className="flex shrink-0 items-center justify-between px-3 py-2.5">
        <div className="min-w-0">
          <h1 className="truncate font-display text-base font-bold tracking-wider text-zinc-50">
            {room?.name || "TABLE"}
          </h1>
          <p className="tabular mt-0.5 text-[10px] font-semibold tracking-widest text-zinc-500">
            ROUND #{round.roundNumber} · {statusMeta.label}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {round.status === "BETTING" ? (
            <Timer seconds={round.secondsLeft} total={round.phaseTotal} size={44} />
          ) : (
            <span
              className={`rounded-lg border px-2.5 py-2 text-[11px] font-extrabold ${
                round.status === "CLOSED"
                  ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                  : "border-line bg-card text-zinc-400"
              }`}
            >
              {statusMeta.label}
            </span>
          )}
        </div>
      </div>

      {/* 중앙 영역 — 2. 테이블 보조 스트리밍 + 라운드 결과 */}
      <div className="flex min-h-0 flex-1 items-stretch gap-2 overflow-hidden px-3 pb-3">
        <div className="flex-[1.7]">
          <StreamView stream={streams?.tableStream} title="TABLE CAM" rounded="rounded-lg" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-lg border border-line bg-card">
          <Swords className="h-4 w-4 text-gold" />
          <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-500">ROUND RESULT</span>
          <span className="px-1 text-center text-[11px] font-extrabold leading-tight text-zinc-300">
            {round.result
              ? round.result.player
                ? "PLAYER WIN"
                : round.result.tie
                  ? "TIE"
                  : "BANKER WIN"
              : round.status === "BETTING"
                ? "베팅 진행중"
                : "결과 대기"}
          </span>
          {round.result?.tie && <span className="text-[9px] font-bold text-tie">TIE 동반</span>}
        </div>
      </div>

      {/* 베팅 Bottom Sheet — 메인 스트림 위에 올라가지 않음 */}
      <BettingSheet
        roundStatus={round.status}
        bets={bets}
        selectedChipMicro={chipMicro}
        onSelectChip={setChipMicro}
        onCellTap={addChip}
        onClear={clearBets}
        onReview={() => setConfirmOpen(true)}
        minBetMicro={room?.minBetMicro ?? 1_000_000}
        maxBetMicro={maxBet}
      />

      <BettingConfirmModal
        open={confirmOpen}
        bets={bets}
        totalMicro={totalMicro}
        submitting={submitting}
        onClose={() => setConfirmOpen(false)}
        onConfirm={submitBets}
      />
    </div>
  );
}
