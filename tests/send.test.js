const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const { validatePayload, buildMessage, sanitizeName } = require("../api/_telegram");
const handler = require("../api/send");

function mockRes() {
  const res = { statusCode: 0, body: null, headers: {} };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  return res;
}

let ipCounter = 0;
function mockReq(body, method = "POST") {
  ipCounter += 1;
  return { method, body, headers: { "x-forwarded-for": `10.0.0.${ipCounter}` } };
}

const originalFetch = global.fetch;
const originalEnv = { ...process.env };
const originalConsoleError = console.error;

beforeEach(() => {
  process.env.TELEGRAM_BOT_TOKEN = "test-token";
  process.env.TELEGRAM_CHAT_ID = "12345";
  console.error = () => {};
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env = { ...originalEnv };
  console.error = originalConsoleError;
});

test("validatePayload accepts a known time key and sanitizes the name", () => {
  const result = validatePayload({ name: "  <b>Madina</b> ", timeKey: "tomorrow", evasions: 3 });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { name: "bMadinab", timeKey: "tomorrow", evasions: 3 });
});

test("validatePayload rejects unknown time keys and non-object bodies", () => {
  assert.equal(validatePayload({ timeKey: "toString" }).ok, false);
  assert.equal(validatePayload({ timeKey: "never" }).ok, false);
  assert.equal(validatePayload(null).ok, false);
  assert.equal(validatePayload([]).ok, false);
});

test("validatePayload clamps evasions and ignores non-integers", () => {
  assert.equal(validatePayload({ timeKey: "weekend", evasions: 1e9 }).value.evasions, 999);
  assert.equal(validatePayload({ timeKey: "weekend", evasions: -4 }).value.evasions, 0);
  assert.equal(validatePayload({ timeKey: "weekend", evasions: "7" }).value.evasions, 0);
});

test("sanitizeName limits length and strips control characters", () => {
  assert.equal(sanitizeName("a".repeat(50)).length, 24);
  assert.equal(sanitizeName("Ma\u0000di\nna"), "Madina");
  assert.equal(sanitizeName("Madina   Aliyeva"), "Madina Aliyeva");
  assert.equal(sanitizeName(42), "");
});

test("buildMessage includes name, chosen time and evasion count", () => {
  const text = buildMessage({ name: "Madina", timeKey: "weekend", evasions: 7 }, new Date("2026-09-28T12:00:00Z"));
  assert.match(text, /Kimdan: Madina/);
  assert.match(text, /Uchrashuv vaqti: Shu dam olish kunlari/);
  assert.match(text, /7 marta quvladi/);
  assert.match(text, /28\.09\.2026, 17:00/);
});

test("buildMessage omits the evasion line when the button was never chased", () => {
  const text = buildMessage({ name: "", timeKey: "anytime", evasions: 0 });
  assert.match(text, /ism ko‘rsatilmagan/);
  assert.doesNotMatch(text, /quvladi/);
});

test("handler sends the message to Telegram and returns success", async () => {
  let call = null;
  global.fetch = async (url, options) => {
    call = { url, body: JSON.parse(options.body) };
    return { ok: true, status: 200, text: async () => "" };
  };

  const res = mockRes();
  await handler(mockReq({ name: "Madina", timeKey: "weekend", evasions: 2 }), res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true, data: null, error: null });
  assert.equal(call.url, "https://api.telegram.org/bottest-token/sendMessage");
  assert.equal(call.body.chat_id, "12345");
  assert.match(call.body.text, /Madina/);
});

test("handler parses a JSON string body", async () => {
  global.fetch = async () => ({ ok: true, status: 200, text: async () => "" });
  const res = mockRes();
  await handler(mockReq(JSON.stringify({ timeKey: "weekend" })), res);
  assert.equal(res.statusCode, 200);
});

test("handler rejects non-POST methods", async () => {
  const res = mockRes();
  await handler(mockReq(null, "GET"), res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, "POST");
});

test("handler returns 503 when the bot is not configured", async () => {
  delete process.env.TELEGRAM_BOT_TOKEN;
  const res = mockRes();
  await handler(mockReq({ timeKey: "weekend" }), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error, "not_configured");
});

test("handler returns 400 for an invalid payload", async () => {
  const res = mockRes();
  await handler(mockReq("{not json"), res);
  assert.equal(res.statusCode, 400);
});

test("handler returns 502 when Telegram rejects or is unreachable", async () => {
  global.fetch = async () => ({ ok: false, status: 400, text: async () => "chat not found" });
  const rejected = mockRes();
  await handler(mockReq({ timeKey: "weekend" }), rejected);
  assert.equal(rejected.statusCode, 502);
  assert.equal(rejected.body.error, "telegram_error");

  global.fetch = async () => { throw new Error("network down"); };
  const unreachable = mockRes();
  await handler(mockReq({ timeKey: "weekend" }), unreachable);
  assert.equal(unreachable.statusCode, 502);
  assert.equal(unreachable.body.error, "telegram_unreachable");
});

test("isRateLimited blocks after five requests from the same IP", () => {
  const ip = "192.168.1.1";
  const results = Array.from({ length: 6 }, () => handler.isRateLimited(ip, 1000));
  assert.deepEqual(results, [false, false, false, false, false, true]);
  assert.equal(handler.isRateLimited(ip, 1000 + 11 * 60 * 1000), false);
});
