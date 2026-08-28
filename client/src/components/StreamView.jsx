import { VideoOff, Cctv } from "lucide-react";

/**
 * 스트리밍 뷰
 * 보호 규칙: 메인 스트림 위에 어떤 어두운 오버레이/색상 필터/베팅 UI도 얹지 않습니다.
 * - URL이 있으면 iframe 플레이어, 없으면 썸네일 플레이스홀더
 * - 스트림 URL은 RTDB(live/rooms/{roomId})에서만 수신합니다.
 */
export default function StreamView({ stream, title, rounded = "rounded-xl", className = "" }) {
  const isLive = stream?.isLive;

  return (
    <div className={`relative aspect-video w-full overflow-hidden ${rounded} border border-line bg-black ${className}`}>
      {stream?.url && stream?.type === "iframe" ? (
        <iframe
          src={stream.url}
          title={title}
          className="h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : isLive && stream?.thumbnail ? (
        <img src={stream.thumbnail} alt={title} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface">
          <VideoOff className="h-6 w-6 text-zinc-600" />
          <span className="text-[11px] font-medium tracking-widest text-zinc-500">SIGNAL LOST</span>
        </div>
      )}

      {/* 상태 배지 (오버레이 아님 — 코너 칩만 사용) */}
      <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
        {isLive ? (
          <span className="flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[10px] font-extrabold tracking-widest text-white">
            <span className="animate-live-pulse h-1.5 w-1.5 rounded-full bg-banker" />
            LIVE
          </span>
        ) : (
          <span className="rounded-md bg-black/55 px-2 py-1 text-[10px] font-bold tracking-widest text-zinc-400">OFFLINE</span>
        )}
      </div>
      <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[9px] font-semibold tracking-widest text-zinc-300">
        <Cctv className="h-3 w-3" />
        {title}
      </div>
    </div>
  );
}
