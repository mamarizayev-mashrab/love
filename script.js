/**
 * ==========================================================================
 * ROMANTIK WEB-TAKLIF SAHIFASI — ASOSIY SKRIPT
 * Ko'p bosqichli savollar, qochadigan inkor tugmasi,
 * Adele — Lovesong (20-sekunddan), konfetti va javobni Telegram bot orqali yuborish.
 * ==========================================================================
 */

// Bot ishlamasa, zaxira sifatida ochiladigan Telegram profil
const TELEGRAM_USERNAME = "eskidasturchi";

const AUDIO_START_SECONDS = 20;
const AUDIO_VOLUME = 0.85;
const MAX_NAME_LENGTH = 24;
const MAX_YES_SCALE = 1.12;
const YES_SCALE_STEP = 0.03;
const EVADE_COOLDOWN_MS = 220;
const VIEWPORT_MARGIN = 16;
const DEFAULT_TIME = "Shu dam olish kunlari ☕";
const DEFAULT_TIME_KEY = "weekend";
const SEND_ENDPOINT = "/api/send";
const SEND_TIMEOUT_MS = 10000;

const QUESTIONS = [
  {
    badge: "1/3 savol",
    title: (name) => (name ? `${name}, birga uchrashuvga chiqamizmi? ☕` : "Birga uchrashuvga chiqamizmi? ☕"),
    subtitle: "Bir piyola issiq qahva ichib, dildan suhbatlashsak degandim...",
    yesText: "Jon deb, roziman! 🥰",
    noText: "Yo‘q, vaqtim yo‘q 🙈",
    icon: "☕"
  },
  {
    badge: "2/3 savol",
    title: () => "Qayerda ko‘rishsak senga yoqadi? 🌆",
    subtitle: "Senga yoqadigan eng shinam va chiroyli maskanni tanlaymiz",
    yesText: "Sokin qahvaxonada 🍰",
    noText: "Hech qayerda 🏃",
    icon: "🌆"
  },
  {
    badge: "3/3 savol",
    title: () => "Uchrashuvimiz ajoyib o‘tishiga ishonasanmi? ✨",
    subtitle: "Eng chiroyli lahzalar sen bilan o‘tadigan daqiqalar bo‘ladi...",
    yesText: "Albatta, kutaman! 🥰",
    noText: "Yo‘q, ishonmayman 😜",
    icon: "💖"
  }
];

const EVADE_TEXTS = [
  "Qo‘ling tegmadi-ku 😜",
  "Qochdim! 💨",
  "Ushlay olmaysan 🙈",
  "Faqat rozilik mumkin 🥰",
  "Baribir «Ha» deysan 😉",
  "Yana urinib ko‘r 🌸",
  "Menga yetolmaysan 🏃",
  "Bunaqasi ketmaydi 🙃",
  "Xo‘sh, rozimisan? ✨"
];

