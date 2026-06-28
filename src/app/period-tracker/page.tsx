"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, startOfDay, differenceInDays, isWithinInterval, isSameDay, subDays } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Info, Heart, Brain, Dumbbell, Utensils, Shield, CheckCircle2, Calendar as CalendarIconMini, CircleDotDashed, Activity, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AppSidebar } from '@/components/glowher/AppSidebar';

const formSchema = z.object({
  lastPeriodDate: z.date({ required_error: "Last period date is required." }),
  cycleLength: z.coerce.number().min(21, "Cycle must be at least 21 days").max(45, "Cycles over 45 days are uncommon."),
  lutealPhaseLength: z.coerce.number().min(10, "Luteal phase is usually 10-18 days").max(18, "Luteal phase is usually 10-18 days").optional(),
});

type CycleData = z.infer<typeof formSchema>;
type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'None';

const phaseConfig: Record<CyclePhase, {
  label: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  description: string;
  tips: { icon: React.ElementType; title: string; text: string }[];
}> = {
  Menstrual: {
    label: "Menstrual Phase",
    emoji: "🌙",
    gradient: "from-rose-500 to-pink-600",
    accentColor: "#f43f5e",
    textColor: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    description: "Days 1–5 · Rest, restore, release",
    tips: [
      { icon: Utensils, title: "Nourish", text: "Iron-rich foods like spinach, lentils, and dark chocolate help replenish what's lost. Stay hydrated with herbal teas." },
      { icon: Activity, title: "Move gently", text: "Light yoga, stretching, or slow walks are your best friends. Honor your body's need for rest." },
      { icon: Heart, title: "Ease discomfort", text: "A warm compress on your abdomen works wonders. Magnesium supplements may reduce cramping." },
      { icon: Brain, title: "Rest & reflect", text: "Your intuition is sharp right now. Journal, slow down, and be compassionate with yourself." },
    ],
  },
  Follicular: {
    label: "Follicular Phase",
    emoji: "🌱",
    gradient: "from-violet-500 to-purple-600",
    accentColor: "#8b5cf6",
    textColor: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    description: "Days 6–13 · Rise, renew, begin",
    tips: [
      { icon: Utensils, title: "Fuel up", text: "Lean proteins and complex carbs like quinoa and oats support your rising energy levels beautifully." },
      { icon: Activity, title: "Build momentum", text: "Energy is climbing — try dance, brisk walks, or finally start that class you've been putting off." },
      { icon: Brain, title: "Create & plan", text: "Mental clarity peaks here. Ideal time for brainstorming, setting intentions, and tackling big projects." },
      { icon: Shield, title: "Glow up", text: "Your skin is often at its clearest. A simple, hydrating routine is all you need to shine." },
    ],
  },
  Ovulation: {
    label: "Ovulation Phase",
    emoji: "✨",
    gradient: "from-amber-400 to-orange-500",
    accentColor: "#f59e0b",
    textColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "Day 14 · Peak energy, peak power",
    tips: [
      { icon: Utensils, title: "Antioxidants", text: "Load up on berries, leafy greens, and fiber-rich foods to support hormone processing and liver function." },
      { icon: Activity, title: "Go hard", text: "You're at your peak! HIIT, running, heavy lifting — your body is ready for whatever you throw at it." },
      { icon: Heart, title: "Connect", text: "Confidence and charisma are naturally high. Social events, dates, and important conversations feel effortless." },
      { icon: Brain, title: "Speak up", text: "Verbal expression is at its peak. Use this window for negotiations, presentations, and pitches." },
    ],
  },
  Luteal: {
    label: "Luteal Phase",
    emoji: "🍂",
    gradient: "from-teal-500 to-emerald-600",
    accentColor: "#14b8a6",
    textColor: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    description: "Days 15–28 · Wind down, turn inward",
    tips: [
      { icon: Utensils, title: "Manage PMS", text: "Magnesium-rich foods (dark chocolate, nuts) and B-vitamins ease mood swings. Cut caffeine and salt." },
      { icon: Activity, title: "Ease off", text: "Swap intense workouts for Pilates, swimming, or a restorative yoga class. Rest is productive too." },
      { icon: Heart, title: "Body care", text: "Bloating and breast tenderness are common. Increase water intake and wear comfortable clothing." },
      { icon: Brain, title: "Self-care", text: "Turn inward — a bath, a book, a comforting film. This phase calls for cozy, not productive." },
    ],
  },
  None: {
    label: "Start Tracking",
    emoji: "🌸",
    gradient: "from-pink-400 to-rose-500",
    accentColor: "#ec4899",
    textColor: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    description: "Enter your details to get started",
    tips: [
      { icon: Heart, title: "Track your cycle", text: "Enter your last period date to unlock personalized insights for every phase of your cycle." },
      { icon: Brain, title: "Understand patterns", text: "Your cycle reveals a lot about your health. Tracking helps you spot what's normal for you." },
      { icon: Dumbbell, title: "Sync your lifestyle", text: "Align your workouts, diet, and social energy with your natural rhythm for less resistance." },
      { icon: Utensils, title: "Eat with your cycle", text: "Different phases call for different nutrients. Let your body guide your plate." },
    ],
  },
};

