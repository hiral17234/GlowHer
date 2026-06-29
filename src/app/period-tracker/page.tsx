"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Date utilities ───────────────────────────────────────────────────────────
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
function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PHASES = {
  Menstrual:  { label:"Menstrual",  days:"Days 1–5",   tagline:"Rest & restore", color:"#e11d48", calColor:"#fb7185", bg:"#fff1f2", light:"#ffe4e6", fertility:"LOW",  tips:[{icon:"🥬",title:"Iron-rich foods",text:"Spinach, lentils, and dark chocolate replenish iron lost during bleeding."},{icon:"🧘",title:"Gentle movement",text:"Light yoga or slow walks — your body's doing hard work, let it lead."},{icon:"🌡️",title:"Heat therapy",text:"A warm compress on your abdomen eases cramps effectively."},{icon:"📓",title:"Rest & reflect",text:"Intuition is sharp this week. Journal, slow down, be kind to yourself."}] },
  Follicular: { label:"Follicular", days:"Days 6–13",  tagline:"Rise & begin",   color:"#7c3aed", calColor:"#a78bfa", bg:"#f5f3ff", light:"#ede9fe", fertility:"LOW",  tips:[{icon:"🥗",title:"Lean proteins",text:"Complex carbs and protein support your rising energy."},{icon:"🏃",title:"Build momentum",text:"Energy is climbing — try a new workout class or brisk walk."},{icon:"💡",title:"Create & plan",text:"Mental clarity peaks here. Great time for big projects."},{icon:"✨",title:"Skin glow",text:"Estrogen peaks — skin is often clearest. Keep routine simple."}] },
  Ovulation:  { label:"Ovulation",  days:"Peak day",   tagline:"Peak energy",    color:"#d97706", calColor:"#fbbf24", bg:"#fffbeb", light:"#fef3c7", fertility:"HIGH", tips:[{icon:"🫐",title:"Antioxidants",text:"Berries, leafy greens, and fiber support hormone processing."},{icon:"💪",title:"Peak performance",text:"You're at your strongest — HIIT, running, heavy lifting, go for it."},{icon:"🗣️",title:"Speak up",text:"Verbal confidence peaks. Great for negotiations and presentations."},{icon:"❤️",title:"Connect",text:"High confidence. Best time for social events and important conversations."}] },
  Luteal:     { label:"Luteal",     days:"Days 15–28", tagline:"Wind down",      color:"#0f766e", calColor:"#5eead4", bg:"#f0fdfa", light:"#ccfbf1", fertility:"LOW",  tips:[{icon:"🥦",title:"Manage PMS",text:"Magnesium-rich foods and B-vitamins ease mood swings. Reduce caffeine."},{icon:"🏊",title:"Ease off",text:"Swap intense workouts for Pilates, swimming, or restorative yoga."},{icon:"💧",title:"Stay hydrated",text:"Bloating is common. Up water intake and wear comfortable clothing."},{icon:"🛁",title:"Deep self-care",text:"Turn inward — a bath, a book, a film. Cozy over productive."}] },
  None:       { label:"Not set",    days:"",           tagline:"Set up cycle",   color:"#db2777", calColor:"#f9a8d4", bg:"#fdf2f8", light:"#fce7f3", fertility:"—",    tips:[{icon:"📅",title:"Track your cycle",text:"Enter your last period date to unlock personalized daily insights."},{icon:"🔍",title:"Spot patterns",text:"Tracking helps you understand what's normal for your unique body."},{icon:"💪",title:"Sync workouts",text:"Align your exercise with your natural hormonal rhythm for better results."},{icon:"🥗",title:"Eat with your cycle",text:"Each phase calls for different nutrients to feel your best."}] },
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

// Default reminder config
const DEFAULT_REMINDERS = [
  {id:"period",icon:"🩸",label:"Period reminder",desc:"2 days before expected period",enabled:true,daysBefore:2,time:"08:00"},
  {id:"ovulation",icon:"🌟",label:"Ovulation alert",desc:"On ovulation day",enabled:true,daysBefore:0,time:"08:00"},
  {id:"medication",icon:"💊",label:"Medication",desc:"Daily pill reminder",enabled:false,time:"09:00",customText:"Take your medication"},
  {id:"water",icon:"💧",label:"Hydration",desc:"Drink water reminders",enabled:false,time:"10:00",interval:"every3h"},
  {id:"mood",icon:"💬",label:"Mood check-in",desc:"Daily mood logging reminder",enabled:false,time:"20:00"},
  {id:"custom1",icon:"⭐",label:"Custom reminder",desc:"",enabled:false,time:"09:00",customText:"",isCustom:true},
];


const DEFAULT_APP_SETTINGS = {
  darkMode:false,
  notifications:true,
  reminders:true,
  animations:true,
  sound:true,
  theme:"classic",
  pet:"cat",
};

const PARTNER_SECTIONS = {
  help:[
    {icon:"heat",title:"Heating pad",text:"Warmth on the lower belly or back can ease cramps."},
    {icon:"tea",title:"Warm water",text:"Offer tea, soup, or a warm bottle before she has to ask."},
    {icon:"sweet",title:"Chocolate",text:"A small sweet treat can feel like instant comfort."},
    {icon:"heart",title:"Emotional support",text:"Listen gently, validate her feelings, and keep plans flexible."},
    {icon:"rest",title:"Rest",text:"Help protect quiet time and take small tasks off her plate."},
    {icon:"massage",title:"Massage",text:"Shoulders, lower back, hands, or feet can be soothing."},
    {icon:"walk",title:"Walks",text:"A slow walk can help if she feels up for movement."},
  ],
  feelings:[
    {icon:"mood",title:"Mood swings",text:"Hormone shifts can make emotions change quickly."},
    {icon:"moon",title:"Hormonal changes",text:"Energy, appetite, sleep, and patience may all feel different."},
    {icon:"low",title:"Fatigue",text:"Her body is doing real work. Low energy is normal."},
    {icon:"pain",title:"Cramping",text:"Pain can come in waves and may need heat, rest, or medicine."},
    {icon:"calm",title:"Anxiety",text:"Calm reassurance and fewer decisions can help a lot."},
  ],
  movies:{
    Comedy:["Legally Blonde","Clueless","The Princess Diaries","13 Going on 30"],
    Romance:["Pride & Prejudice","To All the Boys I've Loved Before","The Holiday","Notting Hill"],
    "Feel-good":["Mamma Mia!","Julie & Julia","Little Women","Hidden Figures"],
    Animated:["Kiki's Delivery Service","Ratatouille","Tangled","Inside Out"],
    "Comfort movies":["The Parent Trap","You've Got Mail","Matilda","Paddington 2"],
  },
  music:["Acoustic calm","Lo-fi rain","Soft piano","Aromatherapy spa mix","Cozy cafe jazz"],
  books:["Little Women","Anne of Green Gables","The Comfort Book","Before the Coffee Gets Cold","A Psalm for the Wild-Built"],
  foods:["Soup","Khichdi or rice bowl","Dark chocolate","Banana pancakes","Warm pasta","Herbal tea","Mashed potatoes"],
  messages:[
    "You do not have to be productive today. I have you.",
    "Tell me what would make the next hour easier.",
    "You are allowed to rest. I will handle the small stuff.",
    "I love you on soft days, messy days, and everything in between.",
  ],
  bucket:["Spa Day","Ice Cream Date","Shopping","Sunset Walk","Painting","Movie Night","Cafe Visit","Photography","Journaling"],
};

// ─── Storage ──────────────────────────────────────────────────────────────────
async function storageGet(key) {
  try { if (window.storage) { const r = await window.storage.get(key); return r ? r.value : null; } } catch {}
  try { return localStorage.getItem(key); } catch {}
  return null;
}
async function storageSet(key, val) {
  const str = typeof val === "string" ? val : JSON.stringify(val);
  try { if (window.storage) await window.storage.set(key, str); } catch {}
  try { localStorage.setItem(key, str); } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(v,mn,mx){return Math.max(mn,Math.min(mx,v));}

function computeCycleData(lastPeriodDate, cycleLength, lutealLen, periodLen=5) {
  const lph = lutealLen || 14;
  const today = startOfDay(new Date());
  let cycleStart = startOfDay(new Date(lastPeriodDate));
  while (addDays(cycleStart, cycleLength) < today) cycleStart = addDays(cycleStart, cycleLength);
  const nextPeriodStart = addDays(cycleStart, cycleLength);
  const ovDay = addDays(nextPeriodStart, -lph);
  const safePeriodLen = clamp(Number(periodLen)||5,1,10);
  const periodEnd = addDays(cycleStart, safePeriodLen - 1);
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
    for(let j=0;j<safePeriodLen;j++){periodDays.add(format(addDays(cs,j),"yyyy-MM-dd"));}
    for(let j=5;j>=0;j--)fertileDays.add(format(subDays(ov,j),"yyyy-MM-dd"));
    ovulationDays.add(format(ov,"yyyy-MM-dd"));
  }
  const dayPhaseMap = {};
  for (let i=-1;i<5;i++){
    const cs=addDays(cycleStart,cycleLength*i);
    const nps=addDays(cs,cycleLength);
    const ov=addDays(nps,-lph);
    const pe=addDays(cs,safePeriodLen - 1);
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

// ─── Cat Mascot ───────────────────────────────────────────────────────────────
function CatMascot({size=120}) {
  return (
    <svg width={size} height={size*1.1} viewBox="0 0 120 132" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="95" rx="34" ry="28" fill="#4a4a5a"/>
      <path d="M94 110 Q115 105 112 88 Q109 75 100 80" stroke="#4a4a5a" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <ellipse cx="60" cy="58" rx="30" ry="27" fill="#5a5a6a"/>
      <polygon points="35,36 28,16 48,30" fill="#5a5a6a"/><polygon points="85,36 92,16 72,30" fill="#5a5a6a"/>
      <polygon points="37,34 31,20 46,31" fill="#f9a8d4"/><polygon points="83,34 89,20 74,31" fill="#f9a8d4"/>
      <ellipse cx="60" cy="62" rx="22" ry="19" fill="#e8e8f0"/>
      <circle cx="50" cy="56" r="8" fill="white"/><circle cx="70" cy="56" r="8" fill="white"/>
      <circle cx="50" cy="56" r="5" fill="#1e1e2e"/><circle cx="70" cy="56" r="5" fill="#1e1e2e"/>
      <circle cx="52" cy="54" r="2" fill="white"/><circle cx="72" cy="54" r="2" fill="white"/>
      <ellipse cx="60" cy="66" rx="3" ry="2" fill="#f9a8d4"/>
      <path d="M57 68 Q60 71 63 68" stroke="#666" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="38" y1="64" x2="54" y2="66" stroke="#999" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="38" y1="68" x2="54" y2="68" stroke="#999" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="66" y1="66" x2="82" y2="64" stroke="#999" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="66" y1="68" x2="82" y2="68" stroke="#999" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M50 86 Q55 80 60 86 Q65 80 70 86 Q65 90 60 86 Q55 90 50 86" fill="#f59e0b"/>
      <circle cx="60" cy="86" r="3" fill="#fbbf24"/>
      <ellipse cx="60" cy="122" rx="24" ry="6" fill="#d1d5db"/>
      <ellipse cx="60" cy="119" rx="20" ry="4" fill="#e5e7eb"/>
    </svg>
  );
}

// ─── UI Primitives ────────────────────────────────────────────────────────────
function Modal({onClose,children,title,wide,extraWide}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:24,padding:28,width:"100%",maxWidth:extraWide?700:wide?560:440,boxShadow:"0 24px 64px rgba(0,0,0,0.18)",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
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
      onMouseEnter={e=>e.currentTarget.style.opacity="0.88"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{children}</button>
  );
}
function DangerBtn({onClick,children,style={}}){
  return(
    <button onClick={onClick} style={{padding:"10px 20px",borderRadius:99,border:"1.5px solid #fca5a5",cursor:"pointer",background:"#fff1f2",color:"#e11d48",fontSize:14,fontWeight:700,fontFamily:"inherit",...style}}
      onMouseEnter={e=>e.currentTarget.style.opacity="0.8"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{children}</button>
  );
}
function Toggle({checked,onChange}){
  return(
    <div onClick={()=>onChange(!checked)} style={{width:44,height:24,borderRadius:99,cursor:"pointer",background:checked?"#e11d48":"#e2e8f0",position:"relative",transition:"background 0.2s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:checked?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",transition:"left 0.2s"}}/>
    </div>
  );
}
function CycleRing({day,total,color}){
  const r=38,cx=48,cy=48,stroke=7,circ=2*Math.PI*r;
  const progress=clamp(day/total,0,1);
  return(
    <svg width={96} height={96} viewBox="0 0 96 96">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${progress*circ} ${circ}`} strokeLinecap="round"
        style={{transform:"rotate(-90deg)",transformOrigin:"center"}}/>
      <text x={cx} y={cy+6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">{day||"—"}</text>
    </svg>
  );
}
function CycleBar({cycleData}){
  if(!cycleData) return null;
  const {dayOfCycle,cycleLength,cycleStart} = cycleData;
  const pct = clamp((dayOfCycle/cycleLength)*100,0,100);
  const periodEnd=5, ovDay=Math.round(cycleLength*0.52);
  const segments=[
    {w:(periodEnd/cycleLength)*100,bg:"#fb7185"},
    {w:((ovDay-1-periodEnd)/cycleLength)*100,bg:"#fbbf24"},
    {w:(1/cycleLength)*100,bg:"#fbbf24"},
    {w:((cycleLength-ovDay)/cycleLength)*100,bg:"#fca5a5"},
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
        <div style={{position:"absolute",top:-4,left:`calc(${pct}% - 1.5px)`,height:20,width:3,background:"#1e293b",borderRadius:99,boxShadow:"0 0 0 2px #fff,0 0 0 3.5px #1e293b"}}/>
        <div style={{position:"absolute",top:24,left:`calc(${pct}% - 24px)`,background:"#fff",border:"2px solid #1e293b",borderRadius:99,padding:"2px 10px",fontSize:11,fontWeight:700,color:"#1e293b",whiteSpace:"nowrap",boxShadow:"0 2px 6px rgba(0,0,0,0.1)"}}>Today</div>
      </div>
    </div>
  );
}

// ─── In-App Notification Toast ────────────────────────────────────────────────
function NotificationToast({notifications, onDismiss}) {
  if (!notifications.length) return null;
  return (
    <div style={{position:"fixed",top:70,right:16,zIndex:300,display:"flex",flexDirection:"column",gap:8,maxWidth:340}}>
      {notifications.map(n=>(
        <div key={n.id} style={{background:"#fff",borderRadius:16,padding:"14px 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",border:`2px solid ${n.color||"#e11d48"}20`,display:"flex",alignItems:"flex-start",gap:12,animation:"slideIn 0.3s ease"}}>
          <span style={{fontSize:22,flexShrink:0}}>{n.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{n.title}</div>
            <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{n.body}</div>
          </div>
          <button onClick={()=>onDismiss(n.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:18,padding:"0 2px",lineHeight:1,flexShrink:0}}>×</button>
        </div>
      ))}
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function LogPeriodModal({onClose,onSave,onDelete,logs,editEntry}){
  const [startDate,setStartDate]=useState(editEntry?.startDate||format(new Date(),"yyyy-MM-dd"));
  const [endDate,setEndDate]=useState(editEntry?.endDate||"");
  const [flow,setFlow]=useState(editEntry?.flow||"medium");
  const [notes,setNotes]=useState(editEntry?.notes||"");
  function submit(){
    if(!startDate) return;
    if(editEntry){
      onSave(logs.map(l=>l.id===editEntry.id?{...editEntry,startDate,endDate:endDate||null,flow,notes}:l));
    } else {
      onSave([{id:Date.now(),startDate,endDate:endDate||null,flow,notes,loggedAt:new Date().toISOString()},...logs]);
    }
    onClose();
  }
  const inp={width:"100%",padding:"10px 12px",borderRadius:10,fontSize:14,border:"1.5px solid #e2e8f0",outline:"none",boxSizing:"border-box",color:"#1e293b",background:"#fff",fontFamily:"inherit"};
  return(
    <Modal onClose={onClose} title={editEntry?"✏️ Edit period":"🩸 Log period"}>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><label style={{fontSize:12,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:6}}>Start date</label><input type="date" style={inp} value={startDate} max={format(new Date(),"yyyy-MM-dd")} onChange={e=>setStartDate(e.target.value)}/></div>
          <div><label style={{fontSize:12,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:6}}>End date</label><input type="date" style={inp} value={endDate||""} min={startDate} max={format(new Date(),"yyyy-MM-dd")} onChange={e=>setEndDate(e.target.value)}/></div>
        </div>
        <div><label style={{fontSize:12,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:8}}>Flow level</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {FLOW_LEVELS.map(f=><button key={f.id} onClick={()=>setFlow(f.id)} style={{padding:"8px 16px",borderRadius:99,border:`2px solid ${flow===f.id?f.color:"#e2e8f0"}`,background:flow===f.id?f.color+"20":"#fff",color:flow===f.id?f.color:"#64748b",fontSize:13,fontWeight:flow===f.id?700:500,cursor:"pointer",fontFamily:"inherit"}}>{f.label}</button>)}
          </div>
        </div>
        <div><label style={{fontSize:12,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:6}}>Notes</label><textarea style={{...inp,minHeight:70,resize:"vertical"}} placeholder="Any notes…" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <PrimaryBtn onClick={submit} style={{width:"100%"}}>{editEntry?"Update period":"Save period"}</PrimaryBtn>
        {editEntry&&onDelete&&<DangerBtn onClick={()=>{onDelete(editEntry.id);onClose();}} style={{width:"100%"}}>🗑️ Delete this log</DangerBtn>}
      </div>
    </Modal>
  );
}

function LogSymptomsModal({onClose,onSave,symptomLogs,dateKey}){
  const key = dateKey || format(new Date(),"yyyy-MM-dd");
  const existing = symptomLogs[key] || {};
  const isEdit = !!existing.loggedAt;
  const [selected,setSelected]=useState(new Set(existing.symptoms||[]));
  const [mood,setMood]=useState(existing.mood||"");
  const [energy,setEnergy]=useState(existing.energy||3);
  const [pain,setPain]=useState(existing.pain||0);
  const [notes,setNotes]=useState(existing.notes||"");
  function toggle(id){setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});}
  function submit(){
    onSave({...symptomLogs,[key]:{symptoms:[...selected],mood,energy,pain,notes,loggedAt:new Date().toISOString()}});
    onClose();
  }
  function handleDelete(){
    const updated={...symptomLogs}; delete updated[key];
    onSave(updated); onClose();
  }
  const inp={width:"100%",padding:"10px 12px",borderRadius:10,fontSize:14,border:"1.5px solid #e2e8f0",outline:"none",boxSizing:"border-box",fontFamily:"inherit",minHeight:70,resize:"vertical"};
  return(
    <Modal onClose={onClose} title={isEdit?"✏️ Edit log":"How are you feeling?"} wide>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div style={{fontSize:12,fontWeight:600,color:"#94a3b8"}}>{key}</div>
        <div><p style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,marginTop:0}}>Mood</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {MOODS.map(m=><button key={m.id} onClick={()=>setMood(mood===m.id?"":m.id)} style={{padding:"7px 12px",borderRadius:99,border:`1.5px solid ${mood===m.id?"#e11d48":"#e2e8f0"}`,background:mood===m.id?"#fff1f2":"#fff",color:mood===m.id?"#e11d48":"#475569",fontSize:13,fontWeight:mood===m.id?700:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><span>{m.emoji}</span>{m.label}</button>)}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div><p style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,marginTop:0}}>Energy {energy}/5</p>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span>😩</span><input type="range" min={1} max={5} value={energy} onChange={e=>setEnergy(Number(e.target.value))} style={{flex:1}}/><span>⚡</span></div>
          </div>
          <div><p style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,marginTop:0}}>Pain {pain}/10</p>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span>😌</span><input type="range" min={0} max={10} value={pain} onChange={e=>setPain(Number(e.target.value))} style={{flex:1}}/><span>😣</span></div>
          </div>
        </div>
        <div><p style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,marginTop:0}}>Symptoms</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {SYMPTOMS.map(s=><button key={s.id} onClick={()=>toggle(s.id)} style={{padding:"7px 12px",borderRadius:99,border:`1.5px solid ${selected.has(s.id)?"#e11d48":"#e2e8f0"}`,background:selected.has(s.id)?"#fff1f2":"#fff",color:selected.has(s.id)?"#e11d48":"#475569",fontSize:13,fontWeight:selected.has(s.id)?700:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><span>{s.emoji}</span>{s.label}</button>)}
          </div>
        </div>
        <div><p style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6,marginTop:0}}>Notes</p><textarea style={inp} placeholder="Anything else today…" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <PrimaryBtn onClick={submit} style={{width:"100%"}}>{isEdit?"Update log":"Save log"}</PrimaryBtn>
        {isEdit&&<DangerBtn onClick={handleDelete} style={{width:"100%"}}>🗑️ Delete this log</DangerBtn>}
      </div>
    </Modal>
  );
}

function CycleSettingsModal({form,onSave,onClose}){
  const [local,setLocal]=useState({...DEFAULT_FORM,...form,lastPeriodDate:form.lastPeriodDate?format(new Date(form.lastPeriodDate),"yyyy-MM-dd"):""});
  const [err,setErr]=useState({});
  const inp={width:"100%",padding:"11px 13px",borderRadius:12,fontSize:15,border:"1.5px solid #e2e8f0",outline:"none",boxSizing:"border-box",color:"#1e293b",background:"#fff",fontFamily:"inherit"};
  const lbl={fontSize:12,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",display:"block",marginBottom:7};
  function validate(){const e={};if(!local.lastPeriodDate)e.lastPeriodDate="Required";if(!local.cycleLength||local.cycleLength<21||local.cycleLength>45)e.cycleLength="Must be 21-45";if(!local.periodDuration||local.periodDuration<1||local.periodDuration>10)e.periodDuration="Must be 1-10";setErr(e);return!Object.keys(e).length;}
  function submit(){if(!validate())return;onSave({...local,lastPeriodDate:new Date(local.lastPeriodDate+"T00:00:00"),cycleLength:Number(local.cycleLength),periodDuration:Number(local.periodDuration)||5,lutealLen:Number(local.lutealLen)||14,pmsLength:Number(local.pmsLength)||5,averageFlow:local.averageFlow||"medium"});}
  const ovulationDay=Math.max(1,(Number(local.cycleLength)||28)-(Number(local.lutealLen)||14));
  return(
    <Modal onClose={onClose} title="Cycle settings">
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div><label style={lbl}>Last period date</label><input type="date" style={inp} value={local.lastPeriodDate||""} max={format(new Date(),"yyyy-MM-dd")} onChange={e=>setLocal(v=>({...v,lastPeriodDate:e.target.value}))}/>{err.lastPeriodDate&&<span style={{fontSize:12,color:"#ef4444",display:"block",marginTop:4}}>{err.lastPeriodDate}</span>}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div><label style={lbl}>Cycle length</label><input type="number" min={21} max={45} style={inp} value={local.cycleLength||""} onChange={e=>setLocal(v=>({...v,cycleLength:parseInt(e.target.value)||""}))}/>{err.cycleLength&&<span style={{fontSize:12,color:"#ef4444",display:"block",marginTop:4}}>{err.cycleLength}</span>}</div>
          <div><label style={lbl}>Period length</label><input type="number" min={1} max={10} style={inp} value={local.periodDuration||""} onChange={e=>setLocal(v=>({...v,periodDuration:parseInt(e.target.value)||""}))}/>{err.periodDuration&&<span style={{fontSize:12,color:"#ef4444",display:"block",marginTop:4}}>{err.periodDuration}</span>}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div><label style={lbl}>Average flow</label><select style={inp} value={local.averageFlow||"medium"} onChange={e=>setLocal(v=>({...v,averageFlow:e.target.value}))}>{FLOW_LEVELS.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}</select></div>
          <div><label style={lbl}>Ovulation</label><input readOnly style={{...inp,background:"#f8fafc",color:"#64748b"}} value={`Around cycle day ${ovulationDay}`}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div><label style={lbl}>PMS length</label><input type="number" min={0} max={14} style={inp} value={local.pmsLength||""} onChange={e=>setLocal(v=>({...v,pmsLength:parseInt(e.target.value)||0}))}/></div>
          <div><label style={lbl}>Pregnancy mode</label><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 13px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#f8fafc"}}><span style={{fontSize:14,color:"#94a3b8",fontWeight:700}}>Coming soon</span><Toggle checked={false} onChange={()=>{}}/></div></div>
        </div>
        <PrimaryBtn onClick={submit} style={{width:"100%"}}>Save cycle settings</PrimaryBtn>
      </div>
    </Modal>
  );
}

function RoutineModal({routine,onClose}){
  const [step,setStep]=useState(0);
  const [done,setDone]=useState(false);
  if(!routine) return null;
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
        <div style={{width:100,height:100,borderRadius:"50%",background:sound.bg,fontSize:48,display:"flex",alignItems:"center",justifyContent:"center",border:playing?`3px solid ${sound.color}`:"3px solid transparent"}}>{sound.emoji}</div>
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

// ─── REMINDERS PANEL ─────────────────────────────────────────────────────────
function RemindersPanel({onClose,reminders,onSave,cycleData}){
  const [local,setLocal]=useState(reminders.map(r=>({...r})));
  const [notifPerm,setNotifPerm]=useState(typeof Notification!=="undefined"?Notification.permission:"unsupported");
  const [added,setAdded]=useState(false);

  async function requestPermission(){
    if(typeof Notification==="undefined") return;
    const perm=await Notification.requestPermission();
    setNotifPerm(perm);
    if(perm==="granted") triggerTestNotification(perm);
  }

  function triggerTestNotification(permission=notifPerm){
    if(permission==="granted"){
      new Notification("GlowHer 🌸",{body:"Notifications enabled! You'll receive cycle reminders here.",icon:"https://emojicdn.elk.sh/🌸"});
    }
  }

  function update(id, changes){
    setLocal(prev=>prev.map(r=>r.id===id?{...r,...changes}:r));
  }

  function addCustom(){
    const newId="custom"+(Date.now());
    setLocal(prev=>[...prev,{id:newId,icon:"⭐",label:"Custom reminder",desc:"",enabled:true,time:"09:00",customText:"",isCustom:true}]);
    setAdded(true);
  }

  function removeCustom(id){
    setLocal(prev=>prev.filter(r=>r.id!==id));
  }

  function save(){
    onSave(local);
    onClose();
  }

  // Fire in-app notifications for enabled reminders based on cycle
  function getActiveAlerts(){
    const alerts=[];
    if(!cycleData) return alerts;
    const {nextPeriodIn,nextPeriodDate,ovDay}=cycleData;
    local.forEach(r=>{
      if(!r.enabled) return;
      if(r.id==="period"&&nextPeriodIn<=r.daysBefore&&nextPeriodIn>=0){
        alerts.push({id:r.id,icon:r.icon,title:nextPeriodIn===0?"Your period is expected today":`Period in ${nextPeriodIn} day${nextPeriodIn===1?"":"s"}`,body:`Expected on ${format(nextPeriodDate,"MMM d")}`,color:"#e11d48"});
      }
      if(r.id==="ovulation"&&isSameDay(new Date(),ovDay)){
        alerts.push({id:r.id,icon:r.icon,title:"Ovulation day",body:"Today is your peak fertility day",color:"#d97706"});
      }
    });
    return alerts;
  }

  const inp={width:"100%",padding:"9px 12px",borderRadius:10,fontSize:13,border:"1.5px solid #e2e8f0",outline:"none",boxSizing:"border-box",fontFamily:"inherit",color:"#1e293b",background:"#fff"};

  return(
    <Modal onClose={onClose} title="🔔 Reminders" wide>
      <div style={{display:"flex",flexDirection:"column",gap:0}}>

        {/* Notification permission banner */}
        {notifPerm!=="granted"&&notifPerm!=="unsupported"&&(
          <div style={{background:"#fef3c7",borderRadius:14,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:22}}>🔔</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:"#92400e"}}>Enable browser notifications</div>
              <div style={{fontSize:12,color:"#a16207"}}>Get alerts even when the app is in the background</div>
            </div>
            <button onClick={requestPermission} style={{background:"#f59e0b",border:"none",borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:12,fontWeight:700,color:"#fff",fontFamily:"inherit",whiteSpace:"nowrap"}}>Enable</button>
          </div>
        )}
        {notifPerm==="granted"&&(
          <div style={{background:"#f0fdf4",borderRadius:14,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>✅</span>
            <span style={{fontSize:13,color:"#15803d",fontWeight:600}}>Browser notifications active</span>
          </div>
        )}

        {/* Active cycle alerts */}
        {cycleData&&getActiveAlerts().map(a=>(
          <div key={a.id} style={{background:`${a.color}10`,border:`1.5px solid ${a.color}30`,borderRadius:14,padding:"12px 16px",marginBottom:12,display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:22}}>{a.icon}</span>
            <div><div style={{fontSize:13,fontWeight:700,color:a.color}}>{a.title}</div><div style={{fontSize:12,color:"#64748b"}}>{a.body}</div></div>
          </div>
        ))}

        {/* Reminder rows */}
        {local.map((r,i)=>(
          <div key={r.id} style={{padding:"16px 0",borderBottom:"1px solid #f1f5f9"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:r.enabled?10:0}}>
              <span style={{fontSize:22,flexShrink:0}}>{r.icon}</span>
              <div style={{flex:1}}>
                {r.isCustom?(
                  <input value={r.label} onChange={e=>update(r.id,{label:e.target.value})} style={{...inp,padding:"5px 8px",fontWeight:700,fontSize:14}} placeholder="Reminder name"/>
                ):(
                  <div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{r.label}</div>
                )}
                {!r.isCustom&&<div style={{fontSize:12,color:"#94a3b8"}}>{r.desc}</div>}
              </div>
              <Toggle checked={r.enabled} onChange={v=>update(r.id,{enabled:v})}/>
              {r.isCustom&&<button onClick={()=>removeCustom(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#fca5a5",fontSize:18,padding:"0 4px"}}>🗑️</button>}
            </div>
            {r.enabled&&(
              <div style={{paddingLeft:34,display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <label style={{fontSize:12,color:"#64748b",fontWeight:600,minWidth:36}}>Time</label>
                  <input type="time" value={r.time||"08:00"} onChange={e=>update(r.id,{time:e.target.value})} style={{...inp,width:"auto",flex:1}}/>
                  {r.id==="period"&&(
                    <>
                      <label style={{fontSize:12,color:"#64748b",fontWeight:600,whiteSpace:"nowrap"}}>Days before</label>
                      <input type="number" min={0} max={7} value={r.daysBefore||2} onChange={e=>update(r.id,{daysBefore:parseInt(e.target.value)||2})} style={{...inp,width:60}}/>
                    </>
                  )}
                </div>
                {(r.isCustom||r.id==="medication")&&(
                  <input value={r.customText||""} onChange={e=>update(r.id,{customText:e.target.value})} style={inp} placeholder="Reminder message…"/>
                )}
              </div>
            )}
          </div>
        ))}

        <button onClick={addCustom} style={{background:"#f8fafc",border:"1.5px dashed #e2e8f0",borderRadius:12,padding:"12px",cursor:"pointer",fontSize:13,fontWeight:600,color:"#64748b",fontFamily:"inherit",width:"100%",marginTop:8}}>+ Add custom reminder</button>
        <PrimaryBtn onClick={save} style={{width:"100%",marginTop:16}}>Save reminders</PrimaryBtn>
      </div>
    </Modal>
  );
}

// ─── HISTORY TAB ─────────────────────────────────────────────────────────────
function HistoryTab({symptomLogs,periodLogs,onEditSymptoms,onEditPeriod,onLogSymptoms,cycleData}){
  const [search,setSearch]=useState("");
  const [filterMonth,setFilterMonth]=useState("all");
  const [sortOrder,setSortOrder]=useState("desc");
  const [viewMode,setViewMode]=useState("symptoms"); // "symptoms" | "periods"

  // Build symptom history entries from the date-keyed map
  const symptomEntries = Object.entries(symptomLogs)
    .map(([dateKey,log])=>({dateKey,...log}))
    .sort((a,b)=>sortOrder==="desc"?b.dateKey.localeCompare(a.dateKey):a.dateKey.localeCompare(b.dateKey));

  // Unique months for filter
  const months = [...new Set([
    ...symptomEntries.map(e=>e.dateKey.slice(0,7)),
    ...periodLogs.map(l=>l.startDate?.slice(0,7)||""),
  ].filter(Boolean))].sort((a,b)=>b.localeCompare(a));

  const filtered = viewMode==="symptoms"
    ? symptomEntries.filter(e=>{
        if(filterMonth!=="all"&&!e.dateKey.startsWith(filterMonth)) return false;
        if(search){
          const q=search.toLowerCase();
          const moodMatch=MOODS.find(m=>m.id===e.mood)?.label?.toLowerCase().includes(q);
          const symMatch=(e.symptoms||[]).some(s=>SYMPTOMS.find(x=>x.id===s)?.label?.toLowerCase().includes(q));
          const noteMatch=(e.notes||"").toLowerCase().includes(q);
          if(!moodMatch&&!symMatch&&!noteMatch) return false;
        }
        return true;
      })
    : periodLogs
        .filter(l=>{
          if(filterMonth!=="all"&&!l.startDate?.startsWith(filterMonth)) return false;
          if(search&&!(l.flow||"").toLowerCase().includes(search.toLowerCase())&&!(l.notes||"").toLowerCase().includes(search.toLowerCase())) return false;
          return true;
        })
        .sort((a,b)=>sortOrder==="desc"?b.startDate?.localeCompare(a.startDate||""):a.startDate?.localeCompare(b.startDate||""));

  const inp={padding:"10px 14px",borderRadius:12,fontSize:14,border:"1.5px solid #e2e8f0",outline:"none",fontFamily:"inherit",color:"#1e293b",background:"#fff"};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Header */}
      <div style={{background:"#fff",borderRadius:20,padding:"18px 20px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <h2 style={{fontSize:18,fontWeight:900,color:"#1e293b",margin:0}}>📋 History</h2>
          <PrimaryBtn onClick={onLogSymptoms} style={{fontSize:12,padding:"8px 16px"}}>+ Log today</PrimaryBtn>
        </div>

        {/* View toggle */}
        <div style={{display:"flex",gap:6,marginBottom:12,background:"#f8fafc",borderRadius:12,padding:4}}>
          {[{id:"symptoms",label:"Symptoms & Mood"},{id:"periods",label:"Period logs"}].map(v=>(
            <button key={v.id} onClick={()=>setViewMode(v.id)} style={{flex:1,padding:"8px",borderRadius:10,border:"none",cursor:"pointer",background:viewMode===v.id?"#fff":"transparent",color:viewMode===v.id?"#e11d48":"#64748b",fontSize:13,fontWeight:viewMode===v.id?700:500,fontFamily:"inherit",boxShadow:viewMode===v.id?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>{v.label}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{position:"relative",marginBottom:10}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"#94a3b8"}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search symptoms, mood, notes…" style={{...inp,width:"100%",paddingLeft:38,boxSizing:"border-box"}}/>
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={{...inp,fontSize:13,padding:"7px 12px"}}>
            <option value="all">All months</option>
            {months.map(m=>{
              const d=new Date(m+"-01");
              return <option key={m} value={m}>{format(d,"MMMM yyyy")}</option>;
            })}
          </select>
          <button onClick={()=>setSortOrder(s=>s==="desc"?"asc":"desc")} style={{...inp,cursor:"pointer",fontSize:13,padding:"7px 14px",fontWeight:600,color:"#64748b"}}>
            {sortOrder==="desc"?"↓ Newest first":"↑ Oldest first"}
          </button>
        </div>
      </div>

      {/* Summary stats */}
      {viewMode==="symptoms"&&symptomEntries.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[
            {label:"Total logs",value:symptomEntries.length,icon:"📝",color:"#7c3aed",bg:"#f5f3ff"},
            {label:"This month",value:symptomEntries.filter(e=>e.dateKey.startsWith(format(new Date(),"yyyy-MM"))).length,icon:"📅",color:"#e11d48",bg:"#fff1f2"},
            {label:"Avg pain",value:(symptomEntries.filter(e=>e.pain>0).reduce((a,e)=>a+(e.pain||0),0)/Math.max(1,symptomEntries.filter(e=>e.pain>0).length)).toFixed(1),icon:"💊",color:"#0f766e",bg:"#f0fdfa"},
          ].map(s=>(
            <div key={s.label} style={{background:s.bg,borderRadius:16,padding:"14px 12px",textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:20,fontWeight:900,color:s.color}}>{s.value}</div>
              <div style={{fontSize:11,color:"#64748b"}}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Entries */}
      {filtered.length===0?(
        <div style={{background:"#fff",borderRadius:20,padding:"40px 20px",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{fontSize:40,marginBottom:12}}>📭</div>
          <p style={{fontSize:15,fontWeight:700,color:"#1e293b",marginBottom:4}}>{search?"No results found":"No logs yet"}</p>
          <p style={{fontSize:13,color:"#94a3b8",margin:0}}>{search?"Try a different search term":"Start logging to see your history here."}</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {viewMode==="symptoms"?filtered.map(entry=>(
            <SymptomHistoryCard key={entry.dateKey} entry={entry} cycleData={cycleData} onEdit={()=>onEditSymptoms(entry.dateKey)}/>
          )):filtered.map(log=>(
            <PeriodHistoryCard key={log.id} log={log} onEdit={()=>onEditPeriod(log)}/>
          ))}
        </div>
      )}
    </div>
  );
}

function SymptomHistoryCard({entry,cycleData,onEdit}){
  const [open,setOpen]=useState(false);
  const mood=MOODS.find(m=>m.id===entry.mood);
  const syms=(entry.symptoms||[]).map(s=>SYMPTOMS.find(x=>x.id===s)).filter(Boolean);
  const phase=cycleData?.dayPhaseMap?.[entry.dateKey];
  const phaseInfo=phase?PHASES[phase]:null;
  const dateObj=new Date(entry.dateKey+"T12:00:00");

  return(
    <div style={{background:"#fff",borderRadius:18,boxShadow:"0 2px 8px rgba(0,0,0,0.05)",overflow:"hidden"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:42,height:42,borderRadius:12,background:phaseInfo?phaseInfo.light:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
          {mood?mood.emoji:"📝"}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <span style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{format(dateObj,"MMM d, yyyy")}</span>
            {entry.loggedAt&&<span style={{fontSize:12,fontWeight:700,color:"#94a3b8"}}>{formatTime(entry.loggedAt)}</span>}
            {phaseInfo&&<span style={{fontSize:11,fontWeight:600,color:phaseInfo.color,background:phaseInfo.light,borderRadius:99,padding:"2px 8px"}}>{phase}</span>}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {mood&&<span style={{fontSize:12,color:"#64748b"}}>{mood.emoji} {mood.label}</span>}
            {entry.pain>0&&<span style={{fontSize:12,color:"#e11d48"}}>· Pain {entry.pain}/10</span>}
            {entry.energy&&<span style={{fontSize:12,color:"#64748b"}}>· Energy {entry.energy}/5</span>}
            {syms.length>0&&<span style={{fontSize:12,color:"#94a3b8"}}>· {syms.map(s=>s.emoji).join(" ")}</span>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={e=>{e.stopPropagation();onEdit();}} style={{background:"#f5f3ff",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:12,fontWeight:700,color:"#7c3aed",fontFamily:"inherit"}}>✏️</button>
          <span style={{color:"#94a3b8",fontSize:16}}>{open?"▲":"▼"}</span>
        </div>
      </div>
      {open&&(
        <div style={{padding:"0 18px 16px",borderTop:"1px solid #f8fafc"}}>
          {syms.length>0&&(
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Symptoms</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {syms.map(s=><span key={s.id} style={{background:"#fff1f2",color:"#e11d48",borderRadius:99,padding:"4px 10px",fontSize:12,fontWeight:600}}>{s.emoji} {s.label}</span>)}
              </div>
            </div>
          )}
          {entry.pain>0&&(
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Pain level</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,height:6,background:"#f1f5f9",borderRadius:99}}>
                  <div style={{width:`${(entry.pain/10)*100}%`,height:"100%",background:`hsl(${Math.round((1-entry.pain/10)*120)},70%,50%)`,borderRadius:99}}/>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{entry.pain}/10</span>
              </div>
            </div>
          )}
          {entry.notes&&<div><div style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Notes</div><p style={{fontSize:13,color:"#475569",margin:0,lineHeight:1.5}}>{entry.notes}</p></div>}
          {entry.loggedAt&&<div style={{marginTop:10,fontSize:11,color:"#cbd5e1"}}>Logged at {formatTime(entry.loggedAt)}</div>}
        </div>
      )}
    </div>
  );
}

function PeriodHistoryCard({log,onEdit}){
  const [open,setOpen]=useState(false);
  const dur=log.endDate?Math.max(1,differenceInDays(new Date(log.endDate),new Date(log.startDate))+1):null;
  const flowColor=FLOW_LEVELS.find(f=>f.id===log.flow)?.color||"#fb7185";
  return(
    <div style={{background:"#fff",borderRadius:18,boxShadow:"0 2px 8px rgba(0,0,0,0.05)",overflow:"hidden"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:42,height:42,borderRadius:12,background:"#fff1f2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🩸</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:"#1e293b",marginBottom:3}}>
            {format(new Date(log.startDate+"T12:00:00"),"MMM d")}{log.endDate?` – ${format(new Date(log.endDate+"T12:00:00"),"MMM d")}`:""}{dur?` (${dur} days)`:""}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:flowColor,flexShrink:0,display:"inline-block"}}/>
            <span style={{fontSize:12,color:"#64748b",textTransform:"capitalize"}}>{log.flow} flow</span>
            {log.notes&&<span style={{fontSize:12,color:"#94a3b8"}}>· Has note</span>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={e=>{e.stopPropagation();onEdit();}} style={{background:"#fff1f2",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:12,fontWeight:700,color:"#e11d48",fontFamily:"inherit"}}>✏️</button>
          <span style={{color:"#94a3b8",fontSize:16}}>{open?"▲":"▼"}</span>
        </div>
      </div>
      {open&&log.notes&&(
        <div style={{padding:"0 18px 16px",borderTop:"1px solid #f8fafc"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Notes</div>
          <p style={{fontSize:13,color:"#475569",margin:0}}>{log.notes}</p>
          {log.loggedAt&&<div style={{marginTop:8,fontSize:11,color:"#cbd5e1"}}>Logged {format(new Date(log.loggedAt),"MMM d")} at {formatTime(log.loggedAt)}</div>}
        </div>
      )}
    </div>
  );
}

// ─── CALENDAR TAB ─────────────────────────────────────────────────────────────
function CalendarTab({cycleData,periodLogs,symptomLogs,onLogPeriod,onEditPeriod,onEditSymptoms}){
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
      <div style={{background:"#fff",borderRadius:20,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px 12px"}}>
          <button onClick={prev} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#475569",padding:"4px 10px",borderRadius:8}}>‹</button>
          <span style={{fontWeight:800,fontSize:17,color:"#1e293b"}}>{format(new Date(viewYear,viewMonth,1),"MMMM yyyy")}</span>
          <button onClick={next} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#475569",padding:"4px 10px",borderRadius:8}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 8px"}}>
          {DAYS_HDR.map(d=><div key={d} style={{textAlign:"center",fontSize:11,color:"#94a3b8",fontWeight:700,padding:"4px 0"}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 8px 12px"}}>
          {Array(pad).fill(null).map((_,i)=><div key={`p${i}`}/>)}
          {days.map(d=>{
            const k=format(d,"yyyy-MM-dd");
            const isToday=isSameDay(d,today);
            const isSelected=selKey===k;
            const phase=cycleData?dayPhaseMap[k]:null;
            const isPeriod=periodDays.has(k)||!!loggedDays[k];
            const isOv=ovulationDays.has(k);
            const isFertile=fertileDays.has(k)&&!isOv;
            const hasLog=!!symptomLogs[k];
            let cellBg="transparent",cellColor="#1e293b";
            if(isPeriod){cellBg="#fda4af";cellColor="#fff";}
            else if(isOv){cellBg="#fbbf24";cellColor="#fff";}
            else if(isFertile){cellBg="#fde68a";cellColor="#92400e";}
            else if(phase==="Luteal"){cellBg="#fce7f3";cellColor="#9d174d";}
            else if(phase==="Follicular"){cellBg="#ede9fe";cellColor="#6d28d9";}
            const isStartPeriod=isPeriod&&!periodDays.has(format(subDays(d,1),"yyyy-MM-dd"));
            const isEndPeriod=isPeriod&&!periodDays.has(format(addDays(d,1),"yyyy-MM-dd"));
            let borderRadius="8px";
            if(isPeriod) borderRadius=isStartPeriod&&isEndPeriod?"50%":isStartPeriod?"50% 0 0 50%":isEndPeriod?"0 50% 50% 0":"0";
            const cycleDay=cycleData?differenceInDays(d,cycleData.cycleStart)+1:null;
            const showCycleDay=cycleDay&&cycleDay>0&&cycleDay<=cycleData?.cycleLength;
            return(
              <div key={k} onClick={()=>setSelected({date:d,key:k})} style={{position:"relative",cursor:"pointer",padding:"2px 0"}}>
                <div style={{background:cellBg,color:cellColor,borderRadius,textAlign:"center",padding:"6px 2px 4px",fontWeight:isToday?900:isSelected?700:400,fontSize:14,outline:isSelected&&!isPeriod?"2px solid #7c3aed":"none",outlineOffset:1,border:isToday&&!isPeriod&&!isSelected?"2px solid #7c3aed":"none",position:"relative"}}>
                  {showCycleDay&&<div style={{fontSize:8,color:isPeriod?"#fff7f7":isFertile?"#92400e":"#94a3b8",lineHeight:1,marginBottom:1}}>{cycleDay}</div>}
                  {d.getDate()}
                  {isOv&&<div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:4,height:4,borderRadius:"50%",background:"#f59e0b"}}/>}
                  {hasLog&&!isPeriod&&<div style={{position:"absolute",top:2,right:2,width:5,height:5,borderRadius:"50%",background:"#7c3aed"}}/>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selected&&(
        <div style={{background:"#fff",borderRadius:20,padding:"20px 22px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <div style={{fontSize:18,fontWeight:900,color:"#1e293b"}}>{format(selected.date,"MMM d")}</div>
              {cycleData&&dayPhaseMap[selKey]&&<div style={{fontSize:13,color:"#94a3b8"}}>Cycle Day {differenceInDays(selected.date,cycleData.cycleStart)+1}</div>}
            </div>
            <div style={{display:"flex",gap:8}}>
              {(selPeriodLog||selLog)&&<button onClick={()=>{if(selPeriodLog)onEditPeriod(selPeriodLog);else if(selLog)onEditSymptoms(selKey);}} style={{background:"linear-gradient(135deg,#fce7f3,#ede9fe)",border:"none",borderRadius:99,padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:700,color:"#7c3aed",fontFamily:"inherit"}}>✏️ Edit</button>}
              {!selLog&&<button onClick={()=>onEditSymptoms(selKey)} style={{background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:99,padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:700,color:"#64748b",fontFamily:"inherit"}}>+ Add log</button>}
            </div>
          </div>
          {selPhase&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{width:8,height:8,borderRadius:"50%",background:selP?.color||"#94a3b8"}}/><span style={{fontSize:13,color:"#64748b"}}>{PHASES[selPhase]?.fertility} — Chance of getting pregnant</span></div>}
          {periodDays.has(selKey)&&<div style={{background:"#fff1f2",borderRadius:12,padding:"10px 14px",marginBottom:8}}><span style={{fontSize:13,fontWeight:700,color:"#e11d48"}}>🩸 Period day (predicted)</span></div>}
          {ovulationDays.has(selKey)&&<div style={{background:"#fffbeb",borderRadius:12,padding:"10px 14px",marginBottom:8}}><span style={{fontSize:13,fontWeight:700,color:"#d97706"}}>🌟 Ovulation day</span></div>}
          {selPeriodLog&&<div style={{background:"#fdf2f8",borderRadius:12,padding:"10px 14px",marginBottom:8}}><span style={{fontSize:13,fontWeight:700,color:"#db2777"}}>Logged: {selPeriodLog.flow} flow{selPeriodLog.notes?` · ${selPeriodLog.notes}`:""}</span></div>}
          {selLog&&(
            <div style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px"}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:selLog.notes?8:0}}>
                {selLog.mood&&<span style={{background:"#f5f3ff",color:"#7c3aed",borderRadius:99,padding:"4px 10px",fontSize:12,fontWeight:600}}>{MOODS.find(m=>m.id===selLog.mood)?.emoji} {selLog.mood}</span>}
                {selLog.energy&&<span style={{background:"#fef3c7",color:"#92400e",borderRadius:99,padding:"4px 10px",fontSize:12,fontWeight:600}}>⚡ {selLog.energy}/5</span>}
                {selLog.pain>0&&<span style={{background:"#fff1f2",color:"#e11d48",borderRadius:99,padding:"4px 10px",fontSize:12,fontWeight:600}}>💊 Pain {selLog.pain}/10</span>}
                {(selLog.symptoms||[]).map(s=>{const sym=SYMPTOMS.find(x=>x.id===s);return sym?<span key={s} style={{background:"#fff1f2",color:"#e11d48",borderRadius:99,padding:"4px 10px",fontSize:12,fontWeight:600}}>{sym.emoji} {sym.label}</span>:null;})}
              </div>
              {selLog.notes&&<p style={{fontSize:13,color:"#64748b",margin:0}}>{selLog.notes}</p>}
            </div>
          )}
          {!periodDays.has(selKey)&&!selPeriodLog&&!selLog&&!ovulationDays.has(selKey)&&<p style={{fontSize:13,color:"#94a3b8",margin:0,textAlign:"center",padding:"8px 0"}}>No data for this day.</p>}
        </div>
      )}
      <div style={{background:"#fff",borderRadius:16,padding:"14px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
          {[{bg:"#fda4af",text:"Period"},{bg:"#fde68a",text:"Fertile"},{bg:"#fbbf24",text:"Ovulation"},{bg:"#fce7f3",text:"Luteal"},{bg:"#ede9fe",text:"Follicular"}].map(x=>(
            <div key={x.text} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:14,height:14,borderRadius:4,background:x.bg}}/><span style={{fontSize:12,color:"#64748b"}}>{x.text}</span></div>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:"#7c3aed"}}/><span style={{fontSize:12,color:"#64748b"}}>Has log</span></div>
        </div>
      </div>
      <PrimaryBtn onClick={onLogPeriod} style={{width:"100%"}}>🩸 Log a period</PrimaryBtn>
    </div>
  );
}

// ─── TODAY TAB ────────────────────────────────────────────────────────────────
function TodayTab({cycleData,form,onOpenCycleSettings,onLogPeriod,onLogSymptoms,onEditSymptoms,symptomLogs,onPartnerMode}){
  const todayKey=format(new Date(),"yyyy-MM-dd");
  const todayLog=symptomLogs[todayKey];
  if(!cycleData){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <div style={{background:"linear-gradient(160deg,#e8e0ff 0%,#ffd6e7 50%,#ffecd2 100%)",borderRadius:28,padding:"40px 28px 32px",textAlign:"center",position:"relative",overflow:"hidden",minHeight:300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 70% 30%,rgba(255,200,220,0.5),transparent 60%)"}}/>
          <div style={{position:"relative",zIndex:1}}>
            <CatMascot size={110}/>
            <h2 style={{fontSize:26,fontWeight:900,color:"#1e293b",margin:"16px 0 8px"}}>Track your cycle 🌸</h2>
            <p style={{color:"#64748b",fontSize:14,maxWidth:260,margin:"0 auto 24px"}}>Enter your last period date to see personalized daily insights.</p>
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
      <div style={{background:"linear-gradient(160deg,#e8e0ff 0%,#ffd6e7 50%,#ffecd2 100%)",borderRadius:28,padding:"28px 24px 24px",position:"relative",overflow:"hidden",minHeight:220}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 75% 25%,rgba(255,180,210,0.6),transparent 60%)"}}/>
        <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>{phase==="Menstrual"?"Period":phase}</div>
            <h1 style={{fontSize:36,fontWeight:900,color:"#1e293b",margin:"0 0 4px",lineHeight:1}}>{nextPeriodIn===0?"Today 🩸":nextPeriodIn===1?"1 DAY LEFT":`${nextPeriodIn} DAYS LEFT`}</h1>
            <p style={{fontSize:14,color:"#64748b",margin:"0 0 18px"}}>{format(nextPeriodDate,"MMM d")} · Next Period</p>
            <PrimaryBtn onClick={onLogPeriod} color="linear-gradient(135deg,#e11d48,#f43f5e)">Period Starts</PrimaryBtn>
          </div>
          <div style={{flexShrink:0,marginBottom:-8}}><CatMascot size={100}/></div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <button onClick={onPartnerMode} style={{background:"linear-gradient(145deg,#ede9fe,#fdf2f8)",border:"none",borderRadius:20,padding:"16px 14px",position:"relative",overflow:"hidden",minHeight:130,textAlign:"left",cursor:"pointer",fontFamily:"inherit"}}>
          <div style={{fontSize:13,fontWeight:800,color:"#1e293b",lineHeight:1.2,marginBottom:8}}>Partner<br/>Mode</div>
          <div style={{position:"absolute",bottom:-10,right:-10,width:70,height:70,borderRadius:"50%",background:"rgba(244,114,182,0.25)"}}/>
          <div style={{position:"absolute",bottom:10,right:6,fontSize:28}}>🫶</div>
        </button>
        <div style={{background:"#fff",borderRadius:20,padding:"14px",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{fontSize:10,fontWeight:700,color:p.color,textTransform:"uppercase",letterSpacing:"0.06em"}}>CYCLE DAY</div>
          <CycleRing day={dayOfCycle} total={cycleLength} color={p.color}/>
        </div>
        <div style={{background:"linear-gradient(145deg,#fff1f2,#fdf2f8)",borderRadius:20,padding:"16px 14px",position:"relative",overflow:"hidden",minHeight:130}}>
          <div style={{fontSize:13,fontWeight:800,color:"#1e293b",lineHeight:1.2,marginBottom:4}}>{format(nextPeriodDate,"MMM d")}</div>
          <div style={{fontSize:11,color:"#94a3b8"}}>Next Period</div>
          <div style={{position:"absolute",bottom:-8,right:-8,width:60,height:60,borderRadius:"50%",background:"rgba(251,113,133,0.2)"}}/>
          <div style={{position:"absolute",bottom:10,right:10,fontSize:32}}>🩸</div>
        </div>
      </div>
      <CycleBar cycleData={cycleData}/>
      <div style={{background:"#fff",borderRadius:20,padding:"20px 22px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",gap:16}}>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:800,color:"#1e293b",marginBottom:4}}>How are you feeling today?</div>
          <div style={{fontSize:13,color:"#94a3b8",marginBottom:14}}>Tell us more about your body to get analysis</div>
          <PrimaryBtn onClick={todayLog?()=>onEditSymptoms(todayKey):onLogSymptoms} color="#5b21b6" style={{fontSize:13,padding:"10px 20px"}}>{todayLog?"✏️ Edit today's log":"Add Symptom"}</PrimaryBtn>
        </div>
        <div style={{fontSize:52,flexShrink:0}}>{todayLog?.mood?MOODS.find(m=>m.id===todayLog.mood)?.emoji||"😊":"😊"}</div>
      </div>
      {todayLog&&(
        <div style={{background:"#fff",borderRadius:18,padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <p style={{fontSize:14,fontWeight:700,color:"#1e293b",margin:0}}>Today's check-in</p>
            <button onClick={()=>onEditSymptoms(todayKey)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:"#7c3aed",fontWeight:700,fontFamily:"inherit"}}>✏️ Edit</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {todayLog.mood&&<span style={{background:"#f5f3ff",color:"#7c3aed",borderRadius:99,padding:"5px 12px",fontSize:13,fontWeight:600}}>{MOODS.find(m=>m.id===todayLog.mood)?.emoji} {todayLog.mood}</span>}
            {todayLog.energy&&<span style={{background:"#fef3c7",color:"#92400e",borderRadius:99,padding:"5px 12px",fontSize:13,fontWeight:600}}>⚡ {todayLog.energy}/5</span>}
            {todayLog.pain>0&&<span style={{background:"#fff1f2",color:"#e11d48",borderRadius:99,padding:"5px 12px",fontSize:13,fontWeight:600}}>💊 Pain {todayLog.pain}/10</span>}
            {(todayLog.symptoms||[]).map(s=>{const sym=SYMPTOMS.find(x=>x.id===s);return sym?<span key={s} style={{background:"#fff1f2",color:"#e11d48",borderRadius:99,padding:"5px 12px",fontSize:13,fontWeight:600}}>{sym.emoji} {sym.label}</span>:null;})}
          </div>
          {todayLog.notes&&<p style={{fontSize:13,color:"#64748b",marginTop:8,marginBottom:0}}>{todayLog.notes}</p>}
        </div>
      )}
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
            <div key={r.title} onClick={()=>setActiveRoutine(r)} style={{display:"flex",alignItems:"center",gap:14,background:"#fafafa",borderRadius:14,padding:"14px 16px",border:"1px solid #f1f5f9",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#fff1f2"} onMouseLeave={e=>e.currentTarget.style.background="#fafafa"}>
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
          {SOUNDSCAPES.map(s=><div key={s.id} onClick={()=>setActiveSound(s)} style={{background:s.bg,borderRadius:16,padding:"18px 14px",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}><div style={{fontSize:28,marginBottom:8}}>{s.emoji}</div><div style={{fontSize:13,fontWeight:700,color:s.color}}>{s.name}</div><div style={{fontSize:11,color:s.color,opacity:0.7,marginTop:2}}>Tap to play</div></div>)}
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

// ─── ANALYSIS TAB ─────────────────────────────────────────────────────────────
function SettingsModal({settings,onSave,onClose}){
  const [local,setLocal]=useState({...DEFAULT_APP_SETTINGS,...settings});
  const row=(key,label,desc)=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,padding:"14px 0",borderBottom:"1px solid #f1f5f9"}}>
      <div><div style={{fontSize:15,fontWeight:800,color:"#1e293b"}}>{label}</div><div style={{fontSize:13,color:"#94a3b8",lineHeight:1.4}}>{desc}</div></div>
      <Toggle checked={!!local[key]} onChange={v=>setLocal(s=>({...s,[key]:v}))}/>
    </div>
  );
  const inp={width:"100%",padding:"11px 13px",borderRadius:12,fontSize:15,border:"1.5px solid #e2e8f0",outline:"none",boxSizing:"border-box",color:"#1e293b",background:"#fff",fontFamily:"inherit"};
  return(
    <Modal onClose={onClose} title="Settings" wide>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div style={{background:"#fdf2f8",borderRadius:16,padding:"14px 16px"}}>
          <div style={{fontSize:16,fontWeight:900,color:"#be185d",marginBottom:4}}>GlowHer preferences</div>
          <div style={{fontSize:13,color:"#64748b",lineHeight:1.5}}>App settings live here. Cycle details stay in Cycle settings.</div>
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:"0 4px"}}>
          {row("darkMode","Dark Mode","Use a softer low-light interface. Placeholder for now.")}
          {row("notifications","Notifications","Allow browser and in-app reminder alerts.")}
          {row("reminders","Reminder toggle","Turn scheduled reminders on or off globally.")}
          {row("animations","Animations","Keep gentle motion and transitions enabled.")}
          {row("sound","Sound","Allow relaxation sounds and future alert tones.")}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div><label style={{fontSize:12,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",display:"block",marginBottom:7}}>Theme selection</label><select disabled style={{...inp,background:"#f8fafc",color:"#94a3b8"}} value={local.theme}><option value="classic">Classic Glow - coming soon</option></select></div>
          <div><label style={{fontSize:12,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",display:"block",marginBottom:7}}>Pet selection</label><select disabled style={{...inp,background:"#f8fafc",color:"#94a3b8"}} value={local.pet}><option value="cat">Current mascot - coming soon</option></select></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{background:"#f8fafc",borderRadius:16,padding:16}}><div style={{fontSize:15,fontWeight:900,color:"#1e293b",marginBottom:4}}>Backup & Restore</div><div style={{fontSize:13,color:"#94a3b8"}}>Placeholder for export and import tools.</div></div>
          <div style={{background:"#f8fafc",borderRadius:16,padding:16}}><div style={{fontSize:15,fontWeight:900,color:"#1e293b",marginBottom:4}}>About App</div><div style={{fontSize:13,color:"#94a3b8"}}>Cute cycle, symptom, care, and partner support tracker.</div></div>
        </div>
        <PrimaryBtn onClick={()=>{onSave(local);onClose();}} style={{width:"100%"}}>Save settings</PrimaryBtn>
      </div>
    </Modal>
  );
}

function PartnerModeTab({cycleData,onBack}){
  const phase=cycleData?.phase||"None";
  const phaseInfo=PHASES[phase]||PHASES.None;
  const softCard=(item,i)=>(
    <div key={item.title||item} style={{background:i%2?"#f5f3ff":"#fff1f2",borderRadius:18,padding:"16px 15px",border:"1px solid rgba(255,255,255,0.7)",boxShadow:"0 2px 10px rgba(15,23,42,0.04)"}}>
      <div style={{width:44,height:44,borderRadius:"50%",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:i%2?"#7c3aed":"#e11d48",marginBottom:10}}>{String(item.icon||"care").slice(0,4)}</div>
      <div style={{fontSize:15,fontWeight:900,color:"#1e293b",marginBottom:5}}>{item.title||item}</div>
      {item.text&&<div style={{fontSize:13,color:"#64748b",lineHeight:1.5}}>{item.text}</div>}
    </div>
  );
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{background:"linear-gradient(145deg,#fff1f2,#ede9fe)",borderRadius:24,padding:"22px 22px 20px",position:"relative",overflow:"hidden"}}>
        {onBack&&<button onClick={onBack} style={{background:"rgba(255,255,255,0.8)",border:"none",borderRadius:99,padding:"8px 14px",fontSize:13,fontWeight:800,color:"#7c3aed",fontFamily:"inherit",cursor:"pointer",marginBottom:14}}>Back to dashboard</button>}
        <div style={{fontSize:13,fontWeight:900,color:"#be185d",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Partner Mode</div>
        <h1 style={{fontSize:30,lineHeight:1.08,fontWeight:950,color:"#1e293b",margin:"0 0 8px"}}>Small care, big comfort</h1>
        <p style={{fontSize:15,color:"#64748b",lineHeight:1.6,margin:0,maxWidth:520}}>Today she may be in the {phaseInfo.label} phase. Keep support practical, gentle, and low-pressure.</p>
      </div>

      <section style={{background:"#fff",borderRadius:20,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <h2 style={{fontSize:20,fontWeight:950,color:"#1e293b",margin:"0 0 14px"}}>How to Help Today</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>{PARTNER_SECTIONS.help.map(softCard)}</div>
      </section>

      <section style={{background:"#fff",borderRadius:20,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <h2 style={{fontSize:20,fontWeight:950,color:"#1e293b",margin:"0 0 14px"}}>What She Might Be Feeling</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12}}>{PARTNER_SECTIONS.feelings.map(softCard)}</div>
      </section>

      <section style={{background:"linear-gradient(145deg,#fdf2f8,#fff7ed)",borderRadius:20,padding:22}}>
        <h2 style={{fontSize:20,fontWeight:950,color:"#1e293b",margin:"0 0 14px"}}>Cute Care Cards</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
          {["Build a blanket nest","Bring a warm drink","Make a no-questions snack plate","Send a sweet check-in"].map((c,i)=><div key={c} style={{background:"#fff",borderRadius:18,padding:18,minHeight:120,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",right:-18,bottom:-18,width:80,height:80,borderRadius:"50%",background:i%2?"#ddd6fe":"#fecdd3"}}/><div style={{fontSize:13,fontWeight:900,color:"#e11d48",marginBottom:10}}>CARE</div><div style={{fontSize:16,fontWeight:900,color:"#1e293b",position:"relative"}}>{c}</div></div>)}
        </div>
      </section>

      <section style={{background:"#fff",borderRadius:20,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <h2 style={{fontSize:20,fontWeight:950,color:"#1e293b",margin:"0 0 14px"}}>Movie Recommendations</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>{Object.entries(PARTNER_SECTIONS.movies).map(([cat,movies])=><div key={cat} style={{background:"#f8fafc",borderRadius:16,padding:15}}><div style={{fontSize:15,fontWeight:900,color:"#7c3aed",marginBottom:8}}>{cat}</div>{movies.map(m=><div key={m} style={{fontSize:13,color:"#475569",padding:"4px 0"}}>{m}</div>)}</div>)}</div>
      </section>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
        {[{title:"Relaxing Music",items:PARTNER_SECTIONS.music},{title:"Book Recommendations",items:PARTNER_SECTIONS.books},{title:"Comfort Foods",items:PARTNER_SECTIONS.foods},{title:"Sweet Messages",items:PARTNER_SECTIONS.messages},{title:"Girls' Bucket List",items:PARTNER_SECTIONS.bucket}].map(block=><section key={block.title} style={{background:"#fff",borderRadius:20,padding:20,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}><h2 style={{fontSize:18,fontWeight:950,color:"#1e293b",margin:"0 0 12px"}}>{block.title}</h2><div style={{display:"flex",flexDirection:"column",gap:8}}>{block.items.map(x=><div key={x} style={{background:"#f8fafc",borderRadius:12,padding:"9px 11px",fontSize:13,color:"#475569",lineHeight:1.45}}>{x}</div>)}</div></section>)}
      </div>
    </div>
  );
}

function AnalysisTab({cycleData,form,periodLogs,symptomLogs,onLogPeriod,onEditPeriod}){
  if(!cycleData){
    return(
      <div style={{background:"#f8fafc",borderRadius:20,padding:40,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>📊</div>
        <p style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:6}}>No data yet</p>
        <p style={{fontSize:13,color:"#94a3b8"}}>Set up your cycle to unlock analysis and insights.</p>
      </div>
    );
  }
  const {phase,cycleLength,nextPeriodIn,nextPeriodDate}=cycleData;
  const lph=form.lutealLen||14;
  const ovuDate=addDays(nextPeriodDate,-lph);
  const fertileStart=subDays(ovuDate,5);
  const symCount={};
  Object.values(symptomLogs).forEach(log=>{(log.symptoms||[]).forEach(s=>{symCount[s]=(symCount[s]||0)+1;});});
  const topSymptoms=Object.entries(symCount).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const totalLogs=Object.keys(symptomLogs).length;
  const avgPain=totalLogs>0?(Object.values(symptomLogs).reduce((a,l)=>a+(l.pain||0),0)/totalLogs).toFixed(1):"—";
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{background:"#fff",borderRadius:20,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <p style={{fontSize:16,fontWeight:800,color:"#1e293b",marginBottom:16}}>Cycle analysis</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{background:"#fff1f2",borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:28,color:"#e11d48",marginBottom:8}}>🩸</div>
            <div style={{fontSize:22,fontWeight:900,color:"#e11d48"}}>{periodLogs.length>0?`${periodLogs[0].endDate?Math.max(1,differenceInDays(new Date(periodLogs[0].endDate),new Date(periodLogs[0].startDate))+1):1} Day`:"— Day"}</div>
            <div style={{fontSize:13,color:"#e11d48"}}>Average period</div>
          </div>
          <div style={{background:"#fffbeb",borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:28,color:"#d97706",marginBottom:8}}>🔄</div>
            <div style={{fontSize:22,fontWeight:900,color:"#d97706"}}>{cycleLength} Days</div>
            <div style={{fontSize:13,color:"#d97706"}}>Cycle length</div>
          </div>
          <div style={{background:"#f0fdfa",borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:28,color:"#0f766e",marginBottom:8}}>📝</div>
            <div style={{fontSize:22,fontWeight:900,color:"#0f766e"}}>{totalLogs}</div>
            <div style={{fontSize:13,color:"#0f766e"}}>Symptom logs</div>
          </div>
          <div style={{background:"#f5f3ff",borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:28,color:"#7c3aed",marginBottom:8}}>💊</div>
            <div style={{fontSize:22,fontWeight:900,color:"#7c3aed"}}>{avgPain}</div>
            <div style={{fontSize:13,color:"#7c3aed"}}>Avg pain score</div>
          </div>
        </div>
        {periodLogs.length<3&&<p style={{fontSize:13,color:"#64748b",marginTop:12,marginBottom:0}}>Log 3 periods to unlock full analysis. <span onClick={onLogPeriod} style={{color:"#e11d48",fontWeight:700,cursor:"pointer"}}>Log period →</span></p>}
      </div>
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
      {periodLogs.length>0&&(
        <div style={{background:"#fff",borderRadius:20,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <p style={{fontSize:14,fontWeight:800,color:"#1e293b",marginBottom:16}}>Period history</p>
          {periodLogs.slice(0,5).map(l=>{
            const w=l.endDate?Math.max(1,differenceInDays(new Date(l.endDate),new Date(l.startDate))+1):1;
            return(
              <div key={l.id} style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:13,color:"#64748b"}}>{format(new Date(l.startDate+"T12:00:00"),"MMM d")}{l.endDate?" – "+format(new Date(l.endDate+"T12:00:00"),"MMM d"):""} · {l.flow}</span>
                  <button onClick={()=>onEditPeriod(l)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#7c3aed",fontWeight:700,fontFamily:"inherit"}}>✏️</button>
                </div>
                <div style={{position:"relative",height:10,borderRadius:99,background:"#f1f5f9"}}>
                  <div style={{height:"100%",width:`${Math.min(100,(w/cycleLength)*100)}%`,background:"#fb7185",borderRadius:99}}/>
                </div>
                {l.notes&&<p style={{fontSize:12,color:"#94a3b8",marginTop:3,marginBottom:0}}>{l.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
      {topSymptoms.length>0&&(
        <div style={{background:"#fff",borderRadius:20,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <p style={{fontSize:14,fontWeight:800,color:"#1e293b",marginBottom:16}}>Most common symptoms</p>
          {topSymptoms.map(([id,count])=>{
            const sym=SYMPTOMS.find(s=>s.id===id);
            const pct=totalLogs>0?Math.round((count/totalLogs)*100):0;
            return sym?(
              <div key={id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <span style={{fontSize:20}}>{sym.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{sym.label}</span><span style={{fontSize:12,color:"#94a3b8"}}>{count}× ({pct}%)</span></div>
                  <div style={{height:6,background:"#f1f5f9",borderRadius:99}}><div style={{width:`${pct}%`,height:"100%",background:"#fb7185",borderRadius:99}}/></div>
                </div>
              </div>
            ):null;
          })}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const DEFAULT_FORM={lastPeriodDate:null,cycleLength:28,lutealLen:14,periodDuration:5,averageFlow:"medium",pmsLength:5,pregnancyMode:false};

export default function PeriodTracker(){
  const [tab,setTab]=useState("today");
  const [modal,setModal]=useState(null);
  const [editingPeriod,setEditingPeriod]=useState(null);
  const [editingSymptomKey,setEditingSymptomKey]=useState(null);
  const [form,setForm]=useState(DEFAULT_FORM);
  const [cycleData,setCycleData]=useState(null);
  const [periodLogs,setPeriodLogs]=useState([]);
  const [symptomLogs,setSymptomLogs]=useState({});
  const [reminders,setReminders]=useState(DEFAULT_REMINDERS);
  const [appSettings,setAppSettings]=useState(DEFAULT_APP_SETTINGS);
  const [loaded,setLoaded]=useState(false);
  const [inAppNotifs,setInAppNotifs]=useState([]);
  const notifsChecked=useRef(false);

  // Load all data
  useEffect(()=>{
    async function loadAll(){
      try{
        const [fRaw,plRaw,slRaw,remRaw,setRaw]=await Promise.all([
          storageGet("pt-form"),storageGet("pt-periods"),storageGet("pt-symptoms"),storageGet("pt-reminders"),storageGet("pt-settings"),
        ]);
        if(fRaw){
          const f=JSON.parse(fRaw);
          if(f.lastPeriodDate){const raw=f.lastPeriodDate;f.lastPeriodDate=typeof raw==="string"&&raw.length===10?new Date(raw+"T00:00:00"):new Date(raw);}
          setForm(f);
        }
        if(plRaw) setPeriodLogs(JSON.parse(plRaw));
        if(slRaw) setSymptomLogs(JSON.parse(slRaw));
        if(remRaw){
          const saved=JSON.parse(remRaw);
          // Merge saved with defaults so new defaults appear
          const merged=DEFAULT_REMINDERS.map(d=>{const s=saved.find(r=>r.id===d.id);return s?{...d,...s}:d;});
          const customs=saved.filter(r=>r.isCustom&&!DEFAULT_REMINDERS.find(d=>d.id===r.id));
          setReminders([...merged,...customs]);
        }
        if(setRaw) setAppSettings({...DEFAULT_APP_SETTINGS,...JSON.parse(setRaw)});
      } catch(e){console.error(e);}
      setLoaded(true);
    }
    loadAll();
  },[]);

  // Compute cycle
  useEffect(()=>{
    if(form.lastPeriodDate&&form.cycleLength>=21&&form.cycleLength<=45){
      try{const d=new Date(form.lastPeriodDate);if(!isNaN(d))setCycleData(computeCycleData(d,form.cycleLength,form.lutealLen||14,form.periodDuration||5));else setCycleData(null);}
      catch{setCycleData(null);}
    } else setCycleData(null);
  },[form]);

  // Fire in-app notifications based on reminders + cycle
  useEffect(()=>{
    if(!loaded||notifsChecked.current||!cycleData||!appSettings.notifications||!appSettings.reminders) return;
    notifsChecked.current=true;
    const alerts=[];
    const {nextPeriodIn,nextPeriodDate,ovDay}=cycleData;
    reminders.forEach(r=>{
      if(!r.enabled) return;
      if(r.id==="period"&&nextPeriodIn<=(r.daysBefore||2)&&nextPeriodIn>=0){
        alerts.push({id:`notif-period-${Date.now()}`,icon:"🩸",title:nextPeriodIn===0?"Period expected today":`Period in ${nextPeriodIn} day${nextPeriodIn===1?"":"s"}`,body:`Expected ${format(nextPeriodDate,"MMM d")}`,color:"#e11d48"});
        if(typeof Notification!=="undefined"&&Notification.permission==="granted"){
          new Notification("GlowHer 🌸",{body:nextPeriodIn===0?"Your period is expected today":`Your period is in ${nextPeriodIn} days (${format(nextPeriodDate,"MMM d")})`});
        }
      }
      if(r.id==="ovulation"&&isSameDay(new Date(),ovDay)){
        alerts.push({id:`notif-ov-${Date.now()}`,icon:"🌟",title:"Ovulation day",body:"Today is your peak fertility day",color:"#d97706"});
        if(typeof Notification!=="undefined"&&Notification.permission==="granted"){
          new Notification("GlowHer 🌸",{body:"Today is your ovulation day — peak fertility!"});
        }
      }
      if(r.id==="mood"){
        const todayKey=format(new Date(),"yyyy-MM-dd");
        if(!symptomLogs[todayKey]){
          alerts.push({id:`notif-mood-${Date.now()}`,icon:"💬",title:"Daily mood check-in",body:"How are you feeling today?",color:"#7c3aed"});
        }
      }
    });
    if(alerts.length) setInAppNotifs(alerts);
  },[loaded,cycleData,reminders,appSettings,symptomLogs]);


  useEffect(()=>{
    if(!loaded||!appSettings.notifications||!appSettings.reminders) return;
    const timers=[];
    const showReminder=(r,body)=>{
      const title=r.label||"Reminder";
      const message=body||r.customText||r.desc||"A gentle reminder from GlowHer.";
      if(typeof Notification!=="undefined"&&Notification.permission==="granted"){
        try{new Notification(`GlowHer - ${title}`,{body:message});return;}catch{}
      }
      setInAppNotifs(prev=>[{id:`scheduled-${r.id}-${Date.now()}`,icon:r.icon,title,body:message,color:r.id==="ovulation"?"#d97706":r.id==="water"?"#0891b2":"#e11d48"},...prev].slice(0,5));
    };
    const atTime=(date,time)=>{const [h,m]=(time||"09:00").split(":").map(Number);const d=new Date(date);d.setHours(h||0,m||0,0,0);return d;};
    const now=new Date();
    reminders.forEach(r=>{
      if(!r.enabled) return;
      let target=null, body="";
      if(r.id==="period"&&cycleData){target=atTime(subDays(cycleData.nextPeriodDate,r.daysBefore||0),r.time);body=`Your period is expected on ${format(cycleData.nextPeriodDate,"MMM d")}.`;}
      else if(r.id==="ovulation"&&cycleData){target=atTime(cycleData.ovDay,r.time);body="Today may be your ovulation day.";}
      else if(r.id==="water"){target=new Date(now.getTime()+3*60*60*1000);body="Time to drink water and be kind to your body.";}
      else {target=atTime(now,r.time);if(target<=now) target=addDays(target,1);body=r.customText||r.desc||"Time for your check-in.";}
      const delay=target?target-now:null;
      if(delay!=null&&delay>0&&delay<=7*24*60*60*1000){timers.push(setTimeout(()=>showReminder(r,body),delay));}
    });
    return()=>timers.forEach(clearTimeout);
  },[loaded,appSettings,reminders,cycleData]);

  const saveForm=useCallback(async(f)=>{setForm(f);await storageSet("pt-form",{...f,lastPeriodDate:f.lastPeriodDate?new Date(f.lastPeriodDate).toISOString():null});setModal(null);},[]);
  const savePeriods=useCallback(async(logs)=>{setPeriodLogs(logs);await storageSet("pt-periods",logs);},[]);
  const saveSymptoms=useCallback(async(logs)=>{setSymptomLogs(logs);await storageSet("pt-symptoms",logs);},[]);
  const saveReminders=useCallback(async(r)=>{setReminders(r);await storageSet("pt-reminders",r);},[]);
  const saveSettings=useCallback(async(settings)=>{setAppSettings(settings);await storageSet("pt-settings",settings);},[]);

  function handleEditPeriod(entry){setEditingPeriod(entry);setModal("editPeriod");}
  function handleDeletePeriod(id){savePeriods(periodLogs.filter(l=>l.id!==id));}
  function handleEditSymptoms(dateKey){setEditingSymptomKey(dateKey);setModal("editSymptoms");}
  function dismissNotif(id){setInAppNotifs(n=>n.filter(x=>x.id!==id));}

  const bellCount=inAppNotifs.length;

  if(!loaded){
    return(
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#ede9fe,#fdf2f8)",fontFamily:"Nunito,Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",lineHeight:1.5}}>
        <div style={{textAlign:"center"}}><CatMascot size={80}/><p style={{color:"#94a3b8",fontSize:14,marginTop:12}}>Loading…</p></div>
      </div>
    );
  }

  const activePhase=cycleData?.phase||"None";
  const p=PHASES[activePhase];
  const nav=[
    {id:"today",icon:"H",label:"Today"},
    {id:"calendar",icon:"C",label:"Calendar"},
    {id:"history",icon:"L",label:"History"},
    {id:"selfcare",icon:"S",label:"Self Care"},
    {id:"partner",icon:"P",label:"Partner"},
    {id:"analysis",icon:"A",label:"Analysis"},
  ];

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#ede9fe 0%,#f8fafc 40%,#fdf2f8 100%)",fontFamily:"Nunito,Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",fontSize:15,lineHeight:1.5,display:"flex",flexDirection:"column"}}>

      {/* In-app notifications */}
      <NotificationToast notifications={inAppNotifs} onDismiss={dismissNotif}/>

      {/* Modals */}
      {modal==="cycle"&&<CycleSettingsModal form={form} onSave={saveForm} onClose={()=>setModal(null)}/>}
      {modal==="period"&&<LogPeriodModal onClose={()=>setModal(null)} onSave={savePeriods} onDelete={handleDeletePeriod} logs={periodLogs} editEntry={null}/>}
      {modal==="editPeriod"&&editingPeriod&&<LogPeriodModal onClose={()=>{setModal(null);setEditingPeriod(null);}} onSave={savePeriods} onDelete={handleDeletePeriod} logs={periodLogs} editEntry={editingPeriod}/>}
      {modal==="symptoms"&&<LogSymptomsModal onClose={()=>setModal(null)} onSave={saveSymptoms} symptomLogs={symptomLogs} dateKey={format(new Date(),"yyyy-MM-dd")}/>}
      {modal==="editSymptoms"&&editingSymptomKey&&<LogSymptomsModal onClose={()=>{setModal(null);setEditingSymptomKey(null);}} onSave={saveSymptoms} symptomLogs={symptomLogs} dateKey={editingSymptomKey}/>}
      {modal==="reminders"&&<RemindersPanel onClose={()=>setModal(null)} reminders={reminders} onSave={saveReminders} cycleData={cycleData}/>}
      {modal==="settings"&&<SettingsModal settings={appSettings} onSave={saveSettings} onClose={()=>setModal(null)}/>}

      {/* Header */}
      <header style={{padding:"14px 20px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,0.7)",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:50,borderBottom:"1px solid rgba(241,245,249,0.8)"}}>
        <button onClick={()=>setModal("settings")} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,position:"relative",padding:4}}>
          ⚙️{!form.lastPeriodDate&&<span style={{position:"absolute",top:2,right:2,width:8,height:8,borderRadius:"50%",background:"#e11d48",border:"1.5px solid #fff"}}/>}
        </button>
        <div style={{fontSize:16,fontWeight:900,color:"#1e293b",letterSpacing:"-0.02em"}}>GlowHer 🌸</div>
        <button onClick={()=>setModal("reminders")} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,padding:4,position:"relative"}}>
          🔔{bellCount>0&&<span style={{position:"absolute",top:0,right:0,minWidth:16,height:16,borderRadius:99,background:"#e11d48",border:"2px solid #fff",fontSize:10,fontWeight:800,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{bellCount}</span>}
        </button>
      </header>

      <div style={{display:"flex",flex:1,minHeight:0}}>
        {/* Desktop sidebar */}
        <aside className="sidebar-nav" style={{width:210,padding:"20px 12px",flexShrink:0,borderRight:"1px solid rgba(241,245,249,0.8)",display:"flex",flexDirection:"column",gap:4,background:"rgba(255,255,255,0.5)"}}>
          {nav.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderRadius:14,border:"none",cursor:"pointer",background:tab===n.id?"rgba(225,29,72,0.1)":"transparent",color:tab===n.id?"#e11d48":"#64748b",fontSize:14,fontWeight:tab===n.id?700:500,fontFamily:"inherit",textAlign:"left",width:"100%"}}>
              <span style={{fontSize:18}}>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
          <div style={{height:1,background:"#f1f5f9",margin:"8px 4px"}}/>
          <p style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.07em",padding:"4px 16px 2px"}}>Quick actions</p>
          {[{icon:"🩸",label:"Log period",action:()=>setModal("period")},{icon:"💬",label:"Log symptoms",action:()=>setModal("symptoms")},{icon:"🔔",label:"Reminders",action:()=>setModal("reminders")},{icon:"🔧",label:"Cycle settings",action:()=>setModal("cycle")}].map(x=>(
            <button key={x.label} onClick={x.action} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 16px",borderRadius:12,border:"none",cursor:"pointer",background:"transparent",color:"#64748b",fontSize:13,fontWeight:500,fontFamily:"inherit",textAlign:"left",width:"100%"}} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
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
            {tab==="today"&&<TodayTab cycleData={cycleData} form={form} onOpenCycleSettings={()=>setModal("cycle")} onLogPeriod={()=>setModal("period")} onLogSymptoms={()=>setModal("symptoms")} onEditSymptoms={handleEditSymptoms} symptomLogs={symptomLogs} onPartnerMode={()=>setTab("partner")}/>}
            {tab==="calendar"&&<CalendarTab cycleData={cycleData} periodLogs={periodLogs} symptomLogs={symptomLogs} onLogPeriod={()=>setModal("period")} onEditPeriod={handleEditPeriod} onEditSymptoms={handleEditSymptoms}/>}
            {tab==="history"&&<HistoryTab symptomLogs={symptomLogs} periodLogs={periodLogs} onEditSymptoms={handleEditSymptoms} onEditPeriod={handleEditPeriod} onLogSymptoms={()=>setModal("symptoms")} cycleData={cycleData}/>}
            {tab==="selfcare"&&<SelfCareTab/>}
            {tab==="partner"&&<PartnerModeTab cycleData={cycleData} onBack={()=>setTab("today")}/>}
            {tab==="analysis"&&<AnalysisTab cycleData={cycleData} form={form} periodLogs={periodLogs} symptomLogs={symptomLogs} onLogPeriod={()=>setModal("period")} onEditPeriod={handleEditPeriod}/>}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav — 5 items, no FAB center to keep all tabs reachable */}
      <nav className="bottom-nav" style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(12px)",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-around",alignItems:"center",padding:"8px 0 env(safe-area-inset-bottom,8px)",zIndex:50}}>
        {nav.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"5px 8px",borderRadius:12,color:tab===n.id?"#e11d48":"#94a3b8",fontFamily:"inherit",fontSize:9,fontWeight:tab===n.id?700:500,minWidth:44}}>
            <span style={{fontSize:19}}>{n.icon}</span><span>{n.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        @media(min-width:640px){.sidebar-nav{display:flex!important}.bottom-nav{display:none!important}}
        @media(max-width:639px){.sidebar-nav{display:none!important}.bottom-nav{display:flex!important}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
      `}</style>
    </div>
  );
}
