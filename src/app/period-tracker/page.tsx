"use client";

import { useState, useEffect, useRef } from "react";

// ─── Inline date utilities ─────────────────────────────────────────────────────
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
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthsShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return fmt
    .replace("yyyy", dt.getFullYear())
    .replace("MMMM", months[dt.getMonth()])
    .replace("MMM", monthsShort[dt.getMonth()])
    .replace("MM", String(dt.getMonth()+1).padStart(2,"0"))
    .replace("dd", String(dt.getDate()).padStart(2,"0"))
    .replace("d", dt.getDate());
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PHASES = {
  Menstrual:  { label:"Menstrual",  days:"Days 1–5",    tagline:"Rest & restore", color:"#e11d48", calColor:"#fb7185", bg:"#fff1f2", light:"#ffe4e6", fertility:"LOW", tips:[{icon:"🥬",title:"Iron-rich foods",text:"Spinach, lentils, and dark chocolate replenish iron lost during bleeding."},{icon:"🧘",title:"Gentle movement",text:"Light yoga or slow walks — your body's doing hard work, let it lead."},{icon:"🌡️",title:"Heat therapy",text:"A warm compress on your abdomen eases cramps effectively."},{icon:"📓",title:"Rest & reflect",text:"Intuition is sharp this week. Journal, slow down, be kind to yourself."}] },
  Follicular: { label:"Follicular", days:"Days 6–13",   tagline:"Rise & begin",   color:"#7c3aed", calColor:"#a78bfa", bg:"#f5f3ff", light:"#ede9fe", fertility:"LOW", tips:[{icon:"🥗",title:"Lean proteins",text:"Complex carbs and protein support your rising energy."},{icon:"🏃",title:"Build momentum",text:"Energy is climbing — try a new workout class or brisk walk."},{icon:"💡",title:"Create & plan",text:"Mental clarity peaks here. Great time for big projects."},{icon:"✨",title:"Skin glow",text:"Estrogen peaks — skin is often clearest. Keep routine simple."}] },
  Ovulation:  { label:"Ovulation",  days:"Peak day",    tagline:"Peak energy",    color:"#d97706", calColor:"#fbbf24", bg:"#fffbeb", light:"#fef3c7", fertility:"HIGH", tips:[{icon:"🫐",title:"Antioxidants",text:"Berries, leafy greens, and fiber support hormone processing."},{icon:"💪",title:"Peak performance",text:"You're at your strongest — HIIT, running, heavy lifting, go for it."},{icon:"🗣️",title:"Speak up",text:"Verbal confidence peaks. Great for negotiations and presentations."},{icon:"❤️",title:"Connect",text:"High confidence. Best time for social events and important conversations."}] },
  Luteal:     { label:"Luteal",     days:"Days 15–28",  tagline:"Wind down",      color:"#0f766e", calColor:"#5eead4", bg:"#f0fdfa", light:"#ccfbf1", fertility:"LOW", tips:[{icon:"🥦",title:"Manage PMS",text:"Magnesium-rich foods and B-vitamins ease mood swings. Reduce caffeine."},{icon:"🏊",title:"Ease off",text:"Swap intense workouts for Pilates, swimming, or restorative yoga."},{icon:"💧",title:"Stay hydrated",text:"Bloating is common. Up water intake and wear comfortable clothing."},{icon:"🛁",title:"Deep self-care",text:"Turn inward — a bath, a book, a film. Cozy over productive."}] },
  None:       { label:"Not set",    days:"",            tagline:"Set up cycle",   color:"#db2777", calColor:"#f9a8d4", bg:"#fdf2f8", light:"#fce7f3", fertility:"—",   tips:[{icon:"📅",title:"Track your cycle",text:"Enter your last period date to unlock personalized daily insights."},{icon:"🔍",title:"Spot patterns",text:"Tracking helps you understand what's normal for your unique body."},{icon:"💪",title:"Sync workouts",text:"Align your exercise with your natural hormonal rhythm for better results."},{icon:"🥗",title:"Eat with your cycle",text:"Each phase calls for different nutrients to feel your best."}] },
};

