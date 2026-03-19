import { useState, useEffect } from "react";
import { notifApi } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCircle, Info, AlertTriangle, XCircle,
  CheckCheck, X, Search, MessageSquare, Shield, Star,
  Clock, Archive, Eye, EyeOff
} from "lucide-react";

/* ── tokens ─────────────────────────────────────────────────────────────────── */
const T = {
  gold:   "#C97700",
  goldL:  "#E8920A",
  goldXL: "#FFB830",
  bg:     "#FFFCF0",
  bg2:    "#FFF8E0",
  bgCard: "#FFFDFA",
  deep:   "#1A0E00",
  mid:    "#3D1F00",
  muted:  "#7A4F00",
  pale:   "#B08050",
  paleXL: "rgba(176,128,80,.45)",
  line:   "rgba(201,119,0,.14)",
  lineB:  "rgba(201,119,0,.24)",
};

/* ── notification types ──────────────────────────────────────────────────────── */
const TYPE = {
  success: { icon: CheckCircle,  label:"Success", color:"#059669", bg:"rgba(5,150,105,.1)",   border:"rgba(5,150,105,.22)"  },
  info:    { icon: Info,          label:"Info",    color:T.gold,    bg:"rgba(201,119,0,.1)",   border:"rgba(201,119,0,.25)"  },
  warning: { icon: AlertTriangle, label:"Warning", color:T.goldL,   bg:"rgba(232,146,10,.1)",  border:"rgba(232,146,10,.25)" },
  error:   { icon: XCircle,       label:"Error",   color:"#dc2626", bg:"rgba(220,38,38,.1)",   border:"rgba(220,38,38,.22)"  },
  task:    { icon: CheckCircle,   label:"Task",    color:"#7c3aed", bg:"rgba(124,58,237,.1)",  border:"rgba(124,58,237,.22)" },
  system:  { icon: Shield,        label:"System",  color:T.pale,    bg:"rgba(176,128,80,.1)",  border:"rgba(176,128,80,.22)" },
  mention: { icon: MessageSquare, label:"Mention", color:"#0ea5e9", bg:"rgba(14,165,233,.1)",  border:"rgba(14,165,233,.22)" },
};

/* ── sample data ─────────────────────────────────────────────────────────────── */
const SAMPLE = [
  { id:1, type:"success", title:"Welcome to SUDHARSHAN AI!",          message:"Your enterprise account is fully configured and ready to use.",                                        read:false, createdAt:new Date(Date.now()-18000000) },
  { id:2, type:"info",    title:"New feature: Analytics Dashboard",   message:"Check out the new analytics dashboard to monitor AI usage, token consumption, and team performance.",  read:false, createdAt:new Date(Date.now()-18200000) },
  { id:3, type:"task",    title:"Task updated",                       message:"Analytics dashboard moved to Review stage by Priya Sharma.",                                          read:true,  createdAt:new Date(Date.now()-21600000) },
  { id:4, type:"system",  title:"System maintenance",                 message:"Scheduled maintenance window on Sunday 2:00 AM UTC. Expected downtime: 15 minutes.",                 read:true,  createdAt:new Date(Date.now()-86400000) },
  { id:5, type:"warning", title:"API rate limit approaching",         message:"Your workspace has used 82% of the monthly API quota. Consider upgrading your plan.",                 read:false, createdAt:new Date(Date.now()-3600000)  },
  { id:6, type:"mention", title:"Alex Johnson mentioned you",         message:"\"@you can you review the Q3 report before EOD?\" — in Project Alpha thread.",                       read:false, createdAt:new Date(Date.now()-900000)   },
  { id:7, type:"error",   title:"Export failed",                      message:"The PDF export for 'Monthly Report Dec 2025' failed due to a timeout. Please retry.",                read:true,  createdAt:new Date(Date.now()-172800000) },
  { id:8, type:"success", title:"Team member added",                  message:"Rahul Verma has joined your workspace as a Developer.",                                               read:true,  createdAt:new Date(Date.now()-259200000) },
];

