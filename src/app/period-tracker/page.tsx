"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Settings, Bell, Home, CalendarDays, BookOpen, HeartHandshake, Heart, BarChart3, Droplets, MessageCircle, Wrench, Activity } from "lucide-react";

//  Date utilities 
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

//  Constants 
const PHASES = {
  Menstrual:  { label:"Menstrual",  days:"Days 1-5",   tagline:"Rest & restore", color:"#e11d48", calColor:"#fb7185", bg:"#fff1f2", light:"#ffe4e6", fertility:"LOW",  tips:[{icon:"FE",title:"Iron-rich foods",text:"Spinach, lentils, and dark chocolate replenish iron lost during bleeding."},{icon:"MV",title:"Gentle movement",text:"Light yoga or slow walks - your body's doing hard work, let it lead."},{icon:"HT",title:"Heat therapy",text:"A warm compress on your abdomen eases cramps effectively."},{icon:"JR",title:"Rest & reflect",text:"Intuition is sharp this week. Journal, slow down, be kind to yourself."}] },
  Follicular: { label:"Follicular", days:"Days 6-13",  tagline:"Rise & begin",   color:"#7c3aed", calColor:"#a78bfa", bg:"#f5f3ff", light:"#ede9fe", fertility:"LOW",  tips:[{icon:"PR",title:"Lean proteins",text:"Complex carbs and protein support your rising energy."},{icon:"WK",title:"Build momentum",text:"Energy is climbing - try a new workout class or brisk walk."},{icon:"PL",title:"Create & plan",text:"Mental clarity peaks here. Great time for big projects."},{icon:"GL",title:"Skin glow",text:"Estrogen peaks - skin is often clearest. Keep routine simple."}] },
  Ovulation:  { label:"Ovulation",  days:"Peak day",   tagline:"Peak energy",    color:"#d97706", calColor:"#fbbf24", bg:"#fffbeb", light:"#fef3c7", fertility:"HIGH", tips:[{icon:"OX",title:"Antioxidants",text:"Berries, leafy greens, and fiber support hormone processing."},{icon:"PW",title:"Peak performance",text:"You're at your strongest - HIIT, running, heavy lifting, go for it."},{icon:"SP",title:"Speak up",text:"Verbal confidence peaks. Great for negotiations and presentations."},{icon:"CN",title:"Connect",text:"High confidence. Best time for social events and important conversations."}] },
  Luteal:     { label:"Luteal",     days:"Days 15-28", tagline:"Wind down",      color:"#0f766e", calColor:"#5eead4", bg:"#f0fdfa", light:"#ccfbf1", fertility:"LOW",  tips:[{icon:"MG",title:"Manage PMS",text:"Magnesium-rich foods and B-vitamins ease mood swings. Reduce caffeine."},{icon:"EZ",title:"Ease off",text:"Swap intense workouts for Pilates, swimming, or restorative yoga."},{icon:"HY",title:"Stay hydrated",text:"Bloating is common. Up water intake and wear comfortable clothing."},{icon:"SC",title:"Deep self-care",text:"Turn inward - a bath, a book, a film. Cozy over productive."}] },
  None:       { label:"Not set",    days:"",           tagline:"Set up cycle",   color:"#db2777", calColor:"#f9a8d4", bg:"#fdf2f8", light:"#fce7f3", fertility:"-",    tips:[{icon:"TR",title:"Track your cycle",text:"Enter your last period date to unlock personalized daily insights."},{icon:"PT",title:"Spot patterns",text:"Tracking helps you understand what's normal for your unique body."},{icon:"WO",title:"Sync workouts",text:"Align your exercise with your natural hormonal rhythm for better results."},{icon:"FD",title:"Eat with your cycle",text:"Each phase calls for different nutrients to feel your best."}] },
};
const SYMPTOMS = [
  {id:"cramps",emoji:"CR",label:"Cramps"},{id:"headache",emoji:"HD",label:"Headache"},
  {id:"bloating",emoji:"BL",label:"Bloating"},{id:"fatigue",emoji:"FT",label:"Fatigue"},
  {id:"mood_swings",emoji:"MS",label:"Mood swings"},{id:"acne",emoji:"AC",label:"Acne"},
  {id:"breast_tenderness",emoji:"BT",label:"Breast pain"},{id:"nausea",emoji:"NA",label:"Nausea"},
  {id:"back_pain",emoji:"BP",label:"Back pain"},{id:"cravings",emoji:"CV",label:"Cravings"},
  {id:"insomnia",emoji:"IN",label:"Insomnia"},{id:"anxiety",emoji:"AX",label:"Anxiety"},
];
const MOODS = [
  {id:"happy",emoji:"HA",label:"Happy"},{id:"calm",emoji:"CA",label:"Calm"},
  {id:"energetic",emoji:"EN",label:"Energetic"},{id:"sad",emoji:"SA",label:"Sad"},
  {id:"anxious",emoji:"AN",label:"Anxious"},{id:"irritable",emoji:"IR",label:"Irritable"},
  {id:"tired",emoji:"TI",label:"Tired"},{id:"sensitive",emoji:"SE",label:"Sensitive"},
];
const FLOW_LEVELS = [
  {id:"spotting",label:"Spotting",color:"#fda4af"},{id:"light",label:"Light",color:"#fb7185"},
  {id:"medium",label:"Medium",color:"#e11d48"},{id:"heavy",label:"Heavy",color:"#9f1239"},
];
const SOUNDSCAPES = [
  {id:"forest",name:"Forest Adventure",emoji:"FR",bg:"#d1fae5",color:"#065f46",freq:180,file:"/sounds/audiopapkin-forest-ambience-296528.mp3"},
  {id:"rain",name:"Forest Rain",emoji:"RN",bg:"#dbeafe",color:"#1e40af",freq:220,file:"/sounds/enternalrainsounds-light-rain-ambience-with-cricket-sound-in-forest-night-420326.mp3"},
  {id:"ocean",name:"Ocean Waves",emoji:"OC",bg:"#cffafe",color:"#164e63",freq:140,file:"/sounds/dragon-studio-ocean-waves-376898.mp3"},
  {id:"night",name:"Night Crickets",emoji:"NT",bg:"#ede9fe",color:"#4c1d95",freq:440,file:"/sounds/schorsch1964-night-atmosphere-with-crickets-374652.mp3"},
  {id:"fire",name:"Crackling Fire",emoji:"FI",bg:"#fef3c7",color:"#92400e",freq:160,file:"/sounds/soundreality-fire-crackling-528620.mp3"},
  {id:"wind",name:"Mountain Wind",emoji:"WD",bg:"#f1f5f9",color:"#334155",freq:100,file:"/sounds/freesound_community-ambience-mountain-outdoor-mirador-montbau-1-53134.mp3"},
];

const PHASE_SUPPORT = {
  Menstrual:{button:"Is your period over?",headline:"Period care ideas",partner:"Focus on warmth, patience, and taking tasks off her plate.",ideas:["Heating pad","Warm drinks","Iron-rich food","Low plans","Early sleep"]},
  Follicular:{button:"Log period",headline:"Follicular care ideas",partner:"Energy may return. Support light plans, fresh food, and gentle encouragement.",ideas:["Fresh meals","Walk outside","Plan something fun","Try a new routine","Hydrate well"]},
  Ovulation:{button:"Log period",headline:"Ovulation care ideas",partner:"She may feel brighter and social. Keep support playful, kind, and pressure-free.",ideas:["Light date","Protein snack","Celebrate energy","Social plans","Stretch"]},
  Luteal:{button:"Log period",headline:"Luteal care ideas",partner:"PMS can build here. Offer comfort, reduce decisions, and keep the day flexible.",ideas:["Magnesium foods","Comfort movie","Declutter tasks","Warm bath","Soft clothes"]},
  None:{button:"Log period",headline:"Cycle care ideas",partner:"Set cycle details to unlock phase-specific support.",ideas:["Set cycle","Log symptoms","Drink water","Rest","Journal"]},
};
const RELIEF_ROUTINES = [
  {title:"Period pain relief",duration:"12 min",emoji:"YO",desc:"Gentle yoga flows to ease cramps",steps:["Child's pose (2 min)","Supine twist (3 min)","Reclined butterfly (3 min)","Savasana (4 min)"]},
  {title:"Foot reflexology",duration:"6 min",emoji:"FT",desc:"Pressure points connected to the uterus",steps:["Warm foot soak (2 min)","Inner arch press (2 min)","Ankle rotation (2 min)"]},
  {title:"Breathing for cramps",duration:"8 min",emoji:"BR",desc:"4-7-8 breathing reduces pain signals",steps:["Inhale 4 counts","Hold 7 counts","Exhale 8 counts","Repeat 8 cycles"]},
  {title:"Hip opening flow",duration:"15 min",emoji:"HP",desc:"Releases pelvic tension and improves circulation",steps:["Pigeon pose left (3 min)","Pigeon pose right (3 min)","Lizard pose (3 min)","Happy baby (3 min)","Rest (3 min)"]},
];

// Default reminder config
const DEFAULT_REMINDERS = [
  {id:"period",icon:"PD",label:"Period reminder",desc:"2 days before expected period",enabled:true,daysBefore:2,time:"08:00"},
  {id:"ovulation",icon:"OV",label:"Ovulation alert",desc:"On ovulation day",enabled:true,daysBefore:0,time:"08:00"},
  {id:"medication",icon:"RX",label:"Medication",desc:"Daily pill reminder",enabled:false,time:"09:00",customText:"Take your medication"},
  {id:"water",icon:"WA",label:"Hydration",desc:"Drink water reminders",enabled:false,time:"10:00",interval:"every3h"},
  {id:"mood",icon:"MO",label:"Mood check-in",desc:"Daily mood logging reminder",enabled:false,time:"20:00"},
  {id:"custom1",icon:"CU",label:"Custom reminder",desc:"",enabled:false,time:"09:00",customText:"",isCustom:true},
];

const GLYPH_CODEPOINTS = {
  HOME:0x1F3E0,CAL:0x1F4C5,HIST:0x1F4D6,CARE:0x1F486,PART:0x1F49E,ANLY:0x1F4CA,
  SET:0x2699,BELL:0x1F514,PD:0x1FA78,OV:0x1F33C,RX:0x1F48A,WA:0x1F4A7,MO:0x1F4AC,CU:0x2728,
  CR:0x1F321,HD:0x1F9E0,BL:0x1F4AD,FT:0x1F634,MS:0x1F300,AC:0x2728,BT:0x1F493,NA:0x1F922,BP:0x1F4AA,CV:0x1F36B,IN:0x1F319,AX:0x1F343,
  HA:0x1F60A,CA:0x1F60C,EN:0x26A1,SA:0x1F614,AN:0x1F630,IR:0x1F624,TI:0x1F971,SE:0x1F97A,
  FR:0x1F332,RN:0x1F327,OC:0x1F30A,NT:0x1F319,FI:0x1F525,WD:0x1F3D4,
  FE:0x1F96C,MV:0x1F9D8,HT:0x1F525,JR:0x1F4D3,PR:0x1F95A,WK:0x1F45F,PL:0x1F4CB,GL:0x2728,OX:0x1FAD0,PW:0x1F4AA,SP:0x1F5E3,CN:0x1F91D,MG:0x1F331,EZ:0x1F9D8,HY:0x1F4A7,SC:0x1F6C1,TR:0x1F4DD,PT:0x1F4CA,WO:0x1F3CB,FD:0x1F957,YO:0x1F9D8,BR:0x1FAC1,HP:0x1F9D8,
  CAT:0x1F431,FOX:0x1F98A,DOG:0x1F436,BIRD:0x1F99C,SEA:0x1F9DC,FAE:0x1F9DA,
  heat:0x1F525,tea:0x2615,sweet:0x1F36B,heart:0x1F497,rest:0x1F6CC,massage:0x1F486,walk:0x1F45F,mood:0x1F300,moon:0x1F319,low:0x1F634,pain:0x1F321,calm:0x1F343
};
function glyph(token){ const code=GLYPH_CODEPOINTS[token]; return code ? String.fromCodePoint(code) : (token||""); }
function IconGlyph({name,size=20,color="currentColor",strokeWidth=2.4}) {
  const icons = {SET:Settings,BELL:Bell,HOME:Home,CAL:CalendarDays,HIST:BookOpen,CARE:Heart,PART:HeartHandshake,ANLY:BarChart3,PD:Droplets,MO:MessageCircle,OV:Activity,RX:Activity,WA:Droplets,CU:Activity,WRENCH:Wrench};
  const Icon = icons[name];
  return Icon ? <Icon size={size} color={color} strokeWidth={strokeWidth}/> : <span>{glyph(name)}</span>;
}
function latestPeriodStart(logs=[]) {
  const dates = logs
    .map(l => l?.startDate)
    .filter(Boolean)
    .map(d => new Date(`${d}T00:00:00`))
    .filter(d => !isNaN(d) && d <= new Date())
    .sort((a,b) => b - a);
  return dates[0] || null;
}


const DEFAULT_APP_SETTINGS = {
  darkMode:false,
  notifications:true,
  reminders:true,
  animations:true,
  sound:true,
  theme:"cat",
  pet:"cat",
};

const THEME_OPTIONS = [
  {id:"cat",label:"Cat Theme",mascot:"Cute Cat"},
  {id:"fox",label:"Fox Theme",mascot:"Cute Fox"},
  {id:"dog",label:"Dog Theme",mascot:"Puppy"},
  {id:"parrot",label:"Parrot Theme",mascot:"Parrot"},
  {id:"mermaid",label:"Mermaid Theme",mascot:"Mermaid"},
  {id:"fairy",label:"Fairy Theme",mascot:"Fairy"},
];

