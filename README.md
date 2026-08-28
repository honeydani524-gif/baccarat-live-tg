# 🎩 BaccaratLive TG

> Telegram Mini App 기반 라이브 바칸 프로젝트 — **프로젝트 뼈대 / 아키텍처**
>
> GitHub: https://github.com/honeydani524-gif/baccarat-live-tg

Telegram Bot → Telegram Mini App(React) → Node.js Backend → Firebase 구조의 모노레포입니다.
실제 애플리케이션은 `client/`, `server/`, `bot/` 3개의 독립 패키지로 구성됩니다.
코드의 `TODO(2차)` 주석은 향후 구현 위치와 책임을 나타냅니다.

---

## 1. 최종 폭폭 구조

```text
baccarat-live-tg/
├── .gitignore
├── README.md
├── package.json                  # 루트 프리뷰/통합 빌드 컨테이너 (아래 "루트 파일 안내" 참고)
├── index.html / vite.config.ts / tsconfig.json / src/
│   └── 루트 프리뷰 컨테이너 — client/ 앱만 렌더링하는 껍데기 (앱 코드 중복 없음)
│
├── client/                       # ✅ Telegram Mini App (React 19 + Vite + Tailwind v4)
│   ├── .env.example              # → client/.env 로 복사
│   ├── package.json              # dev / build / preview
│   ├── vite.config.js            # /api, /socket.io → :4000 개발 프록시
│   ├── index.html
│   └── src/
│       ├── components/           # UI 컴포넌트 13종
│       ├── pages/                # 페이지 11종 (라우트와 1:1)
│       ├── hooks/                # useTelegram / useSocket / useGame / useLiveStreams
│       ├── services/             # api.js(Service Layer) / firebase.js / mockData.js
│       ├── context/              # AuthContext (Telegram 인증 세션)
│       └── utils/                # formatMoney.js (micro-USDT 전용)
│
├── server/                       # ✅ Backend (Express + Socket.io + Firebase Admin)
│   ├── .env.example              # → server/.env 로 복사
│   ├── package.json              # dev / start
│   └── src/
│       ├── config/               # env.js(환경변수 검증) / firebaseAdmin.js
│       ├── controllers/          # auth·room·bet·game·stream·staking·deposit·withdrawal·admin
│       ├── middlewares/          # authMiddleware / roleMiddleware / rateLimiter
│       ├── routes/api.js
│       ├── sockets/gameSocket.js # Socket 이벤트 + 개발용 목업 라운드 엔진
│       ├── store/memoryStore.js  # Firebase 미설정 개발 폐기
│       ├── utils/                # moneyUtil / settlementEngine / stakingEngine /
│       │                         # telegramAuth / logger / respond
│       ├── app.js
│       └── server.js             # entry point
│
└── bot/                          # ✅ Telegram Bot (Telegraf)
    ├── .env.example              # → bot/.env 로 복사
    ├── package.json              # dev / start
    └── src/
        ├── commands/             # start / play / deposit / withdraw / mywallet / history
        ├── handlers/             # adminHandler
        ├── services/             # notifyService / streamService
        └── bot.js                # entry point
```

