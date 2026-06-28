"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  addDays, format, startOfDay, differenceInDays,
  isWithinInterval, isSameDay, subDays
} from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CalendarIcon, Info, Heart, Brain, Dumbbell, Utensils,
  Shield, Activity, AlertTriangle, Plus, Home, Calendar,
  HeartPulse, BarChart2, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  lastPeriodDate: z.date({ required_error: "Last period date is required." }),
  cycleLength: z.coerce.number().min(21, "Cycle must be at least 21 days").max(45, "Cycles over 45 days are uncommon."),
  lutealPhaseLength: z.coerce.number().min(10).max(18).optional(),
});

type CycleData = z.infer<typeof formSchema>;
type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'None';

const phaseConfig: Record<CyclePhase, {
  label: string; emoji: string; textColor: string; bgColor: string;
  description: string;
  tips: { icon: React.ElementType; title: string; text: string }[];
}> = {
  Menstrual: {
    label: "Menstrual", emoji: "🌙", textColor: "text-rose-500", bgColor: "bg-rose-50",
    description: "Days 1–5 · Rest, restore, release",
    tips: [
      { icon: Utensils, title: "Nourish", text: "Iron-rich foods like spinach, lentils, and dark chocolate help replenish what's lost." },
      { icon: Activity, title: "Move gently", text: "Light yoga, stretching, or slow walks are your best friends right now." },
      { icon: Heart, title: "Ease discomfort", text: "A warm compress on your abdomen works wonders for cramps." },
      { icon: Brain, title: "Rest & reflect", text: "Your intuition is sharp. Journal, slow down, and be compassionate with yourself." },
    ],
  },
  Follicular: {
    label: "Follicular", emoji: "🌱", textColor: "text-violet-500", bgColor: "bg-violet-50",
    description: "Days 6–13 · Rise, renew, begin",
    tips: [
      { icon: Utensils, title: "Fuel up", text: "Lean proteins and complex carbs support your rising energy levels." },
      { icon: Activity, title: "Build momentum", text: "Energy is climbing — try dance, brisk walks, or a new workout class." },
      { icon: Brain, title: "Create & plan", text: "Mental clarity peaks here. Great time for big projects and brainstorming." },
      { icon: Shield, title: "Glow up", text: "Your skin is often at its clearest. Keep it simple and hydrated." },
    ],
  },
  Ovulation: {
    label: "Ovulation", emoji: "✨", textColor: "text-amber-500", bgColor: "bg-amber-50",
    description: "Day 14 · Peak energy, peak power",
    tips: [
      { icon: Utensils, title: "Antioxidants", text: "Berries, leafy greens, and fiber support hormone processing." },
      { icon: Activity, title: "Go hard", text: "You're at your peak! HIIT, running, heavy lifting — your body is ready." },
      { icon: Heart, title: "Connect", text: "Confidence is high. Great time for social events and important conversations." },
      { icon: Brain, title: "Speak up", text: "Verbal expression peaks. Use this for negotiations and presentations." },
    ],
  },
  Luteal: {
    label: "Luteal", emoji: "🍂", textColor: "text-teal-500", bgColor: "bg-teal-50",
    description: "Days 15–28 · Wind down, turn inward",
    tips: [
      { icon: Utensils, title: "Manage PMS", text: "Magnesium-rich foods and B-vitamins ease mood swings. Cut caffeine." },
      { icon: Activity, title: "Ease off", text: "Swap intense workouts for Pilates, swimming, or restorative yoga." },
      { icon: Heart, title: "Body care", text: "Bloating is common. Increase water intake and wear comfortable clothing." },
      { icon: Brain, title: "Self-care", text: "Turn inward — a bath, a book, a comforting film. Cozy, not productive." },
    ],
  },
  None: {
    label: "Not set", emoji: "🌸", textColor: "text-pink-500", bgColor: "bg-pink-50",
    description: "Enter your details to get started",
    tips: [
      { icon: Heart, title: "Track your cycle", text: "Enter your last period date to unlock personalized insights." },
      { icon: Brain, title: "Understand patterns", text: "Tracking helps you spot what's normal for your unique body." },
      { icon: Dumbbell, title: "Sync your lifestyle", text: "Align workouts and diet with your natural rhythm." },
      { icon: Utensils, title: "Eat with your cycle", text: "Different phases call for different nutrients." },
    ],
  },
};

