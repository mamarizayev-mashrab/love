/**
 * Telegram bot orqali javob yuborish uchun sof (side-effect'siz) yordamchilar.
 * "_" bilan boshlangani uchun Vercel bu faylni alohida endpoint qilmaydi.
 */

const MAX_NAME_LENGTH = 24;
const MAX_EVASIONS = 999;

const TIME_OPTIONS = Object.freeze({
  weekend: "Shu dam olish kunlari ☕",
  tomorrow: "Ertaga kechqurun 🌅",
  anytime: "O‘zing aytgan paytda 🌸"
});

const ANSWERS = Object.freeze([
  "☕ Uchrashuvga: Jon deb, roziman! 🥰",
  "🌆 Joy: Sokin qahvaxonada 🍰",
  "💖 Ishonch: Albatta, kutaman! 🥰"
]);

function sanitizeName(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F<>{}[\]\\/`"=]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME_LENGTH);
}

/**
 * @param {unknown} body
 * @returns {{ ok: true, value: { name: string, timeKey: string, evasions: number } } | { ok: false, error: string }}
 */
function validatePayload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "invalid_body" };
  }

  const { name, timeKey, evasions } = body;

  if (typeof timeKey !== "string" || !Object.prototype.hasOwnProperty.call(TIME_OPTIONS, timeKey)) {
    return { ok: false, error: "invalid_time" };
  }

  const evasionCount = Number.isInteger(evasions) ? Math.min(Math.max(evasions, 0), MAX_EVASIONS) : 0;

  return {
    ok: true,
    value: { name: sanitizeName(name), timeKey, evasions: evasionCount }
  };
}

/**
 * @param {{ name: string, timeKey: string, evasions: number }} payload
 * @param {Date} [now]
 * @returns {string}
 */
function buildMessage(payload, now = new Date()) {
  const sentAt = now.toLocaleString("ru-RU", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const lines = [
    "💌 Taklifingga javob keldi!",
    "",
    `👤 Kimdan: ${payload.name || "ism ko‘rsatilmagan"}`,
    ...ANSWERS,
    `📅 Uchrashuv vaqti: ${TIME_OPTIONS[payload.timeKey]}`
  ];

  if (payload.evasions > 0) {
    lines.push(`🏃 «Yo‘q» tugmasini ${payload.evasions} marta quvladi 😄`);
  }

  lines.push("", `🕒 ${sentAt} (Toshkent)`);
  return lines.join("\n");
}

module.exports = { TIME_OPTIONS, validatePayload, buildMessage, sanitizeName };
