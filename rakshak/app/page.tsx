"use client";
import { useState, useEffect, useCallback } from "react";

type Status = "NEW" | "DISPATCHED" | "INVESTIGATING" | "RESOLVED";
type Priority = "HIGH" | "MEDIUM" | "LOW";
type Theme = "dark" | "light";

interface Incident {
  id: number;
  type: string;
  status: Status;
  priority: Priority;
  location: string;
  time: string;
  createdAt: number;
  notes: string;
}

interface Toast {
  id: number;
  message: string;
  emoji: string;
  color: string;
}

const TYPE_ICONS: Record<string, string> = {
  Medical: "🏥", Fire: "🔥", Flood: "🌊",
  Earthquake: "🌍", Accident: "🚗", Crime: "🚔",
};
const TYPE_DESC: Record<string, string> = {
  Medical: "Ambulance and paramedic units dispatched. Nearest hospital notified. Scene secured by first responders.",
  Fire: "Fire brigade en route with full equipment. Evacuation of a 200m radius underway. Gas lines being shut off.",
  Flood: "Rescue boats mobilized. Citizens advised to move to higher ground. Relief camps established at Zone C.",
  Earthquake: "Search and rescue deployed. Structural engineers assessing damage. Aftershock alert active.",
  Accident: "Traffic police and ambulance en route. Area cordoned off. Diversion route via NH-48 in effect.",
  Crime: "Police units on scene. Suspect description circulated. Citizens advised to stay indoors and lock doors.",
};
const ACCENT: Record<string, string> = {
  Medical: "#E24B4A", Fire: "#EF9F27", Flood: "#378ADD",
  Earthquake: "#7F77DD", Accident: "#D85A30", Crime: "#1D9E75",
};
const GLOW: Record<string, string> = {
  Medical: "rgba(226,75,74,0.4)", Fire: "rgba(239,159,39,0.4)",
  Flood: "rgba(55,138,221,0.4)", Earthquake: "rgba(127,119,221,0.4)",
  Accident: "rgba(216,90,48,0.4)", Crime: "rgba(29,158,117,0.4)",
};
const STATUS_ORDER: Status[] = ["NEW", "DISPATCHED", "INVESTIGATING", "RESOLVED"];
const STATUS_STYLE: Record<Status, { bg: string; color: string; label: string }> = {
  NEW:           { bg: "#E24B4A", color: "#fff", label: "🔴 NEW" },
  DISPATCHED:    { bg: "#378ADD", color: "#fff", label: "🔵 DISPATCHED" },
  INVESTIGATING: { bg: "#EF9F27", color: "#000", label: "🟡 INVESTIGATING" },
  RESOLVED:      { bg: "#1D9E75", color: "#fff", label: "🟢 RESOLVED" },
};
const PRIORITY_STYLE: Record<Priority, { bg: string; color: string; severity: number }> = {
  HIGH:   { bg: "#E24B4A", color: "#fff", severity: 100 },
  MEDIUM: { bg: "#EF9F27", color: "#000", severity: 60 },
  LOW:    { bg: "#1D9E75", color: "#fff", severity: 25 },
};
const INITIAL: Incident[] = [
  { id: 1, type: "Medical",    status: "NEW",           priority: "HIGH",   location: "Sector 4, Ring Road",  time: "2 min ago",  createdAt: Date.now()-120000,  notes: "Cardiac arrest reported." },
  { id: 2, type: "Fire",       status: "DISPATCHED",    priority: "HIGH",   location: "Industrial Zone B",    time: "10 min ago", createdAt: Date.now()-600000,  notes: "Chemical warehouse involved." },
  { id: 3, type: "Medical",    status: "DISPATCHED",    priority: "MEDIUM", location: "City Hospital Rd",     time: "18 min ago", createdAt: Date.now()-1080000, notes: "Multiple casualties." },
  { id: 4, type: "Flood",      status: "RESOLVED",      priority: "HIGH",   location: "River Bank Colony",    time: "1 hr ago",   createdAt: Date.now()-3600000, notes: "All residents evacuated." },
  { id: 5, type: "Earthquake", status: "INVESTIGATING", priority: "HIGH",   location: "Old City, Zone 7",     time: "35 min ago", createdAt: Date.now()-2100000, notes: "Building collapse suspected." },
  { id: 6, type: "Crime",      status: "NEW",           priority: "MEDIUM", location: "MG Road, Downtown",    time: "5 min ago",  createdAt: Date.now()-300000,  notes: "Armed robbery in progress." },
];

