
"use client";

import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, getDaysInMonth, getYear, getMonth, getDate } from "date-fns";
import { CalendarIcon, User, Cake, VenetianMask } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  dob: z.date({ required_error: "A date of birth is required." }),
  gender: z.string({ required_error: "Please select a gender." }),
  lastPeriodDate: z.date().optional(),
}).refine(data => {
    if (data.gender === 'Female' && !data.lastPeriodDate) {
        return false;
    }
    return true;
}, {
    message: "Last period date is required for females.",
    path: ["lastPeriodDate"],
});


export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: "",
        gender: "Female",
    },
  });

  const gender = form.watch("gender");

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        localStorage.setItem('glowher-user', JSON.stringify(values));
        toast({
            title: "Welcome to GlowHer!",
            description: "Your profile has been created.",
        });
        router.push('/');
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save your details. Please try again.",
        });
    }
  }

  const DatePickerField = ({ name, label }: { name: "dob" | "lastPeriodDate", label: string }) => {
    const { control, watch, setValue } = form;
    const selectedDate = watch(name);

    const currentYear = getYear(new Date());
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(0, i), 'MMMM') }));

    const selectedYear = selectedDate ? getYear(selectedDate) : currentYear;
    const selectedMonth = selectedDate ? getMonth(selectedDate) : getMonth(new Date());
    
    const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleDateChange = (part: 'day' | 'month' | 'year', value: number) => {
        const currentDate = selectedDate || new Date();
        const newDate = new Date(
            part === 'year' ? value : getYear(currentDate),
            part === 'month' ? value : getMonth(currentDate),
            part === 'day' ? value : getDate(currentDate)
        );
        setValue(name, newDate, { shouldValidate: true });
    };

    return (
      <FormItem>
        <FormLabel className="flex items-center gap-2">{label}</FormLabel>
        <div className="grid grid-cols-3 gap-2">
            <Select
                value={selectedDate ? String(getMonth(selectedDate)) : undefined}
                onValueChange={(value) => handleDateChange('month', parseInt(value))}
            >
                <SelectTrigger className="bg-white/10 border-white/20"><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                    {months.map(month => (
                        <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select
                value={selectedDate ? String(getDate(selectedDate)) : undefined}
                onValueChange={(value) => handleDateChange('day', parseInt(value))}
            >
                <SelectTrigger className="bg-white/10 border-white/20"><SelectValue placeholder="Day" /></SelectTrigger>
                <SelectContent>
                    {days.map(day => (
                        <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select
                value={selectedDate ? String(getYear(selectedDate)) : undefined}
                onValueChange={(value) => handleDateChange('year', parseInt(value))}
            >
                <SelectTrigger className="bg-white/10 border-white/20"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                    {years.map(year => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <FormMessage />
      </FormItem>
    );
  };

  return (
    <div 
        className="relative flex flex-col min-h-screen items-center justify-center p-4 text-white bg-cover bg-center"
style={{backgroundImage: "url('https://i.pinimg.com/736x/11/6f/02/116f025002e4bf1874ef5543d8439c3b.jpg')"}}    >
        <div className="absolute inset-0 bg-black/50 z-0" />
        
        <header className="absolute top-0 left-0 w-full container mx-auto px-4 py-6 z-10">
            <GlowHerLogo />
        </header>
        
        <main className="relative z-10 w-full max-w-lg mx-auto">
            <Card className="bg-black/20 backdrop-blur-lg border-white/20 text-white">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Let's Get to Know You</CardTitle>
                    <CardDescription className="text-white/80">This will help us personalize your wellness journey.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField 
                                control={form.control} 
                                name="name" 
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><User /> Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your name" {...field} className="bg-white/10 border-white/20 placeholder:text-white/60"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <DatePickerField name="dob" label="Date of Birth" />
                            
                             <FormField 
                                control={form.control} 
                                name="gender" 
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><VenetianMask /> Gender</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white/10 border-white/20">
                                                    <SelectValue placeholder="Select your gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {gender === 'Female' && (
                                <DatePickerField name="lastPeriodDate" label="Last Period Start Date" />
                            )}
                            <Button type="submit" size="lg" className="w-full bg-pink-500 hover:bg-pink-600">
                                Complete Setup
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
