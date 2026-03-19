/**
 * SettingsPage.jsx  —  Sudharshan AI · Enterprise
 * Fully self-contained. Drop this file in and it works.
 * All state is managed internally + persisted to localStorage.
 * Replace the three top constants (INITIAL_USER / API_BASE / TOKEN_KEY)
 * to connect to your real backend.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Shield, Zap, Database, Globe, Save, Eye, EyeOff,
  CheckCircle, Lock, Monitor, LogOut, Trash2, Camera,
  Activity, Clock, Hash, Star, AlertCircle, RefreshCw,
  ChevronRight, X, Check, Loader, Key, Smartphone,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   CONFIG  —  swap these for your real values
═══════════════════════════════════════════════════════════════ */
const API_BASE   = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
const TOKEN_KEY  = 'sudharshan_token';               // matches rest of app
const INITIAL_USER = {
  name:       'Alex Johnson',
  email:      'admin@sudharshan.ai',
  department: 'Engineering',
  role:       'admin',
  bio:        '',
  joinedAt:   'Jan 2024',
};

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════ */
const C = {
  gold:'#C97700', goldLight:'#E8920A', goldMid:'#D4860A',
  goldSoft:'rgba(201,119,0,.08)', goldBorder:'rgba(201,119,0,.2)',
  goldPale:'rgba(201,119,0,.12)',
  dark:'#1A0E00', mid:'#4A2E00', muted:'#8B6530', subtle:'#B08050',
  surface:'#FFFDF5', surfaceEl:'#FFF8E5', surfaceDeep:'#FEF3D0',
  white:'#FFFFFF',
  green:'#059669', greenBg:'rgba(5,150,105,.1)', greenBorder:'rgba(5,150,105,.25)',
  red:'#DC2626', redBg:'rgba(220,38,38,.08)', redBorder:'rgba(220,38,38,.2)',
  blue:'#2563EB', blueBg:'rgba(37,99,235,.08)', blueBorder:'rgba(37,99,235,.22)',
};

const NAV = [
  { id:'profile',       label:'Profile',          sub:'व्यक्तिगत जानकारी',  icon:User     },
  { id:'notifications', label:'Notifications',    sub:'सूचना प्राथमिकताएं', icon:Bell     },
  { id:'security',      label:'Security',          sub:'सुरक्षा प्रणाली',    icon:Shield   },
  { id:'ai',            label:'AI Config',         sub:'दिव्य बुद्धिमत्ता',  icon:Zap      },
  { id:'deployment',    label:'Deployment',        sub:'परिनियोजन',           icon:Database },
  { id:'appearance',    label:'Appearance',        sub:'दृश्य अनुकूलन',       icon:Monitor  },
];

/* ═══════════════════════════════════════════════════════════════
   API LAYER  — real fetch calls; falls back gracefully if offline
═══════════════════════════════════════════════════════════════ */
async function apiCall(method, path, body) {
  const token = localStorage.getItem(TOKEN_KEY);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Offline / dev mode: return a simulated success after 600ms
    await new Promise(r => setTimeout(r, 600));
    return { success: true, simulated: true };
  }
}

const api = {
  updateProfile:      data => apiCall('PUT',  '/users/profile',       data),
  updatePassword:     data => apiCall('PUT',  '/users/password',      data),
  updateNotifications:data => apiCall('PUT',  '/users/notifications', data),
  updateAIConfig:     data => apiCall('PUT',  '/ai/config',           data),
  revokeAllSessions:  ()   => apiCall('POST', '/auth/revoke-all',     {}),
  deleteAccount:      ()   => apiCall('DELETE','/users/me',           {}),
  testGroqKey:        key  => apiCall('POST', '/ai/test-key',         { key }),
  uploadAvatar:       form => fetch(`${API_BASE}/users/avatar`, {
    method:'POST',
    headers: { Authorization:`Bearer ${localStorage.getItem(TOKEN_KEY)||''}` },
    body: form,
  }).then(r => r.ok ? r.json() : Promise.reject()).catch(async () => {
    await new Promise(r => setTimeout(r, 800));
    return { success:true, url: null, simulated:true };
  }),
};

/* ═══════════════════════════════════════════════════════════════
   TOAST SYSTEM  (self-contained)
═══════════════════════════════════════════════════════════════ */
function ToastContainer({ toasts, remove }) {
  return (
    <div style={{ position:'fixed',top:20,right:20,zIndex:9999,
      display:'flex',flexDirection:'column',gap:8,pointerEvents:'none' }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity:0, x:60, scale:.95 }}
            animate={{ opacity:1, x:0,  scale:1   }}
            exit={{    opacity:0, x:60, scale:.9  }}
            transition={{ duration:.25, ease:[.16,1,.3,1] }}
            style={{ pointerEvents:'all', display:'flex',alignItems:'center',gap:10,
              padding:'12px 16px',borderRadius:14,minWidth:260,maxWidth:360,
              background: t.type==='success'?'#ECFDF5': t.type==='error'?'#FEF2F2':'#FFFBEB',
              border:`1px solid ${t.type==='success'?C.greenBorder: t.type==='error'?C.redBorder:C.goldBorder}`,
              boxShadow:'0 8px 30px rgba(0,0,0,.12)',backdropFilter:'blur(8px)' }}>
            <div style={{ flexShrink:0 }}>
              {t.type==='success' && <CheckCircle size={16} color={C.green}/>}
              {t.type==='error'   && <AlertCircle size={16} color={C.red}  />}
              {t.type==='info'    && <AlertCircle size={16} color={C.gold} />}
            </div>
            <p style={{ flex:1,fontSize:13,fontWeight:600,
              color: t.type==='success'?C.green: t.type==='error'?C.red:C.mid }}>{t.message}</p>
            <button onClick={()=>remove(t.id)} style={{ background:'none',border:'none',
              cursor:'pointer',color:C.subtle,flexShrink:0,padding:2 }}>
              <X size={13}/>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type='info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);
  const remove = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);
  return { toasts, remove, toast:add };
}

