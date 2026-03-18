# 🌟 Sudharshan AI — Enterprise Platform v3.0

A full-stack AI enterprise workspace with real-time chat (Groq API), analytics, project management, team collaboration, and more.

## ⚡ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS → **Vercel**
- **Backend**: Node.js + Express + Socket.io → **Render**
- **AI**: Groq API (Llama 3.3 70B, Llama 3.1 8B, GPT OSS)
- **DB**: MongoDB Atlas (optional — falls back to in-memory)

---

## 🚀 Deploy in 15 Minutes

### Step 1 — Get a Free Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up → API Keys → **Create Key**
3. Copy the key (starts with `gsk_`)

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit — Sudharshan AI v3.0"
git remote add origin https://github.com/YOUR_USERNAME/sudharshan-ai.git
git push -u origin main
```

### Step 3 — Deploy Backend on Render
1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18+
4. Add **Environment Variables**:
   ```
   NODE_ENV=production
   GROQ_API_KEY=gsk_your_key_here
   JWT_SECRET=any_long_random_string_here
   FRONTEND_URL=https://your-app.vercel.app
   MONGODB_URI=          ← leave blank for in-memory, or add MongoDB Atlas URI
   ```
5. Click **Deploy** — note your Render URL (e.g. `https://sudharshan-ai.onrender.com`)

### Step 4 — Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:
   ```
   VITE_API_URL=https://sudharshan-ai.onrender.com
   ```
   *(use your actual Render URL — no trailing slash)*
5. Click **Deploy** — get your Vercel URL

### Step 5 — Link Frontend URL in Render
Go back to Render → your service → **Environment** → update:
```
FRONTEND_URL=https://your-actual-app.vercel.app
```
Then click **Manual Deploy → Deploy latest commit**

---

## 🔐 Default Login
```
Email:    admin@kova.ai
Password: password123
```

---

## 💻 Local Development

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
npm install
npm run dev       # → http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev       # → http://localhost:5173
```

---

## 🔧 Features

| Feature | Status |
|---------|--------|
| Real-time AI chat (Groq streaming) | ✅ |
| Multi-session chat history | ✅ |
| File upload + AI analysis | ✅ |
| Model selector (Llama 3.3, 3.1, GPT OSS) | ✅ |
| Dashboard with analytics | ✅ |
| Project management (Kanban) | ✅ |
| Team management | ✅ |
| Notifications system | ✅ |
| Settings & profile | ✅ |
| JWT auth (register/login) | ✅ |
| MongoDB (optional) | ✅ |
| In-memory fallback | ✅ |
| WebSocket (Socket.io) | ✅ |

---

## 📁 Project Structure

```
sudharshan-ai/
├── backend/
│   ├── controllers/    # Business logic
│   ├── routes/         # Express routes
│   ├── models/         # Mongoose schemas
│   ├── middlewares/    # JWT auth
│   ├── config/         # DB connection
│   ├── uploads/        # File uploads
│   ├── server.js       # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/      # All page components
│   │   ├── hooks/      # useAuth, useToast
│   │   ├── services/   # api.js (axios)
│   │   ├── layouts/    # AppLayout (sidebar + header)
│   │   └── styles/     # globals.css
│   ├── vercel.json     # SPA routing
│   └── package.json
└── README.md
```