/** URL'dan ismni xavfsiz o'qiydi (?name=, ?kimga=, ?ism=). */
function readPersonalizedName() {
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get("name") || params.get("kimga") || params.get("ism") || "")
    .replace(/[<>{}[\]\\/`"=]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME_LENGTH);

  if (!raw) return "";
  return raw.charAt(0).toLocaleUpperCase("uz") + raw.slice(1);
}

function triggerHaptic(pattern) {
  if (typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch (err) {
    // Ba'zi brauzerlar tebranishni taqiqlaydi — bu kritik emas
  }
}

function restartAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth; // reflow — animatsiyani qayta ishga tushirish uchun
  element.classList.add(className);
}

document.addEventListener("DOMContentLoaded", () => {
  const el = {
    card: document.getElementById("proposalCard"),
    badgeText: document.getElementById("badgeText"),
    title: document.getElementById("proposalTitle"),
    subtitle: document.getElementById("proposalSubtitle"),
    buttonsArea: document.getElementById("buttonsArea"),
    yesBtn: document.getElementById("yesBtn"),
    yesBtnText: document.getElementById("yesBtnText"),
    noBtn: document.getElementById("noBtn"),
    noBtnText: document.getElementById("noBtnText"),
    timeOptions: document.getElementById("timeOptions"),
    timeChips: Array.from(document.querySelectorAll(".time-chip")),
    finalActions: document.getElementById("finalActions"),
    sendBtn: document.getElementById("sendBtn"),
    sendBtnLabel: document.getElementById("sendBtnLabel"),
    footerHint: document.getElementById("footerHint"),
    heartsBg: document.getElementById("heartsBg"),
    audio: document.getElementById("bgAudio"),
    canvas: document.getElementById("confettiCanvas")
  };

  const userName = readPersonalizedName();
  const confetti = createConfetti(el.canvas);
  const music = createMusic(el.audio);

  let currentStep = 0;
  let evasionCount = 0;
  let yesScale = 1;
  let lastEvadeAt = 0;
  let selectedTime = DEFAULT_TIME;
  let selectedTimeKey = DEFAULT_TIME_KEY;
  let isSending = false;
  let answers = [];

  if (userName) {
    document.title = `${userName} uchun maxsus taklif 💌`;
  }

  // ------------------------------------------------------------------------
  // Savollar
  // ------------------------------------------------------------------------
  function renderQuestion(stepIndex) {
    const q = QUESTIONS[stepIndex];
    if (!q) return;

    restartAnimation(el.card, "card-content-fade");
    el.badgeText.textContent = q.badge;
    el.title.textContent = q.title(userName);
    el.subtitle.textContent = q.subtitle;
    el.yesBtnText.textContent = q.yesText;
    el.noBtnText.textContent = q.noText;
  }

  function renderFinalState() {
    restartAnimation(el.card, "card-content-fade");
    el.card.classList.add("is-final");

    el.badgeText.textContent = "Kelishdik! 🎉";
    el.title.textContent = userName
      ? `${userName}, uchrashuvni belgilaymiz! 🥰`
      : "Unda uchrashuvni belgilaymiz! 🥰";
    el.subtitle.textContent = "Qachon ko‘rishamiz? Tanla va menga yoz ✨";

    el.timeOptions.classList.remove("hidden");
    el.finalActions.classList.remove("hidden");
    el.yesBtn.classList.add("hidden");

    resetNoButton();
    el.noBtnText.textContent = "Yo‘q, bormayman 🤪";
    el.footerHint.textContent = "Vaqtni tanla va javobingni yubor 💌";

    confetti.burst(120, 5200);
  }

  function renderSentState() {
    restartAnimation(el.card, "card-content-fade");
    el.card.classList.add("is-sent");

    el.badgeText.textContent = "Yuborildi ✅";
    el.title.textContent = "Rahmat! Javobing menga yetib bordi 💌";
    el.subtitle.textContent = `Uchrashuv vaqti: ${selectedTime}. Tez orada o‘zim yozaman 🥰`;

    el.timeOptions.classList.add("hidden");
    el.finalActions.classList.add("hidden");
    resetNoButton();
    el.noBtn.classList.add("hidden");
    el.footerHint.textContent = "Uchrashuvgacha! ✨";

    confetti.burst(140, 5600);
  }

  // ------------------------------------------------------------------------
  // "Ha" tugmasi
  // ------------------------------------------------------------------------
  el.yesBtn.addEventListener("click", () => {
    triggerHaptic([60, 40, 80]);
    music.play();

    const q = QUESTIONS[currentStep];
    if (!q) return;

    answers = [...answers, { icon: q.icon, answer: q.yesText }];
    confetti.burst(40, 2200);
    currentStep += 1;

    if (currentStep < QUESTIONS.length) {
      resetNoButton();
      renderQuestion(currentStep);
    } else {
      renderFinalState();
    }
  });

  // ------------------------------------------------------------------------
  // Qochadigan "Yo'q" tugmasi
  // ------------------------------------------------------------------------
  function setYesScale(value) {
    yesScale = value;
    el.yesBtn.style.setProperty("--yes-scale", String(value));
  }

  function resetNoButton() {
    const btn = el.noBtn;
    btn.classList.remove("is-evading");
    btn.style.left = "";
    btn.style.top = "";
    if (btn.parentElement !== el.buttonsArea) {
      el.buttonsArea.appendChild(btn);
    }
    setYesScale(1);
  }

  /** Tugmani <body>ga ko'chiradi — kartadagi backdrop-filter/transform fixed'ni buzmasligi uchun. */
  function detachNoButton() {
    const btn = el.noBtn;
    const rect = btn.getBoundingClientRect();
    document.body.appendChild(btn);
    btn.classList.add("is-evading");
    btn.style.left = `${rect.left}px`;
    btn.style.top = `${rect.top}px`;
    void btn.offsetWidth; // boshlang'ich joydan silliq harakatlanishi uchun
  }

  function getProtectedRects() {
    const targets = [el.yesBtn, el.sendBtn, ...el.timeChips];
    return targets
      .filter((node) => node.offsetParent !== null)
      .map((node) => node.getBoundingClientRect());
  }

  function overlaps(a, b, gap) {
    return !(
      a.right + gap < b.left ||
      a.left > b.right + gap ||
      a.bottom + gap < b.top ||
      a.top > b.bottom + gap
    );
  }

  function pickEvadePosition(width, height) {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const minLeft = VIEWPORT_MARGIN;
    const minTop = VIEWPORT_MARGIN + 8;
    const maxLeft = Math.max(minLeft, viewportWidth - width - VIEWPORT_MARGIN);
    const maxTop = Math.max(minTop, viewportHeight - height - VIEWPORT_MARGIN - 8);
    const current = el.noBtn.getBoundingClientRect();
    const protectedRects = getProtectedRects();

    let best = { left: minLeft, top: minTop };
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const left = minLeft + Math.random() * (maxLeft - minLeft);
      const top = minTop + Math.random() * (maxTop - minTop);
      const candidate = { left, top, right: left + width, bottom: top + height };

      const hitsProtected = protectedRects.some((r) => overlaps(candidate, r, 12));
      const tooClose = Math.hypot(left - current.left, top - current.top) < 90;
      best = { left, top };
      if (!hitsProtected && !tooClose) break;
    }
    return best;
  }

  function evadeButton(event) {
    if (event && event.cancelable) event.preventDefault();

    const now = Date.now();
    if (now - lastEvadeAt < EVADE_COOLDOWN_MS) return;
    lastEvadeAt = now;

    music.play();
    triggerHaptic(40);

    evasionCount += 1;
    el.noBtnText.textContent = EVADE_TEXTS[(evasionCount - 1) % EVADE_TEXTS.length];

    if (!el.card.classList.contains("is-final") && yesScale < MAX_YES_SCALE) {
      setYesScale(Math.min(MAX_YES_SCALE, +(yesScale + YES_SCALE_STEP).toFixed(2)));
    }

    if (!el.noBtn.classList.contains("is-evading")) {
      detachNoButton();
    }

    const { width, height } = el.noBtn.getBoundingClientRect();
    const { left, top } = pickEvadePosition(width, height);
    el.noBtn.style.left = `${Math.round(left)}px`;
    el.noBtn.style.top = `${Math.round(top)}px`;
  }

  el.noBtn.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") evadeButton(e);
  });
  el.noBtn.addEventListener("pointerdown", evadeButton);
  el.noBtn.addEventListener("touchstart", evadeButton, { passive: false });
  el.noBtn.addEventListener("click", evadeButton);

  // Ekran o'lchami o'zgarsa, qochgan tugma ekran ichida qolsin
  window.addEventListener("resize", () => {
    if (!el.noBtn.classList.contains("is-evading")) return;
    const rect = el.noBtn.getBoundingClientRect();
    const maxLeft = document.documentElement.clientWidth - rect.width - VIEWPORT_MARGIN;
    const maxTop = window.innerHeight - rect.height - VIEWPORT_MARGIN;
    el.noBtn.style.left = `${Math.max(VIEWPORT_MARGIN, Math.min(rect.left, maxLeft))}px`;
    el.noBtn.style.top = `${Math.max(VIEWPORT_MARGIN, Math.min(rect.top, maxTop))}px`;
  });

  // ------------------------------------------------------------------------
  // Uchrashuv vaqti va Telegram
  // ------------------------------------------------------------------------
  el.timeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      triggerHaptic(25);
      el.timeChips.forEach((c) => {
        const isActive = c === chip;
        c.classList.toggle("active", isActive);
        c.setAttribute("aria-checked", String(isActive));
      });
      selectedTime = chip.dataset.time || DEFAULT_TIME;
      selectedTimeKey = chip.dataset.timeKey || DEFAULT_TIME_KEY;
    });
  });

  /** Bot ishlamay qolsa: xabar tayyor holda Telegram lichkasini ochadi. */
  function buildFallbackTelegramUrl() {
    const greeting = userName
      ? `Salom! Men ${userName}. Taklifingni qabul qildim 🥰✨`
      : "Salom! Taklifingni qabul qildim 🥰✨";
    const answersText = answers.length
      ? `\n\nMening javoblarim:\n${answers.map((a) => `${a.icon} ${a.answer}`).join("\n")}`
      : "";
    const message = `${greeting}${answersText}\n📅 Uchrashuv vaqti: ${selectedTime}\n\nTezroq ko‘rishguncha! 💌`;
    return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
  }

  async function postAnswer() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
    try {
      const response = await fetch(SEND_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, timeKey: selectedTimeKey, evasions: evasionCount }),
        signal: controller.signal
      });
      const result = await response.json().catch(() => null);
      return Boolean(response.ok && result && result.success);
    } finally {
      clearTimeout(timer);
    }
  }

  el.sendBtn.addEventListener("click", async () => {
    if (isSending) return;
    isSending = true;
    triggerHaptic(30);
    el.sendBtn.disabled = true;
    el.sendBtn.classList.add("is-loading");
    el.sendBtnLabel.textContent = "Yuborilmoqda...";

    let delivered = false;
    try {
      delivered = await postAnswer();
    } catch (err) {
      delivered = false;
    }

    if (delivered) {
      triggerHaptic([60, 40, 80]);
      renderSentState();
      return;
    }

    // Server javob bermadi — xabarni Telegram orqali qo'lda yuborish imkonini beramiz
    el.sendBtnLabel.textContent = "Telegram ochilmoqda...";
    window.location.href = buildFallbackTelegramUrl();
    setTimeout(() => {
      isSending = false;
      el.sendBtn.disabled = false;
      el.sendBtn.classList.remove("is-loading");
      el.sendBtnLabel.textContent = "Javobni yuborish 💌";
    }, 1500);
  });

  // ------------------------------------------------------------------------
  // Fon: suzuvchi yurakchalar
  // ------------------------------------------------------------------------
  function createFloatingHearts() {
    const symbols = ["💖", "🌸", "✨", "💕", "🤍"];
    const count = window.innerWidth < 480 ? 8 : 12;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      heart.textContent = symbols[i % symbols.length];
      heart.style.left = `${4 + (i / count) * 88 + Math.random() * 6}%`;
      heart.style.fontSize = `${Math.round(Math.random() * 10 + 14)}px`;
      heart.style.animationDuration = `${(Math.random() * 6 + 10).toFixed(1)}s`;
      heart.style.animationDelay = `${(-Math.random() * 12).toFixed(1)}s`;
      heart.style.setProperty("--heart-opacity", (Math.random() * 0.3 + 0.3).toFixed(2));
      fragment.appendChild(heart);
    }
    el.heartsBg.appendChild(fragment);
  }

  createFloatingHearts();
  renderQuestion(currentStep);
});

// --------------------------------------------------------------------------
// Musiqa: 20-sekunddan boshlanadi, tugasa yana 20-sekunddan davom etadi
// --------------------------------------------------------------------------
function createMusic(audio) {
  if (!audio) return { play: () => {} };

  let hasStarted = false;
  let pausedByVisibility = false;

  function seekToStart() {
    try {
      audio.currentTime = AUDIO_START_SECONDS;
    } catch (err) {
      // Metadata hali yuklanmagan — loadedmetadata'da qayta urinamiz
    }
  }

  function play() {
    if (!audio.paused) return;
    if (!hasStarted) {
      seekToStart();
      hasStarted = true;
    }
    audio.volume = AUDIO_VOLUME;
    const promise = audio.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        // Autoplay taqiqlangan — birinchi teginishda qayta urinamiz
        hasStarted = false;
      });
    }
  }

  audio.addEventListener("loadedmetadata", () => {
    if (audio.currentTime < AUDIO_START_SECONDS) seekToStart();
  });

  audio.addEventListener("ended", () => {
    seekToStart();
    audio.play().catch(() => {});
  });

  // Boshqa ilovaga (masalan, Telegramga) o'tilganda musiqa to'xtaydi va qaytganda davom etadi
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !audio.paused) {
      audio.pause();
      pausedByVisibility = true;
    } else if (!document.hidden && pausedByVisibility) {
      pausedByVisibility = false;
      audio.play().catch(() => {});
    }
  });

  const unlockEvents = ["pointerdown", "touchstart", "keydown"];
  const unlock = () => {
    play();
    unlockEvents.forEach((type) => document.removeEventListener(type, unlock, true));
  };
  unlockEvents.forEach((type) => document.addEventListener(type, unlock, { capture: true, passive: true }));

  play();
  return { play };
}

// --------------------------------------------------------------------------
// Konfetti: bitta umumiy canvas va animatsiya sikli (Retina uchun aniq)
// --------------------------------------------------------------------------
function createConfetti(canvas) {
  const ctx = canvas && canvas.getContext("2d");
  if (!ctx) return { burst: () => {} };

  const colors = ["#FF2A65", "#FF6B8B", "#FFAAA7", "#FFD3B6", "#FFD700", "#FFFFFF", "#C084FC"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let particles = [];
  let running = false;
  let width = 0;
  let height = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawHeart(p) {
    const s = p.size;
    const top = s * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, top);
    ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, top);
    ctx.bezierCurveTo(-s / 2, (s + top) / 2, 0, s, 0, s * 1.2);
    ctx.bezierCurveTo(0, s, s / 2, (s + top) / 2, s / 2, top);
    ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, top);
    ctx.closePath();
    ctx.fill();
  }

  function frame(now) {
    ctx.clearRect(0, 0, width, height);

    particles = particles.filter((p) => {
      const age = now - p.born;
      if (age > p.life || p.y > height + 40) return false;

      p.vy += 0.34;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
      const fadeStart = p.life * 0.6;
      const alpha = age < fadeStart ? 1 : Math.max(0, 1 - (age - fadeStart) / (p.life - fadeStart));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.isHeart) {
        drawHeart(p);
      } else {
        ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
      }
      ctx.restore();
      return true;
    });

    if (particles.length) {
      requestAnimationFrame(frame);
    } else {
      running = false;
      ctx.clearRect(0, 0, width, height);
    }
  }

  function burst(count, life) {
    if (reduceMotion) return;
    if (width !== window.innerWidth || height !== window.innerHeight) resize();

    const now = performance.now();
    const originX = width / 2;
    const originY = height * 0.6;
    const fresh = Array.from({ length: count }, () => {
      const isHeart = Math.random() < 0.35;
      return {
        x: originX + (Math.random() * 80 - 40),
        y: originY,
        vx: (Math.random() - 0.5) * 12,
        vy: -(Math.random() * 13 + 8),
        size: isHeart ? Math.random() * 9 + 8 : Math.random() * 7 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.18,
        isHeart,
        born: now,
        life: life * (0.8 + Math.random() * 0.2)
      };
    });

    particles = [...particles, ...fresh];
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  resize();
  window.addEventListener("resize", resize);
  return { burst };
}
