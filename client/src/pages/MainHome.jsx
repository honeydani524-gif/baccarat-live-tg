import { Navigate } from "react-router-dom";

/** 메인 홈 — 기본 진입은 LIVE 로비 */
export default function MainHome() {
  return <Navigate to="/live" replace />;
}
