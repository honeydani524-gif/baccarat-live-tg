import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { BET_TYPES } from "./BettingTable.jsx";
import { formatUsdt } from "../utils/formatMoney.js";

/**
 * 최종 베팅 확인 모달
 * 흐름: 베팅하기 → [내용 확인] → 최종 베팅 → Backend API
 * 버튼 배치(오른손 조작): [수정] 왼쪽 / [최종 베팅] 오른쪽(주요 액션)
 */
export default function BettingConfirmModal({ open, bets, totalMicro, submitting, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="glass pb-safe relative w-full max-w-md rounded-t-3xl border-b-0 p-5"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700" />
            <h3 className="text-center text-base font-extrabold text-zinc-100">베팅 내용 확인</h3>
            <p className="mt-1 text-center text-[11px] text-zinc-500">
              최종 베팅 후에는 취소할 수 없습니다.
            </p>

            <div className="mt-4 max-h-56 space-y-2 overflow-y-auto scrollbar-hide">
              {bets.map((b) => {
                const meta = BET_TYPES[b.type];
                return (
                  <div key={b.type} className="flex items-center justify-between rounded-xl border border-line bg-card px-3.5 py-2.5">
                    <span className={`text-sm font-extrabold ${meta.cls}`}>{meta.label}</span>
                    <span className="tabular text-sm font-bold text-zinc-100">{formatUsdt(b.amountMicro)} <span className="text-[10px] text-zinc-500">USDT</span></span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gold">
                <ShieldCheck className="h-4 w-4" /> 총 베팅 금액
              </span>
              <span className="tabular text-lg font-extrabold text-gold-light">{formatUsdt(totalMicro)} USDT</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="h-12 rounded-xl border border-line bg-elevated text-sm font-bold text-zinc-300 transition-transform active:scale-95"
              >
                수정
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={submitting || bets.length === 0}
                className="btn-gold flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-extrabold"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                최종 베팅
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
