
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, subDays, isSameDay, startOfDay, parseISO, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  ChevronLeft,
  Flame,
  Zap,
  Wind,
  CircleDot,
  ArrowLeftRight,
  Thermometer,
  Cookie,
  Moon,
  Plus,
  Shell,
  Angry,
  Bed,
  Smile,
  BookText,
  History,
  Info,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const symptomsList = [
    { id: 'cramps', label: 'Cramps', icon: Flame },
    { id: 'headache', label: 'Headache', icon: Zap },
    { id: 'bloating', label: 'Bloating', icon: Wind },
    { id: 'acne', label: 'Acne', icon: CircleDot },
    { id: 'backache', label: 'Backache', icon: ArrowLeftRight },
    { id: 'breastTenderness', label: 'Breast Tenderness', icon: Shell },
    { id: 'fatigue', label: 'Fatigue', icon: Bed },
    { id: 'nausea', label: 'Nausea', icon: Thermometer },
    { id: 'foodCravings', label: 'Food Cravings', icon: Cookie },
    { id: 'diarrheaConstipation', label: 'Diarrhea / Constipation', icon: Thermometer },
    { id: 'moodSwings', label: 'Mood Swings', icon: Angry },
    { id: 'insomnia', label: 'Insomnia', icon: Moon },
];

const moods = [
    { name: 'Happy', emoji: '😄' },
    { name: 'Calm', emoji: '🙂' },
    { name: 'Neutral', emoji: '😐' },
    { name: 'Sad', emoji: '😢' },
    { name: 'Angry', emoji: '😠' },
    { name: 'Anxious', emoji: '😰' },
    { name: 'Tired', emoji: '😴' },
    { name: 'Affectionate', emoji: '😍' },
];


const FormSchema = z.object({
  logDate: z.date({
    required_error: "A date is required.",
  }),
  symptoms: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one symptom.",
  }),
  otherSymptom: z.string().optional(),
  mood: z.string({ required_error: "Please select a mood." }),
  moodIntensity: z.array(z.number()).optional(),
  notes: z.string().max(300, { message: "Notes must be 300 characters or less." }).optional(),
});

type FormData = z.infer<typeof FormSchema>;


const LOCAL_STORAGE_KEY_PREFIX = 'glowher-log-';

