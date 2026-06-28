import { useState, useEffect, useRef } from "react";

// Inline date utilities (replaces date-fns)
function startOfDay(d) { const r = new Date(d); r.setHours(0,0,0,0); return r; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function subDays(d, n) { return addDays(d, -n); }
function differenceInDays(a, b) { return Math.round((startOfDay(a) - startOfDay(b)) / 86400000); }
function isSameDay(a, b) { return startOfDay(a).getTime() === startOfDay(b).getTime(); }
function isWithinInterval(d, { start, end }) { const t = startOfDay(d).getTime(); return t >= startOfDay(start).getTime() && t <= startOfDay(end).getTime(); }
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function eachDayOfInterval({ start, end }) { const days = []; let cur = startOfDay(start); const e = startOfDay(end); while (cur <= e) { days.push(new Date(cur)); cur = addDays(cur, 1); } return days; }
function getDay(d) { return d.getDay(); }
function format(d, fmt) {
  const dt = new Date(d);
  const pad = n => String(n).padStart(2, "0");
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthsShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return fmt
    .replace("yyyy", dt.getFullYear())
    .replace("MMMM", months[dt.getMonth()])
    .replace("MMM", monthsShort[dt.getMonth()])
    .replace("MM", pad(dt.getMonth() + 1))
    .replace("dd", pad(dt.getDate()))
    .replace("d", dt.getDate());
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PHASES = {
  Menstrual: {
    label: "Menstrual", days: "Days 1–5", tagline: "Rest & restore",
    color: "#e11d48", bg: "#fff1f2", light: "#ffe4e6",
    tips: [
      { icon: "🥬", title: "Iron-rich foods", text: "Spinach, lentils, and dark chocolate replenish iron lost during bleeding." },
      { icon: "🧘", title: "Gentle movement", text: "Light yoga or slow walks — your body's doing hard work, let it lead." },
      { icon: "🌡️", title: "Heat therapy", text: "A warm compress on your abdomen eases cramps effectively." },
      { icon: "📓", title: "Rest & reflect", text: "Intuition is sharp this week. Journal, slow down, be kind to yourself." },
    ],
  },
  Follicular: {
    label: "Follicular", days: "Days 6–13", tagline: "Rise & begin",
    color: "#7c3aed", bg: "#f5f3ff", light: "#ede9fe",
    tips: [
      { icon: "🥗", title: "Lean proteins", text: "Complex carbs and protein support your rising energy." },
      { icon: "🏃", title: "Build momentum", text: "Energy is climbing — try a new workout class or brisk walk." },
      { icon: "💡", title: "Create & plan", text: "Mental clarity peaks here. Great time for big projects." },
      { icon: "✨", title: "Skin glow", text: "Estrogen peaks — skin is often clearest. Keep routine simple." },
    ],
  },
  Ovulation: {
    label: "Ovulation", days: "Peak day", tagline: "Peak energy",
    color: "#d97706", bg: "#fffbeb", light: "#fef3c7",
    tips: [
      { icon: "🫐", title: "Antioxidants", text: "Berries, leafy greens, and fiber support hormone processing." },
      { icon: "💪", title: "Peak performance", text: "You're at your strongest — HIIT, running, heavy lifting, go for it." },
      { icon: "🗣️", title: "Speak up", text: "Verbal confidence peaks. Great for negotiations and presentations." },
      { icon: "❤️", title: "Connect", text: "High confidence. Best time for social events and important conversations." },
    ],
  },
  Luteal: {
    label: "Luteal", days: "Days 15–28", tagline: "Wind down",
    color: "#0f766e", bg: "#f0fdfa", light: "#ccfbf1",
    tips: [
      { icon: "🥦", title: "Manage PMS", text: "Magnesium-rich foods and B-vitamins ease mood swings. Reduce caffeine." },
      { icon: "🏊", title: "Ease off", text: "Swap intense workouts for Pilates, swimming, or restorative yoga." },
      { icon: "💧", title: "Stay hydrated", text: "Bloating is common. Up water intake and wear comfortable clothing." },
      { icon: "🛁", title: "Deep self-care", text: "Turn inward — a bath, a book, a film. Cozy over productive." },
    ],
  },
  None: {
    label: "Not set", days: "", tagline: "Set up your cycle",
    color: "#db2777", bg: "#fdf2f8", light: "#fce7f3",
    tips: [
      { icon: "📅", title: "Track your cycle", text: "Enter your last period date to unlock personalized daily insights." },
      { icon: "🔍", title: "Spot patterns", text: "Tracking helps you understand what's normal for your unique body." },
      { icon: "💪", title: "Sync workouts", text: "Align your exercise with your natural hormonal rhythm for better results." },
      { icon: "🥗", title: "Eat with your cycle", text: "Each phase calls for different nutrients to feel your best." },
    ],
  },
};

const SYMPTOMS = [
  { id: "cramps", emoji: "🌀", label: "Cramps" },
  { id: "headache", emoji: "🤕", label: "Headache" },
  { id: "bloating", emoji: "💨", label: "Bloating" },
  { id: "fatigue", emoji: "😴", label: "Fatigue" },
  { id: "mood_swings", emoji: "🎢", label: "Mood swings" },
  { id: "acne", emoji: "😮", label: "Acne" },
  { id: "breast_tenderness", emoji: "💗", label: "Breast pain" },
  { id: "nausea", emoji: "🤢", label: "Nausea" },
  { id: "back_pain", emoji: "🦴", label: "Back pain" },
  { id: "cravings", emoji: "🍫", label: "Cravings" },
  { id: "insomnia", emoji: "🌙", label: "Insomnia" },
  { id: "anxiety", emoji: "😰", label: "Anxiety" },
];

const MOODS = [
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "calm", emoji: "😌", label: "Calm" },
  { id: "energetic", emoji: "⚡", label: "Energetic" },
  { id: "sad", emoji: "😢", label: "Sad" },
  { id: "anxious", emoji: "😰", label: "Anxious" },
  { id: "irritable", emoji: "😤", label: "Irritable" },
  { id: "tired", emoji: "😩", label: "Tired" },
  { id: "sensitive", emoji: "🥺", label: "Sensitive" },
];

const FLOW_LEVELS = [
  { id: "spotting", label: "Spotting", color: "#fda4af" },
  { id: "light", label: "Light", color: "#fb7185" },
  { id: "medium", label: "Medium", color: "#e11d48" },
  { id: "heavy", label: "Heavy", color: "#9f1239" },
];

const SOUNDSCAPES = [
  { id: "forest", name: "Forest Adventure", emoji: "🌲", bg: "#d1fae5", color: "#065f46", freq: 180 },
  { id: "rain", name: "Forest Rain", emoji: "🌧️", bg: "#dbeafe", color: "#1e40af", freq: 220 },
  { id: "ocean", name: "Ocean Waves", emoji: "🌊", bg: "#cffafe", color: "#164e63", freq: 140 },
  { id: "night", name: "Night Crickets", emoji: "🌙", bg: "#ede9fe", color: "#4c1d95", freq: 440 },
  { id: "fire", name: "Crackling Fire", emoji: "🔥", bg: "#fef3c7", color: "#92400e", freq: 160 },
  { id: "wind", name: "Mountain Wind", emoji: "🏔️", bg: "#f1f5f9", color: "#334155", freq: 100 },
];

const RELIEF_ROUTINES = [
  { title: "Period pain relief", duration: "12 min", emoji: "🧘‍♀️", desc: "Gentle yoga flows to ease cramps", steps: ["Child's pose (2 min)", "Supine twist (3 min)", "Reclined butterfly (3 min)", "Savasana (4 min)"] },
  { title: "Foot reflexology", duration: "6 min", emoji: "🦶", desc: "Pressure points connected to the uterus", steps: ["Warm foot soak (2 min)", "Inner arch press (2 min)", "Ankle rotation (2 min)"] },
  { title: "Breathing for cramps", duration: "8 min", emoji: "💨", desc: "4-7-8 breathing reduces pain signals", steps: ["Inhale 4 counts", "Hold 7 counts", "Exhale 8 counts", "Repeat 8 cycles"] },
  { title: "Hip opening flow", duration: "15 min", emoji: "🌸", desc: "Releases pelvic tension and improves circulation", steps: ["Pigeon pose left (3 min)", "Pigeon pose right (3 min)", "Lizard pose (3 min)", "Happy baby (3 min)", "Rest (3 min)"] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function computeCycleData(lastPeriodDate, cycleLength, lutealLen) {
  const lph = lutealLen || 14;
  const today = startOfDay(new Date());
  let cycleStart = startOfDay(new Date(lastPeriodDate));
  while (addDays(cycleStart, cycleLength) <= today) cycleStart = addDays(cycleStart, cycleLength);

  const nextPeriodStart = addDays(cycleStart, cycleLength);
  const ovDay = addDays(nextPeriodStart, -lph);
  const periodEnd = addDays(cycleStart, 4);
  const dayOfCycle = Math.max(1, differenceInDays(today, cycleStart) + 1);
  const nextPeriodIn = differenceInDays(nextPeriodStart, today);

  let phase = "None";
  if (isWithinInterval(today, { start: cycleStart, end: periodEnd })) phase = "Menstrual";
  else if (isWithinInterval(today, { start: addDays(periodEnd, 1), end: subDays(ovDay, 1) })) phase = "Follicular";
  else if (isSameDay(today, ovDay)) phase = "Ovulation";
  else if (isWithinInterval(today, { start: addDays(ovDay, 1), end: subDays(nextPeriodStart, 1) })) phase = "Luteal";

  const periodDays = new Set(), fertileDays = new Set(), ovulationDays = new Set();
  for (let i = -1; i < 5; i++) {
    const cs = addDays(cycleStart, cycleLength * i);
    const nps = addDays(cs, cycleLength);
    const ov = addDays(nps, -lph);
    for (let j = 0; j < 5; j++) { periodDays.add(format(addDays(nps, j), "yyyy-MM-dd")); periodDays.add(format(addDays(cs, j), "yyyy-MM-dd")); }
    for (let j = 5; j >= 0; j--) fertileDays.add(format(subDays(ov, j), "yyyy-MM-dd"));
    ovulationDays.add(format(ov, "yyyy-MM-dd"));
  }

  return { phase, dayOfCycle, cycleLength, nextPeriodIn, nextPeriodDate: nextPeriodStart, cycleStart, ovDay, periodDays, fertileDays, ovulationDays };
}

function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

function save(key, val) { try { window.storage?.set(key, JSON.stringify(val)); } catch {} }
function load(key) { return null; } // storage loaded async in useEffect below

// ─── UI Primitives ────────────────────────────────────────────────────────────
function Modal({ onClose, children, title, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 28, width: "100%", maxWidth: wide ? 560 : 440, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PrimaryBtn({ onClick, children, color, style = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer",
      background: color || "linear-gradient(135deg, #7c3aed, #db2777)",
      color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
      transition: "opacity 0.15s", ...style,
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{children}</button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width: 44, height: 24, borderRadius: 99, cursor: "pointer",
      background: checked ? "#7c3aed" : "#e2e8f0",
      position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 3, left: checked ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s",
      }} />
    </div>
  );
}

function Chip({ label, selected, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 14px", borderRadius: 99, border: `1.5px solid ${selected ? color || "#7c3aed" : "#e2e8f0"}`,
      background: selected ? (color || "#7c3aed") + "15" : "#fff",
      color: selected ? color || "#7c3aed" : "#64748b",
      fontSize: 13, fontWeight: selected ? 700 : 500, cursor: "pointer",
      fontFamily: "inherit", transition: "all 0.15s",
    }}>{label}</button>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || "#1e293b", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function CycleRing({ day, total, color }) {
  const r = 36, cx = 44, cy = 44, stroke = 7, circ = 2 * Math.PI * r;
  const progress = clamp(day / total, 0, 1);
  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${progress * circ} ${circ}`} strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dasharray 0.6s ease" }} />
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="18" fontWeight="700" fill="#1e293b">{day || "—"}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94a3b8">of {total}</text>
    </svg>
  );
}

function PhaseTimeline({ dayOfCycle, cycleLength }) {
  const periodEnd = 5, ovDay = Math.round(cycleLength * 0.52), total = cycleLength;
  const pct = n => `${(n / total) * 100}%`;
  const marker = clamp((dayOfCycle / total) * 100, 0, 100);
  const segments = [
    { label: "Menstrual", width: pct(periodEnd), bg: "#fb7185" },
    { label: "Follicular", width: pct(ovDay - 1 - periodEnd), bg: "#a78bfa" },
    { label: "Ovulation", width: pct(1), bg: "#fbbf24" },
    { label: "Luteal", width: pct(total - ovDay), bg: "#5eead4" },
  ];
  return (
    <div>
      <div style={{ position: "relative", height: 10, borderRadius: 99, overflow: "visible", display: "flex", background: "#f1f5f9" }}>
        <div style={{ display: "flex", width: "100%", borderRadius: 99, overflow: "hidden" }}>
          {segments.map(s => <div key={s.label} style={{ background: s.bg, width: s.width, height: "100%", flexShrink: 0 }} />)}
        </div>
        {dayOfCycle > 0 && (
          <div style={{ position: "absolute", top: -4, height: 18, width: 3, background: "#1e293b", borderRadius: 99, left: `calc(${marker}% - 1.5px)`, boxShadow: "0 0 0 2px #fff, 0 0 0 3.5px #1e293b", transition: "left 0.4s ease" }} />
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "#94a3b8" }}>
        {segments.map(s => <span key={s.label}>{s.label}</span>)}
      </div>
    </div>
  );
}

function MiniCalendar({ year, month, periodDays, fertileDays, ovulationDays, loggedDays = {}, onDayClick }) {
  const firstDay = startOfMonth(new Date(year, month));
  const days = eachDayOfInterval({ start: firstDay, end: endOfMonth(firstDay) });
  const pad = getDay(firstDay);
  const today = startOfDay(new Date());

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {Array(pad).fill(null).map((_, i) => <div key={`p${i}`} />)}
        {days.map(d => {
          const k = format(d, "yyyy-MM-dd");
          const isOv = ovulationDays.has(k), isPeriod = periodDays.has(k), isFertile = fertileDays.has(k);
          const isLogged = !!loggedDays[k];
          const isToday = isSameDay(d, today);
          let bg = "transparent", col = "#475569";
          if (isOv) { bg = "#10b981"; col = "#fff"; }
          else if (isPeriod || isLogged) { bg = "#fb7185"; col = "#fff"; }
          else if (isFertile) { bg = "#bfdbfe"; col = "#1d4ed8"; }
          return (
            <div key={k} onClick={() => onDayClick && onDayClick(d, k)}
              style={{
                textAlign: "center", fontSize: 11, fontWeight: isToday ? 800 : 400,
                padding: "4px 0", borderRadius: 7, background: bg, color: col,
                outline: isToday && !isPeriod && !isOv ? "2px solid #7c3aed" : "none", outlineOffset: -1,
                cursor: onDayClick ? "pointer" : "default",
                position: "relative",
              }}>
              {d.getDate()}
              {isLogged && !isPeriod && <div style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#e11d48" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function LogPeriodModal({ onClose, onSave, logs }) {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [flow, setFlow] = useState("medium");
  const [notes, setNotes] = useState("");

  function submit() {
    if (!startDate) return;
    const entry = { id: Date.now(), startDate, endDate: endDate || null, flow, notes, loggedAt: new Date().toISOString() };
    onSave([entry, ...logs]);
    onClose();
  }

  const inp = { width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 14, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", color: "#1e293b", background: "#fff", fontFamily: "inherit" };
  return (
    <Modal onClose={onClose} title="🩸 Log period">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Start date</label>
            <input type="date" style={inp} value={startDate} max={format(new Date(), "yyyy-MM-dd")} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>End date (optional)</label>
            <input type="date" style={inp} value={endDate} min={startDate} max={format(new Date(), "yyyy-MM-dd")} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Flow level</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FLOW_LEVELS.map(f => (
              <button key={f.id} onClick={() => setFlow(f.id)} style={{
                padding: "8px 16px", borderRadius: 99, border: `2px solid ${flow === f.id ? f.color : "#e2e8f0"}`,
                background: flow === f.id ? f.color + "20" : "#fff",
                color: flow === f.id ? f.color : "#64748b",
                fontSize: 13, fontWeight: flow === f.id ? 700 : 500, cursor: "pointer", fontFamily: "inherit",
              }}>{f.label}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Notes</label>
          <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} placeholder="Any notes about this period…" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <PrimaryBtn onClick={submit} style={{ width: "100%" }}>Save period</PrimaryBtn>
      </div>
    </Modal>
  );
}

function LogSymptomsModal({ onClose, onSave, symptomLogs }) {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const existing = symptomLogs[todayKey] || {};
  const [selected, setSelected] = useState(new Set(existing.symptoms || []));
  const [mood, setMood] = useState(existing.mood || "");
  const [energy, setEnergy] = useState(existing.energy || 3);
  const [notes, setNotes] = useState(existing.notes || "");

  function toggle(id) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function submit() {
    const entry = { symptoms: [...selected], mood, energy, notes, loggedAt: new Date().toISOString() };
    onSave({ ...symptomLogs, [todayKey]: entry });
    onClose();
  }

  return (
    <Modal onClose={onClose} title="How are you feeling?" wide>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Today's mood</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MOODS.map(m => (
              <button key={m.id} onClick={() => setMood(mood === m.id ? "" : m.id)} style={{
                padding: "8px 14px", borderRadius: 99, border: `1.5px solid ${mood === m.id ? "#7c3aed" : "#e2e8f0"}`,
                background: mood === m.id ? "#f5f3ff" : "#fff",
                color: mood === m.id ? "#7c3aed" : "#475569",
                fontSize: 13, fontWeight: mood === m.id ? 700 : 500, cursor: "pointer", fontFamily: "inherit", gap: 5,
                display: "flex", alignItems: "center",
              }}><span>{m.emoji}</span> {m.label}</button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Energy level</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>😩</span>
            <input type="range" min={1} max={5} value={energy} onChange={e => setEnergy(Number(e.target.value))} style={{ flex: 1 }} />
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={{ fontWeight: 800, color: "#7c3aed", minWidth: 20 }}>{energy}/5</span>
          </div>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Symptoms</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SYMPTOMS.map(s => (
              <button key={s.id} onClick={() => toggle(s.id)} style={{
                padding: "8px 14px", borderRadius: 99, border: `1.5px solid ${selected.has(s.id) ? "#e11d48" : "#e2e8f0"}`,
                background: selected.has(s.id) ? "#fff1f2" : "#fff",
                color: selected.has(s.id) ? "#e11d48" : "#475569",
                fontSize: 13, fontWeight: selected.has(s.id) ? 700 : 500, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 5,
              }}><span>{s.emoji}</span> {s.label}</button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Notes</p>
          <textarea style={{ width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 14, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "vertical" }}
            placeholder="Anything else you want to note today…" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <PrimaryBtn onClick={submit} style={{ width: "100%" }}>Save today's log</PrimaryBtn>
      </div>
    </Modal>
  );
}

function RoutineModal({ routine, onClose }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  if (!routine) return null;
  return (
    <Modal onClose={onClose} title={`${routine.emoji} ${routine.title}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f3ff", borderRadius: 12, padding: "10px 16px" }}>
          <span style={{ fontSize: 20 }}>⏱️</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#7c3aed" }}>{routine.duration} · {routine.desc}</span>
        </div>
        {!done ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {routine.steps.map((s, i) => (
                <div key={i} onClick={() => setStep(i)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12,
                  background: i === step ? "#f5f3ff" : i < step ? "#f0fdf4" : "#f8fafc",
                  border: `1.5px solid ${i === step ? "#7c3aed" : i < step ? "#86efac" : "#f1f5f9"}`,
                  cursor: "pointer",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800,
                    background: i < step ? "#22c55e" : i === step ? "#7c3aed" : "#e2e8f0",
                    color: i <= step ? "#fff" : "#94a3b8",
                  }}>{i < step ? "✓" : i + 1}</div>
                  <span style={{ fontSize: 14, color: i === step ? "#7c3aed" : i < step ? "#15803d" : "#475569", fontWeight: i === step ? 700 : 500 }}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#475569" }}>Back</button>}
              <PrimaryBtn onClick={() => step < routine.steps.length - 1 ? setStep(s => s + 1) : setDone(true)} style={{ flex: 1 }}>
                {step < routine.steps.length - 1 ? "Next step →" : "Complete ✓"}
              </PrimaryBtn>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>Routine complete!</p>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Great job taking care of yourself today.</p>
            <PrimaryBtn onClick={onClose} style={{ width: "100%" }}>Done</PrimaryBtn>
          </div>
        )}
      </div>
    </Modal>
  );
}

function CycleSettingsModal({ form, onSave, onClose }) {
  const [local, setLocal] = useState(form);
  const [err, setErr] = useState({});
  const inp = { width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 14, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", color: "#1e293b", background: "#fff", fontFamily: "inherit" };
  const lbl = { fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 };

  function validate() {
    const e = {};
    if (!local.lastPeriodDate) e.lastPeriodDate = "Required";
    if (!local.cycleLength || local.cycleLength < 21 || local.cycleLength > 45) e.cycleLength = "Must be 21–45 days";
    if (local.lutealLen && (local.lutealLen < 10 || local.lutealLen > 18)) e.lutealLen = "Must be 10–18 days";
    setErr(e);
    return !Object.keys(e).length;
  }

  function submit() { if (validate()) onSave(local); }

  return (
    <Modal onClose={onClose} title="⚙️ Cycle settings">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={lbl}>Last period started</label>
          <input type="date" style={inp} value={local.lastPeriodDate ? format(new Date(local.lastPeriodDate), "yyyy-MM-dd") : ""} max={format(new Date(), "yyyy-MM-dd")}
            onChange={e => setLocal(v => ({ ...v, lastPeriodDate: e.target.value ? new Date(e.target.value) : null }))} />
          {err.lastPeriodDate && <span style={{ fontSize: 12, color: "#ef4444", marginTop: 4, display: "block" }}>{err.lastPeriodDate}</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={lbl}>Cycle length (days)</label>
            <input type="number" min={21} max={45} style={inp} value={local.cycleLength || ""} onChange={e => setLocal(v => ({ ...v, cycleLength: parseInt(e.target.value) || "" }))} />
            {err.cycleLength && <span style={{ fontSize: 12, color: "#ef4444", marginTop: 4, display: "block" }}>{err.cycleLength}</span>}
          </div>
          <div>
            <label style={lbl}>Luteal phase (days)</label>
            <input type="number" min={10} max={18} placeholder="14" style={inp} value={local.lutealLen || ""} onChange={e => setLocal(v => ({ ...v, lutealLen: parseInt(e.target.value) || 14 }))} />
            <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>Ovulation → next period (usually 14)</span>
          </div>
        </div>
        <div>
          <label style={lbl}>Period duration (days)</label>
          <input type="number" min={1} max={10} style={inp} value={local.periodDuration || 5} onChange={e => setLocal(v => ({ ...v, periodDuration: parseInt(e.target.value) || 5 }))} />
        </div>
        {local.cycleLength > 35 && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#92400e" }}>
            ⚠️ Cycles over 35 days may indicate a hormonal imbalance. Worth mentioning to your doctor.
          </div>
        )}
        <PrimaryBtn onClick={submit} style={{ width: "100%" }}>Save cycle settings</PrimaryBtn>
      </div>
    </Modal>
  );
}

function AppSettingsModal({ settings, onSave, onClose }) {
  const [local, setLocal] = useState(settings);
  function set(key, val) { setLocal(s => ({ ...s, [key]: val })); }

  const row = (label, desc, key) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #f8fafc" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{desc}</div>}
      </div>
      <Toggle checked={local[key]} onChange={v => set(key, v)} />
    </div>
  );

  return (
    <Modal onClose={onClose} title="🔔 App settings">
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Notifications</p>
        {row("Period reminders", "Get notified 2 days before your period", "periodReminders")}
        {row("Fertile window alerts", "Know when your fertile window starts", "fertileAlerts")}
        {row("Daily insights", "Morning tips based on your current phase", "dailyInsights")}
        {row("Symptom reminders", "Daily reminder to log how you feel", "symptomReminders")}
        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 16, marginBottom: 4 }}>Display</p>
        {row("Show fertile window", "Mark fertile days on the calendar", "showFertile")}
        {row("Show ovulation day", "Highlight ovulation on the calendar", "showOvulation")}
        {row("Compact view", "Reduce spacing on Today tab", "compactView")}
        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 16, marginBottom: 4 }}>Privacy</p>
        {row("Lock app with PIN", "Require PIN to open", "pinLock")}
        {row("Incognito calendar", "Hide phase labels in calendar view", "incognito")}
      </div>
      <div style={{ marginTop: 20 }}>
        <PrimaryBtn onClick={() => { onSave(local); onClose(); }} style={{ width: "100%" }}>Save settings</PrimaryBtn>
      </div>
    </Modal>
  );
}

