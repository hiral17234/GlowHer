"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, subDays, isSameDay, addDays, isWithinInterval, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form, FormControl, FormDescription, FormField,
  FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  CalendarIcon, Bed, Star, BookText, Moon, Award,
  Info, Sparkles, AlertTriangle, History, TrendingUp,
  Clock, Zap, Target, ChevronUp, ChevronDown, Minus
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { SleepLogHistory } from '@/components/glowher/SleepLogHistory';
import { AppSidebar } from '@/components/glowher/AppSidebar';

// ─── SCHEMA ──────────────────────────────────────────────────────────────────

const FormSchema = z.object({
  logDate: z.date({ required_error: "A date is required." }),
  bedtime: z.string().optional(),
  wakeTime: z.string().optional(),
  sleepDuration: z.array(z.number()).min(1, { message: "Please select your sleep duration." }),
  sleepQuality: z.array(z.number()).min(1, { message: "Please rate your sleep quality." }),
  sleepDisruptors: z.array(z.string()).optional(),
  mood: z.string().optional(),
  notes: z.string().max(300, { message: "Notes must be 300 characters or less." }).optional(),
});

type FormData = z.infer<typeof FormSchema>;

const LOCAL_STORAGE_KEY_PREFIX = 'glowher-sleep-log-';

export type SleepLog = {
  logDate: string;
  bedtime?: string;
  wakeTime?: string;
  sleepDuration: number[];
  sleepQuality: number[];
  sleepDisruptors?: string[];
  mood?: string;
  notes?: string;
};

// ─── DATA ────────────────────────────────────────────────────────────────────

const phaseTips: Record<string, { title: string; tip: string }> = {
  Menstrual:  { title: "Sleep & Your Menstrual Phase",  tip: "Your body is working hard. Try going to bed a little earlier to support recovery and manage fatigue." },
  Follicular: { title: "Sleep & Your Follicular Phase", tip: "As energy returns, consistent sleep helps regulate hormones for the upcoming cycle events. Aim for 7–9 hours." },
  Ovulatory:  { title: "Sleep & Your Ovulatory Phase",  tip: "A slight rise in body temperature can sometimes disrupt sleep. Keep your bedroom cool and comfortable." },
  Luteal:     { title: "Sleep & Your Luteal Phase",     tip: "Rising progesterone can make you feel more tired. This is a key time to prioritize rest and wind down before bed." },
};

const qualityOptions = [
  { value: 2,  label: 'Poor',      emoji: '😩', color: '#ef4444' },
  { value: 5,  label: 'Fair',      emoji: '😐', color: '#f59e0b' },
  { value: 8,  label: 'Good',      emoji: '🙂', color: '#6366f1' },
  { value: 10, label: 'Excellent', emoji: '😴', color: '#8b5cf6' },
];

const disruptorOptions = [
  { id: 'stress',    label: 'Stress',     emoji: '😰' },
  { id: 'noise',     label: 'Noise',      emoji: '🔊' },
  { id: 'light',     label: 'Light',      emoji: '💡' },
  { id: 'screen',    label: 'Screens',    emoji: '📱' },
  { id: 'caffeine',  label: 'Caffeine',   emoji: '☕' },
  { id: 'pain',      label: 'Discomfort', emoji: '😣' },
  { id: 'bathroom',  label: 'Bathroom',   emoji: '🚿' },
  { id: 'dreams',    label: 'Dreams',     emoji: '💭' },
];

const morningMoods = [
  { id: 'refreshed',  label: 'Refreshed',  emoji: '✨' },
  { id: 'okay',       label: 'Okay',       emoji: '🙂' },
  { id: 'groggy',     label: 'Groggy',     emoji: '😵‍💫' },
  { id: 'tired',      label: 'Tired',      emoji: '😴' },
  { id: 'anxious',    label: 'Anxious',    emoji: '😟' },
];

