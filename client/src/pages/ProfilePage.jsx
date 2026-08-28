import { motion } from "framer-motion";
import {
  History, Coins, Bell, ChevronRight, Shield, Gauge, Crown, ArrowDownToLine, ArrowUpFromLine, BadgeCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import BalanceDisplay from "../components/BalanceDisplay.jsx";
import { toast } from "../components/Toast.jsx";

/**
 * 내정보 — 잔액 표시/충전/출금 진입 + 역할별 관리 메뉴
 * 권한 표시는 UI 용도이며 최종 판단은 서버에서 수행됩니다.
 */
const ROLE_META = {
  USER: { label: "일반 회원", cls: "border-line bg-elevated text-zinc-400" },
  DEALER: { label: "딜러", cls: "border-sky-400/30 bg-sky-500/10 text-sky-300" },
  HOST: { label: "호스트", cls: "border-violet-400/30 bg-violet-500/10 text-violet-300" },
  ADMIN: { label: "관리자", cls: "border-amber-400/30 bg-amber-500/10 text-amber-300" },
  SUPER_ADMIN: { label: "최고 관리자", cls: "border-gold/40 bg-gold/10 text-gold" },
};

export default function ProfilePage() {
  const { user, isDev, isOffline } = useAuth();
  const navigate = useNavigate();
  const role = ROLE_META[user?.role] || ROLE_META.USER;
  const initial = (user?.displayName || "U").slice(0, 1).toUpperCase();

  const soon = (name) => () => toast.show(`${name} 기능은 현재 개발 중입니다.`);

  return (
    <div className="space-y-4 px-4 pb-6 pt-5">
      {/* 프로필 카드 */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3.5 rounded-2xl border border-line bg-card p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-light via-gold to-gold-deep text-xl font-extrabold text-[#1a1405]">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-extrabold text-zinc-50">{user?.displayName}</h2>
            <span className={`flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold ${role.cls}`}>
              {user?.role === "SUPER_ADMIN" ? <Crown className="h-2.5 w-2.5" /> : <BadgeCheck className="h-2.5 w-2.5" />}
              {role.label}
            </span>
          </div>
          <p className="tabular mt-0.5 truncate text-[11px] text-zinc-500">
            @{user?.username || "unknown"} · ID {String(user?.telegramId).slice(0, 12)}
          </p>
          {(isDev || isOffline) && (
            <p className="mt-1 text-[10px] font-bold text-amber-400/90">
              {isOffline ? "오프라인 개발 모드" : "개발 모드 세션"}
            </p>
          )}
        </div>
      </motion.div>

      {/* 잔액 카드 */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-gold/20 bg-gradient-to-br from-card to-elevated p-4">
        <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500">보유 자산</p>
        <div className="mt-2">
          <BalanceDisplay value={user?.balanceMicro ?? 0} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={soon("충전")} className="btn-gold flex h-11 items-center justify-center gap-1.5 rounded-xl text-[13px] font-extrabold">
            <ArrowDownToLine className="h-4 w-4" /> 충전
          </button>
          <button type="button" onClick={soon("출금")} className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-line bg-elevated text-[13px] font-bold text-zinc-200 active:scale-95">
            <ArrowUpFromLine className="h-4 w-4" /> 출금
          </button>
        </div>
        <p className="mt-2.5 text-center text-[10px] text-zinc-600">* 입출금 주소·네트워크는 서버 환경변수에서 관리됩니다.</p>
      </motion.div>

      {/* 메뉴 */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="overflow-hidden rounded-2xl border border-line bg-card">
        <MenuRow icon={History} label="베팅 기록" onClick={soon("베팅 기록")} />
        <MenuRow icon={Coins} label="스테이킹 내역" onClick={() => navigate("/staking")} />
        <MenuRow icon={Bell} label="공지사항" onClick={soon("공지사항")} last />
      </motion.div>

      {/* 역할별 관리 메뉴 */}
      {user?.role && user.role !== "USER" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="overflow-hidden rounded-2xl border border-gold/20 bg-card">
          <MenuRow icon={Shield} label="딜러 관리" tone="text-sky-300" onClick={() => navigate("/dealer")} />
          <MenuRow icon={Gauge} label="호스트 대시보드" tone="text-violet-300" onClick={() => navigate("/host")} />
          <MenuRow icon={Crown} label="관리자 대시보드" tone="text-gold" onClick={() => navigate("/admin")} last />
        </motion.div>
      )}

      <p className="pt-2 text-center text-[10px] text-zinc-700">BaccaratLive TG v0.1.0 · skeleton build</p>
    </div>
  );
}

function MenuRow({ icon: Icon, label, onClick, last, tone = "text-zinc-400" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-elevated ${last ? "" : "border-b border-line"}`}
    >
      <Icon className={`h-4.5 w-4.5 h-[18px] w-[18px] ${tone}`} />
      <span className="flex-1 text-[13px] font-semibold text-zinc-200">{label}</span>
      <ChevronRight className="h-4 w-4 text-zinc-600" />
    </button>
  );
}
