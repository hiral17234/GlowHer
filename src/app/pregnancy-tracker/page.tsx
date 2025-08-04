
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { addDays, format, differenceInDays, startOfDay, addWeeks, subDays, differenceInWeeks } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, ChevronLeft, Info, Baby, Heart, Milestone, BarChart, BookOpen, Lightbulb, ClipboardPlus, Video, CheckSquare, Square, ThumbsUp, PartyPopper, History, Home, Stethoscope, FileText, CalendarCheck, Library, PanelLeft, ChevronDown } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';
import { weeklyDevelopment } from '@/lib/pregnancy-data';


const pregnancyFormSchema = z.object({
  calculationMethod: z.enum(['dueDate', 'lmp']),
  date: z.date({ required_error: "A date is required." }),
});

const symptomFormSchema = z.object({
    symptoms: z.array(z.string()).optional(),
    notes: z.string().max(500, "Notes must be 500 characters or less.").optional(),
});


type PregnancyFormData = z.infer<typeof pregnancyFormSchema>;
type SymptomFormData = z.infer<typeof symptomFormSchema>;


type PregnancyDetails = {
  dueDate: Date;
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  daysLeft: number;
  trimester: number;
};

const pregnancySymptoms = [
    { id: 'nausea', label: 'Nausea' },
    { id: 'fatigue', label: 'Fatigue' },
    { id: 'backPain', label: 'Back Pain' },
    { id: 'swelling', label: 'Swelling' },
    { id: 'cravingsAversions', label: 'Food Cravings/Aversions' },
];

const PREGNANCY_TRACKER_KEY = 'glowher-pregnancy-tracker';
const PREGNANCY_SYMPTOM_LOG_PREFIX = 'glowher-pregnancy-symptom-';


const animatedTrimesterVideos: { [key: number]: string } = {
    1: 'D_jxGJsEY2A',
    2: 'H6mZRds0dHo',
    3: '1UW09FP7PfI',
};

const knowledgeTrimesterVideos: { [key: number]: string } = {
    1: 'cfn04QUO4B8',
    2: 'IPj4dJnP85o',
    3: 'lpDW00nQhUo',
};


