
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, differenceInDays, startOfDay, isWithinInterval, isSameDay } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, ChevronLeft, Info, Leaf, Dumbbell, Pill, Bed, HeartHandshake, AlertTriangle, CalendarClock, Target, CheckCircle } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  lastPeriodDate: z.date({ required_error: "Last period date is required." }),
  cycleLength: z.coerce.number().min(21).max(35),
  lutealPhaseLength: z.coerce.number().min(10).max(18).optional(),
});

type CycleData = z.infer<typeof formSchema>;

type Predictions = {
    nextPeriod: Date[];
    fertileWindow: { start: Date; end: Date };
    ovulationDay: Date;
};

const phaseTips = {
    Menstrual: {
        title: "Menstrual Phase",
        color: "bg-red-900/30 text-red-200 border-red-500/30",
        tips: {
            diet: "Focus on iron-rich foods like spinach and lentils to replenish iron stores. Stay hydrated with water and herbal teas.",
            exercise: "Gentle activities like walking, stretching, or light yoga are best. Listen to your body and rest when you need to.",
            painRelief: "Use a warm compress on your abdomen. Consider magnesium supplements to ease cramps. OTC pain relievers can be used if needed (with a doctor's advice).",
            moodSupport: "Prioritize rest and self-care. Journaling can help process emotions. A comforting cup of chamomile tea can be very soothing."
        }
    },
    Follicular: {
        title: "Follicular Phase",
        color: "bg-blue-900/30 text-blue-200 border-blue-500/30",
        tips: {
            diet: "Energy levels are rising! Fuel up with lean proteins, fresh vegetables, and whole grains. This is a great time for sprouted and fermented foods.",
            exercise: "Your energy is increasing, so you can gradually ramp up your workouts. Try cardio, dancing, or more vigorous forms of yoga.",
            painRelief: "This phase is usually pain-free for most. Focus on nourishing your body to prepare for ovulation.",
            moodSupport: "You may feel more creative and outgoing. It's a great time to start new projects or socialize with friends."
        }
    },
    Ovulatory: {
        title: "Ovulatory Phase",
        color: "bg-green-900/30 text-green-200 border-green-500/30",
        tips: {
            diet: "Eat light and clean. Focus on antioxidant-rich fruits and vegetables to support your body. Fiber is important to help process hormones.",
            exercise: "This is your peak energy phase! High-impact workouts like HIIT, running, or spinning are great options.",
            painRelief: "Some may experience mild cramping (mittelschmerz). A warm bath can help.",
            moodSupport: "You might feel more social and communicative. It's an excellent time for connection and collaboration."
        }
    },
    Luteal: {
        title: "Luteal Phase",
        color: "bg-yellow-900/30 text-yellow-200 border-yellow-500/30",
        tips: {
            diet: "Focus on foods that stabilize blood sugar and mood, like complex carbs (sweet potatoes, oats), and healthy fats (avocado, nuts). Reduce caffeine and processed foods.",
            exercise: "Energy may start to decline. Shift to strength training, pilates, or swimming. Listen to your body's cues to slow down.",
            painRelief: "If you experience PMS symptoms like bloating or breast tenderness, reducing salt intake can help. Magnesium can also ease pre-menstrual cramps.",
            moodSupport: "This is a time for winding down. Prioritize self-care and calming activities. Meditation or a good book can help manage mood swings."
        }
    },
};

