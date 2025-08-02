
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

type WeeklyInfo = {
    emoji: string;
    text: string;
}

const weeklyDevelopment: Array<{
    week: number;
    title: string;
    size: string;
    summary: string;
    development: WeeklyInfo[];
    bodyChanges: WeeklyInfo[];
    symptoms: WeeklyInfo[];
    tips: WeeklyInfo[];
    imageUrl: string;
    aiHint: string;
}> = [
    { 
        week: 0, 
        title: "Getting Started", 
        size: "Your journey is about to begin.", 
        summary: "Set your due date or last menstrual period to start tracking your pregnancy week by week.",
        development: [],
        bodyChanges: [],
        symptoms: [],
        tips: [],
        imageUrl: "https://placehold.co/600x400.png", 
        aiHint: "pregnancy test" 
    },
    { 
        week: 1, 
        title: "Week 1: The Journey Begins", 
        size: "You're on your period, so not yet pregnant.", 
        summary: "Pregnancy is counted from the first day of your last period. This week, your body is preparing for potential conception.",
        development: [
            { emoji: '🩸', text: 'The first day of your period marks the beginning of your menstrual cycle and week 1 of pregnancy.' },
            { emoji: ' hormonal', text: 'Hormones like FSH (follicle-stimulating hormone) begin to rise, preparing your ovaries.' },
            { emoji: '🥚', text: 'Multiple follicles, each containing an egg, start to mature in your ovaries.' },
            { emoji: ' uterine', text: 'Your body sheds last month\'s uterine lining to prepare a fresh, new one.' },
            { emoji: '🌱', text: 'Estrogen levels are low at the start of the week but will begin to rise.' },
            { emoji: '⏲️', text: 'This phase typically lasts between 3 to 7 days for most women.' },
            { emoji: '✨', text: 'Your body is resetting itself for a potential pregnancy this cycle.' },
            { emoji: '💪', text: 'It\'s a period of renewal and preparation on a microscopic level.' }
        ],
        bodyChanges: [
            { emoji: ' menstruating', text: 'The most obvious change is your menstrual period.' },
            { emoji: '🌡️', text: 'Your basal body temperature is at its lowest point during your period.' },
            { emoji: ' cervix', text: 'The cervix is low, firm, and slightly open to allow blood to pass.' },
            { emoji: '⚖️', text: 'Hormone levels (estrogen and progesterone) are at their lowest.' },
            { emoji: '😩', text: 'You might feel tired or have less energy due to hormonal changes and blood loss.' },
            { emoji: '💧', text: 'Water retention from the previous cycle starts to decrease.' },
            { emoji: '🧖‍♀️', text: 'Some women find their skin is more prone to breakouts during this time.' },
            { emoji: '😌', text: 'For many, the start of their period brings relief from PMS symptoms.' }
        ],
        symptoms: [
            { emoji: '🩸', text: 'Vaginal bleeding is the primary symptom of this week.' },
            { emoji: '😖', text: 'Uterine cramping is common as your uterus contracts to shed its lining.' },
            { emoji: '🎈', text: 'Bloating and water retention can carry over from the days before your period.' },
            { emoji: '🤕', text: 'Hormonal headaches or migraines can occur due to the drop in estrogen.' },
            { emoji: '😴', text: 'Fatigue and low energy are very common.' },
            { emoji: '🎢', text: 'Mood swings, irritability, or feeling more emotional are possible.' },
            { emoji: '😫', text: 'Lower back pain often accompanies menstrual cramps.' },
            { emoji: '🍫', text: 'You might still experience food cravings from the premenstrual phase.' }
        ],
        tips: [
            { emoji: '💊', text: 'Start taking a prenatal vitamin with at least 400 mcg of folic acid now.' },
            { emoji: '🗓️', text: 'Track your cycle using a calendar or app to predict your fertile window.' },
            { emoji: '🧘‍♀️', text: 'Prioritize rest and gentle movement like walking or stretching.' },
            { emoji: '👩‍⚕️', text: 'Schedule a preconception check-up with your doctor to discuss your health.' },
            { emoji: '🚭', text: 'Reduce or eliminate alcohol and smoking to create a healthy environment for conception.' },
            { emoji: '☕', text: 'Limit caffeine intake to one or two cups of coffee per day.' },
            { emoji: '🥗', text: 'Focus on a balanced diet rich in iron and vitamin C to replenish your body.' },
            { emoji: '💕', text: 'Communicate with your partner about your plans and feelings on this journey.' }
        ],
        imageUrl: "https://placehold.co/600x400.png", 
        aiHint: "calendar vitamins" 
    },
    { 
        week: 2, 
        title: "Week 2: Preparing for Ovulation", 
        size: "An egg is maturing in your ovary.", 
        summary: "Your uterine lining is thickening, and your body is getting ready to release an egg. This is your fertile window.",
        development: [
            { emoji: '🥚', text: 'A single dominant follicle outgrows the others and prepares for ovulation.' },
            { emoji: '📈', text: 'Rising estrogen levels cause the uterine lining (endometrium) to thicken.' },
            { emoji: '🧠', text: 'The pituitary gland releases a surge of Luteinizing Hormone (LH) to trigger ovulation.' },
            { emoji: ' mucus', text: 'Cervical mucus becomes clearer, thinner, and more slippery to help sperm.' },
            { emoji: '✨', text: 'The egg inside the follicle completes its first meiotic division.' },
            { emoji: '🚪', text: 'The cervix softens and opens slightly in preparation.' },
            { emoji: '⏰', text: 'Ovulation typically occurs around the end of this week.' },
            { emoji: '🕊️', text: 'The stage is set for the egg to be released and potentially fertilized.' }
        ],
        bodyChanges: [
            { emoji: '⚡', text: 'You may notice a significant increase in your energy levels.' },
            { emoji: '💕', text: 'Libido often peaks during this phase due to high estrogen.' },
            { emoji: '🌡️', text: 'Your basal body temperature will have a slight dip just before ovulation.' },
            { emoji: '💧', text: 'You\'ll notice clear, stretchy, "egg-white" cervical mucus.' },
            { emoji: '👃', text: 'Some women experience a heightened sense of smell.' },
            { emoji: '😊', text: 'Your mood may be more positive, outgoing, and sociable.' },
            { emoji: '✨', text: 'Skin often appears clearer and more radiant—the "ovulation glow."' },
            { emoji: '🤏', text: 'Some women feel a slight twinge of pain on one side as the ovary releases the egg.' }
        ],
        symptoms: [
            { emoji: '💧', text: 'Increased, watery, or egg-white-like vaginal discharge is a key sign.' },
            { emoji: '😊', text: 'A general feeling of well-being and increased energy.' },
            { emoji: '❤️', text: 'Heightened sex drive is very common.' },
            { emoji: '🤕', text: 'Mild one-sided pelvic pain (mittelschmerz) can occur during ovulation.' },
            { emoji: '🎈', text: 'Light bloating is possible for some women.' },
            { emoji: ' spotting', text: 'A small amount of light spotting can occur during ovulation.' },
            { emoji: ' breasts', text: 'Breasts may feel slightly tender or sensitive.' },
            { emoji: '✨', text: 'Most symptoms this week are positive signs of peak fertility.' }
        ],
        tips: [
            { emoji: '❤️', text: 'This is the most fertile time in your cycle to try to conceive.' },
            { emoji: '🧪', text: 'Use ovulation predictor kits (OPKs) to pinpoint the LH surge.' },
            { emoji: '🌡️', text: 'Track your basal body temperature to confirm ovulation after it happens.' },
            { emoji: '🥗', text: 'Eat nutrient-dense foods to support hormonal health.' },
            { emoji: '💧', text: 'Stay well-hydrated, as it can improve cervical mucus quality.' },
            { emoji: '🚭', text: 'Continue avoiding alcohol, smoking, and excessive caffeine.' },
            { emoji: '🧘‍♀️', text: 'Manage stress with activities like yoga or meditation.' },
            { emoji: '💬', text: 'Keep communication open and enjoyable with your partner.' }
        ],
        imageUrl: "https://placehold.co/600x400.png", 
        aiHint: "flower blooming" 
    },
    { 
        week: 3, 
        title: "Week 3: Fertilization & Implantation", 
        size: "The fertilized egg, or blastocyst, is a microscopic ball of cells.", 
        summary: "Success! A sperm has fertilized the egg, and this new ball of cells is making its way to your uterus for implantation.",
        development: [
            { emoji: '🎉', text: 'Fertilization! A single sperm penetrates the egg, creating a zygote.' },
            { emoji: '🧬', text: 'The baby\'s genetic makeup, including sex, is determined at this moment.' },
            { emoji: 'divide;', text: 'The zygote begins rapidly dividing into a ball of cells called a blastocyst.' },
            { emoji: '🚗', text: 'The blastocyst travels down the fallopian tube toward the uterus.' },
            { emoji: '🏠', text: 'The blastocyst begins to burrow into the plush uterine lining—this is implantation.' },
            { emoji: '🤝', text: 'The outer cells of the blastocyst will form the placenta.' },
            { emoji: '👶', text: 'The inner cells of the blastocyst will become the embryo.' },
            { emoji: '📈', text: 'The hormone hCG (human chorionic gonadotropin) begins to be produced.' }
        ],
        bodyChanges: [
            { emoji: '🤫', text: 'Externally, you won\'t notice any changes, as all the action is happening on a microscopic level.' },
            { emoji: '📈', text: 'Internally, the hormone progesterone begins to rise, signaled by the newly forming placenta.' },
            { emoji: '🌸', text: 'Some women (about 25%) experience light implantation spotting or cramping as the blastocyst embeds in the uterus.' },
            { emoji: '🌡️', text: 'Your basal body temperature will remain elevated after ovulation.' },
            { emoji: '🍈', text: 'You might experience very early breast tenderness due to rising hormones.' },
            { emoji: '😴', text: 'A wave of fatigue might hit as your body dedicates enormous energy to the implantation process.' },
            { emoji: '🚽', text: 'Increased progesterone can sometimes lead to early bloating or constipation.' },
            { emoji: '✨', text: 'Your immune system lowers slightly to prevent rejecting the new embryo.' }
        ],
        symptoms: [
            { emoji: '🩸', text: 'Light spotting (pink or brown) around 6-12 days past ovulation, known as implantation bleeding.' },
            { emoji: '😖', text: 'Mild cramping, similar to period cramps but usually lighter.' },
            { emoji: '😴', text: 'Early and unexplained fatigue is a very common first sign.' },
            { emoji: '🍈', text: 'Sore, tender, or swollen breasts.' },
            { emoji: '🎈', text: 'Bloating that feels similar to pre-menstrual bloating.' },
            { emoji: '👃', text: 'A heightened sense of smell can start this early for some.' },
            { emoji: '🤢', text: 'Some women may experience very mild, early nausea.' },
            { emoji: '✨', text: 'Many women experience no symptoms at all this week.' }
        ],
        tips: [
            { emoji: '🧘‍♀️', text: '"Act as if you are pregnant." Continue healthy habits just in case.' },
            { emoji: '⏳', text: 'Resist the urge to take a pregnancy test yet; hCG levels are likely still too low.' },
            { emoji: '💧', text: 'Stay hydrated and eat nutritious, whole foods.' },
            { emoji: '💊', text: 'Don\'t forget your daily prenatal vitamin with folic acid.' },
            { emoji: '😌', text: 'This can be an anxious time. Practice mindfulness and relaxation techniques.' },
            { emoji: '🏃‍♀️', text: 'Continue with gentle to moderate exercise, avoiding any new, strenuous activities.' },
            { emoji: '🚫', text: 'Steer clear of alcohol, smoking, and unsafe foods like unpasteurized cheese.' },
            { emoji: '❤️', text: 'Lean on your partner or a friend for support during the "two-week wait."' }
        ],
        imageUrl: "https://placehold.co/600x400.png", 
        aiHint: "cells microscope" 
    },
    // Weeks 4-40 would follow a similar, expanded structure.
    { 
        week: 4, 
        title: "Week 4: A Positive Test!", 
        size: "Your baby is the size of a poppy seed.", 
        summary: "The blastocyst has successfully implanted in your uterine wall. This is the week you'll likely miss your period and get a positive pregnancy test!", 
        development: [
            { emoji: '🏠', text: 'The embryo is securely implanted in the uterine lining.' },
            { emoji: ' layered', text: 'It has differentiated into three distinct layers: ectoderm, mesoderm, and endoderm.' },
            { emoji: '🧠', text: 'The ectoderm will form the nervous system, skin, and hair.' },
            { emoji: '❤️', text: 'The mesoderm will develop into the skeleton, muscles, heart, and blood vessels.' },
            { emoji: ' lungs', text: 'The endoderm will become the digestive system, liver, and lungs.' },
            { emoji: '탯', text: 'The placenta begins to form and produce the pregnancy hormone hCG.' },
            { emoji: '💧', text: 'The amniotic sac, which will cushion the baby, is also forming.' },
            { emoji: '📈', text: 'Growth is happening at an exponential rate.' }
        ],
        bodyChanges: [
            { emoji: '🩸', text: 'A missed period is the most common and clear sign of pregnancy.' },
            { emoji: '➕', text: 'Hormone hCG is now high enough to be detected by a home pregnancy test.' },
            { emoji: '🍈', text: 'Breasts may feel even more swollen, tender, and tingly.' },
            { emoji: '🎈', text: 'Progesterone-induced bloating can be significant.' },
            { emoji: '🌡️', text: 'Your basal body temperature remains elevated.' },
            { emoji: '🚽', text: 'You may notice an increased need to urinate as your uterus grows.' },
            { emoji: '😩', text: 'Fatigue can feel profound as your body works overtime.' },
            { emoji: '🤫', text: 'From the outside, there are no visible changes yet.' }
        ],
        symptoms: [
            { emoji: ' period', text: 'A missed menstrual period.' },
            { emoji: '🍈', text: 'Extremely sore and sensitive breasts.' },
            { emoji: '😴', text: 'Overwhelming fatigue that feels like you\'ve run a marathon.' },
            { emoji: '😖', text: 'Mild, period-like cramping (without bleeding) is normal.' },
            { emoji: '🤢', text: 'Morning sickness (which can happen any time of day) may begin.' },
            { emoji: '❤️', text: 'Food cravings or aversions may start to appear.' },
            { emoji: '🎢', text: 'Mood swings due to the rapid increase in hormones.' },
            { emoji: '👃', text: 'A heightened sense of smell can make certain scents unbearable.' }
        ],
        tips: [
            { emoji: '🧪', text: 'Take a home pregnancy test first thing in the morning for the most accurate result.' },
            { emoji: '🎉', text: 'Celebrate! This is a huge moment. Let yourself feel all the emotions.' },
            { emoji: '👩‍⚕️', text: 'Call your doctor to schedule your first prenatal appointment, usually around week 8.' },
            { emoji: '💊', text: 'If you haven\'t already, start taking your prenatal vitamins immediately.' },
            { emoji: '🚭', text: 'Double-down on healthy habits: no alcohol, no smoking.' },
            { emoji: '💧', text: 'Stay hydrated, even if you feel bloated.' },
            { emoji: '😴', text: 'Listen to your body and rest whenever you can. Naps are your friend.' },
            { emoji: '❤️', text: 'Share the news with your partner and decide together when to tell others.' }
        ],
        imageUrl: "https://placehold.co/600x400.png", 
        aiHint: "pregnancy test positive" 
    }
];

