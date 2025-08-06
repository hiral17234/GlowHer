
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, subDays, startOfDay, addDays, isWithinInterval, isSameDay, startOfWeek } from 'date-fns';
import { BarChart, Dumbbell, Target, Footprints, Info, Heart, Lightbulb, Wind, Edit, Check, AlertTriangle, Award, Flame, ThumbsUp, Activity, Calendar as CalendarIcon, Baby } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig, RechartsBarChart } from '@/components/ui/chart';
import { Bar as RechartsBar, XAxis, YAxis } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AppSidebar } from '@/components/glowher/AppSidebar';
import { FitnessLogHistory } from '@/components/glowher/FitnessLogHistory';


// --- SCHEMAS ---
const defaultGoalSchema = z.object({
  steps: z.coerce.number().min(1000, "Minimum 1000 steps").max(50000, "Maximum 50000 steps"),
  workouts: z.coerce.number().min(1, "Minimum 1 workout").max(7, "Maximum 7 workouts"),
});

const logFormSchema = z.object({
    logDate: z.date(),
    activityType: z.enum(["step-based", "workout-based"]),
    // Step-based fields
    steps: z.coerce.number().min(0).optional(),
    stepWorkoutType: z.string().optional(),
    // Workout-based fields
    workoutType: z.string().optional(),
    duration: z.coerce.number().min(5).optional(),
}).refine(data => {
    if (data.activityType === 'step-based') {
        return data.steps !== undefined && data.steps >= 0 && data.stepWorkoutType;
    }
    return true;
}, { message: "Steps and workout type are required for step-based activities.", path: ['steps']})
.refine(data => {
    if (data.activityType === 'workout-based') {
        return data.workoutType && data.duration;
    }
    return true;
}, { message: "Workout type and duration are required for workout-based activities.", path: ['workoutType'] });


// --- TYPES ---
type DefaultGoalData = z.infer<typeof defaultGoalSchema>;
type LogFormData = z.infer<typeof logFormSchema>;
export type DailyFitnessLog = {
    logDate: string;
    steps?: {
        count: number;
        workoutType: string;
    };
    workout?: {
        type: string;
        duration: number; // in minutes
    };
};

// --- LOCAL STORAGE KEYS ---
const DEFAULT_GOALS_KEY = 'glowher-fitness-goals';
export const DEFAULT_LOG_PREFIX = 'glowher-fitness-log-';
const LAST_DATE_KEY = 'glowher-fitness-last-date';


// --- DATA ---
const cycleExercises = { Menstrual: { title: "Menstrual Phase: Rest & Recover", icon: Heart, color: "text-red-600 font-bold", suggestions: ["Gentle walking", "Restorative yoga", "Light stretching"] }, Follicular: { title: "Follicular Phase: Energize", icon: Lightbulb, color: "text-blue-400", suggestions: ["Brisk walking or jogging", "Dancing", "Light cardio"] }, Ovulatory: { title: "Ovulatory Phase: Peak Power", icon: Dumbbell, color: "text-green-400", suggestions: ["High-Intensity Interval Training (HIIT)", "Running", "Strength training"] }, Luteal: { title: "Luteal Phase: Wind Down", icon: Wind, color: "text-yellow-400", suggestions: ["Pilates", "Swimming", "Moderate strength training"] }};

const stepChartConfig = { steps: { label: "Steps", color: "hsl(var(--primary))" }} satisfies ChartConfig;
const workoutChartConfig = { minutes: { label: "Minutes", color: "hsl(142.1 76.2% 36.3%)" }} satisfies ChartConfig;


