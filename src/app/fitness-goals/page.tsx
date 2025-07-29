
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, subDays, startOfDay, addDays, isWithinInterval, isSameDay } from 'date-fns';
import { BarChart, Dumbbell, Target, Footprints, Info, ChevronLeft, Heart, Brain, Wind, Edit, Check, Lightbulb } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from '@/components/ui/switch';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Bar as RechartsBar } from 'recharts';

const GOALS_KEY = 'glowher-fitness-goals';
const LOG_PREFIX = 'glowher-fitness-log-';

const goalSchema = z.object({
  steps: z.coerce.number().min(1000, "Minimum 1000 steps").max(50000, "Maximum 50000 steps"),
  workouts: z.coerce.number().min(1, "Minimum 1 workout").max(7, "Maximum 7 workouts"),
});

const logSchema = z.object({
    steps: z.coerce.number().min(0).max(100000),
    workout: z.string().optional(),
});

type GoalData = z.infer<typeof goalSchema>;
type LogData = z.infer<typeof logSchema>;

const cycleExercises = {
    Menstrual: {
        title: "Menstrual Phase: Rest & Recover",
        icon: Heart,
        color: "bg-red-500/10 text-red-700",
        suggestions: ["Gentle walking", "Restorative yoga", "Light stretching", "Mindful breathing"]
    },
    Follicular: {
        title: "Follicular Phase: Energize",
        icon: Lightbulb,
        color: "bg-blue-500/10 text-blue-700",
        suggestions: ["Brisk walking or jogging", "Dancing", "Light cardio (cycling, elliptical)", "Flow yoga"]
    },
    Ovulatory: {
        title: "Ovulatory Phase: Peak Power",
        icon: Dumbbell,
        color: "bg-green-500/10 text-green-700",
        suggestions: ["High-Intensity Interval Training (HIIT)", "Running", "Strength training", "Spin class"]
    },
    Luteal: {
        title: "Luteal Phase: Wind Down",
        icon: Wind,
        color: "bg-yellow-500/10 text-yellow-700",
        suggestions: ["Pilates", "Swimming", "Moderate strength training", "Long walks"]
    },
};

const pregnancyExercises = {
    '1st Trimester': {
        title: "First Trimester: Build a Foundation",
        icon: Heart,
        color: "bg-teal-500/10 text-teal-700",
        suggestions: ["Walking", "Prenatal yoga", "Swimming", "Low-impact aerobics"]
    },
    '2nd Trimester': {
        title: "Second Trimester: Maintain Strength",
        icon: Dumbbell,
        color: "bg-purple-500/10 text-purple-700",
        suggestions: ["Modified strength training (avoid lying flat)", "Swimming", "Stationary cycling", "Pelvic floor exercises"]
    },
    '3rd Trimester': {
        title: "Third Trimester: Prepare for Birth",
        icon: Brain,
        color: "bg-pink-500/10 text-pink-700",
        suggestions: ["Walking", "Stretching", "Birth ball exercises", "Deep breathing"]
    },
};

