

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi, getUploadUrl, getChatUrl } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  Plus, Trash2, Send, Paperclip, Code2, Search, X,
  MessageSquare, Copy, Check, ChevronDown, Loader2,
  StopCircle, RefreshCw, Zap, Brain, Cpu, Gauge,
  AlertCircle, Info, Pencil, Bot, User2, Sparkles,
  Clock, Hash, Activity, ArrowUpRight, MoreHorizontal,
} from 'lucide-react';
import { marked } from 'marked';
import hljs from 'highlight.js';

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS — exact match with entire app
══════════════════════════════════════════════════════════════ */
const G    = '#C97700';
const GL   = '#E8920A';
const GD   = '#3D1F00';
const GM   = '#7A4F00';
const GSoft  = 'rgba(201,119,0,.08)';
const GBorder = 'rgba(201,119,0,.2)';
const CREAM  = '#FFFDF5';
const CREAM2 = '#FFF8E5';
const CREAM3 = '#FEF3D0';
const LINE   = 'rgba(201,119,0,.13)';
const LINEB  = 'rgba(201,119,0,.22)';
const C = {
  green:'#059669', greenBg:'rgba(5,150,105,.09)',
  red:'#DC2626',   redBg:'rgba(220,38,38,.09)',
  blue:'#0EA5E9',  blueBg:'rgba(14,165,233,.09)',
};

/* ── Marked / highlight.js setup ── */
const renderer = new marked.Renderer();
renderer.code = (code, lang) => {
  const l = lang || 'plaintext';
  let hl = '';
  try { hl = hljs.highlight(code, { language: l, ignoreIllegals: true }).value; }
  catch { hl = hljs.highlightAuto(code).value; }
  return `<div class="cp-code-block"><div class="cp-code-header"><span class="cp-code-lang">${l}</span><button class="cp-code-copy" data-copy><span class="cp-copy-icon">⎘</span>Copy</button></div><pre><code class="hljs language-${l}">${hl}</code></pre></div>`;
};
marked.use({ renderer, breaks: true, gfm: true });

/* ── Model metadata ── */
const MODEL_META = {
  'llama-3.3-70b-versatile': { Icon: Zap,    label: 'Llama 3.3 · 70B',  speed: '280 t/s', tier: 'Best'    },
  'llama-3.1-8b-instant':    { Icon: Gauge,   label: 'Llama 3.1 · 8B',   speed: '560 t/s', tier: 'Fastest' },
  'openai/gpt-oss-120b':     { Icon: Brain,   label: 'GPT OSS · 120B',   speed: '500 t/s', tier: 'Powerful'},
  'openai/gpt-oss-20b':      { Icon: Cpu,     label: 'GPT OSS · 20B',    speed: '1000 t/s',tier: 'Fastest' },
  'mixtral-8x7b-32768':      { Icon: Sparkles,label: 'Mixtral MoE · 8x7',speed: '400 t/s', tier: 'Power'   },
  'gemma2-9b-it':            { Icon: Activity,label: 'Gemma 2 · 9B',     speed: '480 t/s', tier: 'Fast'    },
};
const TIER_COLORS = {
  Best:     { bg: GSoft,           c: G,        b: GBorder           },
  Fastest:  { bg: C.greenBg,       c: C.green,  b: 'rgba(5,150,105,.3)'  },
  Powerful: { bg: 'rgba(124,58,237,.09)', c: '#7C3AED', b: 'rgba(124,58,237,.3)' },
  Power:    { bg: 'rgba(124,58,237,.09)', c: '#7C3AED', b: 'rgba(124,58,237,.3)' },
  Fast:     { bg: C.blueBg,        c: C.blue,   b: 'rgba(14,165,233,.3)' },
};

