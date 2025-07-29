
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { useToast } from '@/hooks/use-toast';
import { AppFooter } from '@/components/glowher/AppFooter';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, ChevronLeft, BookText, History } from 'lucide-react';

const FormSchema = z.object({
  logDate: z.date({
    required_error: "A date is required.",
  }),
  notes: z.string().min(1, "Please enter a note.").max(2000, { message: "Notes must be 2000 characters or less." }),
});

type FormData = z.infer<typeof FormSchema>;

const LOCAL_STORAGE_KEY_PREFIX = 'glowher-pregnancy-journal-';

export default function PregnancyJournalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      logDate: new Date(),
      notes: "",
    },
  });

  const notesValue = form.watch("notes");
  const logDate = form.watch("logDate");

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
          notes: "",
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
            title: "Journal Entry Saved!",
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
          <Button variant="ghost" onClick={() => router.push('/pregnancy-tracker')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Tracker
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Pregnancy Journal</h1>
            <p className="mt-2 text-lg text-muted-foreground">A private space for your thoughts, questions, and feelings.</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>New Journal Entry</CardTitle>
                    <Button variant="outline" onClick={() => router.push('/pregnancy-journal-history')}>
                        <History className="mr-2 h-4 w-4" />
                        View History
                    </Button>
                </div>
                <CardDescription>
                    Use this space to jot down notes for your doctor, track feelings, or record special moments.
                </CardDescription>
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          <BookText /> Journal Entry
                        </FormLabel>
                        <FormControl>
                           <Textarea
                                placeholder="E.g., Asked Dr. Smith about prenatal vitamins. Felt the first kick today! Feeling a bit anxious about the nursery..."
                                className="resize-y min-h-[200px]"
                                {...field}
                           />
                        </FormControl>
                        <FormDescription className="text-right">
                          {notesValue?.length || 0} / 2000
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
