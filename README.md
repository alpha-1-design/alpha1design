# Alpha-1 Design ◆ PWA Studio

> AI writing, image compression, and color palette tools. Installable PWA. Powered by Claude.

---

## Apps

| # | App | Description |
|---|-----|-------------|
| 01 | **AI Writer** | Claude-powered text generation with 6 content types and 5 tones |
| 02 | **Image Compressor** | Client-side compression — images never leave your device |
| 03 | **Color Palette** | 5 harmony modes, lock colors, export CSS variables |

---

## Quick Start

### Option A — Local Dev

```bash
# 1. Install dependencies
npm install

# 2. Add your Claude API key
cp .env.example .env.local
# Edit .env.local and add: ANTHROPIC_API_KEY=your_key_here

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

### Option B — Termux (Android)

```bash
# Install Node in Termux first
pkg install nodejs

# Unzip and enter the project
unzip alpha1design.zip
cd alpha1design

npm install
cp .env.example .env.local
# nano .env.local  → add your API key

npm run dev
```

---

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "init: alpha-1 design pwa"
git remote add origin https://github.com/YOUR_USERNAME/alpha1design.git
git push -u origin main

# 2. Go to vercel.com → Import your repo
# 3. Add environment variable in Vercel dashboard:
#    ANTHROPIC_API_KEY = your_key_here
# 4. Deploy — done.
```

---

## PWA Installation

Once hosted, open the site on your phone or desktop:
- **Android Chrome**: tap the install banner or ⋮ menu → "Add to Home Screen"
- **iOS Safari**: Share → "Add to Home Screen"
- **Desktop Chrome/Edge**: click the install icon in the address bar

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for AI Writer) | Your key from console.anthropic.com |

> The API key is **server-side only** — never sent to the browser.

---

## Tech Stack

- **Next.js 13** — App framework + API routes
- **next-pwa** — Service worker + offline caching
- **Claude API** — claude-sonnet-4-20250514
- **Canvas API** — Client-side image compression

---

MIT License · Alpha-1 Design
