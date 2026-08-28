import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Coins, Users, ShieldCheck, Loader2, CalendarDays, X } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { POOL_STATUS_META } from "../services/mockData.js";
import { formatUsdt, formatCompactUsdt, parseUsdtToMicro } from "../utils/formatMoney.js";
import { toast } from "../components/Toast.jsx";

/**
 * 스테이킹 — 운영 풀에 USDT를 참여시키는 구조 (단순 예치 아님)
 * Pool 상태: OPEN / CLOSED / ACTIVE / FINISHED / SETTLING / SETTLED
 */
const TONE = {
  emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  gold: "border-gold/30 bg-gold/10 text-gold",
  amber: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  sky: "border-sky-400/30 bg-sky-500/10 text-sky-300",
  zinc: "border-line bg-elevated text-zinc-400",
};

export default function StakingList() {
  const [pools, setPools] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.staking.pools().then((d) => setPools(d.pools)).catch(() => {});
  }, []);

  return (
    <div className="px-4 pb-6 pt-5">
      <p className="text-[10px] font-extrabold tracking-[0.3em] text-gold">POOL STAKING</p>
      <h1 className="mt-1 font-display text-2xl font-bold tracking-wide text-zinc-50">스테이킹</h1>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        방장/운영자가 운영하는 풀에 USDT를 참여시키고 운영 수익을 분배받습니다.
      </p>

      <div className="mt-5 space-y-3.5">
        {pools.map((pool, i) => (
          <PoolCard key={pool.id} pool={pool} index={i} onOpen={() => setSelected(pool)} />
        ))}
      </div>

      <PoolDetailModal pool={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function PoolCard({ pool, index, onOpen }) {
  const meta = POOL_STATUS_META[pool.status] || POOL_STATUS_META.OPEN;
  const progress = pool.capacityMicro > 0 ? Math.min(1, pool.totalStakedMicro / pool.capacityMicro) : 0;
  const joinable = pool.status === "OPEN";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.07 * index }}
      className="rounded-2xl border border-line bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-extrabold text-zinc-50">{pool.name}</h3>
            <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold ${TONE[meta.tone]}`}>
              {meta.label}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-zinc-500">{pool.hostName}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
          <Coins className="h-4 w-4 text-gold" />
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">{pool.description}</p>

      <div className="tabular mt-3 flex items-center justify-between text-[10px] font-semibold text-zinc-500">
        <span>
          참여 <span className="text-gold-light">{formatCompactUsdt(pool.totalStakedMicro)}</span> / {formatCompactUsdt(pool.capacityMicro)} USDT
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" /> {pool.participants}명
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-elevated">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-deep"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>

      <div className="mt-3.5 flex items-center justify-between">
        <p className="tabular text-[11px] text-zinc-500">
          MIN <span className="font-bold text-zinc-200">{formatUsdt(pool.minAmountMicro)}</span> ~ MAX{" "}
          <span className="font-bold text-zinc-200">{formatUsdt(pool.maxAmountMicro)}</span>
        </p>
        <button
          type="button"
          onClick={onOpen}
          className={`rounded-lg px-3.5 py-2 text-xs font-extrabold transition-transform active:scale-95 ${
            joinable ? "btn-gold" : "border border-line bg-elevated text-zinc-300"
          }`}
        >
          {joinable ? "참여하기" : "상세보기"}
        </button>
      </div>
    </motion.div>
  );
}

function PoolDetailModal({ pool, onClose }) {
  const { user, setBalanceMicro } = useAuth();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAmount("");
    setSubmitting(false);
  }, [pool?.id]);

  const microPreview = useMemo(() => {
    try {
      return amount ? parseUsdtToMicro(amount) : 0;
    } catch {
      return -1;
    }
  }, [amount]);

  if (!pool) return <AnimatePresence />;
  const meta = POOL_STATUS_META[pool.status] || POOL_STATUS_META.OPEN;
  const joinable = pool.status === "OPEN";
  const valid =
    microPreview > 0 && microPreview >= pool.minAmountMicro && microPreview <= pool.maxAmountMicro &&
    microPreview <= (user?.balanceMicro ?? 0);

  const join = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await api.staking.join(pool.id, { amountMicro: microPreview });
      setBalanceMicro((user?.balanceMicro ?? 0) - microPreview);
      toast.success(`${pool.name} 참여가 접수되었습니다.`);
      onClose();
    } catch (e) {
      toast.error(e?.message || "참여에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end justify-center">
        <motion.div className="absolute inset-0 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="glass pb-safe relative max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border-b-0 p-5 scrollbar-hide"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold ${TONE[meta.tone]}`}>{meta.label}</span>
              <h3 className="mt-2 text-lg font-extrabold text-zinc-50">{pool.name}</h3>
              <p className="text-[11px] text-zinc-500">{pool.hostName}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg border border-line bg-elevated p-2 text-zinc-400">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-zinc-400">{pool.description}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-xl border border-line bg-card p-3">
              <p className="flex items-center gap-1 font-bold text-zinc-500"><CalendarDays className="h-3 w-3" /> 수익 목표</p>
              <p className="mt-1 font-extrabold text-gold-light">{pool.weeklyReturnRate}</p>
            </div>
            <div className="rounded-xl border border-line bg-card p-3">
              <p className="flex items-center gap-1 font-bold text-zinc-500"><ShieldCheck className="h-3 w-3" /> 조기 출금</p>
              <p className="mt-1 font-extrabold text-zinc-200">{pool.earlyExitAllowed ? "가능 (수수료 적용)" : "불가"}</p>
            </div>
          </div>

          {joinable && (
            <div className="mt-4">
              <p className="text-xs font-bold text-zinc-300">참여 금액 (USDT)</p>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                placeholder={`${formatUsdt(pool.minAmountMicro)} ~ ${formatUsdt(pool.maxAmountMicro)}`}
                className="tabular mt-2 h-12 w-full rounded-xl border border-line bg-card px-4 text-sm font-bold text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-gold/50"
              />
              {microPreview < 0 && <p className="mt-1 text-[10px] text-banker">금액 형식이 올바르지 않습니다. (소수점 6자리까지)</p>}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={onClose} className="h-12 rounded-xl border border-line bg-elevated text-sm font-bold text-zinc-300 active:scale-95">
                  닫기
                </button>
                <button type="button" onClick={join} disabled={!valid || submitting} className="btn-gold flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-extrabold">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />} 참여하기
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
