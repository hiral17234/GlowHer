
"use client";

import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, User, Cake, VenetianMask } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

  return (
    <div 
        className="relative flex flex-col min-h-screen items-center justify-center p-4 text-white bg-cover bg-center"
        style={{backgroundImage: "url('https://i.pinimg.com/originals/9a/7d/5d/9a7d5d7135e554d39e31d453b6f0011a.jpg')"}}
    >
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
                            <FormField 
                                control={form.control} 
                                name="dob" 
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="flex items-center gap-2"><Cake /> Date of Birth</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-white/10 border-white/20 hover:bg-white/20", !field.value && "text-white/60")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                <FormField 
                                    control={form.control} 
                                    name="lastPeriodDate" 
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Last Period Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-white/10 border-white/20 hover:bg-white/20", !field.value && "text-white/60")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
