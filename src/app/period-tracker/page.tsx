
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, ChevronLeft, Info } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';


const formSchema = z.object({
  lastPeriodDate: z.date({ required_error: "Last period date is required." }),
  cycleLength: z.coerce.number().min(21).max(35),
  lutealPhaseLength: z.coerce.number().min(10).max(18).optional(),
});

type CycleData = z.infer<typeof formSchema>;

export default function PeriodTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CycleData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cycleLength: 28,
      lutealPhaseLength: 14,
    },
  });

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('glowher-period-tracker');
      if (storedData) {
        const data = JSON.parse(storedData);
        data.lastPeriodDate = new Date(data.lastPeriodDate);
        form.reset(data);
      } else {
        const userDetails = localStorage.getItem('glowher-user');
        if (userDetails) {
            const userData = JSON.parse(userDetails);
            if(userData.lastPeriodDate) {
                const initialData = {
                    lastPeriodDate: new Date(userData.lastPeriodDate),
                    cycleLength: 28,
                    lutealPhaseLength: 14,
                };
                form.reset(initialData);
                localStorage.setItem('glowher-period-tracker', JSON.stringify(initialData));
            }
        }
      }
    } catch (error) {
      console.error("Could not retrieve data from localStorage", error);
    }
  }, [form]);


  function onSubmit(values: CycleData) {
    try {
      localStorage.setItem('glowher-period-tracker', JSON.stringify(values));
      toast({
        title: "Success!",
        description: "Your cycle settings have been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save your settings. Please try again.",
      });
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <div className="flex flex-col min-h-screen">
            <header className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center">
                <GlowHerLogo />
                <Button variant="ghost" onClick={() => router.push('/')}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex justify-center">
                    <div className="w-full max-w-md">
                        <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline text-3xl">Cycle Settings</CardTitle>
                            <CardDescription>Update your cycle details to get started.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                control={form.control}
                                name="lastPeriodDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Last Period Start Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                                name="cycleLength"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Average Cycle Length (days)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="lutealPhaseLength"
                                render={({ field }) => (
                                    <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormLabel>Luteal Phase Length</FormLabel>
                                        <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                            <button type="button" aria-label="Luteal phase info" onClick={(e) => e.preventDefault()}>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                            </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                            <p className="max-w-xs">
                                                The luteal phase is the time between ovulation and your next period. It's usually 10-18 days. This is different from your period (menstruation), which is when you bleed.
                                            </p>
                                            </TooltipContent>
                                        </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <FormControl>
                                        <Input type="number" placeholder="Default: 14" min="10" max="18" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <div className="flex flex-col gap-2">
                                    <Button type="submit" size="lg" className="w-full">Save Settings</Button>
                                    <Button variant="outline" onClick={() => router.push('/personal-details')}>Edit Personal Details</Button>
                                </div>
                            </form>
                            </Form>
                        </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
}
