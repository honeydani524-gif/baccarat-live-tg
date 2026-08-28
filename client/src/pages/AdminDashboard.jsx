import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CircleDollarSign, ArrowDownToLine, ArrowUpFromLine, Loader2, Save } from "lucide-react";
import RoleGate from "../components/RoleGate.jsx";
import { api } from "../services/api.js";
import { formatUsdt, parseUsdtToMicro } from "../utils/formatMoney.js";
import { toast } from "../components/Toast.jsx";

/**
 * 관리자 대시보드 — 플랫폼 설정 (Skeleton)
 * 설정 변경은 PUT /api/admin/settings (requireRole ADMIN)과 연결됩니다.
 */
export default function AdminDashboard() {
  return (
    <RoleGate allow={["ADMIN"]} label="관리자">
      <AdminDashboardInner />
    </RoleGate>
  );
}

function AdminDashboardInner() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ minBet: "", maxBet: "", commissionBps: "", maintenance: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.admin
      .settings()
      .then((d) => {
        const s = d.settings;
        setSettings(s);
        setForm({
          minBet: formatUsdt(s.minBetMicro).replace(/,/g, ""),
          maxBet: formatUsdt(s.maxBetMicro).replace(/,/g, ""),
          commissionBps: String(s.commissionBps ?? 500),
          maintenance: Boolean(s.maintenanceMode),
        });
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await api.admin.updateSettings({
        minBetMicro: parseUsdtToMicro(form.minBet),
        maxBetMicro: parseUsdtToMicro(form.maxBet),
        commissionBps: Number(form.commissionBps) || 0,
        maintenanceMode: form.maintenance,
      });
      toast.success("설정이 저장되었습니다.");
    } catch (e) {
      toast.error(e?.message || "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 px-4 pb-6 pt-5">
      <div>
        <p className="text-[10px] font-extrabold tracking-[0.3em] text-gold">ADMIN CONSOLE</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-wide text-zinc-50">관리자 대시보드</h1>
      </div>

      {/* 지표 타일 (Skeleton/목업) */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={Users} label="전체 유저" value="1,284" />
        <StatCard icon={CircleDollarSign} label="오늘 총 베팅" value="82.4K USDT" />
        <StatCard icon={ArrowDownToLine} label="입금 대기" value="3건" tone="text-tie" />
        <StatCard icon={ArrowUpFromLine} label="출금 대기" value="1건" tone="text-banker" />
      </div>

      {/* 플랫폼 설정 */}
      <div className="rounded-2xl border border-line bg-card p-4">
        <p className="text-xs font-extrabold text-zinc-300">플랫폼 설정</p>
        <div className="mt-3 space-y-3">
          <Field label="최소 베팅 (USDT)">
            <input value={form.minBet} onChange={(e) => setForm((f) => ({ ...f, minBet: e.target.value.replace(/[^\d.]/g, "") }))} inputMode="decimal" className="field-input" placeholder="1" />
          </Field>
          <Field label="최대 베팅 (USDT)">
            <input value={form.maxBet} onChange={(e) => setForm((f) => ({ ...f, maxBet: e.target.value.replace(/[^\d.]/g, "") }))} inputMode="decimal" className="field-input" placeholder="500" />
          </Field>
          <Field label="수수료 (bps, 500 = 5%)">
            <input value={form.commissionBps} onChange={(e) => setForm((f) => ({ ...f, commissionBps: e.target.value.replace(/\D/g, "") }))} inputMode="numeric" className="field-input" placeholder="500" />
          </Field>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, maintenance: !f.maintenance }))}
            className="flex w-full items-center justify-between rounded-xl border border-line bg-elevated px-3.5 py-3"
          >
            <span className="text-xs font-bold text-zinc-200">점검 모드</span>
            <span className={`relative h-6 w-11 rounded-full transition-colors ${form.maintenance ? "bg-banker/70" : "bg-zinc-700"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${form.maintenance ? "left-[22px]" : "left-0.5"}`} />
            </span>
          </button>
        </div>

        <button type="button" onClick={save} disabled={saving || !settings} className="btn-gold mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-extrabold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          설정 저장
        </button>
      </div>

      <p className="text-center text-[10px] leading-relaxed text-zinc-600">
        관리자 API는 requireRole(&quot;ADMIN&quot;)로 보호되며, 모든 설정 변경은 감사 로그에 기록됩니다.
      </p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = "text-gold" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-line bg-card p-3.5">
      <Icon className={`h-4 w-4 ${tone}`} />
      <p className="tabular mt-2 text-lg font-extrabold text-zinc-50">{value}</p>
      <p className="text-[10px] font-semibold text-zinc-500">{label}</p>
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
