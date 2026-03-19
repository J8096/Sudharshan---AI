import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, BarChart3, FolderKanban, Users,
  Bell, Settings, LogOut, ChevronDown, X, Plus, Search, ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { notifApi } from '../services/api';
import { useQuery } from '@tanstack/react-query';

/* ── Design tokens ───────────────────────────────────── */
const G  = '#C97700';
const GL = '#E8920A';
const AD = '#3D1F00';  /* amber deep  */
const AM = '#7A4F00';  /* amber mid   */
const AL = '#b08050';  /* amber light */

/* ── Nav items ───────────────────────────────────────── */
const NAV = [
  { to:'/dashboard',     Icon:LayoutDashboard, label:'Dashboard',     skt:'मुखपृष्ठ'  },
  { to:'/analytics',     Icon:BarChart3,        label:'Analytics',     skt:'विश्लेषण'  },
  { to:'/chat',          Icon:MessageSquare,    label:'AI Chat',       skt:'वार्तालाप' },
  { to:'/projects',      Icon:FolderKanban,     label:'Projects',      skt:'परियोजना'  },
  { to:'/team',          Icon:Users,            label:'Team',          skt:'दल'         },
  { to:'/notifications', Icon:Bell,             label:'Notifications', skt:'सूचना',  badge:true },
  { to:'/settings',      Icon:Settings,         label:'Settings',      skt:'सेटिंग'   },
];

/* ── Spinning chakra SVG ─────────────────────────────── */
function ChakraSVG({ size=28, speed='12s' }) {
  const spokes = Array.from({length:16},(_,i)=>{
    const a=(i*22.5*Math.PI)/180;
    return {id:i, x1:50+21*Math.cos(a), y1:50+21*Math.sin(a), x2:50+43*Math.cos(a), y2:50+43*Math.sin(a)};
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{display:'block',flexShrink:0,animation:`sudSpin ${speed} linear infinite`}}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={G} strokeWidth="3.5"/>
      {spokes.map(s=><line key={s.id} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={G} strokeWidth="2.6" strokeLinecap="round"/>)}
      {spokes.map((_,i)=>{ const a=(i*22.5*Math.PI)/180; return <circle key={i} cx={50+44*Math.cos(a)} cy={50+44*Math.sin(a)} r="3.2" fill={GL}/>; })}
      <circle cx="50" cy="50" r="17.5" fill="white" stroke={G} strokeWidth="2.5"/>
      <circle cx="50" cy="50" r="5.8" fill={G}/>
      <circle cx="50" cy="50" r="2.6" fill="#FFAA20"/>
      <circle cx="50" cy="50" r="1"   fill="white" opacity=".9"/>
    </svg>
  );
}

/* ── Faint watermark chakra ──────────────────────────── */
function WaterChakra({size=200}) {
  const spokes = Array.from({length:16},(_,i)=>{
    const a=(i*22.5*Math.PI)/180;
    return {id:i,x1:50+20*Math.cos(a),y1:50+20*Math.sin(a),x2:50+46*Math.cos(a),y2:50+46*Math.sin(a)};
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display:'block'}}>
      <circle cx="50" cy="50" r="47" fill="none" stroke={G} strokeWidth="1.5"/>
      {spokes.map(s=><line key={s.id} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={G} strokeWidth="1.5"/>)}
      <circle cx="50" cy="50" r="20" fill="none" stroke={G} strokeWidth="1.5"/>
      <circle cx="50" cy="50" r="6"  fill={G}/>
    </svg>
  );
}

