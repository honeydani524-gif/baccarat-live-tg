/**
 * 루트 프리뷰 엔트리
 * 이 프로젝트는 client/ · server/ · bot/ 으로 구성된 모노레포입니다.
 * 루트 Vite는 client/ Mini App의 미리보기 컨테이너로만 사용됩니다.
 * (실제 배포/개발은 client/ 디렉터리의 독립 Vite 앱을 사용하세요)
 */
// @ts-ignore — client는 JSX 앱입니다 (루트 빌드는 vite만 통과)
import ClientApp from "../client/src/App.jsx";

export default function App() {
  return <ClientApp />;
}
