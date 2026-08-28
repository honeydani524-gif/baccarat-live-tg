import { NavLink } from "react-router-dom";
import { Radio, Gamepad2, Coins, User, Headphones } from "lucide-react";

/**
 * 하단 네비게이션 — 순서 고정: LIVE / 미니게임 / 스테이킹 / 내정보 / 고객센터
 */
const ITEMS = [
  { to: "/live", label: "LIVE", icon: Radio },
  { to: "/minigames", label: "미니게임", icon: Gamepad2 },
  { to: "/staking", label: "스테이킹", icon: Coins },
  { to: "/profile", label: "내정보", icon: User },
  { to: "/support", label: "고객센터", icon: Headphones },
];

export default function BottomNav() {
  return (
    <nav className="glass pb-safe fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-x-0 border-b-0">
      <div className="flex h-16 items-stretch">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="flex-1">
            {({ isActive }) => (
              <div
                className={`relative flex h-full flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? "text-gold" : "text-zinc-500"
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-deep" />
                )}
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.8} />
                <span className={`text-[10px] font-semibold tracking-wide ${label === "LIVE" ? "" : ""}`}>
                  {label === "LIVE" && isActive ? (
                    <span className="flex items-center gap-1 text-banker">
                      <span className="animate-live-pulse h-1 w-1 rounded-full bg-banker" />
                      LIVE
                    </span>
                  ) : (
                    label
                  )}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
