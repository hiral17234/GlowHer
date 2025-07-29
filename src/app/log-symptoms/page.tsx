"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { useToast } from '@/hooks/use-toast';
import { AppFooter } from '@/components/glowher/AppFooter';
import { Checkbox } from '@/components/ui/checkbox';
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

const FormSchema = z.object({
  logDate: z.date({
    required_error: "A date is required.",
  }),
  symptoms: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one symptom.",
  }),
  otherSymptom: z.string().optional(),
});

export default function LogSymptomsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      logDate: new Date(),
      symptoms: [],
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "Log Saved!",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
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
                                date > new Date() || date < subDays(new Date(), 3)
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
