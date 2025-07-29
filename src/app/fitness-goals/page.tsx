
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, subDays, startOfDay, addDays, isWithinInterval, isSameDay, differenceInDays } from 'date-fns';
import { BarChart, Dumbbell, Target, Footprints, Info, ChevronLeft, Heart, Brain, Wind, Edit, Check, Lightbulb, AlertTriangle, HeartPulse, Award, Flame, Star, Activity, ThumbsUp } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from '@/components/ui/switch';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Bar as RechartsBar, BarChart as RechartsBarChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';


// --- SCHEMAS ---
const defaultGoalSchema = z.object({
  steps: z.coerce.number().min(1000, "Minimum 1000 steps").max(50000, "Maximum 50000 steps"),
  workouts: z.coerce.number().min(1, "Minimum 1 workout").max(7, "Maximum 7 workouts"),
});

const defaultLogSchema = z.object({
    steps: z.coerce.number().min(0).max(100000),
    workout: z.string().optional(),
});

const pregnancyGoalSchema = z.object({
    days: z.coerce.number().min(1).max(7),
    activityType: z.string().optional(),
    trackMood: z.boolean().default(false),
});

const pregnancyLogSchema = z.object({
    activity: z.string().min(1, "Please select an activity."),
    minutes: z.coerce.number().min(5, "Minimum 5 minutes.").max(240, "Maximum 240 minutes."),
    feeling: z.string().optional(),
    notes: z.string().max(300).optional(),
});


// --- TYPES ---
type DefaultGoalData = z.infer<typeof defaultGoalSchema>;
type DefaultLogData = z.infer<typeof defaultLogSchema>;
type PregnancyGoalData = z.infer<typeof pregnancyGoalSchema>;
type PregnancyLogData = z.infer<typeof pregnancyLogSchema>;

// --- LOCAL STORAGE KEYS ---
const DEFAULT_GOALS_KEY = 'glowher-fitness-goals';
const DEFAULT_LOG_PREFIX = 'glowher-fitness-log-';
const PREGNANCY_GOALS_KEY = 'glowher-preg-fitness-goals';
const PREGNANCY_LOG_PREFIX = 'glowher-preg-fitness-log-';
const IS_PREGNANT_KEY = 'glowher-fitness-is-pregnant';

// --- DATA ---
const cycleExercises = { Menstrual: { title: "Menstrual Phase: Rest & Recover", icon: Heart, color: "bg-red-500/10 text-red-700", suggestions: ["Gentle walking", "Restorative yoga", "Light stretching"] }, Follicular: { title: "Follicular Phase: Energize", icon: Lightbulb, color: "bg-blue-500/10 text-blue-700", suggestions: ["Brisk walking or jogging", "Dancing", "Light cardio"] }, Ovulatory: { title: "Ovulatory Phase: Peak Power", icon: Dumbbell, color: "bg-green-500/10 text-green-700", suggestions: ["High-Intensity Interval Training (HIIT)", "Running", "Strength training"] }, Luteal: { title: "Luteal Phase: Wind Down", icon: Wind, color: "bg-yellow-500/10 text-yellow-700", suggestions: ["Pilates", "Swimming", "Moderate strength training"] }};
const pregnancyExercises = { '1st Trimester': { title: "First Trimester: Build a Foundation", icon: Heart, suggestions: ["Walking", "Prenatal yoga", "Swimming"], videoUrl: "https://www.youtube.com/embed/Ia6dNwVs1M8" }, '2nd Trimester': { title: "Second Trimester: Maintain Strength", icon: Dumbbell, suggestions: ["Modified strength training", "Swimming", "Stationary cycling"], videoUrl: "https://www.youtube.com/embed/XhqntqSGKsc" }, '3rd Trimester': { title: "Third Trimester: Prepare for Birth", icon: Brain, suggestions: ["Walking", "Stretching", "Birth ball exercises"], videoUrl: "https://www.youtube.com/embed/qkhLev3bKd0" }};
const prenatalYogaVideoUrl = "https://www.youtube.com/embed/zmUJWKM98hM";

const chartConfig = { steps: { label: "Steps", color: "hsl(var(--primary))" }} satisfies ChartConfig;

