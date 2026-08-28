import { CHIP_PRESETS } from "../utils/formatMoney.js";

/**
 * 칩 선택 — 단위 USDT (1 / 5 / 10 / 50 / 100 / 500)
 * 금액은 남납에서 micro-USDT 정수로만 관리됩니다.
 */
const CHIP_STYLE = {
  1: { rim: "border-zinc-300", core: "bg-zinc-200 text-zinc-900" },
  5: { rim: "border-rose-400", core: "bg-rose-500/90 text-white" },
  10: { rim: "border-sky-400", core: "bg-sky-500/90 text-white" },
  50: { rim: "border-violet-400", core: "bg-violet-500/90 text-white" },
  100: { rim: "border-amber-300", core: "bg-zinc-900 text-amber-300 border border-amber-300/40" },
  500: { rim: "border-emerald-400", core: "bg-emerald-500/90 text-white" },
};

export default function ChipSelector({ selectedMicro, onSelect, disabled }) {
  return (
    <div className="flex items-center justify-between gap-1.5">
      {CHIP_PRESETS.map((chip) => {
        const style = CHIP_STYLE[chip.usdt];
        const active = selectedMicro === chip.micro;
        return (
          <button
            key={chip.usdt}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(chip.micro)}
            className={`relative flex h-11 w-11 items-center justify-center rounded-full border-[2.5px] border-dashed transition-all active:scale-90 ${style.rim} ${
              active ? "scale-110 shadow-[0_0_16px_rgba(227,185,78,0.45)] ring-2 ring-gold/70" : "opacity-80"
            } ${disabled ? "opacity-30" : ""}`}
            aria-label={`${chip.usdt} USDT 칩`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-extrabold ${style.core}`}>
              {chip.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
