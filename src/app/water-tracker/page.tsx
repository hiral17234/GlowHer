
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, differenceInDays, startOfDay, isWithinInterval, isSameDay } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronLeft, Droplet, Plus, Minus, GlassWater, Info, Goal } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AppFooter } from '@/components/glowher/AppFooter';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const FormSchema = z.object({
  goal: z.coerce.number().min(1, "Goal must be at least 1.").positive(),
});

type SettingsFormData = z.infer<typeof FormSchema>;

type Unit = 'cups' | 'ml' | 'oz';

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

const LOCAL_STORAGE_PREFIX = 'glowher-water-tracker-';

export default function WaterTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [intake, setIntake] = useState(0); // Always stored in cups
  const [goal, setGoal] = useState(8); // Always stored in cups
  const [unit, setUnit] = useState<Unit>('cups');
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      goal: 8,
    },
  });

  useEffect(() => {
    // Load settings from local storage
    try {
        const savedSettings = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}settings`);
        if (savedSettings) {
            const { goal: savedGoal, unit: savedUnit } = JSON.parse(savedSettings);
            setGoal(savedGoal);
            setUnit(savedUnit);
            form.setValue('goal', savedGoal * unitConversions[savedUnit]);
        }
    } catch(e) { console.error(e)}
    

    // Load today's intake
    try {
        const savedIntake = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${currentDate}`);
        if (savedIntake) {
            setIntake(JSON.parse(savedIntake));
        } else {
            setIntake(0);
        }
    } catch(e) { console.error(e)}

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
    } catch(e) { console.error(e)}

  }, [currentDate, form]);

  useEffect(() => {
    try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${currentDate}`, JSON.stringify(intake));
    } catch(e) { console.error(e) }
  }, [intake, currentDate]);

  const handleSetUnit = (newUnit: Unit) => {
    const oldGoalInCups = goal;
    const newGoalForDisplay = oldGoalInCups * unitConversions[newUnit];
    setUnit(newUnit);
    form.setValue('goal', Math.round(newGoalForDisplay));
    saveSettings(oldGoalInCups, newUnit);
  };
  
  const saveSettings = (goalInCups: number, unit: Unit) => {
    try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}settings`, JSON.stringify({ goal: goalInCups, unit }));
    } catch (e) {
        console.error(e)
    }
  };

  const onSubmit = (data: SettingsFormData) => {
    const newGoalInCups = data.goal / unitConversions[unit];
    setGoal(newGoalInCups);
    saveSettings(newGoalInCups, unit);
    toast({
      title: "Goal Saved!",
      description: `Your new daily goal is set.`,
    });
  };

  const changeIntake = (amount: number) => { // amount is always in cups
    const newIntake = intake + amount;
    setIntake(prev => Math.max(0, prev + amount));

    if (amount > 0) {
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        toast({
            title: randomMessage,
            description: `You've logged ${Math.round((intake + amount) * unitConversions[unit])} ${unit} so far.`,
        });
    }
  };
  
  const intakeInCurrentUnit = intake * unitConversions[unit];
  const goalInCurrentUnit = goal * unitConversions[unit];
  const progress = goal > 0 ? (intake / goal) * 100 : 0;

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
        <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Water Intake Tracker</h1>
            <p className="mt-2 text-lg text-muted-foreground">Hydration is key to feeling your best. Log your water here.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Tracker */}
            <div className="lg:col-span-2">
                <Card className="shadow-lg h-full">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                           <GlassWater /> Today's Progress ({format(new Date(), "PPP")})
                        </CardTitle>
                        <CardDescription>
                            Your goal is {Math.round(goalInCurrentUnit)} {unit}. You've had {Math.round(intakeInCurrentUnit)} {unit}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-full relative">
                            <Progress value={progress} className="h-8" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-primary-foreground drop-shadow-md">{Math.round(progress)}%</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-center">
                            {Array.from({ length: Math.ceil(goal) }).map((_, i) => (
                                <Droplet key={i} className={cn("h-12 w-12 transition-colors duration-300", i < intake ? "text-blue-400 fill-blue-400" : "text-gray-300")} />
                            ))}
                        </div>

                        <div className="flex items-center justify-center gap-4 pt-4">
                            <Button size="lg" variant="outline" onClick={() => changeIntake(-1)}>
                                <Minus className="mr-2 h-5 w-5"/> Remove Cup
                            </Button>
                            <Button size="lg" onClick={() => changeIntake(1)}>
                                <Plus className="mr-2 h-5 w-5"/> Add Cup
                            </Button>
                        </div>
                         {currentPhase && phaseTips[currentPhase] && (
                            <Alert className="mt-6 bg-blue-500/10 border-blue-500/20">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Tip for your {currentPhase} Phase</AlertTitle>
                                <AlertDescription>
                                    {phaseTips[currentPhase]}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Settings */}
            <div className="lg:col-span-1">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Goal/> Your Goal</CardTitle>
                        <CardDescription>Set your daily hydration target.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <FormLabel>Unit</FormLabel>
                                    <Tabs defaultValue={unit} onValueChange={(value) => handleSetUnit(value as Unit)} className="w-full">
                                        <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="cups">Cups</TabsTrigger>
                                            <TabsTrigger value="ml">ml</TabsTrigger>
                                            <TabsTrigger value="oz">oz</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="goal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Daily Goal ({unit})</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Save Goal</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