// ── Cute SVG Cat Mascot ──────────────────────────────────────────────────────
function CatMascot({ mood = 'happy' }: { mood?: 'happy' | 'sleepy' | 'excited' }) {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="45" cy="58" rx="22" ry="20" fill="#4A4A5A" />
      <ellipse cx="45" cy="38" rx="20" ry="18" fill="#5A5A6A" />
      <polygon points="28,24 22,10 34,20" fill="#4A4A5A" />
      <polygon points="62,24 68,10 56,20" fill="#4A4A5A" />
      <polygon points="28,22 24,13 32,20" fill="#FF9BB5" />
      <polygon points="62,22 66,13 58,20" fill="#FF9BB5" />
      {mood === 'happy' && (
        <>
          <ellipse cx="38" cy="37" rx="3.5" ry="4" fill="white" />
          <ellipse cx="52" cy="37" rx="3.5" ry="4" fill="white" />
          <circle cx="38" cy="38" r="2" fill="#2D2D3A" />
          <circle cx="52" cy="38" r="2" fill="#2D2D3A" />
          <circle cx="39" cy="37" r="0.8" fill="white" />
          <circle cx="53" cy="37" r="0.8" fill="white" />
          <path d="M40 45 Q45 49 50 45" stroke="#FF9BB5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="45" cy="44" r="2" fill="#FF9BB5" opacity="0.7" />
        </>
      )}
      {mood === 'sleepy' && (
        <>
          <path d="M35 37 Q38 34 41 37" stroke="#2D2D3A" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M49 37 Q52 34 55 37" stroke="#2D2D3A" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M40 45 Q45 49 50 45" stroke="#FF9BB5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="45" cy="44" r="2" fill="#FF9BB5" opacity="0.7" />
        </>
      )}
      {mood === 'excited' && (
        <>
          <circle cx="38" cy="37" r="4" fill="white" />
          <circle cx="52" cy="37" r="4" fill="white" />
          <circle cx="38" cy="38" r="2.5" fill="#2D2D3A" />
          <circle cx="52" cy="38" r="2.5" fill="#2D2D3A" />
          <circle cx="39" cy="37" r="1" fill="white" />
          <circle cx="53" cy="37" r="1" fill="white" />
          <path d="M39 46 Q45 51 51 46" stroke="#FF9BB5" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="45" cy="44" r="2.5" fill="#FF9BB5" opacity="0.8" />
        </>
      )}
      <line x1="20" y1="42" x2="35" y2="43" stroke="#9999AA" strokeWidth="0.8" />
      <line x1="20" y1="45" x2="35" y2="45" stroke="#9999AA" strokeWidth="0.8" />
      <line x1="55" y1="43" x2="70" y2="42" stroke="#9999AA" strokeWidth="0.8" />
      <line x1="55" y1="45" x2="70" y2="45" stroke="#9999AA" strokeWidth="0.8" />
      <polygon points="38,68 45,72 38,76" fill="#FF6B9D" />
      <polygon points="52,68 45,72 52,76" fill="#FF6B9D" />
      <circle cx="45" cy="72" r="2.5" fill="#FF9BB5" />
      <ellipse cx="32" cy="74" rx="7" ry="5" fill="#4A4A5A" />
      <ellipse cx="58" cy="74" rx="7" ry="5" fill="#4A4A5A" />
      <ellipse cx="30" cy="75" rx="2" ry="1.5" fill="#5A5A6A" />
      <ellipse cx="34" cy="76" rx="2" ry="1.5" fill="#5A5A6A" />
      <ellipse cx="56" cy="75" rx="2" ry="1.5" fill="#5A5A6A" />
      <ellipse cx="60" cy="76" rx="2" ry="1.5" fill="#5A5A6A" />
      <path d="M67 65 Q80 55 78 42 Q76 35 70 38" stroke="#4A4A5A" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function FloatingStickers() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <span className="absolute top-8 right-6 text-2xl opacity-30">🌸</span>
      <span className="absolute top-24 left-2 text-xl opacity-20">✨</span>
      <span className="absolute top-16 right-20 text-lg opacity-20">💫</span>
      <span className="absolute bottom-32 left-4 text-xl opacity-15">🌙</span>
      <span className="absolute top-40 right-8 text-sm opacity-25">♡</span>
    </div>
  );
}

