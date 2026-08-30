# 🎩 BaccaratLive TG

> Telegram Mini App 기반 라이브 바카라 프로젝트.
>
> 현재는 **개발용 Skeleton / 기능 연결 검증 단계**입니다. 실제 운영 전 Firebase 영속화, 원자적 잔액 처리, 실제 Telegram 인증, 정산 멱등성 및 Production 보안 검증이 필요합니다.

Repository: https://github.com/honeydani524-gif/baccarat-live-tg
Default branch: `main`

---

## 1. 현재 상태

GitHub의 현재 기준 상태를 문서화합니다.

- Node.js `v22.14.0` 확인 완료
- npm `10.9.2` 확인 완료
- Server `http://localhost:4000` 실행 확인
- Client `http://localhost:5173/` 실행 확인
- `GET /api/rooms` 정상 응답 확인
- `GET /api/staking/pools` 정상 응답 확인
- 개발 로그인 → JWT 발급 → Bearer 인증 → `/api/auth/me` 확인 완료
- Client 내정보 화면에서 개발 사용자 정보 표시 확인
- Firebase: **OFF**
- Database: **Memory Store**
- Game Engine: **MOCK_GAME_ENGINE=ON**

따라서 현재 버전은 Production 시스템이 아니라 **개발 및 기능 연결을 위한 기준 Skeleton**입니다.

### 최근 커밋 기준

```text
c419b6e  docs: add project roadmap and remaining tasks
 d1d1151 Add project baseline documentation
 a9ef406 Add client and server lockfiles
 833321b Initial project
```

---

## 2. 프로젝트 구조

```text
baccarat-live-tg/
├── .gitignore
├── README.md
├── PROJECT_BASELINE.txt
├── TODO_ROADMAP.txt
├── package.json
├── package-lock.json
│
├── client/                         # Telegram Mini App / React + Vite
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── utils/
│       └── App.jsx / main.jsx
│
├── server/                         # Express + Socket.io + Firebase Admin
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── sockets/
│       ├── store/
│       └── utils/
│
├── bot/                            # Telegram Bot / Telegraf
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── commands/
│       ├── handlers/
│       ├── services/
│       └── bot.js
│
└── src/                            # 현재 루트 프리뷰 컨테이너
```

### 역할

| 영역 | 역할 |
|---|---|
| `client/` | Mini App UI, 인증 세션, LIVE, 게임방, 베팅, 스테이킹, 내정보 등 |
| `server/` | 인증, 권한, 게임방, 베팅, 정산 기반, 입출금, 스테이킹, Socket.io |
| `bot/` | Telegram 명령어, 관리자 처리, 알림/스트림 서비스 |
| `PROJECT_BASELINE.txt` | 프로젝트 기준점 기록 |
| `TODO_ROADMAP.txt` | 실제 소스 기준 남은 개발 작업 및 순서 |

---

## 3. 주요 구현 기반

### Client

- AuthContext / Telegram Hook
- LIVE Lobby / Game Room
- BettingTable / BettingSheet / BettingConfirmModal
- ChipSelector / Timer / StreamView
- DealerAdmin / HostDashboard / AdminDashboard
- StakingList / ProfilePage / SupportPage
- Socket / Game / Live Stream Hooks

### Server

- Telegram 인증 Controller
- JWT / Role Middleware
- Rate Limiting
- Room / Bet / Game / Stream / Staking API
- Deposit / Withdrawal / Admin Settings API
- Socket.io + Mock Game Engine
- Memory Store
- Settlement Engine / Staking Engine 기반
- Firebase Admin 연결 구조
- micro-USDT 금액 유틸리티

### Bot

- `/start`
- `/play`
- `/deposit`
- `/withdraw`
- `/mywallet`
- `/history`
- 관리자 Handler
- Notification Service
- Stream Service

---

## 4. 설치

각 패키지는 독립적으로 설치합니다.

```powershell
cd client
npm install

cd ..\server
npm install

cd ..\bot
npm install
```

현재 루트 `package.json`에는 별도의 Vite 프리뷰 구성이 존재하므로, 실제 애플리케이션 개발은 `client/`, `server/`, `bot/`을 각각 실행하는 방식을 기준으로 합니다.

---

## 5. 환경변수

실제 Secret은 GitHub에 올리지 않습니다.

### Windows PowerShell

