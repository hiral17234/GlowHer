
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, differenceInDays, startOfDay, isWithinInterval } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, ChevronLeft } from 'lucide-react';
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
        tip: "Focus on rest and nourishment. Gentle activities like walking or stretching can be beneficial. Iron-rich foods are your friend.",
        color: "bg-red-500/10 text-red-700",
    },
    Follicular: {
        title: "Follicular Phase",
        tip: "Energy levels are rising! It's a great time for creative projects and more intense workouts. Your body is preparing for ovulation.",
        color: "bg-blue-500/10 text-blue-700",
    },
    Ovulatory: {
        title: "Ovulatory Phase",
        tip: "Peak energy and fertility. Connect with others and enjoy high-impact workouts. Listen to your body's cues.",
        color: "bg-green-500/10 text-green-700",
    },
    Luteal: {
        title: "Luteal Phase",
        tip: "Energy may start to decrease. Focus on self-care and calming activities. Complex carbs can help with mood and cravings.",
        color: "bg-yellow-500/10 text-yellow-700",
    },
};

export default function PeriodTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [currentPhase, setCurrentPhase] = useState<keyof typeof phaseTips | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

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
  }, []);

  function calculatePredictions(data: CycleData) {
    const lutealPhase = data.lutealPhaseLength || 14;
    const nextPeriodStart = addDays(data.lastPeriodDate, data.cycleLength);
    const ovulationDay = addDays(nextPeriodStart, -lutealPhase);
    const fertileWindowStart = addDays(ovulationDay, -5);
    const fertileWindowEnd = addDays(ovulationDay, 1);

    const newPredictions = {
      nextPeriod: Array.from({ length: 5 }, (_, i) => addDays(nextPeriodStart, i)),
      fertileWindow: { start: fertileWindowStart, end: fertileWindowEnd },
      ovulationDay: ovulationDay,
    };
    setPredictions(newPredictions);

    // Calculate current phase
    const today = startOfDay(new Date());
    const daysIntoCycle = differenceInDays(today, data.lastPeriodDate);
    
    if (daysIntoCycle >= 0 && daysIntoCycle < 5) { // Assuming period lasts 5 days
      setCurrentPhase("Menstrual");
    } else if (isWithinInterval(today, { start: ovulationDay, end: ovulationDay })) {
      setCurrentPhase("Ovulatory");
    } else if (isWithinInterval(today, { start: fertileWindowStart, end: addDays(ovulationDay, -1) })) {
      setCurrentPhase("Follicular"); // Technically also includes pre-ovulation fertile days
    } else if (isWithinInterval(today, {start: addDays(ovulationDay, 1), end: nextPeriodStart})) {
      setCurrentPhase("Luteal");
    } else { // Default to follicular if not in any other phase yet
      setCurrentPhase("Follicular");
    }
    
    const daysUntilNextPeriod = differenceInDays(nextPeriodStart, today);
    setCountdown(daysUntilNextPeriod > 0 ? daysUntilNextPeriod : 0);
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

  const periodDays = predictions ? predictions.nextPeriod : [];
  const fertileDays = predictions ? [predictions.fertileWindow] : [];


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
                          <FormLabel>Luteal Phase Length (optional, 10-18 days)</FormLabel>
                          <FormControl>
                            <Input type="number" min="10" max="18" {...field} />
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
                        <div className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-green-500/80"></span> Ovulation</div>
                    </div>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="multiple"
                        min={1}
                        selected={[...periodDays, ...fertileDays]}
                        defaultMonth={predictions?.nextPeriod[0] || new Date()}
                        modifiers={{
                            fertile: fertileDays,
                            period: periodDays,
                            ovulation: predictions ? [predictions.ovulationDay] : [],
                          }}
                          modifiersClassNames={{
                            fertile: 'bg-blue-400/80 text-blue-foreground rounded-none',
                            period: 'bg-red-400/80 text-red-foreground rounded-none',
                            ovulation: 'bg-green-500/80 text-green-foreground rounded-full font-bold',
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
                    <p className="text-4xl font-bold text-primary">{countdown !== null ? `${countdown} days` : 'N/A'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Current Phase</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentPhase && (
                      <Badge className={cn("text-lg", phaseTips[currentPhase].color)}>
                        {phaseTips[currentPhase].title}
                      </Badge>
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
