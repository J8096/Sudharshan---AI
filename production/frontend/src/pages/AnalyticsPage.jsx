

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  MessageSquare, Zap, Clock, TrendingUp, ArrowUpRight,
  Activity, Users, Shield, CheckCircle, AlertCircle,
  MessageCircle, FolderOpen, Lock, Database,
  Cpu, Brain, Gauge, Star, Sparkles,
  BarChart2, PieChart as PieIcon, AreaChart as AreaIcon,
} from 'lucide-react';
import { analyticsApi, chatApi } from '../services/api';

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS — exact match with entire app
══════════════════════════════════════════════════════════════ */
const G      = '#C97700';
const GL     = '#E8920A';
const GD     = '#3D1F00';
const GM     = '#7A4F00';
const GSoft  = 'rgba(201,119,0,.08)';
const GBorder= 'rgba(201,119,0,.2)';
const CREAM  = '#FFFDF5';
const CREAM2 = '#FFF8E5';
const CREAM3 = '#FEF3D0';
const LINE   = 'rgba(201,119,0,.13)';
const LINEB  = 'rgba(201,119,0,.22)';
const C = {
  green:'#059669',  greenBg:'rgba(5,150,105,.09)',   greenB:'rgba(5,150,105,.22)',
  red:'#DC2626',    redBg:'rgba(220,38,38,.09)',
  blue:'#0EA5E9',   blueBg:'rgba(14,165,233,.09)',    blueB:'rgba(14,165,233,.22)',
  purple:'#7C3AED', purpleBg:'rgba(124,58,237,.09)', purpleB:'rgba(124,58,237,.22)',
  teal:'#0891B2',   tealBg:'rgba(8,145,178,.09)',
  amber:'#D97706',
};

const MODEL_COLORS = {
  'llama-3.3-70b-versatile': G,
  'llama-3.1-8b-instant':    GL,
  'openai/gpt-oss-120b':     C.purple,
  'openai/gpt-oss-20b':      C.green,
  'mixtral-8x7b-32768':      C.blue,
  'gemma2-9b-it':            C.teal,
};

const TIER_COLORS = {
  Best:     { bg: GSoft,       c: G,        b: GBorder  },
  Fastest:  { bg: C.greenBg,   c: C.green,  b: C.greenB },
  Powerful: { bg: C.purpleBg,  c: C.purple, b: C.purpleB},
  Fast:     { bg: C.blueBg,    c: C.blue,   b: C.blueB  },
  Power:    { bg: C.purpleBg,  c: C.purple, b: C.purpleB},
};

const ACTIVITY_META = {
  chat:    { Icon: MessageCircle, c: G        },
  task:    { Icon: CheckCircle,   c: C.green  },
  project: { Icon: FolderOpen,    c: C.purple },
  system:  { Icon: Shield,        c: C.teal   },
  team:    { Icon: Users,         c: C.blue   },
};

/* ── Fallback data ── */
function mkActivity30() {
  return Array.from({length:30},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(29-i));
    return {
      date: d.toLocaleDateString('en-US',{month:'short',day:'numeric'}),
      messages: Math.floor(20+Math.sin(i*.7)*30+Math.random()*15),
      users:    Math.floor(3 +Math.cos(i*.5)*4 +Math.random()*3),
    };
  });
}
const WEEKLY_MOCK = [
  {day:'Mon',chats:42,tasks:18},{day:'Tue',chats:78,tasks:24},
  {day:'Wed',chats:55,tasks:20},{day:'Thu',chats:91,tasks:35},
  {day:'Fri',chats:67,tasks:28},{day:'Sat',chats:34,tasks:12},
  {day:'Sun',chats:23,tasks:8},
];
const MODEL_USAGE_MOCK = [
  {name:'Llama 3.3·70B', value:48, color:G      },
  {name:'Llama 3.1·8B',  value:24, color:GL     },
  {name:'GPT OSS·120B',  value:18, color:C.purple},
  {name:'GPT OSS·20B',   value:10, color:C.green },
];
const ACTIVITY_MOCK = [
  {id:1,type:'chat',   text:'New conversation started',                    time:'2m ago' },
  {id:2,type:'task',   text:'Task "Analytics dashboard" moved to Review',  time:'15m ago'},
  {id:3,type:'project',text:'Project "API Gateway" updated',               time:'1h ago' },
  {id:4,type:'system', text:'System backup completed',                     time:'3h ago' },
  {id:5,type:'chat',   text:'1522 messages this month',                    time:'4h ago' },
  {id:6,type:'team',   text:'You joined Sudharshan AI Enterprise',         time:'2d ago' },
];