export default function PeriodTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [predictedPeriods, setPredictedPeriods] = useState<Date[]>([]);
  const [fertileWindows, setFertileWindows] = useState<Date[]>([]);
  const [ovulationDays, setOvulationDays] = useState<Date[]>([]);
  const [summary, setSummary] = useState({
    nextPeriodIn: '--',
    currentPhase: 'None' as CyclePhase,
    dayOfCycle: '--',
    symptoms: 'No',
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

    setCycleWarning(
      cycleLength > 35
        ? "Cycles longer than 35 days can sometimes indicate a hormonal imbalance. Worth mentioning to your doctor."
        : null
    );

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

    let symptomsToday = 'No';
    try {
      const log = localStorage.getItem(`glowher-log-${format(today, 'yyyy-MM-dd')}`);
      if (log) {
        const parsedLog = JSON.parse(log);
        const allSymptoms = [...(parsedLog.symptoms ?? []), parsedLog.otherSymptom].filter(Boolean);
        if (allSymptoms.length > 0) symptomsToday = 'Yes';
      }
    } catch (e) {
      console.warn("Could not read symptom log from localStorage", e);
    }

    setSummary({
      nextPeriodIn: nextPeriodIn >= 0 ? `${nextPeriodIn}` : '0',
      currentPhase: phase,
      dayOfCycle: `${dayOfCycle}`,
      symptoms: symptomsToday,
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
      toast({ title: "Cycle saved ✓", description: "Your predictions have been updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save. Please try again." });
    }
  }

  const phase = phaseConfig[summary.currentPhase];

  const statCards = [
    {
      label: "Next period",
      value: summary.nextPeriodIn === '--' ? '--' : `${summary.nextPeriodIn}d`,
      sub: "days away",
      icon: CircleDotDashed,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      label: "Current phase",
      value: summary.currentPhase === 'None' ? '–' : summary.currentPhase,
      sub: phase.description,
      icon: CalendarIconMini,
      color: phase.textColor,
      bg: phase.bgColor,
    },
    {
      label: "Cycle day",
      value: summary.dayOfCycle,
      sub: `of ${cycleLength ?? 28} days`,
      icon: Sparkles,
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
    {
      label: "Symptoms today",
      value: summary.symptoms,
      sub: "tap to log",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      onClick: () => router.push('/log-symptoms'),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#fdf6f9] text-slate-800">
      <AppSidebar />
      <main className="flex-1 px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">🌸</span>
            <h1 className="font-headline text-4xl font-bold text-slate-900">Period Tracker</h1>
          </div>
          <p className="text-slate-500 ml-12">Know your body. Own your rhythm.</p>
        </div>

        {cycleWarning && (
          <Alert className="mb-6 border-amber-300 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Irregular cycle detected</AlertTitle>
            <AlertDescription className="text-amber-700">{cycleWarning}</AlertDescription>
          </Alert>
        )}

        {/* Phase Hero Banner */}
        {summary.currentPhase !== 'None' && (
          <div className={`mb-8 rounded-2xl bg-gradient-to-r ${phase.gradient} p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-1">You are in</p>
                <h2 className="text-3xl font-bold">{phase.emoji} {phase.label}</h2>
                <p className="text-white/80 mt-1">{phase.description}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-white/70 text-sm">Day of cycle</p>
                <p className="text-5xl font-bold">{summary.dayOfCycle}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              onClick={stat.onClick}
              className={cn(
                "rounded-2xl p-4 border border-white shadow-sm transition-all",
                stat.bg,
                stat.onClick && "cursor-pointer hover:shadow-md hover:scale-[1.02]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Left: Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-headline text-xl font-bold text-slate-800 mb-1">Your cycle details</h2>
              <p className="text-sm text-slate-400 mb-6">Update anytime to refine your predictions.</p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="lastPeriodDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-medium text-slate-700">Last period started</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal border-slate-200 hover:border-pink-300 hover:bg-pink-50 transition-colors",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-pink-400" />
                                {field.value ? format(field.value, "MMMM d, yyyy") : "Pick a date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cycleLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">Average cycle length</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              className="border-slate-200 pr-12 focus:border-pink-300 focus:ring-pink-200"
                            />
                          </FormControl>
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">days</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lutealPhaseLength"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-sm font-medium text-slate-700">Luteal phase length</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" onClick={(e) => e.preventDefault()}>
                                  <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-xs">Time between ovulation and your next period. Usually 10–18 days. Most people have 14.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Default: 14"
                              min="10"
                              max="18"
                              {...field}
                              className="border-slate-200 pr-12 focus:border-pink-300 focus:ring-pink-200"
                            />
                          </FormControl>
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">days</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md"
                  >
                    {isSaved ? "Update predictions" : "Save & calculate"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-slate-500 hover:text-slate-700"
                    onClick={() => router.push('/settings')}
                  >
                    Edit personal details
                  </Button>
                </form>
              </Form>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Calendar legend</h3>
              <div className="space-y-2.5">
                {[
                  { color: "bg-rose-400", label: "Predicted period", sub: "5-day window" },
                  { color: "bg-blue-400", label: "Fertile window", sub: "6 days before ovulation" },
                  { color: "bg-emerald-500", label: "Ovulation day", sub: "Peak fertility" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full flex-shrink-0 ${item.color}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Calendar + Tips */}
          <div className="lg:col-span-3 space-y-6">

            {/* Calendar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-headline text-xl font-bold text-slate-800 mb-4">Cycle calendar</h2>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  numberOfMonths={1}
                  className="p-0"
                  modifiers={{
                    predictedPeriod: predictedPeriods,
                    fertileWindow: fertileWindows,
                    ovulationDay: ovulationDays,
                  }}
                  modifiersClassNames={{
                    predictedPeriod: 'bg-rose-400 text-white rounded-lg hover:bg-rose-500',
                    fertileWindow: 'bg-blue-100 text-blue-700 rounded-lg',
                    ovulationDay: '!bg-emerald-500 !text-white rounded-lg font-bold ring-2 ring-emerald-300',
                  }}
                />
              </div>
            </div>

            {/* Phase Tips */}
            <div className={cn("rounded-2xl border p-6", phase.bgColor, phase.borderColor)}>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">{phase.emoji}</span>
                <div>
                  <h2 className={cn("font-bold text-lg", phase.textColor)}>{phase.label} — What your body needs</h2>
                  <p className="text-sm text-slate-500">{phase.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {phase.tips.map((tip, i) => (
                  <div key={i} className="bg-white/70 rounded-xl p-4 border border-white shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("p-1.5 rounded-lg", phase.bgColor)}>
                        <tip.icon className={cn("h-4 w-4", phase.textColor)} />
                      </div>
                      <h3 className={cn("font-semibold text-sm", phase.textColor)}>{tip.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Log Symptoms CTA */}
            <button
              onClick={() => router.push('/log-symptoms')}
              className="w-full flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-pink-200 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-50 rounded-xl">
                  <Heart className="h-5 w-5 text-pink-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Log today's symptoms</p>
                  <p className="text-sm text-slate-400">Track how you're feeling day by day</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-pink-400 transition-colors" />
            </button>

          </div>
        </div>
      </main>
    </div>
  );
}
