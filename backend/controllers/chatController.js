const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 · 70B', ctx: '128k', tag: 'Best' },
  { id: 'llama-3.1-8b-instant',    name: 'Llama 3.1 · 8B',  ctx: '128k', tag: 'Fastest' },
  { id: 'openai/gpt-oss-120b',     name: 'GPT OSS · 120B',  ctx: '128k', tag: 'Powerful' },
  { id: 'openai/gpt-oss-20b',      name: 'GPT OSS · 20B',   ctx: '128k', tag: 'Fast' },
];

// Per-user in-memory sessions with hard caps — fixes memory leak
const userSessions = new Map();
const MAX_USERS    = 500;
const MAX_SESSIONS = 20;
const SESSION_TTL  = 2 * 60 * 60 * 1000; // 2 hours

// Periodic GC — runs every 30 min, removes stale sessions + their uploaded files
setInterval(() => {
  const now = Date.now();
  let evicted = 0;
  for (const [userId, store] of userSessions.entries()) {
    for (const [sessId, sess] of store.entries()) {
      if (now - sess.lastActive > SESSION_TTL) {
        sess.files?.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
        store.delete(sessId);
        evicted++;
      }
    }
    if (store.size === 0) userSessions.delete(userId);
  }
  if (evicted > 0) console.log(`[session-gc] evicted ${evicted} stale sessions`);
}, 30 * 60 * 1000);

function getUserStore(userId) {
  if (!userSessions.has(userId) && userSessions.size >= MAX_USERS) {
    let oldestKey, oldestTime = Infinity;
    for (const [uid, store] of userSessions.entries()) {
      const lastActive = Math.max(...[...store.values()].map(s => s.lastActive));
      if (lastActive < oldestTime) { oldestTime = lastActive; oldestKey = uid; }
    }
    if (oldestKey) userSessions.delete(oldestKey);
  }
  if (!userSessions.has(userId)) userSessions.set(userId, new Map());
  return userSessions.get(userId);
}

function getSession(userId, sessionId) {
  const store = getUserStore(userId);
  if (sessionId && store.has(sessionId)) {
    const s = store.get(sessionId);
    s.lastActive = Date.now();
    return s;
  }
  if (store.size >= MAX_SESSIONS) {
    let oldestId, oldestTime = Infinity;
    for (const [id, s] of store.entries()) {
      if (s.lastActive < oldestTime) { oldestTime = s.lastActive; oldestId = id; }
    }
    const old = store.get(oldestId);
    old?.files?.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
    store.delete(oldestId);
  }
  const sid = uuid();
  const s = {
    id: sid, title: 'New Chat', messages: [], files: [],
    model: 'llama-3.3-70b-versatile',
    createdAt: Date.now(), lastActive: Date.now(),
  };
  store.set(sid, s);
  return s;
}

function sanitizeMessage(msg) {
  if (typeof msg !== 'string') return null;
  const trimmed = msg.trim();
  if (!trimmed || trimmed.length > 32000) return null;
  return trimmed;
}

exports.getModels = (req, res) => res.json(MODELS);

exports.getSessions = (req, res) => {
  const store = getUserStore(req.user.id);
  const list = [...store.values()]
    .sort((a, b) => b.lastActive - a.lastActive)
    .map(s => ({ id: s.id, title: s.title, msgCount: s.messages.length, model: s.model, createdAt: s.createdAt, lastActive: s.lastActive }));
  res.json(list);
};