/* ══════════════════════════════════════════════════════════════
   CHAKRA SVG
══════════════════════════════════════════════════════════════ */
function Chakra({ size=80, opacity=1, spin=false }) {
  const sp = Array.from({length:16},(_,i)=>{
    const a=(i*22.5*Math.PI)/180;
    return{x1:50+20*Math.cos(a),y1:50+20*Math.sin(a),x2:50+44*Math.cos(a),y2:50+44*Math.sin(a)};
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{opacity,display:'block',flexShrink:0,
        animation:spin?'anSpin 90s linear infinite':undefined}}>
      <circle cx="50" cy="50" r="47" fill="none" stroke={G} strokeWidth=".8"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke={GL} strokeWidth=".3" strokeDasharray="2 4"/>
      {sp.map((p,i)=><line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={G} strokeWidth="1.1" strokeLinecap="round"/>)}
      <circle cx="50" cy="50" r="16" fill="none" stroke={G} strokeWidth=".7"/>
      <circle cx="50" cy="50" r="4" fill={G}/>
      <circle cx="50" cy="50" r="1.8" fill="#FFB830"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRIMITIVES
══════════════════════════════════════════════════════════════ */
function SectionHdr({ children, sub, action, label='View all', accent=G, Icon }) {
  return (
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
      padding:'14px 16px 0',flexShrink:0}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:3,height:14,background:`linear-gradient(to bottom,${accent},${accent}55)`,borderRadius:2,flexShrink:0}}/>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            {Icon && <Icon size={13} color={accent} strokeWidth={2}/>}
            <span style={{fontSize:10,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',
              letterSpacing:'.09em',textTransform:'uppercase'}}>{children}</span>
          </div>
          {sub && <p style={{fontSize:9.5,color:'rgba(122,79,0,.45)',marginTop:2}}>{sub}</p>}
        </div>
      </div>
      {action && (
        <button onClick={action} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,
          fontWeight:600,color:accent,background:GSoft,border:`1px solid ${LINE}`,
          padding:'3px 10px',borderRadius:99,cursor:'pointer',fontFamily:'Outfit,sans-serif',flexShrink:0}}>
          {label} <ArrowUpRight size={9}/>
        </button>
      )}
    </div>
  );
}

function HDivider() {
  return <div style={{height:1,background:`linear-gradient(90deg,transparent,${LINE},transparent)`,
    margin:'10px 16px 0'}}/>;
}

function Skeleton({ h=20, r=8, mb=0 }) {
  return <div style={{height:h,borderRadius:r,marginBottom:mb,
    background:'linear-gradient(90deg,rgba(201,119,0,.05) 25%,rgba(201,119,0,.1) 50%,rgba(201,119,0,.05) 75%)',
    backgroundSize:'200% 100%',animation:'anShimmer 1.6s ease infinite'}}/>;
}

function PulseDot({ color=C.green, size=7 }) {
  return (
    <span style={{position:'relative',display:'inline-flex',width:size,height:size,flexShrink:0}}>
      <span style={{position:'absolute',inset:0,borderRadius:'50%',background:color,zIndex:1}}/>
      <span style={{position:'absolute',inset:-3,borderRadius:'50%',border:`1.5px solid ${color}`,
        animation:'anPulse 1.6s ease infinite'}}/>
    </span>
  );
}

