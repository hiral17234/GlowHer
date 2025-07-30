
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Sun, Wind, Ear, Eye, Hand, Rss, Sparkles, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


const videos = ["FkWHg3lvZXw", "_M-joHQkBS0", "HkHL0DIGOfs"];
const breathingCycle = [
  { text: 'Inhale...', duration: 4000 },
  { text: 'Hold...', duration: 4000 },
  { text: 'Exhale...', duration: 6000 },
];

const sunQuizQuestions = [
    {
      question: "What time of day do you feel most energized and 'sunny'?",
      options: ["Sunrise: Full of fresh potential.", "Mid-day: At the peak of my energy.", "Golden Hour: Feeling warm and reflective.", "I'm more of a night owl."],
      key: "sunnyTime"
    },
    {
      question: "Which quality of the sun do you want to embody more?",
      options: ["Its steady, reliable light.", "Its powerful, life-giving warmth.", "Its brilliant, shining confidence.", "Its ability to create beautiful sunsets."],
      key: "sunQuality"
    },
    {
      question: "What is one thing you are genuinely proud of right now?",
      options: ["A personal accomplishment.", "A kind act I did for someone.", "My resilience in a tough situation.", "A skill I have been developing."],
      key: "proudOf"
    },
    {
      question: "If you could share your 'light' with someone, what would you offer?",
      options: ["A word of encouragement.", "A helping hand with a task.", "A moment of shared laughter.", "A listening ear."],
      key: "shareLight"
    },
    {
      question: "What area of your life needs more 'sunlight' or attention?",
      options: ["My physical health and vitality.", "My social connections and friendships.", "My creative hobbies and passions.", "My personal space and home environment."],
      key: "needsSunlight"
    },
    {
      question: "How do you recharge your inner battery when you're feeling drained?",
      options: ["By spending time in actual sunlight.", "By connecting with positive, energetic people.", "By engaging in a hobby I love.", "By celebrating a small win."],
      key: "rechargeBattery"
    },
];