export default function LogSymptomsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loadingDate, setLoadingDate] = useState(false);


  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      logDate: new Date(),
      symptoms: [],
      otherSymptom: "",
      mood: "Neutral",
      moodIntensity: [5],
      notes: "",
    },
  });

  const notesValue = form.watch("notes");
  const logDate = form.watch("logDate");

  // Effect to handle loading data from URL parameter
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      // The date param is in 'yyyy-MM-dd' format which parseISO handles correctly as UTC midnight.
      // This avoids timezone shifting issues.
      const dateFromUrl = parseISO(dateParam);
      form.setValue('logDate', dateFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, form.setValue]);
  
  useEffect(() => {
    if (isSameDay(logDate, currentDate)) return;

    setLoadingDate(true);
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(logDate, 'yyyy-MM-dd')}`;
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        parsedData.logDate = new Date(parsedData.logDate);
        form.reset(parsedData);
      } else {
        form.reset({
          logDate: logDate,
          symptoms: [],
          otherSymptom: "",
          mood: "Neutral",
          moodIntensity: [5],
          notes: "",
        });
      }
      setCurrentDate(logDate);
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    } finally {
        setTimeout(() => setLoadingDate(false), 300); // Small delay to prevent flicker
    }
  }, [logDate, form, currentDate]);

  function onSubmit(data: FormData) {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(data.logDate, 'yyyy-MM-dd')}`;
    try {
        localStorage.setItem(key, JSON.stringify(data));
        toast({
            title: "Log Saved!",
            description: "Your entry for this day has been successfully saved.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error Saving Log",
            description: "Could not save your entry. Please try again."
        });
        console.error("Failed to save to localStorage", error);
    }
  }

  const isEditingPast = !isSameDay(startOfDay(logDate), startOfDay(new Date()));

  return (
    <div className="relative flex flex-col min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://i.pinimg.com/1200x/77/f5/37/77f5373552698548522b033a838a3b35.jpg')"}}>
       <div className="absolute inset-0 bg-black/30 z-0"/>
       <div className="relative z-10 flex flex-col min-h-screen text-white">
        <header className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
            <GlowHerLogo />
            <Button variant="ghost" onClick={() => router.push('/')} className="text-white hover:text-white hover:bg-white/10">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 p-4 rounded-lg">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-shadow-lg">How Are You Feeling Today?</h1>
                <p className="mt-2 text-lg text-white/90">Track your symptoms and emotions to understand your body better.</p>
            </div>
            {isEditingPast && (
                <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/20 text-white [&>svg]:text-yellow-400">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Editing Past Entry</AlertTitle>
                    <AlertDescription>
                        You are currently editing the log for {format(logDate, 'MMMM d, yyyy')}.
                    </AlertDescription>
                </Alert>
            )}

            <Card className="shadow-lg bg-black/20 backdrop-blur-lg border-white/20 text-white">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Create a New Log</CardTitle>
                        <Button variant="outline" onClick={() => router.push('/log-history')} className="bg-transparent hover:bg-white/10 border-white/30 text-white">
                            <History className="mr-2 h-4 w-4" />
                            View History
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {loadingDate ? (
                        <div className="space-y-8">
                            <Skeleton className="h-10 w-[240px]" />
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-1/2" />
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                                </div>
                            </div>
                            <Skeleton className="h-10 w-full" />
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-1/3" />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                                </div>
                            </div>
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="logDate"
                                render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-lg font-semibold">Log Date</FormLabel>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={"w-[240px] pl-3 text-left font-normal bg-white/10 border-white/20 hover:bg-white/20"}
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
                                        disabled={(date) =>
                                            date > new Date() || date < subDays(new Date(), 30) // Allow logging for a month
                                        }
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
                                name="symptoms"
                                render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-lg font-semibold">Select Symptoms You’re Experiencing</FormLabel>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {symptomsList.map((item) => (
                                        <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="symptoms"
                                        render={({ field }) => {
                                            return (
                                            <FormItem
                                                key={item.id}
                                                className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-white/20 p-3 hover:bg-white/10 transition-colors"
                                            >
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.id)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), item.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                            (value) => value !== item.id
                                                            )
                                                        );
                                                    }}
                                                    className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                                                <item.icon className="h-5 w-5 text-primary" />
                                                {item.label}
                                                </FormLabel>
                                            </FormItem>
                                            );
                                        }}
                                        />
                                    ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="otherSymptom"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg font-semibold flex items-center gap-2"><Plus/> Other</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Enter any other symptoms..." {...field} className="bg-white/10 border-white/20 placeholder:text-white/60"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="mood"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                                    <Smile /> Select Your Mood
                                    </FormLabel>
                                    <FormControl>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                        {moods.map((mood) => (
                                        <Button
                                            key={mood.name}
                                            type="button"
                                            variant={field.value === mood.name ? "secondary" : "outline"}
                                            className={cn(
                                            "h-16 text-lg transition-all duration-300 transform",
                                            "bg-white/10 border-white/20 hover:bg-white/20",
                                            field.value === mood.name ? "bg-primary text-primary-foreground border-primary scale-105 shadow-lg" : "hover:scale-105 active:scale-95"
                                            )}
                                            onClick={() => field.onChange(mood.name)}
                                        >
                                            <span className="text-3xl mr-2">{mood.emoji}</span> {mood.name}
                                        </Button>
                                        ))}
                                    </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="moodIntensity"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg font-semibold">Mood Intensity ({field.value?.[0]}/10)</FormLabel>
                                    <FormControl>
                                    <Slider
                                        value={field.value}
                                        max={10}
                                        step={1}
                                        onValueChange={field.onChange}
                                        className="[&>span>span]:bg-primary [&>span]:bg-primary/20"
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                                    <BookText /> Personal Notes
                                    </FormLabel>
                                    <FormControl>
                                    <Textarea
                                        placeholder="Anything else you’d like to record today?"
                                        className="resize-none bg-white/10 border-white/20 placeholder:text-white/60"
                                        {...field}
                                    />
                                    </FormControl>
                                    <FormDescription className="text-right text-white/80">
                                    {notesValue?.length || 0} / 300
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Save Log</Button>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
            </div>
        </main>
      </div>
    </div>
  );
}
