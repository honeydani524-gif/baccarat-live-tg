import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../services/api.js";
import LiveRoomCard from "../components/LiveRoomCard.jsx";

/**
 * LIVE 로비 — 진행 중인 게임방 목록
 * 서버 오프라인 시 Mock + 로컬 타이머 사이클(38s)로 라이브 현황을 시뮬레이션합니다.
 */

function useLobbyCycle(rooms) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const map = {};
    rooms.forEach((room, idx) => {
      let hash = 0;
      for (const ch of room.id) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
      const t = (now + hash) % 38;
      if (room.status === "PREPARING") {
        map[room.id] = { status: "PREPARING", secondsLeft: null };
      } else if (t < 30) {
        map[room.id] = { status: "BETTING", secondsLeft: 30 - t };
      } else if (t < 34) {
        map[room.id] = { status: "CLOSED", secondsLeft: null };
      } else {
        map[room.id] = { status: "RESULT_PENDING", secondsLeft: null };
      }
    });
    return map;
  }, [rooms, now]);
}

export default function LiveLobby() {
  const [rooms, setRooms] = useState([]);
  const cycle = useLobbyCycle(rooms);

  useEffect(() => {
    let mounted = true;
    api.rooms
      .list()
      .then((data) => {
        if (mounted) setRooms(data.rooms.filter((r) => r.isActive));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const liveRooms = useMemo(
    () => rooms.map((r) => ({ ...r, status: cycle[r.id]?.status || r.status })),
    [rooms, cycle]
  );

  return (
    <div className="px-4 pb-6 pt-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-end justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.3em] text-banker">
              <span className="animate-live-pulse h-1.5 w-1.5 rounded-full bg-banker" />
              LIVE NOW
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-wide text-zinc-50">LIVE TABLES</h1>
          </div>
          <span className="rounded-full border border-line bg-card px-3 py-1.5 text-[11px] font-bold text-zinc-400">
            <span className="tabular text-gold">{liveRooms.length}</span> TABLES
          </span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">실시간 스튜디오 바칸테이블에 입장하세요.</p>
      </motion.div>

      <div className="mt-5 space-y-4">
        {liveRooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i }}
          >
            <LiveRoomCard room={room} secondsLeft={cycle[room.id]?.secondsLeft} />
          </motion.div>
        ))}
        {liveRooms.length === 0 && (
          <div className="rounded-2xl border border-line bg-card p-4">
            <div className="shimmer h-40 w-full rounded-xl" />
          </div>
        )}
      </div>
    </div>
  );
}
