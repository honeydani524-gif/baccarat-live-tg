import { Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * RoleGate — UI 표시용 가드입니다.
 * ⚠️ 실제 권한 판단은 반드시 Backend(requireRole 미들웨어)에서 수행됩니다.
 */
const ROLE_RANK = { USER: 1, DEALER: 2, HOST: 3, ADMIN: 4, SUPER_ADMIN: 5 };

export default function RoleGate({ allow = [], children, label = "관리자" }) {
  const { user } = useAuth();
  const rank = ROLE_RANK[user?.role] || 0;
  const ok = allow.some((r) => rank >= (ROLE_RANK[r] || 99));

  if (ok) return children;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-card">
        <Lock className="h-7 w-7 text-zinc-500" />
      </div>
      <div>
        <h2 className="text-lg font-extrabold text-zinc-100">접근 권한이 없습니다</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
          이 페이지는 <span className="font-bold text-gold">{label}</span> 권한이 필요합니다.
          <br />
          현재 계정 권한: <span className="font-bold text-zinc-300">{user?.role || "UNKNOWN"}</span>
        </p>
        <p className="mt-3 text-[10px] text-zinc-600">* 권한의 최종 판단은 서버에서 수행됩니다.</p>
      </div>
    </div>
  );
}
