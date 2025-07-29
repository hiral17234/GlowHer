
"use client";

import { useState, useEffect } from 'react';
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
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { useToast } from '@/hooks/use-toast';
import { AppFooter } from '@/components/glowher/AppFooter';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, ChevronLeft, Bed, Star, BookText, Moon, Award, Info, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { SleepLogHistory } from '@/components/glowher/SleepLogHistory';


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

  const calculateAchievements = () => {
    try {
        let goodSleepDays = 0;
        let consistentQualityDays = 0;
        let lastQuality = -1;
        const today = startOfDay(new Date());

        for (let i = 0; i < 7; i++) {
            const dateToCheck = subDays(today, i);
            const dateKey = format(dateToCheck, 'yyyy-MM-dd');
            const logData = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${dateKey}`);
            if (logData) {
                const log: FormData = JSON.parse(logData);
                if(log.sleepDuration[0] >= 8) {
                    goodSleepDays++;
                }

                if (i === 0) {
                    lastQuality = log.sleepQuality[0];
                }
                if(lastQuality !== -1 && log.sleepQuality[0] >= 7){
                    if (i === 0) consistentQualityDays = 1;
                    else consistentQualityDays++;
                } else {
                    consistentQualityDays = 0; // Reset streak
                }
                lastQuality = log.sleepQuality[0];
            } else {
                consistentQualityDays = 0; // Reset streak if a day is missed
            }
        }
        setAchievements({
            star: goodSleepDays >= 3,
            queen: consistentQualityDays >= 7,
        });
    } catch (e) {
        console.error("Error calculating achievements", e);
        setAchievements({star: false, queen: false});
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
        calculateAchievements();
        setLogKey(prevKey => prevKey + 1); // Force re-render of history
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error Saving Log",
            description: "Could not save your entry. Please try again."
        });
        console.error("Failed to save to localStorage", error);
    }
  }

  const qualityLabel = qualityOptions.find(q => q.value >= (sleepQualityValue?.[0] ?? 0))?.label ?? 'Fair';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <header className="container mx-auto px-4 py-6 z-10">
        <div className="flex justify-between items-center">
          <GlowHerLogo />
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-10">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Sleep Tracker</h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Track your sleep to uncover patterns and improve your rest.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-8">
                <Card className="shadow-lg bg-white dark:bg-slate-800/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                            <Moon className="text-indigo-500"/>
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
                                <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Night Of</FormLabel>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={"w-[240px] pl-3 text-left font-normal bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"}
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
                                <FormLabel className="font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <Bed/> Sleep Duration: <span className="font-bold text-indigo-500">{field.value?.[0] ?? 0} hours</span>
                                </FormLabel>
                                <FormControl>
                                <Slider
                                    value={field.value}
                                    max={16}
                                    step={0.5}
                                    onValueChange={field.onChange}
                                    className="[&>span>span]:bg-indigo-500 [&>span]:bg-indigo-200 dark:[&>span]:bg-indigo-900"
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
                                    <FormLabel className="font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <Star /> Sleep Quality: <span className="font-bold text-indigo-500">{qualityLabel}</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="flex justify-between gap-2 pt-2">
                                            {qualityOptions.map(option => (
                                                <Button
                                                    key={option.value}
                                                    type="button"
                                                    variant={sleepQualityValue[0] === option.value ? 'default' : 'outline'}
                                                    onClick={() => field.onChange([option.value])}
                                                    className={cn(
                                                        "flex-1 h-16 text-lg transition-all",
                                                        sleepQualityValue[0] === option.value && "bg-indigo-500 hover:bg-indigo-600 text-white"
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
                                <FormLabel className="font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <BookText /> Sleep Notes
                                </FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="e.g., Woke up twice, felt restless, had a weird dream..."
                                    className="resize-none bg-slate-50 dark:bg-slate-700"
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

                        <Button type="submit" size="lg" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white dark:text-white">Save Sleep Log</Button>
                        </form>
                    </Form>
                    </CardContent>
                </Card>

                <div className="mt-8">
                  <SleepLogHistory key={logKey} />
                </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white dark:bg-slate-800/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                            <Sparkles className="text-indigo-400" /> Sleep Summary
                        </CardTitle>
                        <CardDescription>Your last logged night.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                            <span className="font-semibold flex items-center gap-2"><Bed className="text-indigo-500"/> Duration</span>
                            <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{sleepDurationValue?.[0] ?? 'N/A'} hours</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                            <span className="font-semibold flex items-center gap-2"><Star className="text-indigo-500"/> Quality</span>
                            <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{qualityLabel}</span>
                        </div>
                    </CardContent>
                </Card>
                {currentPhase && phaseTips[currentPhase] && (
                    <Alert className="bg-indigo-100 border-indigo-200 text-indigo-800 dark:bg-indigo-900/30 dark:border-indigo-500/30 dark:text-indigo-200 [&>svg]:text-indigo-500 dark:[&>svg]:text-indigo-400">
                        <Info className="h-4 w-4" />
                        <AlertTitle className="font-bold">{phaseTips[currentPhase].title}</AlertTitle>
                        <AlertDescription>
                            {phaseTips[currentPhase].tip}
                        </AlertDescription>
                    </Alert>
                )}
                 <Card className="shadow-lg bg-white dark:bg-slate-800/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Award className="text-amber-500"/> Achievements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className={cn(
                            "flex items-center gap-4 p-4 rounded-lg transition-all",
                            achievements.star ? "bg-amber-400/20 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300" : "bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 opacity-70"
                        )}>
                            <Award className="h-8 w-8" />
                            <div>
                                <h4 className="font-semibold">Sleep Star</h4>
                                <p className="text-sm">Log 8+ hours of sleep for 3 days.</p>
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-4 p-4 rounded-lg transition-all",
                             achievements.queen ? "bg-purple-400/20 text-purple-800 dark:bg-purple-400/10 dark:text-purple-300" : "bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 opacity-70"
                        )}>
                             <Award className="h-8 w-8" />
                            <div>
                                <h4 className="font-semibold">Rest Queen</h4>
                                <p className="text-sm">Maintain 'Good' or 'Excellent' sleep for a week.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

    