프로젝트 최상위에서:

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
Copy-Item bot/.env.example bot/.env
```

### macOS / Linux

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
cp bot/.env.example bot/.env
```

### Client 기본값

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_APP_ID=
VITE_SUPPORT_USERNAME=
```

### Server 기본 개발값

```env
NODE_ENV=development
PORT=4000
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:5173
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_BOT_SECRET=
ADMIN_TELEGRAM_IDS=
DEV_AUTH_BYPASS=true
MOCK_GAME_ENGINE=true
LOG_LEVEL=debug
FIREBASE_SERVICE_ACCOUNT_KEY=
FIREBASE_DATABASE_URL=
PLATFORM_WALLET_ADDRESS=
PLATFORM_WALLET_NETWORK=TRC-20
MIN_STAKE_AMOUNT=100000000
MAX_STAKE_AMOUNT=5000000000
```

Bot은 `bot/.env.example`을 기준으로 설정합니다.

> 운영 전에는 소스의 `process.env.*`, `import.meta.env.*`와 `.env.example`을 전수 대조해야 합니다. 이는 `TODO_ROADMAP.txt` Phase 1 작업입니다.

---

## 6. 로컬 실행

### Terminal 1 — Server

```powershell
cd C:\Users\하승진\Desktop\baccarat-live-tg\server
npm run dev
```

Server:

```text
http://localhost:4000
```

`http://localhost:4000/`은 API 서버 루트이므로 `NOT_FOUND` JSON이 나올 수 있습니다. 정상입니다. API는 `/api/...` 경로로 확인합니다.

```powershell
Invoke-RestMethod http://localhost:4000/api/rooms
Invoke-RestMethod http://localhost:4000/api/staking/pools
```

### Terminal 2 — Client

```powershell
cd C:\Users\하승진\Desktop\baccarat-live-tg\client
npm run dev
```

Client:

```text
http://localhost:5173/
```

### Terminal 3 — Bot

```powershell
cd C:\Users\하승진\Desktop\baccarat-live-tg\bot
npm run dev
```

실제 Telegram 연결에는 Bot Token이 필요합니다.

---

## 7. 현재 인증 테스트

개발환경에서는 `DEV_AUTH_BYPASS=true`를 사용할 수 있습니다.

```text
개발 로그인
    ↓
JWT 발급
    ↓
Authorization: Bearer <token>
    ↓
GET /api/auth/me
    ↓
사용자 정보 반환
    ↓
Client 내정보 표시
```

현재 개발 화면에서 `DEV 플레이어`, `SUPER_ADMIN`, 개발 모드 세션 표시를 확인했습니다.

> 개발 우회 인증은 Production 인증이 아닙니다. 실제 Mini App에서는 Telegram `initData`를 서버에서 검증해야 합니다.

---

## 8. API 개요

### 공개

```text
GET /api/rooms
GET /api/rooms/:roomId
GET /api/rooms/:roomId/current-round
GET /api/rooms/:roomId/streams
GET /api/staking/pools
GET /api/staking/pools/:poolId
```

### 인증

```text
POST /api/auth/telegram
GET  /api/auth/me
```

### 베팅

```text
POST   /api/rooms/:roomId/bets
DELETE /api/rooms/:roomId/bets/:betId
```

### 입출금

```text
POST /api/deposits
GET  /api/deposits/my
POST /api/withdrawals
GET  /api/withdrawals/my
```

### 스테이킹

```text
GET  /api/staking/pools
GET  /api/staking/pools/:poolId
POST /api/staking/pools
POST /api/staking/pools/:poolId/join
```

### Dealer / Admin

```text
PUT  /api/rooms/:roomId/streams
POST /api/rooms/:roomId/dealer/close-betting
POST /api/rooms/:roomId/dealer/confirm-result
POST /api/rooms/:roomId/dealer/next-round
GET  /api/admin/settings
PUT  /api/admin/settings
```

권한이 필요한 API는 JWT 및 Role Middleware를 통과해야 합니다.

---

## 9. 현재 핵심 한계

### Firebase / 영속 데이터

```text
Firebase: OFF
Database: Memory Store
Game Engine: MOCK_GAME_ENGINE=ON
```

현재 서버를 재시작하면 Memory Store 데이터가 유지되지 않습니다.

### Telegram 실인증

개발 로그인과 JWT는 검증했지만 실제 Telegram Mini App `initData` 전체 흐름은 아직 구현/검증 작업이 남아 있습니다.