export default function FitnessGoalsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isEditingGoals, setIsEditingGoals] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<keyof typeof cycleExercises | null>(null);
    const [weeklyStepLogs, setWeeklyStepLogs] = useState<{name: string, steps: number}[]>([]);
    const [weeklyWorkoutLogs, setWeeklyWorkoutLogs] = useState<{name: string, minutes: number}[]>([]);
    const [streak, setStreak] = useState(0);
    const [selectedActivityType, setSelectedActivityType] = useState<'step-based' | 'workout-based'>('step-based');
    const [completedWorkouts, setCompletedWorkouts] = useState(0);
    const [isChartLoading, setIsChartLoading] = useState(true);
    const [historyKey, setHistoryKey] = useState(0); // Used to force-rerender history

    // --- FORM HOOKS ---
    const defaultGoalForm = useForm<DefaultGoalData>({ resolver: zodResolver(defaultGoalSchema), defaultValues: { steps: 8000, workouts: 3 }});
    const logForm = useForm<LogFormData>({ 
        resolver: zodResolver(logFormSchema), 
        defaultValues: { 
            logDate: new Date(),
            activityType: 'step-based', 
            steps: 0, 
            stepWorkoutType: 'Walking',
        }
    });
    
    // --- DATA LOADING & INITIALIZATION ---
    useEffect(() => {
        setIsChartLoading(true);
        try {
            const savedGoals = localStorage.getItem(DEFAULT_GOALS_KEY);
            if (savedGoals) defaultGoalForm.reset(JSON.parse(savedGoals));
            else setIsEditingGoals(true);
            
            const lastDateStr = sessionStorage.getItem(LAST_DATE_KEY);
            const initialDate = lastDateStr ? new Date(lastDateStr) : new Date();

            loadLogForDate(initialDate);
            logForm.setValue('logDate', initialDate);

            loadWeeklyLogs();

        } catch (e) { console.error("Error loading data from localStorage", e); }
        finally {
            setIsChartLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadLogForDate = (date: Date) => {
        const key = `${DEFAULT_LOG_PREFIX}${format(date, 'yyyy-MM-dd')}`;
        try {
            const savedData = localStorage.getItem(key);
            if (savedData) {
                const parsedData: DailyFitnessLog = JSON.parse(savedData);
                logForm.reset({
                    logDate: date,
                    activityType: 'step-based',
                    steps: parsedData.steps?.count || 0,
                    stepWorkoutType: parsedData.steps?.workoutType || 'Walking',
                    workoutType: parsedData.workout?.type || undefined,
                    duration: parsedData.workout?.duration || undefined,
                });
                setSelectedActivityType('step-based');
            } else {
                logForm.reset({
                    logDate: date,
                    activityType: 'step-based',
                    steps: 0,
                    stepWorkoutType: 'Walking',
                    duration: undefined,
                    workoutType: undefined,
                });
                setSelectedActivityType('step-based');
            }
        } catch (error) {
            console.error("Failed to read default log from localStorage", error);
        }
    }


     // Effect for handling date changes in default log form
    const watchedDefaultLogDate = logForm.watch('logDate');
    useEffect(() => {
        if (!watchedDefaultLogDate) return;
        
        try {
            const lastDateStr = sessionStorage.getItem(LAST_DATE_KEY);
            if (!lastDateStr || !isSameDay(new Date(lastDateStr), watchedDefaultLogDate)) {
                loadLogForDate(watchedDefaultLogDate);
                sessionStorage.setItem(LAST_DATE_KEY, watchedDefaultLogDate.toISOString());
            }
        } catch (e) { console.error(e) }
     // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [watchedDefaultLogDate]);
 

    // --- CYCLE/PREGNANCY PHASE DETERMINATION ---
    useEffect(() => {
        try {
            const periodData = localStorage.getItem('glowher-period-tracker');
            if (periodData) {
                const data = JSON.parse(periodData);
                const today = startOfDay(new Date());
                let currentCycleStartDate = startOfDay(new Date(data.lastPeriodDate));
                while (addDays(currentCycleStartDate, data.cycleLength) <= today) {
                    currentCycleStartDate = addDays(currentCycleStartDate, data.cycleLength);
                }
                const nextPeriodStart = addDays(currentCycleStartDate, data.cycleLength);
                const ovulationDay = addDays(nextPeriodStart, -(data.lutealPhaseLength || 14));
                const periodEnd = addDays(currentCycleStartDate, 4);

                if (isWithinInterval(today, { start: currentCycleStartDate, end: periodEnd })) setCurrentPhase("Menstrual");
                else if (isWithinInterval(today, { start: addDays(periodEnd, 1), end: addDays(ovulationDay, -1) })) setCurrentPhase("Follicular");
                else if (isSameDay(today, ovulationDay)) setCurrentPhase("Ovulatory");
                else if (isWithinInterval(today, { start: addDays(ovulationDay, 1), end: addDays(nextPeriodStart, -1) })) setCurrentPhase("Luteal");
            }
        } catch(e) { console.error(e); }
    }, []);
    
    // --- DATA LOADING & CALCULATION HELPERS ---
    const loadWeeklyLogs = () => {
        setIsChartLoading(true);
        const today = startOfDay(new Date());
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        let workoutsThisWeek = 0;
        let consecutiveDays = 0;
        let streakBroken = false;

        // Streak calculation
        for (let i = 0; i < 365; i++) {
            const date = subDays(today, i);
            const logKey = `${DEFAULT_LOG_PREFIX}${format(date, 'yyyy-MM-dd')}`;
            const log = localStorage.getItem(logKey);
            if (log) {
                const parsedLog: DailyFitnessLog = JSON.parse(log);
                if ((parsedLog.steps && parsedLog.steps.count > 0) || (parsedLog.workout && parsedLog.workout.duration > 0)) {
                    if (!streakBroken) consecutiveDays++;
                } else {
                     streakBroken = true;
                }
            } else {
                if (!streakBroken) {
                    // It's only a break if it's not today
                    if (!isSameDay(date, today)) {
                         streakBroken = true;
                    }
                }
            }
        }
        setStreak(consecutiveDays);
    
        // Chart and weekly goal data
        const stepData: {name: string, steps: number}[] = [];
        const workoutData: {name: string, minutes: number}[] = [];

        for (let i = 0; i < 7; i++) {
            const date = addDays(weekStart, i);
            const dayName = format(date, 'EEE');
            const logKey = `${DEFAULT_LOG_PREFIX}${format(date, 'yyyy-MM-dd')}`;
            const savedLog = localStorage.getItem(logKey);
            
            let steps = 0;
            let minutes = 0;

            if (savedLog) {
                try {
                    const logData: DailyFitnessLog = JSON.parse(savedLog);
                    if (logData.workout && logData.workout.duration > 0) {
                        minutes = logData.workout.duration;
                        workoutsThisWeek++;
                    }
                    if (logData.steps && logData.steps.count > 0) {
                        steps = logData.steps.count;
                    }
                } catch(e) { console.error("Error parsing log for chart", e); }
            }
            stepData.push({ name: dayName, steps });
            workoutData.push({ name: dayName, minutes });
        }
        setWeeklyStepLogs(stepData);
        setWeeklyWorkoutLogs(workoutData);
        setCompletedWorkouts(workoutsThisWeek);
        setIsChartLoading(false);
    };

    // --- FORM SUBMISSION HANDLERS ---
    function onGoalSubmit(data: DefaultGoalData) { try { localStorage.setItem(DEFAULT_GOALS_KEY, JSON.stringify(data)); toast({ title: "Goals Updated!"}); setIsEditingGoals(false); } catch(e) { toast({ variant: 'destructive', title: "Error" }); }}
    
    function onLogSubmit(data: LogFormData) { 
        try { 
            const logKey = `${DEFAULT_LOG_PREFIX}${format(data.logDate, 'yyyy-MM-dd')}`;

            // Read existing log for the day
            const existingLogJSON = localStorage.getItem(logKey);
            let dayLog: DailyFitnessLog = existingLogJSON 
                ? JSON.parse(existingLogJSON) 
                : { logDate: format(data.logDate, 'yyyy-MM-dd') };

            const wasWorkoutPreviouslyLogged = !!dayLog.workout && dayLog.workout.duration > 0;
            let toastMessage = "";

            if (data.activityType === 'step-based' && data.steps !== undefined && data.stepWorkoutType) {
                dayLog.steps = { count: data.steps, workoutType: data.stepWorkoutType };
                toastMessage = `Logged ${data.steps?.toLocaleString()} steps for ${format(data.logDate, 'PPP')}.`;
            } else if (data.activityType === 'workout-based' && data.duration && data.workoutType) {
                dayLog.workout = { type: data.workoutType, duration: data.duration };
                toastMessage = `Logged ${data.duration} minutes of ${data.workoutType} for ${format(data.logDate, 'PPP')}.`;
            }
            
            localStorage.setItem(logKey, JSON.stringify(dayLog)); 
            toast({ title: "Activity Logged!", description: toastMessage });
            
            loadWeeklyLogs();
            setHistoryKey(k => k + 1); // Force history component to re-render

            const isWorkoutNewlyLogged = !!dayLog.workout && dayLog.workout.duration > 0;
            const workoutGoal = defaultGoalForm.getValues('workouts');

            // Recalculate completed workouts for the week to check for goal completion
            const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
            let currentWeekWorkouts = 0;
            for (let i = 0; i < 7; i++) {
                const date = addDays(weekStart, i);
                const key = `${DEFAULT_LOG_PREFIX}${format(date, 'yyyy-MM-dd')}`;
                const logJSON = localStorage.getItem(key);
                if (logJSON) {
                    const log: DailyFitnessLog = JSON.parse(logJSON);
                    if (log.workout && log.workout.duration > 0) {
                        currentWeekWorkouts++;
                    }
                }
            }

            if (!wasWorkoutPreviouslyLogged && isWorkoutNewlyLogged && currentWeekWorkouts >= workoutGoal) {
                 toast({
                    title: "Weekly Goal Met!",
                    description: "Congratulations on hitting your weekly workout goal!",
                });
            }

        } catch(e) { 
            console.error(e); 
            toast({ variant: 'destructive', title: "Error Logging Activity" }); 
        }
    }
    
    const relevantSuggestions = currentPhase ? cycleExercises[currentPhase] : null;
    
    const todayLog = weeklyStepLogs.find(log => log.name === format(new Date(), 'EEE'));
    const todaySteps = todayLog ? todayLog.steps : 0;
    const { steps: stepGoal, workouts: workoutGoal } = defaultGoalForm.getValues();

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground bg-cover bg-center" style={{backgroundImage: "url('https://i.pinimg.com/1200x/e6/6b/c3/e66bc350d928193530331c3a233498bf.jpg')"}}>
            <div className="flex">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
                        <div className="max-w-6xl mx-auto space-y-8">
                            <div className="text-center">
                                <h1 className="font-headline text-4xl md:text-5xl font-bold">Fitness Goal Planner</h1>
                                <p className="mt-2 text-lg text-muted-foreground">Move mindfully through your health journey.</p>
                            </div>

                            <Card className="max-w-md mx-auto shadow-lg bg-background/80 backdrop-blur-sm border-border">
                                <CardHeader>
                                    <CardTitle>Tracking a Pregnancy?</CardTitle>
                                    <CardDescription>Switch to our dedicated pregnancy fitness tracker.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={() => router.push('/pregnancy-fitness')} className="w-full">
                                        <Baby className="mr-2 h-4 w-4" /> Go to Pregnancy Tracker
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <Card className="shadow-lg bg-background/80 backdrop-blur-sm border-border">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="flex items-center gap-2"><Target /> Your Fitness Goals</CardTitle>
                                                <Button variant="ghost" size="icon" onClick={() => setIsEditingGoals(!isEditingGoals)}><Edit className="h-4 w-4"/></Button>
                                            </div>
                                            <CardDescription>Set and edit your daily and weekly targets.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {isEditingGoals ? (
                                                <Form {...defaultGoalForm}>
                                                    <form onSubmit={defaultGoalForm.handleSubmit(onGoalSubmit)} className="space-y-4">
                                                        <FormField control={defaultGoalForm.control} name="steps" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Footprints/>Daily Steps Goal</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                                        <FormField control={defaultGoalForm.control} name="workouts" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Dumbbell/>Weekly Workouts Goal</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                                        <Button type="submit" className="w-full">Save Goals</Button>
                                                    </form>
                                                </Form>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between p-4 rounded-lg bg-muted"><p className="font-medium">Daily Steps</p><p className="font-bold">{stepGoal.toLocaleString()}</p></div>
                                                    <div className="flex justify-between p-4 rounded-lg bg-muted"><p className="font-medium">Workouts Per Week</p><p className="font-bold">{workoutGoal}</p></div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <Card className="shadow-lg bg-background/80 backdrop-blur-sm border-border">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><Dumbbell/> Log Activity</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Form {...logForm}>
                                                <form onSubmit={logForm.handleSubmit(onLogSubmit)} className="space-y-4">
                                                    <FormField control={logForm.control} name="logDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4"/>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={"w-[240px] pl-3 text-left font-normal"}><CalendarIcon className="ml-auto h-4 w-4 opacity-50" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /></PopoverContent></Popover><FormMessage/></FormItem>)}/>
                                                    <FormField
                                                        control={logForm.control}
                                                        name="activityType"
                                                        render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2"><Activity/>Activity Type</FormLabel>
                                                            <Select onValueChange={(value) => { field.onChange(value); setSelectedActivityType(value as any); }} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Select an activity type" /></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="step-based">Step-based (e.g., Walking, Running)</SelectItem>
                                                                    <SelectItem value="workout-based">Non-step workout (e.g., Yoga, Strength Training, Dance)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                        )}
                                                    />
                                                    {selectedActivityType === 'step-based' && (
                                                        <>
                                                            <FormField control={logForm.control} name="steps" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Footprints/> Steps Taken</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                                            <FormField control={logForm.control} name="stepWorkoutType" render={({ field }) => (<FormItem><FormLabel>Type of Step-Based Workout</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a workout" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Walking">Walking</SelectItem><SelectItem value="Running">Running</SelectItem><SelectItem value="Hiking">Hiking</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>
                                                        </>
                                                    )}
                                                    {selectedActivityType === 'workout-based' && (
                                                        <>
                                                            <FormField control={logForm.control} name="workoutType" render={({ field }) => (<FormItem><FormLabel>Workout Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a workout" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Yoga">Yoga</SelectItem><SelectItem value="Strength Training">Strength Training</SelectItem><SelectItem value="Pilates">Pilates</SelectItem><SelectItem value="Dance">Dance</SelectItem><SelectItem value="Cycling">Cycling</SelectItem><SelectItem value="Swimming">Swimming</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>
                                                            <FormField control={logForm.control} name="duration" render={({ field }) => (<FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                                        </>
                                                    )}
                                                    <Button type="submit" className="w-full">Log Activity</Button>
                                                </form>
                                            </Form>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="space-y-8">
                                    <Card className="shadow-lg bg-background/80 backdrop-blur-sm border-border">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><BarChart/> Weekly Step Progress</CardTitle>
                                            <CardDescription>Your step count over this week (Mon-Sun).</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {isChartLoading ? (
                                                <div className="flex justify-center items-center h-[200px]">
                                                    <Skeleton className="h-full w-full" />
                                                </div>
                                            ) : weeklyStepLogs.some(log => log.steps > 0) ? (
                                                <ChartContainer config={stepChartConfig} className="w-full h-[200px]">
                                                    <RechartsBarChart accessibilityLayer data={weeklyStepLogs} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                                        <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `${Number(value).toLocaleString()} steps`}/>}/>
                                                        <RechartsBar dataKey="steps" fill="hsl(var(--primary))" radius={4} />
                                                    </RechartsBarChart>
                                                </ChartContainer>
                                            ) : (
                                                <div className="flex justify-center items-center h-[200px] text-muted-foreground">
                                                    No step activity logged this week.
                                                </div>
                                            )}
                                            <div className="mt-4">
                                                <Progress value={(todaySteps / stepGoal) * 100} className="h-2 bg-muted [&>span]:bg-primary" />
                                                <p className="text-sm text-center mt-2 text-muted-foreground">Today's progress: {todaySteps.toLocaleString()} / {stepGoal.toLocaleString()} steps</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="shadow-lg bg-background/80 backdrop-blur-sm border-border">
                                        <CardHeader><CardTitle className="flex items-center gap-2"><Award/> Achievements</CardTitle></CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className={cn("flex items-center gap-4 p-3 rounded-lg", streak > 0 ? "bg-amber-100" : "bg-muted")}>
                                                <Flame className={cn("h-6 w-6", streak > 0 ? "text-amber-500" : "text-muted-foreground")} />
                                                <div>
                                                    <p className="font-semibold">Consistency Streak</p>
                                                    <p className="text-sm text-muted-foreground">{streak > 0 ? `You're on a ${streak}-day streak!` : "Log an activity today to start a streak."}</p>
                                                </div>
                                            </div>
                                            <div className={cn("flex items-center gap-4 p-3 rounded-lg", completedWorkouts >= workoutGoal ? "bg-primary/20" : "bg-muted")}>
                                                <ThumbsUp className={cn("h-6 w-6", completedWorkouts >= workoutGoal ? "text-primary" : "text-muted-foreground")} />
                                                <div>
                                                    <p className="font-semibold">Weekly Goal</p>
                                                    <p className="text-sm text-muted-foreground">{completedWorkouts >= workoutGoal ? "You hit your weekly workout goal!" : `Logged ${completedWorkouts} of ${workoutGoal} workouts this week.`}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                     <Card className="shadow-lg bg-background/80 backdrop-blur-sm border-border">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><BarChart/> Weekly Workout Minutes</CardTitle>
                                            <CardDescription>Your non-step workout duration this week (Mon-Sun).</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {isChartLoading ? (
                                                <div className="flex justify-center items-center h-[200px]">
                                                    <Skeleton className="h-full w-full" />
                                                </div>
                                            ) : weeklyWorkoutLogs.some(log => log.minutes > 0) ? (
                                                <ChartContainer config={workoutChartConfig} className="w-full h-[200px]">
                                                    <RechartsBarChart accessibilityLayer data={weeklyWorkoutLogs} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="m" />
                                                        <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `${value} minutes`}/>}/>
                                                        <RechartsBar dataKey="minutes" fill="var(--color-minutes)" radius={4} />
                                                    </RechartsBarChart>
                                                </ChartContainer>
                                            ) : (
                                                <div className="flex justify-center items-center h-[200px] text-muted-foreground">
                                                    No non-step workouts logged this week.
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                    {relevantSuggestions && (
                                        <Card className={cn("shadow-lg bg-background/80 backdrop-blur-sm border-border")}>
                                            <CardHeader>
                                                <CardTitle className={cn("flex items-center gap-2", relevantSuggestions.color)}>
                                                    <relevantSuggestions.icon/> {relevantSuggestions.title}
                                                </CardTitle>
                                                <CardDescription>Exercises aligned with your current menstrual phase.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-2">
                                                    {relevantSuggestions.suggestions.map(s => (
                                                        <li key={s} className="flex items-center gap-2">
                                                            <Check className={cn("h-4 w-4 text-green-500", currentPhase === 'Menstrual' && "text-red-500")} />
                                                            <span className={cn(currentPhase === 'Menstrual' && "font-bold text-slate-800")}>{s}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )}
                                    {!relevantSuggestions && (
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>Enter Your Cycle Data</AlertTitle>
                                            <AlertDescription>To get personalized fitness suggestions, please enter your details in the Period Tracker.</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </div>
                            <FitnessLogHistory key={historyKey} />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