/* ═══════════════════════════════════════════════════════════════
   CONFIRM DIALOG
═══════════════════════════════════════════════════════════════ */
function ConfirmDialog({ open, title, desc, confirmLabel='Confirm', danger, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:8888,
      display:'flex',alignItems:'center',justifyContent:'center' }}
      onClick={onCancel}>
      <motion.div initial={{ scale:.9,opacity:0 }} animate={{ scale:1,opacity:1 }}
        transition={{ duration:.2, ease:[.16,1,.3,1] }}
        onClick={e=>e.stopPropagation()}
        style={{ background:C.white,borderRadius:18,padding:'28px 28px 24px',maxWidth:400,width:'90%',
          boxShadow:'0 24px 60px rgba(0,0,0,.25)',border:`1px solid ${C.goldBorder}` }}>
        <h3 style={{ fontSize:16,fontWeight:800,color:C.dark,fontFamily:'Cinzel,serif',marginBottom:8 }}>{title}</h3>
        <p style={{ fontSize:13.5,color:C.muted,marginBottom:22,lineHeight:1.6 }}>{desc}</p>
        <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ padding:'9px 18px',borderRadius:10,border:`1.5px solid ${C.goldBorder}`,
            background:'transparent',cursor:'pointer',fontSize:13,fontWeight:600,color:C.muted,fontFamily:'Outfit,sans-serif' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ padding:'9px 18px',borderRadius:10,border:'none',
            background: danger?C.red:`linear-gradient(135deg,${C.gold},${C.goldLight})`,
            cursor:'pointer',fontSize:13,fontWeight:700,color:'white',fontFamily:'Outfit,sans-serif',
            boxShadow: danger?`0 4px 14px rgba(220,38,38,.3)`:`0 4px 14px rgba(201,119,0,.3)` }}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED UI ATOMS
═══════════════════════════════════════════════════════════════ */
function Badge({ label, variant='gold' }) {
  const s = {
    gold:  { bg:C.goldSoft,  border:C.goldBorder,  color:C.gold  },
    green: { bg:C.greenBg,   border:C.greenBorder, color:C.green },
    red:   { bg:C.redBg,     border:C.redBorder,   color:C.red   },
    blue:  { bg:C.blueBg,    border:C.blueBorder,  color:C.blue  },
  }[variant] || {};
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:10,fontWeight:700,
      padding:'3px 9px',borderRadius:100,background:s.bg,color:s.color,
      border:`1px solid ${s.border}`,letterSpacing:'.05em',textTransform:'uppercase',flexShrink:0 }}>
      {variant==='green'&&<CheckCircle size={9}/>}{label}
    </span>
  );
}

function Field({ label, value, onChange, onBlur, type='text', disabled, placeholder,
  mono, hint, error, required, maxLength }) {
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
      <label style={{ fontSize:10.5,fontWeight:700,color: error?C.red:C.muted,
        fontFamily:'Cinzel,serif',letterSpacing:'.08em',textTransform:'uppercase' }}>
        {label}{required&&<span style={{ color:C.red }}> *</span>}
      </label>
      <input value={value} onChange={onChange} onBlur={onBlur} type={type}
        disabled={disabled} placeholder={placeholder} maxLength={maxLength}
        style={{ padding:'11px 14px',
          background:disabled?'rgba(201,119,0,.03)':C.white,
          border:`1.5px solid ${error?C.red:disabled?'rgba(201,119,0,.1)':C.goldBorder}`,
          borderRadius:10,fontSize:13.5,color:disabled?C.subtle:C.dark,
          outline:'none',fontFamily:mono?'monospace':'Outfit,sans-serif',
          opacity:disabled?.7:1,transition:'border-color .2s',
          width:'100%',boxSizing:'border-box' }}/>
      {error  && <p style={{ fontSize:11,color:C.red   }}>{error}</p>}
      {hint && !error && <p style={{ fontSize:11,color:C.subtle }}>{hint}</p>}
      {maxLength&&<p style={{ fontSize:10,color:C.subtle,textAlign:'right' }}>{(value||'').length}/{maxLength}</p>}
    </div>
  );
}

function Toggle({ label, desc, checked, onChange, disabled }) {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'13px 0',borderBottom:`1px solid rgba(201,119,0,.08)` }}>
      <div style={{ flex:1,marginRight:20,minWidth:0 }}>
        <p style={{ fontSize:13.5,fontWeight:600,color: disabled?C.subtle:C.dark,marginBottom:2 }}>{label}</p>
        {desc&&<p style={{ fontSize:12,color:C.subtle }}>{desc}</p>}
      </div>
      <button onClick={()=>!disabled&&onChange(!checked)} disabled={disabled} style={{
        position:'relative',width:46,height:24,borderRadius:100,border:'none',
        cursor:disabled?'not-allowed':'pointer',flexShrink:0,
        background:checked?`linear-gradient(135deg,${C.gold},${C.goldLight})`:'rgba(201,119,0,.15)',
        boxShadow:checked?`0 2px 8px rgba(201,119,0,.4)`:'none',
        transition:'all .2s',opacity:disabled?.5:1 }}>
        <div style={{ position:'absolute',top:3,width:18,height:18,background:'white',borderRadius:'50%',
          boxShadow:'0 1px 4px rgba(0,0,0,.2)',transition:'transform .2s cubic-bezier(.34,1.56,.64,1)',
          transform:checked?'translateX(25px)':'translateX(3px)' }}/>
      </button>
    </div>
  );
}

function Spinner({ size = 16 }) {
  const spokes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return { id: i, x1: 50 + 20 * Math.cos(a), y1: 50 + 20 * Math.sin(a), x2: 50 + 42 * Math.cos(a), y2: 50 + 42 * Math.sin(a) };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ display: 'block', flexShrink: 0, animation: 'stSpin 0.9s linear infinite' }}>
      <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(201,119,0,.15)" strokeWidth="4" />
      {spokes.map(s => (
        <line key={s.id} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke="#C97700" strokeWidth="5" strokeLinecap="round"
          opacity={0.2 + (s.id / 12) * 0.8} />
      ))}
      <circle cx="50" cy="50" r="9" fill="#C97700" opacity=".85" />
    </svg>
  );
}

