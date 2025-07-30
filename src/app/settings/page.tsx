
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, Moon, Sun, Trash2, Languages } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';

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

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const [theme, setTheme] = useState('light');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    try {
      const storedData = localStorage.getItem('glowher-user');
      if (storedData) {
          const parsedData = JSON.parse(storedData);
          parsedData.dob = new Date(parsedData.dob);
          if (parsedData.lastPeriodDate) {
              parsedData.lastPeriodDate = new Date(parsedData.lastPeriodDate);
          }
          form.reset(parsedData);
      }
    } catch(e) { console.error("Could not load user data", e)}
  }, [form]);

  const gender = form.watch("gender");

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        localStorage.setItem('glowher-user', JSON.stringify(values));
        toast({
            title: "Success!",
            description: "Your details have been saved.",
        });
        router.push('/');
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save details. Please try again.",
        });
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleClearData = () => {
    try {
        const theme = localStorage.getItem('theme');
        const lang = localStorage.getItem('glowher-language');
        localStorage.clear();
        if(theme) localStorage.setItem('theme', theme);
        if(lang) localStorage.setItem('glowher-language', lang);
        toast({
            title: "Data Cleared",
            description: "All app data has been removed. The app will now reload.",
        });
        setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not clear data. Please try again.",
        });
    }
  };

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
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Settings</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Manage your profile, preferences, and app data.</p>
                </div>
                
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Personal Details</CardTitle>
                        <CardDescription>This information helps us personalize your experience.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Enter your name" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="dob" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="ml-auto h-4 w-4 opacity-50" />{field.value ? format(field.value, "PPP") : (<span>Pick a date</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Female">Female</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                                {gender === 'Female' && (<FormField control={form.control} name="lastPeriodDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Last Period Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>)}/>)}
                                <Button type="submit" className="w-full">Save Details</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Preferences</CardTitle>
                        <CardDescription>Customize the look and language of the app.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="theme-switcher" className="text-base flex items-center gap-2"><Sun className="inline h-5 w-5" /> / <Moon className="inline h-5 w-5" /> Theme</Label>
                            <div className="flex items-center gap-2 rounded-full border p-1">
                                <Button variant={theme === 'light' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleThemeChange('light')}><Sun className="h-5 w-5" /></Button>
                                <Button variant={theme === 'dark' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleThemeChange('dark')}><Moon className="h-5 w-5" /></Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="language-switcher" className="text-base flex items-center gap-2"><Languages className="h-5 w-5" /> Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="shadow-lg border-destructive">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-destructive">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="font-bold">Clear All Data</Label>
                                <p className="text-sm text-muted-foreground">This will permanently delete all your data from this browser.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Clear Data</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all your tracked data, including personal details, logs, and goals from this device.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearData}>Yes, delete everything</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
