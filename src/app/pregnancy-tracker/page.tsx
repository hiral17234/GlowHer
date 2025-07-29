
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, differenceInDays, startOfDay, addWeeks, subDays, differenceInWeeks } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, ChevronLeft, Info, Baby, Heart, Milestone, BarChart, BookOpen, Lightbulb, ClipboardPlus } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AppFooter } from '@/components/glowher/AppFooter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

const formSchema = z.object({
  calculationMethod: z.enum(['dueDate', 'lmp']),
  date: z.date({ required_error: "A date is required." }),
});

type PregnancyFormData = z.infer<typeof formSchema>;

type PregnancyDetails = {
  dueDate: Date;
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  daysLeft: number;
  trimester: number;
};

// Expanded fetal development data
const weeklyDevelopment = Array.from({ length: 41 }, (_, i) => {
    const week = i + 1;
    let size = "a poppy seed";
    if (week > 4) size = "an apple seed";
    if (week > 8) size = "a raspberry, and weighs about 1 gram";
    if (week > 12) size = "a lime, about 3 inches long";
    if (week > 16) size = "an avocado, about 4.5 inches long";
    if (week > 20) size = "a banana, about 10 inches from head to heel";
    if (week > 24) size = "an ear of corn, and weighs over 1 pound";
    if (week > 28) size = "an eggplant, weighing almost 2.5 pounds";
    if (week > 32) size = "a squash, weighing about 4 pounds";
    if (week > 36) size = "a head of romaine lettuce, over 6 pounds";
    if (week > 39) size = "a small pumpkin, and is ready for birth";

    return {
        week: week,
        title: `Week ${week}: Your Journey`,
        size: `Your baby is about the size of ${size}.`,
        development: `This week, crucial organ systems are forming. The heart is beginning to beat, and the neural tube, which becomes the brain and spinal cord, is developing. Limbs buds are starting to sprout.`,
        bodyChanges: "You might not look pregnant yet, but hormonal changes are in full swing. Increased progesterone can lead to fatigue, and hCG levels can cause morning sickness. Your breasts may feel tender and swollen.",
        symptoms: `Fatigue, nausea (morning sickness), frequent urination, breast tenderness, and mood swings are very common. Some experience light spotting, which can be normal but should be mentioned to a doctor.`,
        tips: "Start taking a prenatal vitamin with folic acid immediately. Stay hydrated, eat small, frequent meals to combat nausea, and listen to your body—rest when you feel tired. Establish care with an OB/GYN or midwife.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "fetus development"
    }
});


