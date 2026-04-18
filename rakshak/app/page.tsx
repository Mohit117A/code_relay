"use client";
import { useState } from "react";

const typeIcons: Record<string, string> = {
  Medical: "🏥",
  Fire: "🔥",
  Flood: "🌊",
  Earthquake: "🌍",
  Accident: "🚗",
  Crime: "🚔",
};

const typeDescriptions: Record<string, string> = {
  Medical: "Medical emergency requiring immediate attention. Ambulance and paramedic units have been alerted. Nearest hospital notified for incoming patients.",
  Fire: "Active fire incident reported. Fire brigade dispatched with full equipment. Evacuation of nearby areas is underway. Do not enter affected zones.",
  Flood: "Flooding detected in the area. Rescue boats and relief teams mobilized. Citizens advised to move to higher ground immediately.",
  Earthquake: "Seismic activity reported. Search and rescue teams deployed. Structural engineers assessing damage in affected zones.",
  Accident: "Road accident reported. Traffic police and ambulance en route. Area cordoned off for safety and investigation.",
  Crime: "Criminal activity reported. Police units dispatched. Area under surveillance. Citizens advised to stay indoors.",
};

const accentColors: Record<string, string> = {
  Medical: "#E24B4A",
  Fire: "#EF9F27",
  Flood: "#378ADD",
  Earthquake: "#7F77DD",
  Accident: "#D85A30",
  Crime: "#1D9E75",
};

type Status = "NEW" | "DISPATCHED" | "INVESTIGATING" | "RESOLVED";
type Priority = "HIGH" | "MEDIUM" | "LOW";

interface Incident {
  id: number;
  type: string;
  status: Status;
  priority: Priority;
  location: string;
  time: string;
}

const statusOrder: Status[] = ["NEW", "DISPATCHED", "INVESTIGATING", "RESOLVED"];

const statusStyles: Record<Status, { background: string; color: string }> = {
  NEW: { background: "#E24B4A", color: "#fff" },
  DISPATCHED: { background: "#378ADD", color: "#fff" },
  INVESTIGATING: { background: "#EF9F27", color: "#000" },
  RESOLVED: { background: "#1D9E75", color: "#fff" },
};

const priorityStyles: Record<Priority, { background: string; color: string }> = {
  HIGH: { background: "#E24B4A", color: "#fff" },
  MEDIUM: { background: "#EF9F27", color: "#000" },
  LOW: { background: "#1D9E75", color: "#fff" },
};

const initialIncidents: Incident[] = [
  { id: 1, type: "Medical", status: "NEW", priority: "HIGH", location: "Sector 4, Ring Road", time: "2 min ago" },
  { id: 2, type: "Fire", status: "DISPATCHED", priority: "HIGH", location: "Industrial Zone B", time: "10 min ago" },
  { id: 3, type: "Medical", status: "DISPATCHED", priority: "MEDIUM", location: "City Hospital Rd", time: "18 min ago" },
  { id: 4, type: "Flood", status: "RESOLVED", priority: "HIGH", location: "River Bank Colony", time: "1 hr ago" },
];

function Badge({ label, style }: { label: string; style: { background: string; color: string } }) {
  return (
    <span style={{
      background: style.background,
      color: style.color,
      fontSize: 11,
      fontWeight: 700,
      borderRadius: 999,
      padding: "3px 12px",
      letterSpacing: 0.5,
      textTransform: "uppercase" as const,
      display: "inline-block",
    }}>
      {label}
    </span>
  );
}

