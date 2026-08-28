import { motion, AnimatePresence } from "framer-motion";
import { Wallet } from "lucide-react";
import { formatUsdt } from "../utils/formatMoney.js";

/**
 * 잔액 표시 — micro-USDT 정수만 받아 표시 형식으로 변환합니다.
 * 금액 변경 시 숫자가 부드럽게 전환됩니다.
 */
export default function BalanceDisplay({ value, compact = false }) {
  const text = formatUsdt(value);
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 py-1.5 pl-2.5 pr-3.5">
      <Wallet className="h-3.5 w-3.5 text-gold" />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={text}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -6, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="tabular text-[13px] font-bold text-gold-light"
        >
          {text}
        </motion.span>
      </AnimatePresence>
      {!compact && <span className="text-[10px] font-semibold tracking-wider text-gold/70">USDT</span>}
    </div>
  );
}