### 실제 베팅 / 정산

UI와 API 및 Engine 기반은 존재하지만 Production 수준의 다음 처리가 아직 남아 있습니다.

- Firebase Transaction 기반 잔액 차감
- Bet 영속 저장
- 동시성 제어
- 멱등성 키
- 실제 정산 Transaction
- 중복 정산 방지
- 거래 감사 로그

---

## 10. 개발 우선순위

세부 체크리스트는 `TODO_ROADMAP.txt`가 기준입니다.

```text
Phase 0  기준점 보호
   ↓
Phase 1  구조 / dependency / 환경변수 정리
   ↓
Phase 2  실제 Telegram 인증
   ↓
Phase 3  Firebase / 영속 데이터
   ↓
Phase 4  금액 / 원자적 잔액 처리
   ↓
Phase 5  실제 Socket.io 게임 통신
   ↓
Phase 6  실제 Round 상태 머신
   ↓
Phase 7  실제 베팅
   ↓
Phase 8  결과 확정 / 실제 정산
   ↓
Phase 9  LIVE / 스테이킹 / 입출금 / Bot / 운영 안정화
```

서버가 게임 상태의 최종 권한을 가지며 Client는 서버 상태를 표시하는 원칙을 유지합니다.

---

## 11. 금액 처리 규칙

```text
1 USDT = 1,000,000 micro-USDT
```

예:

```text
100 USDT = 100,000,000 micro-USDT
```

관련 코드:

```text
server/src/utils/moneyUtil.js
client/src/utils/formatMoney.js
```

운영 단계에서는 잔액 변경을 원자적 Transaction으로 처리해야 합니다.

---

## 12. 보안 / GitHub Push

GitHub에 다음을 올리면 안 됩니다.

- `.env`
- Telegram Bot Token
- JWT Secret
- Firebase Service Account JSON / Private Key
- API Secret / Database Secret
- Wallet Private Key
- Access Token
- 기타 인증 정보
- `node_modules/`
- `dist/` / `build/`

GitHub에는 다음 예시 파일이 포함되어야 합니다.

```text
client/.env.example
server/.env.example
bot/.env.example
```

Push 전:

```powershell
git status
git add .
git status
git commit -m "type: describe change"
git push
```

`.env` 또는 Secret이 Stage에 보이면 Push하지 말고 먼저 `.gitignore`와 Git 추적 상태를 확인합니다.

---

## 13. 작업 기준 문서

다른 AI나 개발자에게 프로젝트를 전달할 때 다음 순서로 읽습니다.

1. `README.md` — 현재 프로젝트 전체 개요 및 실행법
2. `PROJECT_BASELINE.txt` — 기준점과 이미 검증된 상태
3. `TODO_ROADMAP.txt` — 남은 작업과 개발 순서
4. 실제 소스 코드 — 구현 여부 최종 확인

작업 시작 전에는 항상:

```powershell
git status
git log --oneline -5
```

를 확인합니다.

---

## 14. Production 전 필수 조건

다음 항목이 완료되기 전에는 Production 배포 완료로 판단하지 않습니다.

- [ ] 실제 Telegram `initData` 검증
- [ ] Firebase Firestore / RTDB 연결
- [ ] 사용자/게임/거래 영속화
- [ ] 원자적 잔액 처리
- [ ] 실제 베팅 Transaction
- [ ] 실제 결과 정산 Transaction
- [ ] 멱등성 / 중복 요청 / 중복 정산 방지
- [ ] 운영용 입출금 검증
- [ ] Socket 재연결 및 권한 검증
- [ ] Production Secret 관리
- [ ] 보안 점검 및 로그/감사 체계
- [ ] 실제 운영 환경 통합 테스트

---

## 15. 라이선스 / 운영 정책

현재 저장소의 별도 라이선스 및 실제 서비스 운영 정책은 확정 문서화되지 않았습니다.

실제 서비스 배포 전에는 대상 국가/지역의 법률과 Telegram 및 관련 플랫폼 정책을 확인하고, 필요한 이용약관·개인정보처리방침·연령 제한·책임 정책 등을 별도로 마련해야 합니다.

---

## 마지막 업데이트

**2026-08-29**

현재 GitHub 저장소의 실제 구조, 최근 커밋, 현재까지 로컬에서 확인된 실행 상태를 기준으로 작성했습니다.
