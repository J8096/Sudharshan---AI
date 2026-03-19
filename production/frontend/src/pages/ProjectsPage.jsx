import { useState, useRef, useEffect, useCallback } from "react";
import {
  LayoutGrid, List, BarChart2, Plus, Search, Home, Pencil, Trash2,
  Calendar, CheckCircle2, Circle, AlertCircle, Loader2, Eye, X,
  Rocket, Monitor, Smartphone, Star, Shield, Globe, Zap, Database,
  Code2, Layers, Target, TrendingUp, Package, Cpu, Lock, Hash,
  Check, ArrowRight, ArrowUp, ArrowDown, Minus,
  Info, AlertTriangle, FolderOpen, Activity
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════
const T = {
  gold: "#B8860B", goldL: "#D4A017", goldB: "#E8B84B", goldD: "#8B6508",
  cream: "#FDFAF0", creamD: "#F7F0D8", creamDD: "#EEE4C4",
  dark: "#1A0F00", mid: "#3D2200", muted: "#8B6E3A", faint: "#BDAA80",
  border: "rgba(184,134,11,0.18)", borderM: "rgba(184,134,11,0.32)",
  purple: "#6D28D9", green: "#047857", amber: "#B45309", red: "#B91C1C", blue: "#0369A1",
  shadow: "0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(184,134,11,.08)",
  shadowM: "0 4px 24px rgba(184,134,11,.14), 0 1px 4px rgba(0,0,0,.08)",
  shadowL: "0 12px 48px rgba(184,134,11,.18), 0 2px 8px rgba(0,0,0,.1)",
};

const STATUSES = [
  { id: "backlog", label: "Backlog", hex: "#94A3B8", bg: "rgba(148,163,184,.1)", Icon: Circle },
  { id: "todo", label: "To Do", hex: T.gold, bg: "rgba(184,134,11,.1)", Icon: Hash },
  { id: "in-progress", label: "In Progress", hex: T.amber, bg: "rgba(180,83,9,.1)", Icon: Loader2 },
  { id: "review", label: "Review", hex: T.purple, bg: "rgba(109,40,217,.1)", Icon: Eye },
  { id: "done", label: "Done", hex: T.green, bg: "rgba(4,120,87,.1)", Icon: CheckCircle2 },
];

const PRIORITIES = [
  { id: "low", label: "Low", hex: "#64748B", Icon: ArrowDown },
  { id: "medium", label: "Medium", hex: T.gold, Icon: Minus },
  { id: "high", label: "High", hex: T.amber, Icon: ArrowUp },
  { id: "critical", label: "Critical", hex: T.red, Icon: AlertCircle },
];

const P_COLORS = [T.gold, "#6D28D9", "#047857", "#0369A1", "#B91C1C", "#B45309", "#BE185D", "#4F46E5"];

const PROJECT_ICONS = [
  Rocket, Monitor, Smartphone, Star, Shield, Globe, Zap, Database,
  Code2, Layers, Target, TrendingUp, Package, Cpu, Lock, Activity
];

const PROJ_STATUS_MAP = {
  active: { c: "#047857", bg: "rgba(4,120,87,.08)", label: "Active" },
  "on-hold": { c: "#B45309", bg: "rgba(180,83,9,.08)", label: "On Hold" },
  completed: { c: "#6D28D9", bg: "rgba(109,40,217,.08)", label: "Completed" },
  cancelled: { c: "#B91C1C", bg: "rgba(185,28,28,.08)", label: "Cancelled" },
};

let _uid = 9000;
const uid = () => ++_uid;
const pct = ts => ts?.length ? Math.round(ts.filter(t => t.status === "done").length / ts.length * 100) : 0;
const fmtD = d => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const statusOf = id => STATUSES.find(s => s.id === id) || STATUSES[0];
const priOf = id => PRIORITIES.find(p => p.id === id) || PRIORITIES[1];
const todayISO = () => new Date().toISOString().slice(0, 10);

// ═══════════════════════════════════════════════════════════════════
// SEED DATA — iconIndex references PROJECT_ICONS array index
// ═══════════════════════════════════════════════════════════════════
const SEED = [
  {
    id: 1, title: "Sudharshan AI Platform", iconIndex: 0, color: T.gold,
    description: "Core AI infrastructure rebuild and model integration pipeline",
    status: "active", priority: "critical", created: "2024-01-15", due: "2024-12-31", members: ["AJ", "PS", "RV"],
    tasks: [
      { id: 101, title: "Vector database architecture", status: "done", priority: "high", assignee: "AJ", labels: ["infra"], due: "2024-02-01" },
      { id: 102, title: "Claude API endpoint integration", status: "done", priority: "critical", assignee: "PS", labels: ["backend", "AI"], due: "2024-02-10" },
      { id: 103, title: "Prompt management interface", status: "in-progress", priority: "high", assignee: "AJ", labels: ["frontend"], due: "2024-03-01" },
      { id: 104, title: "Token streaming UI component", status: "in-progress", priority: "medium", assignee: "PS", labels: ["frontend", "AI"], due: "2024-03-15" },
      { id: 105, title: "REST API documentation", status: "todo", priority: "medium", assignee: "RV", labels: ["docs"], due: "2024-04-01" },
      { id: 106, title: "Load testing & benchmarks", status: "todo", priority: "high", assignee: "AJ", labels: ["infra"], due: "2024-04-15" },
      { id: 107, title: "Penetration security audit", status: "review", priority: "critical", assignee: "PS", labels: ["security"], due: "2024-03-20" },
      { id: 108, title: "Monitoring & alerting setup", status: "backlog", priority: "medium", assignee: "RV", labels: ["infra", "ops"], due: "2024-05-01" },
    ]
  },
  {
    id: 2, title: "Enterprise Dashboard", iconIndex: 1, color: "#6D28D9",
    description: "Real-time analytics and reporting for enterprise clients",
    status: "active", priority: "high", created: "2024-02-01", due: "2024-10-30", members: ["MR", "SL"],
    tasks: [
      { id: 201, title: "Design system token library", status: "done", priority: "medium", assignee: "MR", labels: ["design"], due: "2024-03-01" },
      { id: 202, title: "Recharts component suite", status: "done", priority: "high", assignee: "MR", labels: ["frontend"], due: "2024-03-15" },
      { id: 203, title: "Real-time WebSocket pipeline", status: "in-progress", priority: "critical", assignee: "SL", labels: ["backend", "data"], due: "2024-04-01" },
      { id: 204, title: "PDF & CSV export engine", status: "todo", priority: "medium", assignee: "MR", labels: ["feature"], due: "2024-05-01" },
      { id: 205, title: "Mobile responsive layout", status: "review", priority: "high", assignee: "SL", labels: ["frontend", "mobile"], due: "2024-04-10" },
    ]
  },
  {
    id: 3, title: "Mobile App Redesign", iconIndex: 2, color: "#047857",
    description: "Complete iOS/Android redesign with new navigation patterns",
    status: "on-hold", priority: "medium", created: "2024-03-01", due: "2025-02-28", members: ["AP", "LF"],
    tasks: [
      { id: 301, title: "User research & interviews", status: "done", priority: "medium", assignee: "LF", labels: ["research"], due: "2024-04-01" },
      { id: 302, title: "Wireframe iteration v2", status: "done", priority: "medium", assignee: "AP", labels: ["design"], due: "2024-04-15" },
      { id: 303, title: "High-fidelity Figma mockups", status: "in-progress", priority: "high", assignee: "AP", labels: ["design"], due: "2024-05-01" },
      { id: 304, title: "Prototype usability testing", status: "backlog", priority: "low", assignee: "LF", labels: ["testing", "ux"], due: "2024-06-01" },
    ]
  },
];

// ═══════════════════════════════════════════════════════════════════
// MICRO ATOMS
// ═══════════════════════════════════════════════════════════════════
const Divider = ({ v = false, style = {} }) => (
  <div style={{ [v ? "width" : "height"]: 1, background: T.border, flexShrink: 0, ...style }} />
);

function Avatar({ initials, color = T.gold, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * .3, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `${color}22`, border: `1px solid ${color}44`,
      color, fontWeight: 800, fontSize: size * .32, fontFamily: "'Cinzel',serif", letterSpacing: .3
    }}>{initials}</div>
  );
}

