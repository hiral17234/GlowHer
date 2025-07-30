
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Flame, Wind, Ear, Eye, Hand, Rss, Sparkles, LoaderCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { generateFireAuraAdvice } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


const breathingCycle = [
  { text: 'Inhale...', duration: 4000 },
  { text: 'Hold...', duration: 4000 },
  { text: 'Exhale...', duration: 6000 },
];

const fireQuizQuestions = [
    {
      question: "When you imagine a fire, what do you feel?",
      options: ["A comforting warmth, like a fireplace.", "An exciting energy, like a bonfire.", "A powerful force of creation or destruction.", "A flickering flame of a single candle."],
      key: "fireFeeling"
    },
    {
      question: "What does 'passion' mean to you right now?",
      options: ["A deep love for my hobbies and interests.", "A romantic connection with someone.", "A driving ambition towards a professional goal.", "A quiet, steady dedication to my values."],
      key: "passionMeaning"
    },
    {
      question: "If your energy was a flame, how would it be burning?",
      options: ["Like a slow, steady, controlled burn.", "Like a roaring, energetic bonfire.", "Like a tiny, flickering pilot light.", "Like scattered, unpredictable sparks."],
      key: "energyFlame"
    },
    {
      question: "What kind of creative spark are you looking to ignite?",
      options: ["A spark of inspiration for a new project.", "A spark of connection in my relationships.", "A spark of joy in my daily routine.", "A spark of confidence in myself."],
      key: "creativeSpark"
    },
    {
      question: "When you face a challenge, what 'fire' do you use?",
      options: ["The fire of determination to overcome it.", "The fire of creativity to find a new way.", "The fire of patience to wait for the right moment.", "The fire of courage to ask for help."],
      key: "challengeFire"
    },
    {
      question: "What do you want to 'burn away' or let go of?",
      options: ["Self-doubt and insecurity.", "Old habits that no longer serve me.", "Lingering resentment or anger.", "The pressure of external expectations."],
      key: "burnAway"
    },
];

export default function FireAuraPage() {
    const router = useRouter();
    const videoId = "5gBJrZmbGLo";
    const [cycleText, setCycleText] = useState('Get Ready...');
    const [isBreathing, setIsBreathing] = useState(false);
    const { toast } = useToast();

    // Quiz State
    const [quizStarted, setQuizStarted] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loadingAdvice, setLoadingAdvice] = useState(false);
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

    const handleGetAdvice = async () => {
        if (Object.keys(answers).length !== fireQuizQuestions.length) {
            toast({
                variant: 'destructive',
                title: "Please answer all questions.",
                description: "Your reflection is more accurate with complete answers.",
            });
            return;
        }
        setLoadingAdvice(true);
        setAdvice("");
        try {
            const result = await generateFireAuraAdvice(answers);
            if (result.success && result.advice) {
                setAdvice(result.advice);
            } else {
                toast({ variant: 'destructive', title: "Error", description: result.error || "Could not generate advice." });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "An unexpected error occurred." });
        } finally {
            setLoadingAdvice(false);
        }
    };


    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Flame className="h-8 w-8 text-orange-500" />
                        Fire Aura
                    </h1>
                    <Button variant="ghost" onClick={() => router.push('/breathe')}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Breathing
                    </Button>
                </div>
            </header>
            <main className="flex-grow items-center justify-center p-4 md:p-6 space-y-8">
                <Card className="w-full max-w-4xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardDescription>Turn on the music below to feel relaxed.</CardDescription>
                        <CardTitle className="font-headline text-3xl flex items-center gap-2"><Wind /> Take a moment to breathe</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 text-center p-6">
                        <div className="relative h-48 w-48 flex items-center justify-center">
                             <div className={cn("absolute inset-0 bg-orange-400 rounded-full opacity-50 blur-xl", isBreathing && 'animate-breath-aura')} />
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
                        <p className="flex items-center gap-2"><span className="font-bold text-orange-500">5</span><Eye className="inline-block h-5 w-5"/> Acknowledge five things you see around you.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-orange-500">4</span><Hand className="inline-block h-5 w-5"/> Acknowledge four things you can touch around you.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-orange-500">3</span><Ear className="inline-block h-5 w-5"/> Acknowledge three things you can hear.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-orange-500">2</span><Rss className="inline-block h-5 w-5"/> Acknowledge two things you can smell.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-orange-500">1</span><Wind className="inline-block h-5 w-5"/> Acknowledge one thing you can taste.</p>
                    </CardContent>
                </Card>
                
                 <Card className="w-full max-w-4xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-orange-400" /> Reflect on Your Inner Fire</CardTitle>
                         <CardDescription>Answer these questions to get a personalized insight.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                         {!quizStarted ? (
                            <div className="text-center">
                                <Button onClick={() => setQuizStarted(true)}>Start Reflection</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {fireQuizQuestions.map((q, index) => (
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
                                <Button onClick={handleGetAdvice} disabled={loadingAdvice} className="w-full">
                                    {loadingAdvice ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : "Get My Reflection"}
                                </Button>
                                {advice && (
                                     <Alert className="mt-4 border-orange-300 bg-orange-50 dark:bg-orange-900/20">
                                        <Lightbulb className="h-4 w-4 text-orange-500" />
                                        <AlertTitle className="text-orange-700 dark:text-orange-300">Your Fire Reflection</AlertTitle>
                                        <AlertDescription className="text-orange-600 dark:text-orange-200 whitespace-pre-wrap">
                                            {advice}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}
                    </CardContent>
                 </Card>


                <div className="w-full max-w-2xl mx-auto text-center p-6 space-y-6">
                    <h2 className="text-3xl font-headline">Your Fire Aura Music</h2>
                     <div className="aspect-video">
                        <iframe
                            className="w-full h-full rounded-lg shadow-xl"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
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
