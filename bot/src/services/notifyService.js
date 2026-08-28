/**
 * 알림 서비스 (Skeleton)
 * - 입출금 승인 결과, 베팅 정산 완료 등의 푸시에 사용됩니다.
 * - server 측에서 남납 API를 통해 이 서비스를 호출하거나,
 *   봇 프로세스가 이벤트 큐를 구독하는 방식으로 연결합니다 (2차 결정).
 */
let botRef = null;

export function initNotifyService(bot) {
  botRef = bot;
}

/** 특정 유저에게 알림 — 실패필드는 로그만 남기고 전체 플로우를 막지 않습니다 */
export async function notifyUser(telegramId, html) {
  if (!botRef) return false;
  try {
    await botRef.telegram.sendMessage(telegramId, html, { parse_mode: "HTML" });
    return true;
  } catch (err) {
    console.warn("[notify] 전송 실패:", err.message);
    return false;
  }
}

export async function notifyBalanceUpdated(telegramId, displayAmount) {
  return notifyUser(telegramId, `💳 잔액이 갱신되었습니다: <b>${displayAmount} USDT</b>`);
}