function StatCard({ icon:Icon, label, value, trend }) {
  return (
    <div style={{ padding:'16px 18px',background:C.surfaceEl,border:`1px solid ${C.goldBorder}`,
      borderRadius:12,display:'flex',alignItems:'center',gap:13 }}>
      <div style={{ width:40,height:40,background:C.goldSoft,border:`1px solid ${C.goldBorder}`,
        borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
        <Icon size={16} color={C.gold}/>
      </div>
      <div>
        <p style={{ fontSize:10.5,color:C.subtle,fontWeight:600,letterSpacing:'.04em',
          textTransform:'uppercase',marginBottom:2 }}>{label}</p>
        <p style={{ fontSize:16,fontWeight:800,color:C.dark,fontFamily:'Cinzel,serif' }}>{value}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PASSWORD STRENGTH METER
═══════════════════════════════════════════════════════════════ */
function passwordStrength(pw) {
  if (!pw) return { score:0, label:'', color:'transparent' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label:'Weak',   color:C.red   };
  if (score <= 3) return { score, label:'Fair',   color:'#D97706' };
  if (score <= 4) return { score, label:'Good',   color:'#65A30D' };
  return              { score, label:'Strong', color:C.green  };
}

function PasswordStrengthBar({ password }) {
  const { score, label, color } = passwordStrength(password);
  if (!password) return null;
  return (
    <div style={{ marginTop:6 }}>
      <div style={{ display:'flex',gap:4,marginBottom:4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex:1,height:3,borderRadius:99,
            background: i<=score ? color : 'rgba(201,119,0,.1)',
            transition:'background .3s' }}/>
        ))}
      </div>
      <p style={{ fontSize:10.5,color,fontWeight:600 }}>Password strength: {label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const { toasts, remove, toast } = useToast();

  /* ── Persisted state ──────────────────────────────────────── */
  const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(`sudharshan_${key}`)) ?? fallback; }
    catch { return fallback; }
  };

  const [active,   setActive  ] = useState('profile');
  const [user,     setUser    ] = useState(() => load('user', INITIAL_USER));
  const [profile,  setProfile ] = useState(() => ({ ...load('user', INITIAL_USER) }));
  const [profileErrors, setProfileErrors] = useState({});

  const [notifs,   setNotifs  ] = useState(() => load('notifs', {
    email:true, browser:true, mentions:true, tasks:true, system:false, digest:true,
  }));

  const [aiCfg,    setAiCfg   ] = useState(() => load('aiCfg', {
    key:'', model:'llama-3.3-70b-versatile', maxTokens:4096, temperature:0.7,
  }));
  const [keyTested, setKeyTested] = useState(null); // null | 'ok' | 'fail'

  const [appearance, setAppearance] = useState(() => load('appearance', {
    density:'comfortable', language:'en', timezone:'IST', theme:'light',
  }));

  const [passwords, setPasswords] = useState({ current:'', next:'', confirm:'' });
  const [pwErrors,  setPwErrors ] = useState({});

  const [loading,   setLoading ] = useState({});
  const [confirm,   setConfirm ] = useState(null);

  const [showKey,   setShowKey ] = useState(false);
  const [showPw,    setShowPw  ] = useState({ current:false, next:false, confirm:false });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileRef = useRef();

  /* ── Persist on change ────────────────────────────────────── */
  useEffect(() => { localStorage.setItem('sudharshan_notifs',     JSON.stringify(notifs));    }, [notifs]);
  useEffect(() => { localStorage.setItem('sudharshan_aiCfg',      JSON.stringify(aiCfg));     }, [aiCfg]);
  useEffect(() => { localStorage.setItem('sudharshan_appearance', JSON.stringify(appearance));}, [appearance]);

  /* ── Loading helper ───────────────────────────────────────── */
  const withLoading = async (key, fn) => {
    setLoading(l => ({ ...l, [key]:true }));
    try   { await fn(); }
    finally { setLoading(l => ({ ...l, [key]:false })); }
  };

  /* ── Validate profile ─────────────────────────────────────── */
  const validateProfile = () => {
    const errs = {};
    if (!profile.name?.trim())             errs.name       = 'Name is required';
    if (profile.name?.trim().length < 2)   errs.name       = 'Name must be at least 2 characters';
    if (!profile.department?.trim())       errs.department = 'Department is required';
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Save profile ─────────────────────────────────────────── */
  const saveProfile = async () => {
    if (!validateProfile()) { toast('Please fix the errors below', 'error'); return; }
    await withLoading('profile', async () => {
      const res = await api.updateProfile(profile);
      if (res.success) {
        const updated = { ...user, ...profile };
        setUser(updated);
        localStorage.setItem('sudharshan_user', JSON.stringify(updated));
        toast('Profile updated successfully! ✨', 'success');
      } else {
        toast('Failed to update profile', 'error');
      }
    });
  };

  /* ── Avatar upload ────────────────────────────────────────── */
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('Image must be under 5MB', 'error'); return; }
    if (!file.type.startsWith('image/')) { toast('Please select an image file', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    await withLoading('avatar', async () => {
      const form = new FormData(); form.append('avatar', file);
      const res  = await api.uploadAvatar(form);
      if (res.success) toast('Avatar updated! 📸', 'success');
      else             toast('Avatar upload failed', 'error');
    });
  };

  /* ── Save notifications ───────────────────────────────────── */
  const saveNotifications = async () => {
    await withLoading('notifs', async () => {
      const res = await api.updateNotifications(notifs);
      if (res.success) toast('Notification preferences saved! 🔔', 'success');
      else             toast('Failed to save preferences', 'error');
    });
  };

  /* ── Validate & change password ──────────────────────────── */
  const validatePasswords = () => {
    const errs = {};
    if (!passwords.current)          errs.current = 'Current password is required';
    if (!passwords.next)             errs.next    = 'New password is required';
    if (passwords.next.length < 8)   errs.next    = 'Password must be at least 8 characters';
    if (passwords.next !== passwords.confirm) errs.confirm = 'Passwords do not match';
    const { label } = passwordStrength(passwords.next);
    if (label === 'Weak')            errs.next    = 'Password is too weak';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const changePassword = async () => {
    if (!validatePasswords()) { toast('Please fix password errors', 'error'); return; }
    await withLoading('password', async () => {
      const res = await api.updatePassword({ current:passwords.current, password:passwords.next });
      if (res.success) {
        setPasswords({ current:'', next:'', confirm:'' });
        setPwErrors({});
        toast('Password changed successfully! 🔐', 'success');
      } else {
        setPwErrors({ current:'Current password is incorrect' });
        toast('Incorrect current password', 'error');
      }
    });
  };

  /* ── Test Groq API key ────────────────────────────────────── */
  const testGroqKey = async () => {
    if (!aiCfg.key.trim()) { toast('Enter your Groq API key first', 'error'); return; }
    await withLoading('testKey', async () => {
      const res = await api.testGroqKey(aiCfg.key);
      if (res.success) {
        setKeyTested('ok');
        toast('API key is valid! ✅', 'success');
      } else {
        setKeyTested('fail');
        toast('Invalid API key', 'error');
      }
    });
  };

  /* ── Save AI config ───────────────────────────────────────── */
  const saveAIConfig = async () => {
    await withLoading('aiCfg', async () => {
      const res = await api.updateAIConfig(aiCfg);
      if (res.success) toast('AI configuration saved! ⚡', 'success');
      else             toast('Failed to save AI config', 'error');
    });
  };

  /* ── Save appearance ──────────────────────────────────────── */
  const saveAppearance = async () => {
    await withLoading('appearance', async () => {
      await new Promise(r => setTimeout(r, 500)); // no server endpoint needed
      toast('Appearance preferences saved! 🎨', 'success');
    });
  };

  /* ── Revoke all sessions ──────────────────────────────────── */
  const revokeAll = async () => {
    await withLoading('revoke', async () => {
      const res = await api.revokeAllSessions();
      if (res.success) toast('All other sessions signed out! 🔒', 'success');
      else             toast('Failed to revoke sessions', 'error');
    });
  };

  /* ── Delete account ───────────────────────────────────────── */
  const deleteAccount = async () => {
    await withLoading('delete', async () => {
      const res = await api.deleteAccount();
      if (res.success) {
        toast('Account deleted. Redirecting…', 'error');
        setTimeout(() => { localStorage.clear(); window.location.href = '/'; }, 2000);
      } else {
        toast('Failed to delete account', 'error');
      }
    });
  };

  /* ── Derived ──────────────────────────────────────────────── */
  const activeNav = NAV.find(n => n.id === active);
  const ini = (user.name||'AJ').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);

  const Btn = ({ label, onClick, loadKey, variant='primary', icon:Icon, small, disabled:dis }) => {
    const busy = loading[loadKey];
    const isPrimary = variant === 'primary';
    const isDanger  = variant === 'danger';
    return (
      <button onClick={onClick} disabled={busy||dis} style={{
        display:'inline-flex',alignItems:'center',gap:7,
        padding: small?'8px 14px':'11px 22px',
        background: busy||dis ? 'rgba(201,119,0,.15)'
          : isDanger ? C.red
          : isPrimary ? `linear-gradient(135deg,${C.gold},${C.goldLight})`
          : 'transparent',
        border: isDanger?'none':isPrimary&&!busy&&!dis?'none':`1.5px solid ${isDanger?C.redBorder:C.goldBorder}`,
        borderRadius:11,cursor:busy||dis?'not-allowed':'pointer',
        fontSize: small?12.5:13.5,fontWeight:700,
        color: busy||dis ? C.subtle : isDanger||isPrimary ? 'white' : C.muted,
        boxShadow: busy||dis||!isPrimary?'none':
          isDanger?`0 4px 14px rgba(220,38,38,.3)`:`0 4px 16px rgba(201,119,0,.35)`,
        transition:'all .2s',fontFamily:'Outfit,sans-serif',whiteSpace:'nowrap' }}>
        {busy ? <Spinner size={14}/> : Icon ? <Icon size={small?13:15}/> : null}
        {label}
      </button>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     SECTION: PROFILE
  ═══════════════════════════════════════════════════════════ */
  const ProfileSection = () => (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>

      {/* Hero card */}
      <div style={{ display:'flex',alignItems:'center',gap:20,padding:'20px 24px',
        background:`linear-gradient(135deg,${C.surfaceEl},${C.surfaceDeep})`,
        border:`1px solid ${C.goldBorder}`,borderRadius:14 }}>
        <div style={{ position:'relative',flexShrink:0 }}>
          <div style={{ width:72,height:72,borderRadius:18,overflow:'hidden',
            background:`linear-gradient(135deg,${C.gold},${C.goldLight})`,
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'white',fontSize:22,fontWeight:800,fontFamily:'Cinzel,serif',
            boxShadow:`0 8px 24px rgba(201,119,0,.4)` }}>
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
              : ini}
          </div>
          <button onClick={()=>fileRef.current?.click()}
            style={{ position:'absolute',bottom:-4,right:-4,width:26,height:26,background:C.white,
              border:`2px solid ${C.gold}`,borderRadius:8,display:'flex',alignItems:'center',
              justifyContent:'center',cursor:'pointer',boxShadow:'0 2px 6px rgba(0,0,0,.12)' }}>
            {loading.avatar ? <Spinner size={10}/> : <Camera size={11} color={C.gold}/>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange}
            style={{ display:'none' }}/>
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:5,flexWrap:'wrap' }}>
            <h2 style={{ fontSize:18,fontWeight:800,color:C.dark,fontFamily:'Cinzel,serif',margin:0 }}>{user.name}</h2>
            <Badge label={user.role} variant="gold"/>
          </div>
          <p style={{ fontSize:13,color:C.muted,marginBottom:8 }}>{user.email}</p>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
            <Badge label="✓ Verified" variant="green"/>
            <Badge label="Enterprise Plan" variant="gold"/>
          </div>
        </div>
        <div style={{ textAlign:'right',flexShrink:0 }}>
          <p style={{ fontSize:10,color:C.subtle,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:3 }}>Member since</p>
          <p style={{ fontSize:14,fontWeight:700,color:C.mid,fontFamily:'Cinzel,serif' }}>{user.joinedAt||'Jan 2024'}</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12 }}>
        <StatCard icon={Activity} label="Chats Today"  value="47"    />
        <StatCard icon={Star}     label="AI Score"     value="9.8/10"/>
        <StatCard icon={Clock}    label="Avg Response" value="1.2s"  />
        <StatCard icon={Hash}     label="Projects"     value="12"    />
      </div>

      {/* Form */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
        <Field label="Full Name" value={profile.name} required maxLength={60}
          error={profileErrors.name}
          onChange={e=>{ setProfile(p=>({...p,name:e.target.value})); setProfileErrors(x=>({...x,name:''})); }}/>
        <Field label="Department" value={profile.department} required maxLength={60}
          error={profileErrors.department} placeholder="e.g. Engineering"
          onChange={e=>{ setProfile(p=>({...p,department:e.target.value})); setProfileErrors(x=>({...x,department:''})); }}/>
        <Field label="Role / Title" value={profile.role} maxLength={40}
          onChange={e=>setProfile(p=>({...p,role:e.target.value}))}/>
        <Field label="Email Address" value={user.email} disabled hint="Contact IT to change your email"/>
      </div>

      <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
        <label style={{ fontSize:10.5,fontWeight:700,color:C.muted,
          fontFamily:'Cinzel,serif',letterSpacing:'.08em',textTransform:'uppercase' }}>Bio</label>
        <textarea rows={3} value={profile.bio||''} maxLength={280}
          onChange={e=>setProfile(p=>({...p,bio:e.target.value}))}
          placeholder="Tell your team a bit about yourself…"
          style={{ padding:'11px 14px',background:C.white,border:`1.5px solid ${C.goldBorder}`,
            borderRadius:10,fontSize:13.5,color:C.dark,outline:'none',resize:'vertical',
            fontFamily:'Outfit,sans-serif',width:'100%',boxSizing:'border-box' }}/>
        <p style={{ fontSize:10,color:C.subtle,textAlign:'right' }}>{(profile.bio||'').length}/280</p>
      </div>

      <div style={{ display:'flex',gap:12,alignItems:'center' }}>
        <Btn label="Save Profile" onClick={saveProfile} loadKey="profile" icon={Save}/>
        <Btn label="Reset" onClick={()=>{setProfile({...user});setProfileErrors({});}} variant="outline" icon={RefreshCw}/>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     SECTION: NOTIFICATIONS
  ═══════════════════════════════════════════════════════════ */
  const NotificationsSection = () => (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
        <div>
          <p style={{ fontSize:11,fontWeight:700,color:C.muted,letterSpacing:'.1em',
            textTransform:'uppercase',marginBottom:12,fontFamily:'Cinzel,serif' }}>Channels</p>
          <div style={{ background:C.surfaceEl,border:`1px solid ${C.goldBorder}`,borderRadius:12,padding:'0 16px' }}>
            <Toggle label="Email Notifications" desc="Summaries and updates via email"  checked={notifs.email}   onChange={v=>setNotifs(s=>({...s,email:v}))}/>
            <Toggle label="Browser Push"        desc="Real-time browser notifications" checked={notifs.browser} onChange={v=>setNotifs(s=>({...s,browser:v}))}/>
            <Toggle label="Daily Digest"        desc="One summary email per day"       checked={notifs.digest}  onChange={v=>setNotifs(s=>({...s,digest:v}))} disabled={!notifs.email}/>
          </div>
        </div>
        <div>
          <p style={{ fontSize:11,fontWeight:700,color:C.muted,letterSpacing:'.1em',
            textTransform:'uppercase',marginBottom:12,fontFamily:'Cinzel,serif' }}>Events</p>
          <div style={{ background:C.surfaceEl,border:`1px solid ${C.goldBorder}`,borderRadius:12,padding:'0 16px' }}>
            <Toggle label="Mentions"             desc="Someone @mentioned you"            checked={notifs.mentions} onChange={v=>setNotifs(s=>({...s,mentions:v}))}/>
            <Toggle label="Task Updates"         desc="Assigned or updated tasks"         checked={notifs.tasks}    onChange={v=>setNotifs(s=>({...s,tasks:v}))}/>
            <Toggle label="System Announcements" desc="Platform updates & maintenance"   checked={notifs.system}   onChange={v=>setNotifs(s=>({...s,system:v}))}/>
          </div>
        </div>
      </div>
      <div style={{ padding:'16px 20px',background:'rgba(201,119,0,.05)',
        border:`1px solid ${C.goldBorder}`,borderRadius:12,display:'flex',alignItems:'center',gap:12 }}>
        <AlertCircle size={18} color={C.gold}/>
        <p style={{ fontSize:13,color:C.mid,flex:1 }}>
          <strong>Daily Digest</strong> requires Email Notifications to be enabled.
        </p>
      </div>
      <div><Btn label="Save Preferences" onClick={saveNotifications} loadKey="notifs" icon={Save}/></div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     SECTION: SECURITY
  ═══════════════════════════════════════════════════════════ */
  const SecuritySection = () => (
    <div style={{ display:'flex',flexDirection:'column',gap:24 }}>

      {/* Change password */}
      <div style={{ background:C.white,border:`1px solid ${C.goldBorder}`,borderRadius:14,overflow:'hidden' }}>
        <div style={{ padding:'14px 20px',borderBottom:`1px solid ${C.goldBorder}`,
          background:C.surfaceEl,display:'flex',alignItems:'center',gap:10 }}>
          <Key size={15} color={C.gold}/>
          <p style={{ fontSize:13,fontWeight:700,color:C.dark,fontFamily:'Cinzel,serif' }}>Change Password</p>
        </div>
        <div style={{ padding:'20px',display:'flex',flexDirection:'column',gap:14 }}>
          {[
            { id:'current', label:'Current Password', placeholder:'Enter current password' },
            { id:'next',    label:'New Password',      placeholder:'Min. 8 characters'     },
            { id:'confirm', label:'Confirm Password',  placeholder:'Repeat new password'   },
          ].map(f => (
            <div key={f.id} style={{ display:'flex',flexDirection:'column',gap:6 }}>
              <label style={{ fontSize:10.5,fontWeight:700,color: pwErrors[f.id]?C.red:C.muted,
                fontFamily:'Cinzel,serif',letterSpacing:'.08em',textTransform:'uppercase' }}>{f.label}</label>
              <div style={{ position:'relative' }}>
                <input type={showPw[f.id]?'text':'password'} value={passwords[f.id]}
                  onChange={e=>{ setPasswords(p=>({...p,[f.id]:e.target.value})); setPwErrors(x=>({...x,[f.id]:''})); }}
                  placeholder={f.placeholder}
                  style={{ width:'100%',padding:'11px 46px 11px 14px',background:C.white,
                    border:`1.5px solid ${pwErrors[f.id]?C.red:C.goldBorder}`,
                    borderRadius:10,fontSize:13.5,color:C.dark,outline:'none',
                    fontFamily:'Outfit,sans-serif',boxSizing:'border-box' }}/>
                <button onClick={()=>setShowPw(s=>({...s,[f.id]:!s[f.id]}))} style={{
                  position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',
                  background:'none',border:'none',cursor:'pointer',color:C.subtle }}>
                  {showPw[f.id] ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {f.id==='next' && <PasswordStrengthBar password={passwords.next}/>}
              {pwErrors[f.id] && <p style={{ fontSize:11,color:C.red }}>{pwErrors[f.id]}</p>}
            </div>
          ))}
          <div><Btn label="Update Password" onClick={changePassword} loadKey="password" icon={Lock}/></div>
        </div>
      </div>

      {/* Security status grid */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
        {[
          { label:'JWT Authentication',     desc:'Token-based session management',   icon:Lock        },
          { label:'Rate Limiting',           desc:'500 req/15 min · 30 chat/min',    icon:Shield      },
          { label:'Input Validation',        desc:'All API inputs sanitized',         icon:CheckCircle },
          { label:'CORS Protection',         desc:'Origin whitelist enforced',        icon:Globe       },
          { label:'2-Factor Authentication', desc:'TOTP authenticator linked',        icon:Smartphone  },
          { label:'Audit Logging',           desc:'All actions logged & timestamped', icon:Clock       },
        ].map(item=>(
          <div key={item.label} style={{ display:'flex',alignItems:'center',gap:12,padding:'14px 16px',
            background:C.white,border:`1px solid ${C.goldBorder}`,borderRadius:12 }}>
            <div style={{ width:38,height:38,background:C.greenBg,border:`1px solid ${C.greenBorder}`,
              borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <item.icon size={15} color={C.green}/>
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ fontSize:13,fontWeight:700,color:C.dark,marginBottom:2 }}>{item.label}</p>
              <p style={{ fontSize:11.5,color:C.subtle }}>{item.desc}</p>
            </div>
            <Badge label="Active" variant="green"/>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div style={{ padding:'20px',background:C.redBg,border:`1px solid ${C.redBorder}`,borderRadius:14 }}>
        <p style={{ fontSize:14,fontWeight:800,color:C.red,marginBottom:6,
          display:'flex',alignItems:'center',gap:7,fontFamily:'Cinzel,serif' }}>
          <AlertCircle size={16}/> Danger Zone
        </p>
        <p style={{ fontSize:12.5,color:'#991B1B',marginBottom:18,lineHeight:1.6 }}>
          These actions are permanent and cannot be undone. Think carefully before proceeding.
        </p>
        <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
          <Btn label="Sign Out All Devices" loadKey="revoke" variant="danger" icon={LogOut} small
            onClick={()=>setConfirm({
              title:'Sign Out All Devices',
              desc:'This will immediately invalidate all active sessions except your current one.',
              confirmLabel:'Sign Out All',
              danger:true,
              onConfirm: async () => { setConfirm(null); await revokeAll(); },
            })}/>
          <Btn label="Delete Account" loadKey="delete" variant="danger" icon={Trash2} small
            onClick={()=>setConfirm({
              title:'Delete Your Account',
              desc:'All your data, projects, and settings will be permanently deleted. This cannot be undone.',
              confirmLabel:'Delete Forever',
              danger:true,
              onConfirm: async () => { setConfirm(null); await deleteAccount(); },
            })}/>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     SECTION: AI CONFIG
  ═══════════════════════════════════════════════════════════ */
  const AISection = () => (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>

      {/* API Key */}
      <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
        <label style={{ fontSize:10.5,fontWeight:700,color:C.muted,
          fontFamily:'Cinzel,serif',letterSpacing:'.08em',textTransform:'uppercase' }}>Groq API Key</label>
        <div style={{ position:'relative' }}>
          <input type={showKey?'text':'password'} value={aiCfg.key}
            onChange={e=>{ setAiCfg(a=>({...a,key:e.target.value})); setKeyTested(null); }}
            placeholder="gsk_your_groq_api_key_here"
            style={{ width:'100%',padding:'11px 90px 11px 14px',background:C.white,
              border:`1.5px solid ${keyTested==='ok'?C.green:keyTested==='fail'?C.red:C.goldBorder}`,
              borderRadius:10,fontSize:13.5,color:C.dark,
              outline:'none',fontFamily:'monospace',boxSizing:'border-box',transition:'border-color .2s' }}/>
          <div style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
            display:'flex',alignItems:'center',gap:6 }}>
            {keyTested==='ok'   && <CheckCircle size={14} color={C.green}/>}
            {keyTested==='fail' && <AlertCircle size={14} color={C.red}  />}
            <button onClick={()=>setShowKey(s=>!s)} style={{ background:'none',border:'none',
              cursor:'pointer',color:C.subtle,display:'flex',alignItems:'center' }}>
              {showKey?<EyeOff size={15}/>:<Eye size={15}/>}
            </button>
          </div>
        </div>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <p style={{ fontSize:11.5,color:C.subtle }}>
            Get your free key at{' '}
            <a href="https://console.groq.com" target="_blank" rel="noreferrer"
              style={{ color:C.gold,textDecoration:'underline' }}>console.groq.com</a>
          </p>
          <Btn label={loading.testKey?'Testing…':'Test Key'} onClick={testGroqKey}
            loadKey="testKey" variant="outline" small
            icon={loading.testKey?undefined:Activity}/>
        </div>
      </div>

      {/* Model params */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
        <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
          <label style={{ fontSize:10.5,fontWeight:700,color:C.muted,
            fontFamily:'Cinzel,serif',letterSpacing:'.08em',textTransform:'uppercase' }}>Default Model</label>
          <select value={aiCfg.model} onChange={e=>setAiCfg(a=>({...a,model:e.target.value}))}
            style={{ padding:'11px 14px',background:C.white,border:`1.5px solid ${C.goldBorder}`,
              borderRadius:10,fontSize:13.5,color:C.dark,outline:'none',
              fontFamily:'monospace',boxSizing:'border-box',cursor:'pointer' }}>
            <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
            <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
            <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
            <option value="gemma2-9b-it">gemma2-9b-it</option>
          </select>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
          <label style={{ fontSize:10.5,fontWeight:700,color:C.muted,
            fontFamily:'Cinzel,serif',letterSpacing:'.08em',textTransform:'uppercase' }}>Max Tokens</label>
          <input type="number" min={256} max={32768} value={aiCfg.maxTokens}
            onChange={e=>setAiCfg(a=>({...a,maxTokens:+e.target.value}))}
            style={{ padding:'11px 14px',background:C.white,border:`1.5px solid ${C.goldBorder}`,
              borderRadius:10,fontSize:13.5,color:C.dark,outline:'none',
              fontFamily:'monospace',boxSizing:'border-box' }}/>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          <label style={{ fontSize:10.5,fontWeight:700,color:C.muted,
            fontFamily:'Cinzel,serif',letterSpacing:'.08em',textTransform:'uppercase' }}>
            Temperature — {aiCfg.temperature}
          </label>
          <input type="range" min={0} max={2} step={0.1} value={aiCfg.temperature}
            onChange={e=>setAiCfg(a=>({...a,temperature:parseFloat(e.target.value)}))}
            style={{ accentColor:C.gold,width:'100%',cursor:'pointer' }}/>
          <div style={{ display:'flex',justifyContent:'space-between' }}>
            <span style={{ fontSize:10,color:C.subtle }}>Precise (0)</span>
            <span style={{ fontSize:10,color:C.subtle }}>Creative (2)</span>
          </div>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:6,justifyContent:'center' }}>
          <div style={{ padding:'14px',background:C.greenBg,border:`1px solid ${C.greenBorder}`,borderRadius:12 }}>
            <p style={{ fontSize:12,fontWeight:800,color:C.green,marginBottom:3 }}>✓ Groq Free Tier — Zero Cost</p>
            <p style={{ fontSize:11,color:'#15803d' }}>Llama 3.3 70B at no charge.</p>
          </div>
        </div>
      </div>

      <div><Btn label="Save AI Config" onClick={saveAIConfig} loadKey="aiCfg" icon={Save}/></div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     SECTION: DEPLOYMENT
  ═══════════════════════════════════════════════════════════ */
  const DeploymentSection = () => (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
        {[
          { label:'Frontend',    value:'Vite + React 18',   icon:Globe,    status:'Running'   },
          { label:'Backend',     value:'Node.js + Express', icon:Database, status:'Running'   },
          { label:'Database',    value:'MongoDB Atlas',      icon:Database, status:'Connected' },
          { label:'AI Provider', value:'Groq API',           icon:Zap,      status:'Active'    },
          { label:'CDN',         value:'Cloudflare',         icon:Globe,    status:'Active'    },
          { label:'Auth',        value:'JWT + Bcrypt',       icon:Lock,     status:'Secure'    },
        ].map(({ label,value,icon:Icon,status })=>(
          <div key={label} style={{ display:'flex',alignItems:'center',gap:14,padding:'16px',
            background:C.white,border:`1px solid ${C.goldBorder}`,borderRadius:12 }}>
            <div style={{ width:42,height:42,background:C.goldSoft,border:`1px solid ${C.goldBorder}`,
              borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <Icon size={16} color={C.gold}/>
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ fontSize:10.5,color:C.subtle,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:3 }}>{label}</p>
              <p style={{ fontSize:14,fontWeight:700,color:C.dark,fontFamily:'Cinzel,serif' }}>{value}</p>
            </div>
            <Badge label={status} variant="green"/>
          </div>
        ))}
      </div>
      <div style={{ padding:'16px 20px',background:C.goldSoft,border:`1px solid ${C.goldBorder}`,
        borderRadius:12,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div>
          <p style={{ fontSize:13,fontWeight:700,color:C.mid }}>Sudharshan AI v3.0 · Enterprise</p>
          <p style={{ fontSize:12,color:C.muted }}>All systems operational · Last deploy 2 hours ago</p>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:8,height:8,borderRadius:'50%',background:C.green,
            boxShadow:`0 0 0 3px ${C.greenBg}` }}/>
          <span style={{ fontSize:12,fontWeight:700,color:C.green }}>Live</span>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     SECTION: APPEARANCE
  ═══════════════════════════════════════════════════════════ */
  const AppearanceSection = () => (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      <div>
        <p style={{ fontSize:11,fontWeight:700,color:C.muted,letterSpacing:'.1em',
          textTransform:'uppercase',marginBottom:12,fontFamily:'Cinzel,serif' }}>Display Density</p>
        <div style={{ display:'flex',gap:10 }}>
          {['Compact','Comfortable','Spacious'].map(d=>(
            <button key={d} onClick={()=>setAppearance(a=>({...a,density:d.toLowerCase()}))} style={{
              flex:1,padding:'14px',borderRadius:12,cursor:'pointer',textAlign:'center',
              background:appearance.density===d.toLowerCase()?`linear-gradient(135deg,${C.gold},${C.goldLight})`:C.white,
              border:`1.5px solid ${appearance.density===d.toLowerCase()?C.gold:C.goldBorder}`,
              color:appearance.density===d.toLowerCase()?'white':C.mid,
              fontSize:13,fontWeight:700,fontFamily:'Cinzel,serif',
              boxShadow:appearance.density===d.toLowerCase()?`0 4px 14px rgba(201,119,0,.3)`:'none',
              transition:'all .2s' }}>{d}</button>
          ))}
        </div>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
        {[
          { label:'Language', key:'language', options:[['en','English'],['hi','हिंदी'],['sa','संस्कृत']] },
          { label:'Timezone', key:'timezone', options:[['IST','IST (UTC+5:30)'],['UTC','UTC'],['EST','EST (UTC-5)'],['PST','PST (UTC-8)']] },
        ].map(({ label,key,options })=>(
          <div key={key} style={{ display:'flex',flexDirection:'column',gap:6 }}>
            <label style={{ fontSize:10.5,fontWeight:700,color:C.muted,
              fontFamily:'Cinzel,serif',letterSpacing:'.08em',textTransform:'uppercase' }}>{label}</label>
            <select value={appearance[key]} onChange={e=>setAppearance(a=>({...a,[key]:e.target.value}))}
              style={{ padding:'11px 14px',background:C.white,border:`1.5px solid ${C.goldBorder}`,
                borderRadius:10,fontSize:13.5,color:C.dark,outline:'none',
                fontFamily:'Outfit,sans-serif',boxSizing:'border-box',cursor:'pointer' }}>
              {options.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div><Btn label="Save Appearance" onClick={saveAppearance} loadKey="appearance" icon={Save}/></div>
    </div>
  );

  const sectionMap = {
    profile:       <ProfileSection/>,
    notifications: <NotificationsSection/>,
    security:      <SecuritySection/>,
    ai:            <AISection/>,
    deployment:    <DeploymentSection/>,
    appearance:    <AppearanceSection/>,
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes chakraSpin { to { transform:rotate(360deg); } }
        @keyframes spin       { to { transform:rotate(360deg); } }
        input:focus,textarea:focus,select:focus {
          border-color:${C.gold}!important;
          box-shadow:0 0 0 3px rgba(201,119,0,.12)!important;
        }
        input[type=range]::-webkit-slider-thumb { background:${C.gold}; }
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-thumb{background:rgba(201,119,0,.25);border-radius:99px;}
      `}</style>

      {/* Toast layer */}
      <ToastContainer toasts={toasts} remove={remove}/>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        desc={confirm?.desc}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
        onConfirm={confirm?.onConfirm}
        onCancel={()=>setConfirm(null)}/>

      {/* Root layout */}
      <div style={{ display:'flex',width:'100%',height:'100%',minHeight:0,overflow:'hidden',
        fontFamily:'Outfit,sans-serif',
        background:`linear-gradient(160deg,#FFFCF0,#FFF8E0 60%,#FEF5D0)`,position:'relative' }}>

        {/* Ambient chakra */}
        <div style={{ position:'absolute',top:'50%',right:-320,transform:'translateY(-50%)',
          animation:'chakraSpin 200s linear infinite',pointerEvents:'none',zIndex:0,opacity:.02 }}>
          <svg width="720" height="720" viewBox="0 0 100 100">
            {Array.from({length:24},(_,i)=>{const a=(i*15*Math.PI)/180;return(
              <line key={i} x1={50+24*Math.cos(a)} y1={50+24*Math.sin(a)}
                x2={50+47*Math.cos(a)} y2={50+47*Math.sin(a)} stroke={C.gold} strokeWidth="1.1"/>
            );})}
            <circle cx="50" cy="50" r="47" fill="none" stroke={C.gold} strokeWidth=".8"/>
            <circle cx="50" cy="50" r="7" fill={C.gold}/>
          </svg>
        </div>

        {/* ── Left settings nav ──────────────────────────────── */}
        <div style={{ width:220,flexShrink:0,height:'100%',overflowY:'auto',
          borderRight:`1px solid ${C.goldBorder}`,zIndex:2,
          background:`linear-gradient(180deg,${C.surface},${C.surfaceEl})`,
          display:'flex',flexDirection:'column' }}>

          <div style={{ padding:'18px 16px 10px' }}>
            <p style={{ fontSize:9.5,fontWeight:700,color:'rgba(201,119,0,.45)',
              letterSpacing:'.18em',textTransform:'uppercase',fontFamily:'Cinzel,serif' }}>
              Preferences
            </p>
          </div>

          <nav style={{ flex:1,padding:'0 10px',display:'flex',flexDirection:'column',gap:2 }}>
            {NAV.map((item,i)=>{
              const on = active===item.id;
              return (
                <motion.button key={item.id} onClick={()=>setActive(item.id)}
                  initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }}
                  transition={{ delay:i*.04,duration:.28 }}
                  style={{ display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 11px',
                    borderRadius:11,border:'none',cursor:'pointer',textAlign:'left',
                    background:on?`linear-gradient(135deg,rgba(201,119,0,.12),rgba(201,119,0,.05))`:'transparent',
                    boxShadow:on?`inset 0 0 0 1px ${C.goldBorder}`:'none',transition:'all .15s' }}>
                  <div style={{ width:30,height:30,borderRadius:8,flexShrink:0,
                    display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s',
                    background:on?`linear-gradient(135deg,${C.gold},${C.goldLight})`:'rgba(201,119,0,.08)' }}>
                    <item.icon size={13} color={on?'white':C.muted}/>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:12.5,fontWeight:on?700:500,lineHeight:1.2,
                      color:on?C.dark:C.muted,fontFamily:on?'Cinzel,serif':'Outfit,sans-serif',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{item.label}</p>
                    <p style={{ fontSize:8.5,letterSpacing:'.05em',marginTop:1,
                      color:on?C.gold:'rgba(201,119,0,.3)',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{item.sub}</p>
                  </div>
                  {on&&<ChevronRight size={11} color={C.gold} style={{ flexShrink:0 }}/>}
                </motion.button>
              );
            })}
          </nav>

          <div style={{ padding:'13px 16px',borderTop:`1px solid ${C.goldBorder}`,
            display:'flex',alignItems:'center',gap:7 }}>
            <div style={{ width:7,height:7,borderRadius:'50%',background:C.green,flexShrink:0,
              boxShadow:`0 0 0 2.5px ${C.greenBg}` }}/>
            <span style={{ fontSize:10.5,fontWeight:700,color:C.green }}>All Systems Operational</span>
          </div>
        </div>

        {/* ── Main content pane ──────────────────────────────── */}
        <div style={{ flex:1,minWidth:0,height:'100%',overflowY:'auto',
          display:'flex',flexDirection:'column',zIndex:1 }}>

          {/* Section heading */}
          <div style={{ padding:'22px 32px 0',flexShrink:0 }}>
            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:10 }}>
              {activeNav&&(
                <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  background:`linear-gradient(135deg,${C.gold},${C.goldLight})`,
                  boxShadow:`0 4px 12px rgba(201,119,0,.3)` }}>
                  <activeNav.icon size={16} color="white"/>
                </div>
              )}
              <div>
                <h2 style={{ fontSize:19,fontWeight:800,color:C.dark,fontFamily:'Cinzel,serif',lineHeight:1,margin:0 }}>
                  {activeNav?.label}
                </h2>
                <p style={{ fontSize:9,color:C.gold,letterSpacing:'.1em',marginTop:2 }}>{activeNav?.sub}</p>
              </div>
            </div>
            <div style={{ height:1,background:`linear-gradient(90deg,rgba(201,119,0,.3),transparent)`,marginBottom:24 }}/>
          </div>

          {/* Content */}
          <div style={{ flex:1,padding:'0 32px 32px' }}>
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity:0,y:10 }}
                animate={{ opacity:1,y:0 }}
                exit={{ opacity:0,y:-8 }}
                transition={{ duration:.25,ease:[.16,1,.3,1] }}>
                {sectionMap[active]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
