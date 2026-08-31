# BaccaratLive TG — AI Development Guide

## 1. 목적

이 문서는 BaccaratLive TG 프로젝트를 개발하는 AI가 모든 개발 세션에서 따라야 하는 공통 지침입니다.

이 프로젝트는 실제 서비스화를 목표로 합니다. AI는 기존 프로젝트를 처음부터 재작성하지 않고, 현재 Git 기준점을 유지하면서 단계적으로 개발합니다.

---

## 2. 작업 시작 전 필수 Git 확인

모든 개발 세션은 현재 Git 상태 확인으로 시작합니다.

```powershell
git status
git branch
git remote -v
git log --oneline -10
```

반드시 다음을 확인합니다.

- 현재 Branch
- Local HEAD
- origin/main
- Working Tree
- 최근 Commit

로컬에 커밋되지 않은 사용자 변경사항이 있으면 임의로 삭제하거나 덮어쓰지 않습니다.

---

## 3. GitHub 기준

Repository:

`https://github.com/honeydani524-gif/baccarat-live-tg`

기본 Branch:

`main`

개발은 최신 `origin/main`을 기준으로 합니다.

---

## 4. 개발 원칙

기존 프로젝트를 삭제하거나 처음부터 다시 만들지 않습니다.

작업 순서:

```text
현재 소스 확인
→ 현재 구현 상태 확인
→ 문제점 확인
→ 최소 변경 범위 결정
→ 코드 수정
→ 테스트
→ git diff 확인
→ commit
→ push
→ GitHub ↔ Local 최종 동기화 확인
```

문제가 없는 코드를 목적 없이 변경하지 않습니다.

---

## 5. 테스트 원칙

수정 후 실제 실행 또는 가능한 수준의 검증을 수행합니다.

예:

```powershell
node --check <file>
npm run build
npm start
Invoke-WebRequest <API>
```

Client ↔ Server ↔ Bot 연동 변경이라면 해당 연결까지 검증합니다.

테스트하지 않은 기능을 완료 처리하지 않습니다.

---

## 6. 보안 및 Production 원칙

Client를 신뢰하지 않습니다.

다음 결정은 Server가 최종 권한을 가집니다.

- 게임 결과
- 잔액
- 베팅
- 정산
- 권한
- 입출금

다음 항목을 GitHub에 올리지 않습니다.

- `.env`
- Bot Token
- JWT Secret
- Firebase Service Account
- Private Key
- 기타 Secret

개발용 Mock/BYPASS 기능을 Production 기능으로 간주하지 않습니다.

---

## 7. 위험한 Git 명령

사용자의 명시적인 승인 없이 다음 명령을 사용하지 않습니다.

```powershell
git reset --hard
git clean -fd
git push --force
git push --force-with-lease
```

---

## 8. 작업 완료 시 필수 Git 절차

### 8.1 변경 확인

```powershell
git status
git diff
git diff --check
```

### 8.2 테스트

필요한 문법 검사, Build, 실행 및 API/Socket 테스트를 완료합니다.

### 8.3 Stage

```powershell
git add <변경파일>
```

### 8.4 Staged 내용 확인

```powershell
git status
git diff --cached
git diff --cached --check
```

### 8.5 Commit

변경 목적이 명확한 Commit Message를 사용합니다.

예:

```text
fix: disable mock game engine in production
feat: implement telegram initdata authentication
fix: prevent duplicate settlement
docs: update project development status
```

### 8.6 Push

```powershell
git push origin main
```

---

## 9. 모든 세션의 마지막 단계 — GitHub ↔ Local 동기화

**모든 개발 세션은 GitHub와 로컬이 동일한 최신 기준점인지 확인한 뒤 종료합니다.**

Push 후 반드시:

```powershell
git fetch origin
git status
git log --oneline -3
```

필요한 경우:

```powershell
git pull --ff-only origin main
```

최종 상태는 다음과 같아야 합니다.

```text
Branch = main
Local HEAD = origin/main
Working Tree = clean
```

즉:

```text
GitHub origin/main
        ↓
     Local VSCode
```

가 동일한 상태여야 합니다.

---

## 10. 새 AI 세션 시작 시

새 AI 세션에서는 먼저:

```powershell
git fetch origin
git status
git log --oneline -10
```

을 실행합니다.

로컬이 `origin/main`보다 뒤처져 있고 Working Tree가 깨끗하다면:

```powershell
git pull --ff-only origin main
```

으로 동기화합니다.

Working Tree에 사용자 변경사항이 있으면 먼저 사용자에게 알립니다.

---

## 11. 기준점 기록

중요한 기능 또는 안정화 작업이 완료되면 해당 Commit을 새로운 개발 기준점으로 기록합니다.

기준점 기록에는 가능하면 다음을 포함합니다.

```text
Commit
작업 내용
테스트 결과
Known Issues
현재 Phase
다음 작업
```

현재 기준점은 `PROJECT_BASELINE.txt`에 갱신합니다.

---

## 12. 문서 동기화

코드 상태가 변경되면 실제 소스와 다음 문서의 일치 여부를 확인합니다.

```text
README.md
PROJECT_BASELINE.txt
TODO_ROADMAP.txt
BaccaratLive_TG_PROJECT_STATUS_AND_DEVELOPMENT_GUIDE.txt
AI_DEVELOPMENT_GUIDE.md
```

문서와 코드가 다르면 어느 쪽이 실제 기준인지 먼저 확인합니다.

---

## 13. 작업 완료 보고

AI는 작업 완료 후 다음을 보고합니다.

```text
[작업 내용]

[변경 파일]

[테스트 결과]

[Commit]

[GitHub Push]

[최종 동기화]

Local HEAD:
origin/main:
Working Tree:
```

최종적으로 다음 조건을 확인합니다.

```text
Local HEAD == origin/main
Working Tree clean
```

---

## 14. 핵심 원칙

```text
기존 코드 존중
→ 현재 상태 확인
→ 최소 변경
→ 실제 테스트
→ 명확한 Commit
→ GitHub Push
→ Local ↔ GitHub 동기화
→ 다음 개발 세션
```

**모든 개발 세션은 GitHub와 로컬이 동일한 최신 기준점으로 끝나야 합니다.**