const THEME_CONFIG = {
  cat:{name:"Cat",icon:"CAT",accent:"#d86f6f",accent2:"#7fb069",soft:"#fff7ed",light:"#dcfce7",bg:"linear-gradient(160deg,#fff9ed 0%,#effaf0 44%,#eaf6ff 100%)",darkBg:"linear-gradient(160deg,#181818 0%,#202018 52%,#1b1d22 100%)",ambient:"forest",sticker:"https://i.ibb.co/GvKfpB4J/7fdd7118-890f-416c-b19c-8d64dbf96968.png",mascot:{body:"#5a5a6a",body2:"#4a4a5a",accent:"#f9a8d4",detail:"#f59e0b"}},
  fox:{name:"Fox",icon:"FOX",accent:"#c96b34",accent2:"#d6a03f",soft:"#fff7ed",light:"#fed7aa",bg:"linear-gradient(160deg,#fff7ed 0%,#fff0d7 46%,#edf7df 100%)",darkBg:"linear-gradient(160deg,#1b1815 0%,#211b16 52%,#181818 100%)",ambient:"autumn",sticker:"https://i.ibb.co/21SSdk2v/56ed3091-e494-4961-bc89-4d7554ed2390.png",mascot:{body:"#f97316",body2:"#c2410c",accent:"#fff7ed",detail:"#111827"}},
  dog:{name:"Dog",icon:"DOG",accent:"#b07a45",accent2:"#74a96f",soft:"#fff8e7",light:"#ddf7d8",bg:"linear-gradient(160deg,#fff9e8 0%,#eaf8dc 48%,#e7f5ff 100%)",darkBg:"linear-gradient(160deg,#181818 0%,#211f1a 52%,#1a1f22 100%)",ambient:"meadow",sticker:"https://i.ibb.co/PGxrHBh8/200a4be7-da1a-4246-82a4-2291aaca69ce.png",mascot:{body:"#b45309",body2:"#78350f",accent:"#fde68a",detail:"#fef3c7"}},
  parrot:{name:"Parrot",icon:"BIRD",accent:"#2E8B57",accent2:"#42A5F5",soft:"#ecfdf5",light:"#d9f99d",bg:"linear-gradient(160deg,#f0fff4 0%,#dcfce7 34%,#dff8ff 68%,#fff8d6 100%)",darkBg:"linear-gradient(160deg,#181818 0%,#17211b 48%,#182225 100%)",ambient:"tropical",sticker:"https://i.ibb.co/84QsWXGt/20b1e6c0-02d2-4746-ba3d-8375483e32f1.png",mascot:{body:"#2E8B57",body2:"#42A5F5",accent:"#FFD54F",detail:"#E53935"}},
  mermaid:{name:"Mermaid",icon:"SEA",accent:"#1398a8",accent2:"#8b7adf",soft:"#ecfeff",light:"#b9f4f1",bg:"linear-gradient(160deg,#eaffff 0%,#d8f5f5 44%,#eee8ff 100%)",darkBg:"linear-gradient(160deg,#181818 0%,#172225 48%,#1e1b28 100%)",ambient:"ocean",sticker:"https://i.ibb.co/NdRFh0v9/Chat-GPT-Image-Jun-29-2026-04-57-19-PM.png",mascot:{body:"#38bdf8",body2:"#7c3aed",accent:"#f0abfc",detail:"#06b6d4"}},
  fairy:{name:"Fairy",icon:"FAE",accent:"#b978d9",accent2:"#75b987",soft:"#fff5fb",light:"#eadcff",bg:"linear-gradient(160deg,#fff6fb 0%,#f2eaff 44%,#ebfaed 100%)",darkBg:"linear-gradient(160deg,#181818 0%,#211b27 50%,#1b221d 100%)",ambient:"fairy",sticker:"https://static.wikia.nocookie.net/charactercommunity/images/a/af/Rosetta.png/revision/latest?cb=20201219040733",mascot:{body:"#a855f7",body2:"#22c55e",accent:"#f9a8d4",detail:"#fef08a"}},
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
    Bollywood:["Yeh Jawaani Hai Deewani","Dil Dhadakne Do","Jab We Met","Khoobsurat","Queen","Zindagi Na Milegi Dobara"],
  },
  music:["Acoustic calm","Lo-fi rain","Soft piano","Aromatherapy spa mix","Cozy cafe jazz"],
  bollywoodMusic:["Kabira","Iktara","Ilahi","Raabta","Shaam","Agar Tum Saath Ho","Love You Zindagi","Phir Se Ud Chala"],
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

//  Storage 
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

//  Helpers 
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

//  Cat Mascot 
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

//  UI Primitives 
function ThemedMascot({theme="cat",size=120,animated=true}) {
  const cfg = THEME_CONFIG[theme] || THEME_CONFIG.cat;
  const mascotSize = size * (theme === "fairy" ? 3 : 2);
  if (cfg.sticker) {
    return (
      <div className={animated ? "sticker-mascot mascot-animated" : "sticker-mascot"} style={{width:mascotSize,height:mascotSize*1.08,display:"flex",alignItems:"center",justifyContent:"center"}} aria-label={`${cfg.name} companion`}>
        <img src={cfg.sticker} alt={`${cfg.name} companion`} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain",display:"block",filter:"drop-shadow(0 18px 18px rgba(15,23,42,0.18))"}} loading="lazy" referrerPolicy="no-referrer"/>
      </div>
    );
  }
  const m = cfg.mascot;
  const isFox = theme === "fox";
  const isDog = theme === "dog";
  const isParrot = theme === "parrot";
  const isMermaid = theme === "mermaid";
  const isFairy = theme === "fairy";
  return (
    <svg className={animated ? "mascot-animated" : ""} width={mascotSize} height={mascotSize*1.08} viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label={`${cfg.name} mascot`}>
      <ellipse cx="60" cy="121" rx="28" ry="6" fill="rgba(15,23,42,0.12)"/>
      {isFairy&&<><ellipse className="mascot-wing-left" cx="34" cy="58" rx="18" ry="28" fill={m.accent} opacity="0.35"/><ellipse className="mascot-wing-right" cx="86" cy="58" rx="18" ry="28" fill={m.accent} opacity="0.35"/></>}
      {isParrot&&<><path className="mascot-wing-left" d="M36 64 Q15 70 20 94 Q38 88 49 75" fill={m.body2} opacity="0.9"/><path className="mascot-wing-right" d="M84 64 Q105 70 100 94 Q82 88 71 75" fill={m.body2} opacity="0.75"/></>}
      {isMermaid ? <path className="mascot-tail" d="M47 88 Q34 108 28 122 Q48 116 60 101 Q72 116 92 122 Q86 108 73 88 Z" fill={m.body2}/> : <ellipse className="mascot-breathe" cx="60" cy="91" rx="31" ry="27" fill={m.body2}/>}
      {!isParrot&&!isMermaid&&<path className="mascot-tail" d={isDog?"M88 92 Q110 82 99 68":"M87 94 Q112 86 103 66"} stroke={m.body2} strokeWidth={isFox?12:8} strokeLinecap="round" fill="none"/>}
      <ellipse className="mascot-breathe" cx="60" cy="59" rx="31" ry="28" fill={m.body}/>
      {!isParrot&&!isMermaid&&!isFairy&&<><polygon points="35,38 28,16 50,31" fill={m.body}/><polygon points="85,38 92,16 70,31" fill={m.body}/><polygon points="38,35 32,22 47,32" fill={m.accent}/><polygon points="82,35 88,22 73,32" fill={m.accent}/></>}
      {isDog&&<><ellipse cx="36" cy="44" rx="9" ry="21" fill={m.body2} transform="rotate(20 36 44)"/><ellipse cx="84" cy="44" rx="9" ry="21" fill={m.body2} transform="rotate(-20 84 44)"/></>}
      {isParrot&&<><path d="M48 31 Q60 8 72 31" fill={m.accent}/><path d="M72 61 Q91 58 78 72" fill={m.detail}/></>}
      {isMermaid&&<><path d="M34 36 Q60 10 86 36 Q75 28 60 30 Q45 28 34 36" fill={m.accent}/><path d="M43 84 Q60 98 77 84" stroke={m.accent} strokeWidth="5" strokeLinecap="round"/></>}
      {isFairy&&<path d="M46 31 Q60 14 74 31 Q60 25 46 31" fill={m.detail}/>}
      <ellipse cx="60" cy="64" rx="21" ry="18" fill={isParrot?m.accent:"#fff"} opacity="0.9"/>
      <circle className="mascot-eye" cx="51" cy="56" r="7" fill="#fff"/><circle className="mascot-eye" cx="69" cy="56" r="7" fill="#fff"/>
      <circle cx="51" cy="56" r="4" fill="#111827"/><circle cx="69" cy="56" r="4" fill="#111827"/>
      <circle cx="52.5" cy="54.5" r="1.5" fill="#fff"/><circle cx="70.5" cy="54.5" r="1.5" fill="#fff"/>
      <ellipse cx="60" cy="66" rx={isParrot?7:3.4} ry={isParrot?5:2.4} fill={isParrot?m.detail:m.accent}/>
      <path d="M55 72 Q60 76 65 72" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
      {!isParrot&&!isMermaid&&<><line x1="38" y1="64" x2="53" y2="66" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round"/><line x1="67" y1="66" x2="82" y2="64" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round"/></>}
      <rect x="42" y="82" width="36" height="11" rx="6" fill={m.accent} opacity="0.9"/>
      <circle cx="60" cy="87.5" r="3" fill={m.detail}/>
    </svg>
  );
}

function ThemeEnvironment({themeKey="cat"}) {
  const cfg=THEME_CONFIG[themeKey]||THEME_CONFIG.cat;
  const worldItems={
    cat:["sunray","tree","grass","flower","butterfly","bird","leaf","pollen","cloud","mouse"],
    fox:["sunray","autumn-tree","leaf","leaf","mushroom","log","mist","bird","dust","branch"],
    dog:["sunray","meadow","fence","cloud","flower","butterfly","bird","bee","seed","grass"],
    parrot:["sunray","palm","banana-leaf","vine","branch","orchid","hibiscus","butterfly","bird","distant-parrot","feather","firefly","pollen","waterfall","fern","mango"],
    mermaid:["ray","bubble","bubble","coral","seaweed","pearl","shell","jelly","fish","school"],
    fairy:["rainbow","cloud","pixie","spark","petal","butterfly","firefly","mushroom","crystal","fog"],
  }[themeKey]||["spark","petal","glow"];
  return (
    <div className={`theme-world theme-world-${themeKey}`} aria-hidden="true">
      <div className="world-gradient"/>
      <div className="world-horizon"/>
      <div className="ambient-orb ambient-orb-a" style={{background:cfg.accent}}/>
      <div className="ambient-orb ambient-orb-b" style={{background:cfg.accent2}}/>
      {worldItems.map((item,i)=><span key={`${item}-${i}`} className={`world-item world-item-${i} world-${item}`}/>)}
    </div>
  );
}

function Modal({onClose,children,title,wide,extraWide}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:24,padding:28,width:"100%",maxWidth:extraWide?700:wide?560:440,boxShadow:"0 24px 64px rgba(0,0,0,0.18)",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <h2 style={{fontSize:18,fontWeight:800,color:"#1e293b",margin:0}}>{title}</h2>
          <button onClick={onClose} aria-label="Close" style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8",lineHeight:1,padding:"0 4px"}}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function PrimaryBtn({onClick,children,color,style={}}){
  return(
    <button onClick={onClick} style={{padding:"13px 24px",borderRadius:99,border:"none",cursor:"pointer",background:color||"linear-gradient(135deg,var(--theme-accent,#e11d48),var(--theme-accent-2,#db2777))",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"inherit",transition:"opacity 0.15s",...style}}
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
    <div onClick={()=>onChange(!checked)} style={{width:44,height:24,borderRadius:99,cursor:"pointer",background:checked?"var(--theme-accent,#e11d48)":"#e2e8f0",position:"relative",transition:"background 0.2s",flexShrink:0}}>
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
      <text x={cx} y={cy+6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">{day||""}</text>
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
      <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:2}}>Today  Cycle Day {dayOfCycle}</div>
      <div style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>{PHASES[cycleData.phase]?.fertility||"LOW"}  Chance of getting pregnant</div>
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

//  In-App Notification Toast 
function NotificationToast({notifications, onDismiss}) {
  if (!notifications.length) return null;
  return (
    <div style={{position:"fixed",top:70,right:16,zIndex:300,display:"flex",flexDirection:"column",gap:8,maxWidth:340}}>
      {notifications.map(n=>(
        <div key={n.id} style={{background:"#fff",borderRadius:16,padding:"14px 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",border:`2px solid ${n.color||"#e11d48"}20`,display:"flex",alignItems:"flex-start",gap:12,animation:"slideIn 0.3s ease"}}>
          <span style={{fontSize:22,flexShrink:0}}>{glyph(n.icon)}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{n.title}</div>
            <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{n.body}</div>
          </div>
          <button onClick={()=>onDismiss(n.id)} aria-label="Dismiss reminder" style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:16,padding:"0 2px",lineHeight:1,flexShrink:0}}>x</button>
        </div>
      ))}
    </div>
  );
}

//  MODALS 
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
    <Modal onClose={onClose} title={editEntry?"Edit period":"Log period"}>
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
        <div><label style={{fontSize:12,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:6}}>Notes</label><textarea style={{...inp,minHeight:70,resize:"vertical"}} placeholder="Any notes" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <PrimaryBtn onClick={submit} style={{width:"100%"}}>{editEntry?"Update period":"Save period"}</PrimaryBtn>
        {editEntry&&onDelete&&<DangerBtn onClick={()=>{onDelete(editEntry.id);onClose();}} style={{width:"100%"}}> Delete this log</DangerBtn>}
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
    <Modal onClose={onClose} title={isEdit?"Edit log":"How are you feeling?"} wide>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div style={{fontSize:12,fontWeight:600,color:"#94a3b8"}}>{key}</div>
        <div><p style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,marginTop:0}}>Mood</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {MOODS.map(m=><button key={m.id} onClick={()=>setMood(mood===m.id?"":m.id)} style={{padding:"7px 12px",borderRadius:99,border:`1.5px solid ${mood===m.id?"#e11d48":"#e2e8f0"}`,background:mood===m.id?"#fff1f2":"#fff",color:mood===m.id?"#e11d48":"#475569",fontSize:13,fontWeight:mood===m.id?700:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><span>{glyph(m.emoji)}</span>{m.label}</button>)}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div><p style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,marginTop:0}}>Energy {energy}/5</p>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span>Low</span><input type="range" min={1} max={5} value={energy} onChange={e=>setEnergy(Number(e.target.value))} style={{flex:1}}/><span>High</span></div>
          </div>
          <div><p style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,marginTop:0}}>Pain {pain}/10</p>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span>0</span><input type="range" min={0} max={10} value={pain} onChange={e=>setPain(Number(e.target.value))} style={{flex:1}}/><span>10</span></div>
          </div>
        </div>
        <div><p style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,marginTop:0}}>Symptoms</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {SYMPTOMS.map(s=><button key={s.id} onClick={()=>toggle(s.id)} style={{padding:"7px 12px",borderRadius:99,border:`1.5px solid ${selected.has(s.id)?"#e11d48":"#e2e8f0"}`,background:selected.has(s.id)?"#fff1f2":"#fff",color:selected.has(s.id)?"#e11d48":"#475569",fontSize:13,fontWeight:selected.has(s.id)?700:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><span>{glyph(s.emoji)}</span>{s.label}</button>)}
          </div>
        </div>
        <div><p style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6,marginTop:0}}>Notes</p><textarea style={inp} placeholder="Anything else today" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <PrimaryBtn onClick={submit} style={{width:"100%"}}>{isEdit?"Update log":"Save log"}</PrimaryBtn>
        {isEdit&&<DangerBtn onClick={handleDelete} style={{width:"100%"}}> Delete this log</DangerBtn>}
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
    <Modal onClose={onClose} title={`${glyph(routine.emoji)} ${routine.title}`}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff1f2",borderRadius:12,padding:"10px 16px"}}><span style={{fontSize:20}}>{glyph(routine.emoji)}</span><span style={{fontSize:14,fontWeight:600,color:"#e11d48"}}>{routine.duration} - {routine.desc}</span></div>
        {!done?(
          <>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {routine.steps.map((s,i)=>(
                <div key={i} onClick={()=>setStep(i)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,background:i===step?"#fff1f2":i<step?"#f0fdf4":"#f8fafc",border:`1.5px solid ${i===step?"#e11d48":i<step?"#86efac":"#f1f5f9"}`,cursor:"pointer"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,background:i<step?"#22c55e":i===step?"#e11d48":"#e2e8f0",color:i<=step?"#fff":"#94a3b8"}}>{i<step?"":i+1}</div>
                  <span style={{fontSize:14,color:i===step?"#e11d48":i<step?"#15803d":"#475569",fontWeight:i===step?700:500}}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:12,borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",color:"#475569"}}>Back</button>}
              <PrimaryBtn onClick={()=>step<routine.steps.length-1?setStep(s=>s+1):setDone(true)} style={{flex:1}}>{step<routine.steps.length-1?"Next step ":"Complete "}</PrimaryBtn>
            </div>
          </>
        ):(
          <div style={{textAlign:"center",padding:"20px 0"}}><div style={{fontSize:48,marginBottom:12}}>{glyph("GL")}</div><p style={{fontSize:18,fontWeight:800,color:"#1e293b"}}>Routine complete!</p><PrimaryBtn onClick={onClose} style={{width:"100%"}}>Done</PrimaryBtn></div>
        )}
      </div>
    </Modal>
  );
}

