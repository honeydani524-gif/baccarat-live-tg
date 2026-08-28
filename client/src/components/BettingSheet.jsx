import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import BettingTable from "./BettingTable.jsx";
import ChipSelector from "./ChipSelector.jsx";
import { formatUsdt } from "../utils/formatMoney.js";
import { ROOM_STATUS_META } from "../services/mockData.js";

/**
 * 베팅 Bottom Sheet
 * - 화면 전체를 덮지 않으며, 어떤 상태에서도 메인 스트림을 가리지 않습니다.
 * - 핸들을 눌러 접기/펼치기가 가능합니다.
 * - 버튼 배치(오른손 조작): [취소] 왼쪽 / [베팅하기] 오른쪽(주요 액션)
 */
export default function BettingSheet({
  roundStatus,
  bets,
  selectedChipMicro,
  onSelectChip,
  onCellTap,
  onClear,
  onReview,
  minBetMicro,
  maxBetMicro,
}) {
  const [expanded, setExpanded] = useState(true);
  const isOpen = roundStatus === "BETTING";
  const totalMicro = bets.reduce((s, b) => s + b.amountMicro, 0);
  const meta = ROOM_STATUS_META[roundStatus] || ROOM_STATUS_META.PREPARING;
  const canSubmit = isOpen && bets.length > 0;

  return (
    <section className="border-t border-line bg-surface/95">
      {/* 핸들 / 상태줄 */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-col items-center pb-1 pt-2"
        aria-label={expanded ? "베팅 시트 접기" : "베팅 시트 펼치기"}
      >
        <span className="h-1 w-10 rounded-full bg-zinc-700" />
        <span className="mt-1.5 flex w-full items-center justify-between px-4 text-[11px] font-semibold">
          <span className={isOpen ? "text-gold" : "text-zinc-500"}>
            {isOpen ? `베팅 가능 · ${meta.label}` : `${meta.label} — 베팅 불가`}
          </span>
          <span className="flex items-center gap-2 text-zinc-400">
            {totalMicro > 0 && (
              <span className="tabular text-gold-light">선택 {formatUsdt(totalMicro)} USDT</span>
            )}
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="inline-block">
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-3.5 pb-4 pt-1">
              <BettingTable bets={bets} onCellTap={onCellTap} disabled={!isOpen} />
              <ChipSelector selectedMicro={selectedChipMicro} onSelect={onSelectChip} disabled={!isOpen} />
              <p className="tabular text-center text-[10px] text-zinc-600">
                MIN {formatUsdt(minBetMicro)} / MAX {formatUsdt(maxBetMicro)} USDT
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 액션 — [취소] 왼쪽 / [베팅하기] 오른쪽 */}
      <div className="pb-safe grid grid-cols-2 gap-2 px-3.5 pb-3">
        <button
          type="button"
          onClick={onClear}
          disabled={bets.length === 0}
          className="h-12 rounded-xl border border-line bg-elevated text-sm font-bold text-zinc-300 transition-transform active:scale-95 disabled:opacity-40"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onReview}
          disabled={!canSubmit}
          className="btn-gold h-12 rounded-xl text-sm font-extrabold"
        >
          베팅하기{bets.length > 0 ? ` · ${bets.length}건` : ""}
        </button>
      </div>
    </section>
  );
}
