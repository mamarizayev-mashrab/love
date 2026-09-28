# 💌 Romantik Web-Taklif Sahifasi

Ushbu loyiha yaxshi ko'rgan qizingizni uchrashuvga taklif qilish uchun maxsus yaratilgan **premium, romantik va interaktiv** web-sahifadir.

Mobil qurilmalar (ayniqsa **Android Chrome**) uchun optimallashtirilgan, hech qanday og'ir tashqi kutubxonalarga bog'liq bo'lmagan, 100% tez va barqaror ishlaydi.

---

## ✨ Asosiy Xususiyatlari

1. **Mobile-First & 100% Ekranga Moslashgan (No Scroll):**
   - Hech qanday alohida success-card yo'q — barcha bosqichlar bitta yaxlit shisha kartochka ichida silliq almashadi.
   - 320px, 360px, 390px, 412px va undan katta barcha Android hamda iPhone ekranlarida vertikal ravishda to'liq va sig'ib ko'rinadi (hech qanday pastga scroll talab qilinmaydi).
   - Dynamic viewport (`100dvh`) va iPhone notch uchun `safe-area` — manzil paneli chiqqanda ham sahifa sakramaydi.
   - Juda past ekranlarda (masalan, landscape) kontent kesilmaydi — kerak bo‘lsa sahifa yumshoq scroll bo‘ladi.
2. **Ko'p Bosqichli Romantik Savollar (Story Flow):**
   - Zerikarli oddiy "Ha" va "Yo'q" emas, balki samimiy va jonli savollar zanjiri:
     1. *"Birga uchrashuvga chiqamizmi? ☕"* -> *"Jon deb, roziman! 🥰"*
     2. *"Qayerda ko'rishsak senga yoqadi? 🌆"* -> *"Sokin qahvaxonada 🍰"*
     3. *"Uchrashuvimiz ajoyib o'tishiga ishonasanmi? ✨"* -> *"Albatta, kutaman! 🥰"*
     4. Yakuniy qadam: *"Unda uchrashuvni belgilaymiz! 🥰"* -> Telegram orqali xabar yuborish.
3. **Aqlli Qochadigan Inkor Tugmasi:**
   - Qiz inkor tugmasini bosishga intilgan zahoti (`touchstart`, `pointerdown`, `mouseenter`) tugma elastik tarzda butun ekran bo'ylab silliq qochadi.
   - Har safar qochganda kulgili va yoqimli matnlar chiqadi (*"Qo'ling tegmadi-ku 😜"*, *"Qochdim! 🏃‍♂️💨"*, *"Ushlay olmaysan 🙈"*, *"Baribir 'Ha' deysan 😉"*).
   - Hatto yakuniy bosqichda ham qochadigan tugma qochishda davom etadi!
   - Telefonda tebranish (Haptic feedback) beradi.
4. **Shaxsiylashtirilgan Havola (Personalized Link):**
   - Havolaga `?name=Madina` parametrini qo'shib yuborsangiz, sayt uning o'z ismi bilan boshlanadi!
5. **Romantik Fon Qo'shig'i (Adele - Lovesong):**
   - Saytga kirganda Adele'ning mashhur *"Lovesong"* qo'shig'i avtomatik tarzda eng romantik joyidan — **aynan 20-sekunddan** boshlanadi!
   - Hech qanday ortiqcha pauza tugmalari yo'q, sahifa mutlaqo toza va romantik minimalizmda saqlangan.

---

## 📁 Fayllar Tuzilishi va Vazifalari

| Fayl | Vazifasi |
| :--- | :--- |
| **`index.html`** | Sahifa tuzilishi, matnlar, Telegram uchun Open Graph meta teglari va uchrashuv vaqti tanlovi. |
| **`style.css`** | Glassmorphism kartochka, Playfair Display + Outfit shriftlari, animatsiyalar, 320px dan kompyutergacha moslashuv, safe-area va reduced-motion. |
| **`script.js`** | Savollar zanjiri, qochadigan "Yo‘q" tugmasi, ismni xavfsiz o‘qish, musiqa, konfetti va Telegram havolasi. |
| **`lovesong.mp3`** | Fon qo‘shig‘i (Adele — Lovesong), 20-sekunddan boshlanadi va tugagach yana 20-sekunddan davom etadi. |
| **`cover.png`** | Telegram va ijtimoiy tarmoqlardagi preview rasmi (1200×630). |
| **`favicon.svg`**, **`apple-touch-icon.png`** | Brauzer va telefon ekranidagi ikonka. |
| **`vercel.json`** | Toza URL, xavfsizlik sarlavhalari (CSP) va media keshlash sozlamalari. |
| **`package.json`** | Loyihani lokal ishga tushirish uchun. |

---

