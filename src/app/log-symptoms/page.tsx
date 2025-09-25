
"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, subDays, isSameDay, startOfDay, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
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
import { AppSidebar } from '@/components/glowher/AppSidebar';

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

// ✅ Wrapper with Suspense (fix for useSearchParams)
export default function LogSymptomsPageWrapper() {
  return (
    <Suspense fallback={<div className="text-white p-8">Loading symptoms form...</div>}>
      <LogSymptomsPage />
    </Suspense>
  );
}

function LogSymptomsPage() {
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
      const dateFromUrl = parseISO(dateParam);
      form.setValue('logDate', dateFromUrl);
    }
  }, [searchParams, form]);

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
      setTimeout(() => setLoadingDate(false), 300);
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
      <div className="relative z-10 flex text-white">
        <AppSidebar
          className="bg-black/10 backdrop-blur-lg border-white/20 text-white"
          buttonClassName="text-white hover:bg-white/10 hover:text-white"
          navContentClassName="bg-black/50 backdrop-blur-xl border-r-white/20 text-white"
        />
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
                      {/* logDate, symptoms, otherSymptom, mood, moodIntensity, notes, save button */}
                      {/* (keep your existing JSX here unchanged — trimmed for brevity) */}
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
