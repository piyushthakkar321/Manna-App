# ✝ Manna — Daily Bread for the Soul

A premium mobile-first devotional app built with React + TypeScript. Warm, earthy, reverent — like a leather-bound Bible meets a modern iOS app.

---

## ✨ Features

### 📖 Today Tab

- Daily devotional card with rotating Scripture verse (30 devotionals, cycles by day-of-year)
- Listen button — reads verse + reflection aloud using Web Speech API at a calm 0.85 rate
- Copy button — one tap copies the full verse + reference to clipboard
- Share button — generates a stunning 1080×1080px verse card for Instagram/WhatsApp
- Reflection prompt with animated reveal
- 7-day streak tracker with gold dot indicators
- "Mark as Read" button that persists across sessions

### 💬 Bible Chat (Logos)

- AI Bible companion powered by Groq (llama-3.3-70b-versatile)
- Warm, pastoral system prompt — always cites ESV references, ends with reflection questions
- Typing indicator with animated dots
- Suggested question chips for new users
- Full conversation history maintained per session

### 📝 Prayer Journal

- Italic ruled journal with gold left-margin line
- 5 starter prompt chips that inject into the textarea
- Saves entries to localStorage with timestamps
- Past entries displayed as cards with date headers

### 📅 Reading Plan

- 14-day sample from a 90-day Genesis / Psalms / Matthew plan
- Tap to mark complete — animated gold checkmark
- Animated progress bar
- Real 28-day heatmap (gold = active days from actual reading history)

### 🙏 Prayer Wall

- Community prayer cards with category badges (Healing, Praise, Wisdom, etc.)
- Heart/un-heart reactions with counts
- Share any prayer as a 1080×1080 card
- Add new prayer with category selector

### 🌙 Dark Mode (Candlelight Theme)

- Full candlelight dark theme — deep `#1A0A04` backgrounds, warm amber text
- Toggle in the header — persists across sessions
- All 5 tabs fully themed

### 🔔 Smart Notifications

- Custom reminder time picker (hour + AM/PM drum-roll UI)
- Beautiful permission prompt on first launch
- Schedules real browser notifications at your chosen time daily

### 🌅 Splash Screen

- 2-second branded splash on first load each session
- Gold cross icon, animated tagline, loading dots
- Smooth fade-out animation

---

## 🛠 Tech Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Framework        | React 18 + TypeScript                               |
| Build Tool       | Vite 8                                              |
| AI / Chat        | Groq API (`llama-3.3-70b-versatile`)                |
| Audio            | Web Speech API (speechSynthesis)                    |
| Image Generation | HTML Canvas API                                     |
| Storage          | localStorage (client-side)                          |
| Notifications    | Browser Notification API                            |
| Styling          | Inline styles + CSS-in-JS (no external CSS library) |
| Fonts            | EB Garamond (serif) + Lato (sans) via Google Fonts  |
| Deployment       | Vercel (serverless-ready)                           |

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/manna-app.git
cd manna-app

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Add your Groq API key to .env
# Open .env and set:
# VITE_GROQ_API_KEY=gsk_your_key_here

# 5. Start the dev server
npm run dev

# App runs at http://localhost:5173
```

---

## ☁️ Deploying to Vercel

### Option A — Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy (follow the prompts — accept all defaults)
vercel

# 4. Add your API key as an environment variable
vercel env add VITE_GROQ_API_KEY

# When prompted, paste your Groq key and select: Production, Preview, Development

# 5. Redeploy to apply the environment variable
vercel --prod
```

### Option B — Vercel Dashboard

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repo
3. In **Environment Variables**, add:
   - Key: `VITE_GROQ_API_KEY`
   - Value: your Groq API key (`gsk_...`)
4. Click **Deploy**

### Build Settings (auto-detected by Vercel)

| Setting          | Value           |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

---

## 📁 Project Structure

```
manna-app/
├── src/
│   ├── App.tsx          # Entire app (single-file architecture)
│   └── main.tsx         # React root mount
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.ts
├── tsconfig.json
├── .env.example         # Template for environment variables
├── vercel.json          # Vercel routing config
└── README.md
```

---

## 🎨 Design System

### Colors

| Token       | Light     | Dark      |
| ----------- | --------- | --------- |
| `parchment` | `#F5EFE0` | `#1A0F06` |
| `ink`       | `#2C1F0E` | `#F0E6D3` |
| `gold`      | `#B8860B` | `#D4A942` |
| `cream`     | `#FBF6EC` | `#241810` |
| `burgundy`  | `#6B1F2A` | `#8B3A4A` |

### Typography

- **Headings & Verse text**: EB Garamond (serif) — warm, classical, reverent
- **UI labels & buttons**: Lato (sans-serif) — clean, legible at small sizes

---

## 📱 Mobile Notes

- Optimized for 390px viewport (iPhone 14 standard)
- `-webkit-tap-highlight-color: transparent` on all buttons
- `touch-action: manipulation` prevents 300ms tap delay
- Safe area padding for notched devices
- `overscroll-behavior: none` prevents scroll bouncing

---

## 📄 License

MIT — free to use, modify, and deploy.

---

_"Man shall not live by bread alone, but by every word that comes from the mouth of God." — Matthew 4:4_
