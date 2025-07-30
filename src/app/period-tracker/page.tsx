
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, startOfDay, differenceInDays, isWithinInterval, isSameDay } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, ChevronLeft, Info, Droplet, Sun, Moon, Wind, Heart, Brain, Dumbbell, Utensils, MessageSquare, Coffee, Shield } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const formSchema = z.object({
  lastPeriodDate: z.date({ required_error: "Last period date is required." }),
  cycleLength: z.coerce.number().min(21, "Cycle must be at least 21 days").max(45, "Cycle can be at most 45 days"),
  lutealPhaseLength: z.coerce.number().min(10, "Luteal phase is usually 10-18 days").max(18, "Luteal phase is usually 10-18 days").optional(),
});

type CycleData = z.infer<typeof formSchema>;

type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'None';

const phaseTips: Record<CyclePhase, { title: string; icon: React.ElementType; tips: { icon: React.ElementType, text: string }[] }> = {
    Menstrual: {
        title: "Menstrual Phase: Rest & Reflect",
        icon: Wind,
        tips: [
            { icon: Heart, text: "Your body is shedding its lining. Prioritize rest and gentle movement like stretching or walking." },
            { icon: Utensils, text: "Iron-rich foods like leafy greens, red meat, and legumes can help replenish what's lost." },
            { icon: Coffee, text: "Herbal teas like ginger or raspberry leaf can soothe cramps and provide comfort." },
            { icon: Brain, text: "This is a great time for introspection and journaling. Be gentle with yourself." }
        ]
    },
    Follicular: {
        title: "Follicular Phase: Energize & Create",
        icon: Sun,
        tips: [
            { icon: Dumbbell, text: "Your energy is returning as estrogen rises. It's a great time for more dynamic workouts." },
            { icon: Utensils, text: "Focus on lean proteins and complex carbs to fuel your body for the week ahead." },
            { icon: Brain, text: "This is a creative and productive phase. Start new projects and brainstorm ideas." },
            { icon: Shield, text: "Your skin may be at its best now. Enjoy the glow and try a new face mask!" }
        ]
    },
    Ovulation: {
        title: "Ovulation: Connect & Shine",
        icon: Sun,
        tips: [
            { icon: Dumbbell, text: "You're at your peak fertility and energy. High-intensity workouts can feel great now." },
            { icon: Heart, text: "Your libido may be higher. It's a great time for connection with your partner." },
            { icon: MessageSquare, text: "Communication skills are often enhanced. Perfect for important conversations or social events." },
            { icon: Utensils, text: "Light, fresh foods like salads and fruits can complement your high energy." }
        ]
    },
    Luteal: {
        title: "Luteal Phase: Nurture & Wind Down",
        icon: Moon,
        tips: [
            { icon: Brain, text: "As progesterone rises, you might feel more inward or experience PMS. Prioritize self-care." },
            { icon: Utensils, text: "Magnesium-rich foods like nuts, seeds, and dark chocolate can help with mood and cravings." },
            { icon: Dumbbell, text: "Focus on calming activities like yoga, reading, or taking warm baths to manage potential irritability." },
            { icon: Heart, text: "Listen to your body. If you feel tired, scale back on intense exercise and get more rest." }
        ]
    },
    None: {
        title: "Your Cycle Summary",
        icon: Info,
        tips: [
            { icon: Heart, text: "Enter your cycle details to get personalized tips for each phase of your cycle." },
            { icon: Brain, text: "Tracking helps you understand your body's unique rhythm." },
            { icon: Dumbbell, text: "Note how your energy, mood, and symptoms change throughout the month." },
            { icon: Utensils, text: "This knowledge empowers you to tailor your lifestyle for optimal well-being." }
        ]
    }
};

