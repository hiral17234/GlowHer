
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, startOfDay, differenceInDays, isWithinInterval, isSameDay, subDays } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, ChevronLeft, Info, Droplet, Sun, Moon, Wind, Heart, Brain, Dumbbell, Utensils, Coffee, Shield, CheckCircle2, Calendar as CalendarIconMini, CircleDotDashed, Activity, AlertTriangle } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipContent } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const formSchema = z.object({
  lastPeriodDate: z.date({ required_error: "Last period date is required." }),
  cycleLength: z.coerce.number().min(21, "Cycle must be at least 21 days").max(45, "Cycles over 45 days are uncommon. Please verify."),
  lutealPhaseLength: z.coerce.number().min(10, "Luteal phase is usually 10-18 days").max(18, "Luteal phase is usually 10-18 days").optional(),
});

type CycleData = z.infer<typeof formSchema>;

type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'None';

const phaseTips: Record<CyclePhase, { title: string; icon: React.ElementType; tips: { icon: React.ElementType, title: string, text: string, color: string }[] }> = {
    Menstrual: {
        title: "Wellness Tips for your Menstrual Phase",
        icon: Wind,
        tips: [
            { icon: Utensils, title: "Diet Tips", text: "Focus on iron-rich foods like spinach and lentils to replenish iron stores. Stay hydrated with water and herbal teas.", color: "text-green-600"},
            { icon: Activity, title: "Exercise Tips", text: "Gentle activities like walking, stretching, or light yoga are best. Listen to your body and rest when you need to.", color: "text-blue-600"},
            { icon: Heart, title: "Pain & Symptom Relief", text: "Use a warm compress on your abdomen. Consider magnesium supplements to ease cramps. OTC pain relievers can be used if needed (with a doctor's advice).", color: "text-red-600"},
            { icon: Brain, title: "Rest & Mood Support", text: "Prioritize rest and self-care. Journaling can help process emotions. A comforting cup of chamomile tea can be very soothing.", color: "text-purple-600"}
        ]
    },
    Follicular: {
        title: "Wellness Tips for your Follicular Phase",
        icon: Sun,
        tips: [
            { icon: Utensils, title: "Diet Tips", text: "Focus on lean proteins and complex carbs like quinoa and oats to fuel your rising energy levels.", color: "text-green-600" },
            { icon: Activity, title: "Exercise Tips", text: "Your energy is returning! This is a great time for more dynamic workouts like dancing, brisk walking, or trying a new class.", color: "text-blue-600" },
            { icon: Brain, title: "Productivity & Creativity", text: "Harness your increased mental clarity. It's a fantastic time to brainstorm, start new projects, and tackle your to-do list.", color: "text-purple-600" },
            { icon: Shield, title: "Skin Care", text: "Your skin is often at its best now. Focus on maintaining hydration and enjoy that natural glow!", color: "text-red-600" }
        ]
    },
    Ovulation: {
        title: "Wellness Tips for your Ovulatory Phase",
        icon: Sun,
        tips: [
            { icon: Utensils, title: "Diet Tips", text: "Load up on fiber-rich foods and antioxidants like berries and vegetables to support liver function and hormone processing.", color: "text-green-600" },
            { icon: Activity, title: "Exercise Tips", text: "You're at your peak energy! This is the perfect time for high-intensity workouts (HIIT), running, or challenging strength training sessions.", color: "text-blue-600" },
            { icon: Heart, title: "Connection & Libido", text: "Libido is often at its highest. It's a great phase for social events and connecting with your partner.", color: "text-red-600" },
            { icon: Brain, title: "Communication", text: "You may feel more verbally expressive. Use this time for important conversations and collaborations.", color: "text-purple-600" }
        ]
    },
    Luteal: {
        title: "Wellness Tips for your Luteal Phase",
        icon: Moon,
        tips: [
            { icon: Utensils, title: "Diet Tips", text: "Focus on magnesium-rich foods like dark chocolate and nuts, and B-vitamins to help manage PMS. Reduce caffeine and salt to minimize symptoms.", color: "text-green-600" },
            { icon: Activity, title: "Exercise Tips", text: "Energy may be lower. Shift to moderate-strength training, Pilates, or swimming. Listen to your body and prioritize rest if needed.", color: "text-blue-600" },
            { icon: Heart, title: "Symptom Management", text: "If you experience breast tenderness or bloating, ensure you're drinking plenty of water and wearing a comfortable, supportive bra.", color: "text-red-600" },
            { icon: Brain, title: "Self-Care & Winding Down", text: "This is a time to turn inward. Prioritize calming activities like reading, taking a bath, or watching a comforting movie to manage potential irritability.", color: "text-purple-600" }
        ]
    },
    None: {
        title: "Your Cycle Summary",
        icon: Info,
        tips: [
            { icon: Heart, title: "Track Your Cycle", text: "Enter your cycle details to get personalized tips for each phase.", color: "text-green-600"},
            { icon: Brain, title: "Understand Your Body", text: "Tracking helps you understand your body's unique rhythm and patterns.", color: "text-purple-600"},
            { icon: Dumbbell, title: "Note Your Energy", text: "Note how your energy, mood, and symptoms change throughout the month.", color: "text-blue-600"},
            { icon: Utensils, title: "Empower Your Lifestyle", text: "This knowledge empowers you to tailor your nutrition and activities for optimal well-being.", color: "text-red-600"}
        ]
    }
};

