/**
 * 개발용 Mock 데이터 — 서버 미연결 시 api.js 의 폴백으로 사용됩니다.
 * 운영 환경에서는 항상 Backend API 응답이 우선합니다.
 */

export const THUMBNAILS = {
  vipA: "https://images.pexels.com/photos/6664176/pexels-photo-6664176.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  vipB: "https://images.pexels.com/photos/6664126/pexels-photo-6664126.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  eliteC: "https://images.pexels.com/photos/6962259/pexels-photo-6962259.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  casinoMain: "https://images.pexels.com/photos/6664144/pexels-photo-6664144.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  tableAux: "https://images.pexels.com/photos/6664190/pexels-photo-6664190.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

export const ROOM_STATUS_META = {
  PREPARING: { label: "준비중", tone: "zinc" },
  BETTING: { label: "베팅중", tone: "emerald" },
  CLOSED: { label: "마감", tone: "amber" },
  RESULT_PENDING: { label: "결과 대기", tone: "sky" },
  SETTLED: { label: "정산 완료", tone: "zinc" },
};

export const MOCK_ROOMS = [
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
    thumbnail: THUMBNAILS.vipA,
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
    thumbnail: THUMBNAILS.vipB,
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
    thumbnail: THUMBNAILS.eliteC,
  },
];

/** 게임 회차 목업 — 카드 입력 없이 결과 플래그만 존재 */
export const MOCK_CURRENT_ROUND = {
  roundNumber: 142,
  status: "BETTING",
  result: null,
  bettingStartedAt: null,
  bettingClosedAt: null,
  confirmedAt: null,
  settledAt: null,
};

/** 스트리밍 목업 — 실제 URL은 절대 하드코딩하지 않습니다 (RTDB에서 구독) */
export function mockStreamsFor(roomId) {
  return {
    casinoStream: {
      url: null,
      type: "iframe",
      isLive: true,
      thumbnail: THUMBNAILS.casinoMain,
      updatedAt: Date.now(),
      label: "CASINO MAIN CAM",
    },
    tableStream: {
      url: null,
      type: "iframe",
      isLive: true,
      thumbnail: THUMBNAILS.tableAux,
      updatedAt: Date.now(),
      label: `TABLE CAM · ${roomId}`,
    },
  };
}

/** 미니게임 2열 × 3행 목업 — 게임이 늘면 아래로 자동 확장 */
export const MOCK_MINIGAMES = [
  { id: "powerball", name: "파워볼", eng: "POWER BALL", icon: "zap", gradient: "from-amber-500/25 to-orange-600/10", comingSoon: true },
  { id: "dice", name: "다이스", eng: "DICE", icon: "dices", gradient: "from-sky-500/25 to-blue-600/10", comingSoon: true },
  { id: "rocket", name: "크래시", eng: "CRASH", icon: "rocket", gradient: "from-rose-500/25 to-red-600/10", comingSoon: true },
  { id: "target", name: "홀짝", eng: "ODD EVEN", icon: "target", gradient: "from-emerald-500/25 to-teal-600/10", comingSoon: true },
  { id: "slots", name: "슬롯 VIP", eng: "VIP SLOTS", icon: "sparkles", gradient: "from-violet-500/25 to-purple-600/10", comingSoon: true },
  { id: "crown", name: "킹오브킹", eng: "KING OF KINGS", icon: "crown", gradient: "from-yellow-500/25 to-amber-600/10", comingSoon: true },
];

/** 스테이킹 풀 목업 — Pool 상태: OPEN/CLOSED/ACTIVE/FINISHED/SETTLING/SETTLED */
export const POOL_STATUS_META = {
  OPEN: { label: "모집중", tone: "emerald" },
  CLOSED: { label: "모집 마감", tone: "zinc" },
  ACTIVE: { label: "운영중", tone: "gold" },
  FINISHED: { label: "운영 종료", tone: "sky" },
  SETTLING: { label: "정산중", tone: "amber" },
  SETTLED: { label: "정산 완료", tone: "zinc" },
};

export const MOCK_POOLS = [
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
  },
  {
    id: "pool-elite-gamma",
    hostId: "host-003",
    hostName: "엘리트 하우스",
    name: "엘리트 감마 풀",
    description: "고액 전용 시즌 풀. 운영 종료 후 일괄 정산됩니다.",
    minAmountMicro: 1_000_000_000,
    maxAmountMicro: 50_000_000_000,
    earlyExitAllowed: false,
    status: "CLOSED",
    recruitmentEndsAt: Date.now() - 1000 * 60 * 60 * 5,
    participants: 12,
    totalStakedMicro: 46_000_000_000,
    capacityMicro: 50_000_000_000,
    weeklyReturnRate: "성과 보수형",
  },
];

/** 개발 모드 기본 사용자 — 서버 DEV_AUTH_BYPASS 정책과 동일하게 구성 */
export const DEV_USER = {
  telegramId: "dev-user-0001",
  username: "dev_player",
  displayName: "DEV 플레이어",
  balanceMicro: 1_250_350_000,
  role: "SUPER_ADMIN",
};
