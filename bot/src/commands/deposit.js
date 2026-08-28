/** /deposit — 충전 안내 (입금 주소는 환경변수로만 관리) */
export function registerDeposit(bot) {
  bot.command("deposit", async (ctx) => {
    const address = process.env.PLATFORM_WALLET_ADDRESS;
    const network = process.env.PLATFORM_WALLET_NETWORK || "TRC-20";

    const lines = [
      "💰 <b>충전 안내</b>",
      "",
      address
        ? `입금 주소 (${network})\n<code>${address}</code>`
        : "입금 주소가 아직 등록되지 않았습니다. 고객센터로 문의해 주세요.",
      "",
      "⚠️ 입금 확인 후 잔액에 반영됩니다.",
      "⚠️ 반드시 동일 네트워크로만 전송해 주세요.",
      "",
      "<i>자동 충전 기능은 현재 개발 중입니다.</i>",
    ];
    await ctx.replyWithHTML(lines.join("\n"));
  });
}
