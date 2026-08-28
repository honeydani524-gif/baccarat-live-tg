/**
 * 스트림 알림 서비스 (Skeleton)
 * - stream_updated 이벤트 발생 시 구독자에게 LIVE 시작 알림을 발송합니다.
 */
let botRef = null;
const subscribers = new Set();

export function initStreamService(bot) {
  botRef = bot;
}

export function subscribeStreams(bot) {
  bot.command("notify", async (ctx) => {
    const id = String(ctx.from?.id ?? "");
    if (subscribers.has(id)) {
      subscribers.delete(id);
      return ctx.reply("🔕 LIVE 알림을 해지했습니다.");
    }
    subscribers.add(id);
    return ctx.reply("🔔 LIVE 시작 알림을 구독했습니다.");
  });
}

/** server → bot 연동 지점 (2차: RTDB live/rooms 감시 또는 남납 webhook) */
export async function announceStreamLive(roomName) {
  if (!botRef) return;
  const tasks = [...subscribers].map((id) =>
    botRef.telegram
      .sendMessage(id, `🔴 <b>${roomName}</b> LIVE가 시작되었습니다! /play 로 입장하세요.`, { parse_mode: "HTML" })
      .catch(() => {})
  );
  await Promise.allSettled(tasks);
}