const chartConfig = {
  steps: {
    label: "Steps",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function FitnessGoalsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isPregnant, setIsPregnant] = useState(false);
    const [isEditingGoals, setIsEditingGoals] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<keyof typeof cycleExercises | null>(null);
    const [pregnancyTrimester, setPregnancyTrimester] = useState<keyof typeof pregnancyExercises | null>(null);
    const [weeklyLogs, setWeeklyLogs] = useState<any[]>([]);

    const goalForm = useForm<GoalData>({
        resolver: zodResolver(goalSchema),
        defaultValues: { steps: 8000, workouts: 3 },
    });

    const logForm = useForm<LogData>({
        resolver: zodResolver(logSchema),
        defaultValues: { steps: 0, workout: '' },
    });
    
    // Load data on mount
    useEffect(() => {
        try {
            // Load goals
            const savedGoals = localStorage.getItem(GOALS_KEY);
            if (savedGoals) {
                goalForm.reset(JSON.parse(savedGoals));
            } else {
                setIsEditingGoals(true); // Prompt user to set goals if none exist
            }
            
            // Load today's log
            const todayKey = format(new Date(), 'yyyy-MM-dd');
            const savedLog = localStorage.getItem(`${LOG_PREFIX}${todayKey}`);
            if (savedLog) {
                logForm.reset(JSON.parse(savedLog));
            }

            // Load pregnancy status
            const pregnancyStatus = localStorage.getItem('glowher-fitness-is-pregnant');
            setIsPregnant(pregnancyStatus === 'true');

            // Load weekly logs for chart
            loadWeeklyLogs();
        } catch (e) { console.error("Error loading data from localStorage", e); }
    }, [goalForm, logForm]);

     // Determine cycle phase or pregnancy trimester
    useEffect(() => {
        if (isPregnant) {
            setCurrentPhase(null);
            try {
                const pregData = localStorage.getItem('glowher-pregnancy-tracker');
                if (pregData) {
                    const { dueDate } = JSON.parse(pregData);
                    const totalDays = differenceInDays(new Date(), subDays(new Date(dueDate), 280));
                    const week = Math.floor(totalDays / 7);
                    if (week >= 28) setPregnancyTrimester('3rd Trimester');
                    else if (week >= 14) setPregnancyTrimester('2nd Trimester');
                    else setPregnancyTrimester('1st Trimester');
                }
            } catch(e) { console.error("Error getting pregnancy data", e) }
        } else {
            setPregnancyTrimester(null);
            try {
                const periodData = localStorage.getItem('glowher-period-tracker');
                if (periodData) {
                    const data = JSON.parse(periodData);
                    const today = startOfDay(new Date());
                    const lastPeriod = startOfDay(new Date(data.lastPeriodDate));
                    let currentCycleStartDate = lastPeriod;
                    while (addDays(currentCycleStartDate, data.cycleLength) <= today) {
                        currentCycleStartDate = addDays(currentCycleStartDate, data.cycleLength);
                    }
                    const nextPeriodStart = addDays(currentCycleStartDate, data.cycleLength);
                    const ovulationDay = addDays(nextPeriodStart, data.lutealPhaseLength || 14);
                    const periodEnd = addDays(currentCycleStartDate, 4);

                    if (isWithinInterval(today, { start: currentCycleStartDate, end: periodEnd })) setCurrentPhase("Menstrual");
                    else if (isWithinInterval(today, { start: addDays(periodEnd, 1), end: addDays(ovulationDay, -1) })) setCurrentPhase("Follicular");
                    else if (isSameDay(today, ovulationDay)) setCurrentPhase("Ovulatory");
                    else if (isWithinInterval(today, { start: addDays(ovulationDay, 1), end: addDays(nextPeriodStart, -1) })) setCurrentPhase("Luteal");
                }
            } catch(e) { console.error(e); }
        }
    }, [isPregnant]);


    const loadWeeklyLogs = () => {
        const today = startOfDay(new Date());
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(today, i);
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayName = format(date, 'EEE');
            const savedLog = localStorage.getItem(`${LOG_PREFIX}${dateKey}`);
            data.push({
                name: dayName,
                steps: savedLog ? JSON.parse(savedLog).steps : 0,
            });
        }
        setWeeklyLogs(data);
    };


    function onGoalSubmit(data: GoalData) {
        try {
            localStorage.setItem(GOALS_KEY, JSON.stringify(data));
            toast({ title: "Goals Updated!", description: "Your new fitness goals have been saved." });
            setIsEditingGoals(false);
        } catch(e) { toast({ variant: 'destructive', title: "Error", description: "Could not save goals." }); }
    }
    
    function onLogSubmit(data: LogData) {
        try {
            const todayKey = format(new Date(), 'yyyy-MM-dd');
            localStorage.setItem(`${LOG_PREFIX}${todayKey}`, JSON.stringify(data));
            toast({ title: "Activity Logged!", description: "Great job! Your activity for today is saved." });
            loadWeeklyLogs();
        } catch(e) { toast({ variant: 'destructive', title: "Error", description: "Could not save activity." }); }
    }
    
    const handlePregnancyToggle = (checked: boolean) => {
        setIsPregnant(checked);
        try {
            localStorage.setItem('glowher-fitness-is-pregnant', String(checked));
        } catch(e) { console.error(e); }
    };
    
    const relevantSuggestions = isPregnant ? pregnancyExercises[pregnancyTrimester!] : cycleExercises[currentPhase!];

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

            <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
                <div className="text-center">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Fitness Goal Planner</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Move mindfully through your health journey.</p>
                </div>

                <Card className="max-w-md mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle>Let's Personalize Your Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="pregnancy-mode" className="text-base">Are you currently pregnant?</Label>
                            <Switch id="pregnancy-mode" checked={isPregnant} onCheckedChange={handlePregnancyToggle} />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2"><Target /> Your Fitness Goals</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setIsEditingGoals(!isEditingGoals)}>
                                        <Edit className="h-4 w-4"/>
                                    </Button>
                                </div>
                                <CardDescription>Set and edit your daily and weekly targets.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isEditingGoals ? (
                                    <Form {...goalForm}>
                                        <form onSubmit={goalForm.handleSubmit(onGoalSubmit)} className="space-y-4">
                                            <FormField control={goalForm.control} name="steps" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Daily Steps Goal</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}/>
                                            <FormField control={goalForm.control} name="workouts" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Weekly Workouts Goal</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}/>
                                            <Button type="submit" className="w-full">Save Goals</Button>
                                        </form>
                                    </Form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between p-4 rounded-lg bg-muted">
                                            <p className="font-medium">Daily Steps</p>
                                            <p className="font-bold">{goalForm.getValues('steps').toLocaleString()}</p>
                                        </div>
                                        <div className="flex justify-between p-4 rounded-lg bg-muted">
                                            <p className="font-medium">Workouts Per Week</p>
                                            <p className="font-bold">{goalForm.getValues('workouts')}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Dumbbell/> Log Today's Activity</CardTitle>
                                <CardDescription>Record your movement for today.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...logForm}>
                                    <form onChange={logForm.handleSubmit(onLogSubmit)} className="space-y-4">
                                        <FormField control={logForm.control} name="steps" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2"><Footprints/> Steps Taken</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}/>
                                         <FormField
                                            control={logForm.control}
                                            name="workout"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type of Workout</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a workout type (optional)" />
                                                    </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Walking">Walking</SelectItem>
                                                        <SelectItem value="Running">Running</SelectItem>
                                                        <SelectItem value="Yoga">Yoga</SelectItem>
                                                        <SelectItem value="Strength Training">Strength Training</SelectItem>
                                                        <SelectItem value="Cycling">Cycling</SelectItem>
                                                        <SelectItem value="Swimming">Swimming</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
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
                    </div>

                    <div className="space-y-8">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><BarChart/> Weekly Progress</CardTitle>
                                <CardDescription>Your step count over the last 7 days.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px] w-full">
                                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                                        <RechartsBarChart data={weeklyLogs} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent
                                                    formatter={(value) => `${Number(value).toLocaleString()} steps`}
                                                />}
                                            />
                                            <RechartsBar dataKey="steps" fill="hsl(var(--primary))" radius={4} />
                                        </RechartsBarChart>
                                    </ChartContainer>
                                </div>
                                <div className="mt-4">
                                    <Progress value={(logForm.getValues('steps') / goalForm.getValues('steps')) * 100} className="h-2"/>
                                    <p className="text-sm text-center mt-2 text-muted-foreground">Today's progress: {logForm.getValues('steps').toLocaleString()} / {goalForm.getValues('steps').toLocaleString()} steps</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {relevantSuggestions ? (
                             <Card className={`shadow-lg ${relevantSuggestions.color} border-0`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <relevantSuggestions.icon/> {relevantSuggestions.title}
                                    </CardTitle>
                                    <CardDescription className="text-foreground/70">
                                        {isPregnant ? "Gentle movements tailored for your current trimester." : "Exercises aligned with your current menstrual phase."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {relevantSuggestions.suggestions.map(s => (
                                            <li key={s} className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-green-600"/>
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ) : (
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>Enter Your Cycle or Pregnancy Data</AlertTitle>
                                <AlertDescription>
                                    To get personalized fitness suggestions, please enter your details in the Period Tracker or activate pregnancy mode.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
