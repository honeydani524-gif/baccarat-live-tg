import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gavel, CheckCircle2, RotateCcw, Info } from "lucide-react";
import RoleGate from "../components/RoleGate.jsx";
import Timer from "../components/Timer.jsx";
import { useGame } from "../hooks/useGame.js";
import { MOCK_ROOMS } from "../services/mockData.js";
import { toast } from "../components/Toast.jsx";

/**
 * 딜러 관리 — 현재 라운드 운영 컨트롤 (Skeleton)
 * 실제 라운드 제어는 딜러 권한 API(2차)로 이관됩니다.
 * * 카드 입력/자동 판정 UI는 프로젝트에서 완전히 제외됩니다.
 */
export default function DealerAdmin() {
  return (
    <RoleGate allow={["DEALER"]} label="딜러">
      <DealerAdminInner />
    </RoleGate>
  );
}

function DealerAdminInner() {
  const [roomIdx, setRoomIdx] = useState(0);
  const room = MOCK_ROOMS[roomIdx];
  const { round, isBettingOpen } = useGame(room.id, room.currentRound);

  const recent = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        round: room.currentRound - 1 - i,
        winner: ["BANKER", "PLAYER", "TIE"][Math.floor(Math.random() * 3)],
        status: "SETTLED",
      })),
    [room.currentRound]
  );

  const notYet = (name) => () => toast.show(`${name} — 딜러 API 연동 후 활성화됩니다.`);

  return (
    <div className="space-y-4 px-4 pb-6 pt-5">
      <div>
        <p className="text-[10px] font-extrabold tracking-[0.3em] text-sky-300">DEALER CONSOLE</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-wide text-zinc-50">딜러 관리</h1>
      </div>

      {/* 방 선택 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {MOCK_ROOMS.map((r, i) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRoomIdx(i)}
            className={`whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-extrabold transition-all active:scale-95 ${
              i === roomIdx ? "border-gold/50 bg-gold/10 text-gold" : "border-line bg-card text-zinc-400"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* 현재 라운드 */}
      <motion.div layout className="flex items-center justify-between rounded-2xl border border-line bg-card p-4">
        <div>
          <p className="tabular text-[10px] font-bold tracking-widest text-zinc-500">CURRENT ROUND</p>
          <p className="tabular mt-1 text-2xl font-extrabold text-zinc-50">#{round.roundNumber}</p>
          <p className={`mt-1 text-[11px] font-bold ${isBettingOpen ? "text-gold" : "text-zinc-500"}`}>
            {isBettingOpen ? "베팅 진행중" : "베팅 마감"}
          </p>
        </div>
        <Timer seconds={round.secondsLeft} total={round.phaseTotal} size={64} stroke={5} />
      </motion.div>

      {/* 라운드 컨트롤 (Skeleton) */}
      <div className="grid grid-cols-3 gap-2">
        <ControlBtn icon={Gavel} label="베팅 마감" onClick={notYet("베팅 수동 마감")} />
        <ControlBtn icon={CheckCircle2} label="결과 확정" onClick={notYet("결과 확정")} primary />
        <ControlBtn icon={RotateCcw} label="다음 라운드" onClick={notYet("다음 라운드 시작")} />
      </div>
      <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-zinc-600">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        컨트롤은 Backend 딜러 API + Socket 이벤트(betting_closed/result_confirmed)로 연결될 예정입니다.
      </p>

      {/* 최근 라운드 */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <p className="border-b border-line px-4 py-3 text-xs font-extrabold text-zinc-300">최근 라운드</p>
        {recent.map((r, i) => (
          <div key={r.round} className={`flex items-center justify-between px-4 py-2.5 ${i === recent.length - 1 ? "" : "border-b border-line"}`}>
            <span className="tabular text-xs font-bold text-zinc-400">#{r.round}</span>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                r.winner === "BANKER" ? "bg-banker/15 text-banker" : r.winner === "PLAYER" ? "bg-player/15 text-player" : "bg-tie/15 text-tie"
              }`}
            >
              {r.winner}
            </span>
            <span className="text-[10px] font-semibold text-zinc-600">정산 완료</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ControlBtn({ icon: Icon, label, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3.5 transition-transform active:scale-95 ${
        primary ? "border-gold/40 bg-gold/10 text-gold" : "border-line bg-card text-zinc-300"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[11px] font-bold">{label}</span>
    </button>
  );
}