export default function FitnessGoalsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isPregnant, setIsPregnant] = useState(false);
    const [isEditingGoals, setIsEditingGoals] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<keyof typeof cycleExercises | null>(null);
    const [pregnancyTrimester, setPregnancyTrimester] = useState<keyof typeof pregnancyExercises | null>(null);
    const [weeklyLogs, setWeeklyLogs] = useState<any[]>([]);
    const [weeklyPregnancyLogs, setWeeklyPregnancyLogs] = useState<any[]>([]);
    const [streak, setStreak] = useState(0);

    // --- FORM HOOKS ---
    const defaultGoalForm = useForm<DefaultGoalData>({ resolver: zodResolver(defaultGoalSchema), defaultValues: { steps: 8000, workouts: 3 }});
    const defaultLogForm = useForm<DefaultLogData>({ resolver: zodResolver(defaultLogSchema), defaultValues: { steps: 0, workout: '' }});
    const pregnancyGoalForm = useForm<PregnancyGoalData>({ resolver: zodResolver(pregnancyGoalSchema), defaultValues: { days: 3, activityType: 'Walking', trackMood: true }});
    const pregnancyLogForm = useForm<PregnancyLogData>({ resolver: zodResolver(pregnancyLogSchema), defaultValues: { activity: '', minutes: 30, feeling: 'Energized', notes: '' }});

    // --- DATA LOADING & INITIALIZATION ---
    useEffect(() => {
        try {
            const pregnancyStatus = localStorage.getItem(IS_PREGNANT_KEY) === 'true';
            setIsPregnant(pregnancyStatus);

            if (pregnancyStatus) {
                // Load pregnancy data
                const savedGoals = localStorage.getItem(PREGNANCY_GOALS_KEY);
                if (savedGoals) pregnancyGoalForm.reset(JSON.parse(savedGoals));
                else setIsEditingGoals(true);

                const todayKey = format(new Date(), 'yyyy-MM-dd');
                const savedLog = localStorage.getItem(`${PREGNANCY_LOG_PREFIX}${todayKey}`);
                if (savedLog) pregnancyLogForm.reset(JSON.parse(savedLog));
                
                loadWeeklyPregnancyLogs();
            } else {
                // Load default data
                const savedGoals = localStorage.getItem(DEFAULT_GOALS_KEY);
                if (savedGoals) defaultGoalForm.reset(JSON.parse(savedGoals));
                else setIsEditingGoals(true);

                const todayKey = format(new Date(), 'yyyy-MM-dd');
                const savedLog = localStorage.getItem(`${DEFAULT_LOG_PREFIX}${todayKey}`);
                if (savedLog) defaultLogForm.reset(JSON.parse(savedLog));
                
                loadWeeklyDefaultLogs();
            }
        } catch (e) { console.error("Error loading data from localStorage", e); }
    }, [isPregnant, pregnancyGoalForm, pregnancyLogForm, defaultGoalForm, defaultLogForm]);

    // --- CYCLE/PREGNANCY PHASE DETERMINATION ---
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
        }
    }, [isPregnant]);
    
    // --- DATA LOADING & CALCULATION HELPERS ---
    const loadWeeklyDefaultLogs = () => {
        const today = startOfDay(new Date());
        const data = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(today, i);
            const savedLog = localStorage.getItem(`${DEFAULT_LOG_PREFIX}${format(date, 'yyyy-MM-dd')}`);
            return { name: format(date, 'EEE'), steps: savedLog ? JSON.parse(savedLog).steps : 0 };
        }).reverse();
        setWeeklyLogs(data);
    };

    const loadWeeklyPregnancyLogs = () => {
        const today = startOfDay(new Date());
        const { days: goalDays = 3 } = pregnancyGoalForm.getValues();
        let currentStreak = 0;
        let streakBroken = false;
        
        const logs = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(today, i);
            const savedLog = localStorage.getItem(`${PREGNANCY_LOG_PREFIX}${format(date, 'yyyy-MM-dd')}`);
            const moved = !!savedLog;
            if (!streakBroken && moved) {
                currentStreak++;
            } else {
                streakBroken = true;
            }
            return { name: format(date, 'EEE'), moved: moved ? 1 : 0 };
        }).reverse();
        
        setWeeklyPregnancyLogs(logs);
        setStreak(currentStreak);
    };

    // --- FORM SUBMISSION HANDLERS ---
    function onGoalSubmit(data: DefaultGoalData) { try { localStorage.setItem(DEFAULT_GOALS_KEY, JSON.stringify(data)); toast({ title: "Goals Updated!"}); setIsEditingGoals(false); } catch(e) { toast({ variant: 'destructive', title: "Error" }); }}
    function onLogSubmit(data: DefaultLogData) { try { localStorage.setItem(`${DEFAULT_LOG_PREFIX}${format(new Date(), 'yyyy-MM-dd')}`, JSON.stringify(data)); toast({ title: "Activity Logged!" }); loadWeeklyDefaultLogs(); } catch(e) { toast({ variant: 'destructive', title: "Error" }); }}
    function onPregnancyGoalSubmit(data: PregnancyGoalData) { try { localStorage.setItem(PREGNANCY_GOALS_KEY, JSON.stringify(data)); toast({ title: "Goals Updated!" }); setIsEditingGoals(false); } catch(e) { toast({ variant: 'destructive', title: "Error" }); }}
    function onPregnancyLogSubmit(data: PregnancyLogData) { try { localStorage.setItem(`${PREGNANCY_LOG_PREFIX}${format(new Date(), 'yyyy-MM-dd')}`, JSON.stringify(data)); toast({ title: "Movement Logged!", description: "Wonderful job staying active!" }); loadWeeklyPregnancyLogs(); } catch(e) { toast({ variant: 'destructive', title: "Error" }); }}
    
    // --- EVENT HANDLERS ---
    const handlePregnancyToggle = (checked: boolean) => {
        setIsPregnant(checked);
        setIsEditingGoals(true); // Always require goal setting on mode change
        try { localStorage.setItem(IS_PREGNANT_KEY, String(checked)); } catch(e) { console.error(e); }
    };
    
    const relevantSuggestions = isPregnant ? pregnancyExercises[pregnancyTrimester!] : cycleExercises[currentPhase!];
    const pregnancyVideoUrl = isPregnant && pregnancyTrimester ? pregnancyExercises[pregnancyTrimester!]?.videoUrl : null;
    const completedDays = weeklyPregnancyLogs.filter(d => d.moved).length;
    const goalDays = pregnancyGoalForm.getValues('days');
    const progressPercentage = Math.round((completedDays / goalDays) * 100);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <header className="container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center"><GlowHerLogo /><Button variant="ghost" onClick={() => router.push('/')}><ChevronLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button></div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
                <div className="text-center">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Fitness Goal Planner</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Move mindfully through your health journey.</p>
                </div>

                <Card className="max-w-md mx-auto shadow-lg"><CardHeader><CardTitle>Let's Personalize Your Plan</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between space-x-2"><Label htmlFor="pregnancy-mode" className="text-base">Are you currently pregnant?</Label><Switch id="pregnancy-mode" checked={isPregnant} onCheckedChange={handlePregnancyToggle} /></div></CardContent></Card>

                {isPregnant ? (
                    // --- PREGNANCY MODE UI ---
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <Card className="shadow-lg">
                                <CardHeader><div className="flex justify-between items-center"><CardTitle className="flex items-center gap-2"><Target /> Your Movement Goals</CardTitle><Button variant="ghost" size="icon" onClick={() => setIsEditingGoals(!isEditingGoals)}><Edit className="h-4 w-4"/></Button></div><CardDescription>Set your gentle movement targets for the week.</CardDescription></CardHeader>
                                <CardContent>
                                    {isEditingGoals ? (
                                        <Form {...pregnancyGoalForm}><form onSubmit={pregnancyGoalForm.handleSubmit(onPregnancyGoalSubmit)} className="space-y-4">
                                            <FormField control={pregnancyGoalForm.control} name="days" render={({ field }) => (<FormItem><FormLabel>Days to Move This Week</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                            <FormField control={pregnancyGoalForm.control} name="activityType" render={({ field }) => (<FormItem><FormLabel>Preferred Activity</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an activity" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Walking">Walking</SelectItem><SelectItem value="Prenatal Yoga">Prenatal Yoga</SelectItem><SelectItem value="Light Strength">Light Strength</SelectItem><SelectItem value="Stretching">Stretching</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>
                                            <FormField control={pregnancyGoalForm.control} name="trackMood" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Track Energy/Mood?</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                            <Button type="submit" className="w-full">Save Goals</Button>
                                        </form></Form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-between p-4 rounded-lg bg-muted"><p className="font-medium">Weekly Goal</p><p className="font-bold">{goalDays} days</p></div>
                                            <div className="flex justify-between p-4 rounded-lg bg-muted"><p className="font-medium">Preferred Activity</p><p className="font-bold">{pregnancyGoalForm.getValues('activityType')}</p></div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card className="shadow-lg">
                                <CardHeader><CardTitle className="flex items-center gap-2"><Activity/> Log Today's Movement</CardTitle></CardHeader>
                                <CardContent>
                                    <Form {...pregnancyLogForm}><form onSubmit={pregnancyLogForm.handleSubmit(onPregnancyLogSubmit)} className="space-y-4">
                                        <FormField control={pregnancyLogForm.control} name="activity" render={({ field }) => (<FormItem><FormLabel>Activity</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="What did you do today?" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Walking">Walking</SelectItem><SelectItem value="Prenatal Yoga">Prenatal Yoga</SelectItem><SelectItem value="Stretching">Stretching</SelectItem><SelectItem value="Swimming">Swimming</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>
                                        <FormField control={pregnancyLogForm.control} name="minutes" render={({ field }) => (<FormItem><FormLabel>Minutes Moved</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                        {pregnancyGoalForm.getValues('trackMood') && <FormField control={pregnancyLogForm.control} name="feeling" render={({ field }) => (<FormItem><FormLabel>How did you feel after?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select how you felt" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Energized">Energized</SelectItem><SelectItem value="Tired">Tired</SelectItem><SelectItem value="Sore">Sore</SelectItem><SelectItem value="Relaxed">Relaxed</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>}
                                        <FormField control={pregnancyLogForm.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes (optional)</FormLabel><FormControl><Textarea placeholder="Any thoughts on today's movement?" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                        <Button type="submit" className="w-full">Log Movement</Button>
                                    </form></Form>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-8">
                           <Card className="shadow-lg">
                                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart/> Weekly Progress</CardTitle><CardDescription>You've moved on {completedDays} of your {goalDays} day goal.</CardDescription></CardHeader>
                                <CardContent className="flex justify-center items-center h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={[{ value: 1 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" fill="hsl(var(--muted))" startAngle={90} endAngle={-270} paddingAngle={0} cornerRadius={50} />
                                            <Pie data={[{ value: progressPercentage }, { value: 100 - progressPercentage }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" fill="hsl(var(--primary))" startAngle={90} endAngle={-270} stroke="hsl(var(--primary))" cornerRadius={50}>
                                                <Cell fill="hsl(var(--primary))" />
                                                <Cell fill="transparent" />
                                            </Pie>
                                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold fill-foreground">{`${progressPercentage}%`}</text>
                                            <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-muted-foreground">completed</text>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            <Card className="shadow-lg">
                                <CardHeader><CardTitle className="flex items-center gap-2"><Award/> Achievements</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    <div className={cn("flex items-center gap-4 p-3 rounded-lg", streak > 0 ? "bg-amber-100 dark:bg-amber-900/20" : "bg-muted")}>
                                        <Flame className={cn("h-6 w-6", streak > 0 ? "text-amber-500" : "text-muted-foreground")} />
                                        <div><p className="font-semibold">Consistency Streak</p><p className="text-sm text-muted-foreground">{streak > 0 ? `You're on a ${streak}-day streak!` : "Log a workout today to start a streak."}</p></div>
                                    </div>
                                     <div className={cn("flex items-center gap-4 p-3 rounded-lg", completedDays >= goalDays ? "bg-green-100 dark:bg-green-900/20" : "bg-muted")}>
                                        <Star className={cn("h-6 w-6", completedDays >= goalDays ? "text-green-500" : "text-muted-foreground")} />
                                        <div><p className="font-semibold">Weekly Goal</p><p className="text-sm text-muted-foreground">{completedDays >= goalDays ? "You hit your goal this week!" : "Keep going to reach your weekly goal."}</p></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    // --- DEFAULT MODE UI ---
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <Card className="shadow-lg">
                                <CardHeader><div className="flex justify-between items-center"><CardTitle className="flex items-center gap-2"><Target /> Your Fitness Goals</CardTitle><Button variant="ghost" size="icon" onClick={() => setIsEditingGoals(!isEditingGoals)}><Edit className="h-4 w-4"/></Button></div><CardDescription>Set and edit your daily and weekly targets.</CardDescription></CardHeader>
                                <CardContent>
                                    {isEditingGoals ? (
                                        <Form {...defaultGoalForm}><form onSubmit={defaultGoalForm.handleSubmit(onGoalSubmit)} className="space-y-4">
                                            <FormField control={defaultGoalForm.control} name="steps" render={({ field }) => (<FormItem><FormLabel>Daily Steps Goal</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                            <FormField control={defaultGoalForm.control} name="workouts" render={({ field }) => (<FormItem><FormLabel>Weekly Workouts Goal</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                            <Button type="submit" className="w-full">Save Goals</Button>
                                        </form></Form>
                                    ) : (
                                        <div className="space-y-4"><div className="flex justify-between p-4 rounded-lg bg-muted"><p className="font-medium">Daily Steps</p><p className="font-bold">{defaultGoalForm.getValues('steps').toLocaleString()}</p></div><div className="flex justify-between p-4 rounded-lg bg-muted"><p className="font-medium">Workouts Per Week</p><p className="font-bold">{defaultGoalForm.getValues('workouts')}</p></div></div>
                                    )}
                                </CardContent>
                            </Card>
                             <Card className="shadow-lg">
                                <CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell/> Log Today's Activity</CardTitle><CardDescription>Record your movement for today.</CardDescription></CardHeader>
                                <CardContent>
                                    <Form {...defaultLogForm}><form onChange={defaultLogForm.handleSubmit(onLogSubmit)} className="space-y-4">
                                        <FormField control={defaultLogForm.control} name="steps" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Footprints/> Steps Taken</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                         <FormField control={defaultLogForm.control} name="workout" render={({ field }) => (<FormItem><FormLabel>Type of Workout</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a workout type (optional)" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Walking">Walking</SelectItem><SelectItem value="Running">Running</SelectItem><SelectItem value="Yoga">Yoga</SelectItem><SelectItem value="Strength Training">Strength Training</SelectItem><SelectItem value="Cycling">Cycling</SelectItem><SelectItem value="Swimming">Swimming</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>
                                    </form></Form>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-8">
                             <Card className="shadow-lg">
                                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart/> Weekly Progress</CardTitle><CardDescription>Your step count over the last 7 days.</CardDescription></CardHeader>
                                <CardContent>
                                    <div className="h-[250px] w-full"><ChartContainer config={chartConfig} className="min-h-[200px] w-full"><RechartsBarChart data={weeklyLogs} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} /><ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `${Number(value).toLocaleString()} steps`}/>}/><RechartsBar dataKey="steps" fill="hsl(var(--primary))" radius={4} /></RechartsBarChart></ChartContainer></div>
                                    <div className="mt-4"><Progress value={(defaultLogForm.getValues('steps') / defaultGoalForm.getValues('steps')) * 100} className="h-2"/><p className="text-sm text-center mt-2 text-muted-foreground">Today's progress: {defaultLogForm.getValues('steps').toLocaleString()} / {defaultGoalForm.getValues('steps').toLocaleString()} steps</p></div>
                                </CardContent>
                            </Card>
                            {relevantSuggestions && !isPregnant ? (
                                <Card className={`shadow-lg ${relevantSuggestions.color} border-0`}>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><relevantSuggestions.icon/> {relevantSuggestions.title}</CardTitle><CardDescription className="text-foreground/70">Exercises aligned with your current menstrual phase.</CardDescription></CardHeader>
                                    <CardContent><ul className="space-y-2">{relevantSuggestions.suggestions.map(s => (<li key={s} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600"/><span>{s}</span></li>))}</ul></CardContent>
                                </Card>
                            ) : !isPregnant && (
                                <Alert><Info className="h-4 w-4" /><AlertTitle>Enter Your Cycle Data</AlertTitle><AlertDescription>To get personalized fitness suggestions, please enter your details in the Period Tracker.</AlertDescription></Alert>
                            )}
                        </div>
                    </div>
                )}

                {isPregnant && (
                     <div className="mt-12 space-y-8">
                        <div className="flex items-center justify-center mb-4 p-4 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                           <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                           <p className="font-bold text-red-800 dark:text-red-200 text-center">Do consult your doctor before doing this and proceed only if comfortable.</p>
                       </div>
                        {pregnancyVideoUrl && (<Card className="shadow-xl"><CardHeader><CardTitle>Guided Workout for your {pregnancyTrimester}</CardTitle></CardHeader><CardContent><div className="aspect-video"><iframe className="w-full h-full rounded-lg" src={pregnancyVideoUrl} title={`Pregnancy Workout for ${pregnancyTrimester}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div></CardContent></Card>)}
                        <Card className="shadow-xl">
                            <CardHeader><CardTitle className="flex items-center gap-2"><HeartPulse /> Guided Prenatal Yoga</CardTitle><CardDescription>A gentle yoga session suitable for all trimesters.</CardDescription></CardHeader>
                            <CardContent><div className="aspect-video"><iframe className="w-full h-full rounded-lg" src={prenatalYogaVideoUrl} title="Guided Prenatal Yoga" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div></CardContent>
                        </Card>
                   </div>
                )}
            </main>
        </div>
    );
}

    