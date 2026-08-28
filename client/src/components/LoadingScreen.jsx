import { motion } from "framer-motion";

/** 앱 부팅 로딩 화면 — Telegram 인증 진행 중 표시 */
export default function LoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-base">
      <motion.div
        className="relative flex h-24 w-24 items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{ borderTopColor: "#e3b94e", borderRightColor: "#e3b94e" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-elevated to-card shadow-inner">
          <span className="gold-text font-display text-2xl font-bold">B</span>
        </div>
      </motion.div>
      <div className="text-center">
        <motion.p
          className="font-display text-lg font-bold tracking-[0.25em]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="gold-text">BACCARAT</span>{" "}
          <span className="text-zinc-100">LIVE</span>
        </motion.p>
        <motion.p
          className="mt-2 text-xs tracking-widest text-zinc-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.4, 1] }}
          transition={{ delay: 0.4, duration: 1.6, repeat: Infinity }}
        >
          TELEGRAM SECURE LOGIN...
        </motion.p>
      </div>
    </div>
  );
}
