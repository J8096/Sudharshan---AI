/**
 * TeamPage.jsx — Sudharshan AI Enterprise v3.0
 * ─────────────────────────────────────────────────────────────
 * Design tokens: exact match with AppLayout, DashboardPage, ProjectsPage
 * Icons: lucide-react only (no emoji in UI chrome)
 * Fonts: Cinzel (display) + Outfit (body) — matches entire app
 * Features: grid/list view, filters, invite modal, detail panel,
 *           role change, status toggle, remove member, permission matrix,
 *           message member, copy contact, confirm dialogs, toast system
 * API-ready: authApi.team() wired; falls back to SEED gracefully
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users, UserPlus, Search, Grid3X3, List, Shield, Crown,
  Eye, Mail, Phone, Building2, Calendar, Clock, Activity,
  CheckCircle2, XCircle, ChevronDown, ChevronRight, X,
  Copy, MessageSquare, Trash2, RefreshCw, ArrowUpRight,
  Star, Zap, Lock, Check, AlertTriangle, Info, Loader2,
  MoreHorizontal, UserCheck, UserX, SlidersHorizontal,
} from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS — exact match with AppLayout / DashboardPage
══════════════════════════════════════════════════════════════ */
const G      = '#C97700';
const GL     = '#E8920A';
const GD     = '#3D1F00';
const GM     = '#7A4F00';
const GSoft  = 'rgba(201,119,0,.08)';
const GBorder = 'rgba(201,119,0,.2)';
const GBorderB = 'rgba(201,119,0,.32)';
const CREAM  = '#FFFDF5';
const CREAM2 = '#FFF8E5';
const CREAM3 = '#FEF3D0';
const LINE   = 'rgba(201,119,0,.13)';
const LINEB  = 'rgba(201,119,0,.22)';

const C = {
  green:'#059669',  greenBg:'rgba(5,150,105,.09)',   greenB:'rgba(5,150,105,.22)',
  red:'#DC2626',    redBg:'rgba(220,38,38,.09)',      redB:'rgba(220,38,38,.22)',
  purple:'#7C3AED', purpleBg:'rgba(124,58,237,.09)', purpleB:'rgba(124,58,237,.22)',
  blue:'#0EA5E9',   blueBg:'rgba(14,165,233,.09)',    blueB:'rgba(14,165,233,.22)',
  amber:'#D97706',  amberBg:'rgba(217,119,6,.09)',
  slate:'#64748B',  slateBg:'rgba(100,116,139,.09)',
};

/* ── Seed data (fallback when API unavailable) ── */
const SEED = [
  { id:'u1', name:'Alex Johnson',   email:'alex@kova.ai',    role:'admin',  department:'Engineering', status:'active',   createdAt:'2024-01-15', lastActive:'2 min ago',  tasks:24, projects:8,  avatar:null, phone:'+1 555-0101' },
  { id:'u2', name:'Priya Sharma',   email:'priya@kova.ai',   role:'admin',  department:'Product',     status:'active',   createdAt:'2024-02-10', lastActive:'1 hr ago',   tasks:31, projects:12, avatar:null, phone:'+1 555-0102' },
  { id:'u3', name:'Marcus Reeves',  email:'marcus@kova.ai',  role:'member', department:'Design',      status:'active',   createdAt:'2024-03-05', lastActive:'4 hr ago',   tasks:18, projects:5,  avatar:null, phone:'+1 555-0103' },
  { id:'u4', name:'Sofia Laurent',  email:'sofia@kova.ai',   role:'member', department:'Marketing',   status:'inactive', createdAt:'2024-04-20', lastActive:'3 days ago', tasks:7,  projects:3,  avatar:null, phone:'+1 555-0104' },
  { id:'u5', name:'Aiden Patel',    email:'aiden@kova.ai',   role:'member', department:'Engineering', status:'active',   createdAt:'2024-05-01', lastActive:'30 min ago', tasks:42, projects:9,  avatar:null, phone:'+1 555-0105' },
  { id:'u6', name:'Lena Fischer',   email:'lena@kova.ai',    role:'viewer', department:'Finance',     status:'active',   createdAt:'2024-06-12', lastActive:'1 day ago',  tasks:3,  projects:6,  avatar:null, phone:'+1 555-0106' },
  { id:'u7', name:'Rahul Verma',    email:'rahul@kova.ai',   role:'member', department:'Engineering', status:'active',   createdAt:'2024-07-08', lastActive:'5 min ago',  tasks:29, projects:7,  avatar:null, phone:'+1 555-0107' },
  { id:'u8', name:'Camille Dubois', email:'camille@kova.ai', role:'viewer', department:'Legal',       status:'inactive', createdAt:'2024-08-14', lastActive:'1 week ago', tasks:1,  projects:2,  avatar:null, phone:'+1 555-0108' },
];

const DEPTS = ['Engineering','Product','Design','Marketing','Finance','Legal','Operations','Data'];

