/**
 * 라운드 타이머 — 원형 진행 링 + 남은 초
 * 10초 이하에서는 골드 → 레드로 전환됩니다.
 */
export default function Timer({ seconds, total = 30, size = 46, stroke = 3.5 }) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, seconds / total)) : 0;
  const urgent = seconds <= 10;
  const color = urgent ? "#f43f5e" : "#e3b94e";
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          style={{ transition: "stroke-dashoffset 0.35s linear, stroke 0.3s" }}
        />
      </svg>
      <span
        className="tabular absolute text-sm font-extrabold"
        style={{ color, textShadow: `0 0 12px ${color}55` }}
      >
        {seconds}
      </span>
    </div>
  );
}
