import { Markup } from "telegraf";

const miniAppUrl = () => process.env.MINI_APP_URL || "https://t.me/your_bot/app";

/** /start — 서비스 소개 + Mini App 진입 버튼 */
export function registerStart(bot) {
  bot.start(async (ctx) => {
    const name = ctx.from?.first_name || "플레이어";
    await ctx.replyWithHTML(
      [
        `🎩 <b>BaccaratLive TG</b>에 오신 것을 환영합니다, ${name}님!`,
        "",
        "실시간 라이브 바칸 테이블과 스테이킹 풀을",
        "Telegram Mini App에서 바로 이용하실 수 있습니다.",
        "",
        "명령어 안내",
        "/play — 미니앱 실행",
        "/deposit — 충전 안내",
        "/withdraw — 출금 안내",
        "/mywallet — 내 지갑",
        "/history — 이용 내역",
      ].join("\n"),
      Markup.inlineKeyboard([[Markup.button.webApp("🎰 BACCARAT LIVE 시작하기", miniAppUrl())]])
    );
  });
}
