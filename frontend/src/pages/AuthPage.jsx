

import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../hooks/useAuth';
import { useToast }            from '../hooks/useToast';
import {
  Eye, EyeOff, ArrowRight, Loader2,
  Zap, BarChart2, Layers, ShieldCheck,
  Lock, Globe, CheckCircle, Mail,
  User, KeyRound, Sparkles, ChevronRight,
  Activity, Star, AlertCircle,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS — exact match with every other page
══════════════════════════════════════════════════════════════ */
const G      = '#C97700';
const GL     = '#E8920A';
const GD     = '#3D1F00';
const GM     = '#7A4F00';
const CREAM  = '#FFFDF5';
const CREAM2 = '#FFF8E5';
const CREAM3 = '#FEF3D0';
const LINE   = 'rgba(201,119,0,.13)';
const LINEB  = 'rgba(201,119,0,.22)';
const GSoft  = 'rgba(201,119,0,.08)';
const C = {
  green:'#059669', greenBg:'rgba(5,150,105,.09)', greenB:'rgba(5,150,105,.22)',
  red:'#DC2626',
};

/* ══════════════════════════════════════════════════════════════
   CHAKRA SVG — full detail version
══════════════════════════════════════════════════════════════ */
function Chakra({ size = 120, speed = '14s' }) {
  const spokes = Array.from({ length: 16 }, (_, i) => {
    const a = (i * 22.5 * Math.PI) / 180;
    return { id:i, x1:50+21*Math.cos(a), y1:50+21*Math.sin(a), x2:50+43*Math.cos(a), y2:50+43*Math.sin(a) };
  });
  const flames = Array.from({ length: 16 }, (_, i) => {
    const a = (i * 22.5 * Math.PI) / 180;
    const m = ((i + 0.5) * 22.5 * Math.PI) / 180;
    return { id:i, x:50+46*Math.cos(a), y:50+46*Math.sin(a), mx:50+51*Math.cos(m), my:50+51*Math.sin(m) };
  });
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180;
    return { id:i, cx:50+31*Math.cos(a), cy:50+31*Math.sin(a), rot:i*45+90 };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ display:'block', flexShrink:0, animation:`authSpin ${speed} linear infinite` }}>
      {flames.map(f=>(
        <polygon key={f.id}
          points={`${f.x-.8},${f.y-.8} ${f.mx},${f.my} ${f.x+.8},${f.y+.8}`}
          fill="#B06000" opacity=".72"/>
      ))}
      <circle cx="50" cy="50" r="46.5" fill="none" stroke={G} strokeWidth="1.3" opacity=".9"/>
      <circle cx="50" cy="50" r="43"   fill="none" stroke="rgba(180,110,0,.25)" strokeWidth=".5"/>
      {spokes.map(s=>(
        <line key={s.id} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke={G} strokeWidth="1.8" strokeLinecap="round"/>
      ))}
      {spokes.map((_,i)=>{
        const a=(i*22.5*Math.PI)/180;
        return <circle key={i} cx={50+44*Math.cos(a)} cy={50+44*Math.sin(a)} r="2.1" fill={GL}/>;
      })}
      {petals.map(p=>(
        <ellipse key={p.id} cx={p.cx} cy={p.cy} rx="4" ry="8.5"
          fill="rgba(200,120,0,.13)" stroke={G} strokeWidth=".65"
          transform={`rotate(${p.rot},${p.cx},${p.cy})`}/>
      ))}
      <circle cx="50" cy="50" r="19.5" fill={CREAM} stroke={G} strokeWidth="1.2"/>
      <circle cx="50" cy="50" r="13.5" fill="rgba(255,245,215,.85)" stroke="rgba(200,130,0,.35)" strokeWidth=".7"/>
      <circle cx="50" cy="50" r="5.5"  fill={G}/>
      <circle cx="50" cy="50" r="2.8"  fill="#FFAA20"/>
      <circle cx="50" cy="50" r="1.1"  fill="white" opacity=".9"/>
    </svg>
  );
}

