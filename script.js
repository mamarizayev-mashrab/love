/**
 * ==========================================================================
 * ROMANTIK WEB-TAKLIF SAHIFASI - ASOSIY SKRIPT
 * Mobile-First, Single-Card Story, Ko'p bosqichli savollar,
 * Qochadigan inkor tugmasi, Adele - Lovesong (20s) avtomatik ijrosi.
 * ==========================================================================
 */

// Ixtiyoriy: O'zingizning Telegram username'ingizni yozsangiz bo'ladi (masalan: 'islom_dev').
// Foydalanuvchining shaxsiy Telegram lichkasi
const TELEGRAM_USERNAME = "eskidasturchi";

document.addEventListener("DOMContentLoaded", () => {
  const proposalCard = document.getElementById("proposalCard");
  const cardBadge = document.getElementById("cardBadge");
  const badgeText = document.getElementById("badgeText");
  const proposalTitle = document.getElementById("proposalTitle");
  const proposalSubtitle = document.getElementById("proposalSubtitle");
  const yesBtn = document.getElementById("yesBtn");
  const yesBtnText = document.getElementById("yesBtnText");
  const noBtn = document.getElementById("noBtn");
  const noBtnText = document.getElementById("noBtnText");
  const timeOptions = document.getElementById("timeOptions");
  const finalActions = document.getElementById("finalActions");
  const telegramShareBtn = document.getElementById("telegramShareBtn");
  const timeChips = document.querySelectorAll(".time-chip");
  const heartsBg = document.getElementById("heartsBg");
  const footerHint = document.getElementById("footerHint");

  let userName = "";
  let currentStep = 0;
  let evasionCount = 0;
  let yesScale = 1.0;
  let selectedTime = "Shu dam olish kunlari ☕";
  const userAnswers = []; // Qizning tanlagan javoblari to'planadigan massiv

  // --------------------------------------------------------------------------
  // 0. URL orqali Ismni O'qish (Masalan: ?name=Madina yoki ?kimga=Zilola)
  // --------------------------------------------------------------------------
  function checkPersonalizedName() {
    const params = new URLSearchParams(window.location.search);
    const rawName = params.get("name") || params.get("kimga") || params.get("ism");

    if (rawName && rawName.trim() !== "") {
      userName = rawName.trim().charAt(0).toUpperCase() + rawName.trim().slice(1);
      document.title = `${userName} uchun maxsus taklif 💌`;
    }
  }

  checkPersonalizedName();

  // --------------------------------------------------------------------------
  // 1. Savollar Zanjiri (Multi-step Interactive Questions)
  // --------------------------------------------------------------------------
  const questions = [
    {
      badge: "1/3 savol ✨",
      title: () => (userName ? `${userName}, birga uchrashuvga chiqamizmi? ☕` : "Birga uchrashuvga chiqamizmi? ☕"),
      subtitle: "Bir piyola issiq qahva ichib, dildan suhbatlashsak degandim...",
      yesText: "Jon deb, roziman! 🥰",
      noText: "Yo'q, vaqtim yo'q 🙈"
    },
    {
      badge: "2/3 savol 🌸",
      title: () => "Qayerda ko'rishsak senga yoqadi? 🌆",
      subtitle: "Senga yoqadigan eng shinam va chiroyli maskanni tanlaymiz",
      yesText: "Sokin qahvaxonada 🍰",
      noText: "Yo'q, hech qayerga 🏃‍♂️"
    },
    {
      badge: "3/3 savol 💖",
      title: () => "Uchrashuvimiz ajoyib o'tishiga ishonasanmi? ✨",
      subtitle: "Eng chiroyli lahzalar sen bilan o'tadigan daqiqalar bo'ladi...",
      yesText: "Albatta, kutaman! 🥰",
      noText: "Yo'q, ishonmayman 😜"
    }
  ];

  // Inkor tugmasi har safar qochganda chiqadigan quvnoq matnlar
  const funnyEvadeTexts = [
    "Qo'ling tegmadi-ku 😜",
    "Qochdim! 🏃‍♂️💨",
    "Ushlay olmaysan 🙈",
    "Faqat rozilik mumkin 🥰",
    "Baribir 'Ha' deysan 😉",
    "Yana urinib ko'r 🌸",
    "Menga yetolmaysan 🏃‍♀️",
    "Bunaqasi ketmaydi 🙃",
    "Xo'sh, rozimisan? ✨"
  ];

  // Savolni yangilash funksiyasi
  function renderQuestion(stepIndex) {
    const q = questions[stepIndex];
    if (!q) return;

    // Silliq animatsiya uchun fade effekti
    proposalCard.classList.remove("card-content-fade");
    void proposalCard.offsetWidth; // reflow
    proposalCard.classList.add("card-content-fade");

    badgeText.textContent = q.badge;
    proposalTitle.innerHTML = `${q.title()} <span class="sparkle">✨</span>`;
    proposalSubtitle.textContent = q.subtitle;
    yesBtnText.textContent = q.yesText;
    noBtnText.textContent = q.noText;
  }

  // Boshlang'ich savolni chiqarish
  renderQuestion(currentStep);

  // --------------------------------------------------------------------------
  // 2. Fon Musiqasi: Adele - Lovesong (20-sekunddan boshlanadi, to'liq avtomatik)
  // --------------------------------------------------------------------------
  const bgAudio = document.getElementById("bgAudio");
  const START_TIME_SECONDS = 20;
  let isAudioStarted = false;

  function playAdeleSong() {
    if (!bgAudio) return;

    if (!isAudioStarted || bgAudio.currentTime < START_TIME_SECONDS) {
      try {
        bgAudio.currentTime = START_TIME_SECONDS;
      } catch (err) {}
      isAudioStarted = true;
    }

    bgAudio.volume = 0.85;

    const playPromise = bgAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Brauzer birinchi teginishni kutmoqda
      });
    }
  }

  if (bgAudio) {
    bgAudio.addEventListener("loadedmetadata", () => {
      bgAudio.currentTime = START_TIME_SECONDS;
    });

    playAdeleSong();

    // Brauzerning autoplay cheklovi uchun birinchi teginishda ishga tushirish
    const startAudioOnFirstInteraction = () => {
      if (bgAudio.paused) {
        playAdeleSong();
      }
      document.removeEventListener("touchstart", startAudioOnFirstInteraction);
      document.removeEventListener("click", startAudioOnFirstInteraction);
      document.removeEventListener("pointerdown", startAudioOnFirstInteraction);
    };

    document.addEventListener("touchstart", startAudioOnFirstInteraction, { passive: true, once: true });
    document.addEventListener("click", startAudioOnFirstInteraction, { once: true });
    document.addEventListener("pointerdown", startAudioOnFirstInteraction, { once: true });
  }

  // --------------------------------------------------------------------------
  // 3. Fondagi mayin suzuvchi yurakchalar (Ambient Floating Hearts)
  // --------------------------------------------------------------------------
  function createFloatingHearts() {
    const heartSymbols = ["💖", "🌸", "✨", "💕", "🤍"];
    const count = 8;

    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      heart.innerText = heartSymbols[i % heartSymbols.length];
      heart.style.left = `${Math.random() * 92}vw`;
      heart.style.fontSize = `${Math.random() * 12 + 14}px`;
      heart.style.animationDuration = `${Math.random() * 6 + 9}s`;
      heart.style.animationDelay = `${Math.random() * 7}s`;
      heart.style.opacity = (Math.random() * 0.35 + 0.2).toFixed(2);
      heartsBg.appendChild(heart);
    }
  }

  createFloatingHearts();

  // --------------------------------------------------------------------------
  // 4. "Yo'q" / Inkor Tugmasining Qochish Mantig'i (Smart Evading Algorithm)
  // --------------------------------------------------------------------------
  function triggerHaptic(duration = 35) {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) {}
    }
  }

  function evadeButton(e) {
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }

    if (bgAudio && bgAudio.paused) {
      playAdeleSong();
    }

    triggerHaptic(40);
    evasionCount++;

    // Matnni quvnoq o'zgartirish
    const textIndex = evasionCount % funnyEvadeTexts.length;
    noBtnText.textContent = funnyEvadeTexts[textIndex];

    // "Ha" tugmasini salgina kattalashtirish
    if (yesScale < 1.3) {
      yesScale += 0.05;
      yesBtn.style.transform = `scale(${yesScale})`;
    }

    if (!noBtn.classList.contains("is-evading")) {
      noBtn.classList.add("is-evading");
    }

    // Xavfsiz chegara koordinatalari
    const btnRect = noBtn.getBoundingClientRect();
    const btnWidth = btnRect.width || 120;
    const btnHeight = btnRect.height || 48;

    const paddingX = 20;
    const paddingTop = 30;
    const paddingBottom = 50;

    const maxLeft = window.innerWidth - btnWidth - paddingX;
    const minLeft = paddingX;

    const maxTop = window.innerHeight - btnHeight - paddingBottom;
    const minTop = paddingTop;

    const yesRect = yesBtn.getBoundingClientRect();

    let newLeft = 0;
    let newTop = 0;
    let attempts = 0;
    let safePosition = false;

    while (!safePosition && attempts < 25) {
      attempts++;
      newLeft = Math.floor(Math.random() * (maxLeft - minLeft + 1)) + minLeft;
      newTop = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;

      const buffer = 30;
      const overlapsYes = !(
        newLeft + btnWidth + buffer < yesRect.left ||
        newLeft > yesRect.right + buffer ||
        newTop + btnHeight + buffer < yesRect.top ||
        newTop > yesRect.bottom + buffer
      );

      if (!overlapsYes) {
        safePosition = true;
      }
    }

    noBtn.style.left = `${newLeft}px`;
    noBtn.style.top = `${newTop}px`;
  }

  noBtn.addEventListener("mouseenter", evadeButton);
  noBtn.addEventListener("pointerdown", evadeButton);
  noBtn.addEventListener("touchstart", evadeButton, { passive: false });
  noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    evadeButton(e);
  });

  // --------------------------------------------------------------------------
  // 5. Ijobiy Javob Tugmasi Bosilganda (Next Question or Final Step)
  // --------------------------------------------------------------------------
  yesBtn.addEventListener("click", () => {
    triggerHaptic([60, 40, 80]);

    if (bgAudio && bgAudio.paused) {
      playAdeleSong();
    }

    // Tanlangan javobni xotiraga saqlash
    if (questions[currentStep]) {
      userAnswers.push({
        step: currentStep + 1,
        question: questions[currentStep].title(),
        answer: yesBtnText.textContent.trim()
      });
    }

    // Har bir to'g'ri javobda kichik konfetti nuri
    triggerMiniBurst();

    currentStep++;

    if (currentStep < questions.length) {
      // Keyingi savolga o'tish
      renderQuestion(currentStep);

      // Agar noBtn qochgan bo'lsa, uni yana o'z joyiga sekin qaytarish
      resetNoButtonPosition();
    } else {
      // Barcha savollar tugadi -> Yakuniy Bosqich (Shu kartaning o'zida!)
      renderFinalState();
    }
  });

  function resetNoButtonPosition() {
    noBtn.classList.remove("is-evading");
    noBtn.style.left = "";
    noBtn.style.top = "";
    noBtn.style.transform = "";
    yesScale = 1.0;
    yesBtn.style.transform = "scale(1)";
  }

  // --------------------------------------------------------------------------
  // 6. Yakuniy Holat (Alohida success-cardsiz, shu kartaning o'zida)
  // --------------------------------------------------------------------------
  function renderFinalState() {
    // Silliq fade
    proposalCard.classList.remove("card-content-fade");
    void proposalCard.offsetWidth;
    proposalCard.classList.add("card-content-fade");

    badgeText.textContent = "Kelishdik! 🎉";
    proposalTitle.innerHTML = `${userName ? userName + ", u" : "U"}chrashuvni belgilaymiz! 🥰`;
    proposalSubtitle.textContent = "Qachon ko'rishsak ma'qul bo'ladi? Tanla va menga yoz ✨";

    // Vaqt chiplarini va Telegram tugmasini ochish
    timeOptions.classList.remove("hidden");
    finalActions.classList.remove("hidden");

    // Ijobiy tugmani yashirib, uning o'rniga Telegram tugmasini asosiy qilish
    yesBtn.style.display = "none";

    // Inkor tugmasi baribir bu yerda ham qochib yuraveradi!
    noBtnText.textContent = "Yo'q, bormayman 🤪";
    resetNoButtonPosition();

    // Pastki izohni yangilash
    footerHint.textContent = "Uchrashuv vaqtini tanla va Telegramda jo'nat 💌";

    setupTelegramLink(selectedTime);

    // Katta bayramona konfetti va suzuvchi yuraklar
    startCelebration();
  }

  // Uchrashuv vaqti chiplari
  timeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      triggerHaptic(25);
      timeChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedTime = chip.getAttribute("data-time") || chip.innerText.trim();
      setupTelegramLink(selectedTime);
    });
  });

  // Telegram havola generatori: Tanlangan barcha javoblarni @eskidasturchi ga avtomatik yuborish
  function setupTelegramLink(timeChoice = "Shu dam olish kunlari ☕") {
    const greeting = userName ? `Salom! Men ${userName}. Taklifingni qabul qildim 🥰✨` : "Salom! Taklifingni qabul qildim 🥰✨";

    let answersText = "";
    if (userAnswers.length > 0) {
      answersText = "\n\nMening javoblarim:\n" + userAnswers.map((item, idx) => {
        const icon = idx === 0 ? "☕" : (idx === 1 ? "🌆" : "💖");
        return `${icon} ${item.answer}`;
      }).join("\n");
    }

    const message = `${greeting}${answersText}\n📅 Uchrashuv vaqti: ${timeChoice}\n\nTezroq ko'rishguncha! 💌`;

    const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
    telegramShareBtn.href = telegramUrl;
  }

  // --------------------------------------------------------------------------
  // 7. Mini Burst & Full Celebration Canvas
  // --------------------------------------------------------------------------
  function triggerMiniBurst() {
    startCelebration(40, 2200);
  }

  function startCelebration(particleCount = 110, duration = 5500) {
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const colors = ["#FF2A65", "#FF6B8B", "#FFAAA7", "#FFD3B6", "#FFD700", "#FFFFFF", "#C084FC"];

    for (let i = 0; i < particleCount; i++) {
      const isHeart = Math.random() < 0.35;
      particles.push({
        x: width * 0.5 + (Math.random() * 80 - 40),
        y: height * 0.6,
        vx: (Math.random() - 0.5) * 12,
        vy: -(Math.random() * 14 + 8),
        gravity: 0.36,
        friction: 0.98,
        size: isHeart ? Math.random() * 9 + 8 : Math.random() * 7 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        isHeart: isHeart,
        opacity: 1
      });
    }

    function drawHeart(context, x, y, size, color, opacity) {
      context.save();
      context.translate(x, y);
      context.globalAlpha = opacity;
      context.fillStyle = color;
      context.beginPath();
      const topCurveHeight = size * 0.3;
      context.moveTo(0, topCurveHeight);
      context.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      context.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.2);
      context.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      context.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      context.closePath();
      context.fill();
      context.restore();
    }

    let startTime = Date.now();

    function render() {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.rotation += p.rotationSpeed;

        if (elapsed > duration * 0.6) {
          p.opacity -= 0.02;
        }

        if (p.opacity > 0) {
          if (p.isHeart) {
            drawHeart(ctx, p.x, p.y, p.size, p.color, Math.max(p.opacity, 0));
          } else {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(p.opacity, 0);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
          }
        }
      });

      if (elapsed < duration) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    render();
  }
});
