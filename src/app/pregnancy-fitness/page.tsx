
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, subDays, startOfDay, addDays, isSameDay, differenceInDays, startOfWeek } from 'date-fns';
import { BarChart, Dumbbell, Target, Info, Heart, Brain, Wind, Edit, Check, Lightbulb, AlertTriangle, HeartPulse, Award, Flame, ThumbsUp, Activity, Calendar as CalendarIcon, Baby } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig, RechartsBarChart } from '@/components/ui/chart';
import { Bar as RechartsBar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AppSidebar } from '@/components/glowher/AppSidebar';

// --- SCHEMAS ---
const pregnancyGoalSchema = z.object({
    days: z.coerce.number().min(1, "Minimum 1 day").max(7, "Maximum 7 days"),
    activityType: z.string().optional(),
    trackMood: z.boolean().default(false),
});

const pregnancyLogSchema = z.object({
    logDate: z.date(),
    minutes: z.coerce.number().min(5, "Minimum 5 minutes.").max(240, "Maximum 240 minutes."),
    feeling: z.string().optional(),
    notes: z.string().max(300).optional(),
});


// --- TYPES ---
type PregnancyGoalData = z.infer<typeof pregnancyGoalSchema>;
type PregnancyLogData = z.infer<typeof pregnancyLogSchema>;

// --- LOCAL STORAGE KEYS ---
const PREGNANCY_GOALS_KEY = 'glowher-preg-fitness-goals';
const PREGNANCY_LOG_PREFIX = 'glowher-preg-fitness-log-';
const LAST_DATE_KEY = 'glowher-preg-fitness-last-date';

// --- DATA ---
const pregnancyExercises = { '1st Trimester': { title: "First Trimester: Build a Foundation", icon: Heart, suggestions: ["Walking", "Prenatal yoga", "Swimming"], videoUrl: "https://www.youtube.com/embed/Ia6dNwVs1M8" }, '2nd Trimester': { title: "Second Trimester: Maintain Strength", icon: Dumbbell, suggestions: ["Modified strength training", "Swimming", "Stationary cycling"], videoUrl: "https://www.youtube.com/embed/XhqntqSGKsc" }, '3rd Trimester': { title: "Third Trimester: Prepare for Birth", icon: Brain, suggestions: ["Walking", "Stretching", "Birth ball exercises"], videoUrl: "https://www.youtube.com/embed/qkhLev3bKd0" }};
const prenatalYogaVideoUrl = "https://www.youtube.com/embed/zmUJWKM98hM";

const weeklyActivityChartConfig = { minutes: { label: "Minutes", color: "hsl(var(--primary))" }} satisfies ChartConfig;