export default function PregnancyTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pregnancyDetails, setPregnancyDetails] = useState<PregnancyDetails | null>(null);

  const form = useForm<PregnancyFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calculationMethod: 'dueDate',
    },
  });

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('glowher-pregnancy-tracker');
      if (storedData) {
        const data = JSON.parse(storedData);
        data.dueDate = new Date(data.dueDate);
        calculateDetails(data.dueDate);
      }
    } catch (error)      console.error("Could not retrieve data from localStorage", error);
    }
  }, []);

  const calculateDetails = (dueDate: Date) => {
    const today = startOfDay(new Date());
    const startDate = subDays(dueDate, 280); // 40 weeks * 7 days
    
    const totalDays = differenceInDays(today, startDate);
    if (totalDays < 0) {
        toast({
            variant: 'destructive',
            title: "Invalid Date",
            description: "The calculated pregnancy start date is in the future. Please check your entered date.",
        });
        return;
    }
    const gestationalAgeWeeks = Math.floor(totalDays / 7);
    const gestationalAgeDays = totalDays % 7;

    const daysLeft = differenceInDays(dueDate, today);

    let trimester = 1;
    if (gestationalAgeWeeks >= 28) trimester = 3;
    else if (gestationalAgeWeeks >= 14) trimester = 2;

    const details = {
        dueDate,
        gestationalAgeWeeks,
        gestationalAgeDays,
        daysLeft,
        trimester
    };
    
    setPregnancyDetails(details);
    try {
        localStorage.setItem('glowher-pregnancy-tracker', JSON.stringify({ dueDate }));
    } catch(e) { console.error(e) }

  }

  function onSubmit(values: PregnancyFormData) {
    let calculatedDueDate: Date;
    if (values.calculationMethod === 'lmp') {
      calculatedDueDate = addDays(values.date, 280); // Naegele's rule
    } else {
      calculatedDueDate = values.date;
    }
    
    calculateDetails(calculatedDueDate);

    toast({
      title: "Pregnancy Tracked!",
      description: "Your due date and progress have been calculated.",
    });
  }
  
  const currentWeekData = pregnancyDetails ? weeklyDevelopment[pregnancyDetails.gestationalAgeWeeks] : null;

  if (pregnancyDetails) {
    return (
        <div className="flex flex-col min-h-screen bg-green-500/5 text-foreground">
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
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Your Pregnancy Journey</h1>
                    <p className="mt-2 text-lg text-muted-foreground">You are <span className="text-primary font-semibold">{pregnancyDetails.gestationalAgeWeeks} weeks</span> and <span className="text-primary font-semibold">{pregnancyDetails.gestationalAgeDays} days</span> pregnant.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="shadow-sm">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Estimated Due Date</CardTitle>
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{format(pregnancyDetails.dueDate, "MMM d, yyyy")}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Days to Go</CardTitle>
                            <Baby className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{pregnancyDetails.daysLeft}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Current Trimester</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{pregnancyDetails.trimester}</p>
                        </CardContent>
                    </Card>
                </div>

                {currentWeekData && (
                    <Card className="shadow-lg">
                        <CardHeader>
                             <CardTitle className="font-headline text-3xl">{currentWeekData.title}</CardTitle>
                             <CardDescription>{currentWeekData.size}</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div>
                                    <Image src={currentWeekData.imageUrl} data-ai-hint={currentWeekData.aiHint} alt={`Week ${currentWeekData.week} development`} width={600} height={400} className="rounded-lg object-cover" />
                                </div>
                                <Tabs defaultValue="development" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="development"><Milestone className="mr-2 h-4 w-4" />Baby</TabsTrigger>
                                        <TabsTrigger value="body"><Heart className="mr-2 h-4 w-4" />Body</TabsTrigger>
                                        <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                                        <TabsTrigger value="tips"><Lightbulb className="mr-2 h-4 w-4"/>Tips</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="development" className="mt-4 prose max-w-none text-foreground text-sm"><p>{currentWeekData.development}</p></TabsContent>
                                    <TabsContent value="body" className="mt-4 prose max-w-none text-foreground text-sm"><p>{currentWeekData.bodyChanges}</p></TabsContent>
                                    <TabsContent value="symptoms" className="mt-4 prose max-w-none text-foreground text-sm"><p>{currentWeekData.symptoms}</p></TabsContent>
                                    <TabsContent value="tips" className="mt-4 prose max-w-none text-foreground text-sm"><p>{currentWeekData.tips}</p></TabsContent>
                                </Tabs>
                           </div>
                        </CardContent>
                    </Card>
                )}

                <div className="mt-8 flex justify-center gap-4">
                    <Button onClick={() => router.push('/pregnancy-journal')}>
                        <ClipboardPlus className="mr-2 h-4 w-4"/>
                        My Pregnancy Journal
                    </Button>
                    <Button variant="outline" onClick={() => setPregnancyDetails(null)}>Reset / Enter New Date</Button>
                </div>

            </main>
            <AppFooter/>
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-green-500/5">
        <header className="container mx-auto px-4 py-6 z-10">
            <div className="flex justify-between items-center">
            <GlowHerLogo />
            <Button variant="ghost" onClick={() => router.push('/')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            </div>
      </header>
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-8">
        <Card className="w-full max-w-lg shadow-xl">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-center">Let’s Get Started!</CardTitle>
                <CardDescription className="text-center">Calculate your due date to begin tracking.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                         <FormField
                            control={form.control}
                            name="calculationMethod"
                            render={({ field }) => (
                                <FormItem>
                                <Tabs defaultValue={field.value} onValueChange={(value) => field.onChange(value as 'dueDate' | 'lmp')} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="dueDate">Use Due Date</TabsTrigger>
                                        <TabsTrigger value="lmp">Use Last Period</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                </FormItem>
                            )}
                         />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-center">
                                <FormLabel className="text-lg font-semibold">
                                    {form.watch('calculationMethod') === 'dueDate' ? 'Your Estimated Due Date' : 'First Day of Last Period (LMP)'}
                                </FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn("w-[280px] text-left font-normal", !field.value && "text-muted-foreground")}
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
                                        disabled={form.watch('calculationMethod') === 'lmp' ? (date) => date > new Date() : undefined}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-col gap-2 pt-4">
                            <Button type="submit" size="lg" className="w-full">
                                {form.watch('calculationMethod') === 'lmp' ? 'Calculate Due Date & Track' : 'Track My Pregnancy'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </main>
      <AppFooter/>
    </div>
  );
}
