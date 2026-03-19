# 🌀 Sudharshan AI — Enterprise Platform v3.0

> *Inspired by Sri Krishna's Sudarshana Chakra — the unstoppable divine weapon of wisdom.*

A full-stack AI enterprise workspace with real-time streaming chat, project management, analytics, and team collaboration.

**[Live Demo →](https://sudharshan-ai.vercel.app)** · **[Backend →](https://sudharshan-ai-backend.onrender.com/api/health)**

---

## ✨ Features

- ⚡ **Real-time AI Chat** — SSE streaming at 280+ tokens/sec via Groq API
- 📊 **Analytics Dashboard** — Live KPI cards, area charts, model usage breakdown
- 🗂️ **Kanban Project Management** — Drag tasks across columns
- 👥 **Team Collaboration** — Role-based access (admin / member / viewer)
- 🔔 **Notifications** — Real-time system and task alerts
- 🔐 **JWT Authentication** — bcrypt hashing, 7-day tokens
- 📎 **File Attachments** — Attach code files, text, JSON to chat sessions

---

## 🏗️ Architecture

```
Sudharshan-AI/
├── backend/                  # Node.js + Express API
│   ├── config/database.js    # MongoDB + in-memory fallback
│   ├── controllers/          # auth, chat, projects, analytics
│   ├── middlewares/          # JWT auth guard
│   ├── models/               # User, Project, Chat, Notification
│   ├── routes/               # Express routers
│   └── server.js             # Entry point, Socket.IO, rate limiting
│
└── frontend/                 # React 18 + Vite
    └── src/
        ├── components/       # ErrorBoundary, AuthField, AuthFeatures
        ├── hooks/            # useAuth, useToast
        ├── layouts/          # AppLayout (sidebar + topbar)
        ├── pages/            # Dashboard, Chat, Projects, Analytics...
        ├── services/         # Axios instance + API helpers
        └── styles/           # Global CSS
```

---

## ⚡ Performance Optimisations

| Optimisation | Impact |
|---|---|
| `highlight.js` core-only (13 languages) | 981 KB → 70 KB |
| `React.lazy()` on all 7 pages | ~60% faster initial load |
| Render keep-alive ping every 14 min | No cold-start delays |
| Session TTL garbage collection (2hr) | No memory leak |
| Vite `manualChunks` code splitting | 6 cacheable chunks |

---

## 🚀 Local Development

```bash
# Backend
cd backend && cp .env.example .env
# Add GROQ_API_KEY to .env
npm install && npm run dev   # → http://localhost:3001

# Frontend (new terminal)
cd frontend && cp .env.example .env
npm install && npm run dev   # → http://localhost:5173
```

**Demo login:** `admin@sudharshan.ai` / `password123`

---

## ☁️ Deployment

**Backend → Render**
- Root Dir: `backend` | Build: `npm install` | Start: `npm start`
- Env vars: `GROQ_API_KEY`, `JWT_SECRET`, `FRONTEND_URL`, `MONGODB_URI`

**Frontend → Vercel**
- Root Dir: `frontend` | Build: `npm run build` | Output: `dist`
- Env var: `VITE_API_URL=https://your-backend.onrender.com`

---

## 🛠️ Tech Stack

React 18 · Vite 5 · TanStack Query · Framer Motion · Recharts · Node.js · Express · Groq API · MongoDB · Socket.IO · JWT · Vercel · Render

---

## 🧠 What I Learned

- SSE streaming requires Fetch API + ReadableStream — axios doesn't support it
- `highlight.js` full bundle = 981KB. Core + 13 languages = 70KB. Profile your bundles.
- Render free tier cold starts are fixed with a 14-min keep-alive ping
- Design tokens (`G`, `GL`, `GD`) prevent color drift across 8+ pages

---

<p align="center"><i>ॐ नमो भगवते वासुदेवाय</i></p>