function FlipCard({ incident, onUpdateStatus }: { incident: Incident; onUpdateStatus: (id: number) => void }) {
  const [flipped, setFlipped] = useState(false);
  const accent = accentColors[incident.type] || "#E24B4A";
  const icon = typeIcons[incident.type] || "🚨";
  const desc = typeDescriptions[incident.type] || "Emergency in progress. Units are being coordinated for a swift response.";

  return (
    <div
      onClick={() => setFlipped(f => !f)}
      style={{ perspective: 1000, height: 220, cursor: "pointer" }}
    >
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        transition: "transform 0.6s cubic-bezier(0.4,0.2,0.2,1)",
        transformStyle: "preserve-3d",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        {/* FRONT */}
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          background: "#111827",
          borderRadius: 16,
          border: "1px solid #1f2937",
          overflow: "hidden",
          boxSizing: "border-box",
        }}>
          <div style={{ height: 4, background: accent }} />
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", height: "calc(100% - 4px)", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{icon}</span> Type: {incident.type}
              </div>
              <span style={{ fontSize: 11, color: "#6b7280" }}>#{incident.id}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13, color: "#9ca3af" }}>
              Status: <Badge label={incident.status} style={statusStyles[incident.status]} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13, color: "#9ca3af" }}>
              Priority: <Badge label={incident.priority} style={priorityStyles[incident.priority]} />
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: "auto" }}>📍 {incident.location}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateStatus(incident.id); }}
                style={{
                  background: "#2563eb", color: "#fff", border: "none",
                  borderRadius: 10, padding: "7px 16px", fontSize: 13,
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                🔄 Update Status
              </button>
              <span style={{ fontSize: 11, color: "#4b5563" }}>{incident.time}</span>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          background: "#0f172a",
          borderRadius: 16,
          border: "1px solid #334155",
          overflow: "hidden",
          boxSizing: "border-box",
        }}>
          <div style={{ height: 4, background: accent }} />
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", height: "calc(100% - 4px)", boxSizing: "border-box" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              {icon} {incident.type} — Details
            </div>
            <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6, margin: 0, flex: 1 }}>{desc}</p>
            <div style={{ marginTop: 12, fontSize: 11, color: "#64748b", display: "flex", gap: 12 }}>
              <span>📍 {incident.location}</span>
              <span>🕐 {incident.time}</span>
            </div>
            <p style={{ fontSize: 11, color: "#475569", marginTop: 6, fontStyle: "italic" }}>Click to flip back</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "Medical", priority: "HIGH" as Priority, location: "" });

  const updateStatus = (id: number) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id !== id) return inc;
        const idx = statusOrder.indexOf(inc.status);
        return { ...inc, status: statusOrder[(idx + 1) % statusOrder.length] };
      })
    );
  };

  const addIncident = () => {
    if (!form.location.trim()) return;
    setIncidents(prev => [{
      id: Date.now(),
      type: form.type,
      status: "NEW",
      priority: form.priority,
      location: form.location,
      time: "just now",
    }, ...prev]);
    setShowModal(false);
    setForm({ type: "Medical", priority: "HIGH", location: "" });
  };

  const stats = {
    total: incidents.length,
    new: incidents.filter(i => i.status === "NEW").length,
    dispatched: incidents.filter(i => i.status === "DISPATCHED").length,
    resolved: incidents.filter(i => i.status === "RESOLVED").length,
  };

  const marqueeText = incidents
    .map(i => `${typeIcons[i.type] || "🚨"} ${i.type} — ${i.status} — ${i.location}`)
    .join("   •   ");

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Segoe UI', sans-serif" }}>

      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        button:hover { opacity: 0.9; }
      `}</style>

      {/* Marquee */}
      <div style={{ background: "#b91c1c", color: "#fff", fontSize: 12, fontWeight: 700, padding: "8px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <span style={{ display: "inline-block", animation: "marquee 30s linear infinite", paddingLeft: "100%" }}>
          🚨 LIVE ALERTS &nbsp;•&nbsp; {marqueeText} &nbsp;•&nbsp; 🚨 LIVE ALERTS &nbsp;•&nbsp; {marqueeText}
        </span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fb923c", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            🚨 Rakshak Dashboard
          </h1>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>Emergency Response Command Center</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total", value: stats.total, emoji: "📊", color: "#fff" },
            { label: "New", value: stats.new, emoji: "🔴", color: "#f87171" },
            { label: "Dispatched", value: stats.dispatched, emoji: "🔵", color: "#60a5fa" },
            { label: "Resolved", value: stats.resolved, emoji: "🟢", color: "#4ade80" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: "16px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{s.emoji} {s.label}</div>
            </div>
          ))}
        </div>

        {/* Add Button */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "#dc2626", color: "#fff", border: "none",
              borderRadius: 999, padding: "12px 28px",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}
          >
            ➕ Add Emergency
          </button>
        </div>

        {/* Hint */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#4b5563", marginBottom: 16 }}>
          💡 Click any card to flip and see details
        </p>

        {/* Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {incidents.map(incident => (
            <FlipCard key={incident.id} incident={incident} onUpdateStatus={updateStatus} />
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}>
          <div style={{
            background: "#111827", border: "1px solid #374151",
            borderRadius: 20, padding: 28, width: 320,
            animation: "fadeIn 0.2s ease",
          }}>
            <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 20, margin: "0 0 20px" }}>🚨 New Emergency</h2>

            <label style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4 }}>Type</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              style={{ width: "100%", background: "#1f2937", color: "#fff", border: "1px solid #374151", borderRadius: 10, padding: "8px 10px", marginBottom: 14, fontSize: 13, boxSizing: "border-box" as const }}
            >
              {Object.keys(typeIcons).map(t => <option key={t}>{t}</option>)}
            </select>

            <label style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4 }}>Priority</label>
            <select
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
              style={{ width: "100%", background: "#1f2937", color: "#fff", border: "1px solid #374151", borderRadius: 10, padding: "8px 10px", marginBottom: 14, fontSize: 13, boxSizing: "border-box" as const }}
            >
              <option>HIGH</option>
              <option>MEDIUM</option>
              <option>LOW</option>
            </select>

            <label style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4 }}>Location</label>
            <input
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Sector 4, Main Road"
              style={{ width: "100%", background: "#1f2937", color: "#fff", border: "1px solid #374151", borderRadius: 10, padding: "8px 10px", marginBottom: 20, fontSize: 13, boxSizing: "border-box" as const }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, background: "#1f2937", color: "#fff", border: "1px solid #374151", borderRadius: 10, padding: 10, fontSize: 13, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={addIncident}
                style={{ flex: 1, background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Add ➕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}