// Populate remaining weeks with placeholder data to avoid errors
for (let i = 5; i <= 40; i++) {
    weeklyDevelopment.push({
        week: i,
        title: `Week ${i}: Placeholder Title`,
        size: `Placeholder size for week ${i}`,
        summary: `Placeholder summary for week ${i}.`,
        development: [{ emoji: '🚧', text: `Detailed content for week ${i} development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week ${i} body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week ${i} symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week ${i} tips is being generated.` }],
        imageUrl: "https://placehold.co/600x400.png",
        aiHint: "baby illustration"
    });
}


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
        babyLookTitle: "Here is what your baby might look like now",
        guidedWorkoutTitle: (trimester: number) => `Guided Workout for your Trimester ${trimester}`,
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
        babyLookTitle: "आपका बच्चा अब ऐसा दिख सकता है",
        guidedWorkoutTitle: (trimester: number) => `आपकी ${trimester}. तिमाही के लिए निर्देशित कसरत`,
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
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/pregnancy-tracker', icon: Baby, label: 'Weekly Guide' },
    { href: '/pregnancy-symptom-history', icon: FileText, label: 'Health Log' },
    { href: '/appointments', icon: CalendarCheck, label: 'Appointments' },
    { href: '/resources', icon: Library, label: 'Resources' },
];