const adviceMap: Record<string, Record<string, string>> = {
    sunnyTime: {
      "Sunrise: Full of fresh potential.": "🌅 You thrive on new beginnings. Tip: Start your day by spending two minutes thinking of one thing you're looking forward to, no matter how small.",
      "Mid-day: At the peak of my energy.": "☀️ You are a powerhouse of action. Tip: Schedule your most important task for the time of day you feel most energetic to maximize your effectiveness.",
      "Golden Hour: Feeling warm and reflective.": "🌇 You appreciate warmth and gentle reflection. Tip: At the end of your day, take a moment to reflect on one good thing that happened. Let it sink in.",
      "I'm more of a night owl.": "🦉 You find your energy in the quiet of the night. Tip: Embrace this, but ensure you are still getting some sunlight during the day for Vitamin D and mood regulation.",
    },
    sunQuality: {
        "Its steady, reliable light.": "💡 You value consistency and dependability. Tip: Create a simple daily ritual, like a 5-minute morning stretch, to bring that steady light into your routine.",
        "Its powerful, life-giving warmth.": "❤️ You want to be a source of comfort and vitality. Tip: Offer a genuine compliment to someone today. Your warmth can be life-giving to others.",
        "Its brilliant, shining confidence.": "✨ You are ready to step into your power. Tip: Strike a 'power pose' (stand tall, shoulders back) for one minute. It can genuinely boost your feelings of confidence.",
        "Its ability to create beautiful sunsets.": "🎨 You appreciate the beauty of endings and transitions. Tip: As you finish a task today, take a moment to appreciate its completion before rushing to the next thing.",
    },
    proudOf: {
        "A personal accomplishment.": "🏆 You have achieved something meaningful. Tip: Write it down! Don't let this accomplishment fade. Keep a 'brag file' of things you're proud of to look at when you feel low.",
        "A kind act I did for someone.": "🤗 Your kindness is a superpower. Tip: Savor the good feeling that comes from helping others. That warmth is a reward in itself.",
        "My resilience in a tough situation.": "💪 You have overcome a challenge. Tip: Acknowledge your own strength. Remind yourself, 'I have handled difficult things before, and I can handle them again.'",
        "A skill I have been developing.": "🛠️ You are growing and learning. Tip: Spend just 10 minutes practicing or using this skill today to reinforce your progress and build momentum.",
    },
    shareLight: {
        "A word of encouragement.": "💬 Your words have power. Tip: Think of someone who is doing a great job and send them a quick message to let them know you see their effort.",
        "A helping hand with a task.": "🤝 Your actions show you care. Tip: Offer specific help. Instead of 'Let me know if you need anything,' try 'Can I grab you a coffee?'",
        "A moment of shared laughter.": "😂 You bring joy to others. Tip: Share a funny video, meme, or story with a friend today to spread the sunshine.",
        "A listening ear.": "👂 You offer the gift of presence. Tip: When someone is talking to you, practice active listening—put your phone away and give them your full, undivided attention.",
    },
    needsSunlight: {
        "My physical health and vitality.": "🏃‍♀️ Your body is calling for attention. Tip: Go for a 10-minute walk outside. The combination of movement and sunlight is a powerful energy booster.",
        "My social connections and friendships.": "🧑‍🤝‍🧑 You are craving community. Tip: Reach out to one friend and schedule a call or meetup. Connection is a key source of human energy.",
        "My creative hobbies and passions.": "🎨 Your inner artist wants to play. Tip: Dedicate a 15-minute 'creative snack' to a hobby you love, with no pressure for it to be perfect.",
        "My personal space and home environment.": "🏡 Your environment affects your mood. Tip: Open the curtains and windows to let in fresh air and natural light. It can instantly lift the energy of a room.",
    },
    rechargeBattery: {
        "By spending time in actual sunlight.": "☀️ You are solar-powered! Tip: Make it a non-negotiable part of your day. Even 10 minutes of sun on your skin can make a huge difference.",
        "By connecting with positive, energetic people.": "✨ You are fueled by good vibes. Tip: Identify the people who lift you up and make a conscious effort to spend a little more time with them this week.",
        "By engaging in a hobby I love.": "💖 Your passions are your fuel. Tip: Schedule your hobby time into your calendar as you would any important appointment. Protect that time!",
        "By celebrating a small win.": "🎉 You are energized by progress. Tip: At the end of the day, do a 'fist-pump' for one thing you got done. Acknowledging wins, no matter how small, creates positive momentum.",
    }
};


