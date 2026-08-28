import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, Clock, ShieldCheck } from "lucide-react";

/**
 * 고객센터 — Telegram 1:1 문의 + FAQ
 * 운영 계정은 VITE_SUPPORT_USERNAME 환경변수로 관리합니다.
 */
const FAQS = [
  {
    q: "충전은 어떻게 하나요?",
    a: "고객센터로 문의하시면 전용 입금 주소(TRC-20)를 안내해 드립니다. 입금 확인 후 잔액에 자동 반영됩니다.",
  },
  {
    q: "출금은 얼마나 걸리나요?",
    a: "출금 요청 후 운영팀 검토를 거쳐 처리됩니다. 보통 30분 이내 완료되며, 대량 요청 시 다소 지연될 수 있습니다.",
  },
  {
    q: "베팅 취소가 가능한가요?",
    a: "최종 베팅 확정 전까지 수정이 가능합니다. 확정 이후 취소는 베팅 마감 전에만 가능하며, 마감 후에는 불가합니다.",
  },
  {
    q: "스테이킹 조기 출금 규정이 궁금해요.",
    a: "풀마다 조기 출금 허용 여부와 수수료가 다릅니다. 각 풀의 상세 페이지에서 '조기 출금' 항목을 확인해 주세요.",
  },
];

export default function SupportPage() {
  const [openIdx, setOpenIdx] = useState(0);
  const username = import.meta.env.VITE_SUPPORT_USERNAME || "baccarat_support";

  return (
    <div className="space-y-4 px-4 pb-6 pt-5">
      <div>
        <p className="text-[10px] font-extrabold tracking-[0.3em] text-tie">SUPPORT</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-wide text-zinc-50">고객센터</h1>
        <p className="mt-2 text-xs text-zinc-500">24시간 운영팀이 답변드립니다.</p>
      </div>

      {/* Telegram 문의 */}
      <motion.a
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        href={`https://t.me/${username}`}
        target="_blank"
        rel="noreferrer"
        className="btn-gold flex items-center justify-between rounded-2xl p-4"
      >
        <div>
          <p className="text-[13px] font-extrabold">Telegram 1:1 문의</p>
          <p className="text-[11px] font-semibold opacity-75">@{username}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/20">
          <Send className="h-4.5 w-4.5 h-[18px] w-[18px]" />
        </span>
      </motion.a>

      {/* 운영 안내 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-line bg-card p-3.5">
          <Clock className="h-4 w-4 text-gold" />
          <p className="mt-2 text-xs font-extrabold text-zinc-200">운영 시간</p>
          <p className="mt-0.5 text-[11px] text-zinc-500">연중무휴 24시간</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-3.5">
          <ShieldCheck className="h-4 w-4 text-tie" />
          <p className="mt-2 text-xs font-extrabold text-zinc-200">보안 안내</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">운영팀은 절대 비밀번호를 요구하지 않습니다.</p>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <p className="mb-2 text-xs font-extrabold text-zinc-300">자주 묻는 질문</p>
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          {FAQS.map((f, i) => (
            <div key={f.q} className={i === FAQS.length - 1 ? "" : "border-b border-line"}>
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
              >
                <span className="text-[13px] font-bold text-zinc-100">{f.q}</span>
                <motion.span animate={{ rotate: openIdx === i ? 180 : 0 }}>
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-xs leading-relaxed text-zinc-400">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