> **루트 파일 안내**
> 루트의 `src/`·`index.html`·`vite.config.ts`·`tsconfig.json`은 프로젝트 납품/미리보기
> 파이프라인이 GitHub Pages 방식으로 앱을 미리보기 위한 **통합 프리뷰 컨테이너**입니다.
> `src/App.tsx`가 `client/src/App.jsx`를 그대로 렌더링할 뿐, 중복된 애플리케이션 코드는 없습니다.
> 저장소를 **순수 모노레포**로만 운영하고 싶다면 아래 [부록 A](#부록-a-순수-모노레포-전환-선택)를 참고하세요.

---

## 2. 필수 설치 환경

| 항목 | 요구 사항 |
| --- | --- |
| Node.js | **≥ 20** (권장: 20 LTS 이상) |
| npm | ≥ 10 |
| Firebase | 선택 — 미설정 시 서버가 메모리 스토어로 자동 전환 |
| Telegram Bot Token | Bot 실행 시 필수 (@BotFather 발급) |

---

## 3. 설치 방법

세 프로젝트는 독립 패키지입니다. 각각 설치하세요.

```bash
npm install --prefix client
npm install --prefix server
npm install --prefix bot
```

또는 각 폼에서 직접:

```bash
cd client && npm install
cd server && npm install
cd bot    && npm install
```

> `npm install`은 각 폼에 `package-lock.json`을 자동 생성합니다.
> 생성된 lock 파일은 GitHub에 **반드시 포함**하세요 (재현 가능한 설치 보장).

---

## 4. 환경변수 설정 방법

각 프로젝트의 `.env.example`을 복사해 `.env`를 만들고 **실제 값을 직접 입력**하세요.
배포 ZIP에는 `.env`가 포함되어 있지 않습니다.

macOS / Linux:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
cp bot/.env.example bot/.env
```

Windows CMD:

```cmd
copy client\.env.example client\.env
copy server\.env.example server\.env
copy bot\.env.example bot\.env
```

Windows PowerShell:

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
Copy-Item bot/.env.example bot/.env
```

핵심 입력 항목:

| 파일 | 변수 | 비고 |
| --- | --- | --- |
| `server/.env` | `JWT_SECRET` | production 필수 (개발이면 생략 가능 — 랜덤 임시키 자동 생성) |
| `server/.env` | `TELEGRAM_BOT_TOKEN` | initData 검증용 |
| `server/.env` | `FIREBASE_SERVICE_ACCOUNT_KEY` | 서비스 계정 JSON 한 줄 문자열 |
| `bot/.env` | `MINI_APP_URL` | @BotFather `/newapp` 등록 주소 |
| `client/.env` | `VITE_API_BASE_URL` | 기본값 `http://localhost:4000` |
| `client/.env` | `VITE_FIREBASE_*` | RTDB 스트림 구독 (없어도 Mock 동작) |

> ⚠️ `.env`는 `.gitignore`로 제외되어 있습니다. 실제 Secret을 절대 커밋하지 마세요.

---

## 5. 실행 방법

### Client (포트 5173)

```bash
cd client
npm install
npm run dev       # 개발 서버 — /api, /socket.io 는 :4000 으로 프록시
npm run build     # 프로덕션 빌드 → client/dist
npm run preview   # 빌드 결과 미리보기
```

### Server (포트 4000)

```bash
cd server
npm install
npm run dev       # 개발 (watch)
npm start         # production 실행
# 확인: curl http://localhost:4000/health
```

### Bot

```bash
cd bot
npm install
npm run dev       # 개발 (watch)
npm start         # 실행 — .env의 TELEGRAM_BOT_TOKEN 필수
```

### 통합 프리뷰 (루트 — 선택)

```bash
npm install
npm run dev       # 루트 컨테이너가 client/ 미니앱을 통째로 프리뷰합니다
npm run build     # 프리뷰용 정적 번들 생성
```

---

## 6. Production Build 방법

```bash
# 1) 클라이언트 정적 빌드
npm run build --prefix client        # → client/dist

# 2) 서버
cd server
NODE_ENV=production npm start
# ⚠️ production에서는 JWT_SECRET / TELEGRAM_BOT_TOKEN 없이 부팅되지 않습니다.

# 3) 봇
cd bot && npm start
```

배포 전 확인: server의 `CORS_ORIGIN`에 Mini App 도메인 등록, client의 `VITE_API_BASE_URL`을 운영 API 주소로 지정.

---

## 7. GitHub Push 방법

프로젝트 **최상위 폼**에서 순서대로 실행하세요.

```bash
git init
git add .
git status                  # ← 아래 보안 체크 수행
git commit -m "Initial project"
git branch -M main
git remote add origin https://github.com/honeydani524-gif/baccarat-live-tg.git
git push -u origin main
```

### GitHub Push 전 보안 체크

**`git status` 결과에 절대 포함되면 안 되는 것**

- `.env`, `.env.local`, `.env.production` 등 모든 `.env.*`
- Firebase Service Account JSON, Private Key(`.pem`/`.key`), Secret Key
- Telegram Bot Token이 입력된 파일
- `node_modules/`, `dist/`, `build/`

**반드시 포함되어야 하는 것**

- `.gitignore`, `README.md`
- 각 폼의 `package.json` 및 생성된 `package-lock.json`
- 각 폼의 `.env.example`
- 모든 소스 코드

> `.env`가 Stage에 보이면 `git rm --cached <file>`로 제거 후 다시 확인하세요.

---

## 8. 핵심 설계 규칙 (개발 전 필독)

- **금액**: 모든 금액은 micro-USDT 정수 (`1 USDT = 1,000,000 micro`). 부동소수점 연산 금지.
  → `server/utils/moneyUtil.js`, `client/utils/formatMoney.js` 경유. 잔액 변경은 Firestore Transaction 구조.
- **인증**: Telegram `initData`는 서버에서만 검증 (`server/utils/telegramAuth.js`).
- **권한**: `USER / DEALER / HOST / ADMIN / SUPER_ADMIN` → `requireAuth`, `requireRole("ADMIN")`.
- **하단 납납 순서**: LIVE · 미니게임 · 스테이킹 · 내정보 · 고객센터
- **게임방 보호 규칙**: 메인 스트림 보호 영역(오버레이/필터 금지), 보조 스트림 하단, 베팅은 Bottom Sheet, 스트림 URL 하드코딩 금지(RTB D `live/rooms/{roomId}` 구독).
- **응답 규약**: `{ success: true, data }` / `{ success: false, error: { code, message } }`

---

## 9. 다음 단계 (2차 로드맵)

- [ ] Firestore 컬렉션 실연동 + 잔액 변경 Transaction 화
- [ ] `settleRoundWithTransaction` 정산 실연동 + 감사 로그
- [ ] RTDB 스트림 관리 등록 UI + 클라이언트 실구독 전환
- [ ] 스테이킹 정산(지분율 bps) + 조기 출금 수수료
- [ ] Bot ↔ Server 알림 채널 (입출금/정산 푸시)

## 10. 설계상 명시적 제외 항목

출목표/Roadmap(UI·컬렉션·API·이벤트), 비드/빅로드/중국점, 카드 덱/셔플/카드 입력/합계 계산, 카드 기반 자동 판정 UI, DealerChat, GPT 딜러 대사, 딜러의 전체 회원 베팅 현황 — **본 프로젝트에서 생성하지 않습니다.**

---

## 부록 A. 순수 모노레포 전환 (선택)

GitHub 저장소에서 루트 프리뷰 컨테이너가 필요 없다면, 아래 절차로 workspaces 모노레포로 전환할 수 있습니다. (애플리케이션 코드 변경 없음)

```bash
# 1) 프리뷰 컨테이너 제거
rm -rf src index.html vite.config.ts tsconfig.json
```

```bash
# 2) 루트 package.json 을 아래로 교체
```

```json
{
  "name": "baccarat-live-tg",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "workspaces": ["client", "server", "bot"],
  "scripts": {
    "dev:client": "npm run dev -w client",
    "dev:server": "npm run dev -w server",
    "dev:bot": "npm run dev -w bot",
    "build": "npm run build -w client",
    "start": "npm start -w server"
  }
}
```

```bash
# 3) workspaces 통합 설치
npm install
npm run dev:server   # 터미널 1
npm run dev:client   # 터미널 2
npm run dev:bot      # 터미널 3
```
