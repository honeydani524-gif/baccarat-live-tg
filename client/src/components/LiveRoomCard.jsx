import { Link } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";
import { ROOM_STATUS_META } from "../services/mockData.js";
import { formatUsdt } from "../utils/formatMoney.js";

const TONE = {
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  sky: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  zinc: "bg-zinc-500/15 text-zinc-400 border-zinc-400/20",
};

/** LIVE 로비 게임방 카드 — 이름/썸네일/LIVE/베팅 상태/남은 시간 */
export default function LiveRoomCard({ room, secondsLeft }) {
  const meta = ROOM_STATUS_META[room.status] || ROOM_STATUS_META.PREPARING;
  const isBetting = room.status === "BETTING";

  return (
    <Link
      to={`/game/${room.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-line bg-card transition-transform active:scale-[0.985]"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={room.thumbnail}
          alt={room.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/30" />

        {/* 상단 배지 */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[10px] font-extrabold tracking-widest text-white">
            <span className="animate-live-pulse h-1.5 w-1.5 rounded-full bg-banker" />
            LIVE
          </span>
          <span className={`rounded-md border px-2 py-1 text-[10px] font-bold ${TONE[meta.tone]}`}>{meta.label}</span>
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-zinc-300">
          <Users className="h-3 w-3" />
          <span className="tabular">{room.players}</span>
        </div>

        {/* 하단 정보 */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5">
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] text-gold/80">{room.studio}</p>
            <h3 className="mt-0.5 font-display text-lg font-bold tracking-wider text-white">{room.name}</h3>
            <p className="tabular mt-1 text-[11px] text-zinc-400">
              {formatUsdt(room.minBetMicro)} ~ {formatUsdt(room.maxBetMicro)} USDT
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-[9px] font-semibold tracking-widest text-zinc-500">ROUND #{room.currentRound}</p>
            {isBetting && typeof secondsLeft === "number" ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-gold/40 bg-black/60 px-2.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="tabular text-xs font-extrabold text-gold-light">{secondsLeft}s</span>
              </div>
            ) : (
              <div className="rounded-lg border border-line bg-black/60 px-2.5 py-1.5 text-[10px] font-bold text-zinc-400">
                {meta.label}
              </div>
            )}
          </div>
        </div>
      </div>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600">
        <ChevronRight className="h-5 w-5" />
      </span>
    </Link>
  );
}