function Chip({ label, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9.5, fontWeight: 600,
      padding: "2px 7px", borderRadius: 99, background: `${color}14`, color,
      border: `1px solid ${color}28`, letterSpacing: .2, whiteSpace: "nowrap"
    }}>{label}</span>
  );
}

function ProgressBar({ value, height = 4, color = T.gold, track = "rgba(184,134,11,.1)" }) {
  return (
    <div style={{ height, background: track, borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
      <div style={{
        height: "100%", width: `${Math.max(0, Math.min(100, value))}%`,
        background: `linear-gradient(90deg,${color},${T.goldB})`,
        borderRadius: 99, transition: "width .7s cubic-bezier(.16,1,.3,1)"
      }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const s = statusOf(status);
  const Icon = s.Icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700,
      padding: "3px 8px", borderRadius: 99, background: s.bg, color: s.hex,
      border: `1px solid ${s.hex}28`
    }}>
      <Icon size={9} strokeWidth={2.5} />
      {s.label}
    </span>
  );
}

function PriBadge({ priority }) {
  const p = priOf(priority);
  const Icon = p.Icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700,
      padding: "3px 8px", borderRadius: 99, background: `${p.hex}12`, color: p.hex,
      border: `1px solid ${p.hex}28`
    }}>
      <Icon size={9} strokeWidth={2.5} />
      {p.label}
    </span>
  );
}

function ProjStatusChip({ s }) {
  const o = PROJ_STATUS_MAP[s] || PROJ_STATUS_MAP.active;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700,
      padding: "3px 9px", borderRadius: 99, background: o.bg, color: o.c,
      border: `1px solid ${o.c}28`
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: o.c, display: "inline-block" }} />
      {o.label}
    </span>
  );
}

function ProjectIcon({ iconIndex, color, size = 20 }) {
  const Ic = PROJECT_ICONS[iconIndex ?? 0] || Folder;
  return <Ic size={size} color={color || T.gold} strokeWidth={1.8} />;
}