export default function PeriodTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [predictedPeriods, setPredictedPeriods] = useState<Date[]>([]);
  const [fertileWindows, setFertileWindows] = useState<Date[]>([]);
  const [ovulationDays, setOvulationDays] = useState<Date[]>([]);
  const [summary, setSummary] = useState({ nextPeriodIn: '--', currentPhase: 'None' as CyclePhase, dayOfCycle: '--', symptoms: 'N/A' });

  const form = useForm<CycleData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cycleLength: 28,
      lutealPhaseLength: 14,
    },
  });

  const { reset } = form;

  const calculatePredictions = (formData: CycleData) => {
    const { lastPeriodDate, cycleLength, lutealPhaseLength = 14 } = formData;

    if (lastPeriodDate && cycleLength) {
        const today = startOfDay(new Date());
        let currentCycleStart = startOfDay(new Date(lastPeriodDate));

        // Find the start date of the current or most recent cycle
        while (addDays(currentCycleStart, cycleLength) <= today) {
            currentCycleStart = addDays(currentCycleStart, cycleLength);
        }

        const allPredictedPeriods: Date[] = [];
        const allFertileWindows: Date[] = [];
        const allOvulationDays: Date[] = [];
        
        // Calculate for the current/next 2 cycles
        for (let i = 0; i < 3; i++) {
            const cycleStartDate = addDays(currentCycleStart, cycleLength * i);
            const nextPeriodStart = addDays(cycleStartDate, cycleLength);
            
            // Ovulation Prediction
            const ovulationDay = addDays(nextPeriodStart, -lutealPhaseLength);
            allOvulationDays.push(ovulationDay);
            
            // Fertile Window (Ovulation day + 5 days before)
            for (let j = 0; j < 6; j++) {
                allFertileWindows.push(addDays(ovulationDay, -j));
            }
            
            // Period Prediction (5 days)
            for (let j = 0; j < 5; j++) {
                allPredictedPeriods.push(addDays(nextPeriodStart, j));
            }
        }
        
        setPredictedPeriods(allPredictedPeriods);
        setFertileWindows(allFertileWindows);
        setOvulationDays(allOvulationDays);

        // Update Summary
        const upcomingPeriodStart = addDays(currentCycleStart, cycleLength);
        const nextPeriodIn = differenceInDays(upcomingPeriodStart, today);
        const dayOfCycle = differenceInDays(today, currentCycleStart) + 1;
        
        const periodEnd = addDays(currentCycleStart, 4);
        const ovDay = addDays(upcomingPeriodStart, -lutealPhaseLength);
        let phase: CyclePhase = 'None';
        if (isWithinInterval(today, { start: currentCycleStart, end: periodEnd })) phase = 'Menstrual';
        else if (isWithinInterval(today, { start: addDays(periodEnd, 1), end: addDays(ovDay, -1) })) phase = 'Follicular';
        else if (isSameDay(today, ovDay)) phase = 'Ovulation';
        else if (isWithinInterval(today, { start: addDays(ovDay, 1), end: addDays(upcomingPeriodStart, -1) })) phase = 'Luteal';

        // Get today's symptoms
        const todayKey = `glowher-log-${format(today, 'yyyy-MM-dd')}`;
        let symptomsToday = 'N/A';
        try {
            const log = localStorage.getItem(todayKey);
            if (log) {
                const parsedLog = JSON.parse(log);
                if (parsedLog.symptoms && parsedLog.symptoms.length > 0) {
                    symptomsToday = parsedLog.symptoms.join(', ');
                }
            }
        } catch(e) {}

        setSummary({
            nextPeriodIn: nextPeriodIn > 0 ? `${nextPeriodIn} days` : 'Today',
            currentPhase: phase,
            dayOfCycle: `${dayOfCycle}`,
            symptoms: symptomsToday,
        });
    }
  };


  useEffect(() => {
    try {
      const storedData = localStorage.getItem('glowher-period-tracker');
      if (storedData) {
        const data = JSON.parse(storedData);
        data.lastPeriodDate = new Date(data.lastPeriodDate);
        reset(data);
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
                reset(initialData);
                localStorage.setItem('glowher-period-tracker', JSON.stringify(initialData));
                calculatePredictions(initialData);
            }
        }
      }
    } catch (error) {
      console.error("Could not retrieve data from localStorage", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);


  function onSubmit(values: CycleData) {
    try {
      localStorage.setItem('glowher-period-tracker', JSON.stringify(values));
      toast({
        title: "Success!",
        description: "Your cycle predictions have been updated.",
      });
      calculatePredictions(values);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save your settings. Please try again.",
      });
    }
  }

  const currentPhaseInfo = phaseTips[summary.currentPhase] || phaseTips['None'];

  return (
    <div className="flex flex-col min-h-screen bg-rose-50 text-slate-800">
       <div className="flex flex-col min-h-screen">
            <header className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center">
                    <GlowHerLogo />
                    <Button variant="ghost" onClick={() => router.push('/')} className="hover:bg-rose-200/50">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                    <div className="lg:col-span-2 w-full mx-auto">
                        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-rose-300">
                        <CardHeader>
                            <CardTitle className="font-headline text-3xl text-slate-800">Cycle Settings</CardTitle>
                            <CardDescription>Update your cycle details to refine predictions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField control={form.control} name="lastPeriodDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Last Period Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="ml-auto h-4 w-4 opacity-50" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="cycleLength" render={({ field }) => (<FormItem><FormLabel>Average Cycle Length (days)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="lutealPhaseLength" render={({ field }) => (<FormItem><div className="flex items-center gap-2"><FormLabel>Luteal Phase Length</FormLabel><TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" aria-label="Luteal phase info" onClick={(e) => e.preventDefault()}><Info className="h-4 w-4 text-muted-foreground cursor-pointer" /></button></TooltipTrigger><TooltipContent><p className="max-w-xs">The time between ovulation and your next period. Usually 10-18 days.</p></TooltipContent></Tooltip></TooltipProvider></div><FormControl><Input type="number" placeholder="Default: 14" min="10" max="18" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <Button type="submit" size="lg" className="w-full bg-rose-500 hover:bg-rose-600 text-white">Save & Calculate</Button>
                                <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/settings')}>Edit Personal Details</Button>
                            </form>
                            </Form>
                        </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-3 flex flex-col items-center gap-8">
                         <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-rose-300 w-full">
                             <CardHeader>
                                <CardTitle className="font-headline text-3xl text-slate-800">Your Cycle Calendar</CardTitle>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-sm text-slate-700">
                                    <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-red-400"></div><span>Predicted Period</span></div>
                                    <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-blue-400"></div><span>Fertile Window</span></div>
                                    <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-green-500"></div><span>Predicted Ovulation</span></div>
                                </div>
                            </CardHeader>
                             <CardContent className="flex justify-center">
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
                                        predictedPeriod: 'bg-red-400 text-white rounded-md',
                                        fertileWindow: 'bg-blue-400 text-white rounded-md',
                                        ovulationDay: 'bg-green-500 text-white rounded-md font-bold',
                                    }}
                                />
                             </CardContent>
                         </Card>

                        <div className="w-full">
                            <h2 className="font-headline text-2xl text-slate-800 mb-4 text-center">Mini Tracker Summary</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="bg-white/80 border-rose-300 text-center"><CardHeader><CardTitle className="text-sm font-semibold text-slate-800">⏳ Next Period In</CardTitle><p className="text-2xl font-bold text-rose-900">{summary.nextPeriodIn}</p></CardHeader></Card>
                                <Card className="bg-white/80 border-rose-300 text-center"><CardHeader><CardTitle className="text-sm font-semibold text-slate-800">🌸 Current Phase</CardTitle><p className="text-2xl font-bold text-rose-900">{summary.currentPhase}</p></CardHeader></Card>
                                <Card className="bg-white/80 border-rose-300 text-center"><CardHeader><CardTitle className="text-sm font-semibold text-slate-800">🗓️ Day of Cycle</CardTitle><p className="text-2xl font-bold text-rose-900">{summary.dayOfCycle}</p></CardHeader></Card>
                                <Card className="bg-white/80 border-rose-300 text-center"><CardHeader><CardTitle className="text-sm font-semibold text-slate-800">🩺 Symptoms Today</CardTitle><p className="text-lg font-bold text-rose-900 truncate" title={summary.symptoms}>{summary.symptoms}</p></CardHeader></Card>
                            </div>
                        </div>

                         <Alert className="bg-rose-100/80 border-rose-300 w-full">
                            <currentPhaseInfo.icon className="h-5 w-5 text-rose-600" />
                            <AlertTitle className="font-headline text-xl text-slate-800">{currentPhaseInfo.title}</AlertTitle>
                            <AlertDescription>
                                <ul className="mt-2 space-y-3">
                                    {currentPhaseInfo.tips.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <tip.icon className="h-4 w-4 mt-1 text-rose-600 flex-shrink-0" />
                                            <span>{tip.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
}

    