function DayDetailModal({ date, dateKey, logs, symptomLogs, cycleData, onClose }) {
  const periodLog = logs.find(l => l.startDate === dateKey);
  const symptomLog = symptomLogs[dateKey];
  const p = PHASES.None;
  return (
    <Modal onClose={onClose} title={format(date, "MMMM d, yyyy")}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {cycleData?.periodDays.has(dateKey) && (
          <div style={{ background: "#fff1f2", borderRadius: 12, padding: "12px 16px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#e11d48", margin: 0 }}>🩸 Period day (predicted)</p>
          </div>
        )}
        {cycleData?.ovulationDays.has(dateKey) && (
          <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "12px 16px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#10b981", margin: 0 }}>🌟 Ovulation day (predicted)</p>
          </div>
        )}
        {cycleData?.fertileDays.has(dateKey) && !cycleData?.ovulationDays.has(dateKey) && (
          <div style={{ background: "#eff6ff", borderRadius: 12, padding: "12px 16px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", margin: 0 }}>💙 Fertile window</p>
          </div>
        )}
        {periodLog && (
          <div style={{ background: "#fdf2f8", borderRadius: 12, padding: "12px 16px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#db2777", marginBottom: 4 }}>Logged period</p>
            <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>Flow: {periodLog.flow}{periodLog.notes ? ` · ${periodLog.notes}` : ""}</p>
          </div>
        )}
        {symptomLog && (
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8 }}>Today's log</p>
            {symptomLog.mood && <p style={{ fontSize: 13, color: "#475569", margin: "0 0 4px" }}>Mood: {MOODS.find(m => m.id === symptomLog.mood)?.emoji} {symptomLog.mood}</p>}
            {symptomLog.energy && <p style={{ fontSize: 13, color: "#475569", margin: "0 0 4px" }}>Energy: {symptomLog.energy}/5</p>}
            {symptomLog.symptoms?.length > 0 && <p style={{ fontSize: 13, color: "#475569", margin: "0 0 4px" }}>Symptoms: {symptomLog.symptoms.map(s => SYMPTOMS.find(x => x.id === s)?.emoji).join(" ")}</p>}
            {symptomLog.notes && <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{symptomLog.notes}</p>}
          </div>
        )}
        {!periodLog && !symptomLog && !cycleData?.periodDays.has(dateKey) && !cycleData?.fertileDays.has(dateKey) && (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px 0", fontSize: 14 }}>No data logged for this day.</p>
        )}
      </div>
    </Modal>
  );
}

