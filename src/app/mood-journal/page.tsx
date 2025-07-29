
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, subDays, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { useToast } from '@/hooks/use-toast';
import { AppFooter } from '@/components/glowher/AppFooter';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CalendarIcon, ChevronLeft, Smile, BookText, History, PlusCircle } from 'lucide-react';

const moods = [
    { name: 'Happy', emoji: '😄' },
    { name: 'Calm', emoji: '🙂' },
    { name: 'Neutral', emoji: '😐' },
    { name: 'Sad', emoji: '😢' },
    { name: 'Angry', emoji: '😠' },
    { name: 'Anxious', emoji: '😰' },
    { name: 'Tired', emoji: '😴' },
    { name: 'Loved', emoji: '😍' },
];

const FormSchema = z.object({
  logDate: z.date({
    required_error: "A date is required.",
  }),
  mood: z.string({ required_error: "Please select a mood." }),
  customMood: z.string().optional(),
  moodIntensity: z.array(z.number()).optional(),
  notes: z.string().max(500, { message: "Notes must be 500 characters or less." }).optional(),
}).refine(data => {
    return data.mood !== 'Custom' || (data.mood === 'Custom' && data.customMood && data.customMood.length > 0);
}, {
    message: "Please enter a custom mood.",
    path: ["customMood"],
});

type FormData = z.infer<typeof FormSchema>;

const LOCAL_STORAGE_KEY_PREFIX = 'glowher-mood-journal-';

export default function MoodJournalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCustomMoodInput, setShowCustomMoodInput] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      logDate: new Date(),
      mood: "Neutral",
      moodIntensity: [5],
      notes: "",
      customMood: "",
    },
  });

  const notesValue = form.watch("notes");
  const logDate = form.watch("logDate");
  const selectedMood = form.watch("mood");

  useEffect(() => {
    if(selectedMood === 'Custom') {
        setShowCustomMoodInput(true);
    } else {
        setShowCustomMoodInput(false);
        form.setValue('customMood', '');
    }
  }, [selectedMood, form]);

  useEffect(() => {
    if (isSameDay(logDate, currentDate)) return;

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
          mood: "Neutral",
          moodIntensity: [5],
          notes: "",
          customMood: "",
        });
      }
      setCurrentDate(logDate);
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
  }, [logDate, form, currentDate]);

  function onSubmit(data: FormData) {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(data.logDate, 'yyyy-MM-dd')}`;
    try {
        localStorage.setItem(key, JSON.stringify(data));
        toast({
            title: "Mood Saved!",
            description: "Your entry for this day has been successfully saved.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error Saving Entry",
            description: "Could not save your entry. Please try again."
        });
        console.error("Failed to save to localStorage", error);
    }
  }

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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">How Are You Feeling Today?</h1>
            <p className="mt-2 text-lg text-muted-foreground">Log your emotions to understand yourself better.</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>New Journal Entry</CardTitle>
                    <Button variant="outline" onClick={() => { /* Implement history page later */ }}>
                        <History className="mr-2 h-4 w-4" />
                        View History
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="logDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-lg font-semibold">Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={"w-[240px] pl-3 text-left font-normal"}
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
                    name="mood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          <Smile /> Select Your Mood
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-2">
                            {moods.map((mood) => (
                              <Button
                                key={mood.name}
                                type="button"
                                variant={field.value === mood.name ? "secondary" : "outline"}
                                className={cn(
                                  "h-16 text-lg transition-all duration-200 transform hover:scale-105",
                                  field.value === mood.name && "border-2 border-accent ring-2 ring-accent/50"
                                )}
                                onClick={() => field.onChange(mood.name)}
                              >
                                <span className="text-3xl mr-2">{mood.emoji}</span> {mood.name}
                              </Button>
                            ))}
                             <Button
                                type="button"
                                variant={field.value === 'Custom' ? "secondary" : "outline"}
                                className={cn(
                                  "h-16 text-lg transition-all duration-200 transform hover:scale-105",
                                  field.value === 'Custom' && "border-2 border-accent ring-2 ring-accent/50"
                                )}
                                onClick={() => field.onChange('Custom')}
                              >
                                <PlusCircle className="mr-2 h-8 w-8" /> Custom
                              </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showCustomMoodInput && (
                    <FormField
                      control={form.control}
                      name="customMood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Custom Mood</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your current mood" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
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
                          <BookText /> Journal Entry
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Anything on your mind today?"
                            className="resize-none min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-right">
                          {notesValue?.length || 0} / 500
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full">Save Entry</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
