import { motion } from "framer-motion";
import { Send, FlaskConical, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * 인증 페이지
 * - Telegram Mini App 외부에서 열리거나 initData 검증 실패 시 표시됩니다.
 * - 개발 모드 버튼은 서버 DEV_AUTH_BYPASS 정책이 켜진 경우에만 실제 인증됩니다.
 */
export default function AuthPage() {
  const { retry, loginDev, status } = useAuth();
  const failed = status === "error";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-base px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="font-display text-3xl font-bold tracking-[0.2em]">
          <span className="gold-text">BACCARAT</span>
        </p>
        <p className="mt-1 font-display text-lg font-bold tracking-[0.35em] text-zinc-100">LIVE TG</p>
        <p className="mt-4 text-xs leading-relaxed text-zinc-500">
          {failed
            ? "Telegram 인증에 실패했습니다. 다시 시도해 주세요."
            : "이 앱은 Telegram Mini App으로 동작합니다.\n봇에서 /play 명령으로 실행해 주세요."}
        </p>
      </motion.div>

      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={retry}
          className="btn-gold flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold"
        >
          {failed ? <RefreshCw className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {failed ? "다시 시도" : "Telegram 인증 다시 시도"}
        </button>
        <button
          type="button"
          onClick={loginDev}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-elevated text-sm font-bold text-zinc-300 transition-transform active:scale-95"
        >
          <FlaskConical className="h-4 w-4 text-gold" />
          개발 모드로 입장
        </button>
        <p className="text-center text-[10px] leading-relaxed text-zinc-600">
          개발 모드는 서버의 DEV_AUTH_BYPASS 활성화 시에만 유효하며,
          <br />
          운영 환경에서는 Telegram initData 검증이 필수입니다.
        </p>
      </div>
    </div>
  );
}