const SYMPTOMS = [
  {id:"cramps",emoji:"🌀",label:"Cramps"},{id:"headache",emoji:"🤕",label:"Headache"},
  {id:"bloating",emoji:"💨",label:"Bloating"},{id:"fatigue",emoji:"😴",label:"Fatigue"},
  {id:"mood_swings",emoji:"🎢",label:"Mood swings"},{id:"acne",emoji:"😮",label:"Acne"},
  {id:"breast_tenderness",emoji:"💗",label:"Breast pain"},{id:"nausea",emoji:"🤢",label:"Nausea"},
  {id:"back_pain",emoji:"🦴",label:"Back pain"},{id:"cravings",emoji:"🍫",label:"Cravings"},
  {id:"insomnia",emoji:"🌙",label:"Insomnia"},{id:"anxiety",emoji:"😰",label:"Anxiety"},
];
const MOODS = [
  {id:"happy",emoji:"😊",label:"Happy"},{id:"calm",emoji:"😌",label:"Calm"},
  {id:"energetic",emoji:"⚡",label:"Energetic"},{id:"sad",emoji:"😢",label:"Sad"},
  {id:"anxious",emoji:"😰",label:"Anxious"},{id:"irritable",emoji:"😤",label:"Irritable"},
  {id:"tired",emoji:"😩",label:"Tired"},{id:"sensitive",emoji:"🥺",label:"Sensitive"},
];
const FLOW_LEVELS = [
  {id:"spotting",label:"Spotting",color:"#fda4af"},{id:"light",label:"Light",color:"#fb7185"},
  {id:"medium",label:"Medium",color:"#e11d48"},{id:"heavy",label:"Heavy",color:"#9f1239"},
];
const SOUNDSCAPES = [
  {id:"forest",name:"Forest Adventure",emoji:"🌲",bg:"#d1fae5",color:"#065f46",freq:180},
  {id:"rain",name:"Forest Rain",emoji:"🌧️",bg:"#dbeafe",color:"#1e40af",freq:220},
  {id:"ocean",name:"Ocean Waves",emoji:"🌊",bg:"#cffafe",color:"#164e63",freq:140},
  {id:"night",name:"Night Crickets",emoji:"🌙",bg:"#ede9fe",color:"#4c1d95",freq:440},
  {id:"fire",name:"Crackling Fire",emoji:"🔥",bg:"#fef3c7",color:"#92400e",freq:160},
  {id:"wind",name:"Mountain Wind",emoji:"🏔️",bg:"#f1f5f9",color:"#334155",freq:100},
];
const RELIEF_ROUTINES = [
  {title:"Period pain relief",duration:"12 min",emoji:"🧘‍♀️",desc:"Gentle yoga flows to ease cramps",steps:["Child's pose (2 min)","Supine twist (3 min)","Reclined butterfly (3 min)","Savasana (4 min)"]},
  {title:"Foot reflexology",duration:"6 min",emoji:"🦶",desc:"Pressure points connected to the uterus",steps:["Warm foot soak (2 min)","Inner arch press (2 min)","Ankle rotation (2 min)"]},
  {title:"Breathing for cramps",duration:"8 min",emoji:"💨",desc:"4-7-8 breathing reduces pain signals",steps:["Inhale 4 counts","Hold 7 counts","Exhale 8 counts","Repeat 8 cycles"]},
  {title:"Hip opening flow",duration:"15 min",emoji:"🌸",desc:"Releases pelvic tension and improves circulation",steps:["Pigeon pose left (3 min)","Pigeon pose right (3 min)","Lizard pose (3 min)","Happy baby (3 min)","Rest (3 min)"]},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(v,mn,mx){return Math.max(mn,Math.min(mx,v));}
function save(key,val){try{window.storage?.set(key,JSON.stringify(val));}catch{}}
function computeCycleData(lastPeriodDate, cycleLength, lutealLen) {
  const lph = lutealLen || 14;
  const today = startOfDay(new Date());
  let cycleStart = startOfDay(new Date(lastPeriodDate));
  while (addDays(cycleStart, cycleLength) < today) cycleStart = addDays(cycleStart, cycleLength);
  const nextPeriodStart = addDays(cycleStart, cycleLength);
  const ovDay = addDays(nextPeriodStart, -lph);
  const periodEnd = addDays(cycleStart, 4);
  const dayOfCycle = Math.max(1, differenceInDays(today, cycleStart) + 1);
  const nextPeriodIn = differenceInDays(nextPeriodStart, today);
  let phase = "None";
  if (isWithinInterval(today,{start:cycleStart,end:periodEnd})) phase = "Menstrual";
  else if (isWithinInterval(today,{start:addDays(periodEnd,1),end:subDays(ovDay,1)})) phase = "Follicular";
  else if (isSameDay(today,ovDay)) phase = "Ovulation";
  else if (isWithinInterval(today,{start:addDays(ovDay,1),end:subDays(nextPeriodStart,1)})) phase = "Luteal";
  const periodDays=new Set(), fertileDays=new Set(), ovulationDays=new Set();
  for (let i=-1;i<5;i++){
    const cs=addDays(cycleStart,cycleLength*i);
    const nps=addDays(cs,cycleLength);
    const ov=addDays(nps,-lph);
    for(let j=0;j<5;j++){periodDays.add(format(addDays(cs,j),"yyyy-MM-dd"));}
    for(let j=5;j>=0;j--)fertileDays.add(format(subDays(ov,j),"yyyy-MM-dd"));
    ovulationDays.add(format(ov,"yyyy-MM-dd"));
  }
  // map every calendar day to its phase label
  const dayPhaseMap = {};
  for (let i=-1;i<5;i++){
    const cs=addDays(cycleStart,cycleLength*i);
    const nps=addDays(cs,cycleLength);
    const ov=addDays(nps,-lph);
    const pe=addDays(cs,4);
    for(let j=0;j<cycleLength;j++){
      const d=addDays(cs,j);
      const k=format(d,"yyyy-MM-dd");
      if(isWithinInterval(d,{start:cs,end:pe})) dayPhaseMap[k]="Menstrual";
      else if(isSameDay(d,ov)) dayPhaseMap[k]="Ovulation";
      else if(isWithinInterval(d,{start:addDays(pe,1),end:subDays(ov,1)})) dayPhaseMap[k]="Follicular";
      else dayPhaseMap[k]="Luteal";
    }
  }
  return {phase,dayOfCycle,cycleLength,nextPeriodIn,nextPeriodDate:nextPeriodStart,cycleStart,ovDay,periodDays,fertileDays,ovulationDays,dayPhaseMap};
}

// ─── Cat SVG Mascot ───────────────────────────────────────────────────────────
function CatMascot({size=120}) {
  return (
    <svg width={size} height={size*1.1} viewBox="0 0 120 132" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <ellipse cx="60" cy="95" rx="34" ry="28" fill="#4a4a5a"/>
      {/* tail */}
      <path d="M94 110 Q115 105 112 88 Q109 75 100 80" stroke="#4a4a5a" strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* head */}
      <ellipse cx="60" cy="58" rx="30" ry="27" fill="#5a5a6a"/>
      {/* ears */}
      <polygon points="35,36 28,16 48,30" fill="#5a5a6a"/>
      <polygon points="85,36 92,16 72,30" fill="#5a5a6a"/>
      <polygon points="37,34 31,20 46,31" fill="#f9a8d4"/>
      <polygon points="83,34 89,20 74,31" fill="#f9a8d4"/>
      {/* face white */}
      <ellipse cx="60" cy="62" rx="22" ry="19" fill="#e8e8f0"/>
      {/* eyes */}
      <circle cx="50" cy="56" r="8" fill="white"/>
      <circle cx="70" cy="56" r="8" fill="white"/>
      <circle cx="50" cy="56" r="5" fill="#1e1e2e"/>
      <circle cx="70" cy="56" r="5" fill="#1e1e2e"/>
      <circle cx="52" cy="54" r="2" fill="white"/>
      <circle cx="72" cy="54" r="2" fill="white"/>
      {/* nose */}
      <ellipse cx="60" cy="66" rx="3" ry="2" fill="#f9a8d4"/>
      {/* mouth */}
      <path d="M57 68 Q60 71 63 68" stroke="#666" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* whiskers */}
      <line x1="38" y1="64" x2="54" y2="66" stroke="#999" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="38" y1="68" x2="54" y2="68" stroke="#999" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="66" y1="66" x2="82" y2="64" stroke="#999" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="66" y1="68" x2="82" y2="68" stroke="#999" strokeWidth="1.2" strokeLinecap="round"/>
      {/* bow */}
      <path d="M50 86 Q55 80 60 86 Q65 80 70 86 Q65 90 60 86 Q55 90 50 86" fill="#f59e0b"/>
      <circle cx="60" cy="86" r="3" fill="#fbbf24"/>
      {/* food bowl */}
      <ellipse cx="60" cy="122" rx="24" ry="6" fill="#d1d5db"/>
      <ellipse cx="60" cy="119" rx="20" ry="4" fill="#e5e7eb"/>
    </svg>
  );
}

