/** /withdraw — 출금 안내 (2차: 미니앱 → 출금 요청 API) */
export function registerWithdraw(bot) {
  bot.command("withdraw", async (ctx) => {
    await ctx.replyWithHTML(
      [
        "🏦 <b>출금 안내</b>",
        "",
        "출금은 미니앱 [내정보 → 출금]에서 요청하실 수 있습니다.",
        "최소 출금 금액: 10 USDT",
        "",
        "<i>해당 기능은 현재 개발 중입니다.</i>",
      ].join("\n")
    );
  });
}
