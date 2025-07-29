"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { useToast } from '@/hooks/use-toast';
import { AppFooter } from '@/components/glowher/AppFooter';
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
} from 'lucide-react';

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
  const { toast } = useToast();

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

  useEffect(() => {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(logDate, 'yyyy-MM-dd')}`;
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Ensure date is a Date object
        parsedData.logDate = new Date(parsedData.logDate);
        form.reset(parsedData);
      } else {
        // Reset to default for a new date, but keep the selected date
        form.reset({
          logDate: logDate,
          symptoms: [],
          otherSymptom: "",
          mood: "Neutral",
          moodIntensity: [5],
          notes: "",
        });
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
  }, [logDate, form]);

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
            <p className="mt-2 text-lg text-muted-foreground">Track your symptoms and emotions to understand your body better.</p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
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
                                    className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-accent/50 transition-colors"
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
                          <Input placeholder="Enter any other symptoms..." {...field} />
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
                                  "h-16 text-lg transition-all duration-200 transform hover:scale-105",
                                  field.value === mood.name && "border-2 border-accent ring-2 ring-accent/50"
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
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-right">
                          {notesValue?.length || 0} / 300
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full">Save Log</Button>
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
