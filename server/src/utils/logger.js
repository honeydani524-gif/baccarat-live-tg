/**
 * 구조화 로거 — 민감정보 마스킹 내장
 * token/secret/initData/serviceAccount 등은 절대 로그에 남기지 않습니다.
 */
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

let currentLevel = LEVELS.info;
export function setLogLevel(level) {
  if (LEVELS[level]) currentLevel = LEVELS[level];
}

const REDACT_KEYS = /token|secret|authorization|password|initData|private_key|service.?account/i;

function redact(value, depth = 0) {
  if (depth > 4 || value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = REDACT_KEYS.test(k) ? "[REDACTED]" : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

function write(level, args) {
  if (LEVELS[level] < currentLevel) return;
  const time = new Date().toISOString();
  const safeArgs = args.map((a) => (a instanceof Error ? { message: a.message, stack: a.stack } : redact(a)));
  // eslint-disable-next-line no-console
  console[level === "debug" ? "log" : level](`[${time}] [${level.toUpperCase()}]`, ...safeArgs);
}

export const logger = {
  debug: (...args) => write("debug", args),
  info: (...args) => write("info", args),
  warn: (...args) => write("warn", args),
  error: (...args) => write("error", args),
};
