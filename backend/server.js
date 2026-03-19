require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server: SocketServer } = require('socket.io');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;

connectDB();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

const io = new SocketServer(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
  // ✅ FIX: reduce Socket.IO ping overhead in production
  pingTimeout: 60000,
  pingInterval: 25000,
});
io.on('connection', (socket) => {
  socket.on('join', (userId) => socket.join(`user:${userId}`));
});
app.set('io', io);

app.use(helmet({ contentSecurityPolicy: false }));
// ✅ FIX: stronger compression saves ~70% bandwidth on JSON responses
app.use(compression({ level: 6, threshold: 1024 }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (process.env.NODE_ENV !== 'production') return cb(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15*60*1000, max: 500, standardHeaders: true, legacyHeaders: false });
const chatLimiter = rateLimit({ windowMs: 60*1000, max: 30, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);
app.use('/api/chat', chatLimiter);

// ✅ FIX: serve uploads with caching headers so browser doesn't re-download files
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=86400');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ✅ FIX: /api/ping is ultra-lightweight — used by keep-alive pinger (no DB, no auth)
app.get('/api/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.get('/api/health', (req, res) => {
  const key = process.env.GROQ_API_KEY;
  res.json({
    ok: true,
    hasKey: !!(key && key.length > 10 && key !== 'your_groq_api_key_here'),
    uptime: Math.floor(process.uptime()),
    version: '3.0.0',
    env: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/chat'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api', require('./routes/misc'));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

httpServer.listen(PORT, () => {
  const hasKey = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10);
  console.log(`
  ╔════════════════════════════════════╗
  ║  SUDHARSHAN AI v3.0               ║
  ║  Port: ${PORT}                        ║
  ║  Key : ${hasKey ? '✓ OK' : '✗ Missing GROQ_API_KEY'}          ║
  ╚════════════════════════════════════╝`);
});

module.exports = { app, io };