/* ── Avatar ──────────────────────────────────────────── */
function Avatar({user,size=32}) {
  const ini=(user?.name||'U').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  if(user?.avatar) return <img src={user.avatar} style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0}} alt=""/>;
  return (
    <div style={{width:size,height:size,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
      background:`linear-gradient(135deg,${G},${GL})`,color:'white',fontWeight:800,
      fontSize:size*.36,fontFamily:'Cinzel,serif',border:`2px solid rgba(201,119,0,.35)`,flexShrink:0}}>
      {ini}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN LAYOUT
═══════════════════════════════════════════════════════════ */
export default function AppLayout({children}) {
  const {user,logout} = useAuth();
  const {toast}       = useToast();
  const navigate      = useNavigate();
  const location      = useLocation();
  const [menuOpen,setMenuOpen] = useState(false);
  const [cmdOpen,setCmdOpen]   = useState(false);
  const [cmdQ,setCmdQ]         = useState('');
  const cmdRef = useRef(null);

  const {data:notifs} = useQuery({
    queryKey:['notifications'],
    queryFn:()=>notifApi.list().then(r=>r.data),
    refetchInterval:30000,
  });
  const unread = notifs?.filter(n=>!n.read).length||0;

  useEffect(()=>{
    const h=(e)=>{
      if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();setCmdOpen(o=>!o);}
      if(e.key==='Escape'){setCmdOpen(false);setMenuOpen(false);}
    };
    document.addEventListener('keydown',h);
    return ()=>document.removeEventListener('keydown',h);
  },[]);

  useEffect(()=>{ if(cmdOpen) setTimeout(()=>cmdRef.current?.focus(),60); },[cmdOpen]);
  useEffect(()=>{ setCmdOpen(false); setMenuOpen(false); },[location.pathname]);

  const handleLogout=async()=>{
    try{await logout();toast('ॐ शान्तिः — Walk in light.','success');navigate('/');}
    catch{toast('Logout failed','error');}
  };

  const cur = NAV.find(n=>location.pathname.startsWith(n.to));

  /* ── shared card style ── */
  const sideCard = {
    background:'linear-gradient(145deg,#fffdf5,#fff8e5)',
    border:'1px solid rgba(201,119,0,.2)',
    borderRadius:18,
    boxShadow:'0 2px 16px rgba(201,119,0,.07)',
  };

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes sudSpin { to { transform:rotate(360deg); } }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html,body,#root { height:100%; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(201,119,0,.22); border-radius:10px; }
        ::-webkit-scrollbar-thumb:hover { background:rgba(201,119,0,.4); }
      `}</style>

      <div style={{display:'flex',height:'100vh',overflow:'hidden',
        background:'linear-gradient(160deg,#fffcf0 0%,#fff8e0 60%,#fef5d0 100%)',
        fontFamily:'Outfit,sans-serif'}}>

        {/* ════════════ S I D E B A R ════════════ */}
        <aside style={{
          width:232,flexShrink:0,display:'flex',flexDirection:'column',
          background:'linear-gradient(180deg,#fffdf6 0%,#fff9ea 55%,#fff2d4 100%)',
          borderRight:'1px solid rgba(201,119,0,.22)',
          boxShadow:'5px 0 36px rgba(201,119,0,.09)',
          position:'relative',overflow:'hidden',
        }}>
          {/* shimmer top bar */}
          <div style={{height:3,background:`linear-gradient(90deg,${G} 0%,${GL} 50%,${G} 100%)`,flexShrink:0,
            backgroundSize:'200% auto',animation:'sudSpin 0s linear infinite'}} />

          {/* background watermark */}
          <div style={{position:'absolute',bottom:-55,right:-55,opacity:.045,
            pointerEvents:'none',animation:'sudSpin 90s linear infinite',zIndex:0}}>
            <WaterChakra size={220}/>
          </div>

          {/* ── LOGO ── */}
          <div style={{padding:'20px 18px 14px',flexShrink:0,position:'relative',zIndex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:11}}>
              <ChakraSVG size={34} speed="13s"/>
              <div>
                <div style={{fontFamily:'Cinzel,serif',fontSize:13.5,fontWeight:800,
                  color:AD,letterSpacing:'.025em',lineHeight:1.18}}>
                  Sudharshan&nbsp;<span style={{color:G}}>AI</span>
                </div>
                <div style={{fontSize:8,color:'rgba(201,119,0,.55)',letterSpacing:'.22em',
                  textTransform:'uppercase',marginTop:2}}>
                  Enterprise
                </div>
              </div>
            </div>

            {/* thin gold rule */}
            <div style={{height:1,marginTop:16,
              background:'linear-gradient(90deg,rgba(201,119,0,.35),rgba(201,119,0,.08))'}}/>
          </div>

          {/* section label */}
          <div style={{padding:'0 18px 7px',flexShrink:0,position:'relative',zIndex:1}}>
            <span style={{fontSize:8.5,fontWeight:700,letterSpacing:'.22em',textTransform:'uppercase',
              color:'rgba(201,119,0,.42)',fontFamily:'Cinzel,serif'}}>
              Workspace
            </span>
          </div>

          {/* ── NAV ── */}
          <nav style={{flex:1,overflowY:'auto',padding:'0 10px',position:'relative',zIndex:1}}>
            {NAV.map(({to,Icon,label,skt,badge})=>{
              const active = location.pathname.startsWith(to);
              return (
                <NavLink key={to} to={to} style={{textDecoration:'none',display:'block',marginBottom:2}}>
                  <div
                    style={{
                      display:'flex',alignItems:'center',gap:10,padding:'9px 10px',
                      borderRadius:12,position:'relative',cursor:'pointer',
                      background: active
                        ? 'linear-gradient(135deg,rgba(201,119,0,.16),rgba(232,146,10,.08))'
                        : 'transparent',
                      border: active ? '1px solid rgba(201,119,0,.28)' : '1px solid transparent',
                      transition:'all .18s',
                    }}
                    onMouseEnter={e=>{if(!active){
                      e.currentTarget.style.background='rgba(201,119,0,.07)';
                      e.currentTarget.style.border='1px solid rgba(201,119,0,.14)';
                    }}}
                    onMouseLeave={e=>{if(!active){
                      e.currentTarget.style.background='transparent';
                      e.currentTarget.style.border='1px solid transparent';
                    }}}
                  >
                    {/* left accent stripe */}
                    {active && (
                      <div style={{position:'absolute',left:-10,top:'50%',transform:'translateY(-50%)',
                        width:3,height:22,borderRadius:'0 3px 3px 0',
                        background:`linear-gradient(to bottom,${G},${GL})`}}/>
                    )}

                    {/* icon box */}
                    <div style={{
                      width:30,height:30,borderRadius:9,flexShrink:0,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      background: active ? 'rgba(201,119,0,.15)' : 'rgba(201,119,0,.06)',
                      border: active ? `1px solid rgba(201,119,0,.3)` : '1px solid rgba(201,119,0,.1)',
                      transition:'all .18s',
                    }}>
                      <Icon size={14} color={active ? G : AL} strokeWidth={active?2.5:2}/>
                    </div>

                    {/* label + sanskrit */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:active?700:500,
                        color:active?AD:AM,lineHeight:1.1,transition:'color .18s'}}>
                        {label}
                      </div>
                      <div style={{fontSize:9,color:`rgba(201,119,0,${active?.6:.3})`,
                        lineHeight:1,marginTop:1.5,letterSpacing:'.02em'}}>
                        {skt}
                      </div>
                    </div>

                    {/* badge */}
                    {badge && unread>0 && (
                      <span style={{
                        fontSize:9,fontWeight:800,minWidth:18,textAlign:'center',
                        background:`linear-gradient(135deg,${G},${GL})`,
                        color:'white',padding:'2px 6px',borderRadius:100,
                        boxShadow:'0 2px 7px rgba(201,119,0,.4)',
                      }}>
                        {unread>9?'9+':unread}
                      </span>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* ── CMD shortcut ── */}
          <div style={{padding:'8px 10px',flexShrink:0,
            borderTop:'1px solid rgba(201,119,0,.1)',position:'relative',zIndex:1}}>
            <button onClick={()=>setCmdOpen(true)} style={{
              width:'100%',display:'flex',alignItems:'center',gap:9,padding:'8px 11px',
              background:'rgba(201,119,0,.06)',border:'1px solid rgba(201,119,0,.15)',
              borderRadius:10,cursor:'pointer',fontFamily:'Outfit,sans-serif',transition:'all .18s',
            }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(201,119,0,.12)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(201,119,0,.06)'}>
              <Search size={12} color={`rgba(201,119,0,.65)`}/>
              <span style={{flex:1,textAlign:'left',fontSize:11.5,color:AM}}>Command palette</span>
              <span style={{fontSize:9.5,fontFamily:'monospace',
                background:'rgba(201,119,0,.12)',color:G,padding:'2px 6px',borderRadius:5}}>
                ⌘K
              </span>
            </button>
          </div>

          {/* ── USER CARD ── */}
          <div style={{padding:'8px 10px 12px',flexShrink:0,
            borderTop:'1px solid rgba(201,119,0,.12)',position:'relative',zIndex:1}}>
            <div style={{position:'relative'}}>
              <button onClick={()=>setMenuOpen(o=>!o)} style={{
                width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 11px',
                background:'rgba(201,119,0,.08)',border:'1px solid rgba(201,119,0,.2)',
                borderRadius:13,cursor:'pointer',transition:'all .18s',
              }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(201,119,0,.14)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(201,119,0,.08)'}>
                <Avatar user={user} size={30}/>
                <div style={{flex:1,minWidth:0,textAlign:'left'}}>
                  <div style={{fontSize:12.5,fontWeight:700,color:AD,
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {user?.name||'User'}
                  </div>
                  <div style={{fontSize:9.5,color:AL,textTransform:'capitalize',marginTop:1}}>
                    {user?.role||'member'}
                  </div>
                </div>
                <ChevronDown size={12} color={G} style={{flexShrink:0,transition:'transform .22s',
                  transform:menuOpen?'rotate(180deg)':'none'}}/>
              </button>

              {/* user dropdown */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{opacity:0,y:8,scale:.97}}
                    animate={{opacity:1,y:0,scale:1}}
                    exit={{opacity:0,y:8,scale:.97}}
                    transition={{duration:.16}}
                    style={{
                      position:'absolute',bottom:'calc(100% + 9px)',left:0,right:0,
                      background:'linear-gradient(160deg,#fffdf5,#fff8e5)',
                      border:'1px solid rgba(201,119,0,.28)',borderRadius:15,
                      boxShadow:'0 -12px 44px rgba(201,119,0,.2)',overflow:'hidden',zIndex:100,
                    }}>
                    {/* profile header */}
                    <div style={{padding:'13px 14px 10px',borderBottom:'1px solid rgba(201,119,0,.1)',
                      display:'flex',alignItems:'center',gap:10}}>
                      <Avatar user={user} size={34}/>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:AD,
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {user?.name}
                        </div>
                        <div style={{fontSize:10,color:AL}}>{user?.email}</div>
                      </div>
                    </div>
                    {/* settings */}
                    <button onClick={()=>{navigate('/settings');setMenuOpen(false);}} style={{
                      width:'100%',padding:'10px 14px',background:'none',border:'none',cursor:'pointer',
                      display:'flex',alignItems:'center',gap:9,fontSize:13,color:AM,
                      fontFamily:'Outfit,sans-serif',textAlign:'left',transition:'background .15s',
                    }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(201,119,0,.08)'}
                      onMouseLeave={e=>e.currentTarget.style.background='none'}>
                      <div style={{width:26,height:26,borderRadius:7,display:'flex',alignItems:'center',
                        justifyContent:'center',background:'rgba(201,119,0,.1)'}}>
                        <Settings size={12} color={G}/>
                      </div>
                      Settings
                    </button>
                    <div style={{height:1,background:'rgba(201,119,0,.1)',margin:'0 10px'}}/>
                    {/* logout */}
                    <button onClick={handleLogout} style={{
                      width:'100%',padding:'10px 14px 12px',background:'none',border:'none',cursor:'pointer',
                      display:'flex',alignItems:'center',gap:9,fontSize:13,color:'#b03000',
                      fontFamily:'Outfit,sans-serif',textAlign:'left',transition:'background .15s',
                    }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(200,80,0,.07)'}
                      onMouseLeave={e=>e.currentTarget.style.background='none'}>
                      <div style={{width:26,height:26,borderRadius:7,display:'flex',alignItems:'center',
                        justifyContent:'center',background:'rgba(200,80,0,.1)'}}>
                        <LogOut size={12} color="#b03000"/>
                      </div>
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* ════════════ M A I N ════════════ */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>

          {/* ── TOP BAR ── */}
          <header style={{
            height:56,flexShrink:0,display:'flex',alignItems:'center',
            justifyContent:'space-between',padding:'0 26px',
            background:'linear-gradient(90deg,rgba(255,253,245,.97),rgba(255,248,230,.97))',
            borderBottom:'1px solid rgba(201,119,0,.15)',
            backdropFilter:'blur(10px)',
          }}>
            {/* page title */}
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:3,height:20,borderRadius:2,
                background:`linear-gradient(to bottom,${G},${GL})`}}/>
              <div>
                <div style={{fontSize:14.5,fontWeight:800,color:AD,
                  fontFamily:'Cinzel,serif',letterSpacing:'.03em',lineHeight:1.1}}>
                  {cur?.label||'Sudharshan AI'}
                </div>
                {cur?.skt&&(
                  <div style={{fontSize:9,color:'rgba(201,119,0,.5)',letterSpacing:'.08em',marginTop:1}}>
                    {cur.skt}
                  </div>
                )}
              </div>
            </div>

            {/* right actions */}
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {/* search pill */}
              <button onClick={()=>setCmdOpen(true)} style={{
                display:'flex',alignItems:'center',gap:8,padding:'7px 14px',
                background:'rgba(201,119,0,.07)',border:'1px solid rgba(201,119,0,.2)',
                borderRadius:10,cursor:'pointer',fontFamily:'Outfit,sans-serif',transition:'all .18s',
              }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(201,119,0,.13)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(201,119,0,.07)'}>
                <Search size={13} color={G}/>
                <span style={{fontSize:12,color:AM,minWidth:70}}>Search...</span>
                <span style={{fontSize:10,fontFamily:'monospace',background:'rgba(201,119,0,.1)',
                  color:G,padding:'2px 6px',borderRadius:5}}>⌘K</span>
              </button>

              {/* new chat */}
              <button onClick={()=>navigate('/chat')} style={{
                display:'flex',alignItems:'center',gap:6,padding:'7px 16px',
                background:`linear-gradient(135deg,${G},${GL})`,
                border:'none',borderRadius:10,cursor:'pointer',
                fontSize:12.5,fontWeight:700,color:'white',fontFamily:'Outfit,sans-serif',
                boxShadow:'0 3px 14px rgba(201,119,0,.35)',letterSpacing:'.01em',
              }}>
                <Plus size={13}/> New Chat
              </button>

              {/* bell */}
              <button onClick={()=>navigate('/notifications')} style={{
                position:'relative',width:36,height:36,borderRadius:10,
                display:'flex',alignItems:'center',justifyContent:'center',
                background:'rgba(201,119,0,.07)',border:'1px solid rgba(201,119,0,.18)',
                cursor:'pointer',transition:'all .18s',
              }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(201,119,0,.14)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(201,119,0,.07)'}>
                <Bell size={15} color={G}/>
                {unread>0&&(
                  <span style={{position:'absolute',top:8,right:8,width:7,height:7,
                    borderRadius:'50%',background:GL,border:'2px solid #fffdf5'}}/>
                )}
              </button>

              <Avatar user={user} size={32}/>
            </div>
          </header>

          {/* ── PAGE CONTENT ── */}
          <main style={{flex:1,overflowY:'auto'}}>
            {children}
          </main>
        </div>
      </div>

      {/* ════════════ COMMAND PALETTE ════════════ */}
      <AnimatePresence>
        {cmdOpen&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(61,31,0,.42)',
              backdropFilter:'blur(5px)',zIndex:999,
              display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:'14vh'}}
            onClick={e=>e.target===e.currentTarget&&setCmdOpen(false)}>
            <motion.div
              initial={{opacity:0,y:-18,scale:.96}}
              animate={{opacity:1,y:0,scale:1}}
              exit={{opacity:0,y:-18,scale:.96}}
              transition={{duration:.18}}
              style={{
                width:520,
                background:'linear-gradient(160deg,#fffdf5,#fff8e5)',
                border:'1px solid rgba(201,119,0,.32)',borderRadius:22,
                boxShadow:'0 32px 80px rgba(61,31,0,.3)',overflow:'hidden',
              }}>
              {/* input */}
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 18px',
                borderBottom:'1px solid rgba(201,119,0,.12)'}}>
                <Search size={16} color={G}/>
                <input ref={cmdRef} value={cmdQ} onChange={e=>setCmdQ(e.target.value)}
                  placeholder="Search workspace…"
                  style={{flex:1,background:'none',border:'none',outline:'none',
                    fontSize:15,color:AD,fontFamily:'Outfit,sans-serif'}}/>
                <button onClick={()=>{setCmdOpen(false);setCmdQ('');}}
                  style={{background:'none',border:'none',cursor:'pointer',color:AM,padding:0}}>
                  <X size={14}/>
                </button>
              </div>

              {/* items */}
              <div style={{padding:'8px',maxHeight:320,overflowY:'auto'}}>
                {NAV
                  .filter(n=>!cmdQ||n.label.toLowerCase().includes(cmdQ.toLowerCase()))
                  .map(item=>(
                    <button key={item.to}
                      onClick={()=>{navigate(item.to);setCmdOpen(false);setCmdQ('');}}
                      style={{
                        width:'100%',display:'flex',alignItems:'center',gap:13,
                        padding:'10px 12px',background:'none',border:'none',
                        cursor:'pointer',borderRadius:12,fontFamily:'Outfit,sans-serif',
                        transition:'background .15s',textAlign:'left',
                      }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(201,119,0,.09)'}
                      onMouseLeave={e=>e.currentTarget.style.background='none'}>
                      <div style={{width:34,height:34,borderRadius:10,flexShrink:0,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        background:'rgba(201,119,0,.11)',border:'1px solid rgba(201,119,0,.22)'}}>
                        <item.Icon size={14} color={G}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13.5,fontWeight:600,color:AD}}>{item.label}</div>
                        <div style={{fontSize:10,color:'rgba(201,119,0,.58)',marginTop:1}}>{item.skt}</div>
                      </div>
                      <ChevronRight size={13} color="rgba(201,119,0,.3)"/>
                    </button>
                  ))}
                {NAV.filter(n=>!cmdQ||n.label.toLowerCase().includes(cmdQ.toLowerCase())).length===0&&(
                  <p style={{textAlign:'center',padding:'28px 0',fontSize:13,color:AM,fontFamily:'Cinzel,serif'}}>
                    No results
                  </p>
                )}
              </div>

              {/* mantra footer */}
              <div style={{padding:'10px 18px',borderTop:'1px solid rgba(201,119,0,.1)',textAlign:'center'}}>
                <span style={{fontSize:10,color:'rgba(201,119,0,.42)',
                  fontFamily:'Cinzel,serif',letterSpacing:'.1em'}}>
                  ॐ नमो भगवते वासुदेवाय
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
