/**
 * BaccaratLive TG Bot 엔트리
 * - Bot Token은 반드시 환경변수(TELEGRAM_BOT_TOKEN)로만 관리합니다.
 */
import dotenv from "dotenv";
import { Telegraf } from "telegraf";

import { registerStart } from "./commands/start.js";
import { registerPlay } from "./commands/play.js";
import { registerDeposit } from "./commands/deposit.js";
import { registerWithdraw } from "./commands/withdraw.js";
import { registerMyWallet } from "./commands/mywallet.js";
import { registerHistory } from "./commands/history.js";
import { registerAdminHandler } from "./handlers/adminHandler.js";
import { initNotifyService } from "./services/notifyService.js";
import { initStreamService, subscribeStreams } from "./services/streamService.js";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("[bot] TELEGRAM_BOT_TOKEN 환경변수가 필요합니다. (.env.example 참조)");
  process.exit(1);
}

const bot = new Telegraf(token);

// 명령어 등록
registerStart(bot);
registerPlay(bot);
registerDeposit(bot);
registerWithdraw(bot);
registerMyWallet(bot);
registerHistory(bot);
registerAdminHandler(bot);

// 서비스 초기화
initNotifyService(bot);
initStreamService(bot);
subscribeStreams(bot);

// 공통 에러 로깅 — 민감정보는 출력하지 않습니다
bot.catch((err, ctx) => {
  console.error(`[bot] 처리 오류 (updateType=${ctx.updateType}):`, err.message);
});

bot.telegram
  .getMe()
  .then((me) => console.log(`[bot] BaccaratLive TG Bot 시작: @${me.username}`))
  .catch(() => console.log("[bot] 시작 중..."));

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