const translations = {
    en: {
        backToDashboard: "Back to Dashboard",
        pageTitle: "Your Pregnancy Journey",
        progressText: (weeks: number, days: number) => `You are ${weeks} weeks and ${days} days pregnant.`,
        dueDate: "Estimated Due Date",
        daysToGo: "Days to Go",
        trimester: "Current Trimester",
        weeklyTitle: (title: string) => title,
        weeklySize: (size: string) => size,
        tabBaby: "Baby",
        tabBody: "Body",
        tabSymptoms: "Symptoms",
        tabTips: "Tips",
        symptomTrackerTitle: "How Are You Feeling Today?",
        symptomTrackerDesc: "Log your daily symptoms to keep track of your well-being.",
        viewHistory: "View History",
        customSymptoms: "Custom Symptoms or Notes",
        customSymptomsPlaceholder: "Anything else to add?",
        saveSymptoms: "Save Today's Symptoms",
        loggedToday: "Logged today:",
        animatedJourneyTitle: (trimester: number) => `Animated Journey: Trimester ${trimester}`,
        expertInsightsTitle: (trimester: number) => `Expert Insights: Trimester ${trimester}`,
        animatedJourneyDesc: "See a visual representation of your baby's development.",
        expertInsightsDesc: "Learn more about what to expect this trimester.",
        myJournal: "My Pregnancy Journal",
        resetDate: "Reset / Enter New Date",
        getStartedTitle: "Let’s Get Started!",
        getStartedDesc: "Calculate your due date to begin tracking.",
        useDueDate: "Use Due Date",
        useLMP: "Use Last Period",
        yourDueDate: "Your Estimated Due Date",
        lmpDate: "First Day of Last Period (LMP)",
        pickDate: "Pick a date",
        trackPregnancy: "Track My Pregnancy",
        calculateAndTrack: "Calculate Due Date & Track"
    },
    hi: {
        backToDashboard: "डैशबोर्ड पर वापस",
        pageTitle: "आपकी गर्भावस्था यात्रा",
        progressText: (weeks: number, days: number) => `आप ${weeks} सप्ताह और ${days} दिन की गर्भवती हैं।`,
        dueDate: "अनुमानित देय तिथि",
        daysToGo: "शेष दिन",
        trimester: "वर्तमान तिमाही",
        weeklyTitle: (title: string) => title, // Assuming titles are kept in English for now
        weeklySize: (size: string) => size,
        tabBaby: "बच्चा",
        tabBody: "शरीर",
        tabSymptoms: "लक्षण",
        tabTips: "सुझाव",
        symptomTrackerTitle: "आज आप कैसा महसूस कर रही हैं?",
        symptomTrackerDesc: "अपनी सेहत पर नज़र रखने के लिए अपने दैनिक लक्षणों को लॉग करें।",
        viewHistory: "इतिहास देखें",
        customSymptoms: "कस्टम लक्षण या नोट्स",
        customSymptomsPlaceholder: "कुछ और जोड़ना है?",
        saveSymptoms: "आज के लक्षण सहेजें",
        loggedToday: "आज लॉग किया गया:",
        animatedJourneyTitle: (trimester: number) => `एनिमेटेड यात्रा: तिमाही ${trimester}`,
        expertInsightsTitle: (trimester: number) => `विशेषज्ञ अंतर्दृष्टि: तिमाही ${trimester}`,
        animatedJourneyDesc: "अपने बच्चे के विकास का एक दृश्य प्रतिनिधित्व देखें।",
        expertInsightsDesc: "इस तिमाही में क्या अपेक्षा करें, इसके बारे में और जानें।",
        myJournal: "मेरी गर्भावस्था जर्नल",
        resetDate: "रीसेट / नई तारीख दर्ज करें",
        getStartedTitle: "आइए शुरू करें!",
        getStartedDesc: "ट्रैकिंग शुरू करने के लिए अपनी देय तिथि की गणना करें।",
        useDueDate: "देय तिथि का उपयोग करें",
        useLMP: "अंतिम पीरियड का उपयोग करें",
        yourDueDate: "आपकी अनुमानित देय तिथि",
        lmpDate: "अंतिम पीरियड का पहला दिन (LMP)",
        pickDate: "एक तारीख चुनें",
        trackPregnancy: "मेरी गर्भावस्था को ट्रैक करें",
        calculateAndTrack: "देय तिथि की गणना करें और ट्रैक करें"
    }
};

const navItems = [
    { href: '/pregnancy-tracker', icon: Home, label: 'Dashboard' },
    { href: '/health-log', icon: FileText, label: 'Health Log' },
    { href: '/appointments', icon: CalendarCheck, label: 'Appointments' },
    { href: '/pregnancy-journal', icon: BookOpen, label: 'Journal' },
    { href: '/pregnancy-guide', icon: Library, label: 'Guide' },
];

