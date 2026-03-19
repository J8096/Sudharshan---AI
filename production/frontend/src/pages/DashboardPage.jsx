

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  Zap, Brain, Cpu, Gauge, TrendingUp, TrendingDown, Clock,
  ChevronRight, MessageSquare, FolderOpen, Users, Activity,
  Shield, ArrowUpRight, CheckCircle, AlertCircle, Star,
  Rocket, Monitor, Layers, Target, Sparkles, Code2,
  MessageCircle, Database, Package, Globe,
} from 'lucide-react';
import { analyticsApi, chatApi, projectApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS — exact match with entire app
══════════════════════════════════════════════════════════════ */
const G     = '#C97700';
const GL    = '#E8920A';
const GD    = '#3D1F00';
const GM    = '#7A4F00';
const GSoft = 'rgba(201,119,0,.08)';
const GBorder = 'rgba(201,119,0,.2)';
const CREAM  = '#FFFDF5';
const CREAM2 = '#FFF8E5';
const CREAM3 = '#FEF3D0';
const LINE   = 'rgba(201,119,0,.13)';
const LINEB  = 'rgba(201,119,0,.22)';

const C = {
  green:'#059669',  greenBg:'rgba(5,150,105,.09)',   greenB:'rgba(5,150,105,.22)',
  red:'#DC2626',    redBg:'rgba(220,38,38,.09)',
  blue:'#0EA5E9',   blueBg:'rgba(14,165,233,.09)',
  purple:'#7C3AED', purpleBg:'rgba(124,58,237,.09)',
  teal:'#0891B2',   amber:'#D97706',
};

/* ── Fallback data ── */
function mkActivity(n = 30) {
  return Array.from({ length: n }, (_, i) => ({
    day: i + 1,
    messages: Math.floor(55 + Math.sin(i * .65) * 38 + Math.random() * 18),
    sessions:  Math.floor(12 + Math.cos(i * .5)  *  8 + Math.random() *  6),
    tokens:    Math.floor(800 + Math.sin(i * .4) * 300 + Math.random() * 200),
  }));
}
const WEEKLY_MOCK = [
  {d:'Mon',v:42,f:38},{d:'Tue',v:78,f:65},{d:'Wed',v:55,f:60},
  {d:'Thu',v:91,f:80},{d:'Fri',v:67,f:70},{d:'Sat',v:34,f:38},{d:'Sun',v:23,f:20},
];
const MOCK_SESSIONS = [
  {id:1,title:'Optimize React performance patterns',msgCount:24,model:'llama-3.3-70b-versatile',ago:'2m'},
  {id:2,title:'Build REST API with authentication',  msgCount:18,model:'mixtral-8x7b-32768',      ago:'1h'},
  {id:3,title:'Data analysis on sales pipeline Q4',  msgCount:31,model:'llama-3.1-8b-instant',    ago:'3h'},
  {id:4,title:'Write technical specification doc',   msgCount:9, model:'gemma2-9b-it',             ago:'6h'},
  {id:5,title:'Debug authentication middleware',     msgCount:15,model:'llama-3.3-70b-versatile',  ago:'1d'},
];
const MOCK_PROJECTS = [
  {id:1,title:'Sudharshan AI Core',  iconIdx:0,progress:78,status:'active',  color:G       },
  {id:2,title:'API Gateway v2',      iconIdx:1,progress:45,status:'active',  color:C.blue  },
  {id:3,title:'Analytics Engine',    iconIdx:2,progress:92,status:'completed',color:C.green},
  {id:4,title:'Mobile SDK',          iconIdx:3,progress:23,status:'active',  color:C.purple},
];
const PROJ_ICONS = [Rocket, Monitor, Layers, Target, Package, Globe, Code2, Database];

const GROQ_META = {
  'llama-3.3-70b-versatile': {label:'Llama 3.3 · 70B', speed:280, tier:'Best',    color:G         },
  'llama-3.1-8b-instant':    {label:'Llama 3.1 · 8B',  speed:560, tier:'Fastest', color:C.green   },
  'openai/gpt-oss-120b':     {label:'GPT OSS · 120B',  speed:500, tier:'Power',   color:C.purple  },
  'openai/gpt-oss-20b':      {label:'GPT OSS · 20B',   speed:1000,tier:'Fastest', color:C.green   },
  'mixtral-8x7b-32768':      {label:'Mixtral MoE',     speed:400, tier:'Power',   color:C.blue    },
  'gemma2-9b-it':            {label:'Gemma 2 · 9B',    speed:480, tier:'Fast',    color:C.teal    },
};
const TIER_C = {
  Best:    {bg:GSoft,       c:G,       b:GBorder},
  Fastest: {bg:C.greenBg,  c:C.green, b:C.greenB},
  Power:   {bg:C.purpleBg, c:C.purple,b:'rgba(124,58,237,.3)'},
  Fast:    {bg:C.blueBg,   c:C.blue,  b:'rgba(14,165,233,.3)'},
};

/* ── Activity feed items ── */
const ACTIVITY_ICONS = {
  chat:    {Icon:MessageCircle, c:G        },
  task:    {Icon:CheckCircle,   c:C.green  },
  project: {Icon:FolderOpen,    c:C.purple },
  system:  {Icon:Shield,        c:C.teal   },
  team:    {Icon:Users,         c:C.blue   },
};

/* ══════════════════════════════════════════════════════════════
   CHAKRA SVG
══════════════════════════════════════════════════════════════ */
function Chakra({ size=80, opacity=1, spin=false, speed='90s' }) {
  const sp = Array.from({length:16},(_,i)=>{
    const a=(i*22.5*Math.PI)/180;
    return{x1:50+20*Math.cos(a),y1:50+20*Math.sin(a),x2:50+44*Math.cos(a),y2:50+44*Math.sin(a)};
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{opacity,display:'block',flexShrink:0,animation:spin?`dbSpin ${speed} linear infinite`:undefined}}>
      <circle cx="50" cy="50" r="47" fill="none" stroke={G} strokeWidth=".8"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke={GL} strokeWidth=".3" strokeDasharray="2 4"/>
      {sp.map((p,i)=><line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={G} strokeWidth="1.1" strokeLinecap="round"/>)}
      <circle cx="50" cy="50" r="16" fill="none" stroke={G} strokeWidth=".7"/>
      <circle cx="50" cy="50" r="7" fill={`${G}22`} stroke={G} strokeWidth=".8"/>
      <circle cx="50" cy="50" r="3.8" fill={G}/>
      <circle cx="50" cy="50" r="1.6" fill="#FFB830"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRIMITIVES
══════════════════════════════════════════════════════════════ */
function Card({ children, style={}, onClick, noHover=false }) {
  const [h, sH] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
      style={{
        background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
        border:`1px solid ${h&&onClick&&!noHover?LINEB:LINE}`,
        borderRadius:18,overflow:'hidden',
        boxShadow:h&&onClick&&!noHover?'0 12px 40px rgba(201,119,0,.16)':'0 2px 14px rgba(201,119,0,.07)',
        transition:'all .22s ease',
        cursor:onClick?'pointer':'default',
        transform:h&&onClick&&!noHover?'translateY(-2px)':'none',
        ...style,
      }}>{children}</div>
  );
}

function SectionHdr({ children, action, label='View all', accent=G }) {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:3,height:14,background:`linear-gradient(to bottom,${accent},${accent}60)`,borderRadius:2,flexShrink:0}}/>
        <span style={{fontSize:10,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',letterSpacing:'.09em',textTransform:'uppercase'}}>{children}</span>
      </div>
      {action && (
        <button onClick={action} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,fontWeight:600,
          color:accent,background:GSoft,border:`1px solid ${LINE}`,padding:'3px 10px',borderRadius:99,cursor:'pointer',fontFamily:'Outfit,sans-serif'}}>
          {label} <ArrowUpRight size={9}/>
        </button>
      )}
    </div>
  );
}