// ── Theme tokens ──────────────────────────────────────────────────────────────
const T = {
  dark: {
    bg:           "#000000",
    bgPattern:    "radial-gradient(ellipse at 20% 0%, #1a0505 0%, #000 40%), radial-gradient(ellipse at 80% 100%, #050a1a 0%, #000 50%)",
    card:         "#0d1117",
    cardBack:     "#0a0f1e",
    cardBorder:   "#1f2937",
    text:         "#ffffff",
    textSub:      "#9ca3af",
    textMuted:    "#4b5563",
    textFaint:    "#374151",
    inputBg:      "rgba(13,17,23,0.9)",
    inputBorder:  "#1f2937",
    statBg:       "rgba(13,17,23,0.8)",
    marquee:      "linear-gradient(90deg,#7f1d1d,#991b1b,#7f1d1d)",
    modalBg:      "#0d1117",
    modalBorder:  "#1f2937",
    cancelBg:     "#111827",
    cancelColor:  "#9ca3af",
    deleteBg:     "#7f1d1d",
    deleteColor:  "#fca5a5",
    deleteBorder: "#991b1b",
    scrollbar:    "#1f2937",
    noteArea:     "#0f172a",
    noteBorder:   "#334155",
  },
  light: {
    bg:           "#f1f5f9",
    bgPattern:    "radial-gradient(ellipse at 20% 0%, #fee2e2 0%, #f1f5f9 40%), radial-gradient(ellipse at 80% 100%, #dbeafe 0%, #f1f5f9 50%)",
    card:         "#ffffff",
    cardBack:     "#f8fafc",
    cardBorder:   "#e2e8f0",
    text:         "#0f172a",
    textSub:      "#475569",
    textMuted:    "#94a3b8",
    textFaint:    "#cbd5e1",
    inputBg:      "#ffffff",
    inputBorder:  "#e2e8f0",
    statBg:       "rgba(255,255,255,0.85)",
    marquee:      "linear-gradient(90deg,#dc2626,#ef4444,#dc2626)",
    modalBg:      "#ffffff",
    modalBorder:  "#e2e8f0",
    cancelBg:     "#f1f5f9",
    cancelColor:  "#475569",
    deleteBg:     "#fee2e2",
    deleteColor:  "#dc2626",
    deleteBorder: "#fca5a5",
    scrollbar:    "#e2e8f0",
    noteArea:     "#f8fafc",
    noteBorder:   "#e2e8f0",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      background: bg, color, fontSize: 10, fontWeight: 800, borderRadius: 999,
      padding: "3px 10px", letterSpacing: 0.6,
      textTransform: "uppercase" as const, display: "inline-block", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function SeverityBar({ priority }: { priority: Priority }) {
  const { severity, bg } = PRIORITY_STYLE[priority];
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 3, letterSpacing: 0.8, fontWeight: 700 }}>SEVERITY</div>
      <div style={{ height: 3, background: "#1f293740", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${severity}%`, background: bg, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function FlipCard({ incident, onUpdateStatus, onDelete, onAddNote, theme }: {
  incident: Incident;
  onUpdateStatus: (id: number) => void;
  onDelete: (id: number) => void;
  onAddNote: (id: number, note: string) => void;
  theme: Theme;
}) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [noteVal, setNoteVal] = useState(incident.notes);
  const tk = T[theme];
  const accent = ACCENT[incident.type] || "#E24B4A";
  const glow = GLOW[incident.type] || "rgba(226,75,74,0.4)";
  const icon = TYPE_ICONS[incident.type] || "🚨";
  const isNew = incident.status === "NEW";

  const shadowHover = theme === "dark"
    ? `0 0 0 1.5px ${accent}, 0 14px 44px ${glow}, 0 2px 8px rgba(0,0,0,0.5)`
    : `0 0 0 1.5px ${accent}, 0 14px 44px ${glow.replace("0.4","0.25")}, 0 4px 16px rgba(0,0,0,0.12)`;
  const shadowIdle = theme === "dark"
    ? `0 0 0 1px ${isNew ? accent+"55" : tk.cardBorder}, 0 2px 8px rgba(0,0,0,0.3)`
    : `0 0 0 1px ${isNew ? accent+"55" : tk.cardBorder}, 0 2px 8px rgba(0,0,0,0.06)`;

  return (
    <div
      style={{
        perspective: 1000, height: 240, cursor: "pointer",
        transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease",
        transform: hovered ? "translateY(-8px) scale(1.025)" : "translateY(0) scale(1)",
        boxShadow: hovered ? shadowHover : shadowIdle,
        borderRadius: 18,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !editNote && setFlipped(f => !f)}
    >
      <div style={{
        position: "relative", width: "100%", height: "100%",
        transition: "transform 0.65s cubic-bezier(0.4,0.2,0.2,1)",
        transformStyle: "preserve-3d",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        {/* FRONT */}
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
          background: tk.card, borderRadius: 18, overflow: "hidden", boxSizing: "border-box",
        }}>
          <div style={{ height: 4, background: accent }} />
          <div style={{
            position: "absolute", top: 0, right: 0, width: 140, height: 140, borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}${theme==="light"?"12":"18"} 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", height: "calc(100% - 4px)", boxSizing: "border-box", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ color: tk.text, fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>{incident.type}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {isNew && <span style={{ fontSize: 9, background: "#E24B4A", color: "#fff", borderRadius: 4, padding: "2px 6px", fontWeight: 800, letterSpacing: 0.5 }}>LIVE</span>}
                <span style={{ fontSize: 10, color: tk.textMuted }}>#{incident.id}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7, fontSize: 12, color: tk.textSub }}>
              Status: <Badge label={STATUS_STYLE[incident.status].label} bg={STATUS_STYLE[incident.status].bg} color={STATUS_STYLE[incident.status].color} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7, fontSize: 12, color: tk.textSub }}>
              Priority: <Badge label={incident.priority} bg={PRIORITY_STYLE[incident.priority].bg} color={PRIORITY_STYLE[incident.priority].color} />
            </div>
            <SeverityBar priority={incident.priority} />
            <div style={{ fontSize: 11, color: tk.textMuted, marginTop: 9 }}>📍 {incident.location}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 10 }}>
              <button
                onClick={e => { e.stopPropagation(); onUpdateStatus(incident.id); }}
                style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >🔄 Next Status</button>
              <span style={{ fontSize: 10, color: tk.textFaint }}>🕐 {incident.time}</span>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          background: tk.cardBack, borderRadius: 18, overflow: "hidden", boxSizing: "border-box",
        }}>
          <div style={{ height: 4, background: accent }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, width: 160, height: 160, borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}${theme==="light"?"10":"14"} 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", height: "calc(100% - 4px)", boxSizing: "border-box", gap: 8, position: "relative" }}>
            <div style={{ color: tk.text, fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}>
              {icon} {incident.type} — Intel
            </div>
            <p style={{ color: tk.textSub, fontSize: 12, lineHeight: 1.6, margin: 0 }}>{TYPE_DESC[incident.type]}</p>
            <div>
              <div style={{ fontSize: 9, color: tk.textMuted, marginBottom: 4, fontWeight: 700, letterSpacing: 0.6 }}>📝 FIELD NOTES</div>
              {editNote ? (
                <div onClick={e => e.stopPropagation()}>
                  <textarea
                    value={noteVal}
                    onChange={e => setNoteVal(e.target.value)}
                    rows={2}
                    style={{
                      width: "100%", background: tk.noteArea, color: tk.text,
                      border: `1px solid ${tk.noteBorder}`, borderRadius: 8, padding: "6px 8px",
                      fontSize: 11, resize: "none", boxSizing: "border-box", fontFamily: "inherit",
                    }}
                  />
                  <button
                    onClick={e => { e.stopPropagation(); onAddNote(incident.id, noteVal); setEditNote(false); }}
                    style={{ marginTop: 4, background: "#1D9E75", color: "#fff", border: "none", borderRadius: 7, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                  >Save ✓</button>
                </div>
              ) : (
                <div
                  onClick={e => { e.stopPropagation(); setEditNote(true); }}
                  style={{ fontSize: 11, color: tk.textMuted, cursor: "text", fontStyle: "italic", minHeight: 24 }}
                >{incident.notes || "Tap to add notes..."}</div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
              <span style={{ fontSize: 10, color: tk.textFaint }}>Click to flip back</span>
              <button
                onClick={e => { e.stopPropagation(); onDelete(incident.id); }}
                style={{ background: tk.deleteBg, color: tk.deleteColor, border: `1px solid ${tk.deleteBorder}`, borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >🗑 Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.color, color: "#fff", borderRadius: 12,
          padding: "11px 18px", fontSize: 13, fontWeight: 600,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          animation: "slideUp 0.3s ease",
          display: "flex", alignItems: "center", gap: 8, minWidth: 200,
        }}>
          <span style={{ fontSize: 16 }}>{t.emoji}</span> {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "Medical", priority: "HIGH" as Priority, location: "", notes: "" });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "ALL">("ALL");
  const [filterPriority, setFilterPriority] = useState<Priority | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "priority" | "status">("newest");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [clock, setClock] = useState("");
  const [themeAnim, setThemeAnim] = useState(false);

  const tk = T[theme];

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const addToast = useCallback((message: string, emoji: string, color: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, emoji, color }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const toggleTheme = () => {
    setThemeAnim(true);
    setTimeout(() => {
      setTheme(t => t === "dark" ? "light" : "dark");
      setThemeAnim(false);
    }, 180);
  };

  const updateStatus = useCallback((id: number) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id !== id) return inc;
      const next = STATUS_ORDER[(STATUS_ORDER.indexOf(inc.status) + 1) % STATUS_ORDER.length];
      addToast(`#${inc.id} → ${next}`, STATUS_STYLE[next].label.split(" ")[0], STATUS_STYLE[next].bg);
      return { ...inc, status: next };
    }));
  }, [addToast]);

  const deleteIncident = useCallback((id: number) => {
    setIncidents(prev => {
      const inc = prev.find(i => i.id === id);
      if (inc) addToast(`${inc.type} removed`, "🗑", "#374151");
      return prev.filter(i => i.id !== id);
    });
  }, [addToast]);

  const addNote = useCallback((id: number, note: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, notes: note } : i));
    addToast("Notes saved", "📝", "#1D9E75");
  }, [addToast]);

  const addIncident = () => {
    if (!form.location.trim()) return;
    const newInc: Incident = {
      id: Date.now(), type: form.type, status: "NEW",
      priority: form.priority, location: form.location,
      time: "just now", createdAt: Date.now(), notes: form.notes,
    };
    setIncidents(prev => [newInc, ...prev]);
    addToast(`${form.type} added!`, TYPE_ICONS[form.type], ACCENT[form.type]);
    setShowModal(false);
    setForm({ type: "Medical", priority: "HIGH", location: "", notes: "" });
  };

  const PRIORITY_RANK: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const STATUS_RANK: Record<Status, number> = { NEW: 0, DISPATCHED: 1, INVESTIGATING: 2, RESOLVED: 3 };

  const visible = incidents
    .filter(i => {
      const q = search.toLowerCase();
      return (
        (!q || i.type.toLowerCase().includes(q) || i.location.toLowerCase().includes(q) || i.status.toLowerCase().includes(q)) &&
        (filterStatus === "ALL" || i.status === filterStatus) &&
        (filterPriority === "ALL" || i.priority === filterPriority)
      );
    })
    .sort((a, b) =>
      sortBy === "priority" ? PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] :
      sortBy === "status"   ? STATUS_RANK[a.status] - STATUS_RANK[b.status] :
      b.createdAt - a.createdAt
    );

  const stats = {
    total: incidents.length,
    new: incidents.filter(i => i.status === "NEW").length,
    dispatched: incidents.filter(i => i.status === "DISPATCHED").length,
    investigating: incidents.filter(i => i.status === "INVESTIGATING").length,
    resolved: incidents.filter(i => i.status === "RESOLVED").length,
  };

  const marqueeText = incidents.map(i => `${TYPE_ICONS[i.type]} ${i.type} — ${i.status} — ${i.location}`).join("   •   ");

  const bgSvg = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme==="dark"?"ffffff":"000000"}' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  const sel: React.CSSProperties = {
    background: tk.inputBg, color: tk.text,
    border: `1px solid ${tk.inputBorder}`, borderRadius: 9,
    padding: "9px 12px", fontSize: 12, cursor: "pointer", outline: "none",
  };

  const statBorders = ["#1f2937", "#E24B4A44", "#378ADD44", "#EF9F2744", "#1D9E7544"];
  const statColors  = [tk.text, "#f87171", "#60a5fa", "#fbbf24", "#4ade80"];
  const statLabels  = ["Total", "🔴 New", "🔵 Dispatched", "🟡 Investig.", "🟢 Resolved"];
  const statValues  = [stats.total, stats.new, stats.dispatched, stats.investigating, stats.resolved];

  return (
    <div style={{
      minHeight: "100vh",
      background: `${bgSvg}, ${tk.bgPattern}`,
      color: tk.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      transition: "background 0.4s ease, color 0.3s ease",
      opacity: themeAnim ? 0 : 1,
    }}>
      <style>{`
        @keyframes marquee  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeIn   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        button:active { transform: scale(0.95) !important; }
        input::placeholder { color: #94a3b8; }
        textarea:focus, input:focus, select:focus { outline: none !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { border-radius: 4px; }
      `}</style>

      {/* Marquee */}
      <div style={{ background: tk.marquee, fontSize: 11, fontWeight: 700, padding: "7px 0", overflow: "hidden", whiteSpace: "nowrap", letterSpacing: 0.5, color: "#fff" }}>
        <span style={{ display: "inline-block", animation: "marquee 35s linear infinite", paddingLeft: "100%" }}>
          🚨 LIVE EMERGENCY FEED &nbsp;•&nbsp; {marqueeText} &nbsp;•&nbsp; 🚨 LIVE EMERGENCY FEED &nbsp;•&nbsp; {marqueeText}
        </span>
      </div>

      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "28px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fb923c", margin: 0, letterSpacing: -0.5 }}>🚨 Rakshak</h1>
            <p style={{ color: tk.textMuted, fontSize: 11, margin: "3px 0 0", letterSpacing: 1, fontWeight: 700 }}>EMERGENCY COMMAND CENTER</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Day Mode" : "Switch to Night Mode"}
              style={{
                background: theme === "dark" ? "#1f2937" : "#fff",
                border: `1.5px solid ${theme === "dark" ? "#374151" : "#e2e8f0"}`,
                borderRadius: 999,
                padding: "6px 16px",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 13, fontWeight: 700,
                color: theme === "dark" ? "#fbbf24" : "#1d4ed8",
                boxShadow: theme === "dark" ? "0 0 12px rgba(251,191,36,0.2)" : "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{theme === "dark" ? "☀️" : "🌙"}</span>
              {theme === "dark" ? "Day" : "Night"}
            </button>

            {/* Clock */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: tk.text, fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>{clock}</div>
              <div style={{ fontSize: 10, color: tk.textMuted, marginTop: 2, letterSpacing: 0.5 }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 20 }}>
          {statLabels.map((label, i) => (
            <div key={label} style={{
              background: tk.statBg, border: `1px solid ${statBorders[i]}`,
              borderRadius: 14, padding: "14px 10px", textAlign: "center",
              backdropFilter: "blur(4px)",
              transition: "background 0.3s ease",
            }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: statColors[i], transition: "color 0.3s ease" }}>{statValues[i]}</div>
              <div style={{ fontSize: 10, color: tk.textMuted, marginTop: 3, fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" as const, alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by type, location, status..."
            style={{ flex: 1, minWidth: 200, background: tk.inputBg, color: tk.text, border: `1px solid ${tk.inputBorder}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, transition: "background 0.3s ease" }}
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as Status | "ALL")} style={sel}>
            <option value="ALL">All Statuses</option>
            {STATUS_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | "ALL")} style={sel}>
            <option value="ALL">All Priorities</option>
            {(["HIGH","MEDIUM","LOW"] as Priority[]).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={sel}>
            <option value="newest">⬇ Newest</option>
            <option value="priority">🔺 Priority</option>
            <option value="status">📋 Status</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 800, cursor: "pointer", letterSpacing: 0.3, whiteSpace: "nowrap" }}
          >➕ Add Emergency</button>
        </div>

        <div style={{ fontSize: 11, color: tk.textMuted, marginBottom: 8, letterSpacing: 0.3 }}>
          Showing {visible.length} of {incidents.length} incidents
          {search && <span style={{ color: "#378ADD" }}> · "{search}"</span>}
        </div>
        <p style={{ fontSize: 11, color: tk.textFaint, marginBottom: 18 }}>
          💡 Hover to highlight · Click to flip · Back has notes & delete
        </p>

        {/* Cards */}
        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: tk.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No incidents match your filters</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
            {visible.map(incident => (
              <FlipCard
                key={incident.id}
                incident={incident}
                onUpdateStatus={updateStatus}
                onDelete={deleteIncident}
                onAddNote={addNote}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: tk.modalBg, border: `1px solid ${tk.modalBorder}`,
              borderRadius: 20, padding: 28, width: 340,
              animation: "fadeIn 0.25s ease",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ height: 4, background: ACCENT[form.type] || "#E24B4A", borderRadius: 99, marginBottom: 18 }} />
            <h2 style={{ color: tk.text, fontWeight: 800, fontSize: 18, margin: "0 0 20px", letterSpacing: -0.3 }}>🚨 New Emergency</h2>

            {[
              { label: "TYPE",     field: "type"     as const, options: Object.keys(TYPE_ICONS) },
              { label: "PRIORITY", field: "priority" as const, options: ["HIGH","MEDIUM","LOW"] },
            ].map(({ label, field, options }) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, color: tk.textMuted, display: "block", marginBottom: 4, fontWeight: 700, letterSpacing: 0.6 }}>{label}</label>
                <select
                  value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  style={{ ...sel, width: "100%", boxSizing: "border-box" as const }}
                >
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, color: tk.textMuted, display: "block", marginBottom: 4, fontWeight: 700, letterSpacing: 0.6 }}>LOCATION</label>
              <input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Sector 4, Main Road"
                style={{ ...sel, width: "100%", boxSizing: "border-box" as const }}
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 10, color: tk.textMuted, display: "block", marginBottom: 4, fontWeight: 700, letterSpacing: 0.6 }}>INITIAL NOTES</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any additional details..."
                rows={2}
                style={{ ...sel, width: "100%", resize: "none", boxSizing: "border-box" as const, fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, background: tk.cancelBg, color: tk.cancelColor, border: `1px solid ${tk.modalBorder}`, borderRadius: 10, padding: 10, fontSize: 13, cursor: "pointer" }}
              >Cancel</button>
              <button
                onClick={addIncident}
                style={{ flex: 1, background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" }}
              >Add 🚨</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}