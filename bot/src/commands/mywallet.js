/** /mywallet — 잔액 조회 (2차: users/{telegramId} balanceMicro 표시) */
export function registerMyWallet(bot) {
  bot.command("mywallet", async (ctx) => {
    await ctx.replyWithHTML(
      [
        "👛 <b>내 지갑</b>",
        "",
        "잔액 조회 기능은 현재 개발 중입니다.",
        "미니앱 상단에서 실시간 잔액을 확인하실 수 있습니다.",
      ].join("\n")
    );
  });
}