## 🛠 Sozlash (Telegram Username & Shaxsiy Havola)

### 1. Telegram profilingiz ulandi:
Loyihangizga sizning shaxsiy Telegram profilingiz (**[@eskidasturchi](https://t.me/eskidasturchi)**) to'liq ulab qo'yildi!
Qiz saytda savollarga javob berib, uchrashuv vaqtini tanlab **"Menga Telegramda yozish 💌"** tugmasini bosganida, to'g'ridan-to'g'ri sizning lichkangiz ochiladi va u tanlagan barcha javoblar tayyor xabar bo'lib tushadi:

```text
Salom! Taklifingni qabul qildim 🥰✨

Mening javoblarim:
☕ Jon deb, roziman! 🥰
🌆 Sokin qahvaxonada 🍰
💖 Albatta, kutaman! 🥰
📅 Uchrashuv vaqti: Shu dam olish kunlari ☕

Tezroq ko'rishguncha! 💌
```

### 2. Ism bilan yuborish siri (Shaxsiy Taklif):
Saytingizni Vercel'ga deploy qilgach, unga `?name=Ism` qo'shib yuborishingiz mumkin:
```
https://sizning-sayt.vercel.app/?name=Madina
```
Bunda sahifaning bosh sarlavhasi avtomatik ravishda:
> **"Madina, birga uchrashuvga chiqamizmi? ✨"**
deb chiqadi va qiz hayratda qolishi kafolatlanadi!

---

## 🚀 Kompyuterda Ishga Tushirish va Sinash

Loyihani kompyuterda sinab ko'rishning 3 xil oson usuli bor:

### 1-usul: Oddiy ochish
`index.html` faylini istalgan brauzerda (Chrome, Edge) sichqoncha bilan 2 marta bosib oching.

### 2-usul: Node.js orqali (Tavsiya etiladi)
Terminalda (ushbu papka ichida):
```bash
npx serve .
```
Buyruqdan so'ng terminalda ko'rsatilgan `http://localhost:3000` manzilini brauzerda oching.

### 3-usul: Python orqali
```bash
python -m http.server 3000
```
Brauzerda `http://localhost:3000` manziliga kiring.

---

## 📱 Android Telefonda Sinab Ko'rish

Saytni o'z Android telefoningizda xuddi qiz ko'radigandek sinash uchun 2 ta yo'l bor:

### A) Kompyuter va telefon bir xil Wi-Fi ga ulangan bo'lsa:
1. Kompyuterda buyruqni bering:
   ```bash
   npx serve .
   ```
2. Terminalda `Network: http://192.168.x.x:3000` ko'rinishidagi manzil chiqadi.
3. Android telefoningizdagi **Chrome** brauzerini ochib, ushbu manzilni yozing.
4. "Yo'q" tugmasini barmog'ingiz bilan bosishga harakat qilib ko'ring!

### B) Vercel orqali sinash (Eng qulayi):
Quyidagi deploy yo'riqnomasi orqali bepul 1 daqiqada internetga chiqaring va tayyor linkni telefoningizda oching.

---

## 🌐 Vercel'ga Bepul Deploy Qilish (Telegramda jo'natish uchun)

Saytni internetga joylab, chiroyli havola (`https://uchrashuv-...vercel.app`) olishning 2 xil yo'li:

### 1-YO'L: Vercel sayti orqali (GitHub orqali - Eng qulay)
1. Ushbu `Love` papkasidagi fayllarni GitHub'dagi shaxsiy repositoriyingizga yuklang (push qiling).
2. [vercel.com](https://vercel.com) saytiga kiring va kiring (Sign In).
3. **"Add New..."** -> **"Project"** tugmasini bosing.
4. GitHub'dagi repositoriyingizni tanlang va **"Deploy"** tugmasini bosing.
5. 20 soniya ichida sizga tayyor rasmiy link beriladi!

### 2-YO'L: Vercel CLI orqali (Terminaldan to'g'ridan-to'g'ri)
Terminalda quyidagi buyruqni bajaring:
```bash
npx vercel
```
- Ekranda so'ralgan savollarga shunchaki `Enter` tugmasini bosib tasdiqlang.
- Bir necha soniyada sizga jonli internet havolasi (Production URL) taqdim etiladi.

---

## 💌 Qizga Yuborish Maslahati

Telegram orqali havolani yuborayotganingizda:
1. Linkni yozing (masalan: `https://biz-uchun.vercel.app`).
2. Telegram avtomatik tarzda chiroyli taklif rasmi va *"Senga maxsus maktub bor... 💌"* sarlavhasini oldindan ko'rsatish (preview) qiladi.
3. Qisqa va samimiy so'z bilan jo'nating:  
   *«Buni faqat sen uchun tayyorladim, bo'sh bo'lganingda ochib ko'r... ✨»*