function timeAgo(date) {
  const d = Date.now() - new Date(date).getTime();
  if (d < 60000)     return "just now";
  if (d < 3600000)   return `${Math.floor(d/60000)}m ago`;
  if (d < 86400000)  return `${Math.floor(d/3600000)}h ago`;
  if (d < 604800000) return `${Math.floor(d/86400000)}d ago`;
  return new Date(date).toLocaleDateString();
}

/* ── Chakra SVG ──────────────────────────────────────────────────────────────── */
function Chakra({ size = 120, opacity = 1 }) {
  const spokes = Array.from({ length:24 }, (_,i) => {
    const a = (i * 15 * Math.PI) / 180;
    return { id:i, x1:50+18*Math.cos(a), y1:50+18*Math.sin(a), x2:50+46*Math.cos(a), y2:50+46*Math.sin(a) };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display:"block", opacity }}>
      <circle cx="50" cy="50" r="48" fill="none" stroke={T.gold} strokeWidth="1"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke={T.gold} strokeWidth=".5" strokeDasharray="3 3"/>
      {spokes.map(s => <line key={s.id} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={T.gold} strokeWidth="1.2"/>)}
      <circle cx="50" cy="50" r="7" fill={T.gold}/>
      <circle cx="50" cy="50" r="3" fill={T.goldXL}/>
    </svg>
  );
}

/* ── Stat card ───────────────────────────────────────────────────────────────── */
function StatCard({ label, value, color, icon: Icon, sub }) {
  return (
    <motion.div
      whileHover={{ y:-2, boxShadow:`0 8px 28px rgba(201,119,0,.13)` }}
      style={{
        flex:1, background:T.bgCard,
        border:`1px solid ${T.line}`, borderRadius:14,
        padding:"12px 16px", display:"flex", alignItems:"center", gap:12,
        boxShadow:"0 2px 10px rgba(201,119,0,.05)", transition:"all .2s",
      }}
    >
      <div style={{
        width:38, height:38, borderRadius:11, flexShrink:0,
        background:`${color}15`, border:`1px solid ${color}28`,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <Icon size={16} color={color}/>
      </div>
      <div>
        <div style={{ fontSize:22, fontWeight:800, color, fontFamily:"Cinzel,serif", lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:10, color:T.pale, marginTop:2, fontWeight:500 }}>{label}</div>
        {sub && <div style={{ fontSize:9, color:T.paleXL, marginTop:1 }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

/* ── Pill filter ─────────────────────────────────────────────────────────────── */
function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"4px 12px", borderRadius:100, cursor:"pointer",
      fontSize:11, fontWeight:600, transition:"all .16s",
      border: active ? `1px solid ${T.gold}` : `1px solid ${T.line}`,
      background: active
        ? `linear-gradient(135deg,rgba(201,119,0,.18),rgba(232,146,10,.1))`
        : "rgba(255,253,248,.9)",
      color: active ? T.mid : T.pale,
      boxShadow: active ? `0 2px 10px rgba(201,119,0,.13)` : "none",
      fontFamily:"'DM Sans',sans-serif",
    }}>{label}</button>
  );
}

/* ── Notification row ────────────────────────────────────────────────────────── */
function NotifRow({ n, onRead, onDelete, idx }) {
  const cfg = TYPE[n.type] || TYPE.info;
  const Icon = cfg.icon;
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, x:24, height:0, marginBottom:0 }}
      transition={{ delay:idx*0.035, type:"spring", stiffness:320, damping:30 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:"flex", alignItems:"stretch",
        borderRadius:13, overflow:"hidden",
        border:`1px solid ${n.read ? T.line : cfg.border}`,
        background: n.read
          ? `linear-gradient(135deg,${T.bgCard},${T.bg2})`
          : `linear-gradient(135deg,rgba(255,253,248,.99),rgba(255,249,228,.99))`,
        boxShadow: n.read ? "0 1px 5px rgba(0,0,0,.03)" : `0 3px 16px ${cfg.bg}`,
        opacity: n.read ? 0.75 : 1,
        transition:"all .18s",
      }}
    >
      {/* accent bar */}
      <div style={{
        width: n.read ? 3 : 4, flexShrink:0,
        background: n.read ? T.line : `linear-gradient(to bottom,${cfg.color},${cfg.color}55)`,
        transition:"width .2s",
      }}/>

      {/* icon */}
      <div style={{ padding:"12px 12px 12px 13px", flexShrink:0, display:"flex", alignItems:"center" }}>
        <div style={{
          width:36, height:36, borderRadius:11,
          display:"flex", alignItems:"center", justifyContent:"center",
          background:cfg.bg, border:`1px solid ${cfg.border}`,
        }}>
          <Icon size={15} color={cfg.color}/>
        </div>
      </div>

      {/* body */}
      <div
        onClick={() => !n.read && onRead(n.id)}
        style={{ flex:1, minWidth:0, padding:"12px 0", cursor:n.read?"default":"pointer" }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3, flexWrap:"wrap" }}>
          <span style={{
            fontSize:12.5, fontWeight:700,
            color: n.read ? T.muted : T.deep,
            fontFamily:"Cinzel,serif",
          }}>{n.title}</span>
          {!n.read && (
            <span style={{
              width:6, height:6, borderRadius:"50%", flexShrink:0,
              background:T.gold, boxShadow:`0 0 7px ${T.gold}90`,
            }}/>
          )}
          <span style={{
            fontSize:9, fontWeight:600, color:cfg.color,
            background:cfg.bg, border:`1px solid ${cfg.border}`,
            borderRadius:100, padding:"1px 7px", flexShrink:0,
          }}>{cfg.label}</span>
        </div>
        {n.message && (
          <p style={{ fontSize:11.5, color:T.pale, lineHeight:1.5, marginBottom:4, paddingRight:8 }}>{n.message}</p>
        )}
        <span style={{
          fontSize:9.5, color:T.paleXL,
          background:"rgba(201,119,0,.07)", padding:"2px 8px",
          borderRadius:100, display:"inline-flex", alignItems:"center", gap:3,
        }}>
          <Clock size={8} color={T.paleXL}/> {timeAgo(n.createdAt)}
          {n.read && <><span style={{margin:"0 3px"}}>·</span><Eye size={8}/>  Read</>}
        </span>
      </div>

      {/* hover actions */}
      <div style={{
        display:"flex", alignItems:"center", gap:5,
        padding:"12px 13px 12px 6px", flexShrink:0,
        opacity: hov ? 1 : 0, transition:"opacity .15s",
      }}>
        {!n.read && (
          <button title="Mark read" onClick={() => onRead(n.id)} style={{
            width:24, height:24, borderRadius:7, border:`1px solid #05996922`,
            background:"#05996912", cursor:"pointer", color:"#059669",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}><Eye size={11}/></button>
        )}
        <button title="Delete" onClick={() => onDelete(n.id)} style={{
          width:24, height:24, borderRadius:7, border:`1px solid #dc262622`,
          background:"#dc262612", cursor:"pointer", color:"#dc2626",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}><X size={11}/></button>
      </div>
    </motion.div>
  );
}

