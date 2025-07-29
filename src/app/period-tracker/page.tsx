
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, differenceInDays, startOfDay, isWithinInterval, isSameDay } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, ChevronLeft, Info } from 'lucide-react';
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
import { AppFooter } from '@/components/glowher/AppFooter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
        tip: "This is day 1 of your cycle. Your body is shedding the uterine lining. Focus on rest and nourishment. Gentle activities like walking or stretching can be beneficial.",
        color: "bg-red-500/10 text-red-700",
    },
    Follicular: {
        title: "Follicular Phase",
        tip: "After your period, your energy levels start rising as your body prepares for ovulation. It's a great time for creative projects and more intense workouts.",
        color: "bg-blue-500/10 text-blue-700",
    },
    Ovulatory: {
        title: "Ovulatory Phase",
        tip: "This is your most fertile time. You're likely at your peak energy. It's a great day for connecting with others and enjoying high-impact activities.",
        color: "bg-green-500/10 text-green-700",
    },
    Luteal: {
        title: "Luteal Phase",
        tip: "After ovulation, your energy may start to decrease as your body prepares for the next period. Focus on self-care and calming activities. Complex carbs can help with mood.",
        color: "bg-yellow-500/10 text-yellow-700",
    },
};

export default function PeriodTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [currentPhase, setCurrentPhase] = useState<keyof typeof phaseTips | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

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
    
    let currentCycleStartDate = lastPeriod;
    while (addDays(currentCycleStartDate, cycleLength) <= today) {
        currentCycleStartDate = addDays(currentCycleStartDate, cycleLength);
    }
    
    const nextPeriodStart = startOfDay(addDays(currentCycleStartDate, cycleLength));
    const ovulationDay = startOfDay(addDays(nextPeriodStart, -lutealPhase));
    const fertileWindowStart = startOfDay(addDays(ovulationDay, -5));
    const periodEnd = startOfDay(addDays(currentCycleStartDate, 4)); 

    const newPredictions = {
        nextPeriod: Array.from({ length: 5 }, (_, i) => addDays(nextPeriodStart, i)),
        fertileWindow: { start: fertileWindowStart, end: ovulationDay },
        ovulationDay: ovulationDay,
    };
    setPredictions(newPredictions);

    if (isWithinInterval(today, { start: currentCycleStartDate, end: periodEnd })) {
      setCurrentPhase("Menstrual");
    } else if (isSameDay(today, ovulationDay)) {
        setCurrentPhase("Ovulatory");
    } else if (isWithinInterval(today, { start: addDays(periodEnd, 1), end: addDays(ovulationDay, -1) })) {
      setCurrentPhase("Follicular");
    } else if (isWithinInterval(today, { start: addDays(ovulationDay, 1), end: addDays(nextPeriodStart, -1) })) {
      setCurrentPhase("Luteal");
    } else {
      setCurrentPhase("Follicular");
    }
    
    const daysUntilNextPeriod = differenceInDays(nextPeriodStart, today);
    setCountdown(daysUntilNextPeriod >= 0 ? daysUntilNextPeriod : 0);
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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-3xl">Cycle Settings</CardTitle>
                <CardDescription>Update your cycle details to refine predictions.</CardDescription>
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
                                  className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                          <FormLabel>Average Cycle Length (21-35 days)</FormLabel>
                          <FormControl>
                            <Input type="number" min="21" max="35" {...field} />
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
                             <FormLabel>Luteal Phase Length (optional)</FormLabel>
                             <TooltipProvider>
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <button type="button" aria-label="Luteal phase info">
                                     <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
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
                            <Input type="number" placeholder="Default: 14" min="10" max="18" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col gap-2">
                      <Button type="submit" size="lg" className="w-full">Save & Calculate</Button>
                      <Button variant="outline" onClick={() => router.push('/personal-details')}>Edit Personal Details</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Your Cycle Calendar</CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
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
                            today: 'bg-accent text-accent-foreground',
                          }}
                        className="p-0"
                    />
                </CardContent>
            </Card>

            {predictions && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Next Period In</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-foreground">{countdown !== null ? `${countdown} days` : 'N/A'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Current Phase</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentPhase ? (
                      <Badge className={cn("text-lg", phaseTips[currentPhase].color)}>
                        {phaseTips[currentPhase].title}
                      </Badge>
                    ) : (
                        <p>Calculating...</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {currentPhase && (
                 <Card className={cn("mt-6", phaseTips[currentPhase].color, "border-0")}>
                    <CardHeader>
                        <CardTitle className="font-headline">Tips for your {phaseTips[currentPhase].title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{phaseTips[currentPhase].tip}</p>
                    </CardContent>
                 </Card>
            )}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

    