exports.getSession = (req, res) => {
  const store = getUserStore(req.user.id);
  const s = store.get(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json({
    id: s.id, title: s.title, model: s.model,
    messages: s.messages,
    files: s.files.map(f => ({ id: f.id, name: f.name, type: f.type, size: f.size, url: f.url })),
    createdAt: s.createdAt,
  });
};

exports.deleteSession = (req, res) => {
  const store = getUserStore(req.user.id);
  const sess = store.get(req.params.id);
  sess?.files?.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
  store.delete(req.params.id);
  res.json({ ok: true });
};

exports.updateTitle = (req, res) => {
  const store = getUserStore(req.user.id);
  const s = store.get(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  const title = typeof req.body.title === 'string' ? req.body.title.trim().slice(0, 120) : s.title;
  s.title = title || s.title;
  res.json({ ok: true, title: s.title });
};

exports.uploadFiles = (req, res) => {
  const { sessionId } = req.body;
  if (!req.files?.length) return res.status(400).json({ error: 'No files received' });
  const sess = getSession(req.user.id, sessionId);
  const added = req.files.map(f => {
    const textMimes = ['text/', 'application/json', 'application/javascript', 'application/xml'];
    let content = null;
    if (textMimes.some(m => f.mimetype.startsWith(m))) {
      try { content = fs.readFileSync(f.path, 'utf8').slice(0, 15000); } catch {}
    }
    const meta = { id: uuid(), name: f.originalname, type: f.mimetype, size: f.size, path: f.path, url: `/uploads/${path.basename(f.path)}`, content };
    sess.files.push(meta);
    return { id: meta.id, name: meta.name, type: meta.type, size: meta.size, url: meta.url, readable: !!content };
  });
  res.json({ sessionId: sess.id, files: added });
};

exports.deleteFile = (req, res) => {
  const { sessionId } = req.body;
  const store = getUserStore(req.user.id);
  const sess = store.get(sessionId);
  if (!sess) return res.status(404).json({ error: 'Session not found' });
  const idx = sess.files.findIndex(f => f.id === req.params.fileId);
  if (idx === -1) return res.status(404).json({ error: 'File not found' });
  try { fs.unlinkSync(sess.files[idx].path); } catch {}
  sess.files.splice(idx, 1);
  res.json({ ok: true });
};

exports.chat = async (req, res) => {
  const safe = sanitizeMessage(req.body.message);
  if (!safe) return res.status(400).json({ error: 'Message must be a non-empty string under 32,000 characters' });

  const { sessionId, model = 'llama-3.3-70b-versatile' } = req.body;
  const allowedModels = MODELS.map(m => m.id);
  const safeModel = allowedModels.includes(model) ? model : 'llama-3.3-70b-versatile';

  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    return res.status(500).json({ error: 'No GROQ_API_KEY configured on server.' });
  }

  const sess = getSession(req.user.id, sessionId);
  sess.model = safeModel;
  if (sess.messages.length === 0) {
    sess.title = safe.slice(0, 55) + (safe.length > 55 ? '…' : '');
  }

  let system = `You are Sudharshan AI, an elite AI assistant built for professional developers and teams.
- Expert in all programming languages, system design, algorithms, debugging, architecture
- Precise, thoughtful, direct. No fluff. Use markdown with proper code blocks.
- Always include language identifiers in code fences
- Current date: ${new Date().toUTCString()}
- User: ${req.user.name} (${req.user.role})`;

  const readableFiles = sess.files.filter(f => f.content);
  if (readableFiles.length) {
    system += '\n\nATTACHED FILES:\n';
    readableFiles.forEach(f => { system += `\n--- FILE: ${f.name} ---\n${f.content}\n--- END ---\n`; });
  }

  const history = sess.messages.slice(-50).map(m => ({ role: m.role, content: m.content }));

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sse = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: safeModel, stream: true, max_tokens: 8192, temperature: 0.7,
        messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: safe }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      sse({ t: 'error', error: err?.error?.message || `Groq error ${response.status}` });
      return res.end();
    }

    sess.messages.push({ role: 'user', content: safe, ts: Date.now() });

    let full = '';
    const reader = response.body.getReader();
    const dec = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === '[DONE]') continue;
        try {
          const chunk = JSON.parse(raw);
          const delta = chunk.choices?.[0]?.delta?.content || '';
          if (delta) { full += delta; sse({ t: 'd', v: delta }); }
        } catch {}
      }
    }

    sess.messages.push({ role: 'assistant', content: full, ts: Date.now() });
    sse({ t: 'done', sessionId: sess.id, title: sess.title });
    res.end();
  } catch (err) {
    sse({ t: 'error', error: err.message });
    res.end();
  }
};