/* ══ MAIN PAGE ═══════════════════════════════════════════════════════════════════
   KEY FIXES:
   1. NO 100vw/100vh — uses height:"100%" to fill parent content area only
   2. NO duplicate topbar — removed the app-shell-level header
   3. Only the LIST section scrolls (flex:1 + overflowY:auto)
   4. Everything else (sub-header, stats, pills) is fixed/sticky within the panel
*/
export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(SAMPLE);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);

  // Load real notifications from backend, fallback to SAMPLE
  useEffect(() => {
    notifApi.list()
      .then(r => { if (r.data?.length) setNotifs(r.data); })
      .catch(() => {}); // keep SAMPLE on error
  }, []);

  const markRead = id => {
    notifApi.markRead(id).catch(() => {});
    setNotifs(n => n.map(x => x.id===id||x._id===id ? {...x,read:true} : x));
  };
  const markAll  = () => {
    notifApi.markAllRead().catch(() => {});
    setNotifs(n => n.map(x => ({...x,read:true})));
  };
  const delNotif = id => {
    notifApi.delete(id).catch(() => {});
    setNotifs(n => n.filter(x => x.id!==id && x._id!==id));
  };
  const clearAll = () => setNotifs([]);

  const unread = notifs.filter(n => !n.read).length;

  const filtered = notifs.filter(n => {
    const mf = filter==="all" ? true : filter==="unread" ? !n.read : filter==="read" ? n.read : n.type===filter;
    const ms = !search || n.title.toLowerCase().includes(search.toLowerCase()) || (n.message||"").toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const pills = ["all","unread","read",...Object.keys(TYPE)];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spinCW  { to { transform: rotate(360deg);  } }
        @keyframes spinCCW { to { transform: rotate(-360deg); } }
        .nscroll::-webkit-scrollbar { width:4px }
        .nscroll::-webkit-scrollbar-thumb { background:rgba(201,119,0,.2); border-radius:10px }
        .nscroll::-webkit-scrollbar-track { background:transparent }
        .nscroll { scrollbar-width:thin; scrollbar-color:rgba(201,119,0,.2) transparent }
      `}</style>

      {/* ROOT — fills the content area that the sidebar layout provides */}
      <div style={{
        width:"100%",
        height:"100%",
        display:"flex",
        flexDirection:"column",
        background:`linear-gradient(150deg,${T.bg} 0%,${T.bg2} 55%,#FEF3C0 100%)`,
        fontFamily:"'DM Sans',sans-serif",
        position:"relative",
        overflow:"hidden",
      }}>

        {/* decorative bg chakras */}
        <div style={{ position:"absolute", bottom:-200, right:-200, animation:"spinCW 160s linear infinite", zIndex:0, pointerEvents:"none", opacity:.03 }}>
          <Chakra size={480} opacity={1}/>
        </div>
        <div style={{ position:"absolute", top:-150, left:-150, animation:"spinCCW 220s linear infinite", zIndex:0, pointerEvents:"none", opacity:.025 }}>
          <Chakra size={360} opacity={1}/>
        </div>

        {/* ── SUB-HEADER (lives INSIDE the content panel, not duplicating the app shell) ── */}
        <div style={{
          flexShrink:0, zIndex:2, position:"relative",
          borderBottom:`1px solid ${T.lineB}`,
          background:"rgba(255,252,240,.88)",
          backdropFilter:"blur(16px)",
          padding:"0 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          height:54,
        }}>
          {/* left: title + unread badge */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ lineHeight:0, opacity:.75 }}><Chakra size={26} opacity={1}/></div>
            <div>
              <div style={{ fontSize:8, color:T.paleXL, fontFamily:"Cinzel,serif", letterSpacing:".2em", textTransform:"uppercase" }}>
                सूचनाएं · ॐ
              </div>
              <div style={{ fontSize:13.5, fontWeight:700, color:T.deep, fontFamily:"Cinzel,serif", lineHeight:1.1 }}>
                Notifications
              </div>
            </div>
            {unread > 0 && (
              <motion.span initial={{scale:0}} animate={{scale:1}} style={{
                background:`linear-gradient(135deg,${T.gold},${T.goldL})`,
                color:"#fff", fontSize:10.5, fontWeight:700,
                padding:"3px 10px", borderRadius:100,
                boxShadow:`0 3px 12px rgba(201,119,0,.35)`,
              }}>{unread} unread</motion.span>
            )}
          </div>

          {/* center: search */}
          <div style={{
            display:"flex", alignItems:"center", gap:7,
            background: searchFocus ? T.bgCard : "rgba(255,253,248,.7)",
            border:`1px solid ${searchFocus ? T.gold : T.line}`,
            borderRadius:10, padding:"6px 12px",
            boxShadow: searchFocus ? `0 0 0 3px rgba(201,119,0,.1)` : "none",
            transition:"all .18s", width:220,
          }}>
            <Search size={12} color={searchFocus ? T.gold : T.pale}/>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              onFocus={()=>setSearchFocus(true)} onBlur={()=>setSearchFocus(false)}
              placeholder="Search…"
              style={{
                border:"none", background:"transparent", outline:"none",
                fontSize:12, color:T.deep, fontFamily:"'DM Sans',sans-serif", width:"100%",
              }}
            />
            {search && (
              <button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:T.pale,display:"flex",padding:0}}>
                <X size={10}/>
              </button>
            )}
          </div>

          {/* right: actions */}
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            {unread > 0 && (
              <motion.button whileTap={{scale:.97}} onClick={markAll} style={{
                display:"flex", alignItems:"center", gap:5,
                padding:"6px 13px",
                background:`linear-gradient(135deg,rgba(201,119,0,.13),rgba(232,146,10,.08))`,
                border:`1px solid ${T.lineB}`, borderRadius:9, cursor:"pointer",
                fontSize:11.5, color:T.muted, fontFamily:"'DM Sans',sans-serif", fontWeight:600,
              }}>
                <CheckCheck size={11} color={T.gold}/> Mark all read
              </motion.button>
            )}
            <motion.button whileTap={{scale:.97}} onClick={clearAll} style={{
              display:"flex", alignItems:"center", gap:5,
              padding:"6px 11px",
              background:"rgba(255,253,248,.8)",
              border:`1px solid ${T.line}`, borderRadius:9, cursor:"pointer",
              fontSize:11.5, color:T.pale, fontFamily:"'DM Sans',sans-serif",
            }}>
              <Archive size={11}/> Clear all
            </motion.button>
          </div>
        </div>

        {/* ── STAT STRIP ─────────────────────────────────────────────────────── */}
        {notifs.length > 0 && (
          <motion.div
            initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:.07}}
            style={{
              flexShrink:0, display:"flex", gap:10,
              padding:"12px 24px",
              borderBottom:`1px solid ${T.line}`,
              background:"rgba(255,252,240,.55)",
              zIndex:1, position:"relative",
            }}
          >
            <StatCard label="Total"  value={notifs.length}                       color={T.gold}   icon={Bell}         sub="all"/>
            <StatCard label="Unread" value={unread}                              color={T.goldL}  icon={EyeOff}       sub="pending"/>
            <StatCard label="Read"   value={notifs.length-unread}                color="#059669"  icon={CheckCircle}  sub="seen"/>
            <StatCard label="Types"  value={new Set(notifs.map(n=>n.type)).size} color="#7c3aed"  icon={Star}         sub="categories"/>
          </motion.div>
        )}

        {/* ── FILTER PILLS ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.1}}
          style={{
            flexShrink:0,
            display:"flex", gap:6, flexWrap:"wrap", alignItems:"center",
            padding:"10px 24px",
            borderBottom:`1px solid ${T.line}`,
            background:"rgba(255,252,240,.45)",
            zIndex:1, position:"relative",
          }}
        >
          {pills.map(f => (
            <Pill key={f} label={f.charAt(0).toUpperCase()+f.slice(1)} active={filter===f} onClick={()=>setFilter(f)}/>
          ))}
          {(search || filter!=="all") && (
            <span style={{ marginLeft:"auto", fontSize:10.5, color:T.paleXL }}>
              {filtered.length} of {notifs.length} shown
            </span>
          )}
        </motion.div>

        {/* ── LIST (only this section scrolls) ───────────────────────────────── */}
        <div
          className="nscroll"
          style={{
            flex:1,
            overflowY:"auto",
            overflowX:"hidden",
            padding:"14px 24px 20px",
            position:"relative",
            zIndex:1,
          }}
        >
          {/* empty */}
          {!filtered.length && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ textAlign:"center", padding:"50px 0" }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:14, opacity:.1 }}>
                <Chakra size={80} opacity={1}/>
              </div>
              <h3 style={{ fontSize:16, fontWeight:800, color:T.deep, fontFamily:"Cinzel,serif", marginBottom:6 }}>
                {search ? "No results found" : "All clear"}
              </h3>
              <p style={{ fontSize:12.5, color:T.pale }}>
                {search ? `Nothing matches "${search}"` : "You're all caught up. ॐ शान्तिः"}
              </p>
            </motion.div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((n,i) => (
                <NotifRow key={n.id} n={n} idx={i} onRead={markRead} onDelete={delNotif}/>
              ))}
            </AnimatePresence>
          </div>

          {notifs.length > 0 && filtered.length > 0 && (
            <div style={{ textAlign:"center", marginTop:24, paddingTop:14, borderTop:`1px solid ${T.line}` }}>
              <p style={{ fontSize:9, color:T.paleXL, fontFamily:"Cinzel,serif", letterSpacing:".14em" }}>
                ॐ नमो भगवते वासुदेवाय — Sudharshan AI Enterprise v3.0
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
