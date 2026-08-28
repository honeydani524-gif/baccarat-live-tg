import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import BalanceDisplay from "./BalanceDisplay.jsx";

/** 상단 바 — 브랜드 + 잔액 (잔액은 표시 전용, 수정은 서버만 가능) */
export default function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="glass sticky top-0 z-40 flex h-14 items-center justify-between border-x-0 border-t-0 px-4">
      <Link to="/live" className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-live-pulse h-2.5 w-2.5 rounded-full bg-banker" />
        </span>
        <span className="font-display text-[15px] font-bold tracking-[0.18em]">
          <span className="gold-text">BACCARAT</span>
          <span className="ml-1.5 text-zinc-100">LIVE</span>
        </span>
      </Link>
      <button onClick={() => navigate("/profile")} className="transition-transform active:scale-95">
        <BalanceDisplay value={user?.balanceMicro ?? 0} />
      </button>
    </header>
  );
}