export default function PregnancyTrackerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [pregnancyDetails, setPregnancyDetails] = useState<PregnancyDetails | null>(null);
  const [userName, setUserName] = useState('');
  const displayedToastWeekRef = useRef<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);


  const t = translations[language];

  const pregnancyForm = useForm<PregnancyFormData>({
    resolver: zodResolver(pregnancyFormSchema),
    defaultValues: {
      calculationMethod: 'dueDate',
    },
  });

  const symptomForm = useForm<SymptomFormData>({
    resolver: zodResolver(symptomFormSchema),
    defaultValues: {
        symptoms: [],
        notes: "",
    },
  });

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(PREGNANCY_TRACKER_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        data.dueDate = new Date(data.dueDate);
        calculateDetails(data.dueDate);
      }
      const storedUser = localStorage.getItem('glowher-user');
      if (storedUser) {
        setUserName(JSON.parse(storedUser).name);
      }
    } catch (error) {
        console.error("Could not retrieve data from localStorage", error);
    }

    try {
        const todayKey = format(new Date(), 'yyyy-MM-dd');
        const storedSymptoms = localStorage.getItem(`${PREGNANCY_SYMPTOM_LOG_PREFIX}${todayKey}`);
        if(storedSymptoms) {
            symptomForm.reset(JSON.parse(storedSymptoms));
        }
    } catch (error) {
        console.error("Could not retrieve symptoms from localStorage", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const milestoneMessages: { [key: number]: { title: string; description: string } } = {
    13: { title: "Trimester 1 Complete!", description: "You've made it through the first trimester! Many of the early discomforts may start to fade." },
    27: { title: "Welcome to the Third Trimester!", description: "You're on the home stretch! Your baby will be doing a lot of growing from here." },
    30: { title: "Just 10 Weeks to Go!", description: "You've reached 30 weeks! Time to start finalizing preparations for your baby's arrival." },
    37: { title: "Your Baby is Full-Term!", description: "Congratulations! Your baby is considered full-term and could arrive any day now." },
    40: { title: "Happy Due Date!", description: "The big day is here! Remember, due dates are just an estimate. Your baby will arrive when they're ready." },
  };
  
  const supportiveMessages: { [key: number]: string } = {
    9: "Feeling overwhelmed in week 9 is common. Your body is doing incredible work. You’re doing amazing.",
    15: "Your baby is growing fast — and so are you. Don’t forget to rest today.",
    22: "Seeing your baby on the ultrasound is a magical moment. Cherish this halfway point!",
    34: "Feeling breathless? Your baby is taking up a lot of space. This is normal, but take it easy.",
    38: "The waiting game is tough, but you're so close to meeting your little one. You've got this.",
  };

  useEffect(() => {
    if (pregnancyDetails && pregnancyDetails.gestationalAgeWeeks !== displayedToastWeekRef.current) {
        const week = pregnancyDetails.gestationalAgeWeeks;
        const milestone = milestoneMessages[week];
        const supportiveMessage = supportiveMessages[week];

        if(milestone){
            toast({
                title: (
                    <div className="flex items-center gap-2">
                        <PartyPopper className="text-yellow-400" />
                        <span className="font-bold">{milestone.title}</span>
                    </div>
                ),
                description: milestone.description,
                duration: 5000,
            });
        } else if (supportiveMessage) {
            toast({
                title: "A Little Note For You",
                description: supportiveMessage,
                duration: 5000,
            });
        }
        displayedToastWeekRef.current = week;
    }
  }, [pregnancyDetails, toast, milestoneMessages, supportiveMessages]);


  const calculateDetails = (dueDate: Date) => {
    const today = startOfDay(new Date());
    const startDate = subDays(dueDate, 280); // 40 weeks * 7 days
    
    const totalDays = differenceInDays(today, startDate);
    if (totalDays < 0) {
        toast({
            variant: 'destructive',
            title: "Invalid Date",
            description: "The calculated pregnancy start date is in the future. Please check your entered date.",
        });
        return;
    }
    const gestationalAgeWeeks = Math.floor(totalDays / 7);
    const gestationalAgeDays = totalDays % 7;

    const daysLeft = differenceInDays(dueDate, today);

    let trimester = 1;
    if (gestationalAgeWeeks >= 28) trimester = 3;
    else if (gestationalAgeWeeks >= 14) trimester = 2;

    const details = {
        dueDate,
        gestationalAgeWeeks,
        gestationalAgeDays,
        daysLeft,
        trimester
    };
    
    setPregnancyDetails(details);
    try {
        localStorage.setItem(PREGNANCY_TRACKER_KEY, JSON.stringify({ dueDate }));
    } catch(e) { console.error(e) }

  }

  function onPregnancyFormSubmit(values: PregnancyFormData) {
    let calculatedDueDate: Date;
    if (values.calculationMethod === 'lmp') {
      calculatedDueDate = addDays(values.date, 280); // Naegele's rule
    } else {
      calculatedDueDate = values.date;
    }
    
    calculateDetails(calculatedDueDate);

    toast({
      title: "Pregnancy Tracked!",
      description: "Your due date and progress have been calculated.",
    });
  }
  
  function onSymptomFormSubmit(values: SymptomFormData) {
    try {
        const todayKey = format(new Date(), 'yyyy-MM-dd');
        const dataToSave = { ...values, logDate: new Date().toISOString() };
        localStorage.setItem(`${PREGNANCY_SYMPTOM_LOG_PREFIX}${todayKey}`, JSON.stringify(dataToSave));
        toast({
            title: "Symptoms Logged!",
            description: "Today's symptoms have been saved successfully.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save your symptoms. Please try again.",
        });
    }
  }


  const currentWeekData = pregnancyDetails ? weeklyDevelopment.find(w => w.week === pregnancyDetails.gestationalAgeWeeks) || weeklyDevelopment[0] : weeklyDevelopment[0];
  const animatedVideoId = pregnancyDetails ? animatedTrimesterVideos[pregnancyDetails.trimester] : null;
  const knowledgeVideoId = pregnancyDetails ? knowledgeTrimesterVideos[pregnancyDetails.trimester] : null;
  const loggedSymptoms = symptomForm.watch('symptoms') || [];

  if (pregnancyDetails && currentWeekData) {
    return (
        <div className="relative flex min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
            {/* Desktop Sidebar */}
            <nav className={cn(
                "hidden md:flex flex-col p-4 space-y-2 bg-white/50 border-r border-white/30 min-h-screen sticky top-0 transition-all duration-300",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="p-2 mb-4 flex items-center justify-between">
                    <GlowHerLogo className={cn(!isSidebarOpen && "hidden")} />
                    <div className={cn("md:hidden", isSidebarOpen && "hidden")}>
                        <Baby className="h-6 w-6 text-pink-500"/>
                    </div>
                </div>
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} title={item.label}>
                         <Button
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className={cn("w-full justify-start text-base", !isSidebarOpen && "justify-center")}
                        >
                            <item.icon className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
                            <span className={cn(!isSidebarOpen && "hidden")}>{item.label}</span>
                        </Button>
                    </Link>
                ))}
            </nav>

            <div className="flex-1 flex flex-col">
                <header className="container mx-auto px-4 md:px-8 py-4 sticky top-0 bg-white/30 backdrop-blur-md z-40 border-b border-white/30">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <PanelLeft className="h-6 w-6" />
                        </Button>
                        <div className="md:hidden">
                            <GlowHerLogo />
                        </div>
                        <h1 className="font-headline text-2xl md:text-3xl font-bold text-slate-900 hidden md:block">
                            {userName ? `Hi ${userName} 👋` : ''}
                        </h1>
                         <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                            <Home className="h-6 w-6 text-slate-700"/>
                        </Button>
                    </div>
                </header>

                <main className="flex-grow container mx-auto px-4 md:px-8 py-8 space-y-8 pb-24">
                    <div className="text-center md:text-left md:hidden">
                        <h1 className="font-headline text-4xl font-bold text-slate-900">
                            {userName ? `Hi ${userName} 👋` : ''}
                        </h1>
                        <p className="mt-2 text-lg text-slate-600">{t.pageTitle}</p>
                    </div>

                     <p className="mt-2 text-lg text-slate-600 text-center md:text-left">{t.progressText(pregnancyDetails.gestationalAgeWeeks, pregnancyDetails.gestationalAgeDays)}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">{t.dueDate}</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-pink-500">{format(pregnancyDetails.dueDate, "MMM d, yyyy")}</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">{t.daysToGo}</CardTitle>
                                <Baby className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-blue-500">{pregnancyDetails.daysLeft}</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">{t.trimester}</CardTitle>
                                <BarChart className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-purple-500">{pregnancyDetails.trimester}</p>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <div className="relative">
                                    <Image src={currentWeekData.imageUrl} data-ai-hint={currentWeekData.aiHint} alt={`Week ${currentWeekData.week} development`} width={600} height={600} className="object-cover w-full h-full" />
                                    <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                                        <h2 className="font-headline text-4xl text-white">{t.weeklyTitle(currentWeekData.title)}</h2>
                                        <p className="text-white/90 mt-1">{t.weeklySize(currentWeekData.size)}</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                     <div 
                                        className="bg-pink-100/30 p-4 rounded-lg cursor-pointer transition-all"
                                        onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-pink-800">Weekly Summary</h3>
                                            <ChevronDown className={cn("h-5 w-5 text-pink-800 transition-transform", isSummaryExpanded && "rotate-180")} />
                                        </div>
                                         <p className={cn("mt-2 text-sm text-slate-700", !isSummaryExpanded && "truncate")}>
                                            {currentWeekData.summary}
                                        </p>
                                    </div>
                                    
                                    <Tabs defaultValue="development" className="w-full">
                                        <TabsList className="grid w-full grid-cols-4 bg-pink-100/50 text-pink-800">
                                            <TabsTrigger value="development" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.tabBaby}</TabsTrigger>
                                            <TabsTrigger value="body" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.tabBody}</TabsTrigger>
                                            <TabsTrigger value="symptoms" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.tabSymptoms}</TabsTrigger>
                                            <TabsTrigger value="tips" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.tabTips}</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="development" className="mt-4 prose max-w-none text-slate-700 text-sm max-h-60 overflow-y-auto">
                                            <ul className="space-y-3">
                                                {currentWeekData.development.map((item, index) => <li key={index} className="flex items-start gap-3"><span className="mt-1">{item.emoji}</span><span>{item.text}</span></li>)}
                                            </ul>
                                        </TabsContent>
                                        <TabsContent value="body" className="mt-4 prose max-w-none text-slate-700 text-sm max-h-60 overflow-y-auto">
                                            <ul className="space-y-3">
                                                {currentWeekData.bodyChanges.map((item, index) => <li key={index} className="flex items-start gap-3"><span className="mt-1">{item.emoji}</span><span>{item.text}</span></li>)}
                                            </ul>
                                        </TabsContent>
                                        <TabsContent value="symptoms" className="mt-4 prose max-w-none text-slate-700 text-sm max-h-60 overflow-y-auto">
                                            <ul className="space-y-3">
                                                {currentWeekData.symptoms.map((item, index) => <li key={index} className="flex items-start gap-3"><span className="mt-1">{item.emoji}</span><span>{item.text}</span></li>)}
                                            </ul>
                                        </TabsContent>
                                        <TabsContent value="tips" className="mt-4 prose max-w-none text-slate-700 text-sm max-h-60 overflow-y-auto">
                                            <ul className="space-y-3">
                                                {currentWeekData.tips.map((item, index) => <li key={index} className="flex items-start gap-3"><span className="mt-1">{item.emoji}</span><span>{item.text}</span></li>)}
                                            </ul>
                                        </TabsContent>
                                    </Tabs>

                                </div>
                           </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30 overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-pink-800">Your Body's Journey: Week {currentWeekData.week}</CardTitle>
                            <CardDescription>A visual look at how your body might be changing this week.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-center">
                            <Image src={currentWeekData.motherImageUrl} alt={`Illustration of mother's body at week ${currentWeekData.week}`} width={600} height={600} className="object-contain w-full h-auto max-w-sm" />
                        </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="font-headline text-2xl text-pink-600">{t.symptomTrackerTitle}</CardTitle>
                                    <Button variant="outline" onClick={() => router.push('/health-log')}>
                                        <History className="mr-2 h-4 w-4" />
                                        {t.viewHistory}
                                    </Button>
                                </div>
                                <CardDescription className="text-slate-600">{t.symptomTrackerDesc}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...symptomForm}>
                                    <form onSubmit={symptomForm.handleSubmit(onSymptomFormSubmit)} className="space-y-6">
                                        <FormField
                                            control={symptomForm.control}
                                            name="symptoms"
                                            render={() => (
                                            <FormItem>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {pregnancySymptoms.map((item) => (
                                                    <FormField
                                                    key={item.id}
                                                    control={symptomForm.control}
                                                    name="symptoms"
                                                    render={({ field }) => {
                                                        return (
                                                        <FormItem
                                                            key={item.id}
                                                            className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-slate-300 p-3 hover:bg-pink-100/50 transition-colors"
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
                                                                className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                                                            />
                                                            </FormControl>
                                                            <FormLabel className="font-normal flex items-center gap-2 cursor-pointer text-slate-800">
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
                                            control={symptomForm.control}
                                            name="notes"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700">{t.customSymptoms}</FormLabel>
                                                <FormControl>
                                                <Textarea
                                                    placeholder={t.customSymptomsPlaceholder}
                                                    className="resize-none"
                                                    {...field}
                                                />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <div className="flex items-center gap-4 flex-wrap">
                                             <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white">
                                                <ThumbsUp className="mr-2 h-4 w-4" />
                                                {t.saveSymptoms}
                                            </Button>
                                            {loggedSymptoms.length > 0 && (
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <span className="text-sm font-semibold text-slate-500">{t.loggedToday}</span>
                                                    {loggedSymptoms.map(symptomId => {
                                                        const symptom = pregnancySymptoms.find(s => s.id === symptomId);
                                                        return symptom ? <Badge key={symptomId} variant="secondary" className="bg-pink-100 text-pink-800 border-none">{symptom.label}</Badge> : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                        <div className="space-y-8">
                             {animatedVideoId && (
                                <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30">
                                    <CardHeader>
                                        <CardTitle className="font-headline text-2xl text-pink-600">{t.animatedJourneyTitle(pregnancyDetails.trimester)}</CardTitle>
                                        <CardDescription>{t.animatedJourneyDesc}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="aspect-video">
                                            <iframe className="w-full h-full rounded-lg" src={`https://www.youtube.com/embed/${animatedVideoId}`} title={`Animated video for Trimester ${pregnancyDetails.trimester}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            {knowledgeVideoId && (
                                <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30">
                                    <CardHeader>
                                        <CardTitle className="font-headline text-2xl text-pink-600">{t.expertInsightsTitle(pregnancyDetails.trimester)}</CardTitle>
                                        <CardDescription>{t.expertInsightsDesc}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="aspect-video">
                                            <iframe className="w-full h-full rounded-lg" src={`https://www.youtube.com/embed/${knowledgeVideoId}`} title={`Knowledge video for Trimester ${pregnancyDetails.trimester}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-4">
                        <Button onClick={() => router.push('/pregnancy-journal')} className="bg-pink-500 hover:bg-pink-600 text-white">
                            <ClipboardPlus className="mr-2 h-4 w-4"/>
                            {t.myJournal}
                        </Button>
                        <Button variant="outline" onClick={() => setPregnancyDetails(null)}>{t.resetDate}</Button>
                    </div>

                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white/80 backdrop-blur-md border-t border-white/30">
                <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                             <Link key={item.href} href={item.href} className="inline-flex flex-col items-center justify-center px-2 hover:bg-pink-100/50 group">
                                <item.icon className={cn("w-6 h-6 mb-1 text-slate-500 group-hover:text-pink-600", isActive && "text-pink-600")} />
                                <span className={cn("text-xs text-slate-500 group-hover:text-pink-600", isActive && "text-pink-600")}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
        <div className="relative z-10 flex flex-col min-h-screen">
        <header className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
            <GlowHerLogo />
            <Button variant="ghost" onClick={() => router.push('/')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                {t.backToDashboard}
            </Button>
            </div>
      </header>
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-8">
        <Card className="w-full max-w-lg shadow-xl bg-white/50 backdrop-blur-sm border-white/30">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-center text-pink-600">{t.getStartedTitle}</CardTitle>
                <CardDescription className="text-center text-slate-600">{t.getStartedDesc}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...pregnancyForm}>
                    <form onSubmit={pregnancyForm.handleSubmit(onPregnancyFormSubmit)} className="space-y-6">
                         <FormField
                            control={pregnancyForm.control}
                            name="calculationMethod"
                            render={({ field }) => (
                                <FormItem>
                                <Tabs defaultValue={field.value} onValueChange={(value) => field.onChange(value as 'dueDate' | 'lmp')} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-pink-100/50 text-pink-800">
                                        <TabsTrigger value="dueDate" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.useDueDate}</TabsTrigger>
                                        <TabsTrigger value="lmp" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.useLMP}</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                </FormItem>
                            )}
                         />

                        <FormField
                            control={pregnancyForm.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-center">
                                <FormLabel className="text-lg font-semibold text-slate-700">
                                    {pregnancyForm.watch('calculationMethod') === 'dueDate' ? t.yourDueDate : t.lmpDate}
                                </FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn("w-[280px] text-left font-normal", !field.value && "text-muted-foreground")}
                                        >
                                        {field.value ? format(field.value, "PPP") : <span>{t.pickDate}</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={pregnancyForm.watch('calculationMethod') === 'lmp' ? (date) => date > new Date() : undefined}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-col gap-2 pt-4">
                            <Button type="submit" size="lg" className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                                {pregnancyForm.watch('calculationMethod') === 'lmp' ? t.calculateAndTrack : t.trackPregnancy}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </main>
      </div>
    </div>
  );
}