function HDivider() {
  return <div style={{height:1,background:`linear-gradient(90deg,transparent,${LINE},transparent)`,margin:'0 0 12px'}}/>;
}

function Skeleton({ h=20, r=8, mb=0 }) {
  return <div style={{height:h,borderRadius:r,marginBottom:mb,
    background:'linear-gradient(90deg,rgba(201,119,0,.05) 25%,rgba(201,119,0,.1) 50%,rgba(201,119,0,.05) 75%)',
    backgroundSize:'200% 100%',animation:'dbShimmer 1.6s ease infinite'}}/>;
}

function PulseDot({ color=C.green, size=7 }) {
  return (
    <span style={{position:'relative',display:'inline-flex',width:size,height:size,flexShrink:0}}>
      <span style={{position:'absolute',inset:0,borderRadius:'50%',background:color,zIndex:1}}/>
      <span style={{position:'absolute',inset:-3,borderRadius:'50%',border:`1.5px solid ${color}`,animation:'dbPulse 1.6s ease infinite'}}/>
    </span>
  );
}

/* ── Tooltip ── */
function ChartTip({ active, payload, label }) {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:CREAM,border:`1px solid ${LINEB}`,borderRadius:10,padding:'8px 13px',
      fontSize:11,color:GD,fontFamily:'Outfit,sans-serif',boxShadow:'0 6px 24px rgba(201,119,0,.18)'}}>
      <div style={{color:'rgba(122,79,0,.5)',marginBottom:4,fontSize:9.5}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color||G,fontWeight:700,display:'flex',alignItems:'center',gap:5}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:p.color||G}}/>
          {p.name}: <span style={{color:GD}}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Animated counter ── */