export default function PeriodTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [predictedPeriods, setPredictedPeriods] = useState<Date[]>([]);
  const [fertileWindows, setFertileWindows] = useState<Date[]>([]);
  const [ovulationDays, setOvulationDays] = useState<Date[]>([]);
  const [summary, setSummary] = useState({ nextPeriodIn: '--', currentPhase: 'None' as CyclePhase, dayOfCycle: '--', symptoms: 'No' });
  const [cycleWarning, setCycleWarning] = useState<string | null>(null);

  const form = useForm<CycleData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cycleLength: 28,
      lutealPhaseLength: 14,
    },
  });

  const { reset, watch } = form;
  const watchedFields = watch();

  useEffect(() => {
    const calculatePredictions = (formData: CycleData) => {
      const { lastPeriodDate, cycleLength, lutealPhaseLength = 14 } = formData;
  
      if (cycleLength > 35) {
          setCycleWarning("Cycles longer than 35 days can sometimes indicate an underlying issue. If this is unusual for you, it's a good idea to consult a doctor.");
      } else {
          setCycleWarning(null);
      }

      if (lastPeriodDate && cycleLength) {
          const today = startOfDay(new Date());
          let currentCycleStart = startOfDay(new Date(lastPeriodDate));
  
          while (addDays(currentCycleStart, cycleLength) <= today) {
              currentCycleStart = addDays(currentCycleStart, cycleLength);
          }
  
          const allPredictedPeriods: Date[] = [];
          const allFertileWindows: Date[] = [];
          const allOvulationDays: Date[] = [];
          
          for (let i = 0; i < 2; i++) {
              const cycleStartDate = addDays(currentCycleStart, cycleLength * i);
              const nextPeriodStart = addDays(cycleStartDate, cycleLength);
              
              const ovulationDay = addDays(nextPeriodStart, -lutealPhaseLength);
              allOvulationDays.push(ovulationDay);
              
              // Fertile window is ovulation day + 5 days before it
              for (let j = 0; j <= 5; j++) {
                  allFertileWindows.push(addDays(ovulationDay, -j));
              }
              
              // Period duration is 5 days
              for (let j = 0; j < 5; j++) {
                  allPredictedPeriods.push(addDays(nextPeriodStart, j));
              }
          }
          
          setPredictedPeriods(allPredictedPeriods);
          setFertileWindows(allFertileWindows);
          setOvulationDays(allOvulationDays);
  
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
  
          const todayKey = `glowher-log-${format(today, 'yyyy-MM-dd')}`;
          let symptomsToday = 'No';
          try {
              const log = localStorage.getItem(todayKey);
              if (log) {
                  const parsedLog = JSON.parse(log);
                  const allSymptoms = [...(parsedLog.symptoms || []), parsedLog.otherSymptom].filter(Boolean);
                  if (allSymptoms.length > 0) {
                      symptomsToday = 'Yes';
                  }
              }
          } catch(e) {}
  
          setSummary({
              nextPeriodIn: nextPeriodIn >= 0 ? `${nextPeriodIn} days` : 'Today',
              currentPhase: phase,
              dayOfCycle: `${dayOfCycle}`,
              symptoms: symptomsToday,
          });
      }
    };
    if(watchedFields.lastPeriodDate && watchedFields.cycleLength) {
        calculatePredictions(watchedFields);
    }
  }, [watchedFields]);


  useEffect(() => {
    try {
      const storedData = localStorage.getItem('glowher-period-tracker');
      if (storedData) {
        const data = JSON.parse(storedData);
        data.lastPeriodDate = new Date(data.lastPeriodDate);
        reset(data);
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
                <div className="text-center mb-10">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-slate-800">Period Tracker</h1>
                    <p className="mt-2 text-lg text-slate-600">Your personal cycle and wellness guide</p>
                </div>

                 {cycleWarning && (
                    <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Irregular Cycle Length</AlertTitle>
                        <AlertDescription>
                            {cycleWarning}
                        </AlertDescription>
                    </Alert>
                 )}

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
                                <FormField control={form.control} name="lastPeriodDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Last Period Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-end text-right font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4 opacity-50" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="cycleLength" render={({ field }) => (<FormItem><FormLabel>Average Cycle Length (days)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
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
                                <Card className="bg-white/80 border-rose-300 text-center p-4 shadow-md flex flex-col justify-center items-center">
                                    <CardHeader className="p-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-center gap-2">Next Period In <CircleDotDashed className="h-4 w-4" /></CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-2">
                                        <p className="text-2xl font-bold text-slate-900">{summary.nextPeriodIn}</p>
                                    </CardContent>
                                </Card>
                                 <Card className="bg-white/80 border-rose-300 text-center p-4 shadow-md flex flex-col justify-center items-center">
                                    <CardHeader className="p-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-center gap-2">Current Phase <CalendarIconMini className="h-4 w-4" /></CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-2">
                                         <span className="text-lg font-bold text-slate-900 bg-rose-200/60 px-3 py-1 rounded-full">{summary.currentPhase}</span>
                                    </CardContent>
                                </Card>
                                 <Card className="bg-white/80 border-rose-300 text-center p-4 shadow-md flex flex-col justify-center items-center">
                                    <CardHeader className="p-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-center gap-2">Day of Cycle <CalendarIconMini className="h-4 w-4" /></CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-2">
                                        <p className="text-2xl font-bold text-slate-900">{summary.dayOfCycle}</p>
                                    </CardContent>
                                </Card>
                                 <Card 
                                    className="bg-white/80 border-rose-300 text-center p-4 shadow-md flex flex-col justify-center items-center cursor-pointer hover:bg-rose-100/50 transition-colors"
                                    onClick={() => router.push('/log-symptoms')}
                                >
                                    <CardHeader className="p-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-center gap-2">Symptoms Logged <CheckCircle2 className="h-4 w-4" /></CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-2">
                                        <p className="text-2xl font-bold text-slate-900">{summary.symptoms}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                         <div className="w-full bg-rose-100/50 p-6 rounded-lg border border-rose-200">
                             <h2 className="font-headline text-xl text-rose-800 mb-4">{currentPhaseInfo.title}</h2>
                             <ul className="space-y-4">
                                {currentPhaseInfo.tips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className={`mt-1 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center bg-white`}>
                                            <tip.icon className={`h-4 w-4 ${tip.color}`} />
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold ${tip.color}`}>{tip.title}</h3>
                                            <p className="text-sm text-slate-700">{tip.text}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
}