const sleepTips = [
  "Keep your bedroom below 68°F (20°C) for optimal sleep.",
  "Avoid caffeine after 2pm — it has a 5–6 hour half-life.",
  "Consistent wake times matter more than bedtime for circadian rhythm.",
  "Blue light from screens suppresses melatonin. Dim screens 1hr before bed.",
  "A 10–20 min nap can restore alertness without causing grogginess.",
  "Alcohol reduces REM sleep even if it helps you fall asleep faster.",
  "Exercise improves sleep quality — but avoid intense workouts within 3hrs of bed.",
  "Magnesium-rich foods (nuts, seeds, leafy greens) may support deeper sleep.",
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getSleepScore(duration: number, quality: number): number {
  const durationScore  = Math.min(duration / 8, 1) * 50;
  const qualityScore   = (quality / 10) * 50;
  return Math.round(durationScore + qualityScore);
}

function getSleepLabel(hours: number): { label: string; color: string } {
  if (hours < 4)  return { label: 'Critically low',  color: '#ef4444' };
  if (hours < 6)  return { label: 'Insufficient',    color: '#f59e0b' };
  if (hours < 7)  return { label: 'Below optimal',   color: '#eab308' };
  if (hours <= 9) return { label: 'Optimal',         color: '#8b5cf6' };
  return             { label: 'Oversleeping',        color: '#6366f1' };
}

function calcDurationFromTimes(bedtime: string, wakeTime: string): number | null {
  if (!bedtime || !wakeTime) return null;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60;   // crossed midnight
  return parseFloat((mins / 60).toFixed(1));
}

// ─── MOON ARC SVG ────────────────────────────────────────────────────────────
// Signature element: glowing arc whose fill rotates with quality

function MoonArc({ quality, duration }: { quality: number; duration: number }) {
  const score   = getSleepScore(duration, quality);
  const pct     = score / 100;
  const r       = 52;
  const cx      = 70;
  const cy      = 70;
  const stroke  = 2 * Math.PI * r;
  const dash    = stroke * pct;
  const gap     = stroke - dash;
  // color
  const qOpt    = qualityOptions.find(q => q.value >= quality) ?? qualityOptions[3];
  const color   = qOpt.color;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-lg">
        {/* glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.9"/>
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
        {/* arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={stroke * 0.25}
          filter="url(#glow)"
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)' }}
        />
        {/* moon icon */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="24" fill="white">🌙</text>
        {/* score */}
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="18" fontWeight="700" fill="white">
          {score}
        </text>
        <text x={cx} y={cy + 28} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)" letterSpacing="1.5">
          SLEEP SCORE
        </text>
      </svg>
    </div>
  );
}

// ─── WEEK CHART ──────────────────────────────────────────────────────────────

