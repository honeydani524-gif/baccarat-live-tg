/**
 * Telegram WebApp 훅
 * - window.Telegram.WebApp 에 안전하게 접근합니다.
 * - Telegram 외부(브라우저) 환경에서는 isTelegram=false를 반환합니다.
 */
import { useMemo } from "react";

export function useTelegram() {
  return useMemo(() => {
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
    const isTelegram = Boolean(tg?.initData);
    return {
      webApp: tg ?? null,
      isTelegram,
      initData: tg?.initData ?? null,
      user: tg?.initDataUnsafe?.user ?? null,
      platform: tg?.platform ?? "web",
      colorScheme: tg?.colorScheme ?? "dark",
      expand: () => tg?.expand?.(),
      close: () => tg?.close?.(),
      /** 햅틱 피드백 (지원 환경에서만 동작) */
      haptic: (type = "impact") => {
        try {
          if (type === "impact") tg?.HapticFeedback?.impactOccurred("light");
          else tg?.HapticFeedback?.notificationOccurred(type);
        } catch (_) {
          /* noop */
        }
      },
    };
  }, []);
}