/* ── Helpers ── */
function initials(name) {
  return (name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
}
function avatarColor(name) {
  const p=[G,'#7C3AED','#059669','#0EA5E9','#DC2626','#D97706','#0891B2','#BE185D'];
  let h=0; for(const c of (name||'')) h=(h*31+c.charCodeAt(0))%p.length;
  return p[Math.abs(h)];
}
function daysSince(d) { return Math.floor((Date.now()-new Date(d))/(86400*1000)); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }

/* ══════════════════════════════════════════════════════════════
   CHAKRA WATERMARK
══════════════════════════════════════════════════════════════ */
function Chakra({ size=80, opacity=1, spin=false }) {
  const sp = Array.from({length:16},(_,i)=>{
    const a=(i*22.5*Math.PI)/180;
    return{x1:50+22*Math.cos(a),y1:50+22*Math.sin(a),x2:50+43*Math.cos(a),y2:50+43*Math.sin(a)};
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{opacity,display:'block',flexShrink:0,animation:spin?'tmSpin 90s linear infinite':undefined}}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={G} strokeWidth="1"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke={G} strokeWidth=".5"/>
      {sp.map((p,i)=><line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={G} strokeWidth="1.2"/>)}
      <circle cx="50" cy="50" r="5" fill={G}/>
      <circle cx="50" cy="50" r="2" fill="#FFBB33"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════════════════ */
function Avatar({ user, size=44 }) {
  const c = avatarColor(user?.name);
  if (user?.avatar) return (
    <img src={user.avatar} alt={user.name}
      style={{width:size,height:size,borderRadius:size*.26,objectFit:'cover',flexShrink:0,
        border:`1.5px solid ${c}44`}}/>
  );
  return (
    <div style={{width:size,height:size,borderRadius:size*.26,flexShrink:0,
      display:'flex',alignItems:'center',justifyContent:'center',
      background:`linear-gradient(135deg,${c}ee,${c}88)`,
      color:'#fff',fontWeight:900,fontFamily:'Cinzel,serif',fontSize:size*.3,
      letterSpacing:.5,boxShadow:`0 4px 14px ${c}55`,border:`1.5px solid ${c}44`}}>
      {initials(user?.name)}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROLE BADGE
══════════════════════════════════════════════════════════════ */
function RoleBadge({ role }) {
  const map = {
    admin:  { c:C.purple, bg:C.purpleBg, b:C.purpleB, Icon:Crown,   l:'Admin'  },
    member: { c:G,        bg:GSoft,      b:GBorder,   Icon:Star,    l:'Member' },
    viewer: { c:C.slate,  bg:C.slateBg,  b:'rgba(100,116,139,.22)', Icon:Eye, l:'Viewer'},
  };
  const s = map[role] || map.member;
  const Icon = s.Icon;
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:9.5,fontWeight:800,
      padding:'3px 9px',borderRadius:99,background:s.bg,color:s.c,
      border:`1px solid ${s.b}`,letterSpacing:.4,textTransform:'uppercase',whiteSpace:'nowrap'}}>
      <Icon size={9} strokeWidth={2.5}/>{s.l}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   STATUS DOT
══════════════════════════════════════════════════════════════ */
function StatusDot({ active, size=9 }) {
  return (
    <div style={{width:size,height:size,borderRadius:'50%',flexShrink:0,
      background:active?C.green:C.slate,
      boxShadow:active?`0 0 6px ${C.green}99`:'none',
      border:`1.5px solid ${CREAM}`}}/>
  );
}

/* ══════════════════════════════════════════════════════════════
   PROGRESS BAR
══════════════════════════════════════════════════════════════ */
function ProgressBar({ value, height=4, color=G }) {
  return (
    <div style={{height,background:'rgba(201,119,0,.1)',borderRadius:99,overflow:'hidden'}}>
      <div style={{height:'100%',width:`${Math.max(0,Math.min(100,value))}%`,
        background:`linear-gradient(90deg,${color},${GL})`,borderRadius:99,
        transition:'width .6s cubic-bezier(.16,1,.3,1)'}}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TOAST SYSTEM (self-contained, matches DashboardPage style)
══════════════════════════════════════════════════════════════ */
function ToastStack({ toasts, remove }) {
  if (!toasts.length) return null;
  const cfg = {
    success: { Icon:CheckCircle2, c:C.green, bg:'#F0FDF4', b:'rgba(5,150,105,.22)' },
    error:   { Icon:XCircle,      c:C.red,   bg:'#FEF2F2', b:'rgba(220,38,38,.22)' },
    info:    { Icon:Info,         c:G,       bg:'#FFFBEB', b:GBorder },
  };
  return (
    <div style={{position:'fixed',bottom:24,right:24,zIndex:9999,display:'flex',flexDirection:'column',gap:8}}>
      {toasts.map(t=>{
        const {Icon,c,bg,b} = cfg[t.type]||cfg.info;
        return (
          <div key={t.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',
            borderRadius:14,background:bg,border:`1px solid ${b}`,
            boxShadow:'0 8px 32px rgba(0,0,0,.12)',minWidth:280,
            animation:'tmToastIn .3s cubic-bezier(.16,1,.3,1)'}}>
            <Icon size={16} color={c} style={{flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12.5,fontWeight:700,color:GD}}>{t.title}</div>
              {t.msg && <div style={{fontSize:11,color:GM,marginTop:2}}>{t.msg}</div>}
            </div>
            <button onClick={()=>remove(t.id)} style={{background:'none',border:'none',cursor:'pointer',color:GM,display:'flex'}}>
              <X size={13}/>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function useLocalToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback(({type='info',title='',msg=''})=>{
    const id = Date.now();
    setToasts(t=>[...t,{id,type,title,msg}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),4000);
  },[]);
  const remove = useCallback(id=>setToasts(t=>t.filter(x=>x.id!==id)),[]);
  return {toasts, add, remove};
}

/* ══════════════════════════════════════════════════════════════
   MODAL SHELL
══════════════════════════════════════════════════════════════ */
function Modal({ onClose, children, width=460 }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(61,31,0,.45)',backdropFilter:'blur(6px)',
      zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{width:'100%',maxWidth:width,
        background:`linear-gradient(160deg,${CREAM},${CREAM2})`,
        borderRadius:22,overflow:'hidden',border:`1px solid ${LINEB}`,
        boxShadow:'0 24px 80px rgba(61,31,0,.28)',animation:'tmModalIn .26s cubic-bezier(.16,1,.3,1)'}}>
        <div style={{height:3,background:`linear-gradient(90deg,${G},${GL})`}}/>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════════════════════════════ */
function Confirm({ data, onCancel }) {
  if (!data) return null;
  return (
    <Modal onClose={onCancel} width={360}>
      <div style={{padding:'28px 26px 24px',textAlign:'center'}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:14}}>
          <div style={{width:52,height:52,borderRadius:16,
            background:data.danger?C.redBg:GSoft,
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            {data.danger ? <AlertTriangle size={24} color={C.red}/> : <Info size={24} color={G}/>}
          </div>
        </div>
        <h3 style={{fontSize:16,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',marginBottom:8}}>{data.title}</h3>
        <p style={{fontSize:12.5,color:GM,lineHeight:1.7,marginBottom:22}}>{data.body}</p>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:'10px',borderRadius:11,
            border:`1px solid ${GBorder}`,background:'transparent',color:GM,
            fontSize:12.5,fontWeight:700,cursor:'pointer',fontFamily:'Outfit,sans-serif'}}>
            Cancel
          </button>
          <button onClick={data.onOk} style={{flex:1,padding:'10px',borderRadius:11,border:'none',
            background:data.danger?`linear-gradient(135deg,${C.red},#EF4444)`:`linear-gradient(135deg,${G},${GL})`,
            color:'#fff',fontSize:12.5,fontWeight:800,cursor:'pointer',
            boxShadow:data.danger?`0 4px 14px rgba(220,38,38,.35)`:`0 4px 14px rgba(201,119,0,.35)`}}>
            {data.ok||'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════
   INVITE MODAL
══════════════════════════════════════════════════════════════ */
const INPST = {
  width:'100%',padding:'9px 12px',borderRadius:10,boxSizing:'border-box',
  border:`1px solid ${GBorder}`,background:'rgba(255,253,245,.9)',
  fontSize:12.5,color:GD,outline:'none',fontFamily:'Outfit,sans-serif',transition:'border-color .15s',
};

function InviteModal({ onClose, onInvited, addToast }) {
  const [form, setForm] = useState({name:'',email:'',role:'member',department:'Engineering',phone:''});
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e={};
    if (!form.name.trim()) e.name='Name is required';
    if (!form.email.trim()) e.email='Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email='Invalid email address';
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function submit() {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r=>setTimeout(r,900));
    setLoading(false);
    setStep(2);
    onInvited({
      id:`u${Date.now()}`, name:form.name, email:form.email, role:form.role,
      department:form.department, phone:form.phone, status:'active',
      createdAt:new Date().toISOString().slice(0,10),
      lastActive:'Just now', tasks:0, projects:0, avatar:null,
    });
    addToast({type:'success',title:'Invitation Sent!',msg:`${form.name} will receive an email shortly.`});
    setTimeout(onClose,1600);
  }

  return (
    <Modal onClose={onClose} width={460}>
      <div style={{padding:'24px 26px 22px'}}>
        {step === 2 ? (
          <div style={{textAlign:'center',padding:'30px 0'}}>
            <div style={{width:64,height:64,borderRadius:20,background:C.greenBg,border:`1px solid ${C.greenB}`,
              display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
              <CheckCircle2 size={28} color={C.green}/>
            </div>
            <h3 style={{fontSize:17,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',marginBottom:6}}>Invitation Sent!</h3>
            <p style={{fontSize:12,color:GM}}>An email has been dispatched to <strong style={{color:G}}>{form.email}</strong></p>
          </div>
        ) : (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22}}>
              <div>
                <div style={{fontSize:9,color:'rgba(201,119,0,.5)',fontFamily:'Cinzel,serif',letterSpacing:'.22em',textTransform:'uppercase',marginBottom:3}}>
                  दल में आमंत्रित करें
                </div>
                <h2 style={{fontSize:17,fontWeight:900,color:GD,fontFamily:'Cinzel,serif'}}>Invite Member</h2>
                <p style={{fontSize:11,color:GM,marginTop:2}}>Add someone to the Sacred Workspace</p>
              </div>
              <button onClick={onClose} style={{width:32,height:32,borderRadius:9,border:`1px solid ${GBorder}`,
                background:CREAM3,color:GM,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <X size={14}/>
              </button>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:13}}>
              {/* name */}
              <div>
                <label style={{display:'block',fontSize:9.5,fontWeight:800,color:GM,
                  textTransform:'uppercase',letterSpacing:.6,marginBottom:6,fontFamily:'Cinzel,serif'}}>
                  Full Name *
                </label>
                <input value={form.name} onChange={e=>{setForm(f=>({...f,name:e.target.value}));setErrors(x=>({...x,name:''}));}}
                  placeholder="Jane Doe" style={{...INPST,borderColor:errors.name?'#FCA5A5':GBorder}}/>
                {errors.name && <p style={{fontSize:10.5,color:C.red,marginTop:4}}>⚠ {errors.name}</p>}
              </div>
              {/* email */}
              <div>
                <label style={{display:'block',fontSize:9.5,fontWeight:800,color:GM,
                  textTransform:'uppercase',letterSpacing:.6,marginBottom:6,fontFamily:'Cinzel,serif'}}>
                  Email Address *
                </label>
                <input type="email" value={form.email} onChange={e=>{setForm(f=>({...f,email:e.target.value}));setErrors(x=>({...x,email:''}));}}
                  placeholder="jane@company.com" style={{...INPST,borderColor:errors.email?'#FCA5A5':GBorder}}/>
                {errors.email && <p style={{fontSize:10.5,color:C.red,marginTop:4}}>⚠ {errors.email}</p>}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={{display:'block',fontSize:9.5,fontWeight:800,color:GM,
                    textTransform:'uppercase',letterSpacing:.6,marginBottom:6,fontFamily:'Cinzel,serif'}}>Role</label>
                  <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={INPST}>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label style={{display:'block',fontSize:9.5,fontWeight:800,color:GM,
                    textTransform:'uppercase',letterSpacing:.6,marginBottom:6,fontFamily:'Cinzel,serif'}}>Department</label>
                  <select value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))} style={INPST}>
                    {DEPTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              {/* phone */}
              <div>
                <label style={{display:'block',fontSize:9.5,fontWeight:800,color:GM,
                  textTransform:'uppercase',letterSpacing:.6,marginBottom:6,fontFamily:'Cinzel,serif'}}>
                  Phone (optional)
                </label>
                <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}
                  placeholder="+1 555-0000" style={INPST}/>
              </div>
            </div>

            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={onClose} style={{flex:1,padding:'11px',borderRadius:12,border:`1px solid ${GBorder}`,
                background:'transparent',color:GM,fontSize:12.5,fontWeight:700,cursor:'pointer',fontFamily:'Outfit,sans-serif'}}>
                Cancel
              </button>
              <button onClick={submit} disabled={loading}
                style={{flex:2,padding:'11px',borderRadius:12,border:'none',
                  background:loading?'rgba(201,119,0,.4)':`linear-gradient(135deg,${G},${GL})`,
                  color:'#fff',fontSize:13,fontWeight:900,cursor:loading?'not-allowed':'pointer',
                  fontFamily:'Cinzel,serif',boxShadow:'0 4px 18px rgba(201,119,0,.36)',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                {loading ? <><Loader2 size={14} style={{animation:'tmSpin 1s linear infinite'}}/> Sending…</> : 'Send Invitation →'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════
   DETAIL PANEL (slide-in right panel)
══════════════════════════════════════════════════════════════ */
function DetailPanel({ member, currentUserId, onClose, onRoleChange, onToggleStatus, onRemove, addToast }) {
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [confirm, setConfirm] = useState(null);
  const isSelf = member.id === currentUserId || member._id === currentUserId;
  const ac = avatarColor(member.name);

  function copyToClip(text, label) {
    navigator.clipboard?.writeText(text).catch(()=>{});
    addToast({type:'success',title:'Copied!',msg:label});
  }

  function sendMsg() {
    if (!msgText.trim()) return;
    addToast({type:'success',title:'Message Sent',msg:`Sent to ${member.name}.`});
    setMsgText(''); setMsgOpen(false);
  }

  const statItems = [
    {l:'Tasks',    v:member.tasks||0,    c:G},
    {l:'Projects', v:member.projects||0, c:C.purple},
    {l:'Days',     v:daysSince(member.createdAt||member.joined||new Date()), c:C.green},
  ];

  const infoRows = [
    {Icon:Building2, k:'Department',  v:member.department||member.dept||'—'},
    {Icon:Phone,     k:'Phone',       v:member.phone||'—'},
    {Icon:Clock,     k:'Last Active', v:member.lastActive||member.lastSeen||'—'},
    {Icon:Calendar,  k:'Joined',      v:fmtDate(member.createdAt||member.joined||new Date())},
  ];

  return (
    <>
      <div style={{width:308,flexShrink:0,
        background:`linear-gradient(180deg,${CREAM},${CREAM2})`,
        border:`1px solid ${LINEB}`,borderRadius:22,overflow:'hidden',
        boxShadow:'0 10px 48px rgba(201,119,0,.16)',display:'flex',flexDirection:'column',
        maxHeight:'calc(100vh - 140px)',animation:'tmSlideIn .24s cubic-bezier(.16,1,.3,1)'}}>
        <div style={{height:4,background:`linear-gradient(90deg,${ac},${ac}55)`}}/>

        {/* header */}
        <div style={{padding:'18px 18px 14px',borderBottom:`1px solid ${LINE}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
            <span style={{fontSize:9,color:'rgba(201,119,0,.5)',fontFamily:'Cinzel,serif',
              letterSpacing:'.18em',textTransform:'uppercase'}}>Member Profile</span>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:8,border:`1px solid ${GBorder}`,
              background:CREAM3,color:GM,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <X size={12}/>
            </button>
          </div>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <div style={{position:'relative',flexShrink:0}}>
              <Avatar user={member} size={54}/>
              <div style={{position:'absolute',bottom:-2,right:-2,border:`2px solid ${CREAM}`}}>
                <StatusDot active={member.status==='active'}/>
              </div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',marginBottom:4}}>
                <h2 style={{fontSize:14,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',lineHeight:1.2}}>
                  {member.name}
                </h2>
                {isSelf && (
                  <span style={{fontSize:8,background:GSoft,color:G,padding:'1px 7px',borderRadius:99,fontWeight:800,letterSpacing:.3}}>
                    YOU
                  </span>
                )}
              </div>
              <div style={{fontSize:10.5,color:GM,marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {member.email}
              </div>
              <RoleBadge role={member.role}/>
            </div>
          </div>
        </div>

        {/* scrollable body */}
        <div style={{flex:1,overflowY:'auto',padding:'14px 18px'}}>

          {/* stat chips */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
            {statItems.map(({l,v,c})=>(
              <div key={l} style={{textAlign:'center',padding:'10px 6px',
                background:`${c}0d`,border:`1px solid ${c}22`,borderRadius:12}}>
                <div style={{fontSize:18,fontWeight:900,color:c,fontFamily:'Cinzel,serif',lineHeight:1}}>{v}</div>
                <div style={{fontSize:9,color:GM,textTransform:'uppercase',letterSpacing:.4,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>

          {/* activity bar */}
          <div style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:10,color:GM}}>
              <span>Activity Score</span>
              <span style={{fontWeight:700,color:G}}>{Math.min(100,Math.round(((member.tasks||0)*2+(member.projects||0)*5)/1.5))}%</span>
            </div>
            <ProgressBar value={Math.min(100,Math.round(((member.tasks||0)*2+(member.projects||0)*5)/1.5))} color={ac}/>
          </div>

          {/* info rows */}
          <div style={{borderRadius:12,border:`1px solid ${LINE}`,overflow:'hidden',marginBottom:14}}>
            {infoRows.map(({Icon,k,v},i)=>(
              <div key={k} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',
                borderBottom:i<infoRows.length-1?`1px solid ${LINE}`:'none',
                background:i%2===0?`rgba(201,119,0,.02)`:'transparent'}}>
                <Icon size={12} color={GM} strokeWidth={1.8}/>
                <span style={{fontSize:10.5,color:GM,flex:'0 0 80px'}}>{k}</span>
                <span style={{fontSize:10.5,fontWeight:600,color:GD,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textAlign:'right'}}>
                  {v}
                </span>
              </div>
            ))}
          </div>

          {/* status toggle */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'10px 12px',borderRadius:12,border:`1px solid ${LINE}`,
            background:member.status==='active'?C.greenBg:C.slateBg,marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <StatusDot active={member.status==='active'}/>
              <span style={{fontSize:12,fontWeight:700,color:member.status==='active'?C.green:C.slate}}>
                {member.status==='active'?'Active':'Inactive'}
              </span>
            </div>
            {!isSelf && (
              <button onClick={()=>{
                onToggleStatus(member.id||member._id);
                addToast({type:'success',title:'Status Updated',
                  msg:`${member.name} is now ${member.status==='active'?'inactive':'active'}.`});
              }}
                style={{fontSize:10,fontWeight:700,padding:'4px 10px',borderRadius:8,cursor:'pointer',
                  border:`1px solid ${member.status==='active'?C.redB:C.greenB}`,
                  background:member.status==='active'?C.redBg:C.greenBg,
                  color:member.status==='active'?C.red:C.green,fontFamily:'Outfit,sans-serif'}}>
                {member.status==='active'?'Deactivate':'Activate'}
              </button>
            )}
          </div>

          {/* role change */}
          {!isSelf && (
            <div style={{marginBottom:14}}>
              <p style={{fontSize:9.5,fontFamily:'Cinzel,serif',color:G,marginBottom:8,
                textTransform:'uppercase',letterSpacing:.5}}>Change Role</p>
              <div style={{display:'flex',gap:6}}>
                {['admin','member','viewer'].map(r=>(
                  <button key={r} onClick={()=>{onRoleChange(member.id||member._id,r);addToast({type:'success',title:'Role Updated',msg:`${member.name} is now ${r}.`});}}
                    style={{flex:1,padding:'7px 0',borderRadius:10,cursor:'pointer',
                      border:`1px solid ${member.role===r?'rgba(201,119,0,.5)':GBorder}`,
                      background:member.role===r?'rgba(201,119,0,.14)':'transparent',
                      color:member.role===r?G:GM,fontSize:10,fontWeight:700,
                      textTransform:'capitalize',transition:'all .18s',fontFamily:'Outfit,sans-serif'}}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* send message */}
          <div style={{marginBottom:12}}>
            <button onClick={()=>setMsgOpen(o=>!o)}
              style={{width:'100%',padding:'9px 12px',borderRadius:11,
                border:`1px solid rgba(201,119,0,.22)`,background:GSoft,
                color:G,fontSize:11.5,fontWeight:700,cursor:'pointer',
                display:'flex',alignItems:'center',gap:8,fontFamily:'Outfit,sans-serif'}}>
              <MessageSquare size={13}/>
              Send Message
              <ChevronDown size={12} color={GM} style={{marginLeft:'auto',transform:msgOpen?'rotate(180deg)':'none',transition:'transform .2s'}}/>
            </button>
            {msgOpen && (
              <div style={{marginTop:8}}>
                <textarea value={msgText} onChange={e=>setMsgText(e.target.value)}
                  placeholder={`Message to ${member.name}…`} rows={3}
                  style={{...INPST,resize:'none',marginBottom:8}}/>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>{setMsgOpen(false);setMsgText('');}}
                    style={{flex:1,padding:'7px',borderRadius:9,border:`1px solid ${GBorder}`,
                      background:'transparent',color:GM,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'Outfit,sans-serif'}}>
                    Cancel
                  </button>
                  <button onClick={sendMsg}
                    style={{flex:2,padding:'7px',borderRadius:9,border:'none',
                      background:`linear-gradient(135deg,${G},${GL})`,
                      color:'#fff',fontSize:11,fontWeight:800,cursor:'pointer',fontFamily:'Outfit,sans-serif'}}>
                    Send →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* quick actions */}
          <div style={{display:'flex',gap:7,marginBottom:12}}>
            <button onClick={()=>copyToClip(member.email,'Email copied')}
              style={{flex:1,padding:'8px 6px',borderRadius:10,border:`1px solid ${GBorder}`,
                background:GSoft,color:GM,fontSize:10.5,fontWeight:600,cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontFamily:'Outfit,sans-serif'}}>
              <Copy size={11}/> Email
            </button>
            <button onClick={()=>copyToClip(member.phone||'No phone','Phone copied')}
              style={{flex:1,padding:'8px 6px',borderRadius:10,border:`1px solid ${GBorder}`,
                background:GSoft,color:GM,fontSize:10.5,fontWeight:600,cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontFamily:'Outfit,sans-serif'}}>
              <Phone size={11}/> Phone
            </button>
          </div>

          {/* remove */}
          {!isSelf && (
            <button onClick={()=>onRemove(member)}
              style={{width:'100%',padding:'9px 12px',borderRadius:11,
                border:`1px solid ${C.redB}`,background:C.redBg,color:C.red,
                fontSize:11.5,fontWeight:700,cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontFamily:'Outfit,sans-serif'}}>
              <Trash2 size={13}/> Remove Member
            </button>
          )}
        </div>
      </div>

      <Confirm data={confirm} onCancel={()=>setConfirm(null)}/>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   MEMBER CARD (grid view)
══════════════════════════════════════════════════════════════ */
function MemberCard({ m, isSelf, idx, selected, onClick }) {
  const [hov, setHov] = useState(false);
  const c = avatarColor(m.name);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:`linear-gradient(155deg,${CREAM},${CREAM2})`,
        border:`1px solid ${selected?GBorderB:hov?GBorder:LINE}`,
        borderRadius:20,padding:'20px 18px',position:'relative',overflow:'hidden',cursor:'pointer',
        boxShadow:selected?`0 0 0 3px rgba(201,119,0,.18), 0 10px 36px rgba(201,119,0,.16)`:hov?'0 8px 28px rgba(201,119,0,.13)':'0 2px 12px rgba(201,119,0,.07)',
        transition:'all .2s',transform:selected?'translateY(-3px)':hov?'translateY(-1px)':'none',
        animation:`tmFadeUp .4s ${idx*.06}s both`}}>
      {/* accent bar */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,
        background:`linear-gradient(90deg,${c},${c}44,transparent)`}}/>
      {/* watermark */}
      <div style={{position:'absolute',right:-24,bottom:-24,opacity:.04,pointerEvents:'none'}}>
        <Chakra size={100}/>
      </div>

      {/* header row */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
        <div style={{position:'relative'}}>
          <Avatar user={m} size={48}/>
          <div style={{position:'absolute',bottom:-2,right:-2,border:`2px solid ${CREAM}`}}>
            <StatusDot active={m.status==='active'}/>
          </div>
        </div>
        <RoleBadge role={m.role}/>
      </div>

      {/* name / email / dept */}
      <div style={{marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
          <h3 style={{fontSize:13.5,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',lineHeight:1.2}}>
            {m.name}
          </h3>
          {isSelf && (
            <span style={{fontSize:8,background:GSoft,color:G,padding:'1px 6px',borderRadius:99,fontWeight:800}}>YOU</span>
          )}
        </div>
        <p style={{fontSize:10.5,color:GM,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:6}}>
          {m.email}
        </p>
        <div style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:GM,
          background:GSoft,padding:'3px 8px',borderRadius:99,width:'fit-content'}}>
          <Building2 size={9} color={G}/>
          {m.department||m.dept}
        </div>
      </div>

      {/* stats */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,
        padding:'10px 0',borderTop:`1px solid ${LINE}`,borderBottom:`1px solid ${LINE}`,marginBottom:12}}>
        {[['Tasks',m.tasks||0,G],['Projects',m.projects||0,C.purple]].map(([l,v,cc])=>(
          <div key={l} style={{textAlign:'center'}}>
            <div style={{fontSize:17,fontWeight:900,color:cc,fontFamily:'Cinzel,serif',lineHeight:1}}>{v}</div>
            <div style={{fontSize:9,color:GM,textTransform:'uppercase',letterSpacing:.4,marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>

      {/* footer */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:4,fontSize:9.5,color:GM}}>
          <Clock size={9} color={GM}/>
          {m.lastActive||m.lastSeen}
        </div>
        <span style={{fontSize:9,color:'rgba(122,79,0,.45)',background:GSoft,padding:'2px 7px',borderRadius:99}}>
          {new Date(m.createdAt||m.joined||new Date()).toLocaleDateString('en-US',{month:'short',year:'numeric'})}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MEMBER ROW (list view)
══════════════════════════════════════════════════════════════ */
function MemberRow({ m, isSelf, idx, selected, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:'flex',alignItems:'center',gap:14,padding:'12px 18px',
        background:selected?`linear-gradient(90deg,rgba(201,119,0,.1),rgba(201,119,0,.04))`:hov?`rgba(201,119,0,.04)`:`rgba(255,253,246,.8)`,
        border:`1px solid ${selected?GBorderB:hov?GBorder:LINE}`,
        borderRadius:14,cursor:'pointer',transition:'all .18s',
        animation:`tmFadeUp .35s ${idx*.04}s both`}}>
      <div style={{position:'relative',flexShrink:0}}>
        <Avatar user={m} size={40}/>
        <div style={{position:'absolute',bottom:-2,right:-2,border:`2px solid ${CREAM}`}}>
          <StatusDot active={m.status==='active'}/>
        </div>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2,flexWrap:'wrap'}}>
          <span style={{fontSize:13,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',whiteSpace:'nowrap'}}>{m.name}</span>
          {isSelf && <span style={{fontSize:8.5,background:GSoft,color:G,padding:'1px 6px',borderRadius:99,fontWeight:800}}>YOU</span>}
          <RoleBadge role={m.role}/>
        </div>
        <div style={{fontSize:10.5,color:GM,display:'flex',alignItems:'center',gap:8}}>
          <span>{m.email}</span>
          <span style={{color:LINE}}>·</span>
          <span style={{display:'flex',alignItems:'center',gap:3}}>
            <Building2 size={9} color={G}/>{m.department||m.dept}
          </span>
        </div>
      </div>
      <div style={{display:'flex',gap:18,alignItems:'center',flexShrink:0}}>
        {[['Tasks',m.tasks||0,G],['Projects',m.projects||0,C.purple]].map(([l,v,c])=>(
          <div key={l} style={{textAlign:'center'}}>
            <div style={{fontSize:14,fontWeight:900,color:c,fontFamily:'Cinzel,serif'}}>{v}</div>
            <div style={{fontSize:9,color:GM,textTransform:'uppercase'}}>{l}</div>
          </div>
        ))}
        <div style={{fontSize:10,color:GM,whiteSpace:'nowrap',minWidth:80,textAlign:'right',display:'flex',alignItems:'center',gap:3,justifyContent:'flex-end'}}>
          <Clock size={9} color={GM}/>{m.lastActive||m.lastSeen}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PERMISSION MATRIX
══════════════════════════════════════════════════════════════ */
function PermissionMatrix() {
  const perms = [
    ['Full Platform Access',       true,  false, false],
    ['Manage Team Members',        true,  false, false],
    ['Delete Projects',            true,  false, false],
    ['Create Projects & Tasks',    true,  true,  false],
    ['Use AI Chat',                true,  true,  true ],
    ['View Analytics',             true,  true,  true ],
    ['Update Own Profile',         true,  true,  true ],
    ['Read-only Workspace Access', true,  true,  true ],
  ];
  const roles = [
    {r:'Admin',  c:C.purple, Icon:Crown},
    {r:'Member', c:G,        Icon:Star },
    {r:'Viewer', c:C.slate,  Icon:Eye  },
  ];
  return (
    <div style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
      border:`1px solid ${LINE}`,borderRadius:20,padding:'22px 24px',
      boxShadow:'0 2px 14px rgba(201,119,0,.07)',position:'relative',overflow:'hidden',
      animation:'tmFadeUp .5s .3s both'}}>
      <div style={{position:'absolute',right:-40,top:-40,opacity:.04,
        animation:'tmSpin 80s linear infinite',pointerEvents:'none'}}>
        <Chakra size={160}/>
      </div>

      {/* header */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
        <div style={{width:3,height:18,background:`linear-gradient(to bottom,${G},${GL})`,borderRadius:2}}/>
        <h3 style={{fontSize:13.5,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',letterSpacing:'.03em'}}>
          Permission Matrix
        </h3>
        <Lock size={13} color={G} style={{marginLeft:'auto'}}/>
      </div>

      <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
        <thead>
          <tr style={{borderBottom:`1px solid ${LINE}`}}>
            <th style={{padding:'8px 14px',textAlign:'left',fontSize:9.5,fontWeight:800,
              color:GM,textTransform:'uppercase',letterSpacing:.5,fontFamily:'Cinzel,serif'}}>Permission</th>
            {roles.map(({r,c,Icon})=>(
              <th key={r} style={{padding:'8px 14px',textAlign:'center',fontSize:9.5,fontWeight:800,
                color:c,textTransform:'uppercase',letterSpacing:.5,fontFamily:'Cinzel,serif'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                  <Icon size={10} strokeWidth={2.5}/>{r}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {perms.map(([perm,...vals],ri)=>(
            <tr key={perm} style={{borderBottom:`1px solid ${LINE}`,
              background:ri%2===0?'rgba(201,119,0,.02)':'transparent',
              transition:'background .15s'}}
              onMouseEnter={e=>e.currentTarget.style.background=GSoft}
              onMouseLeave={e=>e.currentTarget.style.background=ri%2===0?'rgba(201,119,0,.02)':'transparent'}>
              <td style={{padding:'9px 14px',color:GM,fontWeight:500,fontSize:12}}>{perm}</td>
              {vals.map((v,ci)=>(
                <td key={ci} style={{padding:'9px 14px',textAlign:'center'}}>
                  {v
                    ? <div style={{display:'flex',justifyContent:'center'}}>
                        <div style={{width:20,height:20,borderRadius:6,background:C.greenBg,
                          border:`1px solid ${C.greenB}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <Check size={11} color={C.green} strokeWidth={3}/>
                        </div>
                      </div>
                    : <span style={{color:'rgba(201,119,0,.2)',fontSize:16,fontWeight:300}}>—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function TeamPage() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const {toasts, add:addToast, remove:removeToast} = useLocalToast();

  /* ── Try to fetch real team from API, fall back to SEED ── */
  const { data: apiTeam } = useQuery({
    queryKey: ['team'],
    queryFn:  () => authApi.team().then(r => r.data),
    staleTime: 60000,
    retry: false,
  });

  const [team,      setTeam]      = useState(SEED);
  const [search,    setSearch]    = useState('');
  const [roleF,     setRoleF]     = useState('');
  const [deptF,     setDeptF]     = useState('');
  const [statusF,   setStatusF]   = useState('');
  const [sortBy,    setSortBy]    = useState('name');
  const [viewMode,  setViewMode]  = useState('grid');
  const [selected,  setSelected]  = useState(null);
  const [showInvite,setShowInvite]= useState(false);
  const [confirm,   setConfirm]   = useState(null);

  /* Merge API data when it arrives */
  useEffect(()=>{
    if (apiTeam?.length) setTeam(apiTeam);
  },[apiTeam]);

  /* Identify current user */
  const currentUserId = user?._id || user?.id || 'u1';

  /* ── Derived filtered + sorted list ── */
  const filtered = team
    .filter(m => !search || (m.name+m.email+(m.department||m.dept||'')).toLowerCase().includes(search.toLowerCase()))
    .filter(m => !roleF   || m.role === roleF)
    .filter(m => !deptF   || (m.department||m.dept) === deptF)
    .filter(m => !statusF || m.status === statusF)
    .sort((a,b)=>
      sortBy==='name'     ? a.name.localeCompare(b.name) :
      sortBy==='tasks'    ? (b.tasks||0)-(a.tasks||0) :
      sortBy==='projects' ? (b.projects||0)-(a.projects||0) :
      a.name.localeCompare(b.name)
    );

  const groups = [
    {label:'Administrators', key:'admin',  color:C.purple, Icon:Crown },
    {label:'Members',        key:'member', color:G,        Icon:Star  },
    {label:'Viewers',        key:'viewer', color:C.slate,  Icon:Eye   },
  ];

  /* ── Actions ── */
  function handleRoleChange(id, role) {
    setTeam(t=>t.map(m=>(m.id||m._id)===id?{...m,role}:m));
    setSelected(s=>s&&(s.id||s._id)===id?{...s,role}:s);
  }
  function handleToggleStatus(id) {
    setTeam(t=>t.map(m=>(m.id||m._id)===id?{...m,status:m.status==='active'?'inactive':'active'}:m));
    setSelected(s=>s&&(s.id||s._id)===id?{...s,status:s.status==='active'?'inactive':'active'}:s);
  }
  function handleRemovePrompt(member) {
    setConfirm({
      title:`Remove ${member.name}?`,
      body:'This member will be permanently removed from the workspace. This action cannot be undone.',
      ok:'Remove', danger:true,
      onOk:()=>{
        setTeam(t=>t.filter(m=>(m.id||m._id)!==(member.id||member._id)));
        if ((selected?.id||selected?._id)===(member.id||member._id)) setSelected(null);
        addToast({type:'success',title:'Member Removed',msg:`${member.name} has been removed.`});
        setConfirm(null);
      },
    });
  }
  function handleInvited(newMember) {
    setTeam(t=>[...t,newMember]);
  }
  function clearFilters() { setSearch(''); setRoleF(''); setDeptF(''); setStatusF(''); }
  const hasFilter = search||roleF||deptF||statusF;

  /* ── KPI cards ── */
  const kpiCards = [
    {Icon:Users,      label:'Total Members',  val:team.length,                                      c:G      },
    {Icon:UserCheck,  label:'Active',          val:team.filter(m=>m.status==='active').length,       c:C.green},
    {Icon:Crown,      label:'Admins',          val:team.filter(m=>m.role==='admin').length,          c:C.purple},
    {Icon:Building2,  label:'Departments',     val:[...new Set(team.map(m=>m.department||m.dept||''))].filter(Boolean).length, c:C.blue},
    {Icon:Activity,   label:'Avg Tasks',       val:Math.round(team.reduce((a,m)=>a+(m.tasks||0),0)/Math.max(team.length,1)), c:C.amber},
  ];

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @keyframes tmSpin    { to { transform:rotate(360deg); } }
        @keyframes tmFadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes tmModalIn { from{opacity:0;transform:scale(.96) translateY(10px)} to{opacity:1;transform:none} }
        @keyframes tmToastIn { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:none} }
        @keyframes tmSlideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(201,119,0,.25);border-radius:4px}
        ::-webkit-scrollbar-track{background:transparent}
        button,input,select,textarea{font-family:'Outfit',sans-serif;}
        button:hover:not(:disabled){filter:brightness(1.04)}
        input:focus,select:focus,textarea:focus{
          border-color:${G}!important;
          box-shadow:0 0 0 3px rgba(201,119,0,.11)!important;
          outline:none;
        }
      `}</style>

      {/* ambient bg chakras */}
      <div style={{position:'fixed',right:-180,top:'40%',transform:'translateY(-50%)',opacity:.028,
        pointerEvents:'none',zIndex:0,animation:'tmSpin 100s linear infinite'}}>
        <Chakra size={560}/>
      </div>
      <div style={{position:'fixed',left:-90,bottom:-90,opacity:.018,pointerEvents:'none',zIndex:0,
        animation:'tmSpin 140s linear infinite reverse'}}>
        <Chakra size={320}/>
      </div>

      <div style={{width:'100%',minHeight:'100%',
        background:`linear-gradient(145deg,${CREAM} 0%,${CREAM2} 50%,${CREAM3} 100%)`,
        fontFamily:'Outfit,sans-serif',position:'relative',zIndex:1,padding:'28px 32px'}}>

        {/* ── HEADER ── */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
          marginBottom:26,animation:'tmFadeUp .5s both'}}>
          <div>
            <div style={{fontSize:9.5,color:'rgba(201,119,0,.45)',fontFamily:'Cinzel,serif',
              letterSpacing:'.22em',textTransform:'uppercase',marginBottom:4}}>
              दल · Sacred Workspace
            </div>
            <h1 style={{fontSize:26,fontWeight:900,color:GD,fontFamily:'Cinzel,serif',
              letterSpacing:'.02em',lineHeight:1.1}}>
              Team Management
            </h1>
            <p style={{fontSize:12.5,color:GM,marginTop:4}}>
              Manage members, permissions &amp; workspace access.
              {user && <span style={{color:G,fontWeight:600}}> — {team.filter(m=>m.status==='active').length} members online</span>}
            </p>
          </div>
          <button onClick={()=>setShowInvite(true)}
            style={{display:'flex',alignItems:'center',gap:8,padding:'11px 22px',borderRadius:14,
              border:'none',background:`linear-gradient(135deg,${G},${GL})`,
              color:'#fff',fontSize:12.5,fontWeight:800,cursor:'pointer',
              fontFamily:'Cinzel,serif',boxShadow:'0 6px 22px rgba(201,119,0,.4)',
              letterSpacing:'.04em',whiteSpace:'nowrap',flexShrink:0}}>
            <UserPlus size={15}/> Invite Member
          </button>
        </div>

        {/* ── KPI CARDS ── */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,
          marginBottom:22,animation:'tmFadeUp .5s .06s both'}}>
          {kpiCards.map(({Icon,label,val,c})=>(
            <div key={label}
              style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
                border:`1px solid ${LINE}`,borderRadius:18,padding:'16px 18px',
                boxShadow:'0 2px 12px rgba(201,119,0,.07)',
                display:'flex',alignItems:'center',gap:12,
                transition:'transform .18s,box-shadow .18s',cursor:'default'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 10px 28px rgba(201,119,0,.14)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 12px rgba(201,119,0,.07)';}}>
              <div style={{width:42,height:42,borderRadius:13,background:`${c}12`,
                display:'flex',alignItems:'center',justifyContent:'center',
                border:`1px solid ${c}22`,flexShrink:0,color:c}}>
                <Icon size={18} strokeWidth={1.8}/>
              </div>
              <div>
                <div style={{fontSize:22,fontWeight:900,color:GD,fontFamily:'Cinzel,serif',lineHeight:1}}>{val}</div>
                <div style={{fontSize:10,color:GM,marginTop:2}}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* gold divider */}
        <div style={{height:1,background:`linear-gradient(90deg,transparent,rgba(201,119,0,.22),transparent)`,marginBottom:20}}/>

        {/* ── FILTER BAR ── */}
        <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center',
          animation:'tmFadeUp .5s .1s both'}}>
          {/* search */}
          <div style={{position:'relative',flex:'1 1 220px'}}>
            <Search size={13} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',
              color:GM,opacity:.5,pointerEvents:'none'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search by name, email, department…"
              style={{...INPST,paddingLeft:34}}/>
          </div>

          {/* filters */}
          {[
            {val:roleF,   set:setRoleF,   placeholder:'All Roles',   opts:['admin','member','viewer']},
            {val:deptF,   set:setDeptF,   placeholder:'All Depts',   opts:DEPTS},
            {val:statusF, set:setStatusF, placeholder:'All Status',  opts:['active','inactive']},
          ].map(({val,set,placeholder,opts})=>(
            <select key={placeholder} value={val} onChange={e=>set(e.target.value)}
              style={{...INPST,width:'auto',cursor:'pointer',minWidth:130,color:val?GD:GM}}>
              <option value="">{placeholder}</option>
              {opts.map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
            </select>
          ))}

          {/* sort */}
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            style={{...INPST,width:'auto',cursor:'pointer',minWidth:140,color:GD}}>
            <option value="name">Sort: Name</option>
            <option value="tasks">Sort: Tasks</option>
            <option value="projects">Sort: Projects</option>
          </select>

          {/* view toggle */}
          <div style={{display:'flex',border:`1px solid ${GBorder}`,borderRadius:12,
            overflow:'hidden',background:'rgba(255,253,245,.9)',flexShrink:0}}>
            {[['grid',<Grid3X3 size={15}/>],['list',<List size={15}/>]].map(([m,icon])=>(
              <button key={m} onClick={()=>setViewMode(m)}
                style={{padding:'9px 13px',border:'none',cursor:'pointer',
                  background:viewMode===m?`linear-gradient(135deg,${G},${GL})`:'transparent',
                  color:viewMode===m?'white':GM,transition:'all .15s',display:'flex',alignItems:'center'}}>
                {icon}
              </button>
            ))}
          </div>

          {/* clear */}
          {hasFilter && (
            <button onClick={clearFilters}
              style={{padding:'9px 14px',borderRadius:12,border:`1px solid ${C.redB}`,
                background:C.redBg,color:C.red,fontSize:11.5,fontWeight:700,cursor:'pointer',
                display:'flex',alignItems:'center',gap:5}}>
              <X size={12}/> Clear
            </button>
          )}
        </div>

        {/* count */}
        <div style={{fontSize:11,color:GM,marginBottom:18,animation:'tmFadeUp .4s .14s both',
          display:'flex',alignItems:'center',gap:6}}>
          <Users size={11} color={G}/>
          Showing <strong style={{color:G,marginLeft:3}}>{filtered.length}</strong>
          <span style={{margin:'0 3px'}}>of</span>
          <strong>{team.length}</strong> members
          {hasFilter && <span style={{color:GM}}> (filtered)</span>}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{display:'flex',gap:18,alignItems:'flex-start'}}>

          {/* member sections */}
          <div style={{flex:1,minWidth:0}}>

            {filtered.length === 0 && (
              <div style={{textAlign:'center',padding:'80px 0'}}>
                <div style={{opacity:.07,marginBottom:16,display:'flex',justifyContent:'center'}}>
                  <Chakra size={90}/>
                </div>
                <h3 style={{fontSize:18,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',marginBottom:6}}>
                  No members found
                </h3>
                <p style={{fontSize:13,color:GM,marginBottom:18}}>Adjust your search or filters.</p>
                {hasFilter && (
                  <button onClick={clearFilters} style={{padding:'9px 20px',borderRadius:12,
                    border:`1px solid ${GBorder}`,background:GSoft,color:G,
                    fontSize:12,fontWeight:700,cursor:'pointer'}}>
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

            {groups.map(({label,key,color,Icon})=>{
              const grp = filtered.filter(m=>m.role===key);
              if (!grp.length) return null;
              return (
                <div key={key} style={{marginBottom:28}}>
                  {/* group header */}
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                    <div style={{width:3,height:20,background:`linear-gradient(to bottom,${G},${GL})`,borderRadius:2}}/>
                    <Icon size={14} color={color} strokeWidth={2}/>
                    <span style={{fontSize:12,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',letterSpacing:'.05em'}}>
                      {label}
                    </span>
                    <span style={{fontSize:10,fontWeight:800,color:'#fff',background:color,
                      padding:'2px 10px',borderRadius:99,boxShadow:`0 2px 8px ${color}55`}}>
                      {grp.length}
                    </span>
                  </div>

                  {viewMode === 'grid' ? (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(248px,1fr))',gap:14}}>
                      {grp.map((m,i)=>(
                        <MemberCard key={m.id||m._id} m={m}
                          isSelf={(m.id||m._id)===currentUserId}
                          idx={i} selected={selected&&(selected.id||selected._id)===(m.id||m._id)}
                          onClick={()=>setSelected(s=>s&&(s.id||s._id)===(m.id||m._id)?null:m)}/>
                      ))}
                    </div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {grp.map((m,i)=>(
                        <MemberRow key={m.id||m._id} m={m}
                          isSelf={(m.id||m._id)===currentUserId}
                          idx={i} selected={selected&&(selected.id||selected._id)===(m.id||m._id)}
                          onClick={()=>setSelected(s=>s&&(s.id||s._id)===(m.id||m._id)?null:m)}/>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* permission matrix */}
            {filtered.length > 0 && <PermissionMatrix/>}
          </div>

          {/* ── DETAIL PANEL ── */}
          {selected && (
            <DetailPanel
              member={selected}
              currentUserId={currentUserId}
              onClose={()=>setSelected(null)}
              onRoleChange={handleRoleChange}
              onToggleStatus={handleToggleStatus}
              onRemove={handleRemovePrompt}
              addToast={addToast}/>
          )}
        </div>

        {/* footer */}
        <div style={{textAlign:'center',marginTop:36,paddingTop:16,borderTop:`1px solid ${LINE}`}}>
          <p style={{fontSize:10,color:'rgba(120,80,30,.3)',fontFamily:'Cinzel,serif',letterSpacing:'.12em'}}>
            ॐ नमो भगवते वासुदेवाय — Sudharshan AI Enterprise v3.0
          </p>
        </div>
      </div>

      {/* modals */}
      {showInvite && (
        <InviteModal onClose={()=>setShowInvite(false)} onInvited={handleInvited} addToast={addToast}/>
      )}
      <Confirm data={confirm} onCancel={()=>setConfirm(null)}/>
      <ToastStack toasts={toasts} remove={removeToast}/>
    </>
  );
}
