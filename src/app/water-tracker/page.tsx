
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, differenceInDays, startOfDay, isWithinInterval, isSameDay, subDays, differenceInHours } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronLeft, Droplet, Plus, Minus, GlassWater, Info, Goal, History, Bell, Flame, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WaterLogHistory } from '@/components/glowher/WaterLogHistory';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AppSidebar } from '@/components/glowher/AppSidebar';


const settingsFormSchema = z.object({
  goal: z.coerce.number().min(1, "Goal must be at least 1.").positive(),
});

const reminderFormSchema = z.object({
    remindersEnabled: z.boolean(),
    reminderFrequency: z.coerce.number(), // in hours
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;
type ReminderFormData = z.infer<typeof reminderFormSchema>;
type Unit = 'cups' | 'ml' | 'oz';
type WaterLogEntry = { time: string; amount: number }; // amount in cups
type DailyLog = {
    entries: WaterLogEntry[];
};


const unitConversions = {
  cups: 1,
  ml: 236.588,
  oz: 8,
};

const phaseTips: { [key: string]: string } = {
    Menstrual: "Herbal teas count! Try raspberry leaf or ginger tea to soothe cramps and stay hydrated.",
    Follicular: "Your energy is rising. Match it with consistent hydration to support your body's preparation for ovulation.",
    Ovulatory: "You might be more active now. Add an extra glass or two, especially if you're exercising.",
    Luteal: "Feeling bloated? It sounds counterintuitive, but drinking more water helps flush out excess sodium and reduce puffiness."
};

const motivationalMessages = [
    "Great job!",
    "Keep it up!",
    "You're doing amazing!",
    "One step closer to your goal!",
    "Way to hydrate!",
    "Every sip counts!",
    "Fantastic work!",
];

const achievementTiers = [
    { streak: 3, title: "Hydration Starter", description: "3-day streak!" },
    { streak: 7, title: "Hydration Habit", description: "7-day streak!" },
    { streak: 14, title: "Hydration Pro", description: "14-day streak!" },
    { streak: 30, title: "Hydration Hero", description: "30-day streak!" },
];

const LOCAL_STORAGE_PREFIX = 'glowher-water-tracker-';
const REMINDER_SOUND_URL = '/sounds/water-drop.mp3';

export default function WaterTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentDateKey, setCurrentDateKey] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dailyLog, setDailyLog] = useState<DailyLog>({ entries: [] });
  const [goal, setGoal] = useState(8); // Always stored in cups
  const [unit, setUnit] = useState<Unit>('cups');
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hydrationStreak, setHydrationStreak] = useState(0);


  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      goal: 8,
    },
  });

  const reminderForm = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
        remindersEnabled: false,
        reminderFrequency: 2,
    },
  });

  const calculateStreak = () => {
    try {
        let streak = 0;
        const today = startOfDay(new Date());
        let dailyGoal = 8;
        
        const savedSettings = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}settings`);
        if (savedSettings) {
            dailyGoal = JSON.parse(savedSettings).goal || 8;
        }

        // Check today's log first. If today's goal isn't met, streak is 0.
        const todayLogData = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${format(today, 'yyyy-MM-dd')}`);
        if(todayLogData) {
            const todayLog: DailyLog = JSON.parse(todayLogData);
            const todayIntake = todayLog.entries?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
            if (todayIntake >= dailyGoal) {
                streak = 1;
            }
        }
        
        // If today's goal was met, check previous days
        if (streak > 0) {
            for (let i = 1; i <= 30; i++) {
                const dateToCheck = subDays(today, i);
                const dateKey = format(dateToCheck, 'yyyy-MM-dd');
                const logData = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${dateKey}`);

                if (logData) {
                    const log: DailyLog = JSON.parse(logData);
                    const totalIntake = log.entries?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
                    if (totalIntake >= dailyGoal) {
                        streak++;
                    } else {
                        break; // Streak broken because goal not met
                    }
                } else {
                    break; // Streak broken because a day was missed
                }
            }
        }

        setHydrationStreak(streak);
    } catch (e) {
        console.error("Error calculating streak:", e);
    }
};

  useEffect(() => {
    // Initialize audio on client
    if (typeof window !== 'undefined') {
        audioRef.current = new Audio(REMINDER_SOUND_URL);
    }
    
    // Load settings from local storage
    try {
        const savedSettings = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}settings`);
        if (savedSettings) {
            const { goal: savedGoal, unit: savedUnit } = JSON.parse(savedSettings);
            if (savedGoal && savedUnit) {
                setGoal(savedGoal);
                setUnit(savedUnit);
                settingsForm.setValue('goal', Math.round(savedGoal * unitConversions[savedUnit]));
            }
        }
        const savedReminders = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}reminders`);
        if (savedReminders) {
            reminderForm.reset(JSON.parse(savedReminders));
        }
    } catch(e) { console.error("Error loading settings:", e)}
    
    // Load today's intake
    try {
        const savedLog = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${currentDateKey}`);
        if (savedLog) {
            setDailyLog(JSON.parse(savedLog));
        } else {
            setDailyLog({ entries: [] });
        }
    } catch(e) { console.error("Error loading daily log:", e)}

    // Determine current cycle phase
    try {
        const periodData = localStorage.getItem('glowher-period-tracker');
        if (periodData) {
            const data = JSON.parse(periodData);
            const today = startOfDay(new Date());
            const lastPeriod = startOfDay(new Date(data.lastPeriodDate));
            const cycleLength = data.cycleLength;
            const lutealPhase = data.lutealPhaseLength || 14;

            let currentCycleStartDate = lastPeriod;
            while (addDays(currentCycleStartDate, cycleLength) <= today) {
                currentCycleStartDate = addDays(currentCycleStartDate, cycleLength);
            }
            
            const nextPeriodStart = addDays(currentCycleStartDate, cycleLength);
            const ovulationDay = addDays(nextPeriodStart, -lutealPhase);
            const periodEnd = addDays(currentCycleStartDate, 4);

            if (isWithinInterval(today, { start: currentCycleStartDate, end: periodEnd })) {
              setCurrentPhase("Menstrual");
            } else if (isWithinInterval(today, { start: addDays(periodEnd, 1), end: addDays(ovulationDay, -1) })) {
              setCurrentPhase("Follicular");
            } else if (isSameDay(today, ovulationDay)) {
                setCurrentPhase("Ovulatory");
            } else if (isWithinInterval(today, { start: addDays(ovulationDay, 1), end: addDays(nextPeriodStart, -1) })) {
              setCurrentPhase("Luteal");
            }
        }
    } catch(e) { console.error("Error determining cycle phase:", e)}
    
    calculateStreak();

  }, [currentDateKey, settingsForm, reminderForm]);

  const playReminderSound = () => {
    if (audioRef.current) {
        audioRef.current.play().catch(error => console.error("Audio playback failed:", error));
    }
  };

  useEffect(() => {
    try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${currentDateKey}`, JSON.stringify(dailyLog));
    } catch(e) { console.error(e) }

    // Reminder logic
    const reminderSettings = reminderForm.getValues();
    if (reminderSettings.remindersEnabled) {
      let shouldRemind = false;
      let reminderMessage = "";

      if (dailyLog.entries.length > 0) {
          const lastEntryTime = new Date(dailyLog.entries[dailyLog.entries.length - 1].time);
          const hoursSinceLast = differenceInHours(new Date(), lastEntryTime);
          if (hoursSinceLast >= reminderSettings.reminderFrequency) {
            shouldRemind = true;
            reminderMessage = `It's been over ${reminderSettings.reminderFrequency} hours. Time for some water!`;
          }
      } else {
          // Initial reminder if no water logged today
          const now = new Date();
          if (now.getHours() >= 9) { // Only remind after 9am
            shouldRemind = true;
            reminderMessage = "Don't forget to start your day with a glass of water!";
          }
      }

      if(shouldRemind) {
        toast({
            title: "Thirsty?",
            description: reminderMessage,
        });
        playReminderSound();
      }
    }
  }, [dailyLog, currentDateKey, reminderForm, toast]);

  const handleSetUnit = (newUnit: Unit) => {
    const oldGoalInCups = goal;
    const newGoalForDisplay = oldGoalInCups * unitConversions[newUnit];
    setUnit(newUnit);
    settingsForm.setValue('goal', Math.round(newGoalForDisplay));
    saveSettings(oldGoalInCups, newUnit);
  };
  
  const saveSettings = (goalInCups: number, unit: Unit) => {
    try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}settings`, JSON.stringify({ goal: goalInCups, unit }));
    } catch (e) {
        console.error(e)
    }
  };

  const onSettingsSubmit = (data: SettingsFormData) => {
    const newGoalInCups = data.goal / unitConversions[unit];
    setGoal(newGoalInCups);
    saveSettings(newGoalInCups, unit);
    toast({
      title: "Goal Saved!",
      description: `Your new daily goal is set.`,
    });
  };

  const onReminderSubmit = (data: ReminderFormData) => {
    try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}reminders`, JSON.stringify(data));
        toast({
            title: "Reminder Settings Saved!",
            description: `Your preferences have been updated.`,
        });
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: 'Could not save reminder settings.' });
    }
  };


  const totalIntake = dailyLog.entries.reduce((sum, entry) => sum + entry.amount, 0);

  const changeIntake = (amount: number) => { // amount is always in cups
    if (amount < 0 && totalIntake <= 0) return;

    const newEntry: WaterLogEntry = { time: new Date().toISOString(), amount };
    let newEntries: WaterLogEntry[];

    if (amount < 0) {
      const positiveEntries = dailyLog.entries.filter(e => e.amount > 0);
      positiveEntries.pop(); // Remove the last positive entry
      newEntries = positiveEntries;
    } else {
        newEntries = [...dailyLog.entries, newEntry];
    }
    
    setDailyLog({ entries: newEntries });
    calculateStreak();


    if (amount > 0) {
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        const newTotalIntake = newEntries.reduce((sum, entry) => sum + entry.amount, 0);
        toast({
            title: randomMessage,
            description: `You've logged ${Math.round(newTotalIntake * unitConversions[unit])} ${unit} so far.`,
        });
    }
  };
  
  const intakeInCurrentUnit = totalIntake * unitConversions[unit];
  const goalInCurrentUnit = goal * unitConversions[unit];
  const progress = goal > 0 ? (totalIntake / goal) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-white text-slate-800">
        <div className="flex">
            <AppSidebar />
            <main className="flex-1 flex-grow container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-slate-900">Water Intake Tracker</h1>
                    <p className="mt-2 text-lg text-slate-600">Hydration is key to feeling your best. Log your water here.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="shadow-lg bg-white/70 backdrop-blur-md border-white/20">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <GlassWater className="text-sky-500" /> Today's Progress ({format(new Date(currentDateKey), "PPP")})
                                </CardTitle>
                                <CardDescription className="text-slate-700">
                                    Your goal is {Math.round(goalInCurrentUnit)} {unit}. You've had {Math.round(intakeInCurrentUnit)} {unit}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center space-y-6">
                                <div className="w-full relative">
                                    <Progress value={progress} className="h-8 bg-sky-100 [&>span]:bg-sky-500" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-bold text-white drop-shadow-md">{Math.round(progress)}%</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-center">
                                    {Array.from({ length: Math.ceil(goal) }).map((_, i) => (
                                        <Droplet key={i} className={cn("h-10 w-10 md:h-12 md:w-12 transition-all duration-500 ease-in-out", i < totalIntake ? "text-sky-400 fill-sky-400" : "text-slate-300")} />
                                    ))}
                                </div>

                                <div className="flex md:flex items-center justify-center gap-4 pt-4">
                                    <Button size="lg" variant="outline" onClick={() => changeIntake(-1)} disabled={totalIntake <= 0} className="bg-white/50 border-slate-300 hover:bg-white">
                                        <Minus className="mr-2 h-5 w-5"/> Remove Cup
                                    </Button>
                                    <Button size="lg" onClick={() => changeIntake(1)} className="bg-sky-500 text-white hover:bg-sky-600">
                                        <Plus className="mr-2 h-5 w-5"/> Add Cup
                                    </Button>
                                </div>
                                {currentPhase && phaseTips[currentPhase] && (
                                    <Alert className="mt-6 bg-blue-100/50 border-blue-400/50 text-slate-800 [&>svg]:text-sky-500">
                                        <Info className="h-4 w-4" />
                                        <AlertTitle>Tip for your {currentPhase} Phase</AlertTitle>
                                        <AlertDescription>
                                            {phaseTips[currentPhase]}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                        <div className="bg-white/70 backdrop-blur-md border-white/20 p-4 rounded-lg">
                            <WaterLogHistory />
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <Card className="shadow-lg bg-white/70 backdrop-blur-md border-white/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Goal className="text-sky-500"/> Your Goal</CardTitle>
                                <CardDescription className="text-slate-700">Set your daily hydration target.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...settingsForm}>
                                    <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                                        <div className="space-y-2">
                                            <FormLabel>Unit</FormLabel>
                                            <Tabs defaultValue={unit} onValueChange={(value) => handleSetUnit(value as Unit)} className="w-full">
                                                <TabsList className="grid w-full grid-cols-3 bg-blue-100/60 text-sky-800">
                                                    <TabsTrigger value="cups" className="data-[state=active]:bg-white data-[state=active]:text-sky-600 data-[state=active]:shadow-md">Cups</TabsTrigger>
                                                    <TabsTrigger value="ml" className="data-[state=active]:bg-white data-[state=active]:text-sky-600 data-[state=active]:shadow-md">ml</TabsTrigger>
                                                    <TabsTrigger value="oz" className="data-[state=active]:bg-white data-[state=active]:text-sky-600 data-[state=active]:shadow-md">oz</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </div>
                                        <FormField
                                            control={settingsForm.control}
                                            name="goal"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Daily Goal ({unit})</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="bg-white/80" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full bg-sky-500 text-white hover:bg-sky-600">Save Goal</Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                        
                        <Card className="shadow-lg bg-white/70 backdrop-blur-md border-white/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Bell className="text-sky-500"/> Hydration Reminders</CardTitle>
                                <CardDescription className="text-slate-700">Get notified to keep up with your goal.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...reminderForm}>
                                    <form onChange={reminderForm.handleSubmit(onReminderSubmit)} className="space-y-6">
                                        <FormField
                                            control={reminderForm.control}
                                            name="remindersEnabled"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-300 p-3 shadow-sm bg-white/20">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Enable Reminders</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="data-[state=checked]:bg-sky-500"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={reminderForm.control}
                                            name="reminderFrequency"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Remind Me Every...</FormLabel>
                                                <Select 
                                                    onValueChange={field.onChange} 
                                                    defaultValue={String(field.value)}
                                                    disabled={!reminderForm.getValues("remindersEnabled")}
                                                >
                                                    <FormControl>
                                                    <SelectTrigger className="bg-white/80">
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="1">1 Hour</SelectItem>
                                                        <SelectItem value="2">2 Hours</SelectItem>
                                                        <SelectItem value="3">3 Hours</SelectItem>
                                                        <SelectItem value="4">4 Hours</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                        
                        <Card className="shadow-lg bg-white/70 backdrop-blur-md border-white/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Award className="text-sky-500" /> Achievements</CardTitle>
                                <CardDescription className="text-slate-700">Keep up the great work!</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-center text-lg font-bold bg-blue-100/60 p-3 rounded-lg text-sky-800">
                                    <Flame className="mr-2 h-5 w-5 text-red-500" />
                                    {hydrationStreak > 0 ? `${hydrationStreak}-Day Hydration Streak!` : "Start a new streak today!"}
                                </div>
                                <div className="space-y-2">
                                    {achievementTiers.map((tier) => (
                                        <div key={tier.streak} className={cn(
                                            "flex items-center gap-3 p-2 rounded-md transition-opacity",
                                            hydrationStreak >= tier.streak ? "opacity-100 bg-blue-100/60" : "opacity-50"
                                        )}>
                                            <Award className={cn("h-6 w-6", hydrationStreak >= tier.streak ? "text-red-500 fill-red-500" : "text-slate-400")} />
                                            <div className={cn(hydrationStreak >= tier.streak && "font-bold text-slate-800")}>
                                                <p className="font-semibold">{tier.title}</p>
                                                <p className="text-xs text-slate-600">{tier.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg bg-white/70 backdrop-blur-md border-white/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><History className="text-sky-500"/> Daily Log</CardTitle>
                                <CardDescription className="text-slate-700">Your intake for {format(new Date(currentDateKey), "PPP")}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {dailyLog.entries.filter(e => e.amount > 0).length > 0 ? (
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        {dailyLog.entries.filter(e => e.amount > 0).map((entry, index) => (
                                            <li key={index} className="flex justify-between border-b border-slate-300 pb-1">
                                                <span>{format(new Date(entry.time), 'p')}</span>
                                                <span className="font-medium text-slate-800">
                                                    +1 Cup
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-center text-slate-600 py-4">No water logged yet today.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Button
                size="icon"
                className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg md:hidden bg-sky-500 hover:bg-sky-600 text-white"
                onClick={() => changeIntake(1)}
                aria-label="Add a cup of water"
            >
                <Plus className="h-8 w-8" />
            </Button>
        </div>
    </div>
  );
}
