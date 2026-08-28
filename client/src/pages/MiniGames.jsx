import { motion } from "framer-motion";
import { Zap, Dices, Rocket, Target, Sparkles, Crown, Lock } from "lucide-react";
import { MOCK_MINIGAMES } from "../services/mockData.js";
import { toast } from "../components/Toast.jsx";

/**
 * 미니게임 — 기본 2열 × 3행 (6개), 게임 추가 시 아래로 자동 확장
 */
const ICONS = { zap: Zap, dices: Dices, rocket: Rocket, target: Target, sparkles: Sparkles, crown: Crown };

export default function MiniGames() {
  // TODO(2차): api.minigames.list() 연동 — 현재는 Mock 데이터
  const games = MOCK_MINIGAMES;

  return (
    <div className="px-4 pb-6 pt-5">
      <p className="text-[10px] font-extrabold tracking-[0.3em] text-player">ARCADE</p>
      <h1 className="mt-1 font-display text-2xl font-bold tracking-wide text-zinc-50">미니게임</h1>
      <p className="mt-2 text-xs text-zinc-500">바칸 대기 시간에 즐기는 라이트 게임</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {games.map((g, i) => {
          const Icon = ICONS[g.icon] || Sparkles;
          return (
            <motion.button
              key={g.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i }}
              onClick={() => toast.show(`${g.name}은(는) 현재 준비 중입니다.`)}
              className={`relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-gradient-to-br p-3.5 text-left transition-transform active:scale-[0.97] ${g.gradient}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                  <Icon className="h-4.5 w-4.5 h-[18px] w-[18px] text-zinc-100" />
                </div>
                {g.comingSoon && (
                  <span className="flex items-center gap-1 rounded-full border border-line bg-black/40 px-2 py-0.5 text-[9px] font-bold text-zinc-400">
                    <Lock className="h-2.5 w-2.5" />
                    곧 오픈
                  </span>
                )}
              </div>
              <div>
                <p className="text-[15px] font-extrabold text-zinc-50">{g.name}</p>
                <p className="text-[9px] font-bold tracking-[0.2em] text-zinc-500">{g.eng}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
