/**
 * 관리자 핸들러 (Skeleton)
 * - ADMIN_TELEGRAM_IDS 환경변수 기반으로 접근 제한합니다.
 * - 2차: 입출금 승인, 공지 발송, 통계 조회 등을 추가합니다.
 */
const adminIds = () =>
  (process.env.ADMIN_TELEGRAM_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function registerAdminHandler(bot) {
  bot.command("admin", async (ctx) => {
    const id = String(ctx.from?.id ?? "");
    if (!adminIds().includes(id)) {
      return ctx.reply("⛔ 관리자 전용 명령어입니다.");
    }
    // TODO(2차): 대기 중인 입금/출금 건수, 유저 수 등 서버 API 연동
    return ctx.replyWithHTML(
      [
        "🛠 <b>관리자 패널</b>",
        "",
        "• 입금 대기: 서버 API 연동 예정",
        "• 출금 대기: 서버 API 연동 예정",
        "• 공지 발송: /notice (예정)",
        "",
        "<i>관리 명령어는 현재 개발 중입니다.</i>",
      ].join("\n")
    );
  });
}
