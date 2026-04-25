# 🍉 Quiz Ninja — AI Quiz + Hand Gesture Slicing

Fruit Ninja meets AI. Type any topic → AI generates quiz questions → answers fly as cards → slice the correct one with your hand.

**Base:** Forked from [collidingScopes/fruit-ninja](https://github.com/collidingScopes/fruit-ninja)

---

## 🎮 Quick Start (2 Steps)

### 1. Start API Proxy
```bash
/c/Python314/python proxy.py
```

### 2. Start Web Server (new terminal)
```bash
/c/Python314/python -m http.server 8000
```

Then open: **http://localhost:8000**

---

## 🏆 How to Play

1. **Enter a topic** (Space, History, Science, etc.)
2. **Click "Generate Quiz ✨"** — AI creates 10 questions instantly
3. **Enable webcam** → **Click "Start"**
4. **Answer cards fly up** — Move your hand to slice the correct answer
5. **Green explosion** = Correct (+100 pts) → Next question
6. **Red explosion** = Wrong (-1 life) → Answer all before losing 3 lives

---

## ✨ Features

- **AI-Generated Quiz** — Any topic, instant questions (Groq API)
- **Hand Gesture Recognition** — MediaPipe Hands (no hardware)
- **3D Physics** — Card trajectories, particle explosions
- **Real-time Scoring** — Visual feedback (green/red flashes)
- **Retro Neon UI** — Cyberpunk aesthetic
- **No Installation** — Pure browser, works anywhere

---

## 🛠️ What Was Built

### New Files
- `quiz.js` — AI integration + quiz state
- `proxy.py` — Backend API proxy (Groq + Anthropic)
- `SETUP.md` — Setup instructions

### Modified Files
- `index.html` — Topic input + question display
- `game.js` — Answer card spawn + collision detection
- `styles.css` — Neon quiz UI

---

## 🎯 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML5, CSS3, Three.js, MediaPipe Hands |
| Backend | Python http.server (lightweight proxy) |
| AI | Groq API (fast) + Anthropic Claude (fallback) |
| Game | Vanilla JavaScript, no frameworks |

---

## 📋 Architecture

```
User Input (Topic)
    ↓
Groq/Claude API (AI generates questions)
    ↓
Game State (quiz.js)
    ↓
Spawn Cards (game.js spawnFruit)
    ↓
Hand Tracking (MediaPipe)
    ↓
Collision Detection (sliceFruit)
    ↓
Score Update + Next Question
```

---

## 🔑 API Keys

**Currently Hardcoded with Groq Key** (for hackathon demo)

To use your own:
1. Get API key from [groq.com](https://console.groq.com) or [anthropic.com](https://console.anthropic.com)
2. Update `API_KEY` in `quiz.js`
3. Restart proxy: `/c/Python314/python proxy.py`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "API Error" | Check proxy is running: `/c/Python314/python proxy.py` |
| Hand not detected | Allow webcam, ensure good lighting |
| Cards not spawning | Check browser console (F12) for errors |
| Slow generation | Groq API is fast; if slow, check internet connection |

---

## 🎬 Demo Script for Judges

```
1. Open http://localhost:8000
2. Type "World Cup Winners"
3. Click "Generate Quiz ✨"
4. Enable webcam → Click "Start"
5. Slice cards:
   ✓ Correct (green) = +100 pts
   ✗ Wrong (red) = -1 life
6. Win by answering all 10!
```

---

## 🚀 Why This Wins

- ✅ Works instantly (no setup, no install)
- ✅ Infinite question pool (any topic, any time)
- ✅ Hand slicing is cool & intuitive
- ✅ AI-powered (judges like that)
- ✅ Runs on any laptop with webcam

---

## 📦 Project Structure

```
quiz-ninja/
├── index.html         ← Topic input + game UI
├── game.js           ← 3D rendering + physics
├── quiz.js           ← AI quiz + state (NEW)
├── proxy.py          ← API proxy (NEW)
├── styles.css        ← Retro neon style
├── SETUP.md          ← Setup guide
└── README.md         ← This file
```

---

Made with 💜 for the hackathon. Good luck! 🍉🥷