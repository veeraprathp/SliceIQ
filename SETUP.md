# 🍉 Quiz Ninja - Setup & Demo

## Quick Start

### 1. Start the API Proxy (Terminal 1)
```bash
cd quiz-ninja
python3 proxy.py
# Should show: ✨ Quiz Ninja API Proxy running on http://localhost:8001
```

### 2. Start the Web Server (Terminal 2)
```bash
cd quiz-ninja
python3 -m http.server 8000
# Should show: Serving HTTP on 0.0.0.0 port 8000
```

### 3. Get an API Key (1 minute)
- Go to https://console.anthropic.com
- Create a free account
- Generate an API key (starts with `sk-ant-...`)

### 4. Open in Browser
- Go to http://localhost:8000
- Enter a topic (e.g., "Space", "Cricket", "AI")
- Click "Generate Quiz ✨"
- When prompted, paste your API key
- Enable webcam → Click "Start"
- Move your hand in front of camera to slice answer cards

## How It Works

- **Topic Input Screen** → AI generates 5 unique quiz questions instantly
- **Game Screen** → Answer cards fly up (4 options per question)
- **Slicing Mechanics:**
  - Move your hand to slice cards
  - **Green explosion** = Correct answer (+100 points) → Next question
  - **Red explosion** = Wrong answer (-1 life)
- **Win condition:** Answer all 10 questions before losing 3 lives

## Files Modified

- `index.html` — Added topic input screen + question display
- `game.js` — Modified spawn/slice logic for quiz mode
- `quiz.js` — NEW: Claude API integration + quiz state management
- `styles.css` — Added retro neon styling for quiz screens

## Demo Script (for judges/presentation)

```
1. Load http://localhost:8000
2. Type "World Capitals" in topic field
3. Click "Generate Quiz" ✨
4. Enable webcam
5. Click "Start"
6. Slice cards with your hand:
   - Correct answers → green, score increases
   - Wrong answers → red, lose a heart
7. Keep slicing until all questions done or 3 lives lost
```

## Key Features

✅ AI-generated questions (any topic)  
✅ Hand gesture recognition (MediaPipe)  
✅ 3D Physics + particle effects  
✅ Real-time scoring  
✅ Retro neon UI  

## Troubleshooting

**API Key not working?**
- Check it starts with `sk-ant-`
- Go to console.anthropic.com and verify it's active

**Hand tracking not detecting?**
- Allow webcam permission in browser
- Ensure good lighting
- Position hand in front of camera clearly

**Cards not spawning?**
- Check browser console (F12) for errors
- Verify quiz questions loaded successfully

---

**Made with 💜 for the hackathon!**