/* ══════════════════════════════════════════════════════════════
   CHAKRA SVG
══════════════════════════════════════════════════════════════ */
function ChakraIcon({ size = 28, spin = true, speed = '12s' }) {
  const sp = Array.from({ length: 16 }, (_, i) => {
    const a = (i * 22.5 * Math.PI) / 180;
    return { id: i, x1: 50+21*Math.cos(a), y1: 50+21*Math.sin(a), x2: 50+43*Math.cos(a), y2: 50+43*Math.sin(a) };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ display:'block', flexShrink:0, animation: spin ? `cpChakraSpin ${speed} linear infinite` : 'none' }}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={G} strokeWidth="3.5"/>
      {sp.map(s => <line key={s.id} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={G} strokeWidth="2.5" strokeLinecap="round"/>)}
      {sp.map((_, i) => { const a = (i*22.5*Math.PI)/180; return <circle key={i} cx={50+44*Math.cos(a)} cy={50+44*Math.sin(a)} r="3" fill={GL}/>; })}
      <circle cx="50" cy="50" r="17" fill={CREAM} stroke={G} strokeWidth="2.5"/>
      <circle cx="50" cy="50" r="5.5" fill={G}/>
      <circle cx="50" cy="50" r="2.2" fill="#FFAA20"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   AVATARS
══════════════════════════════════════════════════════════════ */
function AIAvatar({ size = 30 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * .3, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg,${G},${GL})`,
      boxShadow: `0 3px 12px rgba(201,119,0,.35)` }}>
      <ChakraIcon size={size * .68} speed="10s" spin={true}/>
    </div>
  );
}

function UserAvatar({ user, size = 30 }) {
  const ini = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: size * .3, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `${G}18`, color: G,
      fontSize: size * .35, fontWeight: 800, fontFamily: 'Cinzel,serif',
      border: `1px solid ${G}30` }}>
      {ini}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODEL SELECTOR
══════════════════════════════════════════════════════════════ */
function ModelSelector({ models = [], value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = models.find(m => m.id === value) || models[0];
  const meta = selected ? (MODEL_META[selected.id] || { Icon: Zap, label: selected.name, speed: '', tier: 'Best' }) : { Icon: Zap, label: 'Select', speed: '', tier: 'Best' };
  const MIcon = meta.Icon;
  const tier = TIER_COLORS[meta.tier] || TIER_COLORS.Best;

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(201,119,0,.55)', letterSpacing: '.2em',
        textTransform: 'uppercase', marginBottom: 6, fontFamily: 'Cinzel,serif' }}>AI Model</p>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
        background: GSoft, border: `1px solid ${GBorder}`,
        borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', transition: 'all .15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,119,0,.13)'}
        onMouseLeave={e => e.currentTarget.style.background = GSoft}>
        <div style={{ width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: `${G}18`, flexShrink: 0 }}>
          <MIcon size={13} color={G}/>
        </div>
        <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: GD, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected?.name || 'Select model'}
          </p>
          <p style={{ fontSize: 9, color: GM }}>{selected?.ctx} · {meta.speed}</p>
        </div>
        <ChevronDown size={11} color={G} style={{ flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}/>
      </button>

      {open && (
        <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0,
          background: `linear-gradient(160deg,${CREAM},${CREAM2})`,
          border: `1px solid ${LINEB}`, borderRadius: 16,
          boxShadow: '0 -14px 48px rgba(201,119,0,.24)', overflow: 'hidden', zIndex: 100,
          animation: 'cpFadeUp .16s cubic-bezier(.16,1,.3,1)' }}>
          <div style={{ padding: '10px 12px 6px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(201,119,0,.5)', letterSpacing: '.2em',
              textTransform: 'uppercase', fontFamily: 'Cinzel,serif' }}>Choose Model</p>
          </div>
          <div style={{ padding: '0 6px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {models.map(m => {
              const mData = MODEL_META[m.id] || { Icon: Zap, label: m.name, speed: '', tier: 'Best' };
              const MIc = mData.Icon;
              const isActive = m.id === value;
              const tc = TIER_COLORS[mData.tier] || TIER_COLORS.Best;
              return (
                <button key={m.id} onClick={() => { onChange(m.id); setOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
                    background: isActive ? `linear-gradient(135deg,${G},${GL})` : 'transparent',
                    border: `1px solid ${isActive ? 'transparent' : 'transparent'}`,
                    borderRadius: 11, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
                    textAlign: 'left', transition: 'all .15s' }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = GSoft; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? 'rgba(255,255,255,.2)' : GSoft }}>
                    <MIc size={13} color={isActive ? 'white' : G}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: isActive ? 'white' : GD, lineHeight: 1.2 }}>{m.name}</p>
                    <p style={{ fontSize: 9, color: isActive ? 'rgba(255,255,255,.7)' : GM }}>{mData.label} · {m.ctx} · {mData.speed}</p>
                  </div>
                  {m.tag && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6, flexShrink: 0,
                      background: isActive ? 'rgba(255,255,255,.2)' : tc.bg,
                      color: isActive ? 'white' : tc.c,
                      border: `1px solid ${isActive ? 'rgba(255,255,255,.25)' : tc.b}` }}>
                      {m.tag}
                    </span>
                  )}
                  {isActive && <Check size={11} color="white" style={{ flexShrink: 0 }}/>}
                </button>
              );
            })}
          </div>
          <div style={{ margin: '0 8px 8px', padding: '6px 10px', background: GSoft,
            borderRadius: 9, display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green,
              boxShadow: `0 0 6px ${C.green}`, flexShrink: 0 }}/>
            <span style={{ fontSize: 9, color: GM, fontWeight: 600 }}>Powered by Groq · Free Tier</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SESSION ITEM
══════════════════════════════════════════════════════════════ */
function SessionItem({ s, active, onLoad, onDelete }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onLoad}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', marginBottom: 2,
        borderRadius: 11, cursor: 'pointer', transition: 'all .15s',
        background: active ? `linear-gradient(135deg,rgba(201,119,0,.15),rgba(232,146,10,.08))` : hov ? GSoft : 'transparent',
        border: `1px solid ${active ? LINEB : hov ? LINE : 'transparent'}` }}>
      <MessageSquare size={11} color={active ? G : GM} style={{ flexShrink: 0 }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: active ? GD : GM, fontWeight: active ? 600 : 400 }}>{s.title}</p>
        {s.msgCount && <p style={{ fontSize: 9, color: 'rgba(122,79,0,.4)', marginTop: 1 }}>{s.msgCount} msgs</p>}
      </div>
      <button onClick={e => { e.stopPropagation(); onDelete(s.id); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2,
          color: C.red, opacity: hov ? 1 : 0, transition: 'opacity .15s', flexShrink: 0, display: 'flex' }}>
        <Trash2 size={10}/>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TYPING DOTS
══════════════════════════════════════════════════════════════ */
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: G,
          animation: `cpDotPulse 1.2s ease-in-out ${i * .2}s infinite` }}/>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
══════════════════════════════════════════════════════════════ */
function MessageBubble({ msg, user, onRegenerate, isLast }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;
    contentRef.current.querySelectorAll('[data-copy]').forEach(btn => {
      btn.onclick = async () => {
        const code = btn.closest('.cp-code-block')?.querySelector('code')?.innerText || '';
        await navigator.clipboard.writeText(code).catch(() => {});
        btn.innerHTML = '✓ Copied';
        btn.style.color = C.green;
        setTimeout(() => { btn.innerHTML = '<span class="cp-copy-icon">⎘</span>Copy'; btn.style.color = ''; }, 1800);
      };
    });
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.content).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  const timeStr = new Date(msg.ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return (
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexDirection: 'row-reverse' }}>
        <UserAvatar user={user} size={30}/>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '72%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 9.5, color: 'rgba(122,79,0,.45)' }}>{timeStr}</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: GD, fontFamily: 'Cinzel,serif' }}>You</span>
          </div>
          <div style={{ padding: '11px 16px', maxWidth: '100%',
            background: `linear-gradient(135deg,${G},${GL})`,
            color: 'white', borderRadius: '16px 16px 4px 16px',
            fontSize: 13.5, lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            boxShadow: '0 4px 18px rgba(201,119,0,.3)' }}>
            {msg.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
      <AIAvatar size={30}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: GD, fontFamily: 'Cinzel,serif' }}>Sudharshan AI</span>
          <span style={{ fontSize: 9.5, color: 'rgba(122,79,0,.45)' }}>{timeStr}</span>
        </div>
        <div style={{ background: `linear-gradient(145deg,${CREAM},${CREAM2})`,
          border: `1px solid ${LINE}`, borderRadius: '4px 16px 16px 16px',
          padding: '12px 16px', boxShadow: '0 2px 12px rgba(201,119,0,.07)' }}>
          <div ref={contentRef} className="cp-prose"
            dangerouslySetInnerHTML={{ __html: marked.parse(msg.content || '') }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7 }}>
          <button onClick={handleCopy} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
            background: GSoft, border: `1px solid ${LINE}`,
            borderRadius: 8, cursor: 'pointer', fontSize: 11, color: GM, fontFamily: 'Outfit,sans-serif',
            transition: 'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,119,0,.14)'}
            onMouseLeave={e => e.currentTarget.style.background = GSoft}>
            {copied ? <Check size={10} color={C.green}/> : <Copy size={10} color={GM}/>}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {isLast && onRegenerate && (
            <button onClick={onRegenerate} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
              background: GSoft, border: `1px solid ${LINE}`,
              borderRadius: 8, cursor: 'pointer', fontSize: 11, color: GM, fontFamily: 'Outfit,sans-serif',
              transition: 'all .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,119,0,.14)'}
              onMouseLeave={e => e.currentTarget.style.background = GSoft}>
              <RefreshCw size={10} color={GM}/> Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STARTER PROMPTS
══════════════════════════════════════════════════════════════ */
const STARTERS = [
  { Icon: Zap,       q: 'Write a production REST API in Node.js with JWT auth and rate limiting', label: 'Build REST API',     sub: 'Node.js + Express' },
  { Icon: Code2,     q: 'Explain React hooks with practical examples including useState, useEffect and custom hooks', label: 'React Hooks',      sub: 'useState, useEffect' },
  { Icon: Bot,       q: 'Design a scalable microservices architecture for 10 million users with fault tolerance', label: 'System Design',    sub: 'Scalable architecture' },
  { Icon: Sparkles,  q: 'Review my code for bugs, security issues and performance improvements', label: 'Code Review',      sub: 'Bugs & security' },
  { Icon: Brain,     q: 'Explain large language models and transformers in depth with examples', label: 'Explain AI/LLMs',   sub: 'Transformers, attention' },
  { Icon: Activity,  q: 'Write SQL queries for complex aggregations and window functions', label: 'SQL & Analytics',   sub: 'Window functions' },
];

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const { user }   = useAuth();
  const { toast }  = useToast();
  const qc         = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [sessId,    setSessId]    = useState(searchParams.get('s'));
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [busy,      setBusy]      = useState(false);
  const [streaming, setStreaming] = useState('');
  const [attached,  setAttached]  = useState([]);
  const [model,     setModel]     = useState('llama-3.3-70b-versatile');
  const [codeMode,  setCodeMode]  = useState(false);
  const [searchQ,   setSearchQ]   = useState('');
  const [health,    setHealth]    = useState(null);

  const abortRef  = useRef(null);
  const msgsRef   = useRef(null);
  const inputRef  = useRef(null);
  const fileRef   = useRef(null);
  const taRef     = useRef(null);

  /* ── Queries ── */
  const { data: sessions = [], refetch: refetchSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn:  () => chatApi.sessions().then(r => r.data),
    refetchInterval: 12000,
  });
  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn:  () => chatApi.models().then(r => r.data),
  });

  /* ── Health check ── */
  useEffect(() => {
    chatApi.health().then(r => setHealth(r.data)).catch(() => {});
  }, []);

  /* ── URL param sync ── */
  useEffect(() => {
    const sid = searchParams.get('s');
    if (sid && sid !== sessId) loadSession(sid);
  }, [searchParams]);

  const scrollBottom = useCallback(() => {
    setTimeout(() => msgsRef.current?.scrollTo({ top: msgsRef.current.scrollHeight, behavior: 'smooth' }), 50);
  }, []);

  const loadSession = useCallback(async (sid) => {
    try {
      const r = await chatApi.session(sid);
      setSessId(sid);
      setMessages(r.data.messages || []);
      setModel(r.data.model || 'llama-3.3-70b-versatile');
      scrollBottom();
    } catch { toast('Could not load session', 'error'); }
  }, [scrollBottom, toast]);

  const startNew = useCallback(() => {
    setSessId(null); setMessages([]); setAttached([]);
    setStreaming(''); setBusy(false);
    setSearchParams({}); setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [setSearchParams]);

  const deleteSession = useCallback(async (id) => {
    await chatApi.deleteSession(id).catch(() => {});
    if (id === sessId) startNew();
    refetchSessions();
    qc.invalidateQueries({ queryKey: ['sessions'] });
    toast('Conversation deleted', 'success');
  }, [sessId, startNew, refetchSessions, qc, toast]);

  const uploadFiles = useCallback(async (files) => {
    if (!files?.length) return;
    const fd = new FormData();
    [...files].forEach(f => fd.append('files', f));
    if (sessId) fd.append('sessionId', sessId);
    const token = localStorage.getItem('kova_token');
    try {
      const r = await fetch(getUploadUrl(), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await r.json();
      if (!sessId && data.sessionId) { setSessId(data.sessionId); setSearchParams({ s: data.sessionId }); }
      setAttached(a => [...a, ...data.files]);
      toast(`${data.files.length} file(s) attached`, 'success');
    } catch { toast('Upload failed', 'error'); }
  }, [sessId, setSearchParams, toast]);

  /* ── Send message ── */
  const send = useCallback(async (text) => {
    if (!text?.trim() || busy) return;
    if (!health?.hasKey) { toast('Add GROQ_API_KEY to backend/.env to use AI', 'error'); return; }
    let finalText = text.trim();
    if (codeMode && !finalText.includes('```')) finalText = '```\n' + finalText + '\n```';

    setBusy(true); setStreaming('');
    setMessages(m => [...m, { role: 'user', content: finalText, ts: Date.now() }]);
    scrollBottom(); setInput('');
    if (taRef.current) { taRef.current.style.height = 'auto'; }

    const controller = new AbortController(); abortRef.current = controller;
    const token = localStorage.getItem('kova_token');

    try {
      const resp = await fetch(getChatUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: finalText, sessionId: sessId, model }),
        signal: controller.signal,
      });
      if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || `Error ${resp.status}`); }

      const reader = resp.body.getReader(); const dec = new TextDecoder();
      let buf = '', full = '';

      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim(); if (!raw) continue;
          try {
            const ev = JSON.parse(raw);
            if (ev.t === 'd') { full += ev.v; setStreaming(full); scrollBottom(); }
            else if (ev.t === 'done') {
              if (ev.sessionId && !sessId) { setSessId(ev.sessionId); setSearchParams({ s: ev.sessionId }); }
              setMessages(m => [...m, { role: 'assistant', content: full, ts: Date.now() }]);
              setStreaming(''); refetchSessions(); qc.invalidateQueries({ queryKey: ['sessions'] });
            } else if (ev.t === 'error') throw new Error(ev.error);
          } catch (e) { if (e.message !== 'Unexpected end of JSON input') throw e; }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') toast(e.message || 'Something went wrong', 'error');
      setStreaming('');
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [busy, sessId, model, codeMode, health, scrollBottom, refetchSessions, qc, toast, setSearchParams]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort(); setBusy(false); setStreaming('');
  }, []);

  const regenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) {
      setMessages(m => m.slice(0, -1));
      send(lastUser.content);
    }
  }, [messages, send]);

  /* ── Textarea auto-resize ── */
  const handleInput = e => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const filteredSessions = sessions.filter(s =>
    !searchQ || s.title.toLowerCase().includes(searchQ.toLowerCase())
  );

  const hasApiKey = health?.hasKey;

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes cpChakraSpin { to { transform: rotate(360deg); } }
        @keyframes cpDotPulse   { 0%,100%{opacity:.35;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes cpFadeUp     { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes cpSlideUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }

        /* Prose styles */
        .cp-prose{font-size:13.5px;line-height:1.72;color:${GD};font-family:Outfit,sans-serif}
        .cp-prose p{margin:0 0 10px}.cp-prose p:last-child{margin-bottom:0}
        .cp-prose ul,.cp-prose ol{padding-left:20px;margin:0 0 10px}
        .cp-prose li{margin-bottom:5px}
        .cp-prose strong{font-weight:700;color:${GD}}
        .cp-prose em{color:${GM}}
        .cp-prose h1,.cp-prose h2,.cp-prose h3{font-family:Cinzel,serif;color:${GD};font-weight:700;margin:16px 0 8px;line-height:1.3}
        .cp-prose h1{font-size:18px}.cp-prose h2{font-size:15px}.cp-prose h3{font-size:13px}
        .cp-prose a{color:${G};text-decoration:underline}
        .cp-prose blockquote{border-left:3px solid ${G};padding:6px 14px;color:${GM};margin:10px 0;font-style:italic;background:${GSoft};border-radius:0 8px 8px 0}
        .cp-prose table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12.5px}
        .cp-prose th{padding:7px 12px;background:${GSoft};font-weight:700;color:${GD};text-align:left;border:1px solid rgba(201,119,0,.15)}
        .cp-prose td{padding:7px 12px;border:1px solid rgba(201,119,0,.1);color:${GM}}
        .cp-prose code:not(.hljs){background:rgba(201,119,0,.1);color:${G};padding:1px 5px;border-radius:5px;font-size:12px;font-family:monospace}
        .cp-prose hr{border:none;border-top:1px solid rgba(201,119,0,.15);margin:14px 0}

        /* Code block */
        .cp-code-block{background:#1e1a0e;border-radius:14px;overflow:hidden;margin:12px 0;border:1px solid rgba(201,119,0,.22)}
        .cp-code-header{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:rgba(201,119,0,.1);border-bottom:1px solid rgba(201,119,0,.18)}
        .cp-code-lang{font-size:10px;font-weight:700;color:${G};letter-spacing:.12em;text-transform:uppercase;font-family:monospace}
        .cp-code-copy{display:flex;align-items:center;gap:5px;background:rgba(201,119,0,.12);border:1px solid rgba(201,119,0,.22);color:rgba(176,128,80,.8);font-size:10px;padding:3px 9px;border-radius:7px;cursor:pointer;font-family:Outfit,sans-serif;transition:all .15s}
        .cp-code-copy:hover{background:rgba(201,119,0,.25);color:${G}}
        .cp-copy-icon{font-size:12px}
        .cp-code-block pre{margin:0;padding:16px 18px;overflow-x:auto}
        .cp-code-block code{font-size:12.5px;line-height:1.68;font-family:'JetBrains Mono',Consolas,monospace}

        /* Scrollbar */
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(201,119,0,.22);border-radius:4px}
        ::-webkit-scrollbar-track{background:transparent}

        /* Input focus ring */
        input:focus,textarea:focus{
          border-color:${G}!important;
          box-shadow:0 0 0 3px rgba(201,119,0,.11)!important;
          outline:none!important;
        }
        textarea{resize:none;}
        button,input,select,textarea{font-family:'Outfit',sans-serif;}
        button:hover:not(:disabled){filter:brightness(1.04)}
        *{box-sizing:border-box;margin:0;padding:0;}
      `}</style>

      <div style={{ display: 'flex', height: '100%', fontFamily: 'Outfit,sans-serif' }}>

        {/* ════════════ SIDEBAR ════════════ */}
        <div style={{ width: 232, flexShrink: 0, display: 'flex', flexDirection: 'column',
          background: `linear-gradient(180deg,${CREAM},${CREAM2} 70%,${CREAM3})`,
          borderRight: `1px solid ${LINEB}` }}>

          {/* new chat */}
          <div style={{ padding: '10px 10px 8px', flexShrink: 0, borderBottom: `1px solid ${LINE}` }}>
            <button onClick={startNew} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '9px 12px', background: `linear-gradient(135deg,${G},${GL})`,
              border: 'none', borderRadius: 12, cursor: 'pointer',
              fontSize: 12.5, fontWeight: 700, color: 'white',
              fontFamily: 'Outfit,sans-serif', boxShadow: '0 4px 14px rgba(201,119,0,.35)',
              letterSpacing: '.01em', transition: 'all .18s' }}>
              <Plus size={14}/> New Chat
            </button>
          </div>

          {/* search */}
          <div style={{ padding: '8px 10px', borderBottom: `1px solid ${LINE}`, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={11} color={GM} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: .5 }}/>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search chats…"
                style={{ width: '100%', paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6,
                  fontSize: 11.5, color: GD, background: GSoft,
                  border: `1px solid ${LINE}`, borderRadius: 9,
                  fontFamily: 'Outfit,sans-serif', boxSizing: 'border-box' }}/>
            </div>
          </div>

          {/* session list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 6px' }}>
            {filteredSessions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 12px' }}>
                <MessageSquare size={24} color='rgba(201,119,0,.2)' style={{ margin: '0 auto 10px', display: 'block' }}/>
                <p style={{ fontSize: 11.5, color: GM, fontFamily: 'Cinzel,serif', lineHeight: 1.5 }}>
                  No conversations yet
                </p>
                <p style={{ fontSize: 9, color: 'rgba(122,79,0,.35)', marginTop: 4, letterSpacing: '.1em' }}>ॐ</p>
              </div>
            )}
            {filteredSessions.map(s => (
              <SessionItem key={s.id} s={s} active={s.id === sessId}
                onLoad={() => { setSessId(s.id); loadSession(s.id); setSearchParams({ s: s.id }); }}
                onDelete={deleteSession}/>
            ))}
          </div>

          {/* model selector + status */}
          <div style={{ padding: '10px 10px 12px', borderTop: `1px solid ${LINE}`, flexShrink: 0 }}>
            <ModelSelector models={models} value={model} onChange={setModel}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9,
              padding: '6px 10px', background: hasApiKey ? C.greenBg : C.redBg,
              borderRadius: 9, border: `1px solid ${hasApiKey ? 'rgba(5,150,105,.22)' : 'rgba(220,38,38,.22)'}` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: hasApiKey ? C.green : C.red,
                boxShadow: hasApiKey ? `0 0 6px ${C.green}` : 'none' }}/>
              <span style={{ fontSize: 10, color: hasApiKey ? C.green : C.red, fontWeight: 700 }}>
                {hasApiKey ? 'Groq · Ready' : 'No API key — add to .env'}
              </span>
            </div>
          </div>
        </div>

        {/* ════════════ CHAT MAIN ════════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
          background: `linear-gradient(160deg,${CREAM} 0%,${CREAM2} 55%,${CREAM3} 100%)` }}>

          {/* messages area */}
          <div ref={msgsRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

            {/* empty / welcome state */}
            {messages.length === 0 && !streaming && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '100%', textAlign: 'center', maxWidth: 600, margin: '0 auto',
                animation: 'cpSlideUp .5s cubic-bezier(.16,1,.3,1)' }}>

                <div style={{ marginBottom: 18 }}>
                  <ChakraIcon size={68} speed="14s" spin={true}/>
                </div>
                <div style={{ fontSize: 9.5, color: 'rgba(201,119,0,.55)', fontFamily: 'Cinzel,serif',
                  letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 8 }}>
                  ॐ नमो भगवते वासुदेवाय
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: GD, fontFamily: 'Cinzel,serif',
                  marginBottom: 10, lineHeight: 1.2 }}>
                  What shall we explore?
                </h2>
                <p style={{ fontSize: 13.5, color: GM, marginBottom: 30, lineHeight: 1.7, maxWidth: 420 }}>
                  Ask anything — code, architecture, analysis, debugging.<br/>
                  Guided by divine wisdom.
                </p>

                {/* starter cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, width: '100%' }}>
                  {STARTERS.map((s, i) => {
                    const SIcon = s.Icon;
                    return (
                      <button key={i}
                        onClick={() => { setInput(s.q); inputRef.current?.focus(); }}
                        style={{ textAlign: 'left', padding: '13px 14px',
                          background: `linear-gradient(145deg,${CREAM},${CREAM2})`,
                          border: `1px solid ${LINE}`, borderRadius: 14,
                          cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
                          boxShadow: '0 2px 10px rgba(201,119,0,.07)',
                          transition: 'all .2s', animation: `cpSlideUp .5s ${i * .06}s both` }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(201,119,0,.16)'; e.currentTarget.style.borderColor = LINEB; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(201,119,0,.07)'; e.currentTarget.style.borderColor = LINE; }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 8, background: GSoft,
                            border: `1px solid ${GBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <SIcon size={13} color={G}/>
                          </div>
                          <p style={{ fontSize: 12.5, fontWeight: 700, color: GD, lineHeight: 1.2 }}>{s.label}</p>
                        </div>
                        <p style={{ fontSize: 10.5, color: GM, lineHeight: 1.4 }}>{s.sub}</p>
                      </button>
                    );
                  })}
                </div>

                {/* api key warning */}
                {!hasApiKey && health !== null && (
                  <div style={{ marginTop: 20, padding: '10px 16px', background: C.redBg,
                    border: `1px solid rgba(220,38,38,.22)`, borderRadius: 12,
                    display: 'flex', alignItems: 'center', gap: 10, maxWidth: 420, width: '100%' }}>
                    <AlertCircle size={16} color={C.red} style={{ flexShrink: 0 }}/>
                    <p style={{ fontSize: 12, color: C.red, lineHeight: 1.5 }}>
                      <strong>API key missing.</strong> Add <code style={{ background: 'rgba(220,38,38,.1)', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>GROQ_API_KEY</code> to <code style={{ background: 'rgba(220,38,38,.1)', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>backend/.env</code>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* messages */}
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} user={user}
                onRegenerate={i === messages.length - 1 && msg.role === 'assistant' ? regenerate : null}
                isLast={i === messages.length - 1}/>
            ))}

            {/* streaming response */}
            {streaming && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                <AIAvatar size={30}/>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: GD, fontFamily: 'Cinzel,serif' }}>Sudharshan AI</span>
                    <Loader2 size={11} color={G} style={{ animation: 'cpChakraSpin 1s linear infinite' }}/>
                  </div>
                  <div style={{ background: `linear-gradient(145deg,${CREAM},${CREAM2})`,
                    border: `1px solid ${LINE}`, borderRadius: '4px 16px 16px 16px',
                    padding: '12px 16px', boxShadow: '0 2px 12px rgba(201,119,0,.07)' }}>
                    <div className="cp-prose" dangerouslySetInnerHTML={{ __html: marked.parse(streaming) }}/>
                  </div>
                </div>
              </div>
            )}

            {/* thinking dots */}
            {busy && !streaming && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                <AIAvatar size={30}/>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ background: `linear-gradient(145deg,${CREAM},${CREAM2})`,
                    border: `1px solid ${LINE}`, borderRadius: '4px 16px 16px 16px',
                    boxShadow: '0 2px 12px rgba(201,119,0,.07)' }}>
                    <TypingDots/>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* attached files strip */}
          {attached.length > 0 && (
            <div style={{ padding: '8px 20px', borderTop: `1px solid ${LINE}`,
              display: 'flex', gap: 8, flexWrap: 'wrap', background: GSoft }}>
              {attached.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                  background: 'rgba(201,119,0,.1)', border: `1px solid ${LINEB}`,
                  borderRadius: 8, fontSize: 11, color: GM }}>
                  <Paperclip size={10} color={G}/>
                  <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <button onClick={() => setAttached(a => a.filter(x => x.id !== f.id))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: GM, padding: 0, display: 'flex' }}>
                    <X size={9}/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── INPUT BAR ── */}
          <div style={{ padding: '12px 20px 16px',
            background: `linear-gradient(to top,rgba(255,248,224,.98),rgba(255,252,240,.95))`,
            borderTop: `1px solid ${LINE}` }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{ border: `1.5px solid ${LINEB}`, borderRadius: 18, overflow: 'hidden',
                background: `linear-gradient(145deg,${CREAM},${CREAM2})`,
                boxShadow: '0 4px 24px rgba(201,119,0,.1)',
                transition: 'box-shadow .2s, border-color .2s' }}
                onFocusCapture={e => { e.currentTarget.style.boxShadow = '0 4px 28px rgba(201,119,0,.18)'; e.currentTarget.style.borderColor = G; }}
                onBlurCapture={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(201,119,0,.1)'; e.currentTarget.style.borderColor = LINEB; }}>

                <textarea ref={el => { inputRef.current = el; taRef.current = el; }}
                  value={input} onChange={handleInput}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder={codeMode ? 'Paste your code here… (Enter to send)' : 'Ask Sudharshan AI… (Enter to send, Shift+Enter for newline)'}
                  rows={1} disabled={busy}
                  style={{ width: '100%', padding: '14px 18px 8px', fontSize: 13.5, color: GD,
                    background: 'transparent', border: 'none', outline: 'none',
                    lineHeight: 1.65, boxSizing: 'border-box', minHeight: 52, maxHeight: 200 }}/>

                {/* toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px 12px' }}>
                  {/* attach */}
                  <button onClick={() => fileRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px',
                      background: 'transparent', border: `1px solid ${LINE}`,
                      borderRadius: 9, cursor: 'pointer', fontSize: 11.5, color: GM, transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = GSoft; e.currentTarget.style.borderColor = GBorder; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = LINE; }}>
                    <Paperclip size={12} color={GM}/> Attach
                  </button>
                  {/* code mode */}
                  <button onClick={() => setCodeMode(c => !c)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px',
                      background: codeMode ? 'rgba(201,119,0,.14)' : 'transparent',
                      border: `1px solid ${codeMode ? GBorder : LINE}`,
                      borderRadius: 9, cursor: 'pointer', fontSize: 11.5,
                      color: codeMode ? G : GM, transition: 'all .15s' }}
                    onMouseEnter={e => { if (!codeMode) { e.currentTarget.style.background = GSoft; e.currentTarget.style.borderColor = GBorder; } }}
                    onMouseLeave={e => { if (!codeMode) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = LINE; } }}>
                    <Code2 size={12} color={codeMode ? G : GM}/> Code
                  </button>

                  <div style={{ flex: 1 }}/>

                  {/* keyboard hints */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9.5, color: 'rgba(122,79,0,.45)' }}>
                    <span><kbd style={{ background: GSoft, color: GM, padding: '1px 5px', borderRadius: 4, fontSize: 9 }}>↵</kbd> send</span>
                    <span>·</span>
                    <span><kbd style={{ background: GSoft, color: GM, padding: '1px 5px', borderRadius: 4, fontSize: 9 }}>⇧↵</kbd> newline</span>
                  </div>

                  {/* send / stop */}
                  {busy ? (
                    <button onClick={stopGeneration}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                        background: C.redBg, border: `1px solid rgba(220,38,38,.25)`,
                        borderRadius: 11, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: C.red,
                        fontFamily: 'Outfit,sans-serif', transition: 'all .18s' }}>
                      <StopCircle size={13}/> Stop
                    </button>
                  ) : (
                    <button onClick={() => send(input)} disabled={!input.trim() || !hasApiKey}
                      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 20px',
                        background: input.trim() && hasApiKey ? `linear-gradient(135deg,${G},${GL})` : GSoft,
                        border: 'none', borderRadius: 11,
                        cursor: input.trim() && hasApiKey ? 'pointer' : 'not-allowed',
                        fontSize: 12.5, fontWeight: 700,
                        color: input.trim() && hasApiKey ? 'white' : 'rgba(201,119,0,.35)',
                        fontFamily: 'Outfit,sans-serif',
                        boxShadow: input.trim() && hasApiKey ? '0 3px 14px rgba(201,119,0,.35)' : 'none',
                        transition: 'all .2s' }}>
                      <Send size={13}/> Send
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" multiple style={{ display: 'none' }}
        onChange={async e => { await uploadFiles(e.target.files); e.target.value = ''; }}/>
    </>
  );
}
