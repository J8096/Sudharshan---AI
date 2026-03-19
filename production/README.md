# Sudharshan AI — Production Deploy Guide

## ✅ What was optimised in this build

| Fix | Before | After |
|-----|--------|-------|
| highlight.js chunk | 981 KB | ~70 KB |
| Lazy page loading | All pages loaded upfront | Pages load on demand |
| Render cold-start | 10–30s first request | Warm (keep-alive ping) |
| Gzip compression | Default | Level 6, 1KB threshold |
| Asset caching | Basic | 1-year immutable + security headers |

---

## 🚀 Step 1 — Deploy Backend to Render

1. Push the `backend/` folder to a GitHub repo (or the full repo).
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your repo. Set **Root Directory** to `backend`
4. Set these env variables in Render dashboard:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `GROQ_API_KEY` | Your key from [console.groq.com](https://console.groq.com) |
| `JWT_SECRET` | Any long random string (Render can generate one) |
| `FRONTEND_URL` | Your Vercel URL (e.g. `https://sudharshan-ai.vercel.app`) |
| `MONGODB_URI` | *(optional)* MongoDB Atlas URI — leave blank for in-memory |

5. **Build command:** `npm install`
6. **Start command:** `npm start`
7. Deploy. Note your Render URL: `https://sudharshan-ai-backend.onrender.com`

---

## 🚀 Step 2 — Deploy Frontend to Vercel

1. Push the `frontend/` folder to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Set **Root Directory** to `frontend`
4. Add this **Environment Variable** in Vercel dashboard:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your Render backend URL (no trailing slash) |

5. **Build command:** `npm run build`  
   **Output directory:** `dist`
6. Deploy.

---

## 🔑 Demo login
```
Email:    admin@kova.ai
Password: password123
```
*(Works in both in-memory and MongoDB mode)*

---

## 🧪 End-to-End Test Checklist

After both services are live, test in order:

- [ ] `/login` — log in with demo credentials
- [ ] `/dashboard` — KPIs, charts, model status, recent chats load
- [ ] `/chat` — send a message, verify AI streams a response
- [ ] `/chat` — attach a `.txt` or `.js` file, ask about its contents
- [ ] `/projects` — create a project, add tasks, drag between columns
- [ ] `/analytics` — charts render, model usage pie shows data
- [ ] `/team` — team list appears
- [ ] `/notifications` — notifications load, mark-as-read works
- [ ] `/settings` — update profile name, save works
- [ ] Logout → login again → all sessions and projects persisted

---

## 🏗 Local development

```bash
# Backend
cd backend
cp .env.example .env
# Fill in GROQ_API_KEY in .env
npm install
npm run dev   # → http://localhost:3001

# Frontend (new terminal)
cd frontend
cp .env.example .env
# Leave VITE_API_URL blank for local dev (Vite proxy handles /api)
npm install
npm run dev   # → http://localhost:5173
```
