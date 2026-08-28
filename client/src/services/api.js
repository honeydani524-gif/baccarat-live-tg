/**
 * API Service Layer
 * - 모든 Backend 통신의 단일 진입점입니다.
 * - 서버 응답 규약: { success: true, data } | { success: false, error: { code, message } }
 * - 서버 미연결(네트워크 오류) 시 개발용 Mock 폴백이 동작합니다.
 *   (HTTP 오류 응답은 Mock으로 대체하지 않고 그대로 throw 합니다)
 */
import { MOCK_ROOMS, MOCK_POOLS, MOCK_CURRENT_ROUND, mockStreamsFor, DEV_USER } from "./mockData.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
    this.isNetwork = false;
  }
}

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
  try {
    if (token) localStorage.setItem("bltg_token", token);
  } catch (_) {
    /* noop */
  }
}
export function getAuthToken() {
  if (authToken) return authToken;
  try {
    authToken = localStorage.getItem("bltg_token");
  } catch (_) {
    /* noop */
  }
  return authToken;
}
export function getBaseUrl() {
  return BASE_URL;
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = auth ? getAuthToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const e = new ApiError("NETWORK_ERROR", "서버에 연결할 수 없습니다.", 0);
    e.isNetwork = true;
    throw e;
  }

  let json = null;
  try {
    json = await res.json();
  } catch (_) {
    throw new ApiError("INVALID_RESPONSE", "서버 응답을 해석할 수 없습니다.", res.status);
  }
  if (!res.ok || json?.success === false) {
    const err = json?.error || {};
    throw new ApiError(err.code || `HTTP_${res.status}`, err.message || "요청이 실패했습니다.", res.status);
  }
  return json.data;
}

const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms));
const clone = (v) => (typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

/** 서버 오프라인일 때만 Mock으로 대체 실행 */
async function withMock(liveFn, mockFn) {
  try {
    return await liveFn();
  } catch (e) {
    if (e?.isNetwork) {
      console.warn("[api] 서버 오프라인 — Mock 데이터로 대체합니다.");
      await delay();
      return mockFn();
    }
    throw e;
  }
}

let mockBalance = DEV_USER.balanceMicro;

export const api = {
  // ---------- Auth ----------
  auth: {
    telegram: (payload) =>
      withMock(
        () => request("/api/auth/telegram", { method: "POST", body: payload, auth: false }),
        () => ({ token: "dev-token", user: clone(DEV_USER) })
      ),
    me: () => withMock(() => request("/api/auth/me"), () => ({ user: { ...clone(DEV_USER), balanceMicro: mockBalance } })),
  },

  // ---------- Rooms ----------
  rooms: {
    list: () => withMock(() => request("/api/rooms"), () => ({ rooms: clone(MOCK_ROOMS) })),
    get: (roomId) =>
      withMock(
        () => request(`/api/rooms/${roomId}`),
        () => {
          const room = MOCK_ROOMS.find((r) => r.id === roomId) || MOCK_ROOMS[0];
          return { room: clone(room) };
        }
      ),
    currentRound: (roomId) =>
      withMock(() => request(`/api/rooms/${roomId}/current-round`), () => ({ round: clone(MOCK_CURRENT_ROUND) })),
    streams: (roomId) =>
      withMock(() => request(`/api/rooms/${roomId}/streams`), () => ({ streams: mockStreamsFor(roomId) })),
  },

  // ---------- Betting ----------
  bets: {
    place: (roomId, payload) =>
      withMock(
        () => request(`/api/rooms/${roomId}/bets`, { method: "POST", body: payload }),
        () => {
          const total = payload.bets.reduce((s, b) => s + b.amountMicro, 0);
          mockBalance = Math.max(0, mockBalance - total);
          return {
            bet: {
              id: `bet_mock_${Date.now()}`,
              roomId,
              status: "ACCEPTED",
              bets: payload.bets,
              totalMicro: total,
              createdAt: Date.now(),
            },
            balanceMicro: mockBalance,
          };
        }
      ),
    cancel: (roomId, betId) =>
      withMock(
        () => request(`/api/rooms/${roomId}/bets/${betId}`, { method: "DELETE" }),
        () => ({ cancelled: true, betId })
      ),
  },

  // ---------- Staking ----------
  staking: {
    pools: () => withMock(() => request("/api/staking/pools"), () => ({ pools: clone(MOCK_POOLS) })),
    pool: (poolId) =>
      withMock(
        () => request(`/api/staking/pools/${poolId}`),
        () => ({ pool: clone(MOCK_POOLS.find((p) => p.id === poolId) || MOCK_POOLS[0]) })
      ),
    join: (poolId, payload) =>
      withMock(
        () => request(`/api/staking/pools/${poolId}/join`, { method: "POST", body: payload }),
        () => ({ joined: true, poolId, amountMicro: payload.amountMicro })
      ),
    create: (payload) => request("/api/staking/pools", { method: "POST", body: payload }),
  },

  // ---------- Deposit / Withdrawal ----------
  deposits: {
    create: (payload) =>
      withMock(() => request("/api/deposits", { method: "POST", body: payload }), () => ({
        deposit: { id: `dep_mock_${Date.now()}`, status: "PENDING", ...payload },
      })),
    my: () => withMock(() => request("/api/deposits/my"), () => ({ deposits: [] })),
  },
  withdrawals: {
    create: (payload) =>
      withMock(() => request("/api/withdrawals", { method: "POST", body: payload }), () => ({
        withdrawal: { id: `wd_mock_${Date.now()}`, status: "PENDING", ...payload },
      })),
    my: () => withMock(() => request("/api/withdrawals/my"), () => ({ withdrawals: [] })),
  },

  // ---------- Admin ----------
  admin: {
    settings: () =>
      withMock(
        () => request("/api/admin/settings"),
        () => ({
          settings: {
            minBetMicro: 1_000_000,
            maxBetMicro: 500_000_000,
            commissionBps: 500,
            maintenanceMode: false,
            minStakeMicro: 100_000_000,
            maxStakeMicro: 5_000_000_000,
          },
        })
      ),
    updateSettings: (payload) =>
      withMock(() => request("/api/admin/settings", { method: "PUT", body: payload }), () => ({
        settings: payload,
        updatedAt: Date.now(),
      })),
  },
};