function LogoChakra({ size=32 }) {
  const sp = Array.from({length:16},(_,i)=>{
    const a=(i*22.5*Math.PI)/180;
    return{id:i,x1:50+20*Math.cos(a),y1:50+20*Math.sin(a),x2:50+44*Math.cos(a),y2:50+44*Math.sin(a)};
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{display:'block',flexShrink:0,animation:'authSpin 11s linear infinite'}}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={G} strokeWidth="3.5"/>
      {sp.map(s=><line key={s.id} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={G} strokeWidth="2.5"/>)}
      {sp.map((_,i)=>{const a=(i*22.5*Math.PI)/180;return<circle key={i} cx={50+46*Math.cos(a)} cy={50+46*Math.sin(a)} r="3" fill={GL}/>;  })}
      <circle cx="50" cy="50" r="17" fill={CREAM} stroke={G} strokeWidth="2"/>
      <circle cx="50" cy="50" r="5.5" fill={G}/>
      <circle cx="50" cy="50" r="2.5" fill="#FFAA20"/>
    </svg>
  );
}

const DOTS = Array.from({length:20},(_,i)=>({
  id:i, sz:(i%3)*2.5+3,
  top:(i*47%94), left:(i*73%93),
  op:.04+(i%4)*.018,
  dur:(i%4)+4, del:((i*.6)%4).toFixed(1),
}));

const FEATURES = [
  { Icon:Zap,         title:'Ultra-fast Streaming AI',   desc:'Groq · 280+ tokens/sec · 5 models live'          },
  { Icon:BarChart2,   title:'Sacred Analytics',           desc:'Real-time metrics, usage patterns & insights'    },
  { Icon:Layers,      title:'Project Management',         desc:'Kanban boards with divine order & precision'     },
  { Icon:ShieldCheck, title:'Enterprise Security',        desc:'JWT auth · Rate limiting · End-to-end encrypted' },
];

const TRUST = [
  { Icon:CheckCircle, label:'SOC 2 Ready'  },
  { Icon:Lock,        label:'Encrypted'    },
  { Icon:Globe,       label:'99.9% Uptime' },
  { Icon:Star,        label:'Enterprise'   },
];

