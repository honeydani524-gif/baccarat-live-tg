/**
 * 정산 엔진 (Skeleton)
 * - 결과 플래그(result flags) 기반으로만 정산합니다. 카드 입력/덱/셔플은 존재하지 않습니다.
 * - 모든 금액은 micro 정수, 배당은 정수 비율로 계산합니다.
 * - 실제 잔액 반영은 반드시 Firestore Transaction으로 수행해야 합니다. (2차 구현)
 */
import { payoutMicro } from "./moneyUtil.js";

/** 배당률 테이블 — [분자, 분모] (BANKER 0.95:1 → 95/100) */
export const ODDS = {
  PLAYER: [1, 1],
  BANKER: [95, 100],
  TIE: [8, 1],
  PLAYER_PAIR: [11, 1],
  BANKER_PAIR: [11, 1],
  DRAGON7: [40, 1],
  PANDA8: [25, 1],
};

/**
 * 단일 베팅이 이겼는지 판정
 * @param {string} type 베팅 타입
 * @param {object} result { dragon7, panda8, playerPair, tie, bankerPair, player, banker }
 */
export function isWin(type, result) {
  switch (type) {
    case "PLAYER":
      return Boolean(result.player) && !result.tie;
    case "BANKER":
      return Boolean(result.banker) && !result.tie;
    case "TIE":
      return Boolean(result.tie);
    case "PLAYER_PAIR":
      return Boolean(result.playerPair);
    case "BANKER_PAIR":
      return Boolean(result.bankerPair);
    case "DRAGON7":
      return Boolean(result.banker) && Boolean(result.dragon7);
    case "PANDA8":
      return Boolean(result.player) && Boolean(result.panda8);
    default:
      return false;
  }
}

/**
 * 베팅 목록 정산 계산
 * @param {Array<{type:string, amountMicro:number}>} bets
 * @param {object} result 결과 플래그
 * @returns {{ outcomes: Array, totalStakeMicro:number, totalPayoutMicro:number, totalProfitMicro:number }}
 */
export function computeSettlement(bets, result) {
  const outcomes = bets.map((b) => {
    const won = isWin(b.type, b.type in ODDS ? result : result);
    // TIE 시 PLAYER/BANKER는 푸시(원금 반환)
    const push = result.tie && (b.type === "PLAYER" || b.type === "BANKER");
    let payout = 0;
    if (won) {
      const [num, den] = ODDS[b.type];
      payout = b.amountMicro + payoutMicro(b.amountMicro, num, den);
    } else if (push) {
      payout = b.amountMicro;
    }
    return {
      type: b.type,
      stakeMicro: b.amountMicro,
      status: won ? "WIN" : push ? "PUSH" : "LOSE",
      payoutMicro: payout,
      profitMicro: payout - b.amountMicro,
    };
  });

  const totalStakeMicro = outcomes.reduce((s, o) => s + o.stakeMicro, 0);
  const totalPayoutMicro = outcomes.reduce((s, o) => s + o.payoutMicro, 0);

  return {
    outcomes,
    totalStakeMicro,
    totalPayoutMicro,
    totalProfitMicro: totalPayoutMicro - totalStakeMicro,
  };
}

/**
 * TODO(2차): 라운드 정산 트랜잭션
 * 1. rounds/{roundId} status가 RESULT_PENDING인지 확인
 * 2. bets 컬렉션 조회 후 computeSettlement
 * 3. db.runTransaction으로 사용자별 payoutMicro 일괄 반영 + 베팅 상태 SETTLED
 * 4. Socket 'settlement_done' + 'balance_updated' 발행
 */
export async function settleRoundWithTransaction(/* db, roundId, result */) {
  throw new Error("NOT_IMPLEMENTED — 2차 단계에서 Firestore Transaction으로 구현");
}
