import { Flame, PawPrint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatUsdt } from "../utils/formatMoney.js";

/**
 * 베팅 테이블
 * 레이아웃(고정):
 *   [ 용7 ]        [ 판다8 ]
 *   [ P.P ] [ TIE ] [ B.P ]
 *   [ PLAYER ]   [ BANKER ]
 * 셀 탭 = 선택된 칩 금액을 해당 항목에 추가 (bets: [{ type, amountMicro }])
 * * 카드 입력/출목표 등은 본 프로젝트에서 완전히 제외됩니다.
 */

export const BET_TYPES = {
  DRAGON7: { label: "용7", eng: "DRAGON 7", odds: "40 : 1", icon: Flame, cls: "text-dragon", tint: "border-dragon/35 bg-dragon/10" },
  PANDA8: { label: "판다8", eng: "PANDA 8", odds: "25 : 1", icon: PawPrint, cls: "text-panda", tint: "border-panda/35 bg-panda/10" },
  PLAYER_PAIR: { label: "P.P", eng: "PLAYER PAIR", odds: "11 : 1", cls: "text-pairp", tint: "border-pairp/35 bg-pairp/10" },
  TIE: { label: "TIE", eng: "TIE", odds: "8 : 1", cls: "text-tie", tint: "border-tie/35 bg-tie/10" },
  BANKER_PAIR: { label: "B.P", eng: "BANKER PAIR", odds: "11 : 1", cls: "text-pairb", tint: "border-pairb/35 bg-pairb/10" },
  PLAYER: { label: "PLAYER", eng: "PLAYER", odds: "1 : 1", cls: "text-player", tint: "border-player/35 bg-player/10" },
  BANKER: { label: "BANKER", eng: "BANKER", odds: "0.95 : 1", cls: "text-banker", tint: "border-banker/35 bg-banker/10" },
};

export const BET_TYPE_KEYS = Object.keys(BET_TYPES);

function Cell({ typeKey, amountMicro, disabled, onTap }) {
  const t = BET_TYPES[typeKey];
  const Icon = t.icon;
  const active = amountMicro > 0;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onTap(typeKey)}
      className={`relative flex h-[68px] flex-col items-center justify-center overflow-hidden rounded-xl border transition-all active:scale-[0.96] ${
        active ? `${t.tint} shadow-[inset_0_0_18px_rgba(227,185,78,0.08)]` : "border-line bg-card"
      } ${disabled ? "opacity-45" : ""}`}
    >
      <div className="flex items-center gap-1">
        {Icon && <Icon className={`h-3.5 w-3.5 ${t.cls}`} />}
        <span className={`text-[15px] font-extrabold tracking-wide ${active ? t.cls : "text-zinc-200"}`}>{t.label}</span>
      </div>
      <span className="mt-0.5 text-[9px] font-semibold tracking-[0.15em] text-zinc-500">{t.odds}</span>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 10 }}
            className="absolute bottom-1 right-1 rounded-full border border-gold/50 bg-black/70 px-1.5 py-0.5"
          >
            <span className="tabular text-[10px] font-extrabold text-gold-light">{formatUsdt(amountMicro)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function BettingTable({ bets, onCellTap, disabled }) {
  const amountOf = (type) => bets.find((b) => b.type === type)?.amountMicro || 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <Cell typeKey="DRAGON7" amountMicro={amountOf("DRAGON7")} disabled={disabled} onTap={onCellTap} />
        <Cell typeKey="PANDA8" amountMicro={amountOf("PANDA8")} disabled={disabled} onTap={onCellTap} />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <Cell typeKey="PLAYER_PAIR" amountMicro={amountOf("PLAYER_PAIR")} disabled={disabled} onTap={onCellTap} />
        <Cell typeKey="TIE" amountMicro={amountOf("TIE")} disabled={disabled} onTap={onCellTap} />
        <Cell typeKey="BANKER_PAIR" amountMicro={amountOf("BANKER_PAIR")} disabled={disabled} onTap={onCellTap} />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Cell typeKey="PLAYER" amountMicro={amountOf("PLAYER")} disabled={disabled} onTap={onCellTap} />
        <Cell typeKey="BANKER" amountMicro={amountOf("BANKER")} disabled={disabled} onTap={onCellTap} />
      </div>
    </div>
  );
}
