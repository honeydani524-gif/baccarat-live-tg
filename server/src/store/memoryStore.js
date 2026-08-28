/**
 * 인메모리 스토어 — Firebase 미설정 개발 환경에서 서버를 실행 가능하게 합니다.
 * ⚠️ 재시작 시 데이터가 사라집니다. 운영에서는 Firestore로 대첩니다.
 * 모든 금액은 micro-USDT 정수입니다.
 */

export const store = {
  users: new Map(), // telegramId -> user
  rooms: [
    {
      id: "vip-table-a",
      name: "VIP TABLE A",
      minBetMicro: 1_000_000,
      maxBetMicro: 100_000_000,
      status: "BETTING",
      currentRound: 142,
      dealerId: "dealer-aria",
      isActive: true,
      players: 128,
      studio: "MACAU STUDIO 01",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "vip-table-b",
      name: "VIP TABLE B",
      minBetMicro: 5_000_000,
      maxBetMicro: 500_000_000,
      status: "BETTING",
      currentRound: 87,
      dealerId: "dealer-leon",
      isActive: true,
      players: 86,
      studio: "MANILA STUDIO 02",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "elite-table-c",
      name: "ELITE TABLE C",
      minBetMicro: 1_000_000,
      maxBetMicro: 50_000_000,
      status: "PREPARING",
      currentRound: 12,
      dealerId: "dealer-mia",
      isActive: true,
      players: 42,
      studio: "SEOUL STUDIO 03",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  rounds: new Map(), // roomId -> current round snapshot
  bets: new Map(), // betId -> bet
  clientBetIndex: new Map(), // clientBetId -> betId (중복 요청 방지)
  pools: [
    {
      id: "pool-vip-alpha",
      hostId: "host-001",
      hostName: "크라운 운영진",
      name: "VIP 알파 풀",
      description: "VIP TABLE A · B 전용 운영 풀입니다. 라운드 수익의 70%를 참여 비율로 분배합니다.",
      minAmountMicro: 100_000_000,
      maxAmountMicro: 5_000_000_000,
      earlyExitAllowed: true,
      status: "OPEN",
      recruitmentEndsAt: Date.now() + 1000 * 60 * 60 * 40,
      participants: 57,
      totalStakedMicro: 8_240_000_000,
      capacityMicro: 20_000_000_000,
      weeklyReturnRate: "목표 주 2~4%",
      createdAt: Date.now(),
    },
    {
      id: "pool-premium-beta",
      hostId: "host-002",
      hostName: "프리미엄 라운지",
      name: "프리미엄 베타 풀",
      description: "소액 참여 가능한 안정형 풀. 조기 출금 시 수수료 5%가 적용됩니다.",
      minAmountMicro: 10_000_000,
      maxAmountMicro: 1_000_000_000,
      earlyExitAllowed: true,
      status: "ACTIVE",
      recruitmentEndsAt: null,
      participants: 132,
      totalStakedMicro: 15_600_000_000,
      capacityMicro: 30_000_000_000,
      weeklyReturnRate: "목표 주 1~2%",
      createdAt: Date.now(),
    },
  ],
  poolParticipants: new Map(), // poolId -> [{ telegramId, amountMicro, joinedAt }]
  deposits: [],
  withdrawals: [],
  settings: {
    minBetMicro: 1_000_000,
    maxBetMicro: 500_000_000,
    commissionBps: 500,
    maintenanceMode: false,
    minStakeMicro: 100_000_000,
    maxStakeMicro: 5_000_000_000,
    updatedAt: Date.now(),
  },
};

// 개발용 사용자 시드 (DEV super admin — 서버 DEV_AUTH_BYPASS 시에만 로그인 가능)
const DEV_USER = {
  telegramId: "dev-user-0001",
  username: "dev_player",
  displayName: "DEV 플레이어",
  balanceMicro: 1_250_350_000,
  role: "SUPER_ADMIN",
  createdAt: Date.now(),
  lastLoginAt: Date.now(),
};
store.users.set(DEV_USER.telegramId, DEV_USER);

export function getUser(telegramId) {
  return store.users.get(String(telegramId)) || null;
}

export function upsertUser(partial) {
  const id = String(partial.telegramId);
  const prev = store.users.get(id);
  const now = Date.now();
  const next = {
    telegramId: id,
    username: partial.username ?? prev?.username ?? "",
    displayName: partial.displayName ?? prev?.displayName ?? "",
    balanceMicro: prev?.balanceMicro ?? 0,
    role: prev?.role ?? partial.role ?? "USER",
    createdAt: prev?.createdAt ?? now,
    lastLoginAt: now,
  };
  store.users.set(id, next);
  return next;
}

export function getRoom(roomId) {
  return store.rooms.find((r) => r.id === roomId) || null;
}

export function getCurrentRound(roomId) {
  const room = getRoom(roomId);
  if (!room) return null;
  const existing = store.rounds.get(roomId);
  if (existing) return existing;
  const round = {
    roomId,
    roundNumber: room.currentRound,
    status: "BETTING",
    result: null,
    bettingStartedAt: Date.now(),
    bettingClosedAt: null,
    confirmedAt: null,
    settledAt: null,
  };
  store.rounds.set(roomId, round);
  return round;
}

export function updateRound(roomId, patch) {
  const round = getCurrentRound(roomId);
  if (!round) return null;
  Object.assign(round, patch);
  return round;
}