export default function PregnancyTrackerPage() {
  const router = useRouter();
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
  const trimesterVideoUrl = pregnancyDetails ? trimesterVideos[pregnancyDetails.trimester] : null;
  const babyLookVideoUrl = pregnancyDetails ? babyLookVideos[pregnancyDetails.trimester] : null;
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
                            variant={router.pathname === item.href ? 'secondary' : 'ghost'}
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

                <main className="flex-grow container mx-auto px-4 md:px-8 py-8 space-y-8">
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
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="font-headline text-2xl text-pink-600">{t.symptomTrackerTitle}</CardTitle>
                                    <Button variant="outline" onClick={() => router.push('/pregnancy-symptom-history')}>
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
                            {babyLookVideoUrl && (
                                <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30">
                                    <CardHeader>
                                        <CardTitle className="font-headline text-2xl flex items-center gap-2 text-pink-600">
                                            <Video /> {t.babyLookTitle}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="aspect-video">
                                            <iframe
                                                className="w-full h-full rounded-lg"
                                                src={babyLookVideoUrl}
                                                title="Baby Look YouTube video player"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                             {trimesterVideoUrl && (
                                <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30">
                                    <CardHeader>
                                        <CardTitle className="font-headline text-2xl flex items-center gap-2 text-pink-600">
                                            <Video /> {t.guidedWorkoutTitle(pregnancyDetails.trimester)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="aspect-video">
                                            <iframe
                                                className="w-full h-full rounded-lg"
                                                src={trimesterVideoUrl}
                                                title="Guided Workout YouTube video player"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
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
                    {navItems.map((item) => (
                         <Link key={item.href} href={item.href} className="inline-flex flex-col items-center justify-center px-2 hover:bg-pink-100/50 group">
                            <item.icon className={cn("w-6 h-6 mb-1 text-slate-500 group-hover:text-pink-600", router.pathname === item.href && "text-pink-600")} />
                            <span className={cn("text-xs text-slate-500 group-hover:text-pink-600", router.pathname === item.href && "text-pink-600")}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="pb-16 md:pb-0" /> {/* Spacer for bottom nav */}
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