function Counter({ value, duration=1200 }) {
  const [display, setDisplay] = useState(0);
  const numeric = parseFloat(String(value).replace(/[^0-9.]/g,''));
  const suffix  = String(value).replace(/[0-9.]/g,'');
  useEffect(()=>{
    if (isNaN(numeric)) return;
    let startTime=null;
    const step=ts=>{
      if(!startTime) startTime=ts;
      const p=Math.min((ts-startTime)/duration,1);
      const ease=1-Math.pow(1-p,3);
      setDisplay(Math.floor(ease*numeric));
      if(p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },[numeric,duration]);
  return <>{isNaN(numeric)?value:`${display.toLocaleString()}${suffix}`}</>;
}

/* ── Spark mini chart ── */
function Spark({ data, color, h=28 }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <AreaChart data={data.map((v,i)=>({v,i}))} margin={{top:2,right:0,left:0,bottom:0}}>
        <defs>
          <linearGradient id={`sg_${color.replace(/[^a-z0-9]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".22"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8}
          fill={`url(#sg_${color.replace(/[^a-z0-9]/gi,'')})`} dot={false}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODEL ROW
══════════════════════════════════════════════════════════════ */
function ModelRow({ m, statusOk, last }) {
  const meta = GROQ_META[m.id]||{label:m.name||m.id,speed:0,tier:null,color:G};
  const tc   = meta.tier ? TIER_C[meta.tier] : null;
  const bar  = Math.max(15,Math.min(100,(meta.speed/12)));
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',
      borderBottom:!last?`1px solid ${LINE}`:'none',transition:'background .15s'}}
      onMouseEnter={e=>e.currentTarget.style.background=GSoft}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      <div style={{width:32,height:32,borderRadius:9,flexShrink:0,display:'flex',alignItems:'center',
        justifyContent:'center',background:`${meta.color}14`,border:`1px solid ${meta.color}28`}}>
        <Zap size={13} color={meta.color}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:3}}>
          <span style={{fontSize:11,fontWeight:700,color:GD,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {meta.label}
          </span>
          <span style={{fontSize:7.5,fontWeight:700,padding:'1px 5px',borderRadius:99,
            background:statusOk?C.greenBg:C.redBg,color:statusOk?C.green:C.red,flexShrink:0}}>
            {statusOk?'● live':'○ off'}
          </span>
          {tc&&meta.tier&&(
            <span style={{fontSize:7.5,fontWeight:700,padding:'1px 6px',borderRadius:99,
              background:tc.bg,color:tc.c,border:`1px solid ${tc.b}`,flexShrink:0}}>{meta.tier}</span>
          )}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{flex:1,height:3,background:'rgba(201,119,0,.1)',borderRadius:99,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${bar}%`,background:`linear-gradient(90deg,${meta.color},${meta.color}88)`,borderRadius:99}}/>
          </div>
          <span style={{fontSize:8.5,color:GM,flexShrink:0,fontFamily:'monospace'}}>{meta.speed} t/s</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [tab,  setTab]  = useState('14d');
  const [now,  setNow]  = useState(new Date());

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);

  const h      = now.getHours();
  const greet  = h<12?'Good morning':h<18?'Good afternoon':'Good evening';
  const gSkt   = h<12?'शुभ प्रभात':h<18?'शुभ अपराह्न':'शुभ संध्या';
  const timeStr= now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});

  /* ── Queries ── */
  const {data:stats,    isLoading:sl} = useQuery({queryKey:['analytics'], queryFn:()=>analyticsApi.stats().then(r=>r.data)});
  const {data:sessions, isLoading:cl} = useQuery({queryKey:['sessions'],  queryFn:()=>chatApi.sessions().then(r=>r.data)});
  const {data:projects, isLoading:pl} = useQuery({queryKey:['projects'],  queryFn:()=>projectApi.list().then(r=>r.data)});
  const {data:models}                 = useQuery({queryKey:['models'],    queryFn:()=>chatApi.models().then(r=>r.data)});
  const {data:health}                 = useQuery({queryKey:['health'],    queryFn:()=>chatApi.health().then(r=>r.data),refetchInterval:30000});

  const statusOk    = health?.hasKey!==false;
  const actRaw      = stats?.activityData||mkActivity(30);
  const actSlice    = tab==='7d'?actRaw.slice(-7):tab==='14d'?actRaw.slice(-14):actRaw;
  const spark10     = actRaw.slice(-10);
  const textModels  = (models||[]).filter(m=>!m.id?.includes('whisper')&&!m.id?.includes('audio'));
  const chatList    = sessions?.slice(0,5)||MOCK_SESSIONS;
  const projList    = projects?.slice(0,4)||MOCK_PROJECTS;
  const weeklyData  = stats?.weeklyData||WEEKLY_MOCK;

  /* ── KPI definitions ── */
  const kpis = [
    {label:'Total Conversations',value:stats?.kpis?.totalChats??1247,  sub:'+12% this week',trend:'+12%',up:true,
     Icon:MessageSquare,acc:G,       spark:spark10.map(d=>d.sessions||0),path:'/chat',    desc:'AI chat sessions'},
    {label:'Messages Channeled',  value:stats?.kpis?.totalMessages??8934,sub:'+8% this week', trend:'+8%', up:true,
     Icon:Activity,    acc:C.blue,   spark:spark10.map(d=>d.messages||0),path:'/analytics',desc:'Tokens processed'},
    {label:'Active Projects',     value:stats?.kpis?.activeProjects??projects?.length??4,sub:'In progress',trend:null,up:null,
     Icon:FolderOpen,  acc:C.purple, spark:[3,3,4,4,4,4,4,4,4,4],       path:'/projects', desc:'Across workspaces'},
    {label:'System Uptime',       value:stats?.kpis?.uptime?`${stats.kpis.uptime}%`:'99.9%',sub:'Last 30 days',trend:'Stable',up:true,
     Icon:Shield,      acc:C.green,  spark:[99,100,100,99,100,100,99,99,100,100],path:'/analytics',desc:'SLA compliance'},
  ];

  /* ── Chart summary stats — all guarded against undefined/NaN ── */
  const msgVals  = actSlice.map(d=>Number(d.messages)||0).filter(v=>v>0);
  const sesVals  = actSlice.map(d=>Number(d.sessions)||0);
  const avgMsg   = msgVals.length ? Math.round(msgVals.reduce((a,v)=>a+v,0)/msgVals.length) : 0;
  const peakMsg  = msgVals.length ? Math.max(...msgVals) : 0;
  const totSes   = sesVals.some(v=>v>0) ? sesVals.reduce((a,v)=>a+v,0) : '—';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @keyframes dbSpin    { to { transform:rotate(360deg);  } }
        @keyframes dbSpinCCW { to { transform:rotate(-360deg); } }
        @keyframes dbPulse   { 0%,100%{transform:scale(1);opacity:.9} 50%{transform:scale(1.8);opacity:0} }
        @keyframes dbShimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        @keyframes dbUp      { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .db1{animation:dbUp .45s cubic-bezier(.22,1,.36,1) .00s both}
        .db2{animation:dbUp .45s cubic-bezier(.22,1,.36,1) .05s both}
        .db3{animation:dbUp .45s cubic-bezier(.22,1,.36,1) .10s both}
        .db4{animation:dbUp .45s cubic-bezier(.22,1,.36,1) .15s both}
        .db5{animation:dbUp .45s cubic-bezier(.22,1,.36,1) .18s both}
        .db6{animation:dbUp .45s cubic-bezier(.22,1,.36,1) .22s both}
        .db7{animation:dbUp .45s cubic-bezier(.22,1,.36,1) .26s both}
        .db8{animation:dbUp .45s cubic-bezier(.22,1,.36,1) .30s both}
        .db9{animation:dbUp .45s cubic-bezier(.22,1,.36,1) .34s both}
        .dbRow:hover{background:rgba(201,119,0,.05)!important}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(201,119,0,.22);border-radius:4px}
        ::-webkit-scrollbar-track{background:transparent}
        button,input,select{font-family:'Outfit',sans-serif;}
        button:hover:not(:disabled){filter:brightness(1.04)}
      `}</style>

      {/* ambient bg chakras */}
      <div style={{position:'fixed',bottom:-200,right:-200,zIndex:0,pointerEvents:'none',
        opacity:.022,animation:'dbSpin 120s linear infinite'}}><Chakra size={600}/></div>
      <div style={{position:'fixed',top:-180,left:-180,zIndex:0,pointerEvents:'none',
        opacity:.016,animation:'dbSpinCCW 180s linear infinite'}}><Chakra size={460}/></div>

      <div style={{width:'100%',height:'100%',overflowY:'auto',
        background:`linear-gradient(155deg,${CREAM} 0%,${CREAM2} 55%,${CREAM3} 100%)`,
        fontFamily:'Outfit,sans-serif',position:'relative'}}>

        <div style={{position:'relative',zIndex:1,padding:'20px 26px 32px',maxWidth:1400,width:'100%',margin:'0 auto'}}>

          {/* ══ HEADER ═══════════════════════════════════════════════ */}
          <div className="db1" style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                <div style={{opacity:.7,animation:'dbSpin 18s linear infinite'}}><Chakra size={20}/></div>
                <span style={{fontSize:8.5,color:'rgba(201,119,0,.5)',fontFamily:'Cinzel,serif',letterSpacing:'.22em',textTransform:'uppercase'}}>
                  {gSkt} · ॐ
                </span>
              </div>
              <h1 style={{fontSize:25,fontWeight:900,color:GD,fontFamily:'Cinzel,serif',lineHeight:1.1,marginBottom:4}}>
                {greet},{' '}
                <span style={{background:`linear-gradient(120deg,${G},${GL})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  {user?.name?.split(' ')[0]||'Alex'}
                </span>
              </h1>
              <p style={{fontSize:12.5,color:GM}}>Sudharshan AI Enterprise · Your platform is performing brilliantly.</p>
            </div>

            <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
              {/* clock */}
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',
                background:`linear-gradient(145deg,${CREAM},${CREAM2})`,border:`1px solid ${LINE}`,
                borderRadius:12,fontFamily:'monospace',fontSize:13,fontWeight:500,color:GM,
                boxShadow:'0 2px 12px rgba(201,119,0,.07)'}}>
                <Clock size={12} color={GM}/>{timeStr}
              </div>
              {/* status */}
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'7px 13px',
                background:statusOk?C.greenBg:C.redBg,
                border:`1px solid ${statusOk?C.greenB:'rgba(220,38,38,.22)'}`,borderRadius:12}}>
                <PulseDot color={statusOk?C.green:C.red}/>
                <span style={{fontSize:11,fontWeight:700,color:statusOk?C.green:C.red}}>
                  {statusOk?'All Systems Live':'API Key Missing'}
                </span>
              </div>
              <div style={{padding:'7px 13px',background:GSoft,border:`1px solid ${LINE}`,
                borderRadius:12,fontSize:10.5,fontWeight:600,color:GM}}>
                Enterprise v3.0
              </div>
            </div>
          </div>

          {/* gold divider */}
          <div style={{height:1,background:`linear-gradient(90deg,transparent,${LINEB},transparent)`,marginBottom:16}}/>

          {/* ══ KPI GRID ════════════════════════════════════════════ */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:14}}>
            {kpis.map((k,i)=>(
              <div key={k.label} className={`db${i+2}`}
                onClick={()=>navigate(k.path)}
                style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
                  border:`1px solid ${LINE}`,borderRadius:18,padding:'16px 16px 12px',
                  cursor:'pointer',position:'relative',overflow:'hidden',
                  boxShadow:'0 2px 14px rgba(201,119,0,.06)',transition:'all .22s ease'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 14px 40px rgba(201,119,0,.15)`;e.currentTarget.style.borderColor=`${k.acc}50`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 14px rgba(201,119,0,.06)';e.currentTarget.style.borderColor=LINE;}}>
                {/* radial glow */}
                <div style={{position:'absolute',top:-28,right:-28,width:90,height:90,borderRadius:'50%',
                  background:`radial-gradient(circle,${k.acc}20 0%,transparent 70%)`,pointerEvents:'none'}}/>
                {/* watermark */}
                <div style={{position:'absolute',right:-12,bottom:-12,opacity:.04,pointerEvents:'none',animation:'dbSpin 90s linear infinite'}}>
                  <Chakra size={80}/>
                </div>
                {/* header */}
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{width:38,height:38,borderRadius:11,display:'flex',alignItems:'center',
                    justifyContent:'center',background:`${k.acc}14`,border:`1px solid ${k.acc}25`,flexShrink:0}}>
                    <k.Icon size={17} color={k.acc}/>
                  </div>
                  {k.trend&&(
                    <span style={{fontSize:9.5,fontWeight:700,padding:'3px 8px',borderRadius:99,
                      background:k.up?C.greenBg:C.redBg,color:k.up?C.green:C.red,
                      display:'flex',alignItems:'center',gap:3}}>
                      {k.up?<TrendingUp size={9}/>:<TrendingDown size={9}/>}{k.trend}
                    </span>
                  )}
                </div>
                {/* value */}
                {sl ? <Skeleton h={26} r={6} mb={4}/> : (
                  <div style={{fontSize:28,fontWeight:900,color:GD,fontFamily:'Cinzel,serif',lineHeight:1,marginBottom:3}}>
                    <Counter value={k.value}/>
                  </div>
                )}
                <div style={{fontSize:11.5,fontWeight:600,color:GM,marginBottom:2}}>{k.label}</div>
                <div style={{fontSize:10,color:'rgba(122,79,0,.45)',marginBottom:10}}>{k.desc}</div>
                {/* sparkline — tight, no extra space */}
                <Spark data={k.spark} color={k.acc} h={26}/>
              </div>
            ))}
          </div>

          {/* ══ MAIN GRID ═══════════════════════════════════════════════
               3-column layout: chart spans 2 cols, model panel 1 col,
               weekly spans 1 col, chats 1 col, projects 1 col.
               All cards use alignSelf:stretch so the grid row height
               is set by the tallest card and every card fills it exactly.
          ══════════════════════════════════════════════════════════════ */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'1fr 1fr 1fr',
            gridTemplateRows:'auto auto',
            gap:12,
            marginBottom:12,
          }}>

            {/* ── Area Chart: spans 2 columns ── */}
            <div className="db5"
              style={{gridColumn:'1 / 3',
                background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
                border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
                boxShadow:'0 2px 14px rgba(201,119,0,.07)',
                display:'flex',flexDirection:'column',minHeight:0}}>
              <div style={{padding:'14px 16px 0',flexShrink:0}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:2}}>
                  <div>
                    <SectionHdr action={()=>navigate('/analytics')}>Message Activity</SectionHdr>
                    <p style={{fontSize:10.5,color:'rgba(122,79,0,.45)',marginTop:-8,marginBottom:8}}>
                      Conversations &amp; sessions — live trending
                    </p>
                  </div>
                  <div style={{display:'flex',gap:4}}>
                    {['7d','14d','30d'].map(t=>(
                      <button key={t} onClick={()=>setTab(t)} style={{
                        padding:'4px 10px',fontSize:10,fontWeight:600,borderRadius:8,cursor:'pointer',
                        fontFamily:'Outfit,sans-serif',transition:'all .15s',
                        background:tab===t?`linear-gradient(135deg,${G},${GL})`:GSoft,
                        color:tab===t?'#fff':GM,border:`1px solid ${tab===t?G:LINE}`,
                        boxShadow:tab===t?`0 3px 10px rgba(201,119,0,.3)`:'none'}}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* chart: exactly 200px tall, no flex growing */}
              <div style={{height:200,flexShrink:0,padding:'0 6px 0 0'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={actSlice} margin={{top:4,right:8,left:-20,bottom:0}}>
                    <defs>
                      <linearGradient id="gMsg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={G}      stopOpacity=".28"/>
                        <stop offset="100%" stopColor={G}      stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="gSes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={C.teal} stopOpacity=".18"/>
                        <stop offset="100%" stopColor={C.teal} stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="lMsg" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%"   stopColor={G}/>
                        <stop offset="100%" stopColor={GL}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,119,0,.06)" vertical={false}/>
                    <XAxis dataKey="day" tick={{fontSize:9,fill:'rgba(122,79,0,.45)'}}
                      tickLine={false} axisLine={false}
                      interval={tab==='7d'?0:tab==='14d'?1:4}/>
                    <YAxis tick={{fontSize:9,fill:'rgba(122,79,0,.45)'}} tickLine={false} axisLine={false}/>
                    {/* cursor={false} removes the vertical crosshair line on hover */}
                    <Tooltip content={<ChartTip/>} cursor={false}/>
                    <Area type="monotone" dataKey="messages" name="Messages" stroke="url(#lMsg)"
                      strokeWidth={2.5} fill="url(#gMsg)" dot={false} activeDot={{r:5,fill:G,strokeWidth:2,stroke:CREAM}}/>
                    <Area type="monotone" dataKey="sessions" name="Sessions" stroke={C.teal}
                      strokeWidth={1.8} fill="url(#gSes)" dot={false} strokeDasharray="5 3"
                      activeDot={{r:4,fill:C.teal,strokeWidth:2,stroke:CREAM}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* ── Footer: legend LEFT + mini stat pills RIGHT — fills all dead space ── */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'10px 16px 14px',flexShrink:0,borderTop:`1px solid ${LINE}`,
                background:`linear-gradient(90deg,rgba(201,119,0,.02),transparent)`}}>

                {/* legend */}
                <div style={{display:'flex',gap:16,alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:18,height:3,borderRadius:99,background:`linear-gradient(90deg,${G},${GL})`}}/>
                    <span style={{fontSize:10.5,fontWeight:600,color:GM}}>Messages</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:18,height:0,borderTop:`2.5px dashed ${C.teal}`,borderRadius:99}}/>
                    <span style={{fontSize:10.5,fontWeight:600,color:GM}}>Sessions</span>
                  </div>
                </div>

                {/* stat pills — replace dead space with meaningful data */}
                <div style={{display:'flex',gap:8}}>
                  {[
                    {l:'Avg / Day', v:avgMsg,  c:G,       Icon:Activity   },
                    {l:'Peak',      v:peakMsg, c:C.purple, Icon:TrendingUp },
                    {l:'Sessions',  v:totSes,  c:C.teal,   Icon:Users      },
                  ].map(s=>(
                    <div key={s.l} style={{display:'flex',alignItems:'center',gap:7,
                      padding:'5px 12px',borderRadius:10,
                      background:GSoft,border:`1px solid ${LINE}`}}>
                      <s.Icon size={11} color={s.c} strokeWidth={2}/>
                      <div>
                        <div style={{fontSize:13,fontWeight:800,color:s.c,fontFamily:'Cinzel,serif',lineHeight:1}}>{s.v}</div>
                        <div style={{fontSize:8.5,color:'rgba(122,79,0,.45)',marginTop:1,whiteSpace:'nowrap'}}>{s.l}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Model Status Panel: col 3, spans both rows ── */}
            <div className="db6"
              style={{gridColumn:'3 / 4', gridRow:'1 / 3',
                background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
                border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
                boxShadow:'0 2px 14px rgba(201,119,0,.07)',
                display:'flex',flexDirection:'column'}}>

              {/* ── top accent bar ── */}
              <div style={{height:3,background:`linear-gradient(90deg,${G},${GL},${G})`,flexShrink:0}}/>

              {/* ── header ── */}
              <div style={{padding:'14px 14px 0',flexShrink:0}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:3,height:14,background:`linear-gradient(to bottom,${G},${GL})`,borderRadius:2,flexShrink:0}}/>
                    <span style={{fontSize:10,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',letterSpacing:'.09em',textTransform:'uppercase'}}>Model Status</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:5,padding:'3px 9px',borderRadius:99,
                    background:statusOk?C.greenBg:C.redBg,
                    border:`1px solid ${statusOk?C.greenB:'rgba(220,38,38,.22)'}`}}>
                    <PulseDot color={statusOk?C.green:C.red} size={6}/>
                    <span style={{fontSize:9,fontWeight:700,color:statusOk?C.green:C.red}}>
                      {statusOk?'Live':'Offline'}
                    </span>
                  </div>
                </div>
                {/* Groq provider badge */}
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',
                  background:GSoft,border:`1px solid ${LINE}`,borderRadius:10,marginBottom:12}}>
                  <Zap size={12} color={G}/>
                  <span style={{fontSize:10,fontWeight:600,color:GM,flex:1}}>Groq Free Tier</span>
                  <span style={{fontSize:9,color:'rgba(122,79,0,.4)'}}>{textModels.length} models</span>
                </div>
              </div>

              {/* ── model rows ── */}
              <div style={{flexShrink:0}}>
                {!models
                  ? [1,2,3,4].map(i=><div key={i} style={{padding:'8px 14px'}}><Skeleton h={38} r={8}/></div>)
                  : textModels.slice(0,4).map((m,i)=>(
                      <ModelRow key={m.id} m={m} statusOk={statusOk} last={i===Math.min(3,textModels.length-1)}/>
                    ))
                }
              </div>

              <div style={{height:1,background:`linear-gradient(90deg,transparent,${LINE},transparent)`,margin:'8px 14px 12px',flexShrink:0}}/>

              {/* ── section label: Performance ── */}
              <div style={{padding:'0 14px 8px',flexShrink:0}}>
                <span style={{fontSize:8.5,fontWeight:700,color:'rgba(122,79,0,.4)',
                  textTransform:'uppercase',letterSpacing:'.16em',fontFamily:'Cinzel,serif'}}>
                  Performance
                </span>
              </div>

              {/* ── 2×2 KPI grid ── */}
              <div style={{padding:'0 14px 12px',flexShrink:0}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
                  {[
                    {l:'Avg Response',v:stats?.kpis?.avgResponseTime??'1.2s', c:G,        Icon:Gauge },
                    {l:'Satisfaction', v:stats?.kpis?.satisfaction?`${stats.kpis.satisfaction}%`:'98.4%', c:C.green,Icon:Star  },
                    {l:'Tokens Used',  v:stats?.kpis?.totalTokens?`${(stats.kpis.totalTokens/1000).toFixed(0)}K`:'940K', c:C.purple,Icon:Zap   },
                    {l:'Team Members', v:String(stats?.kpis?.teamMembers??1), c:C.blue, Icon:Users },
                  ].map((s,i)=>(
                    <div key={i}
                      style={{background:GSoft,border:`1px solid ${LINE}`,borderRadius:11,
                        padding:'9px 10px',transition:'all .18s',cursor:'default'}}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(201,119,0,.12)';e.currentTarget.style.borderColor=GBorder;}}
                      onMouseLeave={e=>{e.currentTarget.style.background=GSoft;e.currentTarget.style.borderColor=LINE;}}>
                      <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:5}}>
                        <div style={{width:20,height:20,borderRadius:6,background:`${s.c}14`,
                          border:`1px solid ${s.c}20`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <s.Icon size={10} color={s.c} strokeWidth={2}/>
                        </div>
                        <span style={{fontSize:8.5,color:'rgba(122,79,0,.45)',fontWeight:600,lineHeight:1.2}}>{s.l}</span>
                      </div>
                      <div style={{fontSize:15,fontWeight:900,color:s.c,fontFamily:'Cinzel,serif',lineHeight:1}}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{height:1,background:`linear-gradient(90deg,transparent,${LINE},transparent)`,margin:'0 14px 12px',flexShrink:0}}/>

              {/* ── Token usage bar ── */}
              <div style={{padding:'0 14px 12px',flexShrink:0}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7}}>
                  <span style={{fontSize:8.5,fontWeight:700,color:'rgba(122,79,0,.4)',
                    textTransform:'uppercase',letterSpacing:'.16em',fontFamily:'Cinzel,serif'}}>Token Usage</span>
                  <span style={{fontSize:11,fontWeight:800,color:G,fontFamily:'Cinzel,serif'}}>
                    {stats?.kpis?.totalTokens?`${(stats.kpis.totalTokens/1000).toFixed(0)}K`:'940K'}
                    <span style={{fontSize:9,color:'rgba(122,79,0,.35)',fontWeight:400}}> / ∞</span>
                  </span>
                </div>
                <div style={{height:7,background:'rgba(201,119,0,.1)',borderRadius:99,overflow:'hidden',marginBottom:5}}>
                  <div style={{height:'100%',width:'28%',
                    background:`linear-gradient(90deg,${G},${GL})`,
                    borderRadius:99,transition:'width 1s ease'}}/>
                </div>
                <p style={{fontSize:9,color:'rgba(122,79,0,.4)',lineHeight:1.4}}>
                  Free tier · Unlimited on Llama, Mixtral &amp; Gemma. ॐ
                </p>
              </div>

              <div style={{height:1,background:`linear-gradient(90deg,transparent,${LINE},transparent)`,margin:'0 14px 12px',flexShrink:0}}/>

              {/* ── System Health bars ── */}
              <div style={{padding:'0 14px',flexShrink:0}}>
                <span style={{fontSize:8.5,fontWeight:700,color:'rgba(122,79,0,.4)',
                  textTransform:'uppercase',letterSpacing:'.16em',fontFamily:'Cinzel,serif',
                  display:'block',marginBottom:10}}>System Health</span>
                <div style={{display:'flex',flexDirection:'column',gap:9}}>
                  {[
                    {l:'API Uptime',    v:99.9, c:C.green,  bar:99.9},
                    {l:'Response SLA',  v:98.4, c:G,        bar:98.4},
                    {l:'Error Rate',    v:0.1,  c:C.teal,   bar:0.3 },
                  ].map(s=>(
                    <div key={s.l}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:10,color:GM}}>{s.l}</span>
                        <span style={{fontSize:10,fontWeight:700,color:s.c,fontFamily:'Cinzel,serif'}}>{s.v}%</span>
                      </div>
                      <div style={{height:5,background:'rgba(201,119,0,.09)',borderRadius:99,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${s.bar}%`,
                          background:`linear-gradient(90deg,${s.c},${s.c}88)`,borderRadius:99}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Sacred footer ── */}
              <div style={{flex:1,display:'flex',alignItems:'flex-end',padding:'12px 14px 14px'}}>
                <div style={{width:'100%',padding:'8px 12px',borderRadius:10,
                  background:`linear-gradient(135deg,rgba(201,119,0,.06),rgba(201,119,0,.03))`,
                  border:`1px solid ${LINE}`,textAlign:'center'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:3}}>
                    <div style={{opacity:.4,animation:'dbSpin 20s linear infinite'}}><Chakra size={12}/></div>
                    <span style={{fontSize:8.5,color:'rgba(122,79,0,.4)',fontFamily:'Cinzel,serif',letterSpacing:'.1em'}}>
                      ॐ नमो भगवते वासुदेवाय
                    </span>
                    <div style={{opacity:.4,animation:'dbSpinCCW 20s linear infinite'}}><Chakra size={12}/></div>
                  </div>
                  <p style={{fontSize:9,color:'rgba(122,79,0,.3)'}}>Enterprise v3.0 · All systems blessed</p>
                </div>
              </div>

            </div>

            {/* ── Weekly bar chart: col 1, row 2 ── */}
            <div className="db7"
              style={{gridColumn:'1 / 2', gridRow:'2 / 3',
                background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
                border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
                boxShadow:'0 2px 14px rgba(201,119,0,.07)',
                display:'flex',flexDirection:'column'}}>
              <div style={{padding:'14px 16px 0',flexShrink:0}}>
                <SectionHdr>Weekly Volume</SectionHdr>
                <HDivider/>
              </div>
              <div style={{flex:1,minHeight:120,padding:'0 4px 0 0'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{top:4,right:4,left:-24,bottom:0}} barSize={18} barGap={3}>
                    <defs>
                      <linearGradient id="bG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={GL}/>
                        <stop offset="100%" stopColor={G} stopOpacity=".55"/>
                      </linearGradient>
                      <linearGradient id="bG2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={C.teal} stopOpacity=".5"/>
                        <stop offset="100%" stopColor={C.teal} stopOpacity=".1"/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,119,0,.07)" vertical={false}/>
                    <XAxis dataKey={weeklyData[0]?.d!==undefined?'d':'day'}
                      tick={{fontSize:9,fill:'rgba(122,79,0,.45)'}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fontSize:8,fill:'rgba(122,79,0,.45)'}} tickLine={false} axisLine={false}/>
                    <Tooltip contentStyle={{background:CREAM,border:`1px solid ${LINEB}`,borderRadius:9,fontSize:11,color:GD}}
                      formatter={v=>[v,'Messages']}/>
                    <Bar dataKey={weeklyData[0]?.v!==undefined?'v':'chats'} fill="url(#bG)" radius={[5,5,0,0]}/>
                    <Bar dataKey={weeklyData[0]?.f!==undefined?'f':'tasks'} fill="url(#bG2)" radius={[5,5,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',
                padding:'8px 16px 12px',borderTop:`1px solid ${LINE}`,flexShrink:0}}>
                <div>
                  <div style={{fontSize:18,fontWeight:900,color:GD,fontFamily:'Cinzel,serif',lineHeight:1}}>390</div>
                  <div style={{fontSize:9.5,color:'rgba(122,79,0,.45)',marginTop:1}}>Total this week</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.green,display:'flex',alignItems:'center',gap:3,justifyContent:'flex-end'}}>
                    <TrendingUp size={11}/> 14%
                  </div>
                  <div style={{fontSize:9.5,color:'rgba(122,79,0,.45)',marginTop:1}}>vs last week</div>
                </div>
              </div>
            </div>

            {/* ── Recent Chats: col 2, row 2 ── */}
            <div className="db8"
              style={{gridColumn:'2 / 3', gridRow:'2 / 3',
                background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
                border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
                boxShadow:'0 2px 14px rgba(201,119,0,.07)'}}>
              <div style={{padding:'14px 14px 0'}}>
                <SectionHdr action={()=>navigate('/chat')} label="Open Chat">Recent Chats</SectionHdr>
                <HDivider/>
              </div>
              {cl
                ? [1,2,3,4,5].map(i=><div key={i} style={{padding:'8px 14px'}}><Skeleton h={34} r={8}/></div>)
                : chatList.map((s,i,arr)=>(
                    <button key={s.id} className="dbRow"
                      onClick={()=>navigate(`/chat?s=${s.id}`)}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:10,
                        padding:'9px 14px',background:'none',border:'none',cursor:'pointer',
                        borderBottom:i<arr.length-1?`1px solid ${LINE}`:'none',
                        textAlign:'left',transition:'background .13s'}}>
                      <div style={{width:32,height:32,borderRadius:9,flexShrink:0,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        background:GSoft,border:`1px solid ${LINE}`}}>
                        <MessageSquare size={13} color={G}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:11.5,fontWeight:600,color:GD,overflow:'hidden',
                          textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:2}}>{s.title}</p>
                        <div style={{display:'flex',alignItems:'center',gap:5}}>
                          <span style={{fontSize:9.5,color:'rgba(122,79,0,.45)'}}>{s.msgCount} msgs</span>
                          <span style={{color:LINE}}>·</span>
                          <span style={{fontSize:9.5,color:'rgba(122,79,0,.45)',overflow:'hidden',
                            textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:80}}>
                            {s.model?.split('/').pop()||s.model}
                          </span>
                          {s.ago&&<><span style={{color:LINE}}>·</span>
                            <span style={{fontSize:9.5,color:'rgba(122,79,0,.45)'}}>{s.ago}</span></>}
                        </div>
                      </div>
                      <ChevronRight size={11} color="rgba(201,119,0,.3)"/>
                    </button>
                  ))
              }
              {!cl&&chatList.length===0&&(
                <div style={{padding:'20px 14px',textAlign:'center'}}>
                  <MessageSquare size={22} color='rgba(201,119,0,.2)' style={{margin:'0 auto 8px',display:'block'}}/>
                  <p style={{fontSize:12,color:GM,marginBottom:8}}>No conversations yet</p>
                  <button onClick={()=>navigate('/chat')} style={{fontSize:11.5,fontWeight:700,color:G,background:'none',border:'none',cursor:'pointer'}}>Start first chat →</button>
                </div>
              )}
            </div>

          </div>{/* /main grid */}

          {/* ══ BOTTOM ROW: Projects + Activity ══════════════════════ */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>

            {/* ── Projects ── */}
            <div className="db8"
              style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
                border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
                boxShadow:'0 2px 14px rgba(201,119,0,.07)'}}>
              <div style={{padding:'14px 14px 0'}}>
                <SectionHdr action={()=>navigate('/projects')} label="All Projects">Sacred Projects</SectionHdr>
                <HDivider/>
              </div>
              {pl
                ? [1,2,3,4].map(i=><div key={i} style={{padding:'8px 14px'}}><Skeleton h={44} r={8}/></div>)
                : projList.map((p,i,arr)=>{
                    const Ic = PROJ_ICONS[p._iconIndex??p.iconIndex??0]||Rocket;
                    const clr = p.color||G;
                    const statusMap = {done:C.green,paused:C.amber,completed:C.green};
                    const sc = statusMap[p.status]||G;
                    return (
                      <button key={p._id||p.id} className="dbRow"
                        onClick={()=>navigate('/projects')}
                        style={{width:'100%',display:'flex',alignItems:'center',gap:10,
                          padding:'10px 14px',background:'none',border:'none',cursor:'pointer',
                          borderBottom:i<arr.length-1?`1px solid ${LINE}`:'none',
                          textAlign:'left',transition:'background .13s'}}>
                        <div style={{width:34,height:34,borderRadius:10,flexShrink:0,
                          display:'flex',alignItems:'center',justifyContent:'center',
                          background:`${clr}14`,border:`1px solid ${clr}28`}}>
                          <Ic size={15} color={clr} strokeWidth={1.8}/>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
                            <p style={{fontSize:11.5,fontWeight:600,color:GD,overflow:'hidden',
                              textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,marginRight:6}}>
                              {p.title||p.name}
                            </p>
                            <span style={{fontSize:8,fontWeight:700,padding:'2px 7px',borderRadius:99,flexShrink:0,
                              background:`${sc}15`,color:sc}}>{p.status||'active'}</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:7}}>
                            <div style={{flex:1,height:3.5,background:'rgba(201,119,0,.1)',borderRadius:99,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${p.progress||0}%`,
                                background:`linear-gradient(90deg,${clr},${clr}99)`,borderRadius:99}}/>
                            </div>
                            <span style={{fontSize:9.5,fontWeight:800,color:GM,flexShrink:0}}>{p.progress||0}%</span>
                          </div>
                        </div>
                      </button>
                    );
                  })
              }
              {!pl&&projList.length===0&&(
                <div style={{padding:'20px 14px',textAlign:'center'}}>
                  <FolderOpen size={22} color='rgba(201,119,0,.2)' style={{margin:'0 auto 8px',display:'block'}}/>
                  <p style={{fontSize:12,color:GM,marginBottom:8}}>No projects yet</p>
                  <button onClick={()=>navigate('/projects')} style={{fontSize:11.5,fontWeight:700,color:G,background:'none',border:'none',cursor:'pointer'}}>Create project →</button>
                </div>
              )}
            </div>

            {/* ── Recent Activity ── */}
            <div className="db9"
              style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
                border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
                boxShadow:'0 2px 14px rgba(201,119,0,.07)'}}>
              <div style={{padding:'14px 16px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <SectionHdr>Recent Activity</SectionHdr>
                <div style={{display:'flex',alignItems:'center',gap:6,fontSize:10,color:C.green,fontWeight:700,
                  background:C.greenBg,padding:'4px 10px',borderRadius:99,border:`1px solid ${C.greenB}`,marginTop:-12}}>
                  <PulseDot color={C.green} size={6}/> Live
                </div>
              </div>
              <HDivider/>
              <div style={{display:'flex',flexDirection:'column'}}>
                {(stats?.recentActivity||[
                  {id:1,type:'chat',   text:'New AI chat session started',               time:'Just now'},
                  {id:2,type:'task',   text:'Task "Analytics dashboard" moved to Review', time:'12m ago'},
                  {id:3,type:'project',text:'Project "API Gateway" updated',              time:'1h ago' },
                  {id:4,type:'system', text:'Workspace settings updated by Admin',        time:'3h ago' },
                  {id:5,type:'system', text:'System health check passed — all green',     time:'5h ago' },
                  {id:6,type:'chat',   text:'Weekly analytics report auto-generated',     time:'Yesterday'},
                ]).slice(0,6).map((ev,i,arr)=>{
                  const {Icon,c} = ACTIVITY_ICONS[ev.type]||ACTIVITY_ICONS.system;
                  return (
                    <div key={ev.id||i} className="dbRow"
                      style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',
                        borderBottom:i<arr.length-1?`1px solid ${LINE}`:'none',
                        transition:'background .13s',cursor:'default'}}>
                      <div style={{width:30,height:30,borderRadius:9,flexShrink:0,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        background:`${c}12`,border:`1px solid ${c}22`}}>
                        <Icon size={13} color={c} strokeWidth={1.8}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:11.5,color:GD,lineHeight:1.4,fontWeight:500,
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.text}</p>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                        <Clock size={9} color='rgba(122,79,0,.4)'/>
                        <span style={{fontSize:9.5,color:'rgba(122,79,0,.4)',whiteSpace:'nowrap'}}>{ev.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>{/* /bottom row */}

        </div>{/* /inner */}
      </div>{/* /root */}
    </>
  );
}