function CycleTimeline({ dayOfCycle, cycleLength, phase }: {
  dayOfCycle: number; cycleLength: number; phase: CyclePhase;
}) {
  const periodEnd = 5;
  const follEnd = Math.round(cycleLength * 0.45);
  const ovDay = Math.round(cycleLength * 0.5);
  const progress = Math.min((dayOfCycle / cycleLength) * 100, 100);

  return (
    <div className="w-full">
      <div className="relative h-5 rounded-full overflow-hidden bg-gray-100">
        <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-l-full"
          style={{ width: `${(periodEnd / cycleLength) * 100}%` }} />
        <div className="absolute top-0 h-full bg-gradient-to-r from-amber-300 to-yellow-400"
          style={{ left: `${(periodEnd / cycleLength) * 100}%`, width: `${((follEnd - periodEnd) / cycleLength) * 100}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-orange-400 border-2 border-white shadow z-10"
          style={{ left: `calc(${(ovDay / cycleLength) * 100}% - 8px)` }} />
        <div className="absolute top-0 h-full bg-rose-100 rounded-r-full"
          style={{ left: `${(ovDay / cycleLength) * 100}%`, width: `${((cycleLength - ovDay) / cycleLength) * 100}%` }} />
        {dayOfCycle > 0 && (
          <div className="absolute top-0 h-full w-0.5 bg-indigo-600 z-20"
            style={{ left: `${progress}%` }} />
        )}
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium">
        <span>Period</span><span>Follicular</span><span>Ovulation</span><span>Luteal</span>
      </div>
    </div>
  );
}

export default function PeriodTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'selfcare' | 'analysis'>('today');
  const [showSettings, setShowSettings] = useState(false);

  const [predictedPeriods, setPredictedPeriods] = useState<Date[]>([]);
  const [fertileWindows, setFertileWindows] = useState<Date[]>([]);
  const [ovulationDays, setOvulationDays] = useState<Date[]>([]);
  const [summary, setSummary] = useState({
    nextPeriodIn: '--' as string,
    nextPeriodDate: '--' as string,
    currentPhase: 'None' as CyclePhase,
    dayOfCycle: 0,
    cycleLength: 28,
  });
  const [cycleWarning, setCycleWarning] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<CycleData>({
    resolver: zodResolver(formSchema),
    defaultValues: { cycleLength: 28, lutealPhaseLength: 14 },
  });

  const { reset, watch } = form;
  const { lastPeriodDate, cycleLength, lutealPhaseLength } = watch();

  useEffect(() => {
    if (!lastPeriodDate || !cycleLength) return;
    setCycleWarning(cycleLength > 35
      ? "Cycles longer than 35 days can sometimes indicate a hormonal imbalance. Worth mentioning to your doctor."
      : null);

    const lph = lutealPhaseLength ?? 14;
    const today = startOfDay(new Date());
    let currentCycleStart = startOfDay(new Date(lastPeriodDate));
    while (addDays(currentCycleStart, cycleLength) <= today) {
      currentCycleStart = addDays(currentCycleStart, cycleLength);
    }

    const allPredictedPeriods: Date[] = [];
    const allFertileWindows: Date[] = [];
    const allOvulationDays: Date[] = [];

    for (let i = 0; i < 3; i++) {
      const cycleStartDate = addDays(currentCycleStart, cycleLength * i);
      const nextPeriodStart = addDays(cycleStartDate, cycleLength);
      const ovulationDay = addDays(nextPeriodStart, -lph);
      allOvulationDays.push(ovulationDay);
      for (let j = 0; j <= 5; j++) allFertileWindows.push(subDays(ovulationDay, j));
      for (let j = 0; j < 5; j++) allPredictedPeriods.push(addDays(nextPeriodStart, j));
    }

    setPredictedPeriods(allPredictedPeriods);
    setFertileWindows(allFertileWindows);
    setOvulationDays(allOvulationDays);

    const upcomingPeriodStart = addDays(currentCycleStart, cycleLength);
    const nextPeriodIn = differenceInDays(upcomingPeriodStart, today);
    const dayOfCycle = differenceInDays(today, currentCycleStart) + 1;

    const periodEnd = addDays(currentCycleStart, 4);
    const ovDay = addDays(upcomingPeriodStart, -lph);
    let phase: CyclePhase = 'None';
    if (isWithinInterval(today, { start: currentCycleStart, end: periodEnd })) phase = 'Menstrual';
    else if (isWithinInterval(today, { start: addDays(periodEnd, 1), end: subDays(ovDay, 1) })) phase = 'Follicular';
    else if (isSameDay(today, ovDay)) phase = 'Ovulation';
    else if (isWithinInterval(today, { start: addDays(ovDay, 1), end: subDays(upcomingPeriodStart, 1) })) phase = 'Luteal';

    setSummary({
      nextPeriodIn: nextPeriodIn >= 0 ? `${nextPeriodIn}` : '0',
      nextPeriodDate: format(upcomingPeriodStart, 'MMM d'),
      currentPhase: phase,
      dayOfCycle,
      cycleLength,
    });
  }, [lastPeriodDate, cycleLength, lutealPhaseLength]);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('glowher-period-tracker');
      if (storedData) {
        const data = JSON.parse(storedData);
        data.lastPeriodDate = new Date(data.lastPeriodDate);
        reset(data);
        setIsSaved(true);
      } else {
        const userDetails = localStorage.getItem('glowher-user');
        if (userDetails) {
          const userData = JSON.parse(userDetails);
          if (userData.lastPeriodDate) {
            const initialData = { lastPeriodDate: new Date(userData.lastPeriodDate), cycleLength: 28, lutealPhaseLength: 14 };
            reset(initialData);
            localStorage.setItem('glowher-period-tracker', JSON.stringify(initialData));
            setIsSaved(true);
          }
        }
      }
    } catch (error) {
      console.error("Could not retrieve data from localStorage", error);
    }
  }, [reset]);

  function onSubmit(values: CycleData) {
    try {
      localStorage.setItem('glowher-period-tracker', JSON.stringify(values));
      setIsSaved(true);
      setShowSettings(false);
      toast({ title: "Cycle saved ✓", description: "Your predictions have been updated." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not save. Please try again." });
    }
  }

  const phase = phaseConfig[summary.currentPhase];
  const catMood = summary.currentPhase === 'Menstrual' ? 'sleepy'
    : summary.currentPhase === 'Ovulation' ? 'excited' : 'happy';

  const daysNum = parseInt(summary.nextPeriodIn);
  const heroLabel = isNaN(daysNum) ? 'SET UP YOUR CYCLE'
    : daysNum === 0 ? 'PERIOD TODAY!'
    : `${daysNum} DAYS LEFT`;

  return (
    <div className="min-h-screen flex flex-col relative" style={{
      background: 'linear-gradient(160deg, #e8e4f8 0%, #f0e8f5 35%, #fce4ec 70%, #f8eaf0 100%)',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 relative z-10">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 rounded-full bg-white/50 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white/80 transition-colors"
        >
          <Settings className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-sm font-bold text-slate-600 tracking-widest uppercase">GlowHer · Period</h1>
        <button className="w-10 h-10 rounded-full bg-white/50 backdrop-blur flex items-center justify-center shadow-sm">
          <span className="text-lg">🔔</span>
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mx-4 mb-4 bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-5 relative z-20 border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-base">Your cycle details</h2>
            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="lastPeriodDate" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Last period started</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn(
                          "w-full justify-start text-left font-normal border-purple-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl",
                          !field.value && "text-muted-foreground"
                        )}>
                          <CalendarIcon className="mr-2 h-4 w-4 text-purple-400" />
                          {field.value ? format(field.value, "MMMM d, yyyy") : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d > new Date()} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="cycleLength" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cycle length</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type="number" {...field} className="border-purple-200 pr-10 rounded-xl" />
                      </FormControl>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">days</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lutealPhaseLength" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
                      <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Luteal</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button"><Info className="h-3 w-3 text-slate-400" /></button>
                          </TooltipTrigger>
                          <TooltipContent><p className="max-w-xs text-xs">Time between ovulation and next period (usually 14 days).</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="relative">
                      <FormControl>
                        <Input type="number" placeholder="14" min="10" max="18" {...field} className="border-purple-200 pr-10 rounded-xl" />
                      </FormControl>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">days</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full rounded-xl text-white font-semibold shadow-md"
                style={{ background: 'linear-gradient(90deg, #e91e8c, #c44dff)' }}>
                {isSaved ? "Update predictions" : "Save & calculate"}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* Warning */}
      {cycleWarning && (
        <div className="mx-4 mb-2 relative z-10">
          <Alert className="border-amber-300 bg-amber-50/90 rounded-2xl">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 text-sm">Heads up</AlertTitle>
            <AlertDescription className="text-amber-700 text-xs">{cycleWarning}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-32 px-4 space-y-4 relative">
        <FloatingStickers />

        {/* TODAY */}
        {activeTab === 'today' && (
          <>
            {/* Hero card */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg mt-1 min-h-[180px]"
              style={{ background: 'linear-gradient(135deg, #c7bef5 0%, #e2c6f0 50%, #f5c6d8 100%)' }}>
              <div className="p-6 pb-4 pr-28">
                <p className="text-purple-700/80 text-[11px] font-bold uppercase tracking-widest mb-1">
                  {summary.currentPhase !== 'None' ? `${phase.emoji} ${phase.label} phase` : '🌸 Period Tracker'}
                </p>
                <h2 className="text-3xl font-black text-slate-800 leading-tight tracking-tight">
                  {heroLabel}
                </h2>
                {summary.nextPeriodDate !== '--' && (
                  <p className="text-slate-600/80 text-xs mt-1 font-medium">{summary.nextPeriodDate} · Next Period</p>
                )}
                <button
                  onClick={() => isSaved ? null : setShowSettings(true)}
                  className="mt-4 px-5 py-2 rounded-full text-white text-sm font-bold shadow-md active:scale-95 transition-transform"
                  style={{ background: 'linear-gradient(90deg, #e91e8c, #c44dff)' }}
                >
                  {isSaved ? '🩸 Period Starts' : 'Set up cycle →'}
                </button>
              </div>
              <div className="absolute bottom-0 right-2">
                <CatMascot mood={catMood} />
              </div>
              {/* decorative blobs */}
              <div className="absolute top-3 right-28 w-8 h-8 rounded-full bg-white/20" />
              <div className="absolute top-10 right-36 w-4 h-4 rounded-full bg-pink-300/30" />
            </div>

            {/* 3 stat cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl p-3 shadow-sm flex flex-col items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #d4cbf5, #e8c8f5)' }}>
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wide self-start">Cycle Day</p>
                <div className="relative w-14 h-14 my-1">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#e0d8f8" strokeWidth="4" />
                    <circle cx="22" cy="22" r="18" fill="none" stroke="url(#prog)" strokeWidth="4"
                      strokeDasharray={`${(summary.dayOfCycle / (summary.cycleLength || 28)) * 113} 113`}
                      strokeLinecap="round" />
                    <defs>
                      <linearGradient id="prog" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#e91e8c" />
                        <stop offset="100%" stopColor="#c44dff" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-base font-black text-slate-700">
                    {summary.dayOfCycle || '--'}
                  </span>
                </div>
                <p className="text-[10px] text-purple-500 font-medium">of {summary.cycleLength || 28}</p>
              </div>

              <div className="rounded-2xl p-3 shadow-sm bg-white/70 backdrop-blur flex flex-col items-center justify-center gap-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Next period</p>
                <p className="text-3xl font-black text-rose-500">{summary.nextPeriodIn !== '--' ? summary.nextPeriodIn : '--'}</p>
                <p className="text-[10px] text-slate-400">days away</p>
                <span className="text-lg">🩸</span>
              </div>

              <div className={cn("rounded-2xl p-3 shadow-sm flex flex-col justify-between", phase.bgColor)}>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Phase</p>
                <p className={cn("text-sm font-black leading-tight mt-1", phase.textColor)}>{phase.label}</p>
                <span className="text-2xl">{phase.emoji}</span>
              </div>
            </div>

            {/* Cycle timeline */}
            <div className="bg-white/75 backdrop-blur rounded-3xl p-4 shadow-sm">
              <p className="font-bold text-slate-800 text-sm">Today · Cycle Day {summary.dayOfCycle || '--'}</p>
              <p className="text-xs text-slate-400 mb-3">{summary.currentPhase !== 'None' ? phase.description : 'Set up your cycle to see predictions'}</p>
              <CycleTimeline dayOfCycle={summary.dayOfCycle || 0} cycleLength={summary.cycleLength || 28} phase={summary.currentPhase} />
              <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                {summary.nextPeriodDate !== '--' ? `Next period expected ${summary.nextPeriodDate}` : 'Enter your details above'}
              </p>
            </div>

            {/* Symptom CTA */}
            <div className="bg-white/75 backdrop-blur rounded-3xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">How are you feeling today?</p>
                <p className="text-xs text-slate-400 mt-0.5">Tell us about your body to get insights</p>
                <button
                  onClick={() => router.push('/log-symptoms')}
                  className="mt-3 px-5 py-2 rounded-full text-white text-sm font-bold shadow"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                >
                  Add Symptom
                </button>
              </div>
              <span className="text-5xl">😊</span>
            </div>

            {/* Phase tips */}
            <div className="bg-white/75 backdrop-blur rounded-3xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{phase.emoji}</span>
                <p className="font-bold text-slate-800 text-sm">{phase.label} — What your body needs</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {phase.tips.map((tip, i) => (
                  <div key={i} className={cn("rounded-2xl p-3", phase.bgColor)}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <tip.icon className={cn("h-3.5 w-3.5 flex-shrink-0", phase.textColor)} />
                      <p className={cn("text-xs font-bold", phase.textColor)}>{tip.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white/75 backdrop-blur rounded-3xl p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Calendar legend</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { color: 'bg-rose-400', label: 'Period', sub: '5 days' },
                  { color: 'bg-blue-400', label: 'Fertile window', sub: '6 days' },
                  { color: 'bg-emerald-500', label: 'Ovulation', sub: 'Peak day' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", item.color)} />
                    <span className="text-xs text-slate-600 font-medium">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="bg-white/80 backdrop-blur rounded-3xl p-4 shadow-sm mt-2">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-500" /> Cycle Calendar
            </h2>
            <div className="flex justify-center">
              <CalendarPicker
                mode="single"
                numberOfMonths={1}
                className="p-0"
                modifiers={{ predictedPeriod: predictedPeriods, fertileWindow: fertileWindows, ovulationDay: ovulationDays }}
                modifiersClassNames={{
                  predictedPeriod: 'bg-rose-400 text-white rounded-lg hover:bg-rose-500',
                  fertileWindow: 'bg-blue-100 text-blue-700 rounded-lg',
                  ovulationDay: '!bg-emerald-500 !text-white rounded-lg font-bold ring-2 ring-emerald-300',
                }}
              />
            </div>
            {!isSaved && (
              <p className="text-center text-xs text-slate-400 mt-4">Set up your cycle to see predictions on the calendar</p>
            )}
          </div>
        )}

        {/* SELF CARE */}
        {activeTab === 'selfcare' && (
          <div className="space-y-4 mt-2">
            <p className="font-bold text-slate-700 text-lg px-1 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-pink-500" /> Self Care
            </p>
            <div className="bg-amber-50/90 backdrop-blur rounded-3xl p-4 shadow-sm">
              <p className="font-bold text-slate-700 mb-3 text-sm">Menstrual cramps relief</p>
              {[
                { title: 'Period pain relief', duration: '12 min', emoji: '🧘‍♀️', bg: 'bg-amber-100' },
                { title: 'Foot massage to relieve cramps', duration: '6 min', emoji: '🦶', bg: 'bg-amber-100' },
              ].map((item) => (
                <div key={item.title} className={cn("rounded-2xl p-4 mb-2 flex items-center justify-between", item.bg)}>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.duration}</p>
                  </div>
                  <span className="text-3xl">{item.emoji}</span>
                </div>
              ))}
            </div>
            <div className="bg-white/80 backdrop-blur rounded-3xl p-4 shadow-sm">
              <p className="font-bold text-slate-700 mb-3 text-sm">Soundscapes</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Forest Adventure', gradient: 'from-green-400 to-teal-500', emoji: '🌲' },
                  { name: 'Forest Rain', gradient: 'from-blue-400 to-indigo-500', emoji: '🌧️' },
                  { name: 'Ocean Waves', gradient: 'from-cyan-400 to-blue-500', emoji: '🌊' },
                  { name: 'Night Crickets', gradient: 'from-purple-400 to-indigo-600', emoji: '🌙' },
                ].map((s) => (
                  <div key={s.name} className={cn("rounded-2xl p-4 bg-gradient-to-br text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity", s.gradient)}>
                    <span className="text-2xl block mb-1">{s.emoji}</span>
                    {s.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ANALYSIS */}
        {activeTab === 'analysis' && (
          <div className="space-y-4 mt-2">
            <p className="font-bold text-slate-700 text-lg px-1 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-500" /> Cycle Analysis
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-rose-50/90 rounded-3xl p-4 shadow-sm">
                <span className="text-2xl">🩸</span>
                <p className="text-3xl font-black text-rose-500 mt-2">{isSaved ? '5' : '--'}</p>
                <p className="text-xs text-rose-400 font-semibold mt-0.5">Average period</p>
                <p className="text-[10px] text-slate-400">days</p>
              </div>
              <div className="bg-amber-50/90 rounded-3xl p-4 shadow-sm">
                <span className="text-2xl">🔄</span>
                <p className="text-3xl font-black text-amber-500 mt-2">{isSaved ? `${cycleLength || 28}` : '--'}</p>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">Average cycle</p>
                <p className="text-[10px] text-slate-400">days</p>
              </div>
            </div>
            {!isSaved && (
              <div className="bg-white/80 backdrop-blur rounded-3xl p-5 shadow-sm text-center">
                <span className="text-4xl">📊</span>
                <p className="font-bold text-slate-700 mt-2">Log periods to unlock analysis</p>
                <p className="text-xs text-slate-400 mt-1">Set up your cycle to start tracking</p>
                <button
                  onClick={() => { setShowSettings(true); setActiveTab('today'); }}
                  className="mt-3 px-5 py-2 rounded-full text-white text-sm font-bold"
                  style={{ background: 'linear-gradient(90deg, #e91e8c, #c44dff)' }}
                >
                  Set up cycle
                </button>
              </div>
            )}
            {isSaved && lastPeriodDate && (
              <div className="bg-white/80 backdrop-blur rounded-3xl p-4 shadow-sm">
                <p className="font-bold text-slate-700 mb-1 text-sm">History</p>
                <p className="text-xs text-slate-400 mb-3">1 cycle logged</p>
                <div className="flex gap-2 mb-2">
                  {['All', 'Period', 'Ovulation', 'Fertile'].map((f) => (
                    <span key={f} className={cn(
                      "text-xs px-3 py-1 rounded-full font-semibold cursor-pointer",
                      f === 'All' ? 'text-white' : 'bg-slate-100 text-slate-500'
                    )} style={f === 'All' ? { background: 'linear-gradient(90deg, #e91e8c, #c44dff)' } : {}}>
                      {f}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-600 mt-3 mb-2">2026</p>
                <p className="text-xs text-slate-500 mb-2">{format(lastPeriodDate, 'MMM d')} – {format(addDays(lastPeriodDate, 4), 'MMM d')}</p>
                <CycleTimeline dayOfCycle={5} cycleLength={cycleLength || 28} phase="Menstrual" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-5">
        <div className="max-w-lg mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 px-2 py-2 flex items-center justify-around">
            {([
              { id: 'today', icon: Home, label: 'Today' },
              { id: 'calendar', icon: Calendar, label: 'Calendar' },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={cn("flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all", activeTab === id ? "bg-pink-50" : "")}>
                <Icon className={cn("w-5 h-5", activeTab === id ? "text-pink-500" : "text-slate-400")} />
                <span className={cn("text-[10px] font-semibold", activeTab === id ? "text-pink-500" : "text-slate-400")}>{label}</span>
              </button>
            ))}

            <button
              onClick={() => router.push('/log-symptoms')}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg -mt-5 active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #e91e8c, #c44dff)' }}
            >
              <Plus className="w-6 h-6 text-white" />
            </button>

            {([
              { id: 'selfcare', icon: HeartPulse, label: 'Self Care' },
              { id: 'analysis', icon: BarChart2, label: 'Analysis' },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={cn("flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all", activeTab === id ? "bg-pink-50" : "")}>
                <Icon className={cn("w-5 h-5", activeTab === id ? "text-pink-500" : "text-slate-400")} />
                <span className={cn("text-[10px] font-semibold", activeTab === id ? "text-pink-500" : "text-slate-400")}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