function SoundscapePlayer({sound,onClose}){
  const [playing,setPlaying]=useState(false);
  const [vol,setVol]=useState(0.5);
  const [elapsed,setElapsed]=useState(0);
  const [audioError,setAudioError]=useState("");
  const intRef=useRef(null);
  const audioRef=useRef(null);
  const ctxRef=useRef(null);
  const nodesRef=useRef([]);
  const gainRef=useRef(null);
  function buildAudio(){if(!ctxRef.current)ctxRef.current=new(window.AudioContext||window.webkitAudioContext)();const ctx=ctxRef.current;const gain=ctx.createGain();gain.gain.value=vol;gain.connect(ctx.destination);gainRef.current=gain;[sound.freq,sound.freq*1.5,sound.freq*2.1,sound.freq*0.5].forEach(f=>{const osc=ctx.createOscillator();const g=ctx.createGain();osc.type="sine";osc.frequency.value=f;g.gain.value=0.06;osc.connect(g);g.connect(gain);osc.start();nodesRef.current.push(osc,g);});nodesRef.current.push(gain);}
  function stopAudio(){nodesRef.current.forEach(n=>{try{n.stop?.();n.disconnect?.();}catch{}});nodesRef.current=[];}
  async function togglePlay(){
    if(!playing){
      setAudioError("");
      if(sound.file&&audioRef.current){
        try{audioRef.current.volume=vol;audioRef.current.loop=true;await audioRef.current.play();setPlaying(true);return;}
        catch{setAudioError("Audio file not found. Put the MP3 in public/sounds with the same filename.");}
      }
      buildAudio();setPlaying(true);
    }else{
      audioRef.current?.pause();stopAudio();setPlaying(false);
    }
  }
  function stopAll(){audioRef.current?.pause();if(audioRef.current)audioRef.current.currentTime=0;stopAudio();}
  useEffect(()=>{if(audioRef.current)audioRef.current.volume=vol;if(gainRef.current)gainRef.current.gain.value=vol;},[vol]);
  useEffect(()=>{if(playing)intRef.current=setInterval(()=>setElapsed(e=>e+1),1000);else clearInterval(intRef.current);return()=>clearInterval(intRef.current);},[playing]);
  useEffect(()=>()=>{stopAll();clearInterval(intRef.current);},[]);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  return(
    <Modal onClose={()=>{stopAll();onClose();}} title={`${glyph(sound.emoji)} ${sound.name}`}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24,padding:"8px 0"}}>
        {sound.file&&<audio ref={audioRef} src={sound.file} preload="auto"/>}
        <div style={{width:100,height:100,borderRadius:"50%",background:sound.bg,fontSize:48,display:"flex",alignItems:"center",justifyContent:"center",border:playing?`3px solid ${sound.color}`:"3px solid transparent"}}>{glyph(sound.emoji)}</div>
        <div style={{textAlign:"center"}}><div style={{fontSize:32,fontWeight:800,color:"#1e293b"}}>{fmt(elapsed)}</div><div style={{fontSize:13,color:"#94a3b8"}}>{playing?"Playing":"Paused"}</div></div>
        <div style={{display:"flex",gap:16}}>
          <button onClick={togglePlay} style={{width:70,height:60,borderRadius:999,border:"none",cursor:"pointer",background:sound.color,color:"#fff",fontSize:14,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{playing?"Pause":"Play"}</button>
          <button onClick={()=>{stopAll();setElapsed(0);setPlaying(false);}} style={{width:74,height:60,borderRadius:999,border:"1.5px solid #e2e8f0",cursor:"pointer",background:"#fff",color:"#64748b",fontSize:14,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>Reset</button>
        </div>
        {audioError&&<div style={{fontSize:12,color:"#b45309",background:"#fffbeb",borderRadius:10,padding:"9px 12px",width:"100%",boxSizing:"border-box"}}>{audioError}</div>}
        <div style={{width:"100%"}}><div style={{fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:6}}>Volume</div><input type="range" min={0} max={1} step={0.05} value={vol} onChange={e=>setVol(Number(e.target.value))} style={{width:"100%"}}/></div>
      </div>
    </Modal>
  );
}

//  REMINDERS PANEL 
function RemindersPanel({onClose,reminders,onSave,cycleData}){
  const [local,setLocal]=useState(reminders.map(r=>({...r})));
  const [notifPerm,setNotifPerm]=useState(typeof Notification!=="undefined"?Notification.permission:"unsupported");
  const [added,setAdded]=useState(false);
  const [permissionMsg,setPermissionMsg]=useState("");

  async function requestPermission(){
    if(typeof Notification==="undefined"){
      setNotifPerm("unsupported");
      setPermissionMsg("Browser notifications are not supported here. In-app reminder cards will still work.");
      return;
    }
    try{
      const perm=await Notification.requestPermission();
      setNotifPerm(perm);
      if(perm==="granted"){
        setPermissionMsg("Notifications enabled. Reminder settings will be saved below.");
        triggerTestNotification(perm);
      }else{
        setPermissionMsg("Notifications were blocked. In-app reminder cards will still work.");
      }
    }catch{
      setPermissionMsg("This browser blocked the permission request. In-app reminder cards will still work.");
    }
  }

  function triggerTestNotification(permission=notifPerm){
    if(permission==="granted"){
      new Notification("GlowHer",{body:"Notifications enabled! You'll receive cycle reminders here."});
    }
  }

  function update(id, changes){
    setLocal(prev=>prev.map(r=>r.id===id?{...r,...changes}:r));
  }

  function addCustom(){
    const newId="custom"+(Date.now());
    setLocal(prev=>[...prev,{id:newId,icon:"CU",label:"Custom reminder",desc:"",enabled:true,time:"09:00",customText:"",isCustom:true}]);
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
    <Modal onClose={onClose} title="Reminders" wide>
      <div style={{display:"flex",flexDirection:"column",gap:0}}>

        {/* Notification permission banner */}
        {notifPerm!=="granted"&&notifPerm!=="unsupported"&&(
          <div style={{background:"#fef3c7",borderRadius:14,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:22}}>{glyph("BELL")}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:"#92400e"}}>Enable browser notifications</div>
              <div style={{fontSize:12,color:"#a16207"}}>Get alerts even when the app is in the background</div>
            </div>
            <button onClick={requestPermission} style={{background:"#f59e0b",border:"none",borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:12,fontWeight:700,color:"#fff",fontFamily:"inherit",whiteSpace:"nowrap"}}>Enable</button>
          </div>
        )}
        {notifPerm==="granted"&&(
          <div style={{background:"#f0fdf4",borderRadius:14,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>{glyph("GL")}</span>
            <span style={{fontSize:13,color:"#15803d",fontWeight:600}}>Browser notifications active</span>
          </div>
        )}
        {permissionMsg&&(
          <div style={{background:notifPerm==="granted"?"#f0fdf4":"#fff7ed",borderRadius:12,padding:"10px 12px",marginBottom:16,fontSize:12,color:notifPerm==="granted"?"#15803d":"#9a3412",fontWeight:700}}>
            {permissionMsg}
          </div>
        )}

        {/* Active cycle alerts */}
        {cycleData&&getActiveAlerts().map(a=>(
          <div key={a.id} style={{background:`${a.color}10`,border:`1.5px solid ${a.color}30`,borderRadius:14,padding:"12px 16px",marginBottom:12,display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:22}}>{glyph(a.icon)}</span>
            <div><div style={{fontSize:13,fontWeight:700,color:a.color}}>{a.title}</div><div style={{fontSize:12,color:"#64748b"}}>{a.body}</div></div>
          </div>
        ))}

        {/* Reminder rows */}
        {local.map((r,i)=>(
          <div key={r.id} style={{padding:"16px 0",borderBottom:"1px solid #f1f5f9"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:r.enabled?10:0}}>
              <span style={{fontSize:22,flexShrink:0}}>{glyph(r.icon)}</span>
              <div style={{flex:1}}>
                {r.isCustom?(
                  <input value={r.label} onChange={e=>update(r.id,{label:e.target.value})} style={{...inp,padding:"5px 8px",fontWeight:700,fontSize:14}} placeholder="Reminder name"/>
                ):(
                  <div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{r.label}</div>
                )}
                {!r.isCustom&&<div style={{fontSize:12,color:"#94a3b8"}}>{r.desc}</div>}
              </div>
              <Toggle checked={r.enabled} onChange={v=>update(r.id,{enabled:v})}/>
              {r.isCustom&&<button onClick={()=>removeCustom(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#fca5a5",fontSize:13,fontWeight:900,padding:"0 4px"}}>Remove</button>}
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
                  <input value={r.customText||""} onChange={e=>update(r.id,{customText:e.target.value})} style={inp} placeholder="Reminder message"/>
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

//  HISTORY TAB 
function HistoryTab({symptomLogs,periodLogs,onEditSymptoms,onEditPeriod,onLogSymptoms,cycleData,themeKey="cat"}){
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
          <h2 style={{fontSize:18,fontWeight:900,color:"#1e293b",margin:0}}> History</h2>
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
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"#94a3b8"}}>{glyph("TR")}</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search symptoms, mood, notes" style={{...inp,width:"100%",paddingLeft:38,boxSizing:"border-box"}}/>
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
            {sortOrder==="desc"?" Newest first":" Oldest first"}
          </button>
        </div>
      </div>

      {/* Summary stats */}
      {viewMode==="symptoms"&&symptomEntries.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[
            {label:"Total logs",value:symptomEntries.length,icon:"HIST",color:"#7c3aed",bg:"#f5f3ff"},
            {label:"This month",value:symptomEntries.filter(e=>e.dateKey.startsWith(format(new Date(),"yyyy-MM"))).length,icon:"CAL",color:"#e11d48",bg:"#fff1f2"},
            {label:"Avg pain",value:(symptomEntries.filter(e=>e.pain>0).reduce((a,e)=>a+(e.pain||0),0)/Math.max(1,symptomEntries.filter(e=>e.pain>0).length)).toFixed(1),icon:"CR",color:"#0f766e",bg:"#f0fdfa"},
          ].map(s=>(
            <div key={s.label} style={{background:s.bg,borderRadius:16,padding:"14px 12px",textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:4}}>{glyph(s.icon)}</div>
              <div style={{fontSize:20,fontWeight:900,color:s.color}}>{s.value}</div>
              <div style={{fontSize:11,color:"#64748b"}}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Entries */}
      {filtered.length===0?(
        <div style={{background:"#fff",borderRadius:20,padding:"40px 20px",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <ThemedMascot theme={themeKey} size={78}/>
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
          {mood?glyph(mood.emoji):""}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <span style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{format(dateObj,"MMM d, yyyy")}</span>
            {entry.loggedAt&&<span style={{fontSize:12,fontWeight:700,color:"#94a3b8"}}>{formatTime(entry.loggedAt)}</span>}
            {phaseInfo&&<span style={{fontSize:11,fontWeight:600,color:phaseInfo.color,background:phaseInfo.light,borderRadius:99,padding:"2px 8px"}}>{phase}</span>}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {mood&&<span style={{fontSize:12,color:"#64748b"}}>{glyph(mood.emoji)} {mood.label}</span>}
            {entry.pain>0&&<span style={{fontSize:12,color:"#e11d48"}}> Pain {entry.pain}/10</span>}
            {entry.energy&&<span style={{fontSize:12,color:"#64748b"}}> Energy {entry.energy}/5</span>}
            {syms.length>0&&<span style={{fontSize:12,color:"#94a3b8"}}> {syms.map(s=>glyph(s.emoji)).join(" ")}</span>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={e=>{e.stopPropagation();onEdit();}} style={{background:"#f5f3ff",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:12,fontWeight:700,color:"#7c3aed",fontFamily:"inherit"}}>Edit</button>
          <span style={{color:"#94a3b8",fontSize:16}}>{open?"-":"+"}</span>
        </div>
      </div>
      {open&&(
        <div style={{padding:"0 18px 16px",borderTop:"1px solid #f8fafc"}}>
          {syms.length>0&&(
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Symptoms</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {syms.map(s=><span key={s.id} style={{background:"#fff1f2",color:"#e11d48",borderRadius:99,padding:"4px 10px",fontSize:12,fontWeight:600}}>{glyph(s.emoji)} {s.label}</span>)}
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
        <div style={{width:42,height:42,borderRadius:12,background:"#fff1f2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{glyph("PD")}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:"#1e293b",marginBottom:3}}>
            {format(new Date(log.startDate+"T12:00:00"),"MMM d")}{log.endDate?`  ${format(new Date(log.endDate+"T12:00:00"),"MMM d")}`:""}{dur?` (${dur} days)`:""}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:flowColor,flexShrink:0,display:"inline-block"}}/>
            <span style={{fontSize:12,color:"#64748b",textTransform:"capitalize"}}>{log.flow} flow</span>
            {log.notes&&<span style={{fontSize:12,color:"#94a3b8"}}> Has note</span>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={e=>{e.stopPropagation();onEdit();}} style={{background:"#fff1f2",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:12,fontWeight:700,color:"#e11d48",fontFamily:"inherit"}}>Edit</button>
          <span style={{color:"#94a3b8",fontSize:16}}>{open?"-":"+"}</span>
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

//  CALENDAR TAB 
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
          <button onClick={prev} aria-label="Previous month" style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#475569",padding:"4px 10px",borderRadius:8}}>&lt;</button>
          <span style={{fontWeight:800,fontSize:17,color:"#1e293b"}}>{format(new Date(viewYear,viewMonth,1),"MMMM yyyy")}</span>
          <button onClick={next} aria-label="Next month" style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#475569",padding:"4px 10px",borderRadius:8}}>&gt;</button>
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
              {(selPeriodLog||selLog)&&<button onClick={()=>{if(selPeriodLog)onEditPeriod(selPeriodLog);else if(selLog)onEditSymptoms(selKey);}} style={{background:"linear-gradient(135deg,#fce7f3,#ede9fe)",border:"none",borderRadius:99,padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:700,color:"#7c3aed",fontFamily:"inherit"}}> Edit</button>}
              {!selLog&&<button onClick={()=>onEditSymptoms(selKey)} style={{background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:99,padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:700,color:"#64748b",fontFamily:"inherit"}}>+ Add log</button>}
            </div>
          </div>
          {selPhase&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{width:8,height:8,borderRadius:"50%",background:selP?.color||"#94a3b8"}}/><span style={{fontSize:13,color:"#64748b"}}>{PHASES[selPhase]?.fertility}  Chance of getting pregnant</span></div>}
          {periodDays.has(selKey)&&<div style={{background:"#fff1f2",borderRadius:12,padding:"10px 14px",marginBottom:8}}><span style={{fontSize:13,fontWeight:700,color:"#e11d48"}}>{glyph("PD")} Period day (predicted)</span></div>}
          {ovulationDays.has(selKey)&&<div style={{background:"#fffbeb",borderRadius:12,padding:"10px 14px",marginBottom:8}}><span style={{fontSize:13,fontWeight:700,color:"#d97706"}}>{glyph("OV")} Ovulation day</span></div>}
          {selPeriodLog&&<div style={{background:"#fdf2f8",borderRadius:12,padding:"10px 14px",marginBottom:8}}><span style={{fontSize:13,fontWeight:700,color:"#db2777"}}>Logged: {selPeriodLog.flow} flow{selPeriodLog.notes?`  ${selPeriodLog.notes}`:""}</span></div>}
          {selLog&&(
            <div style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px"}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:selLog.notes?8:0}}>
                {selLog.mood&&<span style={{background:"#f5f3ff",color:"#7c3aed",borderRadius:99,padding:"4px 10px",fontSize:12,fontWeight:600}}>{glyph(MOODS.find(m=>m.id===selLog.mood)?.emoji)} {selLog.mood}</span>}
                {selLog.energy&&<span style={{background:"#fef3c7",color:"#92400e",borderRadius:99,padding:"4px 10px",fontSize:12,fontWeight:600}}> {selLog.energy}/5</span>}
                {selLog.pain>0&&<span style={{background:"#fff1f2",color:"#e11d48",borderRadius:99,padding:"4px 10px",fontSize:12,fontWeight:600}}> Pain {selLog.pain}/10</span>}
                {(selLog.symptoms||[]).map(s=>{const sym=SYMPTOMS.find(x=>x.id===s);return sym?<span key={s} style={{background:"#fff1f2",color:"#e11d48",borderRadius:99,padding:"4px 10px",fontSize:12,fontWeight:600}}>{glyph(sym.emoji)} {sym.label}</span>:null;})}
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
      <PrimaryBtn onClick={onLogPeriod} style={{width:"100%"}}> Log a period</PrimaryBtn>
    </div>
  );
}

//  TODAY TAB 
function TodayTab({cycleData,form,onOpenCycleSettings,onLogPeriod,onLogSymptoms,onEditSymptoms,symptomLogs,onPartnerMode,themeKey}){
  const todayKey=format(new Date(),"yyyy-MM-dd");
  const todayLog=symptomLogs[todayKey];
  const themeCfg=THEME_CONFIG[themeKey]||THEME_CONFIG.cat;
  if(!cycleData){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <div style={{background:themeCfg.bg,borderRadius:28,padding:"40px 28px 32px",textAlign:"center",position:"relative",overflow:"hidden",minHeight:300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 70% 30%,rgba(255,200,220,0.5),transparent 60%)"}}/>
          <div style={{position:"relative",zIndex:1}}>
            <ThemedMascot theme={themeKey} size={110}/>
            <h2 style={{fontSize:26,fontWeight:900,color:"#1e293b",margin:"16px 0 8px"}}>Track your cycle </h2>
            <p style={{color:"#64748b",fontSize:14,maxWidth:260,margin:"0 auto 24px"}}>Enter your last period date to see personalized daily insights.</p>
            <PrimaryBtn onClick={onOpenCycleSettings}>Set up cycle </PrimaryBtn>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
          {PHASES.None.tips.map((t,i)=><div key={i} style={{background:"#fdf2f8",borderRadius:16,padding:"16px"}}><div style={{fontSize:22,marginBottom:6}}>{glyph(t.icon)}</div><div style={{fontSize:13,fontWeight:700,color:"#db2777",marginBottom:4}}>{t.title}</div><div style={{fontSize:12,color:"#475569",lineHeight:1.5}}>{t.text}</div></div>)}
        </div>
      </div>
    );
  }
  const {phase,dayOfCycle,cycleLength,nextPeriodIn,nextPeriodDate}=cycleData;
  const p=PHASES[phase];
  const phaseSupport=PHASE_SUPPORT[phase]||PHASE_SUPPORT.None;
  const periodActionLabel=phase==="Menstrual"?"Is your period over?":nextPeriodIn<=0?"Period started?":"Log period";
  const moodLine=todayLog?.mood?MOODS.find(m=>m.id===todayLog.mood)?.label:"a gentle check-in";
  const motivation=phase==="Menstrual"
    ?"Rest is productive today. Keep things warm, soft, and simple."
    : phase==="Ovulation"
      ?"Your energy may be brighter today. Choose one joyful thing and enjoy it fully."
      : phase==="Luteal"
        ?"Slow down before your body has to ask twice. Comfort counts."
        :"Fresh energy is building. Start small and let momentum find you.";
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{background:"rgba(255,255,255,0.78)",borderRadius:22,padding:"18px 20px",boxShadow:"0 12px 34px rgba(15,23,42,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,overflow:"hidden"}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:12,fontWeight:900,color:themeCfg.accent,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Good to see you</div>
          <h2 style={{fontSize:24,fontWeight:950,color:"#1e293b",margin:"0 0 4px",lineHeight:1.1}}>Today needs {moodLine}</h2>
          <p style={{fontSize:14,color:"#64748b",margin:0,lineHeight:1.55}}>{motivation}</p>
        </div>
        <span style={{background:themeCfg.soft,color:themeCfg.accent,borderRadius:99,padding:"8px 12px",fontSize:12,fontWeight:900,whiteSpace:"nowrap"}}>Day {dayOfCycle}</span>
      </div>
      <div className="hero-card" style={{background:themeCfg.bg,borderRadius:30,padding:"32px 30px 28px",position:"relative",overflow:"hidden",minHeight:240,boxShadow:"0 22px 60px rgba(219,39,119,0.13)"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 75% 25%,rgba(255,180,210,0.6),transparent 60%)"}}/>
        <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:18}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:900,color:themeCfg.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{phase==="Menstrual"?"Period phase":`${phase} phase`}</div>
            <h1 style={{fontSize:44,fontWeight:950,color:"#1e293b",margin:"0 0 6px",lineHeight:0.98}}>{nextPeriodIn===0?"Expected today":nextPeriodIn===1?"1 day left":`${nextPeriodIn} days left`}</h1>
            <p style={{fontSize:15,color:"#64748b",margin:"0 0 14px",lineHeight:1.5}}>{format(nextPeriodDate,"MMM d")} ? Next period ? {PHASES[phase]?.tagline}</p>
            <div style={{background:"rgba(255,255,255,0.65)",borderRadius:16,padding:"12px 14px",marginBottom:16,maxWidth:560}}>
              <div style={{fontSize:13,fontWeight:900,color:themeCfg.accent,marginBottom:6}}>{phaseSupport.headline}</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {phaseSupport.ideas.map(x=><span key={x} style={{background:themeCfg.soft,color:themeCfg.accent,borderRadius:99,padding:"5px 9px",fontSize:12,fontWeight:800}}>{x}</span>)}
              </div>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
              <PrimaryBtn onClick={onLogPeriod} color="linear-gradient(135deg,#e11d48,#f43f5e)">{periodActionLabel}</PrimaryBtn>
              <button onClick={todayLog?()=>onEditSymptoms(todayKey):onLogSymptoms} style={{border:"none",background:"rgba(255,255,255,0.78)",color:themeCfg.accent,borderRadius:99,padding:"13px 18px",fontSize:14,fontWeight:900,fontFamily:"inherit",cursor:"pointer",boxShadow:"0 8px 20px rgba(15,23,42,0.08)"}}>{todayLog?"Edit check-in":"Log mood"}</button>
            </div>
          </div>
          <div style={{flexShrink:0,marginBottom:-8}}><ThemedMascot theme={themeKey} size={112}/></div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14}}>
        <button className="lift-card" onClick={onPartnerMode} style={{background:`linear-gradient(145deg,${themeCfg.soft},${themeCfg.light})`,border:"none",borderRadius:22,padding:"18px 16px",position:"relative",overflow:"hidden",minHeight:142,textAlign:"left",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 12px 28px rgba(124,58,237,0.08)"}}>
          <div style={{fontSize:12,fontWeight:900,color:themeCfg.accent,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Care hub</div>
          <div style={{fontSize:17,fontWeight:950,color:"#1e293b",lineHeight:1.15}}>Partner<br/>Mode</div>
          <div style={{position:"absolute",bottom:-10,right:-10,width:76,height:76,borderRadius:"50%",background:"rgba(244,114,182,0.25)"}}/>
          <div style={{position:"absolute",bottom:12,right:10,width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,0.72)",display:"flex",alignItems:"center",justifyContent:"center",color:themeCfg.accent}}><IconGlyph name="PART" size={20}/></div>
        </button>
        <div className="lift-card" style={{background:"#fff",borderRadius:22,padding:"16px",boxShadow:"0 12px 30px rgba(0,0,0,0.07)",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{fontSize:10,fontWeight:900,color:p.color,textTransform:"uppercase",letterSpacing:"0.08em"}}>Cycle day</div>
          <CycleRing day={dayOfCycle} total={cycleLength} color={p.color}/>
        </div>
        <div className="lift-card" style={{background:"linear-gradient(145deg,#fff1f2,#fdf2f8)",borderRadius:22,padding:"18px 16px",position:"relative",overflow:"hidden",minHeight:142,boxShadow:"0 12px 28px rgba(244,63,94,0.08)"}}>
          <div style={{fontSize:12,fontWeight:900,color:"#e11d48",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Next period</div>
          <div style={{fontSize:19,fontWeight:950,color:"#1e293b",lineHeight:1.15,marginBottom:4}}>{format(nextPeriodDate,"MMM d")}</div>
          <div style={{fontSize:13,color:"#94a3b8"}}>{nextPeriodIn} days away</div>
          <div style={{position:"absolute",bottom:-8,right:-8,width:64,height:64,borderRadius:"50%",background:"rgba(251,113,133,0.2)"}}/>
          <div style={{position:"absolute",bottom:10,right:10,width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,0.72)",display:"flex",alignItems:"center",justifyContent:"center",color:"#e11d48"}}><IconGlyph name="CAL" size={20}/></div>
        </div>
      </div>
      <CycleBar cycleData={cycleData}/>
      <div style={{background:"#fff",borderRadius:20,padding:"20px 22px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",gap:16}}>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:800,color:"#1e293b",marginBottom:4}}>How are you feeling today?</div>
          <div style={{fontSize:13,color:"#94a3b8",marginBottom:14}}>Tell us more about your body to get analysis</div>
          <PrimaryBtn onClick={todayLog?()=>onEditSymptoms(todayKey):onLogSymptoms} color="#5b21b6" style={{fontSize:13,padding:"10px 20px"}}>{todayLog?" Edit today's log":"Add Symptom"}</PrimaryBtn>
        </div>
        <div style={{fontSize:52,flexShrink:0}}>{todayLog?.mood?MOODS.find(m=>m.id===todayLog.mood)?.emoji||"":""}</div>
      </div>
      {todayLog&&(
        <div style={{background:"#fff",borderRadius:18,padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <p style={{fontSize:14,fontWeight:700,color:"#1e293b",margin:0}}>Today's check-in</p>
            <button onClick={()=>onEditSymptoms(todayKey)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:"#7c3aed",fontWeight:700,fontFamily:"inherit"}}> Edit</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {todayLog.mood&&<span style={{background:"#f5f3ff",color:"#7c3aed",borderRadius:99,padding:"5px 12px",fontSize:13,fontWeight:600}}>{glyph(MOODS.find(m=>m.id===todayLog.mood)?.emoji)} {todayLog.mood}</span>}
            {todayLog.energy&&<span style={{background:"#fef3c7",color:"#92400e",borderRadius:99,padding:"5px 12px",fontSize:13,fontWeight:600}}> {todayLog.energy}/5</span>}
            {todayLog.pain>0&&<span style={{background:"#fff1f2",color:"#e11d48",borderRadius:99,padding:"5px 12px",fontSize:13,fontWeight:600}}> Pain {todayLog.pain}/10</span>}
            {(todayLog.symptoms||[]).map(s=>{const sym=SYMPTOMS.find(x=>x.id===s);return sym?<span key={s} style={{background:"#fff1f2",color:"#e11d48",borderRadius:99,padding:"5px 12px",fontSize:13,fontWeight:600}}>{glyph(sym.emoji)} {sym.label}</span>:null;})}
          </div>
          {todayLog.notes&&<p style={{fontSize:13,color:"#64748b",marginTop:8,marginBottom:0}}>{todayLog.notes}</p>}
        </div>
      )}
      <div>
        <p style={{fontSize:12,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>What your body needs now</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
          {p.tips.map((t,i)=><div key={i} style={{background:p.light,borderRadius:14,padding:"14px"}}><div style={{fontSize:20,marginBottom:6}}>{glyph(t.icon)}</div><div style={{fontSize:13,fontWeight:700,color:p.color,marginBottom:4}}>{t.title}</div><div style={{fontSize:12,color:"#475569",lineHeight:1.5}}>{t.text}</div></div>)}
        </div>
      </div>
    </div>
  );
}

//  SELF CARE TAB 
function SelfCareTab(){
  const [activeRoutine,setActiveRoutine]=useState(null);
  const [activeSound,setActiveSound]=useState(null);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {activeRoutine&&<RoutineModal routine={activeRoutine} onClose={()=>setActiveRoutine(null)}/>}
      {activeSound&&<SoundscapePlayer sound={activeSound} onClose={()=>setActiveSound(null)}/>}
      <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <p style={{fontSize:14,fontWeight:800,color:"#1e293b",marginBottom:16}}> Relief routines</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {RELIEF_ROUTINES.map(r=>(
            <div key={r.title} onClick={()=>setActiveRoutine(r)} style={{display:"flex",alignItems:"center",gap:14,background:"#fafafa",borderRadius:14,padding:"14px 16px",border:"1px solid #f1f5f9",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#fff1f2"} onMouseLeave={e=>e.currentTarget.style.background="#fafafa"}>
              <div style={{fontSize:28}}>{glyph(r.emoji)}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{r.title}</div><div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{r.desc}</div></div>
              <span style={{fontSize:12,fontWeight:600,color:"#e11d48",background:"#fff1f2",padding:"4px 10px",borderRadius:99}}>{r.duration}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <p style={{fontSize:14,fontWeight:800,color:"#1e293b",marginBottom:4}}> Soundscapes</p>
        <p style={{fontSize:13,color:"#94a3b8",marginBottom:16}}>Ambient sounds to help you relax</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
          {SOUNDSCAPES.map(s=><div key={s.id} onClick={()=>setActiveSound(s)} style={{background:s.bg,borderRadius:16,padding:"18px 14px",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}><div style={{fontSize:28,marginBottom:8}}>{glyph(s.emoji)}</div><div style={{fontSize:13,fontWeight:700,color:s.color}}>{s.name}</div><div style={{fontSize:11,color:s.color,opacity:0.7,marginTop:2}}>Tap to play</div></div>)}
        </div>
      </div>
      <div style={{background:"linear-gradient(135deg,#fff1f2,#fdf2f8)",borderRadius:20,padding:24}}>
        <p style={{fontSize:14,fontWeight:800,color:"#1e293b",marginBottom:12}}> Quick reminders</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{emoji:"WA",text:"Drink 8+ glasses of water today"},{emoji:"NT",text:"Aim for 7-9 hours of sleep"},{emoji:"FD",text:"Eat a colourful, iron-rich meal"},{emoji:"WK",text:"Even a 10-minute walk helps"}].map((r,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"center",fontSize:14,color:"#475569"}}><span style={{fontSize:18}}>{glyph(r.emoji)}</span>{r.text}</div>)}
        </div>
      </div>
    </div>
  );
}

//  ANALYSIS TAB 
function SettingsModal({settings,onSave,onClose}){
  const [local,setLocal]=useState({...DEFAULT_APP_SETTINGS,...settings});
  const row=(key,label,desc)=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,padding:"14px 0",borderBottom:"1px solid #f1f5f9"}}>
      <div><div style={{fontSize:15,fontWeight:800,color:"#1e293b"}}>{label}</div><div style={{fontSize:13,color:"#94a3b8",lineHeight:1.4}}>{desc}</div></div>
      <Toggle checked={!!local[key]} onChange={v=>setLocal(s=>({...s,[key]:v}))}/>
    </div>
  );
  const inp={width:"100%",padding:"11px 13px",borderRadius:12,fontSize:15,border:"1.5px solid #e2e8f0",outline:"none",boxSizing:"border-box",color:"#1e293b",background:"#fff",fontFamily:"inherit"};
  const localTheme=THEME_CONFIG[local.theme]?local.theme:"cat";
  const localPet=THEME_CONFIG[local.pet]?local.pet:localTheme;
  return(
    <Modal onClose={onClose} title="Settings" wide>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div style={{background:"#fdf2f8",borderRadius:16,padding:"14px 16px"}}>
          <div style={{fontSize:16,fontWeight:900,color:"#be185d",marginBottom:4}}>GlowHer preferences</div>
          <div style={{fontSize:13,color:"#64748b",lineHeight:1.5}}>App settings live here. Cycle details stay in Cycle settings.</div>
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:"0 4px"}}>
          {row("darkMode","Dark Mode","Use a premium low-light interface with softer contrast.")}
          {row("notifications","Notifications","Allow browser and in-app reminder alerts.")}
          {row("reminders","Reminder toggle","Turn scheduled reminders on or off globally.")}
          {row("animations","Animations","Keep gentle motion and transitions enabled.")}
          {row("sound","Sound","Allow relaxation sounds and future alert tones.")}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div><label style={{fontSize:12,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",display:"block",marginBottom:7}}>Theme selection</label><select style={inp} value={localTheme} onChange={e=>setLocal(v=>({...v,theme:e.target.value,pet:e.target.value}))}>{THEME_OPTIONS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
          <div><label style={{fontSize:12,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",display:"block",marginBottom:7}}>Pet selection</label><select style={inp} value={localPet} onChange={e=>setLocal(v=>({...v,pet:e.target.value,theme:e.target.value}))}>{THEME_OPTIONS.map(t=><option key={t.id} value={t.id}>{t.mascot}</option>)}</select></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10}}>
          {THEME_OPTIONS.map(t=>{
            const cfg=THEME_CONFIG[t.id];
            const active=localTheme===t.id;
            return <button key={t.id} onClick={()=>setLocal(v=>({...v,theme:t.id,pet:t.id}))} style={{border:`2px solid ${active?cfg.accent:"#e2e8f0"}`,background:active?cfg.soft:"#fff",borderRadius:16,padding:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",boxShadow:active?`0 8px 24px ${cfg.accent}24`:"none"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                <span style={{fontSize:22,fontWeight:900,color:cfg.accent}}>{glyph(cfg.icon)}</span>
                <span style={{width:18,height:18,borderRadius:"50%",background:`linear-gradient(135deg,${cfg.accent},${cfg.accent2})`,display:"inline-block"}}/>
              </div>
              <div style={{fontSize:13,fontWeight:900,color:"#1e293b",marginTop:8}}>{t.label}</div>
              <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{t.mascot}</div>
            </button>;
          })}
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

function PartnerModeTab({cycleData,onBack,themeKey="cat"}){
  const phase=cycleData?.phase||"None";
  const phaseInfo=PHASES[phase]||PHASES.None;
  const phaseSupport=PHASE_SUPPORT[phase]||PHASE_SUPPORT.None;
  const themeCfg=THEME_CONFIG[themeKey]||THEME_CONFIG.cat;
  const [movieTab,setMovieTab]=useState("Bollywood");
  const [carePick,setCarePick]=useState(0);
  const careCards=[
    {title:"Warm comfort kit",tag:"Right now",text:"Heating pad, warm water, soft blanket, and no rushing.",img:"https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80"},
    {title:"Sweet little rescue",tag:"Snack",text:"Chocolate, fruit, or her favorite comfort snack plated nicely.",img:"https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=900&q=80"},
    {title:"Quiet date mode",tag:"Evening",text:"Low lights, comfort movie, phone away, and gentle presence.",img:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"},
  ];
  const imageTiles=[
    {title:"Sunset Walk",img:"https://i.pinimg.com/1200x/f5/ae/23/f5ae235bcd1be8b1140fd201c633e782.jpg"},
    {title:"Painting",img:"https://i.pinimg.com/736x/52/71/bf/5271bf5d99d74e8a816f752900d7281e.jpg"},
    {title:"Movie Night",img:"https://i.pinimg.com/736x/60/33/83/6033835147be6b0bd9803ae303c4115d.jpg"},
    {title:"Cafe Visit",img:"https://i.pinimg.com/736x/60/df/67/60df6777fba2c640e0ca587d3ea9e96d.jpg"},
    {title:"Photography",img:"https://i.pinimg.com/736x/cd/f2/d8/cdf2d866db370a2b1c270d138b788c69.jpg"},
    {title:"Journaling",img:"https://i.pinimg.com/736x/68/b0/d4/68b0d45f534a2afd9c65de64fe71f5ed.jpg"},
  ];
  const movieGroups=Object.keys(PARTNER_SECTIONS.movies);
  const selectedMovies=PARTNER_SECTIONS.movies[movieTab]||PARTNER_SECTIONS.movies.Bollywood;
  const softCard=(item,i)=>(
    <button key={item.title||item} className="lift-card" onClick={()=>setCarePick(i%careCards.length)} style={{background:i%2?themeCfg.soft:"#fff",border:`1px solid ${i%2?themeCfg.light:"#f1f5f9"}`,borderRadius:18,padding:"16px 15px",boxShadow:"0 10px 26px rgba(15,23,42,0.06)",fontFamily:"inherit",cursor:"pointer",textAlign:"left"}}>
      <div style={{width:42,height:42,borderRadius:14,background:`linear-gradient(135deg,${themeCfg.accent},${themeCfg.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",marginBottom:10}}><IconGlyph name={item.icon||"CARE"} size={20}/></div>
      <div style={{fontSize:15,fontWeight:950,color:"#1e293b",marginBottom:5,lineHeight:1.2}}>{item.title||item}</div>
      {item.text&&<div style={{fontSize:13,color:"#64748b",lineHeight:1.55}}>{item.text}</div>}
    </button>
  );
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div className="hero-card" style={{background:`linear-gradient(135deg,${themeCfg.light},${themeCfg.soft} 45%,#fff)`,borderRadius:30,padding:"24px 24px 22px",position:"relative",overflow:"hidden",display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:18,alignItems:"center",boxShadow:"0 22px 60px rgba(15,23,42,0.10)"}}>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 88% 10%,${themeCfg.accent}22,transparent 38%)`}}/>
        <div style={{position:"relative",zIndex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:950,color:themeCfg.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Partner Mode ? {phaseInfo.label}</div>
          <h1 style={{fontSize:34,lineHeight:1.02,fontWeight:950,color:"#1e293b",margin:"0 0 10px"}}>Care that feels thoughtful, not random</h1>
          <p style={{fontSize:15,color:"#64748b",lineHeight:1.65,margin:"0 0 16px",maxWidth:620}}>{phaseSupport.partner}</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {phaseSupport.ideas.slice(0,4).map(x=><span key={x} style={{background:"rgba(255,255,255,0.72)",color:themeCfg.accent,borderRadius:99,padding:"8px 12px",fontSize:12,fontWeight:900}}>{x}</span>)}
          </div>
        </div>
        <div style={{position:"relative",zIndex:1,display:"flex",justifyContent:"center"}}><ThemedMascot theme={themeKey} size={124}/></div>
      </div>

      <section style={{display:"grid",gridTemplateColumns:"minmax(0,1.05fr) minmax(260px,.95fr)",gap:16}} className="partner-feature-grid">
        <div style={{background:"#fff",borderRadius:24,padding:20,boxShadow:"0 14px 38px rgba(15,23,42,0.07)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:14}}>
            <div><h2 style={{fontSize:20,fontWeight:950,color:"#1e293b",margin:"0 0 4px"}}>How to Help Today</h2><p style={{fontSize:13,color:"#64748b",margin:0}}>Tap a card to change the featured care idea.</p></div>
            <span style={{background:themeCfg.soft,color:themeCfg.accent,borderRadius:99,padding:"7px 10px",fontSize:12,fontWeight:900}}>Interactive</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>{PARTNER_SECTIONS.help.map(softCard)}</div>
        </div>
        <div className="image-care-card" style={{borderRadius:24,overflow:"hidden",minHeight:360,boxShadow:"0 18px 48px rgba(15,23,42,0.16)",background:`linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.72)),url(${careCards[carePick].img}) center/cover`}}>
          <div style={{height:"100%",minHeight:360,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:22,color:"#fff"}}>
            <span style={{alignSelf:"flex-start",background:"rgba(255,255,255,0.22)",border:"1px solid rgba(255,255,255,0.35)",backdropFilter:"blur(8px)",borderRadius:99,padding:"7px 10px",fontSize:12,fontWeight:900,marginBottom:10}}>{careCards[carePick].tag}</span>
            <h2 style={{fontSize:26,lineHeight:1.05,fontWeight:950,margin:"0 0 8px"}}>{careCards[carePick].title}</h2>
            <p style={{fontSize:14,lineHeight:1.55,margin:0,opacity:.94}}>{careCards[carePick].text}</p>
          </div>
        </div>
      </section>

      <section style={{background:"#fff",borderRadius:24,padding:20,boxShadow:"0 14px 38px rgba(15,23,42,0.07)"}}>
        <h2 style={{fontSize:20,fontWeight:950,color:"#1e293b",margin:"0 0 14px"}}>What She Might Be Feeling</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12}}>{PARTNER_SECTIONS.feelings.map(softCard)}</div>
      </section>

      <section style={{background:`linear-gradient(145deg,${themeCfg.soft},#fff)`,borderRadius:24,padding:20,boxShadow:"0 14px 38px rgba(15,23,42,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:14,flexWrap:"wrap"}}>
          <h2 style={{fontSize:20,fontWeight:950,color:"#1e293b",margin:0}}>Movie Recommendations</h2>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{movieGroups.map(cat=><button key={cat} onClick={()=>setMovieTab(cat)} className="pressable" style={{border:"none",borderRadius:99,padding:"8px 12px",background:movieTab===cat?themeCfg.accent:"#fff",color:movieTab===cat?"#fff":"#64748b",fontSize:12,fontWeight:900,fontFamily:"inherit",cursor:"pointer",boxShadow:movieTab===cat?`0 8px 20px ${themeCfg.accent}33`:"0 4px 12px rgba(15,23,42,0.05)"}}>{cat}</button>)}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>{selectedMovies.map((m,i)=><div key={m} className="lift-card" style={{background:i%2?"#fff":"#f8fafc",borderRadius:18,padding:16,border:"1px solid #f1f5f9"}}><div style={{fontSize:11,fontWeight:950,color:themeCfg.accent,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{movieTab}</div><div style={{fontSize:15,fontWeight:900,color:"#1e293b",lineHeight:1.25}}>{m}</div></div>)}</div>
      </section>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14}}>
        <section style={{background:"#fff",borderRadius:22,padding:20,boxShadow:"0 14px 38px rgba(15,23,42,0.07)"}}><h2 style={{fontSize:18,fontWeight:950,color:"#1e293b",margin:"0 0 12px"}}>Bollywood Comfort Music</h2>{PARTNER_SECTIONS.bollywoodMusic.map(x=><div key={x} className="music-row" style={{display:"flex",alignItems:"center",gap:10,background:"#f8fafc",borderRadius:14,padding:"10px 12px",fontSize:13,color:"#475569",fontWeight:750,marginBottom:8}}><span style={{width:34,height:26,borderRadius:99,background:themeCfg.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:950,color:themeCfg.accent}}>BGM</span>{x}</div>)}</section>
        <section style={{background:"#fff",borderRadius:22,padding:20,boxShadow:"0 14px 38px rgba(15,23,42,0.07)"}}><h2 style={{fontSize:18,fontWeight:950,color:"#1e293b",margin:"0 0 12px"}}>Comfort Foods</h2>{PARTNER_SECTIONS.foods.map(x=><div key={x} style={{background:"#fff7ed",borderRadius:14,padding:"10px 12px",fontSize:13,color:"#475569",fontWeight:750,marginBottom:8}}>{x}</div>)}</section>
        <section style={{background:"#fff",borderRadius:22,padding:20,boxShadow:"0 14px 38px rgba(15,23,42,0.07)"}}><h2 style={{fontSize:18,fontWeight:950,color:"#1e293b",margin:"0 0 12px"}}>Sweet Messages</h2>{PARTNER_SECTIONS.messages.map(x=><div key={x} style={{background:themeCfg.soft,borderRadius:14,padding:"10px 12px",fontSize:13,color:"#475569",lineHeight:1.45,marginBottom:8}}>{x}</div>)}</section>
      </div>

      <section style={{background:"#fff",borderRadius:24,padding:20,boxShadow:"0 14px 38px rgba(15,23,42,0.07)"}}>
        <h2 style={{fontSize:20,fontWeight:950,color:"#1e293b",margin:"0 0 14px"}}>Girls' Bucket List</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12}}>
          {imageTiles.map(tile=><div key={tile.title} className="lift-card" style={{borderRadius:18,overflow:"hidden",minHeight:160,background:`linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.55)),url(${tile.img}) center/cover`,display:"flex",alignItems:"flex-end",padding:14,color:"#fff",fontWeight:950,fontSize:17}}>{tile.title}</div>)}
        </div>
      </section>
    </div>
  );
}

function AnalysisTab({cycleData,form,periodLogs,symptomLogs,onLogPeriod,onEditPeriod,themeKey="cat"}){
  if(!cycleData){
    return(
      <div style={{background:"#f8fafc",borderRadius:20,padding:40,textAlign:"center"}}>
        <ThemedMascot theme={themeKey} size={86}/>
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
  const avgPain=totalLogs>0?(Object.values(symptomLogs).reduce((a,l)=>a+(l.pain||0),0)/totalLogs).toFixed(1):"";
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{background:"#fff",borderRadius:20,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <p style={{fontSize:16,fontWeight:800,color:"#1e293b",marginBottom:16}}>Cycle analysis</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{background:"#fff1f2",borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:28,color:"#e11d48",marginBottom:8}}>{glyph("PD")}</div>
            <div style={{fontSize:22,fontWeight:900,color:"#e11d48"}}>{periodLogs.length>0?`${periodLogs[0].endDate?Math.max(1,differenceInDays(new Date(periodLogs[0].endDate),new Date(periodLogs[0].startDate))+1):1} Day`:" Day"}</div>
            <div style={{fontSize:13,color:"#e11d48"}}>Average period</div>
          </div>
          <div style={{background:"#fffbeb",borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:28,color:"#d97706",marginBottom:8}}>{glyph("CAL")}</div>
            <div style={{fontSize:22,fontWeight:900,color:"#d97706"}}>{cycleLength} Days</div>
            <div style={{fontSize:13,color:"#d97706"}}>Cycle length</div>
          </div>
          <div style={{background:"#f0fdfa",borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:28,color:"#0f766e",marginBottom:8}}>{glyph("HIST")}</div>
            <div style={{fontSize:22,fontWeight:900,color:"#0f766e"}}>{totalLogs}</div>
            <div style={{fontSize:13,color:"#0f766e"}}>Symptom logs</div>
          </div>
          <div style={{background:"#f5f3ff",borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:28,color:"#7c3aed",marginBottom:8}}>{glyph("CR")}</div>
            <div style={{fontSize:22,fontWeight:900,color:"#7c3aed"}}>{avgPain}</div>
            <div style={{fontSize:13,color:"#7c3aed"}}>Avg pain score</div>
          </div>
        </div>
        {periodLogs.length<3&&<p style={{fontSize:13,color:"#64748b",marginTop:12,marginBottom:0}}>Log 3 periods to unlock full analysis. <span onClick={onLogPeriod} style={{color:"#e11d48",fontWeight:700,cursor:"pointer"}}>Log period </span></p>}
      </div>
      <div style={{background:"#fff",borderRadius:20,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <p style={{fontSize:14,fontWeight:800,color:"#1e293b",marginBottom:16}}>Upcoming dates</p>
        {[{emoji:"OV",label:"Fertile window",date:format(fertileStart,"MMM d"),desc:"6-day window opens"},{emoji:"OV",label:"Ovulation",date:format(ovuDate,"MMM d"),desc:"Peak fertility day"},{emoji:"PD",label:"Next period",date:format(nextPeriodDate,"MMM d"),desc:`${nextPeriodIn} days away`}].map(x=>(
          <div key={x.label} style={{display:"flex",alignItems:"center",gap:14,padding:"11px 0",borderBottom:"1px solid #f8fafc"}}>
            <span style={{fontSize:22}}>{glyph(x.emoji)}</span>
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
                  <span style={{fontSize:13,color:"#64748b"}}>{format(new Date(l.startDate+"T12:00:00"),"MMM d")}{l.endDate?"  "+format(new Date(l.endDate+"T12:00:00"),"MMM d"):""}  {l.flow}</span>
                  <button onClick={()=>onEditPeriod(l)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#7c3aed",fontWeight:700,fontFamily:"inherit"}}>Edit</button>
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
                <span style={{fontSize:20}}>{glyph(sym.emoji)}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{sym.label}</span><span style={{fontSize:12,color:"#94a3b8"}}>{count} ({pct}%)</span></div>
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

//  MAIN APP 
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

  // Compute cycle from the latest logged period first, then cycle settings.
  useEffect(()=>{
    const activeLastPeriod = latestPeriodStart(periodLogs) || (form.lastPeriodDate ? new Date(form.lastPeriodDate) : null);
    if(activeLastPeriod&&form.cycleLength>=21&&form.cycleLength<=45){
      try{const d=new Date(activeLastPeriod);if(!isNaN(d))setCycleData(computeCycleData(d,form.cycleLength,form.lutealLen||14,form.periodDuration||5));else setCycleData(null);}
      catch{setCycleData(null);}
    } else setCycleData(null);
  },[form,periodLogs]);

  // Fire in-app notifications based on reminders + cycle
  useEffect(()=>{
    if(!loaded||notifsChecked.current||!cycleData||!appSettings.notifications||!appSettings.reminders) return;
    notifsChecked.current=true;
    const alerts=[];
    const {nextPeriodIn,nextPeriodDate,ovDay}=cycleData;
    reminders.forEach(r=>{
      if(!r.enabled) return;
      if(r.id==="period"&&nextPeriodIn<=(r.daysBefore||2)&&nextPeriodIn>=0){
        alerts.push({id:`notif-period-${Date.now()}`,icon:"PD",title:nextPeriodIn===0?"Period expected today":`Period in ${nextPeriodIn} day${nextPeriodIn===1?"":"s"}`,body:`Expected ${format(nextPeriodDate,"MMM d")}`,color:"#e11d48"});
        if(typeof Notification!=="undefined"&&Notification.permission==="granted"){
          new Notification("GlowHer",{body:nextPeriodIn===0?"Your period is expected today":`Your period is in ${nextPeriodIn} days (${format(nextPeriodDate,"MMM d")})`});
        }
      }
      if(r.id==="ovulation"&&isSameDay(new Date(),ovDay)){
        alerts.push({id:`notif-ov-${Date.now()}`,icon:"OV",title:"Ovulation day",body:"Today is your peak fertility day",color:"#d97706"});
        if(typeof Notification!=="undefined"&&Notification.permission==="granted"){
          new Notification("GlowHer",{body:"Today is your ovulation day - peak fertility!"});
        }
      }
      if(r.id==="mood"){
        const todayKey=format(new Date(),"yyyy-MM-dd");
        if(!symptomLogs[todayKey]){
          alerts.push({id:`notif-mood-${Date.now()}`,icon:"MO",title:"Daily mood check-in",body:"How are you feeling today?",color:"#7c3aed"});
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
  const savePeriods=useCallback(async(logs)=>{
    setPeriodLogs(logs);
    await storageSet("pt-periods",logs);
    const latest = latestPeriodStart(logs);
    if(latest){
      const current = form.lastPeriodDate ? startOfDay(new Date(form.lastPeriodDate)).getTime() : null;
      if(current!==startOfDay(latest).getTime()){
        const nextForm={...form,lastPeriodDate:latest};
        setForm(nextForm);
        await storageSet("pt-form",{...nextForm,lastPeriodDate:latest.toISOString()});
      }
    }
  },[form]);
  const saveSymptoms=useCallback(async(logs)=>{setSymptomLogs(logs);await storageSet("pt-symptoms",logs);},[]);
  const saveReminders=useCallback(async(r)=>{setReminders(r);await storageSet("pt-reminders",r);},[]);
  const saveSettings=useCallback(async(settings)=>{const normalized={...settings,theme:THEME_CONFIG[settings.theme]?settings.theme:"cat",pet:THEME_CONFIG[settings.pet]?settings.pet:(THEME_CONFIG[settings.theme]?settings.theme:"cat")};setAppSettings(normalized);await storageSet("pt-settings",normalized);},[]);

  function handleEditPeriod(entry){setEditingPeriod(entry);setModal("editPeriod");}
  function handleDeletePeriod(id){savePeriods(periodLogs.filter(l=>l.id!==id));}
  function handleEditSymptoms(dateKey){setEditingSymptomKey(dateKey);setModal("editSymptoms");}
  function dismissNotif(id){setInAppNotifs(n=>n.filter(x=>x.id!==id));}

  const bellCount=inAppNotifs.length;
  const themeKey=THEME_CONFIG[appSettings.theme]?appSettings.theme:(THEME_CONFIG[appSettings.pet]?appSettings.pet:"cat");
  const themeCfg=THEME_CONFIG[themeKey]||THEME_CONFIG.cat;
  const mode=appSettings.darkMode?"dark":"light";

  if(!loaded){
    return(
      <div className="period-app" data-mode={mode} data-theme={themeKey} data-animations={appSettings.animations?"on":"off"} style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:appSettings.darkMode?themeCfg.darkBg:themeCfg.bg,fontFamily:"Nunito,Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",lineHeight:1.5}}>
        <div style={{textAlign:"center"}}><ThemedMascot theme={themeKey} size={80}/><p style={{color:"#94a3b8",fontSize:14,marginTop:12}}>Loading</p></div>
      </div>
    );
  }

  const activePhase=cycleData?.phase||"None";
  const p=PHASES[activePhase];
  const nav=[
    {id:"today",icon:"HOME",label:"Today"},
    {id:"calendar",icon:"CAL",label:"Calendar"},
    {id:"history",icon:"HIST",label:"History"},
    {id:"selfcare",icon:"CARE",label:"Self Care"},
    {id:"partner",icon:"PART",label:"Partner"},
    {id:"analysis",icon:"ANLY",label:"Analysis"},
  ];

  return(
    <div className="period-app" data-mode={mode} data-theme={themeKey} data-animations={appSettings.animations?"on":"off"} style={{"--theme-accent":themeCfg.accent,"--theme-accent-2":themeCfg.accent2,"--theme-soft":themeCfg.soft,"--theme-light":themeCfg.light,minHeight:"100vh",background:appSettings.darkMode?themeCfg.darkBg:themeCfg.bg,fontFamily:"Nunito,Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",fontSize:15,lineHeight:1.5,display:"flex",flexDirection:"column"}}>
      <ThemeEnvironment themeKey={themeKey}/>

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
        <button aria-label="Settings" onClick={()=>setModal("settings")} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,position:"relative",padding:4,color:themeCfg.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <IconGlyph name="SET" size={23}/>{!form.lastPeriodDate&&<span style={{position:"absolute",top:2,right:2,width:8,height:8,borderRadius:"50%",background:"#e11d48",border:"1.5px solid #fff"}}/>}
        </button>
        <div style={{fontSize:16,fontWeight:900,color:"#1e293b",letterSpacing:"-0.02em"}}>GlowHer</div>
        <button aria-label="Reminders" onClick={()=>setModal("reminders")} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,padding:4,position:"relative",color:themeCfg.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <IconGlyph name="BELL" size={23}/>{bellCount>0&&<span style={{position:"absolute",top:0,right:0,minWidth:16,height:16,borderRadius:99,background:"#e11d48",border:"2px solid #fff",fontSize:10,fontWeight:800,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{bellCount}</span>}
        </button>
      </header>

      <div style={{display:"flex",flex:1,minHeight:0}}>
        {/* Desktop sidebar */}
        <aside className="sidebar-nav" style={{width:210,padding:"20px 12px",flexShrink:0,borderRight:"1px solid rgba(241,245,249,0.8)",display:"flex",flexDirection:"column",gap:4,background:"rgba(255,255,255,0.5)"}}>
          {nav.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderRadius:14,border:"none",cursor:"pointer",background:tab===n.id?"rgba(225,29,72,0.1)":"transparent",color:tab===n.id?"#e11d48":"#64748b",fontSize:14,fontWeight:tab===n.id?700:500,fontFamily:"inherit",textAlign:"left",width:"100%"}}>
              <span style={{fontSize:18,display:"flex",alignItems:"center"}}><IconGlyph name={n.icon} size={18}/></span><span>{n.label}</span>
            </button>
          ))}
          <div style={{height:1,background:"#f1f5f9",margin:"8px 4px"}}/>
          <p style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.07em",padding:"4px 16px 2px"}}>Quick actions</p>
          {[{icon:"PD",label:"Log period",action:()=>setModal("period")},{icon:"MO",label:"Log symptoms",action:()=>setModal("symptoms")},{icon:"BELL",label:"Reminders",action:()=>setModal("reminders")},{icon:"SET",label:"Cycle settings",action:()=>setModal("cycle")}].map(x=>(
            <button key={x.label} onClick={x.action} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 16px",borderRadius:12,border:"none",cursor:"pointer",background:"transparent",color:"#64748b",fontSize:13,fontWeight:500,fontFamily:"inherit",textAlign:"left",width:"100%"}} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{fontSize:16,display:"flex",alignItems:"center"}}><IconGlyph name={x.icon} size={16}/></span><span>{x.label}</span>
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
          <div style={{maxWidth:920,margin:"0 auto"}}>
            {tab==="today"&&<button className="back-dashboard-btn" onClick={()=>{window.location.href="/"}}><span>&lt;</span> Back to Dashboard</button>}
            {tab==="today"&&<TodayTab cycleData={cycleData} form={form} onOpenCycleSettings={()=>setModal("cycle")} onLogPeriod={()=>setModal("period")} onLogSymptoms={()=>setModal("symptoms")} onEditSymptoms={handleEditSymptoms} symptomLogs={symptomLogs} onPartnerMode={()=>setTab("partner")} themeKey={themeKey}/>}
            {tab==="calendar"&&<CalendarTab cycleData={cycleData} periodLogs={periodLogs} symptomLogs={symptomLogs} onLogPeriod={()=>setModal("period")} onEditPeriod={handleEditPeriod} onEditSymptoms={handleEditSymptoms}/>}
            {tab==="history"&&<HistoryTab symptomLogs={symptomLogs} periodLogs={periodLogs} onEditSymptoms={handleEditSymptoms} onEditPeriod={handleEditPeriod} onLogSymptoms={()=>setModal("symptoms")} cycleData={cycleData} themeKey={themeKey}/>}
            {tab==="selfcare"&&<SelfCareTab/>}
            {tab==="partner"&&<PartnerModeTab cycleData={cycleData} themeKey={themeKey}/>}
            {tab==="analysis"&&<AnalysisTab cycleData={cycleData} form={form} periodLogs={periodLogs} symptomLogs={symptomLogs} onLogPeriod={()=>setModal("period")} onEditPeriod={handleEditPeriod} themeKey={themeKey}/>}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav  5 items, no FAB center to keep all tabs reachable */}
      <nav className="bottom-nav" style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(12px)",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-around",alignItems:"center",padding:"8px 0 env(safe-area-inset-bottom,8px)",zIndex:50}}>
        {nav.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"5px 8px",borderRadius:12,color:tab===n.id?"#e11d48":"#94a3b8",fontFamily:"inherit",fontSize:9,fontWeight:tab===n.id?700:500,minWidth:44}}>
            <span style={{fontSize:19,display:"flex",alignItems:"center"}}><IconGlyph name={n.icon} size={19}/></span><span>{n.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        .period-app,.period-app *{transition:background-color .28s ease,color .28s ease,border-color .28s ease,box-shadow .28s ease,transform .28s ease}
        .period-app{position:relative;isolation:isolate;overflow-x:hidden}
        .period-app h1,.period-app h2,.period-app h3{letter-spacing:0}
        .hero-card{animation:softFadeUp .42s ease both}
        .lift-card{transition:transform .22s ease,box-shadow .22s ease,filter .22s ease}
        .lift-card:hover{transform:translateY(-4px);box-shadow:0 18px 42px rgba(15,23,42,.13)!important}
        .pressable{transition:transform .16s ease,filter .18s ease,box-shadow .18s ease}
        .pressable:hover{filter:brightness(1.03)}
        .pressable:active{transform:scale(.97)}
        .music-row:hover{transform:translateX(3px);background:var(--theme-soft,#f8fafc)!important}
        .image-care-card{animation:softFadeUp .45s ease both}
        .back-dashboard-btn{position:sticky;top:12px;z-index:35;margin:0 0 14px;background:rgba(255,255,255,.78);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.72);border-radius:999px;padding:10px 16px;color:var(--theme-accent,#db2777);font-size:13px;font-weight:950;font-family:inherit;cursor:pointer;box-shadow:0 12px 30px rgba(15,23,42,.10);overflow:hidden}
        .back-dashboard-btn span{display:inline-flex;margin-right:6px;transition:transform .18s ease}
        .back-dashboard-btn:hover{transform:translateY(-2px) scale(1.015);box-shadow:0 16px 34px rgba(15,23,42,.14)}
        .back-dashboard-btn:hover span{transform:translateX(-3px)}
        .back-dashboard-btn:active{transform:scale(.98)}
        .back-dashboard-btn::after{content:"";position:absolute;inset:auto auto 50% 50%;width:10px;height:10px;border-radius:50%;background:var(--theme-accent,#db2777);opacity:.15;transform:translate(-50%,50%) scale(0);transition:transform .35s ease}
        .back-dashboard-btn:active::after{transform:translate(-50%,50%) scale(18)}
        .sticker-mascot{position:relative}
        .sticker-mascot img{background:transparent!important;border:none!important;outline:none!important}
        .theme-world{position:fixed!important;inset:0;pointer-events:none;overflow:hidden;z-index:0!important;transition:opacity .55s ease,filter .55s ease}
        .theme-world::before,.theme-world::after{content:"";position:absolute;display:block;pointer-events:none}
        .period-app>header,.period-app>div:not(.theme-world),.period-app>nav,.period-app>.bottom-nav{position:relative;z-index:2}
        .period-app[data-mode="light"] header,
        .period-app[data-mode="light"] aside,
        .period-app[data-mode="light"] nav{background:rgba(255,255,255,.66)!important;backdrop-filter:blur(18px)}
        .period-app[data-theme="parrot"]{background:linear-gradient(180deg,#e9fff0 0%,#dff8ff 42%,#f4ffd8 100%)!important}
        .period-app[data-mode="light"] div[style*="background:#fff"],
        .period-app[data-mode="light"] section[style*="background:#fff"],
        .period-app[data-mode="light"] div[style*="background: #fff"]{background:rgba(255,255,255,.76)!important;backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.58)!important}
        .period-app[data-mode="light"] div[style*="#f8fafc"],
        .period-app[data-mode="light"] button[style*="#f8fafc"]{background:rgba(255,255,255,.58)!important;backdrop-filter:blur(12px)}
        .world-gradient{position:absolute;inset:0;opacity:1;transition:background .55s ease}
        .world-horizon{position:absolute;left:-8%;right:-8%;bottom:-6%;height:54%;opacity:.96;filter:blur(.2px)}
        .ambient-orb{position:absolute;width:42vw;height:42vw;max-width:720px;max-height:720px;border-radius:50%;filter:blur(58px);opacity:.34;animation:ambientDrift 16s ease-in-out infinite}
        .ambient-orb-a{top:-10%;left:-8%}.ambient-orb-b{right:-8%;bottom:-12%;animation-delay:-7s}
        .world-item{position:absolute;display:block;opacity:.9;animation:worldFloat 14s ease-in-out infinite;filter:drop-shadow(0 10px 16px rgba(15,23,42,.12))}
        .world-item::before,.world-item::after{content:"";position:absolute;display:block}
        .world-item-0{left:6%;top:16%;animation-delay:-1s}.world-item-1{left:76%;top:12%;animation-delay:-4s}.world-item-2{left:13%;top:70%;animation-delay:-7s}.world-item-3{left:84%;top:65%;animation-delay:-10s}.world-item-4{left:40%;top:10%;animation-delay:-13s}.world-item-5{left:61%;top:78%;animation-delay:-2s}.world-item-6{left:24%;top:36%;animation-delay:-5s}.world-item-7{left:90%;top:32%;animation-delay:-8s}.world-item-8{left:4%;top:48%;animation-delay:-12s}.world-item-9{left:52%;top:26%;animation-delay:-3s}.world-item-10{left:33%;top:84%;animation-delay:-6s}.world-item-11{left:69%;top:44%;animation-delay:-9s}.world-item-12{left:17%;top:8%;animation-delay:-14s}.world-item-13{left:79%;top:84%;animation-delay:-11s}.world-item-14{left:48%;top:58%;animation-delay:-15s}.world-item-15{left:30%;top:60%;animation-delay:-16s}.world-item-16{left:56%;top:12%;animation-delay:-18s}.world-item-17{left:92%;top:78%;animation-delay:-20s}.world-item-18{left:9%;top:88%;animation-delay:-22s}.world-item-19{left:73%;top:58%;animation-delay:-24s}.world-item-20{left:18%;top:28%;animation-delay:-26s}.world-item-21{left:44%;top:88%;animation-delay:-28s}.world-item-22{left:86%;top:20%;animation-delay:-30s}.world-item-23{left:3%;top:12%;animation-delay:-32s}
        .theme-world-cat .world-gradient{background:radial-gradient(circle at 18% 12%,rgba(255,213,120,.78),transparent 23%),radial-gradient(circle at 78% 20%,rgba(135,206,235,.72),transparent 30%),linear-gradient(180deg,rgba(228,247,255,.86),rgba(220,252,231,.86))}
        .theme-world-cat .world-horizon{background:radial-gradient(ellipse at 22% 100%,rgba(127,176,105,.48),transparent 56%),radial-gradient(ellipse at 80% 100%,rgba(92,154,82,.36),transparent 58%),linear-gradient(180deg,transparent,rgba(127,176,105,.52));border-radius:55% 45% 0 0}
        .theme-world-cat::before{left:-3%;right:-3%;bottom:-2%;height:24%;background:repeating-linear-gradient(100deg,rgba(127,176,105,.42) 0 12px,rgba(255,255,255,0) 13px 30px);clip-path:polygon(0 32%,10% 24%,22% 35%,34% 20%,48% 36%,60% 21%,74% 33%,88% 19%,100% 31%,100% 100%,0 100%)}
        .theme-world-cat::after{right:-4%;bottom:8%;width:240px;height:420px;background:radial-gradient(circle at 50% 16%,rgba(127,176,105,.42) 0 22%,transparent 23%),radial-gradient(circle at 22% 28%,rgba(92,154,82,.32) 0 18%,transparent 19%),linear-gradient(90deg,transparent 47%,rgba(154,106,58,.42) 48% 53%,transparent 54%);filter:blur(.2px)}
        .theme-world-fox .world-gradient{background:radial-gradient(circle at 20% 15%,rgba(250,204,21,.68),transparent 24%),radial-gradient(circle at 84% 14%,rgba(201,107,52,.48),transparent 28%),linear-gradient(180deg,rgba(255,247,237,.72),rgba(214,160,63,.34))}
        .theme-world-fox .world-horizon{background:radial-gradient(ellipse at 28% 100%,rgba(201,107,52,.46),transparent 56%),radial-gradient(ellipse at 78% 100%,rgba(120,76,38,.38),transparent 58%),linear-gradient(180deg,transparent,rgba(120,76,38,.38));border-radius:50% 50% 0 0}
        .theme-world-fox::before{left:-5%;right:-5%;bottom:0;height:30%;background:linear-gradient(180deg,transparent,rgba(201,107,52,.36)),repeating-linear-gradient(115deg,rgba(201,107,52,.38) 0 10px,rgba(214,160,63,.24) 11px 24px);clip-path:polygon(0 28%,12% 42%,24% 24%,36% 39%,49% 20%,62% 38%,76% 24%,88% 36%,100% 22%,100% 100%,0 100%)}
        .theme-world-fox::after{left:-3%;bottom:6%;width:260px;height:430px;background:radial-gradient(circle at 42% 16%,rgba(214,160,63,.46) 0 24%,transparent 25%),radial-gradient(circle at 68% 24%,rgba(201,107,52,.42) 0 19%,transparent 20%),linear-gradient(90deg,transparent 47%,rgba(120,76,38,.44) 48% 54%,transparent 55%)}
        .theme-world-dog .world-gradient{background:radial-gradient(circle at 18% 13%,rgba(255,226,143,.72),transparent 25%),radial-gradient(circle at 80% 20%,rgba(135,206,235,.68),transparent 32%),linear-gradient(180deg,rgba(235,249,255,.76),rgba(221,247,216,.76))}
        .theme-world-dog .world-horizon{background:radial-gradient(ellipse at 26% 100%,rgba(116,169,111,.5),transparent 56%),radial-gradient(ellipse at 76% 100%,rgba(164,222,2,.32),transparent 58%),linear-gradient(180deg,transparent,rgba(116,169,111,.52));border-radius:55% 45% 0 0}
        .theme-world-dog::before{left:-5%;right:-5%;bottom:-2%;height:28%;background:linear-gradient(180deg,transparent,rgba(116,169,111,.48));clip-path:polygon(0 38%,10% 28%,21% 36%,32% 24%,43% 35%,55% 25%,66% 38%,78% 24%,90% 36%,100% 28%,100% 100%,0 100%)}
        .theme-world-dog::after{left:4%;bottom:16%;width:260px;height:92px;background:repeating-linear-gradient(90deg,rgba(176,122,69,.5) 0 12px,transparent 13px 44px),linear-gradient(180deg,transparent 46%,rgba(176,122,69,.55) 47% 58%,transparent 59% 100%)}
        .theme-world-parrot .world-gradient{background:radial-gradient(circle at 17% 12%,rgba(255,213,79,.9),transparent 22%),radial-gradient(circle at 82% 14%,rgba(135,206,235,.9),transparent 30%),radial-gradient(circle at 55% 48%,rgba(64,224,208,.5),transparent 34%),linear-gradient(180deg,rgba(240,255,244,.95),rgba(102,187,106,.6) 58%,rgba(46,139,87,.42))}
        .theme-world-parrot .world-horizon{background:radial-gradient(ellipse at 52% 105%,rgba(46,139,87,.62),transparent 62%),linear-gradient(180deg,transparent,rgba(34,139,34,.48));border-radius:50% 50% 0 0}
        .theme-world-parrot::before{left:-8%;right:-8%;top:-7%;height:42%;background:radial-gradient(ellipse at 8% 8%,rgba(46,139,87,.72),transparent 34%),radial-gradient(ellipse at 30% 0,rgba(102,187,106,.62),transparent 35%),radial-gradient(ellipse at 66% 2%,rgba(46,139,87,.66),transparent 34%),radial-gradient(ellipse at 94% 7%,rgba(164,222,2,.5),transparent 32%),linear-gradient(105deg,rgba(255,213,79,.18),transparent 44%);filter:blur(.1px)}
        .theme-world-parrot::after{left:-5%;right:-5%;bottom:-2%;height:38%;background:radial-gradient(ellipse at 14% 100%,rgba(46,139,87,.7),transparent 45%),radial-gradient(ellipse at 86% 100%,rgba(34,139,34,.62),transparent 48%),radial-gradient(ellipse at 50% 110%,rgba(164,222,2,.4),transparent 58%),repeating-linear-gradient(112deg,rgba(46,139,87,.5) 0 12px,rgba(164,222,2,.32) 13px 28px);clip-path:polygon(0 30%,8% 16%,17% 36%,27% 14%,38% 33%,49% 15%,60% 38%,72% 14%,84% 34%,94% 16%,100% 29%,100% 100%,0 100%)}
        .theme-world-mermaid .world-gradient{background:linear-gradient(180deg,rgba(200,252,255,.84),rgba(19,152,168,.48) 45%,rgba(20,83,102,.38)),radial-gradient(circle at 75% 18%,rgba(139,122,223,.42),transparent 30%)}
        .theme-world-mermaid .world-horizon{background:radial-gradient(ellipse at 50% 100%,rgba(20,83,102,.56),transparent 68%),linear-gradient(180deg,transparent,rgba(19,152,168,.34))}
        .theme-world-mermaid::before{inset:0;background:repeating-linear-gradient(105deg,rgba(255,255,255,.18) 0 2px,transparent 3px 58px);animation:waterShimmer 5.4s ease-in-out infinite}
        .theme-world-mermaid::after{left:-5%;right:-5%;bottom:-2%;height:26%;background:radial-gradient(circle at 18% 68%,rgba(251,113,133,.48) 0 5%,transparent 6%),radial-gradient(circle at 82% 66%,rgba(20,184,166,.46) 0 6%,transparent 7%),linear-gradient(180deg,transparent,rgba(20,83,102,.42));clip-path:polygon(0 42%,12% 34%,20% 46%,30% 26%,42% 44%,52% 30%,63% 48%,75% 26%,86% 43%,100% 32%,100% 100%,0 100%)}
        .theme-world-fairy .world-gradient{background:radial-gradient(circle at 22% 16%,rgba(255,214,240,.72),transparent 26%),radial-gradient(circle at 82% 18%,rgba(186,230,253,.62),transparent 29%),radial-gradient(circle at 52% 8%,rgba(250,204,21,.32),transparent 22%),linear-gradient(180deg,rgba(255,255,255,.72),rgba(234,220,255,.5))}
        .theme-world-fairy .world-horizon{background:radial-gradient(ellipse at 30% 100%,rgba(185,120,217,.34),transparent 56%),radial-gradient(ellipse at 72% 100%,rgba(117,185,135,.38),transparent 58%),linear-gradient(180deg,transparent,rgba(185,120,217,.28),rgba(117,185,135,.26));border-radius:55% 45% 0 0}
        .theme-world-fairy::before{left:8%;top:8%;width:210px;height:110px;border-radius:210px 210px 0 0;border:18px solid rgba(249,168,212,.34);border-bottom:0;box-shadow:0 -18px 0 rgba(186,230,253,.28),0 -36px 0 rgba(196,181,253,.24)}
        .theme-world-fairy::after{left:-5%;right:-5%;bottom:-1%;height:28%;background:radial-gradient(circle at 14% 64%,rgba(185,120,217,.32) 0 5%,transparent 6%),radial-gradient(circle at 84% 66%,rgba(249,168,212,.34) 0 5%,transparent 6%),linear-gradient(180deg,transparent,rgba(117,185,135,.28));clip-path:polygon(0 38%,12% 24%,24% 36%,35% 22%,46% 38%,58% 20%,70% 36%,82% 23%,94% 34%,100% 28%,100% 100%,0 100%)}
        .world-sunray,.world-ray{width:220px;height:72px;border-radius:50%;background:linear-gradient(90deg,rgba(255,255,255,.05),rgba(255,255,255,.55),rgba(255,255,255,.04));transform:rotate(-28deg);animation:rayDrift 9s ease-in-out infinite}
        .world-tree,.world-autumn-tree,.world-palm{width:92px;height:145px;opacity:.62}
        .world-tree::before,.world-autumn-tree::before,.world-palm::before{width:58px;height:58px;border-radius:50%;left:7px;top:0;background:#7fb069;box-shadow:-18px 22px 0 #9ccc7d,18px 20px 0 #6aa85f}
        .world-tree::after,.world-autumn-tree::after,.world-palm::after{width:10px;height:58px;left:31px;top:50px;border-radius:8px;background:#9a6a3a}
        .world-autumn-tree::before{background:#d6a03f;box-shadow:-18px 22px 0 #c96b34,18px 20px 0 #9f6b2d}
        .world-palm::before{width:86px;height:42px;left:-8px;background:linear-gradient(135deg,#2E8B57,#40E0D0);clip-path:polygon(50% 0,62% 45%,100% 20%,70% 58%,92% 95%,54% 68%,20% 100%,34% 58%,0 24%,40% 44%);animation:sway 5.5s ease-in-out infinite}
        .world-banana-leaf{width:118px;height:44px;border-radius:90% 0 90% 0;background:linear-gradient(135deg,#66BB6A,#A4DE02);opacity:.72;animation:sway 5.8s ease-in-out infinite}
        .world-vine{width:10px;height:150px;border-left:4px solid rgba(46,139,87,.36);border-radius:50%;top:-8%!important;animation:sway 6.2s ease-in-out infinite}.world-vine::before{width:18px;height:12px;border-radius:90% 0;background:#66BB6A;left:-14px;top:40px;box-shadow:18px 32px 0 #2E8B57,-6px 70px 0 #A4DE02}
        .world-grass,.world-meadow{width:130px;height:34px;border-radius:50% 50% 0 0;background:linear-gradient(180deg,rgba(127,176,105,.0),rgba(127,176,105,.35));bottom:4%;top:auto!important}
        .world-flower,.world-orchid,.world-hibiscus{width:28px;height:28px;border-radius:50%;background:var(--theme-accent);box-shadow:18px 5px 0 var(--theme-accent-2),8px 20px 0 rgba(255,255,255,.78);opacity:.8}
        .world-orchid{background:#d946ef;box-shadow:14px 0 0 #f0abfc,7px 14px 0 #fff,0 0 18px rgba(217,70,239,.32)}
        .world-hibiscus{background:#E53935;box-shadow:15px 0 0 #FFB74D,7px 14px 0 #FFD54F,0 0 16px rgba(229,57,53,.25)}
        .world-butterfly,.world-bird,.world-bee,.world-firefly,.world-pixie,.world-distant-parrot{width:24px;height:16px;animation:flyAcross 18s linear infinite}
        .world-butterfly::before,.world-butterfly::after{width:13px;height:18px;border-radius:70% 30%;background:var(--theme-accent);top:0}.world-butterfly::before{left:0;transform:rotate(-22deg)}.world-butterfly::after{right:0;transform:rotate(22deg)}
        .world-bird::before{width:30px;height:14px;border-top:3px solid var(--theme-accent);border-radius:50%;transform:rotate(8deg)}
        .world-distant-parrot::before{width:28px;height:18px;border-radius:60% 40% 60% 40%;background:linear-gradient(135deg,#E53935 0 35%,#FFD54F 36% 58%,#42A5F5 59%);box-shadow:14px 4px 0 rgba(46,139,87,.8)}
        .world-bee::before,.world-firefly::before,.world-pixie::before{width:10px;height:10px;border-radius:50%;background:var(--theme-accent);box-shadow:12px 0 0 var(--theme-accent-2),0 0 16px var(--theme-accent)}
        .world-leaf,.world-petal,.world-feather,.world-seed,.world-dust,.world-pollen,.world-spark,.world-star,.world-glow,.world-fog{width:12px;height:20px;border-radius:90% 0 90% 0;background:var(--theme-accent);animation:fallDrift 12s linear infinite}
        .world-petal{background:#f9a8d4}.world-feather{height:28px;background:#2d9cc9}.world-seed,.world-pollen,.world-dust{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.85);box-shadow:0 0 12px var(--theme-accent)}.world-spark,.world-star,.world-glow{width:10px;height:10px;border-radius:50%;background:#fff;box-shadow:0 0 18px var(--theme-accent),0 0 30px var(--theme-accent-2)}
        .world-cloud{width:80px;height:28px;border-radius:999px;background:rgba(255,255,255,.55);box-shadow:22px -10px 0 rgba(255,255,255,.42),-20px -4px 0 rgba(255,255,255,.36);animation:cloudDrift 24s linear infinite}
        .world-mouse{width:28px;height:15px;border-radius:50%;background:#9ca3af;bottom:8%;top:auto!important;animation:groundRun 18s linear infinite}.world-mouse::before{width:8px;height:8px;border-radius:50%;background:#cbd5e1;right:-4px;top:1px}.world-mouse::after{width:18px;height:2px;background:#9ca3af;left:-14px;top:9px;transform:rotate(15deg)}
        .world-mushroom{width:30px;height:26px}.world-mushroom::before{width:30px;height:16px;border-radius:18px 18px 5px 5px;background:var(--theme-accent);top:0}.world-mushroom::after{width:12px;height:18px;border-radius:8px;background:#fff7ed;left:9px;top:12px}
        .world-log,.world-branch,.world-fence{width:110px;height:20px;border-radius:99px;background:#9f6b2d;transform:rotate(-8deg);opacity:.62}.world-fence{height:12px;box-shadow:0 22px 0 #b07a45}
        .world-fern{width:54px;height:62px;bottom:3%;top:auto!important}.world-fern::before{width:7px;height:58px;background:#2E8B57;border-radius:8px;left:24px;bottom:0}.world-fern::after{width:42px;height:48px;left:5px;bottom:6px;background:#66BB6A;clip-path:polygon(50% 0,62% 18%,100% 12%,68% 32%,94% 46%,62% 48%,86% 70%,56% 62%,52% 100%,44% 62%,14% 70%,38% 48%,6% 46%,32% 32%,0 12%,38% 18%)}
        .world-waterfall{width:44px;height:90px;border-radius:18px;background:linear-gradient(180deg,rgba(135,206,235,.08),rgba(64,224,208,.46),rgba(255,255,255,.1));filter:blur(.2px);bottom:6%;top:auto!important;animation:waterShimmer 3s ease-in-out infinite}
        .world-rock{width:58px;height:24px;border-radius:60% 50% 30% 40%;background:#94a3b8;opacity:.2;bottom:4%;top:auto!important}
        .world-nest{width:42px;height:18px;border-radius:50%;background:repeating-linear-gradient(20deg,#9f6b2d 0 4px,#7c4a20 5px 8px);opacity:.24}
        .world-mango,.world-coconut,.world-banana{width:22px;height:26px;border-radius:60% 45% 55% 50%;background:#FFB74D;box-shadow:0 0 14px rgba(255,183,77,.28);animation:worldFloat 10s ease-in-out infinite}.world-coconut{background:#8b5a2b}.world-banana{width:34px;height:16px;border-radius:0 0 80% 80%;background:#FFD54F;transform:rotate(-20deg)}
        .period-app[data-theme="parrot"] .hero-card,
        .period-app[data-theme="parrot"] .lift-card{border:1px solid rgba(255,255,255,.64)!important;box-shadow:0 16px 42px rgba(46,139,87,.12)!important}
        .period-app[data-theme="parrot"] .lift-card:hover{box-shadow:0 20px 48px rgba(46,139,87,.18)!important}
        .period-app[data-theme="parrot"] .hero-card{background:linear-gradient(135deg,rgba(236,253,245,.9),rgba(217,249,157,.54),rgba(224,242,254,.72))!important}
        .period-app[data-theme="parrot"] aside,
        .period-app[data-theme="parrot"] header,
        .period-app[data-theme="parrot"] nav{background:rgba(255,255,255,.78)!important;backdrop-filter:blur(18px)}
        .period-app[data-theme="parrot"] .back-dashboard-btn{background:rgba(255,255,255,.78);border-color:rgba(164,222,2,.32);box-shadow:0 12px 30px rgba(46,139,87,.14)}
        .period-app[data-theme="parrot"] .sticker-mascot.mascot-animated{animation:parrotIdle 4.2s ease-in-out infinite;transform-origin:50% 78%}
        .period-app[data-theme="parrot"] .sticker-mascot.mascot-animated img{animation:parrotHeadTilt 5.6s ease-in-out infinite;filter:drop-shadow(0 18px 18px rgba(46,139,87,.22)) drop-shadow(0 0 12px rgba(255,213,79,.18))!important}
        .period-app[data-theme="parrot"] .sticker-mascot.mascot-animated::before,
        .period-app[data-theme="parrot"] .sticker-mascot.mascot-animated::after{content:"";position:absolute;width:9px;height:18px;border-radius:90% 0 90% 0;background:#42A5F5;opacity:0;right:14%;top:18%;filter:drop-shadow(0 6px 8px rgba(46,139,87,.18));animation:featherFlutter 7.5s ease-in-out infinite}
        .period-app[data-theme="parrot"] .sticker-mascot.mascot-animated::after{background:#E53935;right:8%;top:30%;animation-delay:-3.2s}
        .world-mist{width:130px;height:38px;border-radius:999px;background:rgba(255,255,255,.34);filter:blur(10px);animation:cloudDrift 28s linear infinite}
        .world-bubble,.world-pearl{width:18px;height:18px;border:2px solid rgba(255,255,255,.75);border-radius:50%;background:rgba(255,255,255,.14);animation:bubbleRise 11s linear infinite}.world-pearl{background:rgba(255,255,255,.72);border:none;box-shadow:0 0 16px rgba(255,255,255,.8)}
        .world-coral{width:52px;height:60px;bottom:4%;top:auto!important}.world-coral::before{width:9px;height:52px;background:#fb7185;border-radius:8px;left:21px;bottom:0;box-shadow:-16px 16px 0 #f9a8d4,16px 10px 0 #f472b6}.world-coral::after{width:11px;height:11px;border-radius:50%;background:#fb7185;left:9px;top:20px;box-shadow:28px -8px 0 #f472b6,14px -17px 0 #f9a8d4}
        .world-seaweed{width:44px;height:72px;bottom:3%;top:auto!important}.world-seaweed::before,.world-seaweed::after{width:12px;height:70px;border-radius:50%;border-left:8px solid #22c55e;left:10px;animation:sway 4.8s ease-in-out infinite}.world-seaweed::after{left:25px;height:58px;border-color:#14b8a6;animation-delay:-1.8s}
        .world-shell,.world-starfish,.world-jelly{width:32px;height:28px}.world-shell::before{width:32px;height:24px;border-radius:24px 24px 8px 8px;background:#fbcfe8}.world-starfish::before{width:34px;height:34px;background:#fb7185;clip-path:polygon(50% 0,61% 34%,98% 35%,68% 56%,79% 91%,50% 70%,20% 91%,31% 56%,2% 35%,39% 34%)}.world-jelly::before{width:30px;height:22px;border-radius:20px 20px 8px 8px;background:rgba(216,180,254,.5);box-shadow:0 0 18px rgba(216,180,254,.7)}.world-jelly::after{width:28px;height:28px;border-left:2px solid rgba(216,180,254,.7);border-right:2px solid rgba(216,180,254,.7);left:4px;top:20px}
        .world-fish,.world-school{width:38px;height:18px;background:#38bdf8;border-radius:50%;animation:fishSwim 22s linear infinite}.world-fish::after,.world-school::after{right:-10px;top:2px;border-left:14px solid #38bdf8;border-top:7px solid transparent;border-bottom:7px solid transparent}.world-school{box-shadow:45px -20px 0 #facc15,90px 8px 0 #fb7185;opacity:.24}
        .world-rainbow{width:150px;height:76px;border-radius:150px 150px 0 0;border:10px solid rgba(249,168,212,.34);border-bottom:0;box-shadow:0 -10px 0 rgba(186,230,253,.28),0 -20px 0 rgba(196,181,253,.24);opacity:.42}
        .world-crystal{width:24px;height:38px;background:linear-gradient(135deg,#c4b5fd,#ecfeff);clip-path:polygon(50% 0,100% 32%,78% 100%,22% 100%,0 32%);box-shadow:0 0 18px rgba(196,181,253,.45)}
        .period-app [style*="#e11d48"],.period-app [style*="#db2777"]{accent-color:var(--theme-accent)}
        .period-app[data-mode="dark"]{color:#e8e8e8;background:#181818!important}
        .period-app[data-mode="dark"] header,
        .period-app[data-mode="dark"] aside,
        .period-app[data-mode="dark"] nav{background:rgba(24,24,24,.86)!important;border-color:rgba(255,255,255,.08)!important;box-shadow:none!important}
        .period-app[data-mode="dark"] main,
        .period-app[data-mode="dark"] section,
        .period-app[data-mode="dark"] div[style*="background:#fff"],
        .period-app[data-mode="dark"] div[style*="background: #fff"]{background:#202020!important;color:#e8e8e8!important;border-color:rgba(255,255,255,.08)!important;box-shadow:0 12px 28px rgba(0,0,0,.28)!important}
        .period-app[data-mode="dark"] div[style*="#f8fafc"],
        .period-app[data-mode="dark"] button[style*="#f8fafc"],
        .period-app[data-mode="dark"] input,
        .period-app[data-mode="dark"] textarea,
        .period-app[data-mode="dark"] select{background:#222!important;color:#e8e8e8!important;border-color:#343434!important}
        .period-app[data-mode="dark"] [style*="#1e293b"]{color:#f8fafc!important}
        .period-app[data-mode="dark"] [style*="#475569"]{color:#cbd5e1!important}
        .period-app[data-mode="dark"] [style*="#64748b"]{color:#cbd5e1!important}
        .period-app[data-mode="dark"] [style*="#94a3b8"]{color:#94a3b8!important}
        .period-app[data-mode="dark"] [style*="#fff1f2"],
        .period-app[data-mode="dark"] [style*="#fdf2f8"],
        .period-app[data-mode="dark"] [style*="#f5f3ff"],
        .period-app[data-mode="dark"] [style*="#fffbeb"],
        .period-app[data-mode="dark"] [style*="#f0fdfa"],
        .period-app[data-mode="dark"] [style*="#ecfdf5"],
        .period-app[data-mode="dark"] [style*="#fef3c7"]{background:rgba(255,255,255,.055)!important}
        .period-app[data-mode="dark"] .lift-card:hover{box-shadow:0 14px 28px rgba(0,0,0,.34)!important}
        .period-app[data-mode="dark"] .world-gradient{opacity:.28}
        .period-app[data-mode="dark"] .world-horizon{opacity:.22}
        .period-app[data-mode="dark"] .world-item{opacity:.2;filter:drop-shadow(0 8px 18px rgba(0,0,0,.18))}
        .period-app[data-mode="dark"] .ambient-orb{opacity:.1;filter:blur(90px)}
        .mascot-animated{animation:mascotFloat 4.8s ease-in-out infinite;transform-origin:center}
        .mascot-animated .mascot-breathe{animation:mascotBreathe 3.4s ease-in-out infinite;transform-origin:center}
        .mascot-animated .mascot-tail{animation:mascotTail 2.8s ease-in-out infinite;transform-origin:72px 90px}
        .mascot-animated .mascot-eye{animation:mascotBlink 5s ease-in-out infinite;transform-origin:center}
        .mascot-animated .mascot-wing-left{animation:mascotWingLeft 3.2s ease-in-out infinite;transform-origin:55px 65px}
        .mascot-animated .mascot-wing-right{animation:mascotWingRight 3.2s ease-in-out infinite;transform-origin:65px 65px}
        .period-app[data-animations="off"] .mascot-animated,
        .period-app[data-animations="off"] .mascot-animated *{animation:none!important}
        .period-app[data-animations="off"] .hero-card,
        .period-app[data-animations="off"] .image-care-card,
        .period-app[data-animations="off"] .theme-world *,
        .period-app[data-animations="off"] .world-item{animation:none!important}
        @media(max-width:900px){.partner-feature-grid{grid-template-columns:1fr!important}.hero-card{grid-template-columns:1fr!important}.hero-card svg{max-width:120px}.world-item:nth-of-type(n+13){display:none}}
        @media(max-width:720px){.period-app main{padding:14px!important;padding-bottom:92px!important}.hero-card{border-radius:22px!important;padding:22px 18px!important}.hero-card h1{font-size:32px!important}.partner-feature-grid{gap:12px!important}.world-item{opacity:.46}.world-item:nth-of-type(n+10){display:none}.world-horizon{height:44%;opacity:.72}.ambient-orb{opacity:.22}}
        @media(min-width:640px){.sidebar-nav{display:flex!important}.bottom-nav{display:none!important}}
        @media(max-width:639px){.sidebar-nav{display:none!important}.bottom-nav{display:flex!important}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes softFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ambientDrift{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(4%,3%,0) scale(1.08)}}
        @keyframes particleFloat{0%{transform:translateY(22px) rotate(0deg);opacity:0}15%,80%{opacity:.24}100%{transform:translateY(-38px) rotate(18deg);opacity:0}}
        @keyframes worldFloat{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(12px,-18px,0) rotate(6deg)}}
        @keyframes rayDrift{0%,100%{opacity:.18;transform:translateX(-12px) rotate(-28deg)}50%{opacity:.38;transform:translateX(18px) rotate(-24deg)}}
        @keyframes flyAcross{0%{transform:translateX(-40px) translateY(0) scale(.92);opacity:0}12%,82%{opacity:.34}100%{transform:translateX(120px) translateY(-22px) scale(1.05);opacity:0}}
        @keyframes fallDrift{0%{transform:translate3d(0,-28px,0) rotate(0deg);opacity:0}12%,78%{opacity:.34}100%{transform:translate3d(46px,96px,0) rotate(150deg);opacity:0}}
        @keyframes cloudDrift{0%{transform:translateX(-80px);opacity:0}15%,80%{opacity:.36}100%{transform:translateX(120px);opacity:0}}
        @keyframes groundRun{0%{transform:translateX(-70px);opacity:0}10%,82%{opacity:.28}100%{transform:translateX(170px);opacity:0}}
        @keyframes bubbleRise{0%{transform:translateY(90px) scale(.7);opacity:0}15%,82%{opacity:.38}100%{transform:translateY(-150px) scale(1.14);opacity:0}}
        @keyframes sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(6deg)}}
        @keyframes fishSwim{0%{transform:translateX(-130px);opacity:0}12%,82%{opacity:.32}100%{transform:translateX(180px);opacity:0}}
        @keyframes waterShimmer{0%,100%{opacity:.18;transform:translateY(0)}50%{opacity:.34;transform:translateY(6px)}}
        @keyframes parrotIdle{0%,100%{transform:translateY(0) rotate(0deg) scale(1)}22%{transform:translateY(-6px) rotate(-1.5deg) scale(1.015)}48%{transform:translateY(2px) rotate(1.5deg) scale(.995)}72%{transform:translateY(-4px) rotate(.8deg) scale(1.01)}}
        @keyframes parrotHeadTilt{0%,100%{transform:rotate(0deg)}18%{transform:rotate(-2.5deg)}38%{transform:rotate(2.5deg)}62%{transform:rotate(-1.5deg)}82%{transform:rotate(1.8deg)}}
        @keyframes featherFlutter{0%,72%,100%{opacity:0;transform:translate3d(0,0,0) rotate(0deg) scale(.85)}78%{opacity:.55;transform:translate3d(8px,-12px,0) rotate(38deg) scale(1)}90%{opacity:.2;transform:translate3d(22px,22px,0) rotate(110deg) scale(.72)}}
        @keyframes mascotFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes mascotBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
        @keyframes mascotTail{0%,100%{transform:rotate(0deg)}50%{transform:rotate(5deg)}}
        @keyframes mascotBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.12)}}
        @keyframes mascotWingLeft{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-4deg)}}
        @keyframes mascotWingRight{0%,100%{transform:rotate(0deg)}50%{transform:rotate(4deg)}}
      `}</style>
    </div>
  );
}



