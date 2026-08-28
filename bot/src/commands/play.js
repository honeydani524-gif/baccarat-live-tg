import { Markup } from "telegraf";

const miniAppUrl = () => process.env.MINI_APP_URL || "https://t.me/your_bot/app";

/** /play — Telegram Mini App 실행 버튼 */
export function registerPlay(bot) {
  bot.command("play", async (ctx) => {
    await ctx.replyWithHTML(
      [
        "🔴 <b>LIVE 테이블이 진행 중입니다.</b>",
        "",
        "아래 버튼을 눌러 미니앱을 실행하세요.",
      ].join("\n"),
      Markup.inlineKeyboard([[Markup.button.webApp("▶️ PLAY NOW", miniAppUrl())]])
    );
  });
}
