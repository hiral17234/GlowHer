
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, subDays, isSameDay, addDays, isWithinInterval, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, ChevronLeft, Bed, Star, BookText, Moon, Award, Info, Sparkles, AlertTriangle, History } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { SleepLogHistory } from '@/components/glowher/SleepLogHistory';
import { AppSidebar } from '@/components/glowher/AppSidebar';


const FormSchema = z.object({
  logDate: z.date({
    required_error: "A date is required.",
  }),
  sleepDuration: z.array(z.number()).min(1, { message: "Please select your sleep duration." }),
  sleepQuality: z.array(z.number()).min(1, { message: "Please rate your sleep quality." }),
  notes: z.string().max(300, { message: "Notes must be 300 characters or less." }).optional(),
});

type FormData = z.infer<typeof FormSchema>;

const LOCAL_STORAGE_KEY_PREFIX = 'glowher-sleep-log-';

export type SleepLog = {
    logDate: string;
    sleepDuration: number[];
    sleepQuality: number[];
    notes?: string;
}

const phaseTips: { [key: string]: { title: string; tip: string } } = {
    Menstrual: { title: "Sleep & Your Menstrual Phase", tip: "Your body is working hard. Try going to bed a little earlier to support recovery and manage fatigue." },
    Follicular: { title: "Sleep & Your Follicular Phase", tip: "As energy returns, consistent sleep helps regulate hormones for the upcoming cycle events. Aim for 7-9 hours." },
    Ovulatory: { title: "Sleep & Your Ovulatory Phase", tip: "A slight rise in body temperature can sometimes disrupt sleep. Keep your bedroom cool and comfortable." },
    Luteal: { title: "Sleep & Your Luteal Phase", tip: "Rising progesterone can make you feel more tired. This is a key time to prioritize rest and wind down before bed." }
};

const qualityOptions = [
    { value: 2, label: 'Poor', icon: '😩' },
    { value: 5, label: 'Fair', icon: '😐' },
    { value: 8, label: 'Good', icon: '🙂' },
    { value: 10, label: 'Excellent', icon: '😴' },
  ];

