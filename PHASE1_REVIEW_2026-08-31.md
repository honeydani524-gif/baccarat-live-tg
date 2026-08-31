# BaccaratLive TG — PHASE 1 검수 기록

작성일: 2026-08-31
기준 Branch: `main`
기준 Commit: `7e0af85`

## 1. 기준점

현재 Git 기준점:

```text
7e0af85 fix: disable mock game engine in production
```

변경 파일:

```text
server/src/config/env.js
```

변경 내용:

```js
mockGameEngine: !isProd && process.env.MOCK_GAME_ENGINE !== "false",
```

목적:
Production 환경에서는 `MOCK_GAME_ENGINE=true`가 설정되어 있어도 Mock Game Engine이 활성화되지 않도록 합니다.

## 2. 검증 결과

### Git

- `git status` → working tree clean
- `git diff --check` → PASS
- commit → PASS
- `git push origin main` → PASS

### Client

```text
npm run build → PASS
```

Vite production build가 성공했습니다.
Chunk size warning은 존재하지만 build 실패나 기능 오류는 아닙니다.

### Server

```text
node --check server/src/server.js → PASS
server/src/**/*.js 전체 syntax 검사 → PASS
```

Server 실제 실행:

```text
Port 4000 → LISTEN
Socket.io → 초기화 완료
```

API:

```text
GET /api/rooms → HTTP 200
GET /api/staking/pools → HTTP 200
```

### Environment

Development:

```text
NODE_ENV=development
MOCK_GAME_ENGINE=true
mockGameEngine=true
```

Production:

```text
NODE_ENV=production
MOCK_GAME_ENGINE=true
mockGameEngine=false
```

둘 다 의도한 결과로 검증되었습니다.

## 3. Import / Export 검수

Server 전체 JavaScript 파일을 대상으로 syntax 검사를 수행했습니다.

또한 실제 Server가 정상 부팅되는 것을 확인하여 핵심 import/module loading 오류가 없음을 확인했습니다.

`server/src/routes/api.js`에서 import 문 가독성 정리 대상이 있었지만 기능 오류는 아니므로 불필요한 변경을 하지 않았습니다.

## 4. 현재 PHASE 1 판단

PHASE 1 전체 완료로 아직 판단하지 않습니다.

남은 항목:

- [ ] client/server/bot package.json 전체 대조
- [ ] `process.env.*` 전수 검사
- [ ] `import.meta.env.*` 전수 검사
- [ ] `.env.example` 전체 대조
- [ ] `.gitignore` 및 Secret 노출 최종 검사
- [ ] dependency 중복/미사용 검사
- [ ] Client API ↔ Server Route 1:1 최종 대조
- [ ] Bot ↔ Server API 연결 최종 대조
- [ ] README / TODO_ROADMAP / STATUS 문서와 실제 소스 최종 대조

## 5. 다음 작업

PHASE 1 남은 검수를 먼저 완료합니다.

그 이후 PHASE 2:

```text
Telegram Mini App
→ initData
→ Server 검증
→ Telegram user 식별
→ User 생성/조회
→ JWT
→ Client 세션
```

Production에서는 Client가 제공하는 인증 데이터를 신뢰하지 않고 Server가 최종 검증합니다.

## 6. Production 미완료 상태

현재 프로젝트는 여전히 개발용 Skeleton입니다.

다음은 아직 Production 완료가 아닙니다.

- Firebase 영속화
- 실제 잔액 Transaction
- 실제 Round Engine
- 실제 베팅 Transaction
- 실제 정산 및 멱등성
- 실제 입출금
- 실제 Telegram Bot 연동
- 관리자/Dealer/Host Production 권한 검증
- Audit Log
- Production 보안/운영 검증