// ─── UI Primitives ────────────────────────────────────────────────────────────
function Modal({onClose,children,title,wide}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:24,padding:28,width:"100%",maxWidth:wide?560:440,boxShadow:"0 24px 64px rgba(0,0,0,0.18)",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <h2 style={{fontSize:18,fontWeight:800,color:"#1e293b",margin:0}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:"#94a3b8",lineHeight:1,padding:"0 4px"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PrimaryBtn({onClick,children,color,style={}}){
  return(
    <button onClick={onClick} style={{padding:"13px 24px",borderRadius:99,border:"none",cursor:"pointer",background:color||"linear-gradient(135deg,#e11d48,#db2777)",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"inherit",transition:"opacity 0.15s",...style}}
      onMouseEnter={e=>e.currentTarget.style.opacity="0.88"}
      onMouseLeave={e=>e.currentTarget.style.opacity="1"}
    >{children}</button>
  );
}

function Toggle({checked,onChange}){
  return(
    <div onClick={()=>onChange(!checked)} style={{width:44,height:24,borderRadius:99,cursor:"pointer",background:checked?"#e11d48":"#e2e8f0",position:"relative",transition:"background 0.2s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:checked?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",transition:"left 0.2s"}}/>
    </div>
  );
}

function Chip({label,selected,onClick,color}){
  return(
    <button onClick={onClick} style={{padding:"7px 14px",borderRadius:99,border:`1.5px solid ${selected?color||"#e11d48":"#e2e8f0"}`,background:selected?(color||"#e11d48")+"15":"#fff",color:selected?color||"#e11d48":"#64748b",fontSize:13,fontWeight:selected?700:500,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{label}</button>
  );
}

// Cycle ring like the app
function CycleRing({day,total,color}){
  const r=38,cx=48,cy=48,stroke=7,circ=2*Math.PI*r;
  const progress=clamp(day/total,0,1);
  return(
    <svg width={96} height={96} viewBox="0 0 96 96">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${progress*circ} ${circ}`} strokeLinecap="round"
        style={{transform:"rotate(-90deg)",transformOrigin:"center",transition:"stroke-dasharray 0.6s ease"}}/>
      <circle cx={cx} cy={cy} r={4} fill="#94a3b8" style={{transform:`rotate(${progress*360-90}deg)`,transformOrigin:`${cx}px ${cy}px`}}/>
      <text x={cx} y={cy+6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">{day||"—"}</text>
    </svg>
  );
}

// Horizontal cycle bar (like the app's cycle timeline)
function CycleBar({cycleData}){
  if(!cycleData) return null;
  const {dayOfCycle,cycleLength,cycleStart} = cycleData;
  const pct = clamp((dayOfCycle/cycleLength)*100,0,100);
  const periodEnd=5, ovDay=Math.round(cycleLength*0.52);
  const segments=[
    {label:"Period",w:(periodEnd/cycleLength)*100,bg:"#fb7185"},
    {label:"Follicular",w:((ovDay-1-periodEnd)/cycleLength)*100,bg:"#fbbf24"},
    {label:"Ovulation",w:(1/cycleLength)*100,bg:"#fbbf24"},
    {label:"Luteal",w:((cycleLength-ovDay)/cycleLength)*100,bg:"#fca5a5"},
  ];
  return(
    <div style={{padding:"16px 20px 20px",background:"#fff",borderRadius:20,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
      <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:2}}>Today — Cycle Day {dayOfCycle}</div>
      <div style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>{PHASES[cycleData.phase]?.fertility||"LOW"} — Chance of getting pregnant</div>
      <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>{format(cycleStart,"MMM d")}</div>
      <div style={{position:"relative",height:12,borderRadius:99,overflow:"visible",display:"flex",marginBottom:28}}>
        <div style={{display:"flex",width:"100%",borderRadius:99,overflow:"hidden",height:"100%"}}>
          {segments.map((s,i)=><div key={i} style={{background:s.bg,width:`${s.w}%`,height:"100%",flexShrink:0}}/>)}
        </div>
        {/* today marker */}
        <div style={{position:"absolute",top:-4,left:`calc(${pct}% - 1.5px)`,height:20,width:3,background:"#1e293b",borderRadius:99,boxShadow:"0 0 0 2px #fff,0 0 0 3.5px #1e293b",transition:"left 0.4s ease"}}/>
        {/* today bubble */}
        <div style={{position:"absolute",top:24,left:`calc(${pct}% - 24px)`,background:"#fff",border:"2px solid #1e293b",borderRadius:99,padding:"2px 10px",fontSize:11,fontWeight:700,color:"#1e293b",whiteSpace:"nowrap",boxShadow:"0 2px 6px rgba(0,0,0,0.1)"}}>Today</div>
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function LogPeriodModal({onClose,onSave,logs}){
  const [startDate,setStartDate]=useState(format(new Date(),"yyyy-MM-dd"));
  const [endDate,setEndDate]=useState("");
  const [flow,setFlow]=useState("medium");
  const [notes,setNotes]=useState("");
  function submit(){if(!startDate)return;const entry={id:Date.now(),startDate,endDate:endDate||null,flow,notes,loggedAt:new Date().toISOString()};onSave([entry,...logs]);onClose();}
  const inp={width:"100%",padding:"10px 12px",borderRadius:10,fontSize:14,border:"1.5px solid #e2e8f0",outline:"none",boxSizing:"border-box",color:"#1e293b",background:"#fff",fontFamily:"inherit"};
  return(
    <Modal onClose={onClose} title="🩸 Log period">
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><label style={{fontSize:12,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:6}}>Start date</label><input type="date" style={inp} value={startDate} max={format(new Date(),"yyyy-MM-dd")} onChange={e=>setStartDate(e.target.value)}/></div>
          <div><label style={{fontSize:12,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:6}}>End date (optional)</label><input type="date" style={inp} value={endDate} min={startDate} max={format(new Date(),"yyyy-MM-dd")} onChange={e=>setEndDate(e.target.value)}/></div>
        </div>
        <div><label style={{fontSize:12,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:8}}>Flow level</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {FLOW_LEVELS.map(f=><button key={f.id} onClick={()=>setFlow(f.id)} style={{padding:"8px 16px",borderRadius:99,border:`2px solid ${flow===f.id?f.color:"#e2e8f0"}`,background:flow===f.id?f.color+"20":"#fff",color:flow===f.id?f.color:"#64748b",fontSize:13,fontWeight:flow===f.id?700:500,cursor:"pointer",fontFamily:"inherit"}}>{f.label}</button>)}
          </div>
        </div>
        <div><label style={{fontSize:12,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:6}}>Notes</label><textarea style={{...inp,minHeight:80,resize:"vertical"}} placeholder="Any notes…" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <PrimaryBtn onClick={submit} style={{width:"100%"}}>Save period</PrimaryBtn>
      </div>
    </Modal>
  );
}

function LogSymptomsModal({onClose,onSave,symptomLogs}){
  const todayKey=format(new Date(),"yyyy-MM-dd");
  const existing=symptomLogs[todayKey]||{};
  const [selected,setSelected]=useState(new Set(existing.symptoms||[]));
  const [mood,setMood]=useState(existing.mood||"");
  const [energy,setEnergy]=useState(existing.energy||3);
  const [notes,setNotes]=useState(existing.notes||"");
  function toggle(id){setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});}
  function submit(){const entry={symptoms:[...selected],mood,energy,notes,loggedAt:new Date().toISOString()};onSave({...symptomLogs,[todayKey]:entry});onClose();}
  return(
    <Modal onClose={onClose} title="How are you feeling?" wide>
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <div><p style={{fontSize:13,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Today's mood</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {MOODS.map(m=><button key={m.id} onClick={()=>setMood(mood===m.id?"":m.id)} style={{padding:"8px 14px",borderRadius:99,border:`1.5px solid ${mood===m.id?"#e11d48":"#e2e8f0"}`,background:mood===m.id?"#fff1f2":"#fff",color:mood===m.id?"#e11d48":"#475569",fontSize:13,fontWeight:mood===m.id?700:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}><span>{m.emoji}</span>{m.label}</button>)}
          </div>
        </div>
        <div><p style={{fontSize:13,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Energy level</p>
          <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:20}}>😩</span><input type="range" min={1} max={5} value={energy} onChange={e=>setEnergy(Number(e.target.value))} style={{flex:1}}/><span style={{fontSize:20}}>⚡</span><span style={{fontWeight:800,color:"#e11d48",minWidth:28}}>{energy}/5</span></div>
        </div>
        <div><p style={{fontSize:13,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Symptoms</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {SYMPTOMS.map(s=><button key={s.id} onClick={()=>toggle(s.id)} style={{padding:"8px 14px",borderRadius:99,border:`1.5px solid ${selected.has(s.id)?"#e11d48":"#e2e8f0"}`,background:selected.has(s.id)?"#fff1f2":"#fff",color:selected.has(s.id)?"#e11d48":"#475569",fontSize:13,fontWeight:selected.has(s.id)?700:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}><span>{s.emoji}</span>{s.label}</button>)}
          </div>
        </div>
        <div><p style={{fontSize:13,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Notes</p><textarea style={{width:"100%",padding:"10px 12px",borderRadius:10,fontSize:14,border:"1.5px solid #e2e8f0",outline:"none",boxSizing:"border-box",fontFamily:"inherit",minHeight:70,resize:"vertical"}} placeholder="Anything else today…" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <PrimaryBtn onClick={submit} style={{width:"100%"}}>Save today's log</PrimaryBtn>
      </div>
    </Modal>
  );
}

function CycleSettingsModal({form,onSave,onClose}){
  const [local,setLocal]=useState(form);
  const [err,setErr]=useState({});
  const inp={width:"100%",padding:"10px 12px",borderRadius:10,fontSize:14,border:"1.5px solid #e2e8f0",outline:"none",boxSizing:"border-box",color:"#1e293b",background:"#fff",fontFamily:"inherit"};
  const lbl={fontSize:12,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:6};
  function validate(){const e={};if(!local.lastPeriodDate)e.lastPeriodDate="Required";if(!local.cycleLength||local.cycleLength<21||local.cycleLength>45)e.cycleLength="Must be 21–45";setErr(e);return!Object.keys(e).length;}
  function submit(){if(validate())onSave(local);}
  return(
    <Modal onClose={onClose} title="⚙️ Cycle settings">
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div><label style={lbl}>Last period started</label><input type="date" style={inp} value={local.lastPeriodDate?format(new Date(local.lastPeriodDate),"yyyy-MM-dd"):""} max={format(new Date(),"yyyy-MM-dd")} onChange={e=>setLocal(v=>({...v,lastPeriodDate:e.target.value?new Date(e.target.value + 'T00:00:00'):null}))}/>{err.lastPeriodDate&&<span style={{fontSize:12,color:"#ef4444",marginTop:4,display:"block"}}>{err.lastPeriodDate}</span>}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div><label style={lbl}>Cycle length (days)</label><input type="number" min={21} max={45} style={inp} value={local.cycleLength||""} onChange={e=>setLocal(v=>({...v,cycleLength:parseInt(e.target.value)||""}))}/>{err.cycleLength&&<span style={{fontSize:12,color:"#ef4444",marginTop:4,display:"block"}}>{err.cycleLength}</span>}</div>
          <div><label style={lbl}>Luteal phase</label><input type="number" min={10} max={18} placeholder="14" style={inp} value={local.lutealLen||""} onChange={e=>setLocal(v=>({...v,lutealLen:parseInt(e.target.value)||14}))}/></div>
        </div>
        <PrimaryBtn onClick={submit} style={{width:"100%"}}>Save cycle settings</PrimaryBtn>
      </div>
    </Modal>
  );
}

function RoutineModal({routine,onClose}){
  const [step,setStep]=useState(0);
  const [done,setDone]=useState(false);
  if(!routine)return null;
  return(
    <Modal onClose={onClose} title={`${routine.emoji} ${routine.title}`}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff1f2",borderRadius:12,padding:"10px 16px"}}><span style={{fontSize:20}}>⏱️</span><span style={{fontSize:14,fontWeight:600,color:"#e11d48"}}>{routine.duration} · {routine.desc}</span></div>
        {!done?(
          <>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {routine.steps.map((s,i)=>(
                <div key={i} onClick={()=>setStep(i)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,background:i===step?"#fff1f2":i<step?"#f0fdf4":"#f8fafc",border:`1.5px solid ${i===step?"#e11d48":i<step?"#86efac":"#f1f5f9"}`,cursor:"pointer"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,background:i<step?"#22c55e":i===step?"#e11d48":"#e2e8f0",color:i<=step?"#fff":"#94a3b8"}}>{i<step?"✓":i+1}</div>
                  <span style={{fontSize:14,color:i===step?"#e11d48":i<step?"#15803d":"#475569",fontWeight:i===step?700:500}}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:12,borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",color:"#475569"}}>Back</button>}
              <PrimaryBtn onClick={()=>step<routine.steps.length-1?setStep(s=>s+1):setDone(true)} style={{flex:1}}>{step<routine.steps.length-1?"Next step →":"Complete ✓"}</PrimaryBtn>
            </div>
          </>
        ):(
          <div style={{textAlign:"center",padding:"20px 0"}}><div style={{fontSize:48,marginBottom:12}}>🎉</div><p style={{fontSize:18,fontWeight:800,color:"#1e293b"}}>Routine complete!</p><PrimaryBtn onClick={onClose} style={{width:"100%"}}>Done</PrimaryBtn></div>
        )}
      </div>
    </Modal>
  );
}

function SoundscapePlayer({sound,onClose}){
  const [playing,setPlaying]=useState(false);
  const [vol,setVol]=useState(0.5);
  const [elapsed,setElapsed]=useState(0);
  const intRef=useRef(null);
  const ctxRef=useRef(null);
  const nodesRef=useRef([]);
  function buildAudio(){if(!ctxRef.current)ctxRef.current=new(window.AudioContext||window.webkitAudioContext)();const ctx=ctxRef.current;const gain=ctx.createGain();gain.gain.value=vol;gain.connect(ctx.destination);[sound.freq,sound.freq*1.5,sound.freq*2.1,sound.freq*0.5].forEach(f=>{const osc=ctx.createOscillator();const g=ctx.createGain();osc.type="sine";osc.frequency.value=f;g.gain.value=0.06;osc.connect(g);g.connect(gain);osc.start();nodesRef.current.push(osc,g);});nodesRef.current.push(gain);}
  function stopAudio(){nodesRef.current.forEach(n=>{try{n.stop?.();n.disconnect?.();}catch{}});nodesRef.current=[];}
  function togglePlay(){if(!playing){buildAudio();setPlaying(true);}else{stopAudio();setPlaying(false);}}
  useEffect(()=>{if(playing)intRef.current=setInterval(()=>setElapsed(e=>e+1),1000);else clearInterval(intRef.current);return()=>clearInterval(intRef.current);},[playing]);
  useEffect(()=>()=>{stopAudio();clearInterval(intRef.current);},[]);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  return(
    <Modal onClose={()=>{stopAudio();onClose();}} title={`${sound.emoji} ${sound.name}`}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24,padding:"8px 0"}}>
        <div style={{width:100,height:100,borderRadius:"50%",background:sound.bg,fontSize:48,display:"flex",alignItems:"center",justifyContent:"center",border:playing?`3px solid ${sound.color}`:"3px solid transparent",transition:"border 0.3s"}}>{sound.emoji}</div>
        <div style={{textAlign:"center"}}><div style={{fontSize:32,fontWeight:800,color:"#1e293b"}}>{fmt(elapsed)}</div><div style={{fontSize:13,color:"#94a3b8"}}>{playing?"Playing…":"Paused"}</div></div>
        <div style={{display:"flex",gap:16}}>
          <button onClick={togglePlay} style={{width:60,height:60,borderRadius:"50%",border:"none",cursor:"pointer",background:sound.color,color:"#fff",fontSize:24,display:"flex",alignItems:"center",justifyContent:"center"}}>{playing?"⏸":"▶"}</button>
          <button onClick={()=>{stopAudio();setElapsed(0);setPlaying(false);}} style={{width:60,height:60,borderRadius:"50%",border:"1.5px solid #e2e8f0",cursor:"pointer",background:"#fff",color:"#64748b",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center"}}>⏹</button>
        </div>
        <div style={{width:"100%"}}><div style={{fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:6}}>Volume</div><input type="range" min={0} max={1} step={0.05} value={vol} onChange={e=>setVol(Number(e.target.value))} style={{width:"100%"}}/></div>
      </div>
    </Modal>
  );
}

// ─── CALENDAR TAB ─────────────────────────────────────────────────────────────
function CalendarTab({cycleData,periodLogs,symptomLogs,onLogPeriod}){
  const now=new Date();
  const [viewYear,setViewYear]=useState(now.getFullYear());
  const [viewMonth,setViewMonth]=useState(now.getMonth());
  const [selected,setSelected]=useState({date:now,key:format(now,"yyyy-MM-dd")});

  const firstDay=startOfMonth(new Date(viewYear,viewMonth));
  const days=eachDayOfInterval({start:firstDay,end:endOfMonth(firstDay)});
  const pad=getDay(firstDay);
  const today=startOfDay(new Date());

  const empty={periodDays:new Set(),fertileDays:new Set(),ovulationDays:new Set(),dayPhaseMap:{}};
  const {periodDays,fertileDays,ovulationDays,dayPhaseMap}=cycleData||empty;

  const loggedDays={};
  periodLogs.forEach(l=>{if(l.startDate)loggedDays[l.startDate]=l;});

  function prev(){if(viewMonth===0){setViewYear(y=>y-1);setViewMonth(11);}else setViewMonth(m=>m-1);}
  function next(){if(viewMonth===11){setViewYear(y=>y+1);setViewMonth(0);}else setViewMonth(m=>m+1);}

  const selKey=selected?.key;
  const selLog=symptomLogs[selKey];
  const selPeriodLog=periodLogs.find(l=>l.startDate===selKey);
  const selPhase=cycleData?dayPhaseMap[selKey]:null;
  const selP=selPhase?PHASES[selPhase]:null;

  const DAYS_HDR=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Calendar card */}
      <div style={{background:"#fff",borderRadius:20,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",overflow:"hidden"}}>
        {/* Month nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px 12px"}}>
          <button onClick={prev} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#475569",padding:"4px 10px",borderRadius:8}}>‹</button>
          <span style={{fontWeight:800,fontSize:17,color:"#1e293b"}}>{format(new Date(viewYear,viewMonth,1),"MMMM yyyy")}</span>
          <button onClick={next} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#475569",padding:"4px 10px",borderRadius:8}}>›</button>
        </div>
        {/* Day headers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:0,padding:"0 8px"}}>
          {DAYS_HDR.map(d=><div key={d} style={{textAlign:"center",fontSize:11,color:"#94a3b8",fontWeight:700,padding:"4px 0"}}>{d}</div>)}
        </div>
        {/* Day cells */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:0,padding:"0 8px 12px"}}>
          {Array(pad).fill(null).map((_,i)=><div key={`p${i}`}/>)}
          {days.map(d=>{
            const k=format(d,"yyyy-MM-dd");
            const isToday=isSameDay(d,today);
            const isSelected=selKey===k;
            const phase=cycleData?dayPhaseMap[k]:null;
            const isPeriod=periodDays.has(k)||!!loggedDays[k];
            const isOv=ovulationDays.has(k);
            const isFertile=fertileDays.has(k)&&!isOv;

            // Color logic matching the reference: pink block for period, yellow for fertile/ov
            let cellBg="transparent", cellColor="#1e293b", cellBorderRadius=8;
            if(isPeriod){cellBg="#fda4af";cellColor="#fff";}
            else if(isOv){cellBg="#fbbf24";cellColor="#fff";}
            else if(isFertile){cellBg="#fde68a";cellColor="#92400e";}
            else if(phase==="Luteal"){cellBg="#fce7f3";cellColor="#9d174d";}
            else if(phase==="Follicular"){cellBg="#ede9fe";cellColor="#6d28d9";}

            // Period days get full-row rounding on edges
            const isStartOfPeriodRow = isPeriod && !periodDays.has(format(subDays(d,1),"yyyy-MM-dd"));
            const isEndOfPeriodRow = isPeriod && !periodDays.has(format(addDays(d,1),"yyyy-MM-dd"));
            let borderRadius = "8px";
            if(isPeriod){
              borderRadius = isStartOfPeriodRow&&isEndOfPeriodRow?"50%":isStartOfPeriodRow?"50% 0 0 50%":isEndOfPeriodRow?"0 50% 50% 0":"0";
            }

            const dayNum=d.getDate();
            // cycle day number (small)
            const cycleDay=cycleData?differenceInDays(d,cycleData.cycleStart)+1:null;
            const showCycleDay=cycleDay&&cycleDay>0&&cycleDay<=cycleData?.cycleLength;

            return(
              <div key={k} onClick={()=>setSelected({date:d,key:k})}
                style={{position:"relative",cursor:"pointer",padding:"2px 0"}}>
                <div style={{
                  background:cellBg,
                  color:cellColor,
                  borderRadius,
                  textAlign:"center",
                  padding:"6px 2px 4px",
                  fontWeight:isToday?900:isSelected?700:400,
                  fontSize:14,
                  outline:isSelected&&!isPeriod?"2px solid #7c3aed":"none",
                  outlineOffset:1,
                  border:isToday&&!isPeriod&&!isSelected?"2px solid #7c3aed":"none",
                  position:"relative",
                }}>
                  {showCycleDay&&<div style={{fontSize:8,color:isPeriod?"#fff7f7":isFertile?"#92400e":"#94a3b8",lineHeight:1,marginBottom:1}}>{cycleDay}</div>}
                  {dayNum}
                  {isOv&&<div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:4,height:4,borderRadius:"50%",background:"#f59e0b"}}/>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selected&&(
        <div style={{background:"#fff",borderRadius:20,padding:"20px 22px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <div style={{fontSize:18,fontWeight:900,color:"#1e293b"}}>{format(selected.date,"MMM d")}</div>
              {cycleData&&dayPhaseMap[selKey]&&<div style={{fontSize:13,color:"#94a3b8"}}>Cycle Day {differenceInDays(selected.date,cycleData.cycleStart)+1}</div>}
            </div>
            <button onClick={()=>{}} style={{background:"linear-gradient(135deg,#fce7f3,#ede9fe)",border:"none",borderRadius:99,padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:700,color:"#7c3aed",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>✏️ Edit</button>
          </div>
          {selPhase&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:selP?.color||"#94a3b8"}}/>
              <span style={{fontSize:13,color:"#64748b"}}>{PHASES[selPhase]?.fertility} — Chance of getting pregnant</span>
            </div>
          )}
          {periodDays.has(selKey)&&<div style={{background:"#fff1f2",borderRadius:12,padding:"10px 14px",marginBottom:8}}><span style={{fontSize:13,fontWeight:700,color:"#e11d48"}}>🩸 Period day (predicted)</span></div>}
          {ovulationDays.has(selKey)&&<div style={{background:"#fffbeb",borderRadius:12,padding:"10px 14px",marginBottom:8}}><span style={{fontSize:13,fontWeight:700,color:"#d97706"}}>🌟 Ovulation day</span></div>}
          {selPeriodLog&&<div style={{background:"#fdf2f8",borderRadius:12,padding:"10px 14px",marginBottom:8}}><span style={{fontSize:13,fontWeight:700,color:"#db2777"}}>Logged: {selPeriodLog.flow} flow</span></div>}
          {selLog&&<div style={{background:"#f8fafc",borderRadius:12,padding:"10px 14px"}}><span style={{fontSize:13,color:"#475569"}}>{selLog.mood?MOODS.find(m=>m.id===selLog.mood)?.emoji+" ":""}{selLog.mood||""}{selLog.symptoms?.length>0?" · "+selLog.symptoms.map(s=>SYMPTOMS.find(x=>x.id===s)?.emoji).join(" "):""}</span></div>}
          {!periodDays.has(selKey)&&!selPeriodLog&&!selLog&&!ovulationDays.has(selKey)&&<p style={{fontSize:13,color:"#94a3b8",margin:0,textAlign:"center",padding:"8px 0"}}>Tap to add a note ↓</p>}
        </div>
      )}

      {/* Legend */}
      <div style={{background:"#fff",borderRadius:16,padding:"14px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
          {[{bg:"#fda4af",text:"Period"},{bg:"#fde68a",text:"Fertile window"},{bg:"#fbbf24",text:"Ovulation"},{bg:"#fce7f3",text:"Luteal"},{bg:"#ede9fe",text:"Follicular"}].map(x=>(
            <div key={x.text} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:16,height:16,borderRadius:4,background:x.bg,flexShrink:0}}/>
              <span style={{fontSize:12,color:"#64748b"}}>{x.text}</span>
            </div>
          ))}
        </div>
      </div>

      <PrimaryBtn onClick={onLogPeriod} style={{width:"100%"}}>🩸 Log a period</PrimaryBtn>
      {!cycleData&&<p style={{textAlign:"center",fontSize:13,color:"#94a3b8"}}>Set up your cycle to see predictions.</p>}
    </div>
  );
}

// ─── TODAY TAB ────────────────────────────────────────────────────────────────
function TodayTab({cycleData,form,onOpenCycleSettings,onLogPeriod,onLogSymptoms,symptomLogs}){
  const todayKey=format(new Date(),"yyyy-MM-dd");
  const todayLog=symptomLogs[todayKey];

  if(!cycleData){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        {/* Hero no-data */}
        <div style={{background:"linear-gradient(160deg,#e8e0ff 0%,#ffd6e7 50%,#ffecd2 100%)",borderRadius:28,padding:"40px 28px 32px",textAlign:"center",position:"relative",overflow:"hidden",minHeight:300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(circle at 70% 30%,rgba(255,200,220,0.5),transparent 60%)"}}/>
          <div style={{position:"relative",zIndex:1}}>
            <CatMascot size={110}/>
            <h2 style={{fontSize:26,fontWeight:900,color:"#1e293b",margin:"16px 0 8px"}}>Track your cycle 🌸</h2>
            <p style={{color:"#64748b",marginBottom:24,fontSize:14,maxWidth:260,margin:"0 auto 24px"}}>Enter your last period date to see personalized daily insights.</p>
            <PrimaryBtn onClick={onOpenCycleSettings}>Set up cycle →</PrimaryBtn>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
          {PHASES.None.tips.map((t,i)=><div key={i} style={{background:"#fdf2f8",borderRadius:16,padding:"16px"}}><div style={{fontSize:22,marginBottom:6}}>{t.icon}</div><div style={{fontSize:13,fontWeight:700,color:"#db2777",marginBottom:4}}>{t.title}</div><div style={{fontSize:12,color:"#475569",lineHeight:1.5}}>{t.text}</div></div>)}
        </div>
      </div>
    );
  }

  const {phase,dayOfCycle,cycleLength,nextPeriodIn,nextPeriodDate}=cycleData;
  const p=PHASES[phase];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Hero gradient with cat */}
      <div style={{background:"linear-gradient(160deg,#e8e0ff 0%,#ffd6e7 50%,#ffecd2 100%)",borderRadius:28,padding:"28px 24px 24px",position:"relative",overflow:"hidden",minHeight:220}}>
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(circle at 75% 25%,rgba(255,180,210,0.6),transparent 60%)"}}/>
        <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>{phase === "Menstrual" ? "Period" : phase}</div>
            <h1 style={{fontSize:36,fontWeight:900,color:"#1e293b",margin:"0 0 4px",lineHeight:1}}>
              {nextPeriodIn===0?"Today 🩸":nextPeriodIn===1?"1 DAY LEFT":`${nextPeriodIn} DAYS LEFT`}
            </h1>
            <p style={{fontSize:14,color:"#64748b",margin:"0 0 18px"}}>{format(nextPeriodDate,"MMM d")} · Next Period</p>
            <PrimaryBtn onClick={onLogPeriod} color="linear-gradient(135deg,#e11d48,#f43f5e)">Period Starts</PrimaryBtn>
          </div>
          <div style={{flexShrink:0,marginBottom:-8}}>
            <CatMascot size={100}/>
          </div>
        </div>
      </div>

      {/* Widget cards row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        {/* Partner Mode */}
        <div style={{background:"linear-gradient(145deg,#ede9fe,#fdf2f8)",borderRadius:20,padding:"16px 14px",position:"relative",overflow:"hidden",minHeight:130}}>
          <div style={{fontSize:13,fontWeight:800,color:"#1e293b",lineHeight:1.2,marginBottom:8}}>Partner<br/>Mode</div>
          <div style={{position:"absolute",bottom:-10,right:-10,width:70,height:70,borderRadius:"50%",background:"rgba(244,114,182,0.25)"}}/>
          <div style={{position:"absolute",bottom:10,right:6,fontSize:28}}>🫶</div>
          <button style={{position:"absolute",bottom:12,left:14,width:28,height:28,borderRadius:"50%",background:"#1e293b",border:"none",cursor:"pointer",color:"#fff",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>
        </div>

        {/* Cycle day ring */}
        <div style={{background:"#fff",borderRadius:20,padding:"14px",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{fontSize:10,fontWeight:700,color:p.color,textTransform:"uppercase",letterSpacing:"0.06em"}}>CYCLE DAY</div>
          <CycleRing day={dayOfCycle} total={cycleLength} color={p.color}/>
        </div>

        {/* Next period */}
        <div style={{background:"linear-gradient(145deg,#fff1f2,#fdf2f8)",borderRadius:20,padding:"16px 14px",position:"relative",overflow:"hidden",minHeight:130}}>
          <div style={{fontSize:13,fontWeight:800,color:"#1e293b",lineHeight:1.2,marginBottom:4}}>{format(nextPeriodDate,"MMM d")}</div>
          <div style={{fontSize:11,color:"#94a3b8"}}>Next Period</div>
          <div style={{position:"absolute",bottom:-8,right:-8,width:60,height:60,borderRadius:"50%",background:"rgba(251,113,133,0.2)"}}/>
          <div style={{position:"absolute",bottom:10,right:10,fontSize:32}}>🩸</div>
        </div>
      </div>

      {/* Cycle bar */}
      <CycleBar cycleData={cycleData}/>

      {/* Add Symptom card */}
      <div style={{background:"#fff",borderRadius:20,padding:"20px 22px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",gap:16}}>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:800,color:"#1e293b",marginBottom:4}}>How are you feeling today?</div>
          <div style={{fontSize:13,color:"#94a3b8",marginBottom:14}}>Tell us more about your body to get analysis</div>
          <PrimaryBtn onClick={onLogSymptoms} color="#5b21b6" style={{fontSize:13,padding:"10px 20px"}}>
            {todayLog?"✏️ Edit today's log":"Add Symptom"}
          </PrimaryBtn>
        </div>
        <div style={{fontSize:52,flexShrink:0}}>😊</div>
      </div>

      {/* Today's log if exists */}
      {todayLog&&(
        <div style={{background:"#fff",borderRadius:18,padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <p style={{fontSize:14,fontWeight:700,color:"#1e293b",marginBottom:10}}>Today's check-in</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {todayLog.mood&&<span style={{background:"#f5f3ff",color:"#7c3aed",borderRadius:99,padding:"5px 12px",fontSize:13,fontWeight:600}}>{MOODS.find(m=>m.id===todayLog.mood)?.emoji} {todayLog.mood}</span>}
            {todayLog.symptoms?.map(s=>{const sym=SYMPTOMS.find(x=>x.id===s);return sym?<span key={s} style={{background:"#fff1f2",color:"#e11d48",borderRadius:99,padding:"5px 12px",fontSize:13,fontWeight:600}}>{sym.emoji} {sym.label}</span>:null;})}
          </div>
          {todayLog.notes&&<p style={{fontSize:13,color:"#64748b",marginTop:8,marginBottom:0}}>{todayLog.notes}</p>}
        </div>
      )}

      {/* Phase tips */}
      <div>
        <p style={{fontSize:12,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>What your body needs now</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
          {p.tips.map((t,i)=><div key={i} style={{background:p.light,borderRadius:14,padding:"14px"}}><div style={{fontSize:20,marginBottom:6}}>{t.icon}</div><div style={{fontSize:13,fontWeight:700,color:p.color,marginBottom:4}}>{t.title}</div><div style={{fontSize:12,color:"#475569",lineHeight:1.5}}>{t.text}</div></div>)}
        </div>
      </div>
    </div>
  );
}

// ─── SELF CARE TAB ────────────────────────────────────────────────────────────
function SelfCareTab(){
  const [activeRoutine,setActiveRoutine]=useState(null);
  const [activeSound,setActiveSound]=useState(null);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {activeRoutine&&<RoutineModal routine={activeRoutine} onClose={()=>setActiveRoutine(null)}/>}
      {activeSound&&<SoundscapePlayer sound={activeSound} onClose={()=>setActiveSound(null)}/>}
      <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <p style={{fontSize:14,fontWeight:800,color:"#1e293b",marginBottom:16}}>🌿 Relief routines</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {RELIEF_ROUTINES.map(r=>(
            <div key={r.title} onClick={()=>setActiveRoutine(r)} style={{display:"flex",alignItems:"center",gap:14,background:"#fafafa",borderRadius:14,padding:"14px 16px",border:"1px solid #f1f5f9",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.background="#fff1f2";}} onMouseLeave={e=>{e.currentTarget.style.background="#fafafa";}}>
              <div style={{fontSize:28}}>{r.emoji}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{r.title}</div><div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{r.desc}</div></div>
              <span style={{fontSize:12,fontWeight:600,color:"#e11d48",background:"#fff1f2",padding:"4px 10px",borderRadius:99}}>{r.duration}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <p style={{fontSize:14,fontWeight:800,color:"#1e293b",marginBottom:4}}>🎵 Soundscapes</p>
        <p style={{fontSize:13,color:"#94a3b8",marginBottom:16}}>Ambient sounds to help you relax</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
          {SOUNDSCAPES.map(s=><div key={s.id} onClick={()=>setActiveSound(s)} style={{background:s.bg,borderRadius:16,padding:"18px 14px",cursor:"pointer",transition:"transform 0.15s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}><div style={{fontSize:28,marginBottom:8}}>{s.emoji}</div><div style={{fontSize:13,fontWeight:700,color:s.color}}>{s.name}</div><div style={{fontSize:11,color:s.color,opacity:0.7,marginTop:2}}>Tap to play</div></div>)}
        </div>
      </div>
      <div style={{background:"linear-gradient(135deg,#fff1f2,#fdf2f8)",borderRadius:20,padding:24}}>
        <p style={{fontSize:14,fontWeight:800,color:"#1e293b",marginBottom:12}}>💊 Quick reminders</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{emoji:"💧",text:"Drink 8+ glasses of water today"},{emoji:"🌙",text:"Aim for 7–9 hours of sleep"},{emoji:"🥗",text:"Eat a colourful, iron-rich meal"},{emoji:"🚶",text:"Even a 10-minute walk helps"}].map((r,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"center",fontSize:14,color:"#475569"}}><span style={{fontSize:18}}>{r.emoji}</span>{r.text}</div>)}
        </div>
      </div>
    </div>
  );
}

// ─── ANALYSIS TAB ────────────────────────────────────────────────────────────
function AnalysisTab({cycleData,form,periodLogs,symptomLogs}){
  if(!cycleData){
    return(
      <div style={{background:"#f8fafc",borderRadius:20,padding:40,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>📊</div>
        <p style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:6}}>No data yet</p>
        <p style={{fontSize:13,color:"#94a3b8"}}>Set up your cycle to unlock analysis and insights.</p>
      </div>
    );
  }
  const {phase,dayOfCycle,cycleLength,nextPeriodIn,nextPeriodDate,ovDay}=cycleData;
  const p=PHASES[phase];
  const lph=form.lutealLen||14;
  const ovuDate=addDays(nextPeriodDate,-lph);
  const fertileStart=subDays(ovuDate,5);
  const symCount={};
  Object.values(symptomLogs).forEach(log=>{(log.symptoms||[]).forEach(s=>{symCount[s]=(symCount[s]||0)+1;});});
  const topSymptoms=Object.entries(symCount).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const avgPeriod=periodLogs.length>0?1:0;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Cycle analysis header */}
      <div style={{background:"#fff",borderRadius:20,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <p style={{fontSize:16,fontWeight:800,color:"#1e293b",margin:0}}>Cycle analysis</p>
          <span style={{fontSize:16,color:"#94a3b8"}}>›</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{background:"#fff1f2",borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:28,color:"#e11d48",marginBottom:8}}>🩸</div>
            <div style={{fontSize:22,fontWeight:900,color:"#e11d48"}}>{periodLogs.length>0?`${periodLogs[0].endDate?differenceInDays(new Date(periodLogs[0].endDate),new Date(periodLogs[0].startDate))+1:1} Day`:"— Day"}</div>
            <div style={{fontSize:13,color:"#e11d48"}}>Average period</div>
          </div>
          <div style={{background:"#fffbeb",borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:28,color:"#d97706",marginBottom:8}}>🔄</div>
            <div style={{fontSize:22,fontWeight:900,color:"#d97706"}}>{cycleLength} Days</div>
            <div style={{fontSize:13,color:"#d97706"}}>Average cycle</div>
          </div>
        </div>
        {periodLogs.length<3&&<p style={{fontSize:13,color:"#64748b",marginTop:12,marginBottom:0}}>Log 3 periods to unlock analysis. <span style={{color:"#e11d48",fontWeight:700,cursor:"pointer"}}>Log period</span></p>}
      </div>

      {/* Upcoming dates */}
      <div style={{background:"#fff",borderRadius:20,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <p style={{fontSize:14,fontWeight:800,color:"#1e293b",marginBottom:16}}>Upcoming dates</p>
        {[{emoji:"🌱",label:"Fertile window",date:format(fertileStart,"MMM d"),desc:"6-day window opens"},{emoji:"🌟",label:"Ovulation",date:format(ovuDate,"MMM d"),desc:"Peak fertility day"},{emoji:"🩸",label:"Next period",date:format(nextPeriodDate,"MMM d"),desc:`${nextPeriodIn} days away`}].map(x=>(
          <div key={x.label} style={{display:"flex",alignItems:"center",gap:14,padding:"11px 0",borderBottom:"1px solid #f8fafc"}}>
            <span style={{fontSize:22}}>{x.emoji}</span>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{x.label}</div><div style={{fontSize:12,color:"#94a3b8"}}>{x.desc}</div></div>
            <div style={{fontSize:14,fontWeight:700,color:"#e11d48"}}>{x.date}</div>
          </div>
        ))}
      </div>

      {/* History */}
      {periodLogs.length>0&&(
        <div style={{background:"#fff",borderRadius:20,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <p style={{fontSize:14,fontWeight:800,color:"#1e293b",marginBottom:16}}>History</p>
          {periodLogs.slice(0,5).map(l=>{
            const w=l.endDate?Math.max(1,differenceInDays(new Date(l.endDate),new Date(l.startDate))+1):1;
            return(
              <div key={l.id} style={{marginBottom:16}}>
                <div style={{fontSize:13,color:"#64748b",marginBottom:6}}>{format(new Date(l.startDate),"MMM d")}{l.endDate?" - "+format(new Date(l.endDate),"MMM d"):""}</div>
                <div style={{position:"relative",height:12,borderRadius:99,background:"#f1f5f9",overflow:"visible"}}>
                  <div style={{height:"100%",width:`${Math.min(100,(w/cycleLength)*100)}%`,background:"#fb7185",borderRadius:"99px 0 0 99px"}}/>
                  <div style={{position:"absolute",left:`${Math.min(98,(w/cycleLength)*100)}%`,top:-2,width:16,height:16,borderRadius:"50%",background:"#fbbf24",border:"2px solid #fff",boxShadow:"0 1px 4px rgba(0,0,0,0.1)"}}/>
                </div>
              </div>
            );
          })}
          <p style={{textAlign:"center",color:"#e11d48",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:0}}>More</p>
        </div>
      )}

      {/* Symptoms */}
      {topSymptoms.length>0&&(
        <div style={{background:"#fff",borderRadius:20,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <p style={{fontSize:14,fontWeight:800,color:"#1e293b",marginBottom:16}}>Most common symptoms</p>
          {topSymptoms.map(([id,count])=>{const sym=SYMPTOMS.find(s=>s.id===id);const pct=Math.round((count/Object.keys(symptomLogs).length)*100);return sym?(
            <div key={id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <span style={{fontSize:20}}>{sym.emoji}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{sym.label}</span><span style={{fontSize:12,color:"#94a3b8"}}>{count}× ({pct}%)</span></div>
                <div style={{height:6,background:"#f1f5f9",borderRadius:99}}><div style={{width:`${pct}%`,height:"100%",background:"#fb7185",borderRadius:99}}/></div>
              </div>
            </div>
          ):null;})}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS={periodReminders:true,fertileAlerts:true,dailyInsights:true,symptomReminders:false,showFertile:true,showOvulation:true,compactView:false,pinLock:false,incognito:false};

export default function PeriodTracker(){
  const [tab,setTab]=useState("today");
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({lastPeriodDate:null,cycleLength:28,lutealLen:14,periodDuration:5});
  const [cycleData,setCycleData]=useState(null);
  const [periodLogs,setPeriodLogs]=useState([]);
  const [symptomLogs,setSymptomLogs]=useState({});
  const [appSettings,setAppSettings]=useState(DEFAULT_SETTINGS);

  useEffect(()=>{
    async function loadData(){
      try{
        const fRes=await window.storage?.get("pt-form");
        if(fRes?.value){const f=JSON.parse(fRes.value);if(f.lastPeriodDate){const raw=f.lastPeriodDate;f.lastPeriodDate=typeof raw==="string"&&raw.length===10?new Date(raw+"T00:00:00"):new Date(raw);}setForm(f);}
        const plRes=await window.storage?.get("pt-periods");
        if(plRes?.value)setPeriodLogs(JSON.parse(plRes.value));
        const slRes=await window.storage?.get("pt-symptoms");
        if(slRes?.value)setSymptomLogs(JSON.parse(slRes.value));
        const asRes=await window.storage?.get("pt-settings");
        if(asRes?.value)setAppSettings(JSON.parse(asRes.value));
      }catch{}
    }
    loadData();
  },[]);

  useEffect(()=>{
    if(form.lastPeriodDate&&form.cycleLength>=21&&form.cycleLength<=45){
      try{setCycleData(computeCycleData(form.lastPeriodDate,form.cycleLength,form.lutealLen||14));}
      catch{setCycleData(null);}
    }else setCycleData(null);
  },[form]);

  function saveForm(f){setForm(f);save("pt-form",f);setModal(null);}
  function savePeriods(logs){setPeriodLogs(logs);save("pt-periods",logs);}
  function saveSymptoms(logs){setSymptomLogs(logs);save("pt-symptoms",logs);}

  const nav=[{id:"today",icon:"🏠",label:"Today"},{id:"calendar",icon:"📅",label:"Calendar"},{id:"selfcare",icon:"💆",label:"Self Care"},{id:"analysis",icon:"📊",label:"Analysis"}];
  const activePhase=cycleData?.phase||"None";
  const p=PHASES[activePhase];

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#ede9fe 0%,#f8fafc 40%,#fdf2f8 100%)",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",display:"flex",flexDirection:"column"}}>
      {modal==="cycle"&&<CycleSettingsModal form={form} onSave={saveForm} onClose={()=>setModal(null)}/>}
      {modal==="period"&&<LogPeriodModal onClose={()=>setModal(null)} onSave={savePeriods} logs={periodLogs}/>}
      {modal==="symptoms"&&<LogSymptomsModal onClose={()=>setModal(null)} onSave={saveSymptoms} symptomLogs={symptomLogs}/>}

      {/* Header */}
      <header style={{padding:"14px 20px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,0.7)",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:50,borderBottom:"1px solid rgba(241,245,249,0.8)"}}>
        <button onClick={()=>setModal("cycle")} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,position:"relative",padding:4}}>
          ⚙️
          <span style={{position:"absolute",top:2,right:2,width:8,height:8,borderRadius:"50%",background:"#e11d48",border:"1.5px solid #fff"}}/>
        </button>
        <div style={{fontSize:16,fontWeight:900,color:"#1e293b",letterSpacing:"-0.02em"}}>GlowHer 🌸</div>
        <button style={{background:"none",border:"none",cursor:"pointer",fontSize:22,padding:4}}>🔔</button>
      </header>

      <div style={{display:"flex",flex:1,minHeight:0}}>
        {/* Desktop sidebar */}
        <aside className="sidebar-nav" style={{width:200,padding:"20px 12px",flexShrink:0,borderRight:"1px solid rgba(241,245,249,0.8)",display:"flex",flexDirection:"column",gap:4,background:"rgba(255,255,255,0.5)"}}>
          {nav.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderRadius:14,border:"none",cursor:"pointer",background:tab===n.id?"rgba(225,29,72,0.1)":"transparent",color:tab===n.id?"#e11d48":"#64748b",fontSize:14,fontWeight:tab===n.id?700:500,fontFamily:"inherit",textAlign:"left",width:"100%",transition:"all 0.15s"}}>
              <span style={{fontSize:18}}>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
          <div style={{height:1,background:"#f1f5f9",margin:"8px 4px"}}/>
          <p style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.07em",padding:"4px 16px 2px"}}>Quick actions</p>
          {[{icon:"🩸",label:"Log period",action:()=>setModal("period")},{icon:"💬",label:"Log symptoms",action:()=>setModal("symptoms")},{icon:"🔧",label:"Cycle settings",action:()=>setModal("cycle")}].map(x=>(
            <button key={x.label} onClick={x.action} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 16px",borderRadius:12,border:"none",cursor:"pointer",background:"transparent",color:"#64748b",fontSize:13,fontWeight:500,fontFamily:"inherit",textAlign:"left",width:"100%",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="#f8fafc";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
              <span style={{fontSize:16}}>{x.icon}</span><span>{x.label}</span>
            </button>
          ))}
          {cycleData&&(
            <div style={{marginTop:"auto",padding:14,borderRadius:16,background:p.bg,border:`1px solid ${p.light}`}}>
              <div style={{fontSize:11,fontWeight:700,color:p.color}}>Next period</div>
              <div style={{fontSize:22,fontWeight:800,color:"#1e293b",margin:"2px 0"}}>{cycleData.nextPeriodIn===0?"Today":`${cycleData.nextPeriodIn}d`}</div>
              <div style={{fontSize:11,color:"#64748b"}}>{format(cycleData.nextPeriodDate,"MMM d")}</div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main style={{flex:1,overflowY:"auto",padding:"20px",paddingBottom:90}}>
          <div style={{maxWidth:680,margin:"0 auto"}}>
            {tab==="today"&&<TodayTab cycleData={cycleData} form={form} onOpenCycleSettings={()=>setModal("cycle")} onLogPeriod={()=>setModal("period")} onLogSymptoms={()=>setModal("symptoms")} symptomLogs={symptomLogs}/>}
            {tab==="calendar"&&<CalendarTab cycleData={cycleData} periodLogs={periodLogs} symptomLogs={symptomLogs} onLogPeriod={()=>setModal("period")}/>}
            {tab==="selfcare"&&<SelfCareTab/>}
            {tab==="analysis"&&<AnalysisTab cycleData={cycleData} form={form} periodLogs={periodLogs} symptomLogs={symptomLogs}/>}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav with center + button */}
      <nav className="bottom-nav" style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(12px)",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-around",alignItems:"center",padding:"8px 0 env(safe-area-inset-bottom,8px)",zIndex:50}}>
        {nav.slice(0,2).map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"6px 16px",borderRadius:12,color:tab===n.id?"#e11d48":"#94a3b8",fontFamily:"inherit",fontSize:10,fontWeight:tab===n.id?700:500}}>
            <span style={{fontSize:20}}>{n.icon}</span><span>{n.label}</span>
          </button>
        ))}
        {/* Center + FAB */}
        <button onClick={()=>setModal("period")} style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#e11d48,#f43f5e)",border:"none",cursor:"pointer",color:"#fff",fontSize:26,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(225,29,72,0.4)",marginBottom:4}}>+</button>
        {nav.slice(2).map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"6px 16px",borderRadius:12,color:tab===n.id?"#e11d48":"#94a3b8",fontFamily:"inherit",fontSize:10,fontWeight:tab===n.id?700:500}}>
            <span style={{fontSize:20}}>{n.icon}</span><span>{n.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        @media(min-width:640px){.sidebar-nav{display:flex!important}.bottom-nav{display:none!important}}
        @media(max-width:639px){.sidebar-nav{display:none!important}.bottom-nav{display:flex!important}}
      `}</style>
    </div>
  );
}
