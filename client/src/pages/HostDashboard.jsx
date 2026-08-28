import { motion } from "framer-motion";
import { Coins, Users, Layers, ChevronRight, CalendarDays } from "lucide-react";
import RoleGate from "../components/RoleGate.jsx";
import { MOCK_POOLS, POOL_STATUS_META } from "../services/mockData.js";
import { formatCompactUsdt } from "../utils/formatMoney.js";
import { toast } from "../components/Toast.jsx";

/**
 * 호스트 대시보드 — 내 풀 운영 현황 (Skeleton)
 * 풀 생성/마감/정산은 호스트 API(2차)로 연결됩니다.
 */
export default function HostDashboard() {
  return (
    <RoleGate allow={["HOST"]} label="호스트">
      <HostDashboardInner />
    </RoleGate>
  );
}

function HostDashboardInner() {
  const totalStaked = MOCK_POOLS.reduce((s, p) => s + p.totalStakedMicro, 0);
  const totalParticipants = MOCK_POOLS.reduce((s, p) => s + p.participants, 0);

  return (
    <div className="space-y-4 px-4 pb-6 pt-5">
      <div>
        <p className="text-[10px] font-extrabold tracking-[0.3em] text-violet-300">HOST DASHBOARD</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-wide text-zinc-50">풀 운영 현황</h1>
      </div>

      {/* 요약 타일 */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile icon={Coins} label="총 예치" value={formatCompactUsdt(totalStaked)} unit="USDT" />
        <StatTile icon={Users} label="참여자" value={String(totalParticipants)} unit="명" />
        <StatTile icon={Layers} label="운영 풀" value={String(MOCK_POOLS.length)} unit="개" />
      </div>

      {/* 풀 목록 */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-xs font-extrabold text-zinc-300">내 풀 목록</p>
          <button
            type="button"
            onClick={() => toast.show("풀 생성은 관리자 API 연동 후 제공됩니다.")}
            className="rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10px] font-extrabold text-gold active:scale-95"
          >
            + 새 풀
          </button>
        </div>
        {MOCK_POOLS.map((p, i) => {
          const meta = POOL_STATUS_META[p.status];
          return (
            <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${i === MOCK_POOLS.length - 1 ? "" : "border-b border-line"}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-zinc-100">{p.name}</p>
                <p className="tabular mt-0.5 text-[10px] text-zinc-500">
                  {formatCompactUsdt(p.totalStakedMicro)} USDT · {p.participants}명
                </p>
              </div>
              <span className="rounded-md border border-line bg-elevated px-1.5 py-0.5 text-[9px] font-extrabold text-zinc-400">
                {meta.label}
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            </div>
          );
        })}
      </div>

      {/* 정산 스케줄 */}
      <div className="rounded-2xl border border-line bg-card p-4">
        <p className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-300">
          <CalendarDays className="h-4 w-4 text-gold" /> 정산 스케줄
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
          풀 상태가 SETTLING으로 전환되면 stakingEngine이 참여자 지분을 계산하고,
          잔액 반영은 Firestore Transaction으로 원자적으로 처리됩니다. (2차 구현)
        </p>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, unit }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-line bg-card p-3">
      <Icon className="h-4 w-4 text-gold" />
      <p className="tabular mt-2 text-lg font-extrabold text-zinc-50">
        {value}
        <span className="ml-0.5 text-[10px] font-bold text-zinc-500">{unit}</span>
      </p>
      <p className="text-[10px] font-semibold text-zinc-500">{label}</p>
    </motion.div>
  );
}
