
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, Trash2, Languages, Moon, Sun } from 'lucide-react';


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
import { Switch } from '@/components/ui/switch';


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

const translations = {
    en: {
        title: "Settings",
        description: "Manage your profile, preferences, and app data.",
        personalDetails: "Personal Details",
        personalDetailsDesc: "This information helps us personalize your experience.",
        name: "Name",
        namePlaceholder: "Enter your name",
        dob: "Date of Birth",
        pickDate: "Pick a date",
        gender: "Gender",
        genderPlaceholder: "Select your gender",
        female: "Female",
        male: "Male",
        other: "Other",
        lastPeriod: "Last Period Start Date",
        saveDetails: "Save Details",
        preferences: "Preferences",
        preferencesDesc: "Customize the language and appearance of the app.",
        language: "Language",
        languagePlaceholder: "Select language",
        darkMode: "Dark Mode",
        dangerZone: "Danger Zone",
        clearData: "Clear All Data",
        clearDataDesc: "This will permanently delete all your data from this browser.",
        clearDataBtn: "Clear Data",
        alertTitle: "Are you absolutely sure?",
        alertDesc: "This action cannot be undone. This will permanently delete all your tracked data, including personal details, logs, and goals from this device.",
        cancel: "Cancel",
        delete: "Yes, delete everything",
        dashboard: "Back to Dashboard",
    },
    hi: {
        title: "सेटिंग्स",
        description: "अपनी प्रोफ़ाइल, प्राथमिकताएं और ऐप डेटा प्रबंधित करें।",
        personalDetails: "व्यक्तिगत विवरण",
        personalDetailsDesc: "यह जानकारी हमें आपके अनुभव को वैयक्तिकृत करने में मदद करती है।",
        name: "नाम",
        namePlaceholder: "अपना नाम दर्ज करें",
        dob: "जन्म तिथि",
        pickDate: "एक तारीख चुनें",
        gender: "लिंग",
        genderPlaceholder: "अपना लिंग चुनें",
        female: "महिला",
        male: "पुरुष",
        other: "अन्य",
        lastPeriod: "अंतिम पीरियड की प्रारंभ तिथि",
        saveDetails: "विवरण सहेजें",
        preferences: "प्राथमिकताएं",
        preferencesDesc: "ऐप की भाषा और उपस्थिति को अनुकूलित करें।",
        language: "भाषा",
        languagePlaceholder: "भाषा चुनें",
        darkMode: "डार्क मोड",
        dangerZone: "खतरनाक क्षेत्र",
        clearData: "सभी डेटा साफ़ करें",
        clearDataDesc: "यह इस ब्राउज़र से आपके सभी डेटा को स्थायी रूप से हटा देगा।",
        clearDataBtn: "डेटा साफ़ करें",
        alertTitle: "क्या आप पूरी तरह निश्चित हैं?",
        alertDesc: "यह कार्रवाई पूर्ववत नहीं की जा सकती। यह इस डिवाइस से व्यक्तिगत विवरण, लॉग और लक्ष्यों सहित आपके सभी ट्रैक किए गए डेटा को स्थायी रूप से हटा देगा।",
        cancel: "रद्द करें",
        delete: "हाँ, सब कुछ हटा दें",
        dashboard: "डैशबोर्ड पर वापस",
    }
};

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  
  const t = translations[language];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: "",
        gender: "",
        dob: new Date(),
        lastPeriodDate: undefined,
    },
  });
  
  useEffect(() => {
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

  const handleClearData = () => {
    try {
        const lang = localStorage.getItem('glowher-language');
        localStorage.clear();
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
                    {t.dashboard}
                </Button>
            </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">{t.title}</h1>
                    <p className="mt-2 text-lg text-muted-foreground">{t.description}</p>
                </div>
                
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{t.personalDetails}</CardTitle>
                        <CardDescription>{t.personalDetailsDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t.name}</FormLabel><FormControl><Input placeholder={t.namePlaceholder} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="dob" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>{t.dob}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="ml-auto h-4 w-4 opacity-50" />{field.value ? format(field.value, "PPP") : (<span>{t.pickDate}</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>{t.gender}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t.genderPlaceholder} /></SelectTrigger></FormControl><SelectContent><SelectItem value="Female">{t.female}</SelectItem><SelectItem value="Male">{t.male}</SelectItem><SelectItem value="Other">{t.other}</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                                {gender === 'Female' && (<FormField control={form.control} name="lastPeriodDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>{t.lastPeriod}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : (<span>{t.pickDate}</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>)}/>)}
                                <Button type="submit" className="w-full">{t.saveDetails}</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{t.preferences}</CardTitle>
                        <CardDescription>{t.preferencesDesc}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        
                        <div className="flex items-center justify-between">
                            <Label htmlFor="language-switcher" className="text-base flex items-center gap-2"><Languages className="h-5 w-5" /> {t.language}</Label>
                            <Select value={language} onValueChange={(val) => setLanguage(val as 'en' | 'hi')}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t.languagePlaceholder} />
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
                        <CardTitle className="font-headline text-2xl text-destructive">{t.dangerZone}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="font-bold">{t.clearData}</Label>
                                <p className="text-sm text-muted-foreground">{t.clearDataDesc}</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />{t.clearDataBtn}</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>{t.alertTitle}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t.alertDesc}
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearData}>{t.delete}</AlertDialogAction>
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