// ═══════════════════════════════════════════════════════════════════
// CHAKRA (decorative)
// ═══════════════════════════════════════════════════════════════════
function Chakra({ size = 80, opacity = 1, spin = false }) {
  const sp = Array.from({ length: 16 }, (_, i) => {
    const a = (i * 22.5 * Math.PI) / 180;
    return { x1: 50 + 20 * Math.cos(a), y1: 50 + 20 * Math.sin(a), x2: 50 + 42 * Math.cos(a), y2: 50 + 42 * Math.sin(a) };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ opacity, display: "block", animation: spin ? "chakraSpin 90s linear infinite" : undefined, flexShrink: 0 }}>
      <circle cx="50" cy="50" r="47" fill="none" stroke={T.gold} strokeWidth=".8" />
      <circle cx="50" cy="50" r="30" fill="none" stroke={T.gold} strokeWidth=".4" />
      <circle cx="50" cy="50" r="16" fill="none" stroke={T.gold} strokeWidth=".4" />
      {sp.map((p, i) => <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={T.gold} strokeWidth="1.1" strokeLinecap="round" />)}
      <circle cx="50" cy="50" r="4.5" fill={T.gold} />
      <circle cx="50" cy="50" r="2" fill="#FFD060" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════
function useToast() {
  const [list, setList] = useState([]);
  const add = useCallback(({ type = "info", title, msg = "" }) => {
    const id = uid();
    setList(l => [...l, { id, type, title, msg }]);
    setTimeout(() => setList(l => l.filter(x => x.id !== id)), 3800);
  }, []);
  return { list, add, remove: id => setList(l => l.filter(x => x.id !== id)) };
}

function ToastStack({ list, remove }) {
  if (!list.length) return null;
  const icons = { success: <Check size={15} color={T.green} />, error: <X size={15} color={T.red} />, info: <Info size={15} color={T.gold} /> };
  const colors = { success: T.green, error: T.red, info: T.gold };
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {list.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
          borderRadius: 14, minWidth: 260, maxWidth: 340,
          background: "rgba(253,250,240,.97)", backdropFilter: "blur(12px)",
          border: `1px solid ${colors[t.type] || T.border}44`,
          boxShadow: T.shadowL, animation: "toastIn .32s cubic-bezier(.16,1,.3,1)"
        }}>
          <span style={{ flexShrink: 0 }}>{icons[t.type] || icons.info}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: T.dark, marginBottom: t.msg ? 2 : 0 }}>{t.title}</div>
            {t.msg && <div style={{ fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.msg}</div>}
          </div>
          <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, padding: "0 2px", display: "flex" }}>
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL SHELL
// ═══════════════════════════════════════════════════════════════════
function Modal({ onClose, children, width = 480 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(26,15,0,.48)", backdropFilter: "blur(6px)",
      zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: "100%", maxWidth: width,
        background: `linear-gradient(160deg,${T.cream},${T.creamD})`,
        borderRadius: 22, overflow: "hidden", border: `1px solid ${T.borderM}`,
        boxShadow: T.shadowL, animation: "modalIn .28s cubic-bezier(.16,1,.3,1)"
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg,${T.gold},${T.goldB})` }} />
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONFIRM DIALOG
// ═══════════════════════════════════════════════════════════════════
function Confirm({ data, onCancel }) {
  if (!data) return null;
  return (
    <Modal onClose={onCancel} width={360}>
      <div style={{ padding: "28px 26px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          {data.danger
            ? <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(185,28,28,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={24} color={T.red} />
            </div>
            : <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(184,134,11,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Info size={24} color={T.gold} />
            </div>
          }
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: T.dark, fontFamily: "'Cinzel',serif", marginBottom: 8 }}>{data.title}</h3>
        <p style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.7, marginBottom: 22 }}>{data.body}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px", borderRadius: 11, border: `1px solid ${T.border}`,
            background: "transparent", color: T.mid, fontSize: 12.5, fontWeight: 700, cursor: "pointer"
          }}>Cancel</button>
          <button onClick={data.onOk} style={{
            flex: 1, padding: "10px", borderRadius: 11, border: "none",
            background: data.danger ? "linear-gradient(135deg,#B91C1C,#EF4444)" : `linear-gradient(135deg,${T.gold},${T.goldB})`,
            color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer",
            boxShadow: data.danger ? "0 4px 14px rgba(185,28,28,.35)" : T.shadowM
          }}>{data.ok || "Confirm"}</button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FIELD HELPER
// ═══════════════════════════════════════════════════════════════════
function Field({ label, children, half = false, full = false }) {
  return (
    <div style={{ gridColumn: full ? "1/-1" : half ? "auto" : "1/-1" }}>
      <label style={{
        display: "block", fontSize: 9.5, fontWeight: 800, color: T.muted,
        textTransform: "uppercase", letterSpacing: .6, marginBottom: 6
      }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 10, boxSizing: "border-box",
  border: `1px solid ${T.border}`, background: "rgba(253,250,240,.8)",
  fontSize: 12.5, color: T.dark, outline: "none", fontFamily: "inherit", transition: "border-color .15s"
};

// ═══════════════════════════════════════════════════════════════════
// PROJECT MODAL
// ═══════════════════════════════════════════════════════════════════
function ProjectModal({ project, onClose, onSave }) {
  const isEdit = !!project;
  const [form, setForm] = useState(project || {
    title: "", description: "", iconIndex: 0, color: T.gold,
    priority: "medium", status: "active", due: ""
  });
  const [err, setErr] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function submit() {
    if (!form.title.trim()) { setErr("Project name is required."); return; }
    onSave({ ...form, id: project?.id || uid(), tasks: project?.tasks || [], created: project?.created || todayISO(), members: project?.members || [] });
    onClose();
  }

  return (
    <Modal onClose={onClose} width={520}>
      <div style={{ padding: "24px 26px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 9, color: "rgba(184,134,11,.5)", fontFamily: "'Cinzel',serif", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 3 }}>
              {isEdit ? "परियोजना सम्पादन" : "नवीन परियोजना"}
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: T.dark, fontFamily: "'Cinzel',serif" }}>
              {isEdit ? "Edit Project" : "New Project"}
            </h2>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 9, border: `1px solid ${T.border}`,
            background: T.creamDD, color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}><X size={14} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field full label="Project Name *">
            <input value={form.title} onChange={e => { set("title", e.target.value); setErr(""); }}
              placeholder="e.g. Platform Redesign 2025"
              style={{ ...inputStyle, borderColor: err ? "#FCA5A5" : T.border }} />
            {err && <p style={{ fontSize: 10.5, color: T.red, marginTop: 4 }}>⚠ {err}</p>}
          </Field>
          <Field full label="Description">
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="What is this project about?" rows={2}
              style={{ ...inputStyle, resize: "none" }} />
          </Field>
          <Field half label="Priority">
            <select value={form.priority} onChange={e => set("priority", e.target.value)} style={inputStyle}>
              {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </Field>
          <Field half label="Status">
            <select value={form.status} onChange={e => set("status", e.target.value)} style={inputStyle}>
              {["active", "on-hold", "completed", "cancelled"].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field half label="Due Date">
            <input type="date" value={form.due || ""} onChange={e => set("due", e.target.value)} style={inputStyle} />
          </Field>
          <Field half label="Accent Color">
            <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 4 }}>
              {P_COLORS.map(c => (
                <button key={c} onClick={() => set("color", c)}
                  style={{
                    width: 24, height: 24, borderRadius: "50%", background: c, border: "none", cursor: "pointer", flexShrink: 0,
                    boxShadow: form.color === c ? `0 0 0 2.5px ${T.cream}, 0 0 0 4.5px ${c}` : "none",
                    transform: form.color === c ? "scale(1.2)" : "scale(1)", transition: "all .15s"
                  }} />
              ))}
            </div>
          </Field>
          <Field full label="Icon">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PROJECT_ICONS.map((Ic, idx) => (
                <button key={idx} onClick={() => set("iconIndex", idx)}
                  style={{
                    width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    background: form.iconIndex === idx ? "rgba(184,134,11,.18)" : T.creamDD,
                    border: form.iconIndex === idx ? `2px solid ${T.gold}` : `1px solid ${T.border}`,
                    cursor: "pointer", transition: "all .14s"
                  }}>
                  <Ic size={16} color={form.iconIndex === idx ? T.gold : T.muted} strokeWidth={1.8} />
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px", borderRadius: 12, border: `1px solid ${T.border}`,
            background: "transparent", color: T.mid, fontSize: 12.5, fontWeight: 700, cursor: "pointer"
          }}>Cancel</button>
          <button onClick={submit} style={{
            flex: 2, padding: "11px", borderRadius: 12, border: "none",
            background: `linear-gradient(135deg,${T.gold},${T.goldB})`, color: "#fff",
            fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "'Cinzel',serif",
            boxShadow: "0 4px 18px rgba(184,134,11,.36)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}>
            {isEdit ? "Save Changes" : "Create Project"}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TASK MODAL
// ═══════════════════════════════════════════════════════════════════
function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({ ...task, _labs: (task.labels || []).join(", ") });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  function submit() {
    if (!form.title?.trim()) return;
    const labels = form._labs ? form._labs.split(",").map(x => x.trim()).filter(Boolean) : [];
    onSave({ ...form, labels }); onClose();
  }
  return (
    <Modal onClose={onClose} width={440}>
      <div style={{ padding: "22px 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: T.dark, fontFamily: "'Cinzel',serif" }}>Edit Task</h3>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`,
            background: T.creamDD, color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}><X size={13} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field full label="Title">
            <input value={form.title || ""} onChange={e => set("title", e.target.value)} placeholder="Task title" style={inputStyle} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field half label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value)} style={inputStyle}>
                {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field half label="Priority">
              <select value={form.priority} onChange={e => set("priority", e.target.value)} style={inputStyle}>
                {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>
            <Field half label="Assignee">
              <input value={form.assignee || ""} onChange={e => set("assignee", e.target.value)} placeholder="AJ" style={inputStyle} />
            </Field>
            <Field half label="Due Date">
              <input type="date" value={form.due || ""} onChange={e => set("due", e.target.value)} style={inputStyle} />
            </Field>
          </div>
          <Field full label="Labels (comma-separated)">
            <input value={form._labs || ""} onChange={e => set("_labs", e.target.value)} placeholder="frontend, backend, AI" style={inputStyle} />
          </Field>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 11, border: `1px solid ${T.border}`, background: "transparent", color: T.mid, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} style={{ flex: 2, padding: "10px", borderRadius: 11, border: "none", background: `linear-gradient(135deg,${T.gold},${T.goldB})`, color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer", boxShadow: T.shadowM }}>Save Changes</button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ADD TASK MODAL (full form)
// ═══════════════════════════════════════════════════════════════════
function AddTaskModal({ onSave, onClose, defaultStatus = "todo" }) {
  const [form, setForm] = useState({ title: "", status: defaultStatus, priority: "medium", assignee: "", labels: "", due: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  function submit() {
    if (!form.title.trim()) return;
    const labels = form.labels ? form.labels.split(",").map(x => x.trim()).filter(Boolean) : [];
    onSave({ id: uid(), ...form, labels });
    onClose();
  }
  return (
    <Modal onClose={onClose} width={440}>
      <div style={{ padding: "22px 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: T.dark, fontFamily: "'Cinzel',serif" }}>New Task</h3>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`, background: T.creamDD, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} color={T.muted} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field full label="Title *">
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Task title" style={inputStyle} autoFocus />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field half label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value)} style={inputStyle}>
                {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field half label="Priority">
              <select value={form.priority} onChange={e => set("priority", e.target.value)} style={inputStyle}>
                {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>
            <Field half label="Assignee">
              <input value={form.assignee} onChange={e => set("assignee", e.target.value)} placeholder="AJ" style={inputStyle} />
            </Field>
            <Field half label="Due Date">
              <input type="date" value={form.due} onChange={e => set("due", e.target.value)} style={inputStyle} />
            </Field>
          </div>
          <Field full label="Labels (comma-separated)">
            <input value={form.labels} onChange={e => set("labels", e.target.value)} placeholder="frontend, backend, AI" style={inputStyle} />
          </Field>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 11, border: `1px solid ${T.border}`, background: "transparent", color: T.mid, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={!form.title.trim()} style={{
            flex: 2, padding: "10px", borderRadius: 11, border: "none",
            background: form.title.trim() ? `linear-gradient(135deg,${T.gold},${T.goldB})` : "rgba(184,134,11,.2)",
            color: form.title.trim() ? "#fff" : "rgba(184,134,11,.4)", fontSize: 12.5, fontWeight: 800,
            cursor: form.title.trim() ? "pointer" : "default", boxShadow: form.title.trim() ? T.shadowM : "none"
          }}>Add Task</button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
// KANBAN CARD
// ═══════════════════════════════════════════════════════════════════
function KanbanCard({ task, onUpdate, onDelete, onEdit }) {
  const [hov, setHov] = useState(false);
  const s = statusOf(task.status), p = priOf(task.priority);
  const PIcon = p.Icon;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: "linear-gradient(145deg,#FDFAF0,#F9F3E0)",
        border: `1px solid ${hov ? T.borderM : T.border}`, borderRadius: 14,
        padding: "13px 14px", position: "relative", overflow: "hidden", cursor: "default",
        boxShadow: hov ? T.shadowM : T.shadow, transition: "all .18s"
      }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: s.hex, borderRadius: "14px 0 0 14px" }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 9, paddingLeft: 8 }}>
        <p style={{
          flex: 1, fontSize: 12.5, fontWeight: 600, color: T.dark, lineHeight: 1.45,
          textDecoration: task.status === "done" ? "line-through" : "none",
          opacity: task.status === "done" ? .5 : 1
        }}>{task.title}</p>
        <div style={{ display: "flex", gap: 3, opacity: hov ? 1 : 0, transition: "opacity .15s", flexShrink: 0 }}>
          <button onClick={() => onEdit(task)}
            style={{
              width: 24, height: 24, borderRadius: 6, border: `1px solid ${T.border}`,
              background: T.cream, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.muted
            }}>
            <Pencil size={10} />
          </button>
          <button onClick={() => onDelete(task.id)}
            style={{
              width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(185,28,28,.2)",
              background: "rgba(185,28,28,.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.red
            }}>
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10, paddingLeft: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9.5, fontWeight: 700,
          padding: "2px 7px", borderRadius: 99, background: `${p.hex}12`, color: p.hex, border: `1px solid ${p.hex}28`
        }}>
          <PIcon size={8} strokeWidth={2.5} />{p.label}
        </span>
        {task.labels?.slice(0, 2).map(l => <Chip key={l} label={l} color={T.gold} />)}
      </div>

      <div style={{ paddingLeft: 8 }}>
        <select value={task.status} onChange={e => onUpdate(task.id, { status: e.target.value })}
          style={{
            width: "100%", fontSize: 11, padding: "5px 9px", borderRadius: 8,
            border: `1px solid ${s.hex}30`, background: s.bg, color: s.hex,
            outline: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700
          }}>
          {STATUSES.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
        </select>
      </div>

      {(task.assignee || task.due) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, paddingLeft: 8, fontSize: 10, color: T.faint }}>
          {task.assignee && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Avatar initials={task.assignee.slice(0, 2)} color={T.gold} size={18} />
              <span>{task.assignee}</span>
            </div>
          )}
          {task.due && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={9} />
              <span>{task.due}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// KANBAN BOARD
// ═══════════════════════════════════════════════════════════════════
function KanbanBoard({ tasks, onAdd, onUpdate, onDelete, onEdit }) {
  const [addingCol, setAddingCol] = useState(null);

  function handleAddTask(task) {
    onAdd(task);
    setAddingCol(null);
  }

  return (
    <>
      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, paddingTop: 2, minHeight: 280 }}>
        {STATUSES.map(st => {
          const col = tasks.filter(t => t.status === st.id);
          const ColIcon = st.Icon;
          return (
            <div key={st.id} style={{ flexShrink: 0, width: 240, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 2px" }}>
                <ColIcon size={12} color={st.hex} strokeWidth={2.5} />
                <span style={{ fontSize: 12, fontWeight: 800, color: T.dark, fontFamily: "'Cinzel',serif", flex: 1, letterSpacing: ".03em" }}>{st.label}</span>
                <div style={{ background: st.hex, color: "white", fontSize: 10, fontWeight: 800, padding: "2px 9px", borderRadius: 99, lineHeight: 1.4 }}>{col.length}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                {col.map(t => (
                  <KanbanCard key={t.id} task={t} onUpdate={onUpdate} onDelete={onDelete} onEdit={onEdit} />
                ))}
                <button onClick={() => setAddingCol(st.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "9px 12px",
                    background: "rgba(184,134,11,.04)", border: `1px dashed rgba(184,134,11,.22)`,
                    borderRadius: 12, cursor: "pointer", fontSize: 11.5, color: T.faint,
                    fontFamily: "inherit", transition: "all .16s", marginTop: col.length ? 2 : 0
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(184,134,11,.1)"; e.currentTarget.style.borderColor = "rgba(184,134,11,.4)"; e.currentTarget.style.color = T.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(184,134,11,.04)"; e.currentTarget.style.borderColor = "rgba(184,134,11,.22)"; e.currentTarget.style.color = T.faint; }}>
                  <Plus size={14} />  Add task
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {addingCol && (
        <AddTaskModal
          defaultStatus={addingCol}
          onSave={handleAddTask}
          onClose={() => setAddingCol(null)}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LIST VIEW
// ═══════════════════════════════════════════════════════════════════
function ListView({ tasks, onAdd, onUpdate, onDelete, onEdit }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [stF, setStF] = useState("");
  const [prF, setPrF] = useState("");
  const [q, setQ] = useState("");
  const shown = tasks
    .filter(t => !stF || t.status === stF)
    .filter(t => !prF || t.priority === prF)
    .filter(t => !q || t.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: .4, pointerEvents: "none" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tasks…"
            style={{ ...inputStyle, paddingLeft: 30, width: 200 }} />
        </div>
        <select value={stF} onChange={e => setStF(e.target.value)}
          style={{ ...inputStyle, width: "auto", cursor: "pointer", color: stF ? T.dark : T.faint }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select value={prF} onChange={e => setPrF(e.target.value)}
          style={{ ...inputStyle, width: "auto", cursor: "pointer", color: prF ? T.dark : T.faint }}>
          <option value="">All Priority</option>
          {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        {(stF || prF || q) && (
          <button onClick={() => { setStF(""); setPrF(""); setQ(""); }}
            style={{ padding: "8px 13px", borderRadius: 10, border: "1px solid rgba(185,28,28,.25)", background: "rgba(185,28,28,.07)", color: T.red, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <X size={11} /> Clear
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowAddModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 11, border: "none",
            background: `linear-gradient(135deg,${T.gold},${T.goldB})`, color: "white",
            fontSize: 12.5, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(184,134,11,.34)", fontFamily: "inherit"
          }}>
          <Plus size={14} /> Add Task
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 110px 100px 52px", gap: 12, padding: "8px 16px", borderRadius: 11, marginBottom: 6, background: `linear-gradient(90deg,rgba(184,134,11,.07),rgba(184,134,11,.04))`, border: `1px solid ${T.border}` }}>
        {["Task", "Status", "Priority", "Due", ""].map((h, i) => (
          <span key={i} style={{ fontSize: 9.5, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: .6, textAlign: i > 0 ? "center" : "left" }}>{h}</span>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {shown.map((t, i) => {
          const so = statusOf(t.status);
          return (
            <div key={t.id}
              style={{
                display: "grid", gridTemplateColumns: "1fr 120px 110px 100px 52px",
                gap: 12, padding: "11px 16px", borderRadius: 13, alignItems: "center",
                background: "linear-gradient(145deg,#FDFAF0,#F9F3E0)",
                border: `1px solid ${T.border}`, boxShadow: T.shadow,
                transition: "all .17s", animation: `fadeUp .35s ${i * .03}s both`
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderM; e.currentTarget.style.boxShadow = T.shadowM; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = T.shadow; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <input type="checkbox" checked={t.status === "done"}
                  onChange={() => onUpdate(t.id, { status: t.status === "done" ? "todo" : "done" })}
                  style={{ width: 15, height: 15, cursor: "pointer", accentColor: T.gold, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: t.status === "done" ? T.muted : T.dark, fontWeight: 500, textDecoration: t.status === "done" ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.title}
                </span>
                {t.labels?.slice(0, 1).map(l => <Chip key={l} label={l} color={T.gold} />)}
              </div>
              <div style={{ textAlign: "center" }}>
                <select value={t.status} onChange={e => onUpdate(t.id, { status: e.target.value })}
                  style={{ fontSize: 10.5, padding: "4px 8px", borderRadius: 8, border: `1px solid ${so.hex}30`, background: so.bg, color: so.hex, outline: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                  {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div style={{ textAlign: "center" }}><PriBadge priority={t.priority} /></div>
              <div style={{ textAlign: "center", fontSize: 10.5, color: T.faint }}>{t.due || "—"}</div>
              <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                <button onClick={() => onEdit(t)} style={{ width: 22, height: 22, borderRadius: 5, border: `1px solid ${T.border}`, background: T.creamDD, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.muted }}>
                  <Pencil size={9} />
                </button>
                <button onClick={() => onDelete(t.id)} style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid rgba(185,28,28,.2)", background: "rgba(185,28,28,.07)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.red }}>
                  <Trash2 size={9} />
                </button>
              </div>
            </div>
          );
        })}
        {shown.length === 0 && (
          <div style={{ textAlign: "center", padding: "56px 0" }}>
            <div style={{ opacity: .06, marginBottom: 14, display: "flex", justifyContent: "center" }}><Chakra size={80} opacity={1} /></div>
            <p style={{ fontSize: 14, fontWeight: 800, color: T.dark, fontFamily: "'Cinzel',serif", marginBottom: 4 }}>No tasks found</p>
            <p style={{ fontSize: 12, color: T.muted }}>Add a task or adjust your filters.</p>
          </div>
        )}
      </div>

      {showAddModal && <AddTaskModal onSave={t => { onAdd(t); setShowAddModal(false); }} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ANALYTICS VIEW
// ═══════════════════════════════════════════════════════════════════
function Analytics({ project }) {
  const tasks = project.tasks || [];
  const total = tasks.length, done = tasks.filter(t => t.status === "done").length;
  const comp = total ? Math.round(done / total * 100) : 0;
  const byS = STATUSES.map(s => ({ ...s, n: tasks.filter(t => t.status === s.id).length }));
  const byP = PRIORITIES.map(p => ({ ...p, n: tasks.filter(t => t.priority === p.id).length }));
  const statCards = [
    { icon: <Layers size={20} />, label: "Total Tasks", val: total, c: T.gold },
    { icon: <CheckCircle2 size={20} />, label: "Completed", val: done, c: T.green },
    { icon: <Loader2 size={20} />, label: "In Progress", val: tasks.filter(t => t.status === "in-progress").length, c: T.amber },
    { icon: <AlertCircle size={20} />, label: "Critical Items", val: tasks.filter(t => t.priority === "critical").length, c: T.red },
    { icon: <Circle size={20} />, label: "Backlog", val: tasks.filter(t => t.status === "backlog").length, c: "#64748B" },
    { icon: <Eye size={20} />, label: "Under Review", val: tasks.filter(t => t.status === "review").length, c: T.purple },
  ];

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background: "linear-gradient(145deg,#FDFAF0,#F9F3E0)", border: `1px solid ${T.border}`,
            borderRadius: 18, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14,
            boxShadow: T.shadow, transition: "all .18s", cursor: "default"
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = T.shadowM}
            onMouseLeave={e => e.currentTarget.style.boxShadow = T.shadow}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: `${s.c}12`, border: `1px solid ${s.c}22`, display: "flex", alignItems: "center", justifyContent: "center", color: s.c, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: T.dark, fontFamily: "'Cinzel',serif", lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "linear-gradient(145deg,#FDFAF0,#F9F3E0)", border: `1px solid ${T.border}`, borderRadius: 18, padding: "20px 22px", marginBottom: 16, boxShadow: T.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: T.dark, fontFamily: "'Cinzel',serif", letterSpacing: ".04em", marginBottom: 2 }}>Overall Completion</p>
            <p style={{ fontSize: 11, color: T.muted }}>{done} of {total} tasks completed</p>
          </div>
          <span style={{ fontSize: 28, fontWeight: 900, color: T.gold, fontFamily: "'Cinzel',serif" }}>{comp}%</span>
        </div>
        <ProgressBar value={comp} height={10} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {[0, 25, 50, 75, 100].map(m => (
            <span key={m} style={{ fontSize: 9, color: comp >= m ? T.gold : T.faint, fontWeight: 700 }}>{m}%</span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: "linear-gradient(145deg,#FDFAF0,#F9F3E0)", border: `1px solid ${T.border}`, borderRadius: 18, padding: "20px 22px", boxShadow: T.shadow }}>
          <h4 style={{ fontSize: 12, fontWeight: 800, color: T.dark, fontFamily: "'Cinzel',serif", marginBottom: 16, letterSpacing: ".04em" }}>By Status</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {byS.map(s => {
              const Icon = s.Icon;
              return (
                <div key={s.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <Icon size={10} color={s.hex} strokeWidth={2.5} />
                      <span style={{ fontSize: 12, color: T.mid }}>{s.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: s.hex }}>{s.n}</span>
                      <span style={{ fontSize: 9.5, color: T.faint }}>{total ? Math.round(s.n / total * 100) : 0}%</span>
                    </div>
                  </div>
                  <ProgressBar value={total ? s.n / total * 100 : 0} height={5} color={s.hex} track={`${s.hex}14`} />
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background: "linear-gradient(145deg,#FDFAF0,#F9F3E0)", border: `1px solid ${T.border}`, borderRadius: 18, padding: "20px 22px", boxShadow: T.shadow }}>
          <h4 style={{ fontSize: 12, fontWeight: 800, color: T.dark, fontFamily: "'Cinzel',serif", marginBottom: 16, letterSpacing: ".04em" }}>By Priority</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {byP.map(p => {
              const Icon = p.Icon;
              return (
                <div key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <Icon size={10} color={p.hex} strokeWidth={2.5} />
                      <span style={{ fontSize: 12, color: T.mid }}>{p.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: p.hex }}>{p.n}</span>
                      <span style={{ fontSize: 9.5, color: T.faint }}>{total ? Math.round(p.n / total * 100) : 0}%</span>
                    </div>
                  </div>
                  <ProgressBar value={total ? p.n / total * 100 : 0} height={5} color={p.hex} track={`${p.hex}14`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════════════
function Overview({ projects, onSelect, onCreate }) {
  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, color: "rgba(184,134,11,.42)", fontFamily: "'Cinzel',serif", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 4 }}>सभी परियोजनाएं</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: T.dark, fontFamily: "'Cinzel',serif" }}>All Projects</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14, marginBottom: 20 }}>
        {projects.map(p => {
          const pc = pct(p.tasks);
          return (
            <div key={p.id} onClick={() => onSelect(p.id)}
              style={{
                background: "linear-gradient(145deg,#FDFAF0,#F9F3E0)",
                border: `1px solid ${T.border}`, borderRadius: 18, padding: "18px 18px",
                cursor: "pointer", boxShadow: T.shadow, transition: "all .2s", position: "relative", overflow: "hidden"
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowM; e.currentTarget.style.borderColor = T.borderM; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadow; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${p.color},${p.color}88)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `${p.color}14`, border: `1px solid ${p.color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ProjectIcon iconIndex={p.iconIndex} color={p.color} size={22} />
                </div>
                <ProjStatusChip s={p.status} />
              </div>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: T.dark, fontFamily: "'Cinzel',serif", marginBottom: 4 }}>{p.title}</h3>
              <p style={{ fontSize: 11, color: T.muted, marginBottom: 12, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.description}</p>
              <ProgressBar value={pc} color={p.color} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10.5, color: T.faint }}>
                <span>{p.tasks?.filter(t => t.status === "done").length || 0}/{p.tasks?.length || 0} tasks done</span>
                <span style={{ color: p.color, fontWeight: 700 }}>{pc}%</span>
              </div>
            </div>
          );
        })}
        {/* create new */}
        <div onClick={onCreate}
          style={{
            background: "rgba(184,134,11,.04)", border: `1.5px dashed rgba(184,134,11,.25)`,
            borderRadius: 18, padding: "18px 18px", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            minHeight: 160, transition: "all .18s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(184,134,11,.09)"; e.currentTarget.style.borderColor = "rgba(184,134,11,.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(184,134,11,.04)"; e.currentTarget.style.borderColor = "rgba(184,134,11,.25)"; }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg,${T.gold},${T.goldB})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: 10, boxShadow: "0 4px 14px rgba(184,134,11,.35)" }}>
            <Plus size={22} strokeWidth={2} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.gold, fontFamily: "'Cinzel',serif" }}>New Project</span>
          <span style={{ fontSize: 11, color: T.faint, marginTop: 3 }}>Create a workspace</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
export default function ProjectsPage() {
  const toast = useToast();
  const [projects, setProjects] = useState(SEED);
  const [selId, setSelId] = useState(null);
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editProj, setEditProj] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const project = projects.find(p => p.id === selId);
  const completion = project ? pct(project.tasks) : 0;
  const filtered = projects.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  // project CRUD
  const createProject = d => {
    const p = { ...d, id: uid(), tasks: [], created: todayISO(), members: [] };
    setProjects(ps => [...ps, p]); setSelId(p.id);
    toast.add({ type: "success", title: "Project created! 🎉", msg: p.title });
  };
  const saveProject = d => {
    setProjects(ps => ps.map(p => p.id === d.id ? { ...p, ...d, tasks: p.tasks } : p));
    toast.add({ type: "success", title: "Project updated", msg: d.title });
  };
  const deleteProject = id => {
    setProjects(ps => ps.filter(p => p.id !== id));
    if (selId === id) setSelId(null);
    toast.add({ type: "success", title: "Project deleted" });
    setConfirm(null);
  };

  // task CRUD
  const addTask = t => { setProjects(ps => ps.map(p => p.id === selId ? { ...p, tasks: [...p.tasks, t] } : p)); toast.add({ type: "success", title: "Task added", msg: t.title }); };
  const updateTask = (tid, patch) => setProjects(ps => ps.map(p => p.id === selId ? { ...p, tasks: p.tasks.map(t => t.id === tid ? { ...t, ...patch } : t) } : p));
  const deleteTask = tid => {
    setProjects(ps => ps.map(p => p.id === selId ? { ...p, tasks: p.tasks.filter(t => t.id !== tid) } : p));
    toast.add({ type: "success", title: "Task removed" });
  };
  const saveTask = t => { setProjects(ps => ps.map(p => p.id === selId ? { ...p, tasks: p.tasks.map(x => x.id === t.id ? t : x) } : p)); toast.add({ type: "success", title: "Task updated", msg: t.title }); };

  const handleDeleteTask = (tid) => {
    setConfirm({
      title: "Delete Task?",
      body: "This task will be permanently removed.",
      ok: "Delete", danger: true,
      onOk: () => { deleteTask(tid); setConfirm(null); }
    });
  };

  const VIEWS = [
    ["kanban", <LayoutGrid size={13} />, "Board"],
    ["list", <List size={13} />, "List"],
    ["analytics", <BarChart2 size={13} />, "Analytics"]
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes chakraSpin{to{transform:rotate(360deg)}}
        @keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(12px)}to{opacity:1;transform:none}}
        @keyframes toastIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:rgba(184,134,11,.25);border-radius:4px}
        ::-webkit-scrollbar-track{background:transparent}
        button,input,select,textarea{font-family:'DM Sans',sans-serif;}
        button{transition:filter .15s;}
        button:hover:not(:disabled){filter:brightness(1.05)}
      `}</style>

      {/* ambient BG */}
      <div style={{ position: "fixed", right: -180, top: "38%", zIndex: 0, pointerEvents: "none", animation: "chakraSpin 110s linear infinite", opacity: .022 }}>
        <Chakra size={560} opacity={1} />
      </div>
      <div style={{ position: "fixed", left: -80, bottom: -80, zIndex: 0, pointerEvents: "none", animation: "chakraSpin 150s linear infinite reverse", opacity: .016 }}>
        <Chakra size={320} opacity={1} />
      </div>

      <div style={{
        display: "flex", height: "100vh", fontFamily: "'DM Sans',sans-serif", overflow: "hidden",
        position: "relative", zIndex: 1, background: `linear-gradient(148deg,${T.cream} 0%,${T.creamD} 55%,${T.creamDD} 100%)`
      }}>

        {/* ══ SIDEBAR ═══════════════════════════════════════════════ */}
        <div style={{
          width: 276, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden",
          background: "linear-gradient(180deg,#FDFAF0,#F7F0D8 70%,#EEE4C4)", borderRight: `1px solid ${T.border}`
        }}>
          <div style={{ padding: "18px 16px 14px", flexShrink: 0, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 8.5, color: "rgba(184,134,11,.4)", fontFamily: "'Cinzel',serif", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 3 }}>परियोजना</div>
                <h2 style={{ fontSize: 15.5, fontWeight: 900, color: T.dark, fontFamily: "'Cinzel',serif", letterSpacing: ".02em" }}>Projects</h2>
              </div>
              <button onClick={() => setShowCreate(true)}
                style={{
                  width: 34, height: 34, background: `linear-gradient(135deg,${T.gold},${T.goldB})`, border: "none",
                  borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(184,134,11,.4)", color: "white"
                }}>
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: .38, pointerEvents: "none" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…"
                style={{ ...inputStyle, paddingLeft: 30, background: "rgba(184,134,11,.07)" }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
            {/* overview */}
            <div onClick={() => setSelId(null)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 12, marginBottom: 4,
                cursor: "pointer", background: selId === null ? "rgba(184,134,11,.12)" : "transparent",
                border: `1px solid ${selId === null ? T.borderM : "transparent"}`, transition: "all .16s"
              }}
              onMouseEnter={e => { if (selId !== null) { e.currentTarget.style.background = "rgba(184,134,11,.06)"; e.currentTarget.style.borderColor = T.border; } }}
              onMouseLeave={e => { if (selId !== null) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: `${T.gold}14`, border: `1px solid ${T.gold}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Home size={16} color={T.gold} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: selId === null ? T.dark : T.mid }}>Overview</p>
                <p style={{ fontSize: 10, color: T.faint }}>{projects.length} projects</p>
              </div>
            </div>

            <Divider style={{ margin: "6px 4px 8px" }} />

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <FolderOpen size={26} color={T.faint} style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
                <p style={{ fontSize: 12, color: T.muted, fontFamily: "'Cinzel',serif", marginBottom: 8 }}>No projects yet</p>
                <button onClick={() => setShowCreate(true)} style={{ fontSize: 12, color: T.gold, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Create one →</button>
              </div>
            ) : filtered.map((p, pi) => {
              const isActive = p.id === selId, pc = pct(p.tasks);
              return (
                <div key={p.id} onClick={() => setSelId(p.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 13,
                    marginBottom: 4, cursor: "pointer",
                    background: isActive ? "rgba(184,134,11,.13)" : "transparent",
                    border: `1px solid ${isActive ? T.borderM : "transparent"}`,
                    boxShadow: isActive ? "0 2px 14px rgba(184,134,11,.1)" : "none",
                    transition: "all .16s", animation: `fadeUp .4s ${pi * .05}s both`
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(184,134,11,.06)"; e.currentTarget.style.borderColor = T.border; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${p.color || T.gold}14`, border: `1px solid ${p.color || T.gold}28` }}>
                    <ProjectIcon iconIndex={p.iconIndex} color={p.color} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: isActive ? T.dark : T.mid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{p.title}</p>
                    <ProgressBar value={pc} height={3} color={p.color || T.gold} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ fontSize: 9.5, color: T.faint }}>{p.tasks?.filter(t => t.status === "done").length || 0}/{p.tasks?.length || 0}</span>
                      <span style={{ fontSize: 9.5, color: isActive ? T.gold : T.faint, fontWeight: 700 }}>{pc}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: "10px 14px", borderTop: `1px solid ${T.border}`, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10.5, color: T.faint }}>{projects.length} projects · {projects.reduce((a, p) => a + (p.tasks?.length || 0), 0)} tasks</span>
          </div>
        </div>

        {/* ══ MAIN ══════════════════════════════════════════════════ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          {project ? (
            <>
              {/* project header */}
              <div style={{
                padding: "0 28px", borderBottom: `1px solid ${T.border}`, flexShrink: 0,
                background: "linear-gradient(90deg,rgba(253,250,240,.97),rgba(247,240,216,.97))", backdropFilter: "blur(10px)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 16, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ width: 50, height: 50, borderRadius: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${project.color || T.gold}14`, border: `1.5px solid ${project.color || T.gold}30`, boxShadow: `0 4px 18px ${project.color || T.gold}20` }}>
                    <ProjectIcon iconIndex={project.iconIndex} color={project.color} size={24} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3, flexWrap: "wrap" }}>
                      <h1 style={{ fontSize: 18, fontWeight: 900, color: T.dark, fontFamily: "'Cinzel',serif", letterSpacing: ".02em" }}>{project.title}</h1>
                      <ProjStatusChip s={project.status || "active"} />
                      <PriBadge priority={project.priority || "medium"} />
                    </div>
                    {project.description && <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.4 }}>{project.description}</p>}
                  </div>

                  <div style={{ display: "flex", gap: 0, borderLeft: `1px solid ${T.border}`, paddingLeft: 16, marginLeft: 4 }}>
                    {[
                      { l: "Total", v: project.tasks?.length || 0, c: T.gold },
                      { l: "Done", v: project.tasks?.filter(t => t.status === "done").length || 0, c: T.green },
                      { l: "Active", v: project.tasks?.filter(t => t.status === "in-progress").length || 0, c: T.amber },
                      { l: "Critical", v: project.tasks?.filter(t => t.priority === "critical").length || 0, c: T.red },
                    ].map((s, i) => (
                      <div key={s.l} style={{ textAlign: "center", padding: "0 14px", borderRight: `1px solid ${T.border}` }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: s.c, fontFamily: "'Cinzel',serif", lineHeight: 1.1 }}>{s.v}</div>
                        <div style={{ fontSize: 9.5, color: T.faint, marginTop: 2 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => setEditProj(project)}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.creamDD, color: T.mid, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => setConfirm({ title: `Delete "${project.title}"?`, body: "All tasks within this project will be permanently deleted. This cannot be undone.", ok: "Delete Project", danger: true, onOk: () => deleteProject(project.id) })}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(185,28,28,.22)", background: "rgba(185,28,28,.07)", color: T.red, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 10, paddingBottom: 12 }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}><ProgressBar value={completion} height={7} color={project.color || T.gold} /></div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: T.dark, fontFamily: "'Cinzel',serif", flexShrink: 0, minWidth: 100, textAlign: "right" }}>{completion}% complete</span>
                    {project.due && <span style={{ fontSize: 11, color: T.faint, flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}><Calendar size={10} /> {fmtD(project.due)}</span>}
                  </div>
                  <Divider v style={{ height: 28 }} />
                  <div style={{ display: "flex", background: "rgba(184,134,11,.07)", border: `1px solid ${T.border}`, borderRadius: 11, overflow: "hidden", padding: 3, gap: 2, flexShrink: 0 }}>
                    {VIEWS.map(([id, icon, label]) => (
                      <button key={id} onClick={() => setView(id)}
                        style={{
                          padding: "6px 14px", borderRadius: 8, border: "none", fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                          background: view === id ? `linear-gradient(135deg,${T.gold},${T.goldB})` : "transparent",
                          color: view === id ? "white" : T.muted, transition: "all .16s", whiteSpace: "nowrap",
                          display: "flex", alignItems: "center", gap: 5
                        }}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, overflow: "auto", padding: "22px 28px" }}>
                {view === "kanban" && <KanbanBoard tasks={project.tasks || []} onAdd={addTask} onUpdate={updateTask} onDelete={handleDeleteTask} onEdit={setEditTask} />}
                {view === "list" && <ListView tasks={project.tasks || []} onAdd={addTask} onUpdate={updateTask} onDelete={handleDeleteTask} onEdit={setEditTask} />}
                {view === "analytics" && <Analytics project={project} />}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
              <Overview projects={projects} onSelect={setSelId} onCreate={() => setShowCreate(true)} />
            </div>
          )}
        </div>
      </div>

      {showCreate && <ProjectModal onClose={() => setShowCreate(false)} onSave={createProject} />}
      {editProj && <ProjectModal project={editProj} onClose={() => setEditProj(null)} onSave={saveProject} />}
      {editTask && <TaskModal task={editTask} onSave={saveTask} onClose={() => setEditTask(null)} />}
      <Confirm data={confirm} onCancel={() => setConfirm(null)} />
      <ToastStack list={toast.list} remove={toast.remove} />
    </>
  );
}
