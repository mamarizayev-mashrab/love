/**
 * POST /api/send — qizning javobini Telegram bot orqali egasiga yuboradi.
 * Kerakli environment o'zgaruvchilari (Vercel → Settings → Environment Variables):
 *   TELEGRAM_BOT_TOKEN — @BotFather bergan token
 *   TELEGRAM_CHAT_ID   — xabar boradigan chat ID (sizning shaxsiy ID'ingiz)
 */

const { validatePayload, buildMessage } = require("./_telegram");

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const TELEGRAM_TIMEOUT_MS = 8000;

// Best-effort limit: serverless instansiya yashab turguncha ishlaydi
const hits = new Map();

function isRateLimited(ip, now = Date.now()) {
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  const limited = recent.length >= RATE_LIMIT_MAX;
  hits.set(ip, limited ? recent : [...recent, now]);
  return limited;
}

function send(res, status, success, error = null) {
  res.status(status).json({ success, data: null, error });
}

function parseBody(body) {
  if (typeof body !== "string") return body;
  try {
    return JSON.parse(body);
  } catch (err) {
    return null;
  }
}

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, false, "method_not_allowed");
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[api/send] TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan");
    return send(res, 503, false, "not_configured");
  }

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return send(res, 429, false, "too_many_requests");
  }

  const validation = validatePayload(parseBody(req.body));
  if (!validation.ok) {
    return send(res, 400, false, validation.error);
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: buildMessage(validation.value) }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS)
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error(`[api/send] Telegram xatosi ${response.status}: ${details.slice(0, 300)}`);
      return send(res, 502, false, "telegram_error");
    }

    return send(res, 200, true);
  } catch (err) {
    console.error("[api/send] Telegram'ga ulanib bo'lmadi:", err && err.message);
    return send(res, 502, false, "telegram_unreachable");
  }
}

module.exports = handler;
module.exports.isRateLimited = isRateLimited;
