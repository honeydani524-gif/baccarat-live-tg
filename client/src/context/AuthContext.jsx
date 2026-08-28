/**
 * 인증 컨텍스트
 * 흐름: Telegram WebApp initData → POST /api/auth/telegram → JWT 발급
 * - Telegram 환경이 아닐 경우(미리보기/로컬) 개발 모드로 폴백합니다.
 * - 권한의 최종 판단은 항상 Backend가 수행하며, 여기서의 role은 UI 표시용입니다.
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setAuthToken } from "../services/api.js";
import { DEV_USER } from "../services/mockData.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    status: "booting", // booting | authed | error
    user: null,
    token: null,
    isDev: false,
    isOffline: false, // 서버 미연결 여부
  });

  const finish = useCallback((token, user, { isDev = false, isOffline = false } = {}) => {
    setAuthToken(token);
    setState({ status: "authed", user, token, isDev, isOffline });
  }, []);

  const loginDev = useCallback(async () => {
    try {
      const data = await api.auth.telegram({ dev: true });
      finish(data.token, data.user, { isDev: true });
    } catch (e) {
      if (e?.isNetwork) {
        // 서버 없이 미리보기 — 완전 오프라인 개발 모드
        finish("dev-token", { ...DEV_USER }, { isDev: true, isOffline: true });
      } else {
        setState((s) => ({ ...s, status: "error" }));
      }
    }
  }, [finish]);

  const boot = useCallback(async () => {
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
    try {
      tg?.ready?.();
      tg?.expand?.();
    } catch (_) {
      /* noop */
    }
    const initData = tg?.initData;

    if (!initData) {
      // Telegram 외부 접속 — 개발 모드
      await loginDev();
      return;
    }
    try {
      const data = await api.auth.telegram({ initData });
      finish(data.token, data.user);
    } catch (e) {
      if (e?.isNetwork) {
        finish("dev-token", { ...DEV_USER }, { isDev: true, isOffline: true });
      } else {
        setState((s) => ({ ...s, status: "error" }));
      }
    }
  }, [finish, loginDev]);

  useEffect(() => {
    boot();
  }, [boot]);

  const setBalanceMicro = useCallback((micro) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, balanceMicro: micro } } : s));
  }, []);

  const applyBalanceDelta = useCallback((delta) => {
    setState((s) =>
      s.user
        ? { ...s, user: { ...s.user, balanceMicro: Math.max(0, (s.user.balanceMicro || 0) + delta) } }
        : s
    );
  }, []);

  const retry = useCallback(() => {
    setState({ status: "booting", user: null, token: null, isDev: false, isOffline: false });
    boot();
  }, [boot]);

  const value = { ...state, setBalanceMicro, applyBalanceDelta, retry, loginDev };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
