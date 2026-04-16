# Alpha-1 Design ◆ PWA Studio

> Design toolkit with AI writing, image tools, and color palette generator. Installable PWA with offline support.

---

## Features

### Color Palette Generator
- **Harmony Modes**: Complementary, Analogous, Triadic, Split-Complementary, Tetradic
- **Grayscale** conversion toggle
- **Gradient Builder** with angle and position controls
- **Contrast Checker**: WCAG AA/AAA compliance for text/background pairs
- **Export Formats**: CSS variables, Tailwind config, JSON, SVG, PNG
- **Share via URL**: Palettes encoded in URL for easy sharing

### Image Tools
- **Compressor**: Client-side compression (images never leave your device)
- **Resizer**: Resize by width, height, or percentage with aspect lock
- **Collage/Moodboard**: Grid layouts to combine multiple images

### AI Writer
- **Groq Integration** (free tier, no API key required)
- **Streaming responses** for real-time output
- **Content Templates**: Blog post, Product description, Email, Social post, Cover letter, Ad copy
- **Tone Selection**: Professional, Casual, Persuasive, Friendly, Technical

### UX Features
- **Glassmorphism UI**: Frosted glass cards and panels
- **Dark/Light Mode**: System-aware with manual toggle
- **Offline Indicator**: Shows connection status
- **Keyboard Shortcuts**: Navigation and tool shortcuts
- **PWA Install**: Add to home screen on any device

---

## Apps

| # | App | Description |
|---|-----|-------------|
| 01 | **Color Palette** | Harmony modes, gradients, contrast checker, URL sharing |
| 02 | **Image Tools** | Compress, resize, collage/moodboard |
| 03 | **AI Writer** | Groq-powered writing with templates and tones |

---

## Quick Start

### Option A — Local Dev

```bash
# 1. Install dependencies
npm install

# 2. Add your Groq API key
cp .env.example .env.local
# Edit .env.local: GROQ_API_KEY=your_key_here

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
# nano .env.local → add your API key

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
#    GROQ_API_KEY = your_key_here
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
| `GROQ_API_KEY` | Yes (for AI Writer) | Free key from console.groq.com |

> The API key is **server-side only** — never sent to the browser.

---

## Tech Stack

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa)
![Groq](https://img.shields.io/badge/Groq-Fast%20AI-FF6B35?style=flat-square&logo=lightning)

</div>

| Library | Purpose |
|---------|---------|
| **Next.js 15** | App framework + API routes |
| **next-pwa** | Service worker + offline caching |
| **Groq API** | Free AI inference |
| **Canvas API** | Client-side image processing |

---

MIT License · Alpha-1 Design