function WeekChart({ logs }: { logs: SleepLog[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d   = subDays(startOfDay(new Date()), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const log = logs.find(l => l.logDate === key);
    return { date: d, log };
  });

  const maxH = 12;

  return (
    <div className="flex items-end justify-between gap-1.5 h-28 px-1 mt-2">
      {days.map(({ date, log }, i) => {
        const hours   = log?.sleepDuration[0] ?? 0;
        const quality = log?.sleepQuality[0]  ?? 0;
        const qOpt    = qualityOptions.find(q => q.value >= quality);
        const color   = qOpt?.color ?? 'rgba(255,255,255,0.15)';
        const heightPct = hours ? Math.min(hours / maxH, 1) : 0;
        const isToday = isSameDay(date, new Date());

        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
              {hours > 0 ? (
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${heightPct * 80}px`,
                    background: `${color}`,
                    opacity: 0.85,
                    boxShadow: `0 0 8px ${color}55`,
                  }}
                  title={`${hours}h · ${qOpt?.label ?? ''}`}
                />
              ) : (
                <div className="w-full rounded-t-md bg-white/6" style={{ height: '6px' }} />
              )}
            </div>
            <span className={cn(
              'text-[9px] font-medium',
              isToday ? 'text-violet-300' : 'text-white/35'
            )}>
              {format(date, 'EEE')[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, delta, color = 'violet'
}: {
  icon: React.ReactNode; label: string; value: string;
  sub?: string; delta?: number; color?: string;
}) {
  return (
    <div className={cn(
      'rounded-2xl border border-white/10 p-4',
      'bg-white/5 backdrop-blur-md',
      'flex flex-col gap-2'
    )}>
      <div className="flex items-center justify-between">
        <div className="text-white/40 text-xs tracking-widest uppercase">{label}</div>
        <div className="text-white/30">{icon}</div>
      </div>
      <div className="text-2xl font-semibold text-white leading-none">{value}</div>
      {(sub || delta !== undefined) && (
        <div className="flex items-center gap-1.5 text-xs text-white/45">
          {delta !== undefined && (
            delta > 0
              ? <ChevronUp className="w-3 h-3 text-emerald-400" />
              : delta < 0
                ? <ChevronDown className="w-3 h-3 text-red-400" />
                : <Minus className="w-3 h-3 text-white/30" />
          )}
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function SleepTrackerPage() {
  const router             = useRouter();
  const { toast }          = useToast();
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);
  const [achievements, setAchievements] = useState({ star: false, queen: false, earlyBird: false });
  const [logKey, setLogKey]             = useState(0);
  const [recentLogs, setRecentLogs]     = useState<SleepLog[]>([]);
  const [tipIndex, setTipIndex]         = useState(0);
  const [avgStats, setAvgStats]         = useState({ avgDuration: 0, avgQuality: 0, streak: 0 });

  // rotate tip daily
  useEffect(() => {
    setTipIndex(new Date().getDate() % sleepTips.length);
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      logDate:         subDays(new Date(), 1),
      bedtime:         '23:00',
      wakeTime:        '07:00',
      sleepDuration:   [8],
      sleepQuality:    [8],
      sleepDisruptors: [],
      mood:            '',
      notes:           '',
    },
  });

  const logDate          = form.watch('logDate');
  const notesValue       = form.watch('notes');
  const sleepDuration    = form.watch('sleepDuration');
  const sleepQuality     = form.watch('sleepQuality');
  const bedtime          = form.watch('bedtime');
  const wakeTime         = form.watch('wakeTime');
  const sleepDisruptors  = form.watch('sleepDisruptors') ?? [];
  const selectedMood     = form.watch('mood');

  // Auto-calculate duration from bedtime/wakeTime
  useEffect(() => {
    if (bedtime && wakeTime) {
      const calc = calcDurationFromTimes(bedtime, wakeTime);
      if (calc !== null && calc > 0 && calc <= 16) {
        form.setValue('sleepDuration', [parseFloat(calc.toFixed(1))]);
      }
    }
  }, [bedtime, wakeTime]);

  const toggleDisruptor = (id: string) => {
    const current = sleepDisruptors;
    const next    = current.includes(id)
      ? current.filter(d => d !== id)
      : [...current, id];
    form.setValue('sleepDisruptors', next);
  };

  // ── Stats & achievements ───────────────────────────────────────────────
  const calculateStats = () => {
    try {
      const today = startOfDay(new Date());
      let totalDur   = 0;
      let totalQual  = 0;
      let count      = 0;
      let streak     = 0;
      let goodStreak = 0;
      let qualStreak = 0;
      let earlyLogs  = 0;

      for (let i = 0; i < 7; i++) {
        const d   = subDays(today, i);
        const key = format(d, 'yyyy-MM-dd');
        const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
        if (raw) {
          const log: FormData = JSON.parse(raw);
          totalDur  += log.sleepDuration[0];
          totalQual += log.sleepQuality[0];
          count++;
          if (streak === i) streak++;
          if (log.bedtime && log.bedtime <= '22:30') earlyLogs++;
        }
      }

      // Achievement streaks
      for (let i = 0; i < 3; i++) {
        const d   = subDays(today, i);
        const key = format(d, 'yyyy-MM-dd');
        const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
        if (raw) {
          const log: FormData = JSON.parse(raw);
          if (log.sleepDuration[0] >= 8) goodStreak++; else break;
        } else break;
      }
      for (let i = 0; i < 7; i++) {
        const d   = subDays(today, i);
        const key = format(d, 'yyyy-MM-dd');
        const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
        if (raw) {
          const log: FormData = JSON.parse(raw);
          if (log.sleepQuality[0] >= 8) qualStreak++; else break;
        } else break;
      }

      setAvgStats({
        avgDuration: count ? parseFloat((totalDur / count).toFixed(1)) : 0,
        avgQuality:  count ? Math.round(totalQual / count) : 0,
        streak,
      });
      setAchievements({
        star:      goodStreak >= 3,
        queen:     qualStreak >= 7,
        earlyBird: earlyLogs >= 3,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const loadRecentLogs = () => {
    try {
      const logs: SleepLog[] = [];
      const today = startOfDay(new Date());
      for (let i = 0; i < 7; i++) {
        const d   = subDays(today, i);
        const key = format(d, 'yyyy-MM-dd');
        const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
        if (raw) logs.push(JSON.parse(raw));
      }
      setRecentLogs(logs);
    } catch (e) {
      console.error(e);
    }
  };

  // ── Init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    // Cycle phase
    try {
      const pd = localStorage.getItem('glowher-period-tracker');
      if (pd) {
        const data    = JSON.parse(pd);
        const today   = startOfDay(new Date());
        let start     = startOfDay(new Date(data.lastPeriodDate));
        while (addDays(start, data.cycleLength) <= today) {
          start = addDays(start, data.cycleLength);
        }
        const nextP   = addDays(start, data.cycleLength);
        const ov      = addDays(nextP, -(data.lutealPhaseLength || 14));
        const pEnd    = addDays(start, 4);
        if (isWithinInterval(today, { start, end: pEnd }))                        setCurrentPhase('Menstrual');
        else if (isWithinInterval(today, { start: addDays(pEnd, 1), end: addDays(ov, -1) })) setCurrentPhase('Follicular');
        else if (isSameDay(today, ov))                                            setCurrentPhase('Ovulatory');
        else if (isWithinInterval(today, { start: addDays(ov, 1), end: addDays(nextP, -1) })) setCurrentPhase('Luteal');
      }
    } catch (e) { console.error(e); }

    // Load today's log
    const initDate = form.getValues('logDate');
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(initDate, 'yyyy-MM-dd')}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed    = JSON.parse(raw);
        parsed.logDate  = new Date(parsed.logDate);
        form.reset(parsed);
      }
    } catch (e) { console.error(e); }

    calculateStats();
    loadRecentLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Date change ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isSameDay(logDate, currentDate)) return;
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(logDate, 'yyyy-MM-dd')}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed    = JSON.parse(raw);
        parsed.logDate  = new Date(parsed.logDate);
        form.reset(parsed);
      } else {
        form.reset({
          logDate, bedtime: '23:00', wakeTime: '07:00',
          sleepDuration: [8], sleepQuality: [8],
          sleepDisruptors: [], mood: '', notes: '',
        });
      }
      setCurrentDate(logDate);
    } catch (e) { console.error(e); }
  }, [logDate, form, currentDate]);

  // ── Submit ─────────────────────────────────────────────────────────────
  function onSubmit(data: FormData) {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(data.logDate, 'yyyy-MM-dd')}`;
    try {
      const toSave = { ...data, logDate: format(data.logDate, 'yyyy-MM-dd') };
      localStorage.setItem(key, JSON.stringify(toSave));

      toast({ title: "Sleep logged! 🌙", description: "Your entry has been saved." });

      const hrs = data.sleepDuration[0];
      if (hrs < 4) {
        toast({
          variant: 'destructive',
          title: "Critical sleep deficit",
          description: "Under 4 hours significantly impacts health. Prioritize rest tonight.",
        });
      } else if (hrs < 6) {
        toast({
          title: "Below recommended sleep",
          description: "Most adults need 7–9 hours. Try to sleep a little longer.",
        });
      }

      calculateStats();
      loadRecentLogs();
      setLogKey(k => k + 1);
    } catch (e) {
      toast({ variant: 'destructive', title: "Could not save", description: "Please try again." });
      console.error(e);
    }
  }

  const currentQOpt = qualityOptions.find(q => q.value >= (sleepQuality[0] ?? 0)) ?? qualityOptions[2];
  const sleepInfo   = getSleepLabel(sleepDuration[0] ?? 0);

  return (
    <div className="flex min-h-screen bg-[#07040f] text-white">

      {/* ── SVG stars background ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0720] via-[#0a0518] to-[#07040f]" />
        {/* Nebula blobs */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[500px] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[400px] rounded-full bg-indigo-900/25 blur-[100px]" />
        <div className="absolute bottom-[-5%] left-[20%] w-[700px] h-[400px] rounded-full bg-purple-900/18 blur-[140px]" />
        {/* Star field SVG */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 120 }, (_, i) => {
            const x    = (i * 137.508) % 100;
            const y    = (i * 97.3)    % 100;
            const r    = i % 5 === 0 ? 1.5 : i % 3 === 0 ? 1 : 0.6;
            const op   = 0.2 + (i % 7) * 0.08;
            return (
              <circle
                key={i}
                cx={`${x}%`} cy={`${y}%`}
                r={r} fill="white" opacity={op}
              />
            );
          })}
        </svg>
        {/* Shooting star */}
        <div
          className="absolute w-32 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
          style={{ top: '18%', left: '30%', transform: 'rotate(-22deg)', animation: 'shootingstar 8s 3s infinite' }}
        />
      </div>

      {/* Sidebar */}
      <AppSidebar />

      {/* ── PAGE CONTENT ── */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">

        {/* ── HERO ── */}
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[3.5px] uppercase text-violet-400/70 font-medium mb-3">
            GlowHer · Sleep Tracker
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3 bg-gradient-to-r from-violet-200 via-white to-indigo-200 bg-clip-text text-transparent">
            Rest & Recovery
          </h1>
          <p className="text-white/45 text-base font-light max-w-md mx-auto">
            Track your sleep to uncover patterns, spot trends, and wake up better.
          </p>
          {/* Daily tip */}
          <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/55 max-w-sm">
            <Sparkles className="w-3 h-3 text-violet-400 flex-shrink-0" />
            <span className="text-left">{sleepTips[tipIndex]}</span>
          </div>
        </div>

        {/* ── STAT STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard
            icon={<Clock className="w-4 h-4"/>}
            label="Avg duration"
            value={avgStats.avgDuration ? `${avgStats.avgDuration}h` : '—'}
            sub="last 7 days"
          />
          <StatCard
            icon={<Star className="w-4 h-4"/>}
            label="Avg quality"
            value={avgStats.avgQuality ? `${avgStats.avgQuality}/10` : '—'}
            sub="last 7 days"
          />
          <StatCard
            icon={<Zap className="w-4 h-4"/>}
            label="Logging streak"
            value={avgStats.streak ? `${avgStats.streak}d` : '—'}
            sub="consecutive days"
          />
          <StatCard
            icon={<Target className="w-4 h-4"/>}
            label="Goal"
            value={sleepDuration[0] >= 8 ? '✓ Met' : 'Not yet'}
            sub="8h target tonight"
          />
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── LEFT: LOG FORM ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Form card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Moon className="w-4 h-4 text-violet-400" />
                  <h2 className="text-sm font-medium text-white/90 tracking-wide">Log last night's sleep</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/sleep-history')}
                  className="text-white/40 hover:text-white/70 text-xs gap-1.5"
                >
                  <History className="w-3.5 h-3.5" /> History
                </Button>
              </div>

              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">

                    {/* DATE */}
                    <FormField
                      control={form.control}
                      name="logDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <SLabel>Night of</SLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-[200px] pl-3 text-left font-normal text-sm bg-white/6 border-white/12 text-white/80 hover:bg-white/10"
                                >
                                  {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-40" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={date => date >= new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* BEDTIME + WAKE TIME */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bedtime"
                        render={({ field }) => (
                          <FormItem>
                            <SLabel>Bedtime</SLabel>
                            <FormControl>
                              <input
                                type="time"
                                {...field}
                                className="w-full px-3 py-2 rounded-lg text-sm bg-white/6 border border-white/12 text-white/80 outline-none focus:border-violet-500/50 transition-colors"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="wakeTime"
                        render={({ field }) => (
                          <FormItem>
                            <SLabel>Wake time</SLabel>
                            <FormControl>
                              <input
                                type="time"
                                {...field}
                                className="w-full px-3 py-2 rounded-lg text-sm bg-white/6 border border-white/12 text-white/80 outline-none focus:border-violet-500/50 transition-colors"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* DURATION SLIDER */}
                    <FormField
                      control={form.control}
                      name="sleepDuration"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between mb-2">
                            <SLabel>Sleep duration</SLabel>
                            <span className="text-sm font-semibold text-violet-300">
                              {field.value?.[0]} hrs
                              <span className="ml-1.5 text-xs font-normal px-1.5 py-0.5 rounded-full" style={{ color: sleepInfo.color, background: `${sleepInfo.color}22` }}>
                                {sleepInfo.label}
                              </span>
                            </span>
                          </div>
                          <FormControl>
                            <Slider
                              value={field.value}
                              max={16}
                              min={0}
                              step={0.5}
                              onValueChange={field.onChange}
                              className="[&_.slider-thumb]:bg-violet-400 [&_.slider-track]:bg-violet-500/30"
                            />
                          </FormControl>
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-white/25">0h</span>
                            <span className="text-[10px] text-white/25">16h</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* QUALITY */}
                    <FormField
                      control={form.control}
                      name="sleepQuality"
                      render={({ field }) => (
                        <FormItem>
                          <SLabel>Sleep quality</SLabel>
                          <FormControl>
                            <div className="grid grid-cols-4 gap-2 pt-1">
                              {qualityOptions.map(opt => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => field.onChange([opt.value])}
                                  className={cn(
                                    'flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl text-xs transition-all duration-200 border',
                                    field.value?.[0] === opt.value
                                      ? 'border-violet-400/70 bg-violet-500/15 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                                      : 'border-white/8 bg-white/4 text-white/45 hover:border-white/20 hover:bg-white/8',
                                    'hover:-translate-y-0.5'
                                  )}
                                >
                                  <span className="text-2xl leading-none">{opt.emoji}</span>
                                  <span className="font-medium">{opt.label}</span>
                                </button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* MORNING MOOD */}
                    <div>
                      <SLabel>How do you feel this morning?</SLabel>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {morningMoods.map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => form.setValue('mood', selectedMood === m.id ? '' : m.id)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all',
                              selectedMood === m.id
                                ? 'bg-violet-500/20 border-violet-400/50 text-violet-200'
                                : 'bg-white/4 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                            )}
                          >
                            <span>{m.emoji}</span> {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DISRUPTORS */}
                    <div>
                      <SLabel>What disrupted your sleep? <span className="text-white/25 normal-case">(optional)</span></SLabel>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {disruptorOptions.map(d => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => toggleDisruptor(d.id)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all',
                              sleepDisruptors.includes(d.id)
                                ? 'bg-red-500/15 border-red-400/40 text-red-300'
                                : 'bg-white/4 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                            )}
                          >
                            <span>{d.emoji}</span> {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* NOTES */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <SLabel icon={<BookText className="w-3.5 h-3.5" />}>Sleep notes</SLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Woke up twice, had a vivid dream, felt restless…"
                              className="resize-none text-sm bg-white/5 border-white/10 text-white/80 placeholder:text-white/25 focus:border-violet-500/50 rounded-xl min-h-[90px]"
                              maxLength={300}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-right text-[10px] text-white/25">
                            {notesValue?.length || 0} / 300
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* SAVE */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium tracking-wide border-0 shadow-[0_4px_20px_rgba(139,92,246,0.35)] hover:shadow-[0_4px_28px_rgba(139,92,246,0.5)] transition-all"
                    >
                      Save sleep log
                    </Button>
                  </form>
                </Form>
              </div>
            </div>

            {/* History chart */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  7-day overview
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white/30">
                  {qualityOptions.map(q => (
                    <span key={q.value} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm inline-block" style={{ background: q.color }} />
                      {q.label}
                    </span>
                  ))}
                </div>
              </div>
              <WeekChart logs={recentLogs} />
              <div className="text-center mt-1">
                <span className="text-[10px] text-white/25">bar height = duration · color = quality</span>
              </div>
            </div>

            {/* Full history component */}
            <SleepLogHistory key={logKey} />
          </div>

          {/* ── RIGHT: INSIGHTS PANEL ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Moon score */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5">
              <div className="text-[10px] tracking-[2.5px] uppercase text-white/35 font-medium mb-4">
                Tonight's score
              </div>
              <div className="flex justify-center">
                <MoonArc quality={sleepQuality[0] ?? 8} duration={sleepDuration[0] ?? 8} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
                  <div className="text-white/35 mb-0.5">Duration</div>
                  <div className="text-white font-semibold">{sleepDuration[0] ?? '—'}h</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
                  <div className="text-white/35 mb-0.5">Quality</div>
                  <div className="text-white font-semibold">{currentQOpt.label}</div>
                </div>
              </div>
              {(sleepDuration[0] ?? 0) < 4 && (
                <Alert className="mt-3 bg-red-500/10 border-red-500/25">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  <AlertTitle className="text-red-300 text-xs font-semibold">Critical sleep deficit</AlertTitle>
                  <AlertDescription className="text-red-300/70 text-xs">
                    Under 4 hours significantly impacts health. Prioritize rest tonight.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Cycle phase tip */}
            {currentPhase && phaseTips[currentPhase] && (
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/8 backdrop-blur-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[10px] tracking-[2px] uppercase text-violet-400/80 font-medium">
                    Cycle insight · {currentPhase}
                  </span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  {phaseTips[currentPhase].tip}
                </p>
              </div>
            )}

            {/* Achievements */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-white/8 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-medium text-white/85">Achievements</h3>
              </div>
              <div className="p-4 space-y-3">
                {[
                  {
                    key: 'star', earned: achievements.star,
                    icon: '⭐', title: 'Sleep Star',
                    desc: '8+ hours for 3 nights in a row',
                  },
                  {
                    key: 'queen', earned: achievements.queen,
                    icon: '👑', title: 'Rest Queen',
                    desc: 'Good/Excellent quality for 7 days',
                  },
                  {
                    key: 'earlyBird', earned: achievements.earlyBird,
                    icon: '🌅', title: 'Early Bird',
                    desc: 'In bed by 10:30pm 3+ nights',
                  },
                ].map(a => (
                  <div
                    key={a.key}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all',
                      a.earned
                        ? 'bg-amber-500/10 border-amber-400/25'
                        : 'bg-white/3 border-white/7 opacity-50'
                    )}
                  >
                    <span className="text-xl leading-none">{a.icon}</span>
                    <div>
                      <div className={cn('text-xs font-semibold', a.earned ? 'text-amber-200' : 'text-white/45')}>
                        {a.title}
                      </div>
                      <div className="text-[10px] text-white/30">{a.desc}</div>
                    </div>
                    {a.earned && (
                      <div className="ml-auto w-4 h-4 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                        <span className="text-[8px] text-amber-300">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sleep hygiene checklist */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-medium text-white/85">Sleep hygiene</h3>
              </div>
              <ul className="space-y-2">
                {[
                  'Dark, cool room (65–68°F)',
                  'No screens 1hr before bed',
                  'Consistent sleep schedule',
                  'Avoid caffeine after 2pm',
                  'Wind-down routine',
                ].map((tip, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Shooting star animation */}
      <style>{`
        @keyframes shootingstar {
          0%   { transform: translateX(-200px) translateY(-200px) rotate(-22deg); opacity: 0; }
          5%   { opacity: 0.7; }
          15%  { transform: translateX(600px) translateY(600px) rotate(-22deg); opacity: 0; }
          100% { transform: translateX(600px) translateY(600px) rotate(-22deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── SHARED LABEL ────────────────────────────────────────────────────────────

function SLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] tracking-[2px] uppercase font-medium text-white/35 mb-1.5">
      {icon}
      <span>{children}</span>
      <div className="flex-1 h-px bg-white/7 ml-1" />
    </div>
  );
}