export default function PregnancyFitnessPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isEditingGoals, setIsEditingGoals] = useState(false);
    const [pregnancyTrimester, setPregnancyTrimester] = useState<keyof typeof pregnancyExercises | null>(null);
    const [weeklyPregnancyLogs, setWeeklyPregnancyLogs] = useState<{name: string, minutes: number}[]>([]);
    const [streak, setStreak] = useState(0);
    const [duration, setDuration] = useState({ hours: 0, minutes: 30 });
    const [completedDays, setCompletedDays] = useState(0);
    const [isChartLoading, setIsChartLoading] = useState(true);


    // --- FORM HOOKS ---
    const pregnancyGoalForm = useForm<PregnancyGoalData>({ resolver: zodResolver(pregnancyGoalSchema), defaultValues: { days: 3, activityType: 'Walking', trackMood: true }});
    const pregnancyLogForm = useForm<PregnancyLogData>({ resolver: zodResolver(pregnancyLogSchema), defaultValues: { logDate: new Date(), minutes: 30, feeling: 'Energized', notes: '' }});

    // --- DATA LOADING & INITIALIZATION ---
    useEffect(() => {
        setIsChartLoading(true);
        try {
            const savedGoals = localStorage.getItem(PREGNANCY_GOALS_KEY);
            if (savedGoals) pregnancyGoalForm.reset(JSON.parse(savedGoals));
            else setIsEditingGoals(true);

            const lastDateStr = sessionStorage.getItem(LAST_DATE_KEY);
            const initialDate = lastDateStr ? new Date(lastDateStr) : new Date();

            loadLogForDate(initialDate);
            pregnancyLogForm.setValue('logDate', initialDate);
            
            loadWeeklyPregnancyLogs();
        } catch (e) { console.error("Error loading data from localStorage", e); }
        finally {
            setIsChartLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
 
    const loadLogForDate = (date: Date) => {
        const key = `${PREGNANCY_LOG_PREFIX}${format(date, 'yyyy-MM-dd')}`;
        try {
            const savedData = localStorage.getItem(key);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                parsedData.logDate = new Date(parsedData.logDate);
                pregnancyLogForm.reset(parsedData);
                setDuration({ hours: Math.floor(parsedData.minutes / 60), minutes: parsedData.minutes % 60 });
            } else {
                pregnancyLogForm.reset({
                    logDate: date,
                    minutes: 30,
                    feeling: 'Energized',
                    notes: ''
                });
                setDuration({ hours: 0, minutes: 30 });
            }
        } catch (error) { console.error("Failed to read pregnancy log from localStorage", error); }
    };
     // Effect for handling date changes in pregnancy log form
     const watchedPregnancyLogDate = pregnancyLogForm.watch('logDate');
     useEffect(() => {
         if (!watchedPregnancyLogDate) return;

         try {
            const lastDateStr = sessionStorage.getItem(LAST_DATE_KEY);
            if (!lastDateStr || !isSameDay(new Date(lastDateStr), watchedPregnancyLogDate)) {
                loadLogForDate(watchedPregnancyLogDate);
                sessionStorage.setItem(LAST_DATE_KEY, watchedPregnancyLogDate.toISOString());
            }
         } catch(e) { console.error(e) }
     // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [watchedPregnancyLogDate]);
 

    // --- PREGNANCY PHASE DETERMINATION ---
    useEffect(() => {
        try {
            const pregData = localStorage.getItem('glowher-pregnancy-tracker');
            if (pregData) {
                const { dueDate } = JSON.parse(pregData);
                const startDate = subDays(new Date(dueDate), 280);
                const totalDays = differenceInDays(new Date(), startDate);
                const week = Math.floor(totalDays / 7);
                if (week >= 28) setPregnancyTrimester('3rd Trimester');
                else if (week >= 14) setPregnancyTrimester('2nd Trimester');
                else setPregnancyTrimester('1st Trimester');
            }
        } catch(e) { console.error("Error getting pregnancy data", e) }
    }, []);
    
    // --- DATA LOADING & CALCULATION HELPERS ---
    const loadWeeklyPregnancyLogs = () => {
        setIsChartLoading(true);
        const today = startOfDay(new Date());
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        let daysWithLogs = 0;

        // Streak calculation
        let consecutiveDays = 0;
        let streakBroken = false;
        for (let i = 0; i < 365; i++) {
            const date = subDays(today, i);
            const log = localStorage.getItem(`${PREGNANCY_LOG_PREFIX}${format(date, 'yyyy-MM-dd')}`);
            if (log) {
                if(!streakBroken) consecutiveDays++;
            } else {
                streakBroken = true;
            }
        }
        setStreak(consecutiveDays);

        // Weekly chart data (from Monday to Sunday)
        const logs = Array.from({ length: 7 }, (_, i) => {
            const date = addDays(weekStart, i);
            const savedLog = localStorage.getItem(`${PREGNANCY_LOG_PREFIX}${format(date, 'yyyy-MM-dd')}`);
            const minutes = savedLog ? JSON.parse(savedLog).minutes : 0;
            if(minutes > 0) {
                daysWithLogs++;
            }
            return {
                name: format(date, 'EEE'),
                minutes
            };
        });
        
        setWeeklyPregnancyLogs(logs);
        setCompletedDays(daysWithLogs);
        setIsChartLoading(false);
    };

    // --- FORM SUBMISSION HANDLERS ---
    function onPregnancyGoalSubmit(data: PregnancyGoalData) { try { localStorage.setItem(PREGNANCY_GOALS_KEY, JSON.stringify(data)); toast({ title: "Goals Updated!" }); setIsEditingGoals(false); } catch(e) { toast({ variant: 'destructive', title: "Error" }); }}
    function onPregnancyLogSubmit(data: PregnancyLogData) {
         try {
            const prevCompletedDays = completedDays;
            const totalMinutes = duration.hours * 60 + duration.minutes;
            const finalData = { ...data, minutes: totalMinutes };
            
            const validation = pregnancyLogSchema.safeParse(finalData);
            if(!validation.success) {
                validation.error.errors.forEach(err => {
                    const path = err.path[0] as keyof PregnancyLogData;
                    if(path === 'minutes') {
                         toast({ variant: 'destructive', title: "Invalid Duration", description: err.message });
                    }
                });
                return;
            }

            localStorage.setItem(`${PREGNANCY_LOG_PREFIX}${format(data.logDate, 'yyyy-MM-dd')}`, JSON.stringify(finalData));
            toast({ title: "Movement Logged!", description: `Logged ${totalMinutes} minutes for ${format(data.logDate, 'PPP')}.` }); 
            
            const goalDays = pregnancyGoalForm.getValues('days');
            const newCompletedDays = weeklyPregnancyLogs.filter(d => d.minutes > 0).length + (totalMinutes > 0 ? 1 : 0);
            
            loadWeeklyPregnancyLogs();

            if (prevCompletedDays < goalDays && newCompletedDays >= goalDays) {
                toast({
                    title: "Weekly Goal Reached!",
                    description: "Amazing! You've met your movement goal for the week.",
                });
            }
        } catch(e) { 
            toast({ variant: 'destructive', title: "Error", description: "Could not save your log." }); 
        }
    }
    
    const pregnancyVideoUrl = pregnancyTrimester ? pregnancyExercises[pregnancyTrimester!]?.videoUrl : null;
    const goalDays = pregnancyGoalForm.getValues('days');
    const progressPercentage = goalDays > 0 ? Math.round((completedDays / goalDays) * 100) : 0;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
             <div className="flex">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
                        <div className="max-w-6xl mx-auto space-y-8">
                            <div className="text-center">
                                <h1 className="font-headline text-4xl md:text-5xl font-bold">Pregnancy Fitness</h1>
                                <p className="mt-2 text-lg text-muted-foreground">Gentle movement for you and your baby.</p>
                            </div>

                            <Card className="max-w-md mx-auto shadow-lg bg-background/80 backdrop-blur-sm border-border">
                                <CardHeader>
                                    <CardTitle>Not Pregnant?</CardTitle>
                                    <CardDescription>Switch back to standard fitness tracking.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={() => router.push('/fitness-goals')} className="w-full">
                                        <Activity className="mr-2 h-4 w-4" /> Go to Standard Fitness Tracker
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <Card className="shadow-lg bg-background/80 backdrop-blur-sm border-border">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="flex items-center gap-2"><Target /> Your Weekly Movement Goals</CardTitle>
                                                <Button variant="ghost" size="icon" onClick={() => setIsEditingGoals(!isEditingGoals)}><Edit className="h-4 w-4"/></Button>
                                            </div>
                                            <CardDescription>Set your gentle movement targets for the week.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {isEditingGoals ? (
                                                <Form {...pregnancyGoalForm}>
                                                    <form onSubmit={pregnancyGoalForm.handleSubmit(onPregnancyGoalSubmit)} className="space-y-4">
                                                        <FormField control={pregnancyGoalForm.control} name="days" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Target/>Target Active Days This Week</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                                        <FormField control={pregnancyGoalForm.control} name="activityType" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Activity/>Preferred Activity Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an activity" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Walking">Walking</SelectItem><SelectItem value="Prenatal Yoga">Prenatal Yoga</SelectItem><SelectItem value="Light Strength">Light Strength</SelectItem><SelectItem value="Stretching">Stretching</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>
                                                        <FormField control={pregnancyGoalForm.control} name="trackMood" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel className="flex items-center gap-2"><Heart/>Enable Mood/Energy Tracking?</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                                        <Button type="submit" className="w-full">Save Goals</Button>
                                                    </form>
                                                </Form>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between p-4 rounded-lg bg-muted"><p className="font-medium">Weekly Goal</p><p className="font-bold">{goalDays} days</p></div>
                                                    <div className="flex justify-between p-4 rounded-lg bg-muted"><p className="font-medium">Preferred Activity</p><p className="font-bold">{pregnancyGoalForm.getValues('activityType')}</p></div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <Card className="shadow-lg bg-background/80 backdrop-blur-sm border-border">
                                        <CardHeader><CardTitle className="flex items-center gap-2"><Activity/> Log Today's Movement</CardTitle></CardHeader>
                                        <CardContent>
                                            <Form {...pregnancyLogForm}>
                                                <form onSubmit={pregnancyLogForm.handleSubmit(onPregnancyLogSubmit)} className="space-y-4">
                                                    <FormField control={pregnancyLogForm.control} name="logDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4"/>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={"w-[240px] pl-3 text-left font-normal"}><CalendarIcon className="ml-auto h-4 w-4 opacity-50" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /></PopoverContent></Popover><FormMessage/></FormItem>)}/>
                                                    
                                                    <div>
                                                        <Label className="flex items-center gap-2"><Dumbbell/>Time Spent</Label>
                                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                                            <Select onValueChange={(value) => setDuration(d => ({ ...d, hours: Number(value) }))} value={String(duration.hours)}>
                                                                <SelectTrigger><SelectValue placeholder="Hours"/></SelectTrigger>
                                                                <SelectContent>
                                                                    {[...Array(5).keys()].map(h => <SelectItem key={h} value={String(h)}>{h} hr</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                            <Select onValueChange={(value) => setDuration(d => ({ ...d, minutes: Number(value) }))} value={String(duration.minutes)}>
                                                                <SelectTrigger><SelectValue placeholder="Minutes"/></SelectTrigger>
                                                                <SelectContent>
                                                                    {Array.from({length: 60}, (_, i) => i).map(m => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    {pregnancyGoalForm.getValues('trackMood') && <FormField control={pregnancyLogForm.control} name="feeling" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Heart/>How did you feel after?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select how you felt" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Energized">Energized</SelectItem><SelectItem value="Tired">Tired</SelectItem><SelectItem value="Sore">Sore</SelectItem><SelectItem value="Relaxed">Relaxed</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>}
                                                    <FormField control={pregnancyLogForm.control} name="notes" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Lightbulb/>Notes (optional)</FormLabel><FormControl><Textarea placeholder="Any thoughts on today's movement?" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                                    <Button type="submit" className="w-full">Log Movement</Button>
                                                </form>
                                            </Form>
                                        </CardContent>
                                    </Card>
                                    
                                </div>
                                <div className="space-y-8">
                                     <Card className="shadow-lg bg-background/80 backdrop-blur-sm border-border">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><BarChart/> Weekly Activity</CardTitle>
                                            <CardDescription>Your logged minutes over this week (Mon-Sun).</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {isChartLoading ? (
                                                <div className="flex justify-center items-center h-[250px]">
                                                    <Skeleton className="h-full w-full" />
                                                </div>
                                            ) : weeklyPregnancyLogs.some(log => log.minutes > 0) ? (
                                                <ChartContainer config={weeklyActivityChartConfig} className="w-full h-[250px]">
                                                    <RechartsBarChart accessibilityLayer data={weeklyPregnancyLogs} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="m" />
                                                        <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `${Number(value)} mins`}/>}/>
                                                        <RechartsBar dataKey="minutes" fill="hsl(var(--primary))" radius={4} />
                                                    </RechartsBarChart>
                                                </ChartContainer>
                                            ) : (
                                                <div className="flex justify-center items-center h-[250px] text-muted-foreground">
                                                    No movement logged this week. Let's get moving!
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <Card className="shadow-lg bg-background/80 backdrop-blur-sm border-border">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><BarChart/> Weekly Goal Progress</CardTitle>
                                            <CardDescription>You've moved on {completedDays} of your {goalDays} day goal.</CardDescription>
                                        </CardHeader>
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
                                    <Card className="shadow-lg bg-background/80 backdrop-blur-sm border-border">
                                        <CardHeader><CardTitle className="flex items-center gap-2"><Award/> Achievements</CardTitle></CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className={cn("flex items-center gap-4 p-3 rounded-lg", streak > 0 ? "bg-amber-100" : "bg-muted")}>
                                                <Flame className={cn("h-6 w-6", streak > 0 ? "text-amber-500" : "text-muted-foreground")} />
                                                <div>
                                                    <p className="font-semibold">Consistency Streak</p>
                                                    <p className="text-sm text-muted-foreground">{streak > 0 ? `You're on a ${streak}-day streak!` : "Log a workout today to start a streak."}</p>
                                                </div>
                                            </div>
                                            <div className={cn("flex items-center gap-4 p-3 rounded-lg", completedDays >= goalDays ? "bg-primary/20" : "bg-muted")}>
                                                <ThumbsUp className={cn("h-6 w-6", completedDays >= goalDays ? "text-primary" : "text-muted-foreground")} />
                                                <div>
                                                    <p className="font-semibold">Weekly Goal</p>
                                                    <p className="text-sm text-muted-foreground">{completedDays >= goalDays ? "You hit your goal this week!" : "Keep going to reach your weekly goal."}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="mt-12 space-y-8">
                                <div className="flex items-center justify-center mb-4 p-4 rounded-md bg-destructive/10 border border-destructive/20">
                                    <AlertTriangle className="h-6 w-6 text-destructive mr-3" />
                                    <p className="font-bold text-destructive text-center">Do consult your doctor before doing this and proceed only if comfortable.</p>
                                </div>
                                {pregnancyVideoUrl && (
                                    <Card className="shadow-xl bg-background/80 backdrop-blur-sm border-border">
                                        <CardHeader><CardTitle>Guided Workout for your {pregnancyTrimester}</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="aspect-video">
                                                <iframe className="w-full h-full rounded-lg" src={pregnancyVideoUrl} title={`Pregnancy Workout for ${pregnancyTrimester}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                <Card className="shadow-xl bg-background/80 backdrop-blur-sm border-border">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><HeartPulse /> Guided Prenatal Yoga</CardTitle>
                                        <CardDescription>A gentle yoga session suitable for all trimesters.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="aspect-video">
                                            <iframe className="w-full h-full rounded-lg" src={prenatalYogaVideoUrl} title="Guided Prenatal Yoga" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
