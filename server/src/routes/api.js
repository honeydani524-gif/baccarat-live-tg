/**
 * API 라우트 정의
 * 모든 보호 경로는 requireAuth, 관리 경로는 requireRole로 제어합니다.
 */
import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { rateLimit } from "../middlewares/rateLimiter.js";

import { telegramLogin, me } from "../controllers/authController.js";
import { listRooms, getRoomById, currentRound } from "../controllers/roomController.js";
import { placeBet, cancelBet } from "../controllers/betController.js";
import { closeBetting, confirmResult, nextRound } from "../controllers/gameController.js";
import { getRoomStreams, updateRoomStreams } from "../controllers/streamController.js";
import { listPools, getPoolById, createPool, joinPool } from "../controllers/stakingController.js";
import { createDeposit, myDeposits } from "../controllers/depositController.js";
import { createWithdrawal, myWithdrawals } from "../controllers/withdrawalController.js";
import { getSettings, updateSettings } from "../controllers/adminSettingsController.js";

const router = Router();

// ---------- 인증 ----------
router.post("/auth/telegram", rateLimit({ windowMs: 60_000, max: 20, key: "auth" }), telegramLogin);
router.get("/auth/me", requireAuth, me);

// ---------- 게임방 ----------
router.get("/rooms", listRooms);
router.get("/rooms/:roomId", getRoomById);
router.get("/rooms/:roomId/current-round", currentRound);
router.get("/rooms/:roomId/streams", getRoomStreams);
router.put("/rooms/:roomId/streams", requireAuth, requireRole("DEALER"), updateRoomStreams);

// ---------- 딜러 라운드 운영 ----------
router.post("/rooms/:roomId/dealer/close-betting", requireAuth, requireRole("DEALER"), closeBetting);
router.post("/rooms/:roomId/dealer/confirm-result", requireAuth, requireRole("DEALER"), confirmResult);
router.post("/rooms/:roomId/dealer/next-round", requireAuth, requireRole("DEALER"), nextRound);

// ---------- 베팅 ----------
router.post("/rooms/:roomId/bets", requireAuth, rateLimit({ windowMs: 5_000, max: 10, key: "bet" }), placeBet);
router.delete("/rooms/:roomId/bets/:betId", requireAuth, cancelBet);

// ---------- 스테이킹 ----------
router.get("/staking/pools", listPools);
router.get("/staking/pools/:poolId", getPoolById);
router.post("/staking/pools", requireAuth, requireRole("ADMIN"), createPool);
router.post("/staking/pools/:poolId/join", requireAuth, joinPool);

// ---------- 충전 / 출금 ----------
router.post("/deposits", requireAuth, rateLimit({ windowMs: 60_000, max: 5, key: "deposit" }), createDeposit);
router.get("/deposits/my", requireAuth, myDeposits);
router.post("/withdrawals", requireAuth, rateLimit({ windowMs: 60_000, max: 5, key: "withdraw" }), createWithdrawal);
router.get("/withdrawals/my", requireAuth, myWithdrawals);

// ---------- 관리자 설정 ----------
router.get("/admin/settings", requireAuth, requireRole("ADMIN"), getSettings);
router.put("/admin/settings", requireAuth, requireRole("ADMIN"), updateSettings);

export default router;