/* ── Recharts tooltip ── */
function ChartTip({ active, payload, label }) {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:CREAM,border:`1px solid ${LINEB}`,borderRadius:10,padding:'8px 13px',
      fontSize:11,color:GD,fontFamily:'Outfit,sans-serif',boxShadow:'0 6px 24px rgba(201,119,0,.18)'}}>
      {label&&<div style={{color:'rgba(122,79,0,.45)',marginBottom:4,fontSize:9.5,fontFamily:'Cinzel,serif'}}>{label}</div>}
      {payload.map((p,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:i<payload.length-1?3:0}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:p.color||G,flexShrink:0}}/>
          <span style={{color:GM}}>{p.name}:</span>
          <span style={{fontWeight:700,color:GD,fontFamily:'Cinzel,serif'}}>{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   KPI CARD
══════════════════════════════════════════════════════════════ */
function KpiCard({ label, value, Icon, sub, trend, accent=G, delay=0 }) {
  return (
    <div style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
      border:`1px solid ${LINE}`,borderRadius:18,padding:'16px 16px 14px',
      position:'relative',overflow:'hidden',
      boxShadow:'0 2px 14px rgba(201,119,0,.07)',
      animation:`anUp .5s cubic-bezier(.22,1,.36,1) ${delay}s both`,
      transition:'all .22s ease',cursor:'default'}}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 32px rgba(201,119,0,.14)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 14px rgba(201,119,0,.07)';}}>
      {/* glow */}
      <div style={{position:'absolute',top:-24,right:-24,width:80,height:80,borderRadius:'50%',
        background:`radial-gradient(circle,${accent}22 0%,transparent 70%)`,pointerEvents:'none'}}/>
      {/* watermark */}
      <div style={{position:'absolute',right:-14,bottom:-14,opacity:.04,pointerEvents:'none',
        animation:'anSpin 80s linear infinite'}}><Chakra size={80}/></div>

      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
        <div style={{width:38,height:38,borderRadius:11,display:'flex',alignItems:'center',
          justifyContent:'center',background:`${accent}14`,border:`1px solid ${accent}25`,flexShrink:0}}>
          <Icon size={16} color={accent}/>
        </div>
        {trend && (
          <span style={{display:'flex',alignItems:'center',gap:3,fontSize:9.5,fontWeight:700,
            padding:'3px 8px',borderRadius:99,
            background:trend.startsWith('+')||trend==='↑ stable'?C.greenBg:C.redBg,
            color:trend.startsWith('+')||trend==='↑ stable'?C.green:C.red}}>
            <TrendingUp size={9}/>{trend}
          </span>
        )}
      </div>

      <div style={{fontSize:26,fontWeight:900,color:GD,fontFamily:'Cinzel,serif',lineHeight:1,marginBottom:3}}>
        {value}
      </div>
      <div style={{fontSize:12,fontWeight:600,color:GM,marginBottom:sub?2:0}}>{label}</div>
      {sub && <div style={{fontSize:10,color:'rgba(122,79,0,.45)',fontStyle:'italic'}}>{sub}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FULL-PAGE SKELETON
══════════════════════════════════════════════════════════════ */
function PageSkeleton() {
  return (
    <div style={{padding:'24px 28px'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
        {Array(4).fill(0).map((_,i)=>(
          <div key={i} style={{height:120,borderRadius:18,
            background:'rgba(201,119,0,.06)',border:`1px solid ${LINE}`,
            animation:'anShimmer 1.6s ease infinite'}}/>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
        {Array(3).fill(0).map((_,i)=>(
          <div key={i} style={{height:280,borderRadius:18,
            background:'rgba(201,119,0,.06)',border:`1px solid ${LINE}`,
            animation:'anShimmer 1.6s ease infinite'}}/>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {Array(2).fill(0).map((_,i)=>(
          <div key={i} style={{height:220,borderRadius:18,
            background:'rgba(201,119,0,.06)',border:`1px solid ${LINE}`,
            animation:'anShimmer 1.6s ease infinite'}}/>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('30d');

  /* ── Queries ── */
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn:  () => analyticsApi.stats().then(r=>r.data),
    staleTime: 60_000,
  });
  const { data: liveModels = [] } = useQuery({
    queryKey: ['models'],
    queryFn:  () => chatApi.models().then(r=>r.data),
    staleTime: 300_000,
  });

  if (isLoading) return (
    <>
      <style>{`@keyframes anShimmer{from{background-position:-200% 0}to{background-position:200% 0}}`}</style>
      <PageSkeleton/>
    </>
  );
  if (!stats) return null;

  /* ── Derived data ── */
  const activityRaw = stats.activityData || mkActivity30();
  const activityData = activeTab==='7d'
    ? activityRaw.slice(-7)
    : activeTab==='14d'
    ? activityRaw.slice(-14)
    : activityRaw;

  const weeklyData = stats.weeklyData || WEEKLY_MOCK;

  const modelUsage = (stats.modelUsage||MODEL_USAGE_MOCK).map((m,i)=>({
    ...m,
    name:  liveModels[i]?.name  || m.name,
    id:    liveModels[i]?.id    || m.id,
    color: MODEL_COLORS[liveModels[i]?.id||m.id] || m.color || G,
  }));

  const recentActivity = stats.recentActivity || ACTIVITY_MOCK;

  /* ── Chart stats (NaN-safe) ── */
  const msgVals = activityData.map(d=>Number(d.messages)||0).filter(v=>v>0);
  const avgMsg  = msgVals.length ? Math.round(msgVals.reduce((a,v)=>a+v,0)/msgVals.length) : 0;
  const peakMsg = msgVals.length ? Math.max(...msgVals) : 0;

  /* ── KPIs ── */
  const kpis = [
    { label:'Total Chats',    value:(stats.kpis?.totalChats||0).toLocaleString(),
      Icon:MessageSquare, accent:G,        trend:'+12%', delay:.04,
      sub:`${((stats.kpis?.totalTokens||0)/1000).toFixed(0)}K tokens processed` },
    { label:'Total Messages', value:(stats.kpis?.totalMessages||0).toLocaleString(),
      Icon:Activity,      accent:C.blue,   trend:'+8%',  delay:.08 },
    { label:'Avg Response',   value:stats.kpis?.avgResponseTime||'1.2s',
      Icon:Clock,         accent:C.teal,   trend:null,   delay:.12 },
    { label:'Satisfaction',   value:`${stats.kpis?.satisfaction||98.4}%`,
      Icon:Star,          accent:C.green,  trend:'↑ stable', delay:.16 },
  ];

  /* ── axis style ── */
  const AX = { fontSize:9, fill:'rgba(122,79,0,.45)' };
  const GR = { strokeDasharray:'3 3', stroke:'rgba(201,119,0,.07)', vertical:false };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @keyframes anSpin    { to { transform:rotate(360deg);  } }
        @keyframes anSpinCCW { to { transform:rotate(-360deg); } }
        @keyframes anPulse   { 0%,100%{transform:scale(1);opacity:.9} 50%{transform:scale(1.8);opacity:0} }
        @keyframes anShimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        @keyframes anUp      { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes anFade    { from{opacity:0} to{opacity:1} }
        .anRow:hover{background:rgba(201,119,0,.05)!important}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(201,119,0,.22);border-radius:4px}
        ::-webkit-scrollbar-track{background:transparent}
        button,input,select{font-family:'Outfit',sans-serif;}
        button:hover:not(:disabled){filter:brightness(1.04)}
      `}</style>

      {/* ambient bg */}
      <div style={{position:'fixed',top:'50%',right:-180,transform:'translateY(-50%)',
        opacity:.03,pointerEvents:'none',zIndex:0,animation:'anSpin 120s linear infinite'}}>
        <Chakra size={620}/>
      </div>
      <div style={{position:'fixed',bottom:-160,left:-160,
        opacity:.018,pointerEvents:'none',zIndex:0,animation:'anSpinCCW 160s linear infinite'}}>
        <Chakra size={400}/>
      </div>

      <div style={{width:'100%',height:'100%',overflowY:'auto',
        background:`linear-gradient(155deg,${CREAM} 0%,${CREAM2} 55%,${CREAM3} 100%)`,
        fontFamily:'Outfit,sans-serif',position:'relative'}}>

        <div style={{position:'relative',zIndex:1,padding:'22px 26px 32px',
          maxWidth:1400,width:'100%',margin:'0 auto'}}>

          {/* ══ PAGE HEADER ══════════════════════════════════════════ */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
            marginBottom:18,animation:'anUp .4s cubic-bezier(.22,1,.36,1) both'}}>
            <div>
              <div style={{fontSize:9,color:'rgba(201,119,0,.45)',fontFamily:'Cinzel,serif',
                letterSpacing:'.22em',textTransform:'uppercase',marginBottom:5}}>
                दिव्य विश्लेषण · ॐ
              </div>
              <h1 style={{fontSize:24,fontWeight:900,color:GD,fontFamily:'Cinzel,serif',
                letterSpacing:'.02em',lineHeight:1.1,marginBottom:4}}>
                Sacred Analytics
              </h1>
              <p style={{fontSize:12.5,color:GM}}>
                Track AI usage, team performance &amp; workspace insights across all dimensions.
              </p>
            </div>

            {/* right: model count + status */}
            <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
              {liveModels.length>0 && (
                <div style={{padding:'8px 16px',
                  background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
                  border:`1px solid ${LINE}`,borderRadius:12,textAlign:'center',
                  boxShadow:'0 2px 12px rgba(201,119,0,.07)'}}>
                  <div style={{fontSize:18,fontWeight:900,color:G,fontFamily:'Cinzel,serif',lineHeight:1}}>
                    {liveModels.length}
                  </div>
                  <div style={{fontSize:9.5,color:GM,marginTop:2}}>Active Models</div>
                </div>
              )}
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',
                background:C.greenBg,border:`1px solid ${C.greenB}`,borderRadius:12}}>
                <PulseDot color={C.green} size={6}/>
                <span style={{fontSize:11,fontWeight:700,color:C.green}}>All Systems Live</span>
              </div>
              <button onClick={()=>navigate('/dashboard')}
                style={{display:'flex',alignItems:'center',gap:5,padding:'8px 14px',
                  background:GSoft,border:`1px solid ${LINE}`,borderRadius:12,cursor:'pointer',
                  fontSize:11,fontWeight:600,color:GM}}>
                <ArrowUpRight size={11} color={G}/> Dashboard
              </button>
            </div>
          </div>

          {/* gold divider */}
          <div style={{height:1,background:`linear-gradient(90deg,transparent,${LINEB},transparent)`,marginBottom:16}}/>

          {/* ══ KPI ROW ══════════════════════════════════════════════ */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:14}}>
            {kpis.map((k,i)=><KpiCard key={i} {...k}/>)}
          </div>

          {/* ══ ROW 2: Area + Bar + Activity (3-col) ═════════════════ */}
          <div style={{display:'grid',gridTemplateColumns:'1.1fr 1fr 0.9fr',gap:12,marginBottom:12}}>

            {/* ── 30-day area chart ── */}
            <div style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
              border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
              boxShadow:'0 2px 14px rgba(201,119,0,.07)',
              display:'flex',flexDirection:'column',
              animation:'anUp .5s .18s both'}}>
              <SectionHdr Icon={AreaIcon} sub="Messages & active users per day">
                Message Activity
              </SectionHdr>
              <HDivider/>

              {/* tab switcher */}
              <div style={{display:'flex',gap:4,padding:'8px 16px 4px',flexShrink:0}}>
                {['7d','14d','30d'].map(t=>(
                  <button key={t} onClick={()=>setActiveTab(t)} style={{
                    padding:'3px 10px',fontSize:9.5,fontWeight:600,borderRadius:7,cursor:'pointer',
                    background:activeTab===t?`linear-gradient(135deg,${G},${GL})`:GSoft,
                    color:activeTab===t?'#fff':GM,border:`1px solid ${activeTab===t?G:LINE}`,
                    boxShadow:activeTab===t?`0 2px 8px rgba(201,119,0,.28)`:'none',
                    transition:'all .15s'}}>
                    {t}
                  </button>
                ))}
              </div>

              {/* chart — fixed height, no empty space */}
              <div style={{height:180,flexShrink:0,padding:'0 4px 0 0'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{top:4,right:8,left:-20,bottom:0}}>
                    <defs>
                      <linearGradient id="anG1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={G}      stopOpacity=".28"/>
                        <stop offset="100%" stopColor={G}      stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="anG2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={C.teal} stopOpacity=".2"/>
                        <stop offset="100%" stopColor={C.teal} stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="anL1" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%"  stopColor={G}/><stop offset="100%" stopColor={GL}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...GR}/>
                    <XAxis dataKey="date" tick={AX} tickLine={false} axisLine={false}
                      interval={activeTab==='7d'?0:activeTab==='14d'?1:4}/>
                    <YAxis tick={AX} tickLine={false} axisLine={false}/>
                    <Tooltip content={<ChartTip/>} cursor={false}/>
                    <Area type="monotone" dataKey="messages" name="Messages"
                      stroke="url(#anL1)" strokeWidth={2.5} fill="url(#anG1)"
                      dot={false} activeDot={{r:4,fill:G,strokeWidth:2,stroke:CREAM}}/>
                    <Area type="monotone" dataKey="users" name="Active Users"
                      stroke={C.teal} strokeWidth={1.8} fill="url(#anG2)"
                      dot={false} strokeDasharray="5 3"
                      activeDot={{r:3,fill:C.teal,strokeWidth:2,stroke:CREAM}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* footer stats */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'8px 16px 12px',borderTop:`1px solid ${LINE}`,flexShrink:0,
                background:`linear-gradient(90deg,rgba(201,119,0,.02),transparent)`}}>
                <div style={{display:'flex',gap:14}}>
                  {[{l:'Messages',c:G},{l:'Users',c:C.teal,dash:true}].map(x=>(
                    <div key={x.l} style={{display:'flex',alignItems:'center',gap:5}}>
                      <div style={{width:16,height:2.5,borderRadius:99,
                        ...(x.dash?{background:'none',borderTop:`2px dashed ${x.c}`}:{background:x.c})}}/>
                      <span style={{fontSize:10,color:GM}}>{x.l}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:12}}>
                  {[{l:'Avg/Day',v:avgMsg,c:G},{l:'Peak',v:peakMsg,c:C.purple}].map(s=>(
                    <div key={s.l} style={{textAlign:'right'}}>
                      <div style={{fontSize:13,fontWeight:800,color:s.c,fontFamily:'Cinzel,serif'}}>{s.v}</div>
                      <div style={{fontSize:8.5,color:'rgba(122,79,0,.45)'}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Weekly bar chart ── */}
            <div style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
              border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
              boxShadow:'0 2px 14px rgba(201,119,0,.07)',
              display:'flex',flexDirection:'column',
              animation:'anUp .5s .22s both'}}>
              <SectionHdr Icon={BarChart2} sub="Activity breakdown by day of week">
                Weekly Volume
              </SectionHdr>
              <HDivider/>

              <div style={{flex:1,minHeight:180,padding:'8px 4px 0 0'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{top:4,right:4,left:-24,bottom:0}}
                    barSize={16} barGap={3}>
                    <defs>
                      <linearGradient id="anBG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={GL}/>
                        <stop offset="100%" stopColor={G} stopOpacity=".55"/>
                      </linearGradient>
                      <linearGradient id="anBG2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={C.teal} stopOpacity=".5"/>
                        <stop offset="100%" stopColor={C.teal} stopOpacity=".1"/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...GR}/>
                    <XAxis dataKey="day" tick={AX} tickLine={false} axisLine={false}/>
                    <YAxis tick={{...AX,fontSize:8}} tickLine={false} axisLine={false}/>
                    <Tooltip content={<ChartTip/>} cursor={false}/>
                    <Bar dataKey="chats" name="Chats" fill="url(#anBG)" radius={[5,5,0,0]}/>
                    <Bar dataKey="tasks" name="Tasks" fill="url(#anBG2)" radius={[5,5,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* weekly totals footer */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                padding:'8px 16px 12px',borderTop:`1px solid ${LINE}`,flexShrink:0}}>
                <div>
                  <div style={{fontSize:18,fontWeight:900,color:GD,fontFamily:'Cinzel,serif',lineHeight:1}}>
                    {weeklyData.reduce((a,d)=>a+(d.chats||0),0)}
                  </div>
                  <div style={{fontSize:9,color:'rgba(122,79,0,.45)',marginTop:1}}>Total chats</div>
                </div>
                <div style={{display:'flex',gap:10}}>
                  {[{l:'Chats',c:G},{l:'Tasks',c:C.teal}].map(x=>(
                    <div key={x.l} style={{display:'flex',alignItems:'center',gap:4}}>
                      <div style={{width:8,height:8,borderRadius:2,background:x.c}}/>
                      <span style={{fontSize:9.5,color:GM}}>{x.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Recent Activity ── */}
            <div style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
              border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
              boxShadow:'0 2px 14px rgba(201,119,0,.07)',
              display:'flex',flexDirection:'column',
              animation:'anUp .5s .26s both'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'14px 16px 0',flexShrink:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:3,height:14,background:`linear-gradient(to bottom,${G},${GL})`,borderRadius:2}}/>
                  <span style={{fontSize:10,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',
                    letterSpacing:'.09em',textTransform:'uppercase'}}>Recent Activity</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:5,padding:'3px 9px',
                  background:C.greenBg,border:`1px solid ${C.greenB}`,borderRadius:99}}>
                  <PulseDot color={C.green} size={5}/>
                  <span style={{fontSize:9,fontWeight:700,color:C.green}}>Live</span>
                </div>
              </div>
              <HDivider/>

              <div style={{flex:1,overflowY:'auto'}}>
                {recentActivity.slice(0,8).map((ev,i,arr)=>{
                  const {Icon,c} = ACTIVITY_META[ev.type]||ACTIVITY_META.system;
                  return (
                    <div key={ev.id||i} className="anRow"
                      style={{display:'flex',alignItems:'center',gap:10,padding:'9px 14px',
                        borderBottom:i<arr.length-1?`1px solid ${LINE}`:'none',
                        transition:'background .13s',cursor:'default'}}>
                      <div style={{width:28,height:28,borderRadius:8,flexShrink:0,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        background:`${c}12`,border:`1px solid ${c}22`}}>
                        <Icon size={12} color={c} strokeWidth={1.8}/>
                      </div>
                      <p style={{flex:1,fontSize:11,color:GD,lineHeight:1.4,fontWeight:500,
                        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',minWidth:0}}>
                        {ev.text}
                      </p>
                      <span style={{fontSize:9,color:'rgba(122,79,0,.4)',
                        background:GSoft,padding:'2px 7px',borderRadius:99,
                        flexShrink:0,whiteSpace:'nowrap'}}>{ev.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ══ ROW 3: Model Usage Pie + Live Models grid ═════════════ */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1.6fr',gap:12,marginBottom:12}}>

            {/* ── Model usage donut ── */}
            <div style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
              border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
              boxShadow:'0 2px 14px rgba(201,119,0,.07)',
              animation:'anUp .5s .3s both'}}>
              <SectionHdr Icon={PieIcon} sub={`${modelUsage.length} models · Groq Free Tier`}>
                Model Usage
              </SectionHdr>
              <HDivider/>

              <div style={{display:'flex',alignItems:'center',gap:16,padding:'12px 16px 14px'}}>
                {/* donut */}
                <div style={{flexShrink:0,width:160}}>
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={modelUsage} cx="50%" cy="50%"
                        innerRadius={46} outerRadius={72}
                        dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                        {modelUsage.map((m,i)=>(
                          <Cell key={i} fill={m.color}
                            stroke={CREAM} strokeWidth={2}/>
                        ))}
                      </Pie>
                      <Tooltip cursor={false}
                        content={({active,payload})=>{
                          if(!active||!payload?.length) return null;
                          const m=payload[0].payload;
                          return (
                            <div style={{background:CREAM,border:`1px solid ${LINEB}`,borderRadius:10,
                              padding:'7px 11px',fontSize:11,boxShadow:'0 4px 14px rgba(201,119,0,.18)'}}>
                              <div style={{fontWeight:700,color:GD,marginBottom:2}}>{m.name}</div>
                              <div style={{color:GM}}>Share: <strong style={{color:G,fontFamily:'Cinzel,serif'}}>{m.value}%</strong></div>
                            </div>
                          );
                        }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* legend with animated bars */}
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:11}}>
                  {modelUsage.map((m,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,
                        background:m.color,boxShadow:`0 0 5px ${m.color}60`}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,color:GM,overflow:'hidden',
                          textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:3}}>
                          {m.name}
                        </div>
                        <div style={{height:4,background:'rgba(201,119,0,.1)',borderRadius:99,overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${m.value}%`,background:m.color,
                            borderRadius:99,animation:`anFade 1s ${.5+i*.1}s both`,
                            transition:'width 1s ease'}}/>
                        </div>
                      </div>
                      <span style={{fontSize:11,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',
                        minWidth:32,textAlign:'right'}}>{m.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Live model cards grid ── */}
            <div style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
              border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
              boxShadow:'0 2px 14px rgba(201,119,0,.07)',
              animation:'anUp .5s .34s both'}}>
              <SectionHdr Icon={Zap} sub="Available on Groq · powered by Sudharshan AI">
                Active AI Models
              </SectionHdr>
              <HDivider/>

              <div style={{padding:'12px 14px 14px'}}>
                <div style={{display:'grid',
                  gridTemplateColumns:`repeat(${Math.min(liveModels.length||4,4)},1fr)`,
                  gap:10}}>
                  {(liveModels.length>0?liveModels:
                    [{id:'llama-3.3-70b-versatile',name:'Llama 3.3·70B',tag:'Best',    ctx:'128k'},
                     {id:'llama-3.1-8b-instant',   name:'Llama 3.1·8B', tag:'Fastest', ctx:'128k'},
                     {id:'openai/gpt-oss-120b',     name:'GPT OSS·120B', tag:'Power',   ctx:'128k'},
                     {id:'openai/gpt-oss-20b',      name:'GPT OSS·20B',  tag:'Fastest', ctx:'128k'},
                    ]).map((m,i)=>{
                      const usage  = modelUsage.find(u=>u.name===m.name)||modelUsage[i]||{value:0,color:G};
                      const tc     = TIER_COLORS[m.tag]||TIER_COLORS.Best;
                      const mColor = MODEL_COLORS[m.id]||usage.color||G;
                      return (
                        <div key={m.id||i}
                          style={{padding:'12px',background:`${mColor}08`,
                            border:`1px solid ${mColor}22`,borderRadius:14,
                            transition:'all .2s',cursor:'default'}}
                          onMouseEnter={e=>{e.currentTarget.style.background=`${mColor}14`;e.currentTarget.style.borderColor=`${mColor}40`;}}
                          onMouseLeave={e=>{e.currentTarget.style.background=`${mColor}08`;e.currentTarget.style.borderColor=`${mColor}22`;}}>

                          {/* tag + ctx */}
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                            {m.tag?(
                              <span style={{fontSize:8.5,fontWeight:700,padding:'2px 7px',borderRadius:6,
                                background:tc.bg,color:tc.c,border:`1px solid ${tc.b}`}}>{m.tag}</span>
                            ):<div/>}
                            <span style={{fontSize:8.5,color:'rgba(122,79,0,.4)'}}>{m.ctx||'128k'}</span>
                          </div>

                          {/* name */}
                          <p style={{fontSize:12,fontWeight:800,color:GD,fontFamily:'Cinzel,serif',
                            lineHeight:1.2,marginBottom:3}}>{m.name}</p>
                          <p style={{fontSize:9,color:'rgba(122,79,0,.4)',marginBottom:10,
                            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                            {m.id}
                          </p>

                          {/* usage bar */}
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                            <span style={{fontSize:8.5,color:'rgba(122,79,0,.4)'}}>Usage</span>
                            <span style={{fontSize:9,fontWeight:700,color:mColor,
                              fontFamily:'Cinzel,serif'}}>{usage.value}%</span>
                          </div>
                          <div style={{height:4,background:'rgba(201,119,0,.1)',borderRadius:99,overflow:'hidden'}}>
                            <div style={{height:'100%',width:`${usage.value}%`,
                              background:mColor,borderRadius:99,
                              transition:'width 1s ease'}}/>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* ══ ROW 4: System Health + Token Usage ═══════════════════ */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>

            {/* ── System Health ── */}
            <div style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
              border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
              boxShadow:'0 2px 14px rgba(201,119,0,.07)',
              animation:'anUp .5s .38s both'}}>
              <SectionHdr Icon={Shield} sub="Platform SLA & reliability metrics">
                System Health
              </SectionHdr>
              <HDivider/>

              <div style={{padding:'12px 16px 14px'}}>
                {/* big uptime display */}
                <div style={{display:'flex',alignItems:'center',gap:14,
                  padding:'12px 14px',borderRadius:13,
                  background:`linear-gradient(135deg,${C.greenBg},rgba(5,150,105,.04))`,
                  border:`1px solid ${C.greenB}`,marginBottom:14}}>
                  <div style={{width:44,height:44,borderRadius:13,
                    background:`linear-gradient(135deg,${C.green},rgba(5,150,105,.8))`,
                    display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                    boxShadow:`0 4px 14px ${C.greenBg}`}}>
                    <Shield size={20} color="white"/>
                  </div>
                  <div>
                    <div style={{fontSize:22,fontWeight:900,color:C.green,fontFamily:'Cinzel,serif',lineHeight:1}}>
                      {stats.kpis?.uptime??99.9}%
                    </div>
                    <div style={{fontSize:11,color:GM,marginTop:2}}>System Uptime · Last 30 days</div>
                  </div>
                  <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6}}>
                    <PulseDot color={C.green} size={7}/>
                    <span style={{fontSize:10,fontWeight:700,color:C.green}}>Operational</span>
                  </div>
                </div>

                {/* health metric bars */}
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {[
                    {l:'API Uptime',         v:99.9, bar:99.9, c:C.green },
                    {l:'Response SLA',       v:98.4, bar:98.4, c:G       },
                    {l:'Error Rate',         v:0.1,  bar:0.3,  c:C.teal  },
                    {l:'Avg Response Time',  v:'1.2s',bar:85,   c:C.blue  },
                  ].map(s=>(
                    <div key={s.l}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                        <span style={{fontSize:11,color:GM,fontWeight:500}}>{s.l}</span>
                        <span style={{fontSize:11,fontWeight:700,color:s.c,fontFamily:'Cinzel,serif'}}>{s.v}{typeof s.v==='number'?'%':''}</span>
                      </div>
                      <div style={{height:5,background:'rgba(201,119,0,.09)',borderRadius:99,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${s.bar}%`,
                          background:`linear-gradient(90deg,${s.c},${s.c}88)`,borderRadius:99}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Token Usage ── */}
            <div style={{background:`linear-gradient(145deg,${CREAM},${CREAM2})`,
              border:`1px solid ${LINE}`,borderRadius:18,overflow:'hidden',
              boxShadow:'0 2px 14px rgba(201,119,0,.07)',
              display:'flex',flexDirection:'column',
              animation:'anUp .5s .42s both'}}>
              <SectionHdr Icon={Database} sub="Groq free tier · monthly consumption">
                Token Usage
              </SectionHdr>
              <HDivider/>

              <div style={{padding:'12px 16px 14px',flex:1,display:'flex',flexDirection:'column',gap:14}}>

                {/* big token count */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'12px 14px',borderRadius:13,
                  background:`linear-gradient(135deg,${GSoft},rgba(201,119,0,.04))`,
                  border:`1px solid ${LINE}`}}>
                  <div>
                    <div style={{fontSize:22,fontWeight:900,color:G,fontFamily:'Cinzel,serif',lineHeight:1}}>
                      {((stats.kpis?.totalTokens||940000)/1000).toFixed(0)}K
                    </div>
                    <div style={{fontSize:11,color:GM,marginTop:2}}>Tokens consumed</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:13,fontWeight:700,color:'rgba(122,79,0,.4)',fontFamily:'Cinzel,serif'}}>
                      ∞
                    </div>
                    <div style={{fontSize:9.5,color:'rgba(122,79,0,.4)'}}>Limit (free tier)</div>
                  </div>
                </div>

                {/* token progress bar */}
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:11,color:GM}}>Monthly consumption</span>
                    <span style={{fontSize:11,fontWeight:700,color:G,fontFamily:'Cinzel,serif'}}>28%</span>
                  </div>
                  <div style={{height:10,background:'rgba(201,119,0,.1)',borderRadius:99,overflow:'hidden',marginBottom:6}}>
                    <div style={{height:'100%',width:'28%',borderRadius:99,
                      background:`linear-gradient(90deg,${G},${GL})`}}/>
                  </div>
                  <p style={{fontSize:10,color:'rgba(122,79,0,.4)',lineHeight:1.5}}>
                    Groq free tier — unlimited tokens on Llama, Mixtral &amp; Gemma models. ॐ
                  </p>
                </div>

                {/* per-model breakdown */}
                <div>
                  <p style={{fontSize:8.5,fontWeight:700,color:'rgba(122,79,0,.4)',
                    textTransform:'uppercase',letterSpacing:'.14em',
                    fontFamily:'Cinzel,serif',marginBottom:10}}>Per Model Breakdown</p>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {modelUsage.map((m,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:9}}>
                        <div style={{width:7,height:7,borderRadius:'50%',background:m.color,flexShrink:0}}/>
                        <span style={{fontSize:10.5,color:GM,flex:1,overflow:'hidden',
                          textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.name}</span>
                        <div style={{width:80,height:4,background:'rgba(201,119,0,.1)',
                          borderRadius:99,overflow:'hidden',flexShrink:0}}>
                          <div style={{height:'100%',width:`${m.value}%`,
                            background:m.color,borderRadius:99}}/>
                        </div>
                        <span style={{fontSize:10,fontWeight:700,color:m.color,
                          fontFamily:'Cinzel,serif',minWidth:28,textAlign:'right'}}>{m.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ FOOTER ════════════════════════════════════════════════ */}
          <div style={{textAlign:'center',paddingTop:14,borderTop:`1px solid ${LINE}`}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:10}}>
              <div style={{opacity:.1,animation:'anSpin 30s linear infinite'}}><Chakra size={14}/></div>
              <p style={{fontSize:9.5,color:'rgba(100,60,15,.4)',fontFamily:'Cinzel,serif',letterSpacing:'.12em'}}>
                ॐ नमो भगवते वासुदेवाय — Sudharshan AI Enterprise v3.0
              </p>
              <div style={{opacity:.1,animation:'anSpinCCW 30s linear infinite'}}><Chakra size={14}/></div>
            </div>
          </div>

        </div>{/* /inner */}
      </div>{/* /root */}
    </>
  );
}