export default function PeriodTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [currentPhase, setCurrentPhase] = useState<keyof typeof phaseTips | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [daysSinceLastPeriod, setDaysSinceLastPeriod] = useState<number | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [showIrregularityAlert, setShowIrregularityAlert] = useState(false);


  const form = useForm<CycleData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cycleLength: 28,
      lutealPhaseLength: 14,
    },
  });

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('glowher-period-tracker');
      if (storedData) {
        const data = JSON.parse(storedData);
        data.lastPeriodDate = new Date(data.lastPeriodDate);
        form.reset(data);
        calculatePredictions(data);
      } else {
        const userDetails = localStorage.getItem('glowher-user');
        if (userDetails) {
            const userData = JSON.parse(userDetails);
            if(userData.lastPeriodDate) {
                const initialData = {
                    lastPeriodDate: new Date(userData.lastPeriodDate),
                    cycleLength: 28,
                    lutealPhaseLength: 14,
                };
                form.reset(initialData);
                calculatePredictions(initialData);
                localStorage.setItem('glowher-period-tracker', JSON.stringify(initialData));
            }
        }
      }
    } catch (error) {
      console.error("Could not retrieve data from localStorage", error);
    }
  }, [form]);

  function calculatePredictions(data: CycleData) {
    const today = startOfDay(new Date());
    const lastPeriod = startOfDay(data.lastPeriodDate);
    const cycleLength = data.cycleLength;
    const lutealPhase = data.lutealPhaseLength || 14;
    
    const daysSince = differenceInDays(today, lastPeriod);
    setShowIrregularityAlert(daysSince > 35);

    let currentCycleStartDate = lastPeriod;
    while (addDays(currentCycleStartDate, cycleLength) <= today) {
        currentCycleStartDate = addDays(currentCycleStartDate, cycleLength);
    }
    
    const nextPeriodStart = startOfDay(addDays(currentCycleStartDate, cycleLength));
    const ovulationDay = startOfDay(addDays(nextPeriodStart, -lutealPhase));
    const fertileWindowStart = startOfDay(addDays(ovulationDay, -5));
    const fertileWindowEnd = ovulationDay;
    const periodEnd = startOfDay(addDays(currentCycleStartDate, 4)); // Assume 5 day period

    const newPredictions = {
        nextPeriod: Array.from({ length: 5 }, (_, i) => addDays(nextPeriodStart, i)),
        fertileWindow: { start: fertileWindowStart, end: fertileWindowEnd },
        ovulationDay: ovulationDay,
    };
    setPredictions(newPredictions);

    // Determine current phase
    if (isWithinInterval(today, { start: currentCycleStartDate, end: periodEnd })) {
      setCurrentPhase("Menstrual");
    } else if (isWithinInterval(today, { start: addDays(periodEnd, 1), end: addDays(ovulationDay, -1) })) {
      setCurrentPhase("Follicular");
    } else if (isSameDay(today, ovulationDay)) {
        setCurrentPhase("Ovulatory");
    } else if (isWithinInterval(today, { start: addDays(ovulationDay, 1), end: addDays(nextPeriodStart, -1) })) {
      setCurrentPhase("Luteal");
    } else {
      // Default to follicular if somehow in between ranges
      setCurrentPhase("Follicular");
    }
    
    const daysUntilNextPeriod = differenceInDays(nextPeriodStart, today);
    setCountdown(daysUntilNextPeriod >= 0 ? daysUntilNextPeriod : 0);
    setDaysSinceLastPeriod(differenceInDays(today, currentCycleStartDate));
    setCalendarMonth(nextPeriodStart);
  }

  function onSubmit(values: CycleData) {
    try {
      localStorage.setItem('glowher-period-tracker', JSON.stringify(values));
      calculatePredictions(values);
      toast({
        title: "Success!",
        description: "Your cycle predictions have been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save your settings. Please try again.",
      });
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-cover bg-center" style={{backgroundImage: "url('https://i.pinimg.com/736x/4d/f1/6b/4df16bef06d3869b452e939c7ff925ce.jpg')"}}>
       <div className="absolute inset-0 bg-black/50 z-0"/>
       <div className="relative z-10 flex flex-col min-h-screen">
            <header className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center">
                <GlowHerLogo className="[&>span]:text-white" />
                <Button variant="ghost" onClick={() => router.push('/')} className="text-white hover:bg-white/10 hover:text-white">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card className="shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Cycle Settings</CardTitle>
                        <CardDescription className="text-slate-300">Update your cycle details to refine predictions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                            control={form.control}
                            name="lastPeriodDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Last Period Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn("w-full pl-3 text-left font-normal bg-white/10 border-white/20 hover:bg-white/20", !field.value && "text-slate-300")}
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
                                        disabled={(date) => date > new Date()}
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
                            name="cycleLength"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Average Cycle Length (days)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} className="bg-white/10 border-white/20" />
                                </FormControl>
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
                                    <FormLabel>Luteal Phase Length</FormLabel>
                                    <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <button type="button" aria-label="Luteal phase info" onClick={(e) => e.preventDefault()}>
                                            <Info className="h-4 w-4 text-slate-300 cursor-pointer" />
                                        </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                        <p className="max-w-xs">
                                            The luteal phase is the time between ovulation and your next period. It's usually 10-18 days. This is different from your period (menstruation), which is when you bleed.
                                        </p>
                                        </TooltipContent>
                                    </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <FormControl>
                                    <Input type="number" placeholder="Default: 14" min="10" max="18" {...field} className="bg-white/10 border-white/20"/>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <div className="flex flex-col gap-2">
                            <Button type="submit" size="lg" className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold">Save & Calculate</Button>
                            <Button variant="outline" onClick={() => router.push('/personal-details')} className="bg-transparent hover:bg-white/10 border-white/20">Edit Personal Details</Button>
                            </div>
                        </form>
                        </Form>
                    </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
                        <CardHeader>
                            <CardTitle className="font-headline text-3xl">Your Cycle Calendar</CardTitle>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-300 pt-2">
                                <div className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-red-400/80"></span> Predicted Period</div>
                                <div className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-blue-400/80"></span> Fertile Window</div>
                                <div className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-green-500/80"></span> Ovulation Day</div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Calendar
                                mode="multiple"
                                min={1}
                                month={calendarMonth}
                                onMonthChange={setCalendarMonth}
                                selected={predictions ? [
                                    ...predictions.nextPeriod,
                                    {from: predictions.fertileWindow.start, to: predictions.fertileWindow.end},
                                ] : []}
                                modifiers={{
                                    fertile: predictions ? {from: predictions.fertileWindow.start, to: predictions.fertileWindow.end} : [],
                                    period: predictions ? predictions.nextPeriod : [],
                                    ovulation: predictions ? predictions.ovulationDay : new Date('1970-01-01'),
                                }}
                                modifiersClassNames={{
                                    fertile: 'bg-blue-400/80 text-blue-foreground rounded-none',
                                    period: 'bg-red-400/80 text-red-foreground rounded-none',
                                    ovulation: 'bg-green-500/80 text-green-foreground rounded-full font-bold',
                                    today: 'bg-teal-400/80 text-black',
                                }}
                                className="p-0"
                            />
                        </CardContent>
                    </Card>
                    
                    {showIrregularityAlert && (
                    <Alert variant="destructive" className="mt-6 bg-red-900/50 border-red-500/50 text-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-300" />
                        <AlertTitle>Irregular Cycle Notice</AlertTitle>
                        <AlertDescription className="text-red-300">
                        It's been over 35 days since your last period. While this can be normal, you may want to consult a healthcare provider if you have concerns.
                        </AlertDescription>
                    </Alert>
                    )}

                    {predictions && (
                        <div className="mt-6">
                            <h3 className="text-2xl font-headline mb-4 text-white">Mini Tracker Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
                                    <CardHeader className="flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Next Period In</CardTitle>
                                        <Target className="h-4 w-4 text-slate-300" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{countdown !== null ? `${countdown} days` : 'N/A'}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
                                    <CardHeader className="flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
                                        <CalendarClock className="h-4 w-4 text-slate-300" />
                                    </CardHeader>
                                    <CardContent>
                                        {currentPhase ? (
                                            <Badge className={cn("text-md", phaseTips[currentPhase].color)}>
                                                {phaseTips[currentPhase].title}
                                            </Badge>
                                        ) : (
                                            <p className="text-2xl font-bold">...</p>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
                                    <CardHeader className="flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Day of Cycle</CardTitle>
                                        <CalendarIcon className="h-4 w-4 text-slate-300" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{daysSinceLastPeriod !== null ? `${daysSinceLastPeriod + 1}` : 'N/A'}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
                                    <CardHeader className="flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Symptoms Logged</CardTitle>
                                        <CheckCircle className="h-4 w-4 text-slate-300" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">No</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}


                    {currentPhase && (
                        <Card className={cn("mt-6 border-2 bg-black/20 backdrop-blur-sm", phaseTips[currentPhase].color)}>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl text-white">Wellness Tips for your {phaseTips[currentPhase].title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-slate-200">
                                <div className="flex items-start gap-4">
                                    <Leaf className="h-6 w-6 text-green-400 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-green-300">Diet Tips</h4>
                                        <p className="text-sm">{phaseTips[currentPhase].tips.diet}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Dumbbell className="h-6 w-6 text-blue-400 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-blue-300">Exercise Tips</h4>
                                        <p className="text-sm">{phaseTips[currentPhase].tips.exercise}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <HeartHandshake className="h-6 w-6 text-red-400 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-red-300">Pain & Symptom Relief</h4>
                                        <p className="text-sm">{phaseTips[currentPhase].tips.painRelief}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Bed className="h-6 w-6 text-indigo-400 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-indigo-300">Rest & Mood Support</h4>
                                        <p className="text-sm">{phaseTips[currentPhase].tips.moodSupport}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                </div>
            </main>
        </div>
    </div>
  );
}