export default function SleepTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentPhase, setCurrentPhase] = useState<keyof typeof phaseTips | null>(null);
  const [achievements, setAchievements] = useState<{ star: boolean, queen: boolean }>({ star: false, queen: false });
  const [logKey, setLogKey] = useState(0);
  const [recentLogs, setRecentLogs] = useState<SleepLog[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      logDate: subDays(new Date(), 1), // Default to yesterday
      sleepDuration: [8],
      sleepQuality: [8],
      notes: "",
    },
  });
  
  const logDate = form.watch("logDate");
  const notesValue = form.watch("notes");
  const sleepDurationValue = form.watch("sleepDuration");
  const sleepQualityValue = form.watch("sleepQuality");

  const getQualityLabel = (value: number) => {
    return qualityOptions.find(q => q.value <= value)?.label ?? 'Fair';
  };


  const calculateAchievements = () => {
    try {
        let goodSleepStreak = 0;
        let consistentQualityStreak = 0;
        const today = startOfDay(new Date());

        // Check for 3-day streak of 8+ hours
        for (let i = 0; i < 3; i++) {
            const dateToCheck = subDays(today, i);
            const dateKey = format(dateToCheck, 'yyyy-MM-dd');
            const logData = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${dateKey}`);
            if (logData) {
                const log: FormData = JSON.parse(logData);
                if (log.sleepDuration[0] >= 8) {
                    goodSleepStreak++;
                } else {
                    goodSleepStreak = 0;
                    break;
                }
            } else {
                 goodSleepStreak = 0;
                 break;
            }
        }

        // Check for 7-day streak of good/excellent quality
        for (let i = 0; i < 7; i++) {
            const dateToCheck = subDays(today, i);
            const dateKey = format(dateToCheck, 'yyyy-MM-dd');
            const logData = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${dateKey}`);
             if (logData) {
                const log: FormData = JSON.parse(logData);
                if (log.sleepQuality[0] >= 8) { // Good or Excellent
                    consistentQualityStreak++;
                } else {
                    break; // Streak is broken
                }
            } else {
                 break; // Streak is broken if a day is missed
            }
        }
        
        setAchievements({
            star: goodSleepStreak >= 3,
            queen: consistentQualityStreak >= 7,
        });
    } catch (e) {
        console.error("Error calculating achievements", e);
        setAchievements({star: false, queen: false});
    }
  };

  const loadRecentLogs = () => {
    try {
        const logs: SleepLog[] = [];
        const today = startOfDay(new Date());
        for (let i = 0; i < 7; i++) {
            const date = subDays(today, i);
            const dateKey = format(date, 'yyyy-MM-dd');
            const savedLog = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${dateKey}`);
            if (savedLog) {
                logs.push(JSON.parse(savedLog));
            }
        }
        setRecentLogs(logs);
    } catch (error) {
        console.error("Failed to load recent sleep logs", error);
    }
  };

  useEffect(() => {
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

    const initialLogDate = form.getValues('logDate');
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(initialLogDate, 'yyyy-MM-dd')}`;
    try {
        const savedData = localStorage.getItem(key);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            parsedData.logDate = new Date(parsedData.logDate);
            form.reset(parsedData);
        } else {
            form.reset({
              logDate: initialLogDate,
              sleepDuration: [8],
              sleepQuality: [8],
              notes: "",
            });
        }
    } catch(e) { console.error(e) }
    calculateAchievements();
    loadRecentLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);


  useEffect(() => {
    if (isSameDay(logDate, currentDate)) return;

    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(logDate, 'yyyy-MM-dd')}`;
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        parsedData.logDate = new Date(parsedData.logDate);
        form.reset(parsedData);
      } else {
        form.reset({
          logDate: logDate,
          sleepDuration: [8],
          sleepQuality: [8],
          notes: "",
        });
      }
      setCurrentDate(logDate);
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
  }, [logDate, form, currentDate]);

  function onSubmit(data: FormData) {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(data.logDate, 'yyyy-MM-dd')}`;
    try {
        localStorage.setItem(key, JSON.stringify(data));
        toast({
            title: "Sleep Logged!",
            description: "Your entry for the night has been successfully saved.",
        });

        // Add conditional toasts based on sleep duration
        const hours = data.sleepDuration[0];
        if (hours < 3) {
            toast({
                variant: 'destructive',
                title: "Please Be Careful",
                description: "Consistently sleeping this little can be a sign of insomnia. Please consider speaking with a doctor.",
            });
        } else if (hours < 4) {
             toast({
                variant: 'destructive',
                title: "Short Sleep Alert",
                description: "Getting less than 4 hours of sleep can significantly impact your physical and mental health. Try to prioritize more rest.",
            });
        } else if (hours < 6) {
             toast({
                title: "Reminder",
                description: "A healthy body needs healthy sleep. Aim for 7-9 hours to feel your best!",
            });
        }


        calculateAchievements();
        loadRecentLogs();
        setLogKey(prevKey => prevKey + 1); // Force re-render of history chart
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error Saving Log",
            description: "Could not save your entry. Please try again."
        });
        console.error("Failed to save to localStorage", error);
    }
  }

  const qualityLabel = getQualityLabel(sleepQualityValue?.[0] ?? 0);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 text-foreground">
        <div className="flex">
            <AppSidebar />
            <main className="flex-1 flex-grow container mx-auto px-4 py-8">
                <div className="text-center mb-10">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Sleep Tracker</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Track your sleep to uncover patterns and improve your rest.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                                    <Moon className="text-indigo-400"/>
                                    Log Last Night's Sleep
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="logDate"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="font-semibold">Night Of</FormLabel>
                                        <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={"w-[240px] pl-3 text-left font-normal"}
                                            >
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date >= new Date()} // Cannot log future dates
                                            initialFocus
                                            />
                                        </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="sleepDuration"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold flex items-center gap-2">
                                            <Bed/> Sleep Duration: <span className="font-bold text-indigo-400">{field.value?.[0] ?? 0} hours</span>
                                        </FormLabel>
                                        <FormControl>
                                        <Slider
                                            value={field.value}
                                            max={16}
                                            step={0.5}
                                            onValueChange={field.onChange}
                                        />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sleepQuality"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold flex items-center gap-2">
                                                <Star /> Sleep Quality: <span className="font-bold text-indigo-400">{qualityLabel}</span>
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex justify-between gap-2 pt-2">
                                                    {qualityOptions.map(option => (
                                                        <Button
                                                            key={option.value}
                                                            type="button"
                                                            variant={sleepQualityValue[0] === option.value ? 'secondary' : 'outline'}
                                                            onClick={() => field.onChange([option.value])}
                                                            className={cn(
                                                                "flex-1 h-16 text-lg transition-all",
                                                            )}
                                                        >
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-2xl">{option.icon}</span>
                                                                <span className="text-xs mt-1">{option.label}</span>
                                                            </div>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold flex items-center gap-2">
                                            <BookText /> Sleep Notes
                                        </FormLabel>
                                        <FormControl>
                                        <Textarea
                                            placeholder="e.g., Woke up twice, felt restless, had a weird dream..."
                                            className="resize-none"
                                            {...field}
                                        />
                                        </FormControl>
                                        <FormDescription className="text-right">
                                        {notesValue?.length || 0} / 300
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />

                                <Button type="submit" size="lg" className="w-full">Save Sleep Log</Button>
                                </form>
                            </Form>
                            </CardContent>
                        </Card>
                        <div className="mt-8">
                            <SleepLogHistory key={logKey} />
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="font-bold flex items-center gap-2">
                                    <Sparkles className="text-indigo-400" /> Sleep Summary
                                </CardTitle>
                                <CardDescription>Your last logged night.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                                    <span className="font-semibold flex items-center gap-2"><Bed className="text-indigo-400"/> Duration</span>
                                    <span className="font-bold text-lg">{sleepDurationValue?.[0] ?? 'N/A'} hours</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                                    <span className="font-semibold flex items-center gap-2"><Star className="text-indigo-400"/> Quality</span>
                                    <span className="font-bold text-lg">{qualityLabel}</span>
                                </div>
                                {sleepDurationValue?.[0] < 4 && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Take Care!</AlertTitle>
                                        <AlertDescription>
                                            Getting less than 4 hours of sleep can impact your health. Prioritize rest when you can.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                        {currentPhase && phaseTips[currentPhase] && (
                            <Alert className="bg-indigo-500/10 border-indigo-500/20 text-indigo-900 dark:text-indigo-100 [&>svg]:text-indigo-600">
                                <Info className="h-4 w-4" />
                                <AlertTitle className="font-bold text-slate-800">{phaseTips[currentPhase].title}</AlertTitle>
                                <AlertDescription className="text-slate-700">
                                    {phaseTips[currentPhase].tip}
                                </AlertDescription>
                            </Alert>
                        )}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-bold"><Award className="text-amber-400"/> Achievements</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg transition-all",
                                    achievements.star ? "bg-amber-500/20" : "bg-muted text-muted-foreground opacity-70"
                                )}>
                                    <Award className={cn("h-8 w-8", achievements.star ? "text-red-500 fill-red-500" : "text-slate-400")} />
                                    <div className={cn(achievements.star && "font-bold text-slate-800")}>
                                        <h4 className="font-semibold">Sleep Star</h4>
                                        <p className="text-sm">Log 8+ hours of sleep for 3 days in a row.</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg transition-all",
                                    achievements.queen ? "bg-primary/20" : "bg-muted text-muted-foreground opacity-70"
                                )}>
                                    <Award className={cn("h-8 w-8", achievements.queen ? "text-red-500 fill-red-500" : "text-slate-400")} />
                                    <div className={cn(achievements.queen && "font-bold text-slate-800")}>
                                        <h4 className="font-semibold">Rest Queen</h4>
                                        <p className="text-sm">Maintain 'Good' or 'Excellent' sleep for a week.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
}