export default function SunAuraPage() {
    const router = useRouter();
    const [cycleText, setCycleText] = useState('Get Ready...');
    const [isBreathing, setIsBreathing] = useState(false);
    const { toast } = useToast();

    // Quiz State
    const [quizStarted, setQuizStarted] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [advice, setAdvice] = useState("");


    useEffect(() => {
        if (!isBreathing) return;

        const totalDuration = breathingCycle.reduce((sum, cycle) => sum + cycle.duration, 0);

        const runCycle = () => {
        setCycleText(breathingCycle[0].text);
        setTimeout(() => setCycleText(breathingCycle[1].text), breathingCycle[0].duration);
        setTimeout(() => setCycleText(breathingCycle[2].text), breathingCycle[0].duration + breathingCycle[1].duration);
        };

        runCycle(); // Run immediately
        const cycleInterval = setInterval(runCycle, totalDuration);

        return () => clearInterval(cycleInterval);
    }, [isBreathing]);

    const handleAnswerChange = (key: string, value: string) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleGetAdvice = () => {
        if (Object.keys(answers).length !== sunQuizQuestions.length) {
            toast({
                variant: 'destructive',
                title: "Please answer all questions.",
                description: "Your reflection is more accurate with complete answers.",
            });
            return;
        }

        const generatedAdvice = sunQuizQuestions.map(q => {
            const answer = answers[q.key];
            return adviceMap[q.key]?.[answer] || '';
        }).filter(Boolean).join('\n\n');
        
        setAdvice(generatedAdvice);
    };


    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sun className="h-8 w-8 text-yellow-500" />
                        Sun Aura
                    </h1>
                    <Button variant="ghost" onClick={() => router.push('/breathe')}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Breathing
                    </Button>
                </div>
            </header>
            <main className="flex-grow items-center justify-center p-4 md:p-6 space-y-8">
                 <div className="w-full max-w-4xl mx-auto text-center p-6 space-y-8">
                    <h2 className="text-3xl font-headline">Your Sun Aura Music</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {videos.map(videoId => (
                            <div key={videoId} className="aspect-video">
                                <iframe
                                    className="w-full h-full rounded-lg shadow-xl"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ))}
                    </div>
                </div>
                <Card className="w-full max-w-4xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardDescription>Listen to the music to feel relaxed.</CardDescription>
                        <CardTitle className="font-headline text-3xl flex items-center gap-2"><Wind /> Take a moment to breathe</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 text-center p-6">
                        <div className="relative h-48 w-48 flex items-center justify-center">
                             <div className={cn("absolute inset-0 bg-yellow-400 rounded-full opacity-50 blur-xl", isBreathing && 'animate-breath-aura')} />
                             <div className="z-10 flex flex-col items-center justify-center">
                                <p className="text-xl font-semibold mb-2">{isBreathing ? cycleText : 'Ready?'}</p>
                            </div>
                        </div>
                        {!isBreathing ? (
                            <Button onClick={() => setIsBreathing(true)}>Begin Breathing</Button>
                        ) : (
                            <div className="text-left">
                                <p className="text-green-600 dark:text-green-400 font-semibold">Breathing session started.</p>
                                <p className="text-muted-foreground">Follow the prompts and sync your breath with the animation.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                 <Card className="w-full max-w-4xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">5-4-3-2-1 Grounding</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="flex items-center gap-2"><span className="font-bold text-yellow-500">5</span><Eye className="inline-block h-5 w-5"/> Acknowledge five things you see around you.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-yellow-500">4</span><Hand className="inline-block h-5 w-5"/> Acknowledge four things you can touch around you.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-yellow-500">3</span><Ear className="inline-block h-5 w-5"/> Acknowledge three things you can hear.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-yellow-500">2</span><Rss className="inline-block h-5 w-5"/> Acknowledge two things you can smell.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-yellow-500">1</span><Wind className="inline-block h-5 w-5"/> Acknowledge one thing you can taste.</p>
                    </CardContent>
                </Card>
                
                 <Card className="w-full max-w-4xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-yellow-400" /> Reflect on Your Inner Sunshine</CardTitle>
                         <CardDescription>Answer these questions to connect with your personal vitality.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                         {!quizStarted ? (
                            <div className="text-center">
                                <Button onClick={() => setQuizStarted(true)}>Start Reflection</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {sunQuizQuestions.map((q, index) => (
                                    <div key={q.key}>
                                        <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                                        <RadioGroup onValueChange={(value) => handleAnswerChange(q.key, value)} value={answers[q.key]}>
                                            {q.options.map(opt => (
                                                 <div key={opt} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={opt} id={`${q.key}-${opt}`} />
                                                    <Label htmlFor={`${q.key}-${opt}`}>{opt}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                ))}
                                <Button onClick={handleGetAdvice} className="w-full">
                                    Get My Reflection
                                </Button>
                                {advice && (
                                     <Alert className="mt-4 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                                        <AlertTitle className="text-yellow-700 dark:text-yellow-300">Your Sun Reflection</AlertTitle>
                                        <AlertDescription className="text-yellow-600 dark:text-yellow-200 whitespace-pre-wrap">
                                            {advice}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}
                    </CardContent>
                 </Card>

            </main>
             <style jsx>{`
                @keyframes breath-aura {
                    0% { transform: scale(1.1); opacity: 0.9; } /* Exhale End */
                    29% { transform: scale(0.9); opacity: 0.7; } /* Inhale Start */
                    57% { transform: scale(0.9); opacity: 0.7; } /* Hold End */
                    100% { transform: scale(1.1); opacity: 0.9; } /* Exhale End */
                }
                .animate-breath-aura {
                    animation: breath-aura 14s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
