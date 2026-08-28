/** /history — 이용 내역 (2차: 베팅/입출금/스테이킹 내역) */
export function registerHistory(bot) {
  bot.command("history", async (ctx) => {
    await ctx.replyWithHTML(
      [
        "📜 <b>이용 내역</b>",
        "",
        "베팅 / 충전 / 출금 / 스테이킹 내역 조회 기능은",
        "현재 개발 중입니다.",
      ].join("\n")
    );
  });
}
