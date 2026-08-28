/**
 * 경량 토스트 — 모듈 이벤트 기반 (전역 Provider 없이 사용)
 * 사용: toast.show("메시지", "success" | "error" | "info")
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

let seq = 0;

export const toast = {
  show(message, type = "info") {
    window.dispatchEvent(new CustomEvent("bltg:toast", { detail: { id: ++seq, message, type } }));
  },
  success(m) {
    toast.show(m, "success");
  },
  error(m) {
    toast.show(m, "error");
  },
};

const ICONS = {
  success: <CheckCircle2 className="h-4 w-4 text-tie" />,
  error: <AlertTriangle className="h-4 w-4 text-banker" />,
  info: <Info className="h-4 w-4 text-player" />,
};

export function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const item = e.detail;
      setItems((prev) => [...prev.slice(-2), item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== item.id));
      }, 2600);
    };
    window.addEventListener("bltg:toast", handler);
    return () => window.removeEventListener("bltg:toast", handler);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[90] flex flex-col items-center gap-2 px-6">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="glass flex max-w-full items-center gap-2 rounded-2xl px-4 py-2.5 text-[13px] font-medium text-zinc-100 shadow-2xl"
          >
            {ICONS[t.type] || ICONS.info}
            <span className="truncate">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