// ─── Soundscape Player ────────────────────────────────────────────────────────
function SoundscapePlayer({ sound, onClose }) {
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.5);
  const [timer, setTimer] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef([]);

  function buildAudio() {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    gain.connect(ctx.destination);
    // Brown noise-like oscillator blend
    const freqs = [sound.freq, sound.freq * 1.5, sound.freq * 2.1, sound.freq * 0.5];
    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = f;
      g.gain.value = 0.06;
      osc.connect(g); g.connect(gain);
      osc.start();
      nodesRef.current.push(osc, g);
    });
    nodesRef.current.push(gain);
  }

  function stopAudio() {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    nodesRef.current = [];
  }

  function togglePlay() {
    if (!playing) { buildAudio(); setPlaying(true); }
    else { stopAudio(); setPlaying(false); }
  }

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  useEffect(() => {
    return () => { stopAudio(); clearInterval(intervalRef.current); };
  }, []);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Modal onClose={() => { stopAudio(); onClose(); }} title={`${sound.emoji} ${sound.name}`}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "8px 0" }}>
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: sound.bg, fontSize: 48, display: "flex", alignItems: "center", justifyContent: "center", border: playing ? `3px solid ${sound.color}` : "3px solid transparent", transition: "border 0.3s" }}>
          {sound.emoji}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>{fmt(elapsed)}</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{playing ? "Playing…" : "Paused"}</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <button onClick={togglePlay} style={{
            width: 60, height: 60, borderRadius: "50%", border: "none", cursor: "pointer",
            background: sound.color, color: "#fff", fontSize: 24,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{playing ? "⏸" : "▶"}</button>
          <button onClick={() => { stopAudio(); setElapsed(0); setPlaying(false); }} style={{
            width: 60, height: 60, borderRadius: "50%", border: "1.5px solid #e2e8f0", cursor: "pointer",
            background: "#fff", color: "#64748b", fontSize: 22,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>⏹</button>
        </div>
        <div style={{ width: "100%" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Volume</div>
          <input type="range" min={0} max={1} step={0.05} value={vol} onChange={e => setVol(Number(e.target.value))} style={{ width: "100%" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {[5, 10, 20, 30].map(m => (
            <Chip key={m} label={`${m} min`} selected={timer === m * 60} onClick={() => setTimer(t => t === m * 60 ? 0 : m * 60)} color={sound.color} />
          ))}
        </div>
        {timer > 0 && <p style={{ fontSize: 12, color: "#94a3b8" }}>Timer: {fmt(Math.max(0, timer - elapsed))} remaining</p>}
      </div>
    </Modal>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function TodayTab({ cycleData, form, onOpenCycleSettings, onLogPeriod, onLogSymptoms, symptomLogs }) {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todayLog = symptomLogs[todayKey];

  if (!cycleData) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "linear-gradient(135deg, #f5f3ff, #fdf2f8)", borderRadius: 24, padding: 32, textAlign: "center", border: "1px solid #ede9fe" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🌸</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>Track your cycle</h2>
          <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>Enter your last period date to see personalized daily insights.</p>
          <PrimaryBtn onClick={onOpenCycleSettings}>Set up cycle →</PrimaryBtn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          {PHASES.None.tips.map((t, i) => (
            <div key={i} style={{ background: "#fdf2f8", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#db2777", marginBottom: 4 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{t.text}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { phase, dayOfCycle, cycleLength, nextPeriodIn, nextPeriodDate } = cycleData;
  const p = PHASES[phase];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${p.bg}, #fff)`, border: `1.5px solid ${p.light}`, borderRadius: 24, padding: "24px 24px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -24, right: -24, width: 140, height: 140, borderRadius: "50%", background: p.color, opacity: 0.06 }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: p.color + "18", borderRadius: 99, padding: "4px 12px", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: p.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{p.label} phase · {p.days}</span>
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: "#0f172a", margin: "0 0 6px", lineHeight: 1.1 }}>
              {nextPeriodIn === 0 ? "Period today 🩸" : nextPeriodIn === 1 ? "1 day to period" : `${nextPeriodIn} days to period`}
            </h2>
            <p style={{ color: "#64748b", margin: "0 0 18px", fontSize: 14 }}>
              Expected {format(nextPeriodDate, "MMMM d")} · {p.tagline}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <PrimaryBtn onClick={onLogPeriod} color="#e11d48" style={{ fontSize: 13, padding: "9px 16px" }}>🩸 Log period</PrimaryBtn>
              <PrimaryBtn onClick={onLogSymptoms} style={{ fontSize: 13, padding: "9px 16px", background: p.color }}>
                {todayLog ? "✏️ Edit today's log" : "💬 How I'm feeling"}
              </PrimaryBtn>
            </div>
          </div>
          <CycleRing day={dayOfCycle} total={cycleLength} color={p.color} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12 }}>
        <StatCard label="Cycle day" value={dayOfCycle} sub={`of ${cycleLength}`} accent="#7c3aed" />
        <StatCard label="Next period" value={nextPeriodIn === 0 ? "Today" : `${nextPeriodIn}d`} sub={format(nextPeriodDate, "MMM d")} accent="#e11d48" />
        <StatCard label="Phase" value={phase} sub={p.tagline} accent={p.color} />
        {todayLog && <StatCard label="Energy today" value={`${todayLog.energy}/5`} sub={todayLog.mood ? MOODS.find(m => m.id === todayLog.mood)?.label : "Logged"} accent="#0f766e" />}
      </div>

      {/* Today's logged symptoms */}
      {todayLog && (
        <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 18, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>Today's check-in</p>
            <button onClick={onLogSymptoms} style={{ background: "none", border: "none", color: "#7c3aed", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {todayLog.mood && <span style={{ background: "#f5f3ff", color: "#7c3aed", borderRadius: 99, padding: "5px 12px", fontSize: 13, fontWeight: 600 }}>{MOODS.find(m => m.id === todayLog.mood)?.emoji} {todayLog.mood}</span>}
            {todayLog.symptoms?.map(s => { const sym = SYMPTOMS.find(x => x.id === s); return sym ? <span key={s} style={{ background: "#fff1f2", color: "#e11d48", borderRadius: 99, padding: "5px 12px", fontSize: 13, fontWeight: 600 }}>{sym.emoji} {sym.label}</span> : null; })}
          </div>
          {todayLog.notes && <p style={{ fontSize: 13, color: "#64748b", marginTop: 8, marginBottom: 0 }}>{todayLog.notes}</p>}
        </div>
      )}

      {/* Timeline */}
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 18, padding: "18px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 14 }}>Cycle progress · Day {dayOfCycle}</p>
        <PhaseTimeline dayOfCycle={dayOfCycle} cycleLength={cycleLength} />
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
          {[["#fb7185","Period"],["#a78bfa","Follicular"],["#fbbf24","Ovulation"],["#5eead4","Luteal"]].map(([c,l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
              <span style={{ fontSize: 12, color: "#64748b" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase tips */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>What your body needs now</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          {p.tips.map((t, i) => (
            <div key={i} style={{ background: p.light, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: p.color, marginBottom: 4 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{t.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarTab({ cycleData, periodLogs, symptomLogs, onLogPeriod }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(null);

  const empty = { periodDays: new Set(), fertileDays: new Set(), ovulationDays: new Set() };
  const { periodDays, fertileDays, ovulationDays } = cycleData || empty;

  // Build logged days map
  const loggedDays = {};
  periodLogs.forEach(l => { if (l.startDate) loggedDays[l.startDate] = l; });

  function prev() { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); }
  function next() { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1); }

  function handleDay(date, key) { setSelected({ date, key }); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {selected && (
        <DayDetailModal date={selected.date} dateKey={selected.key} logs={periodLogs} symptomLogs={symptomLogs} cycleData={cycleData} onClose={() => setSelected(null)} />
      )}
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#475569", padding: "4px 10px" }}>‹</button>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>{format(new Date(viewYear, viewMonth, 1), "MMMM yyyy")}</span>
          <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#475569", padding: "4px 10px" }}>›</button>
        </div>
        <MiniCalendar year={viewYear} month={viewMonth} periodDays={periodDays} fertileDays={fertileDays} ovulationDays={ovulationDays} loggedDays={loggedDays} onDayClick={handleDay} />
        <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 10, marginBottom: 0 }}>Tap any day for details</p>
      </div>

      {/* Legend */}
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Legend</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {[
            { bg: "#fb7185", text: "#fff", label: "Period", desc: "predicted" },
            { bg: "#bfdbfe", text: "#1d4ed8", label: "Fertile window", desc: "6 days" },
            { bg: "#10b981", text: "#fff", label: "Ovulation", desc: "peak day" },
          ].map(x => (
            <div key={x.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: x.bg, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#1e293b" }}>{x.label}</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{x.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <PrimaryBtn onClick={onLogPeriod} color="#e11d48" style={{ flex: 1 }}>🩸 Log a period</PrimaryBtn>
      </div>

      {!cycleData && <p style={{ textAlign: "center", fontSize: 14, color: "#94a3b8" }}>Set up your cycle to see predictions.</p>}
    </div>
  );
}

function SelfCareTab() {
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [activeSound, setActiveSound] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {activeRoutine && <RoutineModal routine={activeRoutine} onClose={() => setActiveRoutine(null)} />}
      {activeSound && <SoundscapePlayer sound={activeSound} onClose={() => setActiveSound(null)} />}

      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", marginBottom: 16 }}>🌿 Relief routines</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {RELIEF_ROUTINES.map(r => (
            <div key={r.title} onClick={() => setActiveRoutine(r)}
              style={{ display: "flex", alignItems: "center", gap: 14, background: "#fafafa", borderRadius: 14, padding: "14px 16px", border: "1px solid #f1f5f9", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.borderColor = "#ede9fe"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#f1f5f9"; }}>
              <div style={{ fontSize: 28 }}>{r.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{r.title}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{r.desc}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", padding: "4px 10px", borderRadius: 99 }}>{r.duration}</span>
                <span style={{ color: "#94a3b8", fontSize: 16 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", marginBottom: 4 }}>🎵 Soundscapes</p>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>Ambient sounds to help you relax and rest</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
          {SOUNDSCAPES.map(s => (
            <div key={s.id} onClick={() => setActiveSound(s)}
              style={{ background: s.bg, borderRadius: 16, padding: "18px 14px", cursor: "pointer", transition: "transform 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.name}</div>
              <div style={{ fontSize: 11, color: s.color, opacity: 0.7, marginTop: 2 }}>Tap to play</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #fdf2f8, #f5f3ff)", border: "1px solid #ede9fe", borderRadius: 20, padding: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>💊 Quick reminders</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { emoji: "💧", text: "Drink 8+ glasses of water today" },
            { emoji: "🌙", text: "Aim for 7–9 hours of sleep" },
            { emoji: "🥗", text: "Eat a colourful, iron-rich meal" },
            { emoji: "🚶", text: "Even a 10-minute walk helps" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "#475569" }}>
              <span style={{ fontSize: 18 }}>{r.emoji}</span>
              {r.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalysisTab({ cycleData, form, periodLogs, symptomLogs }) {
  if (!cycleData) {
    return (
      <div style={{ background: "#f8fafc", borderRadius: 20, padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>No data yet</p>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>Set up your cycle to unlock analysis and insights.</p>
      </div>
    );
  }

  const { phase, dayOfCycle, cycleLength, nextPeriodIn, nextPeriodDate, ovDay } = cycleData;
  const p = PHASES[phase];
  const lph = form.lutealLen || 14;
  const ovuDate = addDays(nextPeriodDate, -lph);
  const fertileStart = subDays(ovuDate, 5);

  // Symptom frequency from logs
  const symCount = {};
  Object.values(symptomLogs).forEach(log => { (log.symptoms || []).forEach(s => { symCount[s] = (symCount[s] || 0) + 1; }); });
  const topSymptoms = Object.entries(symCount).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Mood distribution
  const moodCount = {};
  Object.values(symptomLogs).forEach(log => { if (log.mood) moodCount[log.mood] = (moodCount[log.mood] || 0) + 1; });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12 }}>
        <StatCard label="Cycle length" value={cycleLength} sub="days" accent="#7c3aed" />
        <StatCard label="Periods logged" value={periodLogs.length} sub="entries" accent="#e11d48" />
        <StatCard label="Days tracked" value={Object.keys(symptomLogs).length} sub="check-ins" accent="#0f766e" />
        <StatCard label="Cycle day" value={dayOfCycle} sub={`of ${cycleLength}`} accent={p.color} />
      </div>

      {/* Current cycle */}
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", marginBottom: 4 }}>Current cycle snapshot</p>
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 18 }}>Started {form.lastPeriodDate ? format(new Date(form.lastPeriodDate), "MMM d, yyyy") : "—"}</p>
        <PhaseTimeline dayOfCycle={dayOfCycle} cycleLength={cycleLength} />
        <div style={{ marginTop: 14, padding: "12px 14px", background: p.bg, borderRadius: 12, border: `1px solid ${p.light}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>Currently: {phase} phase</span>
          <span style={{ fontSize: 13, color: "#475569" }}> — {p.days} · {p.tagline}</span>
        </div>
      </div>

      {/* Upcoming dates */}
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", marginBottom: 16 }}>Upcoming dates</p>
        {[
          { emoji: "🌱", label: "Fertile window starts", date: format(fertileStart, "MMM d"), desc: "6-day window opens" },
          { emoji: "🌟", label: "Ovulation", date: format(ovuDate, "MMM d"), desc: "Peak fertility day" },
          { emoji: "🩸", label: "Next period", date: format(nextPeriodDate, "MMM d"), desc: `${nextPeriodIn} days away` },
        ].map(x => (
          <div key={x.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0", borderBottom: "1px solid #f8fafc" }}>
            <span style={{ fontSize: 22 }}>{x.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{x.label}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{x.desc}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#7c3aed" }}>{x.date}</div>
          </div>
        ))}
      </div>

      {/* Symptoms insight */}
      {topSymptoms.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", marginBottom: 16 }}>Most common symptoms</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topSymptoms.map(([id, count]) => {
              const sym = SYMPTOMS.find(s => s.id === id);
              const pct = Math.round((count / Object.keys(symptomLogs).length) * 100);
              return sym ? (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{sym.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{sym.label}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{count}× ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99 }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#fb7185", borderRadius: 99, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Period history */}
      {periodLogs.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", marginBottom: 16 }}>Period history</p>
          {periodLogs.slice(0, 5).map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
              <span style={{ fontSize: 20 }}>🩸</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{format(new Date(l.startDate), "MMMM d, yyyy")}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{l.flow} flow{l.endDate ? ` · ended ${format(new Date(l.endDate), "MMM d")}` : ""}</div>
              </div>
              {l.notes && <div style={{ fontSize: 12, color: "#94a3b8", maxWidth: 100, textAlign: "right" }}>{l.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  periodReminders: true, fertileAlerts: true, dailyInsights: true, symptomReminders: false,
  showFertile: true, showOvulation: true, compactView: false, pinLock: false, incognito: false,
};

export default function PeriodTracker() {
  const [tab, setTab] = useState("today");
  const [modal, setModal] = useState(null); // "cycle" | "symptoms" | "period" | "appsettings"
  const [form, setForm] = useState({ lastPeriodDate: null, cycleLength: 28, lutealLen: 14, periodDuration: 5 });
  const [cycleData, setCycleData] = useState(null);
  const [periodLogs, setPeriodLogs] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState({});
  const [appSettings, setAppSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    async function loadData() {
      try {
        const fRes = await window.storage?.get("pt-form");
        if (fRes?.value) { const f = JSON.parse(fRes.value); if (f.lastPeriodDate) f.lastPeriodDate = new Date(f.lastPeriodDate); setForm(f); }
        const plRes = await window.storage?.get("pt-periods");
        if (plRes?.value) setPeriodLogs(JSON.parse(plRes.value));
        const slRes = await window.storage?.get("pt-symptoms");
        if (slRes?.value) setSymptomLogs(JSON.parse(slRes.value));
        const asRes = await window.storage?.get("pt-settings");
        if (asRes?.value) setAppSettings(JSON.parse(asRes.value));
      } catch {}
    }
    loadData();
  }, []);

  useEffect(() => {
    if (form.lastPeriodDate && form.cycleLength >= 21 && form.cycleLength <= 45) {
      try { setCycleData(computeCycleData(form.lastPeriodDate, form.cycleLength, form.lutealLen || 14)); }
      catch { setCycleData(null); }
    } else setCycleData(null);
  }, [form]);

  function saveForm(f) { setForm(f); save("pt-form", f); setModal(null); }
  function savePeriods(logs) { setPeriodLogs(logs); save("pt-periods", logs); }
  function saveSymptoms(logs) { setSymptomLogs(logs); save("pt-symptoms", logs); }
  function saveAppSettings(s) { setAppSettings(s); save("pt-settings", s); }

  const nav = [
    { id: "today", icon: "🏠", label: "Today" },
    { id: "calendar", icon: "📅", label: "Calendar" },
    { id: "selfcare", icon: "💆", label: "Self care" },
    { id: "analysis", icon: "📊", label: "Analysis" },
  ];

  const activePhase = cycleData?.phase || "None";
  const p = PHASES[activePhase];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#faf5ff 0%,#fff 40%,#fdf2f8 100%)", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", display: "flex", flexDirection: "column" }}>

      {modal === "cycle" && <CycleSettingsModal form={form} onSave={saveForm} onClose={() => setModal(null)} />}
      {modal === "period" && <LogPeriodModal onClose={() => setModal(null)} onSave={savePeriods} logs={periodLogs} />}
      {modal === "symptoms" && <LogSymptomsModal onClose={() => setModal(null)} onSave={saveSymptoms} symptomLogs={symptomLogs} />}
      {modal === "appsettings" && <AppSettingsModal settings={appSettings} onSave={saveAppSettings} onClose={() => setModal(null)} />}

      {/* Header */}
      <header style={{ padding: "14px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0, lineHeight: 1 }}>GlowHer</h1>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>
            {cycleData ? `${activePhase} phase · Day ${cycleData.dayOfCycle}` : "Period tracker"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {cycleData && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: p.color + "15", borderRadius: 99, padding: "5px 12px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.tagline}</span>
            </div>
          )}
          <button onClick={() => setModal("appsettings")} title="App settings" style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>⚙️</button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Desktop sidebar */}
        <aside className="sidebar-nav" style={{ width: 210, padding: "20px 12px", flexShrink: 0, borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 4 }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 12, border: "none", cursor: "pointer", background: tab === n.id ? "#f5f3ff" : "transparent", color: tab === n.id ? "#7c3aed" : "#64748b", fontSize: 14, fontWeight: tab === n.id ? 700 : 500, fontFamily: "inherit", textAlign: "left", width: "100%", transition: "all 0.15s" }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}

          <div style={{ height: 1, background: "#f1f5f9", margin: "8px 4px" }} />

          {/* Quick actions */}
          <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", padding: "4px 16px 2px" }}>Quick actions</p>
          {[
            { icon: "🩸", label: "Log period", action: () => setModal("period") },
            { icon: "💬", label: "Log symptoms", action: () => setModal("symptoms") },
            { icon: "🔧", label: "Cycle settings", action: () => setModal("cycle") },
          ].map(x => (
            <button key={x.label} onClick={x.action} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", borderRadius: 12, border: "none", cursor: "pointer", background: "transparent", color: "#64748b", fontSize: 13, fontWeight: 500, fontFamily: "inherit", textAlign: "left", width: "100%", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#1e293b"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}>
              <span style={{ fontSize: 16 }}>{x.icon}</span><span>{x.label}</span>
            </button>
          ))}

          {cycleData && (
            <div style={{ marginTop: "auto", padding: "14px", borderRadius: 16, background: p.bg, border: `1px solid ${p.light}` }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>🗓️</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: p.color }}>Next period</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "2px 0" }}>
                {cycleData.nextPeriodIn === 0 ? "Today" : `${cycleData.nextPeriodIn}d`}
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{format(cycleData.nextPeriodDate, "MMM d")}</div>
            </div>
          )}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: "auto", padding: "22px", paddingBottom: 90 }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {tab === "today" && <TodayTab cycleData={cycleData} form={form} onOpenCycleSettings={() => setModal("cycle")} onLogPeriod={() => setModal("period")} onLogSymptoms={() => setModal("symptoms")} symptomLogs={symptomLogs} />}
            {tab === "calendar" && <CalendarTab cycleData={cycleData} periodLogs={periodLogs} symptomLogs={symptomLogs} onLogPeriod={() => setModal("period")} />}
            {tab === "selfcare" && <SelfCareTab />}
            {tab === "analysis" && <AnalysisTab cycleData={cycleData} form={form} periodLogs={periodLogs} symptomLogs={symptomLogs} />}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-around", padding: "8px 0 env(safe-area-inset-bottom,8px)", zIndex: 50 }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: tab === n.id ? "#f5f3ff" : "none", border: "none", cursor: "pointer", padding: "7px 16px", borderRadius: 12, color: tab === n.id ? "#7c3aed" : "#94a3b8", fontFamily: "inherit", fontSize: 10, fontWeight: tab === n.id ? 700 : 500 }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span><span>{n.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        @media (min-width: 640px) { .sidebar-nav{display:flex!important} .bottom-nav{display:none!important} }
        @media (max-width: 639px) { .sidebar-nav{display:none!important} .bottom-nav{display:flex!important} }
      `}</style>
    </div>
  );
}