/* ══════════════════════════════════════════════════════════════
   INPUT FIELD
══════════════════════════════════════════════════════════════ */
function Field({ label, type='text', value, onChange, onKeyDown,
  placeholder, focused, onFocus, onBlur, error, Icon, suffix }) {
  return (
    <div>
      <label style={{
        display:'block', fontSize:9.5, fontWeight:800,
        color:focused?G:GM, textTransform:'uppercase',
        letterSpacing:'.6px', marginBottom:6,
        fontFamily:'Cinzel,serif', transition:'color .18s',
      }}>{label}</label>
      <div style={{position:'relative'}}>
        {Icon && (
          <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',
            pointerEvents:'none',display:'flex',alignItems:'center'}}>
            <Icon size={14} color={focused?G:'rgba(122,79,0,.38)'} strokeWidth={1.8}/>
          </span>
        )}
        <input
          type={type} value={value} onChange={onChange}
          onKeyDown={onKeyDown} placeholder={placeholder}
          onFocus={onFocus} onBlur={onBlur}
          style={{
            width:'100%', padding:'11px 14px',
            paddingLeft:Icon?'37px':'14px',
            paddingRight:suffix?'44px':'14px',
            borderRadius:11, fontSize:13.5,
            fontFamily:'Outfit,sans-serif',
            outline:'none', transition:'all .2s',
            boxSizing:'border-box', color:GD,
            background:focused?CREAM:'rgba(255,252,240,.75)',
            border:`1.5px solid ${error?C.red:focused?G:LINEB}`,
            boxShadow:focused
              ?`0 0 0 3px rgba(201,119,0,.11),0 2px 8px rgba(0,0,0,.05)`
              :'0 1px 3px rgba(0,0,0,.04)',
          }}/>
        {suffix && (
          <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)'}}>
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p style={{fontSize:10.5,color:C.red,marginTop:4,display:'flex',alignItems:'center',gap:4}}>
          <AlertCircle size={10}/> {error}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function AuthPage() {
  const [mode,    setMode]    = useState('login');
  const [form,    setForm]    = useState({name:'',email:'admin@kova.ai',password:'password123'});
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [errors,  setErrors]  = useState({});
  const [mounted, setMounted] = useState(false);

  const { login, register } = useAuth();
  const { toast }           = useToast();
  const navigate            = useNavigate();

  useEffect(()=>{ const t=setTimeout(()=>setMounted(true),40); return()=>clearTimeout(t); },[]);

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };

  function validate() {
    const e={};
    if (!form.email.trim())                    e.email='Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email='Enter a valid email';
    if (!form.password)                        e.password='Password is required';
    else if (form.password.length<6)           e.password='Min 6 characters';
    if (mode==='register'&&!form.name.trim())  e.name='Name is required';
    setErrors(e);
    return !Object.keys(e).length;
  }

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode==='login') await login(form.email, form.password);
      else                await register(form.name, form.email, form.password);
      toast('Welcome to Sudharshan AI! ॐ','success');
      navigate('/dashboard');
    } catch(e) {
      toast(e.response?.data?.error||'Authentication failed','error');
    } finally { setLoading(false); }
  };

  const handleKey = e => { if(e.key==='Enter') submit(); };
  const switchMode = () => { setMode(m=>m==='login'?'register':'login'); setErrors({}); };

  const slide = (delay='0s') => ({
    opacity:mounted?1:0,
    transform:mounted?'none':'translateY(18px)',
    transition:`opacity .55s cubic-bezier(.22,1,.36,1) ${delay}, transform .55s cubic-bezier(.22,1,.36,1) ${delay}`,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @keyframes authSpin      { to{transform:rotate(360deg)} }
        @keyframes authSpinCCW   { to{transform:rotate(-360deg)} }
        @keyframes authFloat     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes authDot       { 0%,100%{opacity:.04;transform:scale(1)} 50%{opacity:.13;transform:scale(1.4)} }
        @keyframes authShimmer   { 0%{background-position:-220% center} 100%{background-position:220% center} }
        @keyframes authPulseBtn  { 0%,100%{box-shadow:0 4px 20px rgba(201,119,0,.35)} 50%{box-shadow:0 4px 32px rgba(201,119,0,.55),0 0 0 5px rgba(201,119,0,.08)} }
        @keyframes authScaleIn   { from{opacity:0;transform:scale(.72) rotate(-22deg)} to{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes authPanelIn   { from{opacity:0;transform:translateX(38px)} to{opacity:1;transform:none} }
        @keyframes authFadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%;overflow:hidden}
        ::placeholder{color:rgba(122,79,0,.32)!important;font-family:Outfit,sans-serif}
        .af-feat{transition:all .18s;cursor:default;border:1px solid transparent!important}
        .af-feat:hover{background:rgba(201,119,0,.1)!important;transform:translateX(4px);border-color:rgba(201,119,0,.18)!important}
        .af-trust{transition:all .15s;cursor:default}
        .af-trust:hover{background:rgba(201,119,0,.15)!important}
        button:hover:not(:disabled){filter:brightness(1.05)}
        @media(max-width:900px){html,body,#root{overflow:auto}}
      `}</style>

      <div style={{
        height:'100vh',width:'100vw',display:'flex',overflow:'hidden',
        background:`linear-gradient(148deg,${CREAM} 0%,${CREAM2} 52%,${CREAM3} 100%)`,
        fontFamily:'Outfit,sans-serif',position:'relative',
      }}>

        {/* ambient dots */}
        {DOTS.map(d=>(
          <div key={d.id} style={{
            position:'fixed',borderRadius:'50%',pointerEvents:'none',zIndex:0,
            width:d.sz,height:d.sz,top:`${d.top}%`,left:`${d.left}%`,
            background:G,opacity:d.op,
            animation:`authDot ${d.dur}s ${d.del}s ease-in-out infinite`,
          }}/>
        ))}

        {/* giant BG chakra */}
        <div style={{
          position:'fixed',top:'50%',left:'36%',transform:'translate(-50%,-50%)',
          opacity:.033,pointerEvents:'none',zIndex:0,
          animation:'authSpin 100s linear infinite',
        }}>
          <Chakra size={820} speed="100s"/>
        </div>

        {/* ════════ LEFT PANEL ════════ */}
        <div style={{
          flex:'1 1 0',minWidth:0,display:'flex',flexDirection:'column',
          justifyContent:'space-between',padding:'40px 52px',
          position:'relative',zIndex:1,overflow:'hidden',
        }}>
          {/* right separator */}
          <div style={{
            position:'absolute',top:'4%',bottom:'4%',right:0,width:1,
            background:`linear-gradient(to bottom,transparent,${LINEB} 28%,rgba(201,119,0,.45) 50%,${LINEB} 72%,transparent)`,
          }}/>

          {/* Logo */}
          <div style={{...slide('.04s'),display:'flex',alignItems:'center',gap:12}}>
            <LogoChakra size={38}/>
            <div>
              <div style={{fontFamily:'Cinzel,serif',fontSize:19,fontWeight:800,color:GM,letterSpacing:'.03em',lineHeight:1.1}}>
                Sudharshan <span style={{color:G}}>AI</span>
              </div>
              <div style={{fontSize:9,color:'rgba(122,79,0,.42)',letterSpacing:'.24em',textTransform:'uppercase',marginTop:2}}>
                Enterprise
              </div>
            </div>
          </div>

          {/* Hero */}
          <div style={{position:'relative',zIndex:2}}>

            {/* badge */}
            <div style={{...slide('.1s'),
              display:'inline-flex',alignItems:'center',gap:8,marginBottom:22,
              padding:'6px 14px',borderRadius:99,
              background:GSoft,border:`1px solid ${LINEB}`,
              fontSize:11,color:GM,fontFamily:'Cinzel,serif',letterSpacing:'.05em',
            }}>
              <LogoChakra size={13}/>
              सुदर्शन चक्र — The Divine Disc
            </div>

            {/* floating chakra */}
            <div style={{
              marginBottom:24,width:'fit-content',
              animation:'authScaleIn .75s cubic-bezier(.34,1.56,.64,1) .2s both, authFloat 5.5s ease-in-out 1.2s infinite',
            }}>
              <Chakra size={172} speed="14s"/>
            </div>

            {/* headline */}
            <div style={slide('.28s')}>
              <h1 style={{fontFamily:'Cinzel,serif',fontSize:32,fontWeight:900,
                color:GD,lineHeight:1.2,marginBottom:10,letterSpacing:'.01em'}}>
                Divine Intelligence<br/>
                <span style={{
                  background:`linear-gradient(120deg,${G} 0%,${GL} 35%,#FFB830 65%,${G} 100%)`,
                  backgroundSize:'230% auto',
                  WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
                  animation:'authShimmer 3.8s linear infinite',
                  display:'inline-block',
                }}>
                  Meets Modern AI
                </span>
              </h1>
              <p style={{color:'rgba(122,79,0,.58)',fontSize:13.5,lineHeight:1.82,
                marginBottom:26,maxWidth:420}}>
                Inspired by Sri Krishna's Sudarshana Chakra — the unstoppable divine weapon
                of wisdom — Sudharshan AI gives your team supernatural intelligence.
              </p>
            </div>

            {/* feature rows — lucide icons only */}
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {FEATURES.map(({Icon,title,desc},i)=>(
                <div key={i} className="af-feat"
                  style={{
                    ...slide(`${.36+i*.07}s`),
                    display:'flex',alignItems:'center',gap:13,
                    padding:'10px 13px',borderRadius:13,
                    background:'rgba(201,119,0,.05)',
                  }}>
                  <div style={{
                    width:38,height:38,borderRadius:11,flexShrink:0,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    background:`linear-gradient(135deg,${G}18,${GL}10)`,
                    border:`1px solid ${G}28`,
                  }}>
                    <Icon size={17} color={G} strokeWidth={1.7}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:GD,fontSize:12.5,fontWeight:700,marginBottom:1}}>{title}</div>
                    <div style={{color:'rgba(122,79,0,.5)',fontSize:11.5,lineHeight:1.5}}>{desc}</div>
                  </div>
                  <ChevronRight size={13} color='rgba(201,119,0,.28)' style={{flexShrink:0}}/>
                </div>
              ))}
            </div>

            {/* trust badges */}
            <div style={{...slide('.64s'),display:'flex',gap:7,marginTop:18,flexWrap:'wrap'}}>
              {TRUST.map(({Icon,label},i)=>(
                <div key={i} className="af-trust"
                  style={{display:'flex',alignItems:'center',gap:5,
                    padding:'5px 11px',borderRadius:99,
                    background:GSoft,border:`1px solid ${LINE}`}}>
                  <Icon size={11} color={C.green} strokeWidth={2.2}/>
                  <span style={{fontSize:10,fontWeight:600,color:GM}}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* footer */}
          <p style={{...slide('.8s'),fontSize:10.5,color:'rgba(122,79,0,.3)',
            fontFamily:'Cinzel,serif',letterSpacing:'.06em'}}>
            © 2025 Sudharshan AI — ॐ नमो भगवते वासुदेवाय
          </p>
        </div>

        {/* ════════ RIGHT PANEL ════════ */}
        <div style={{
          width:468,flexShrink:0,
          display:'flex',alignItems:'center',justifyContent:'center',
          padding:'28px 40px',position:'relative',zIndex:2,overflowY:'auto',
          background:`linear-gradient(170deg,rgba(255,253,242,.98),rgba(255,248,225,.99))`,
          borderLeft:`1px solid ${LINEB}`,
          boxShadow:'-8px 0 52px rgba(201,119,0,.09)',
          animation:'authPanelIn .55s cubic-bezier(.22,1,.36,1) both',
        }}>
          <div style={{width:'100%',maxWidth:388}}>

            {/* brand */}
            <div style={{textAlign:'center',marginBottom:20}}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:12,
                animation:'authScaleIn .65s cubic-bezier(.34,1.56,.64,1) .1s both'}}>
                <Chakra size={76} speed="12s"/>
              </div>
              <div style={{fontFamily:'Cinzel,serif',fontSize:20,fontWeight:800,
                color:GD,letterSpacing:'.02em',marginBottom:2}}>
                <span style={{color:G}}>Sudharshan</span> AI
              </div>
              <div style={{fontSize:9.5,color:'rgba(122,79,0,.42)',letterSpacing:'.22em',
                textTransform:'uppercase',fontFamily:'Cinzel,serif'}}>
                Divine Intelligence Platform
              </div>
              <div style={{height:1,background:`linear-gradient(90deg,transparent,${LINEB},transparent)`,
                marginTop:16}}/>
            </div>

            {/* mode tabs */}
            <div style={{
              display:'flex',background:GSoft,borderRadius:13,
              padding:3,marginBottom:20,border:`1px solid ${LINE}`,
            }}>
              {['login','register'].map(m=>(
                <button key={m} onClick={()=>{setMode(m);setErrors({});}}
                  style={{
                    flex:1,padding:'9px 0',borderRadius:11,fontSize:13,
                    fontWeight:700,fontFamily:'Outfit,sans-serif',
                    cursor:'pointer',border:'none',transition:'all .22s',
                    background:mode===m?`linear-gradient(135deg,${G},${GL})`:'transparent',
                    color:mode===m?'white':'rgba(122,79,0,.55)',
                    boxShadow:mode===m?`0 3px 14px rgba(201,119,0,.32)`:'none',
                  }}>
                  {m==='login'?'Sign In':'Register'}
                </button>
              ))}
            </div>

            {/* heading */}
            <div key={mode} style={{marginBottom:14,animation:'authFadeUp .24s both'}}>
              <div style={{fontSize:18,fontWeight:800,color:GD,
                fontFamily:'Cinzel,serif',marginBottom:3,letterSpacing:'.01em'}}>
                {mode==='login'?'Welcome Back':'Begin Your Journey'}
              </div>
              <div style={{fontSize:12.5,color:GM}}>
                {mode==='login'
                  ?'Enter your divine workspace credentials'
                  :'Create your Sudharshan AI account'}
              </div>
            </div>

            {/* demo hint */}
            {mode==='login' && (
              <div style={{
                marginBottom:14,padding:'9px 12px',borderRadius:11,
                background:'rgba(201,119,0,.07)',border:`1px solid ${LINEB}`,
                display:'flex',alignItems:'center',gap:8,
              }}>
                <Sparkles size={14} color={G} strokeWidth={1.8}/>
                <span style={{fontSize:11.5,color:GM}}>
                  <strong style={{color:GD}}>Demo:</strong> admin@kova.ai / password123
                </span>
              </div>
            )}

            {/* form */}
            <div style={{display:'flex',flexDirection:'column',gap:12}}>

              {mode==='register' && (
                <div style={{animation:'authFadeUp .22s both'}}>
                  <Field label="Full Name" value={form.name}
                    onChange={e=>set('name',e.target.value)}
                    onKeyDown={handleKey} placeholder="Your sacred name"
                    focused={focused==='name'}
                    onFocus={()=>setFocused('name')}
                    onBlur={()=>setFocused(null)}
                    error={errors.name} Icon={User}/>
                </div>
              )}

              <Field label="Email Address" type="email" value={form.email}
                onChange={e=>set('email',e.target.value)}
                onKeyDown={handleKey} placeholder="you@company.com"
                focused={focused==='email'}
                onFocus={()=>setFocused('email')}
                onBlur={()=>setFocused(null)}
                error={errors.email} Icon={Mail}/>

              <Field label="Password"
                type={showPw?'text':'password'} value={form.password}
                onChange={e=>set('password',e.target.value)}
                onKeyDown={handleKey} placeholder="••••••••"
                focused={focused==='password'}
                onFocus={()=>setFocused('password')}
                onBlur={()=>setFocused(null)}
                error={errors.password} Icon={KeyRound}
                suffix={
                  <button type="button" onClick={()=>setShowPw(s=>!s)}
                    style={{background:'none',border:'none',cursor:'pointer',
                      display:'flex',padding:2,transition:'color .18s',
                      color:'rgba(122,79,0,.4)'}}
                    onMouseEnter={e=>e.currentTarget.style.color=G}
                    onMouseLeave={e=>e.currentTarget.style.color='rgba(122,79,0,.4)'}>
                    {showPw?<EyeOff size={15}/>:<Eye size={15}/>}
                  </button>
                }/>
            </div>

            {/* submit */}
            <button onClick={submit} disabled={loading}
              style={{
                width:'100%',marginTop:18,padding:'13px 0',
                borderRadius:12,border:'none',
                cursor:loading?'not-allowed':'pointer',
                fontFamily:'Outfit,sans-serif',fontSize:14.5,
                fontWeight:700,letterSpacing:'.025em',
                display:'flex',alignItems:'center',justifyContent:'center',gap:9,
                transition:'all .22s',color:'white',
                background:loading?'rgba(201,119,0,.32)'
                  :`linear-gradient(135deg,${G} 0%,${GL} 55%,#FFB830 100%)`,
                animation:loading?'none':'authPulseBtn 2.5s ease-in-out infinite',
              }}>
              {loading
                ? <><Loader2 size={17} style={{animation:'authSpin 1s linear infinite'}}/> Entering…</>
                : <>{mode==='login'?'Enter Workspace':'Create Account'} <ArrowRight size={16}/></>
              }
            </button>

            {/* switch mode */}
            <p style={{textAlign:'center',fontSize:12.5,color:GM,marginTop:14}}>
              {mode==='login'?'New to Sudharshan AI? ':'Already a member? '}
              <button onClick={switchMode}
                style={{color:G,background:'none',border:'none',cursor:'pointer',
                  fontWeight:700,fontSize:12.5,fontFamily:'Outfit,sans-serif',
                  textDecoration:'underline',textDecorationColor:'rgba(201,119,0,.38)',
                  padding:0}}>
                {mode==='login'?'Create account':'Sign in'}
              </button>
            </p>

            {/* security row */}
            <div style={{display:'flex',justifyContent:'center',gap:14,marginTop:14,
              paddingTop:14,borderTop:`1px solid ${LINE}`}}>
              {[
                {Icon:Lock,        label:'Encrypted'  },
                {Icon:ShieldCheck, label:'Secure Auth'},
                {Icon:CheckCircle, label:'GDPR Ready' },
              ].map(({Icon,label},i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:4}}>
                  <Icon size={10} color={C.green} strokeWidth={2.2}/>
                  <span style={{fontSize:9.5,color:'rgba(122,79,0,.4)',fontWeight:500}}>{label}</span>
                </div>
              ))}
            </div>

            {/* mantra */}
            <div style={{textAlign:'center',marginTop:12,
              display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <div style={{opacity:.16,animation:'authSpin 22s linear infinite'}}>
                <LogoChakra size={10}/>
              </div>
              <span style={{fontSize:9.5,color:'rgba(122,79,0,.28)',
                fontFamily:'Cinzel,serif',letterSpacing:'.1em'}}>
                ॐ नमो भगवते वासुदेवाय
              </span>
              <div style={{opacity:.16,animation:'authSpinCCW 22s linear infinite'}}>
                <LogoChakra size={10}/>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
