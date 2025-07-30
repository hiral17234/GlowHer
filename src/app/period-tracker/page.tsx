
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, startOfDay } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, ChevronLeft, Info } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';


const formSchema = z.object({
  lastPeriodDate: z.date({ required_error: "Last period date is required." }),
  cycleLength: z.coerce.number().min(21, "Cycle must be at least 21 days").max(45, "Cycle can be at most 45 days"),
  lutealPhaseLength: z.coerce.number().min(10, "Luteal phase is usually 10-18 days").max(18, "Luteal phase is usually 10-18 days").optional(),
});

type CycleData = z.infer<typeof formSchema>;

export default function PeriodTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [predictedPeriods, setPredictedPeriods] = useState<Date[]>([]);
  const [fertileWindows, setFertileWindows] = useState<Date[]>([]);
  const [ovulationDays, setOvulationDays] = useState<Date[]>([]);

  const form = useForm<CycleData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cycleLength: 28,
      lutealPhaseLength: 14,
    },
  });

  const { watch, reset, getValues } = form;
  const { lastPeriodDate, cycleLength, lutealPhaseLength } = watch();

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

  useEffect(() => {
    const { lastPeriodDate, cycleLength, lutealPhaseLength } = getValues();

    if (lastPeriodDate && cycleLength && lutealPhaseLength) {
        const calculatePredictions = () => {
            const today = startOfDay(new Date());
            let currentCycleStart = startOfDay(new Date(lastPeriodDate));

            // Find the start date of the current or last completed cycle
            while (addDays(currentCycleStart, cycleLength) < today) {
                currentCycleStart = addDays(currentCycleStart, cycleLength);
            }

            const allPredictedPeriods: Date[] = [];
            const allFertileWindows: Date[] = [];
            const allOvulationDays: Date[] = [];
            
            // Calculate for the next 2 cycles
            for (let i = 0; i < 2; i++) {
                const nextPeriodStart = addDays(currentCycleStart, cycleLength * (i + 1));
                
                // Period Prediction (5 days)
                for (let j = 0; j < 5; j++) {
                    allPredictedPeriods.push(addDays(nextPeriodStart, j));
                }
                
                // Ovulation Prediction
                const ovulationDay = addDays(nextPeriodStart, -lutealPhaseLength);
                allOvulationDays.push(ovulationDay);
                
                // Fertile Window (Ovulation day + 5 days before)
                for (let j = 0; j < 6; j++) {
                    allFertileWindows.push(addDays(ovulationDay, -j));
                }
            }

            setPredictedPeriods(allPredictedPeriods);
            setFertileWindows(allFertileWindows);
            setOvulationDays(allOvulationDays);
        };
        calculatePredictions();
    }
  }, [lastPeriodDate, cycleLength, lutealPhaseLength, getValues]);


  function onSubmit(values: CycleData) {
    try {
      localStorage.setItem('glowher-period-tracker', JSON.stringify(values));
      toast({
        title: "Success!",
        description: "Your cycle settings have been saved.",
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="w-full max-w-md mx-auto">
                        <Card className="shadow-lg bg-white/70 backdrop-blur-sm border-rose-100">
                        <CardHeader>
                            <CardTitle className="font-headline text-3xl text-rose-800">Cycle Settings</CardTitle>
                            <CardDescription>Update your cycle details for accurate predictions.</CardDescription>
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
                                    <FormLabel>Average Cycle Length (days)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
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
                                                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                            </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                            <p className="max-w-xs">
                                                The time between ovulation and your next period. Usually 10-18 days.
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
                                <Button type="submit" size="lg" className="w-full bg-rose-500 hover:bg-rose-600 text-white">Save Settings</Button>
                            </form>
                            </Form>
                        </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col items-center">
                         <Card className="shadow-lg bg-white/70 backdrop-blur-sm border-rose-100">
                             <CardHeader>
                                <CardTitle className="font-headline text-3xl text-rose-800">Your Cycle Calendar</CardTitle>
                                <CardDescription>Predictions for your upcoming cycles.</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <Calendar
                                    mode="single"
                                    numberOfMonths={2}
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
                                <div className="mt-4 space-y-2 text-sm text-slate-700">
                                    <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-red-400"></div><span>Predicted Period</span></div>
                                    <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-blue-400"></div><span>Fertile Window</span></div>
                                    <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-green-500"></div><span>Predicted Ovulation</span></div>
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
