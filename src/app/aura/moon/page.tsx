
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Moon, Wind, Ear, Eye, Hand, Rss, Sparkles, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const videos = ["KX4Xgw2gcao", "c8c35isBKbw", "q6UB8sKMZrA"];
const breathingCycle = [
  { text: 'Inhale...', duration: 4000 },
  { text: 'Hold...', duration: 4000 },
  { text: 'Exhale...', duration: 6000 },
];

const moonQuizQuestions = [
    {
      question: "Which phase of the moon best describes your current energy?",
      options: ["New Moon: Quiet, introspective, and full of potential.", "Waxing Moon: Building energy and momentum.", "Full Moon: Peaking energy, feeling vibrant and expressive.", "Waning Moon: Releasing, letting go, and winding down."],
      key: "moonPhase"
    },
    {
      question: "What does your intuition feel like when it speaks to you?",
      options: ["A quiet 'knowing' deep in my gut.", "A sudden, clear idea that pops into my head.", "A physical sensation, like goosebumps.", "A recurring dream or symbol."],
      key: "intuitionFeeling"
    },
    {
      question: "What part of your life could use more gentle, intuitive guidance?",
      options: ["My relationships with others.", "My creative or work projects.", "My physical health and well-being.", "My spiritual or emotional path."],
      key: "intuitiveGuidance"
    },
    {
      question: "What do you need to 'let go of' with the waning moon?",
      options: ["A fear that is holding me back.", "A past hurt or grudge.", "The need for everything to be perfect.", "An expectation I've placed on myself."],
      key: "letGo"
    },
    {
      question: "When you look at the night sky, what feeling arises?",
      options: ["A sense of wonder and awe.", "A feeling of peace and tranquility.", "A connection to something larger than myself.", "A feeling of creative inspiration."],
      key: "nightSky"
    },
    {
      question: "What secret wish or intention would you set on a new moon?",
      options: ["To cultivate more self-love.", "To attract a new opportunity.", "To find more joy in the everyday.", "To heal a part of myself."],
      key: "newMoonWish"
    },
];

const adviceMap: Record<string, Record<string, string>> = {
    moonPhase: {
      "New Moon: Quiet, introspective, and full of potential.": "🌑 This is a powerful time for intention setting. Tip: Write down 1-3 intentions for the coming month. Let this be your quiet starting line.",
      "Waxing Moon: Building energy and momentum.": "🌓 Your energy is growing. Tip: Take one small, concrete step towards a goal you've set. Action is the theme now.",
      "Full Moon: Peaking energy, feeling vibrant and expressive.": "🌕 Your emotions and energy are at their peak. Tip: Acknowledge and celebrate one thing you've accomplished recently, no matter how small. It's a time for gratitude.",
      "Waning Moon: Releasing, letting go, and winding down.": "🌗 It's time to release and reflect. Tip: Write down something you want to let go of on a small piece of paper, and then safely tear it up or burn it.",
    },
    intuitionFeeling: {
        "A quiet 'knowing' deep in my gut.": "🧘‍♀️ You have a strong connection to your inner wisdom. Tip: When you have this feeling, place a hand on your belly, take a deep breath, and trust what you're feeling without needing to over-analyze it.",
        "A sudden, clear idea that pops into my head.": "💡 Your intuition is like a flash of insight. Tip: Keep a small notebook or a notes app handy to capture these ideas the moment they arrive, before they fade.",
        "A physical sensation, like goosebumps.": "🥶 Your body is your compass. Tip: When you get a physical sign like this, pause and notice your surroundings and thoughts. What is your body trying to tell you?",
        "A recurring dream or symbol.": "🌌 Your subconscious is communicating. Tip: Start a dream journal. Write down any recurring themes or symbols and simply notice them without needing to interpret them right away.",
    },
    intuitiveGuidance: {
        "My relationships with others.": "💞 You seek intuitive connection. Tip: Before your next conversation with someone important, take a moment to ask yourself, 'What does this person need to feel heard?'",
        "My creative or work projects.": "🎨 You need a creative or strategic breakthrough. Tip: Ask your intuition a question before you go to sleep (e.g., 'What's the next step?'). See what ideas are present when you wake.",
        "My physical health and well-being.": "🍎 You want to tune into your body's needs. Tip: Before your next meal, pause and ask your body, 'What would truly nourish you right now?' Listen for the answer beyond cravings.",
        "My spiritual or emotional path.": "🛤️ You are navigating your inner landscape. Tip: Pull a tarot or oracle card for the day (or simply choose a word from a book at random) and reflect on its meaning for you.",
    },
    letGo: {
        "A fear that is holding me back.": "🦋 You are ready for courage. Tip: Acknowledge the fear. Then, ask yourself, 'What is one tiny, safe step I could take despite this fear?'",
        "A past hurt or grudge.": "🕊️ You are choosing peace. Tip: Practice a loving-kindness meditation, extending well wishes first to yourself, then to a loved one, and finally (if you can) to the person associated with the hurt.",
        "The need for everything to be perfect.": "✨ You are embracing 'good enough.' Tip: Intentionally do one small thing imperfectly today and notice that everything is still okay.",
        "An expectation I've placed on myself.": "🎈 You are creating freedom. Tip: Write down the expectation. Then, write a new, more gentle and realistic expectation to replace it.",
    },
    nightSky: {
        "A sense of wonder and awe.": "🤩 You are open to the magic of the universe. Tip: Learn the name of one new star or constellation. Creating a personal connection makes the sky even more wondrous.",
        "A feeling of peace and tranquility.": "🤫 The quiet of the night soothes you. Tip: Find a safe spot to simply gaze at the moon for two minutes. Breathe deeply and let its calm light wash over you.",
        "A connection to something larger than myself.": "🌌 You feel part of a grand cosmic dance. Tip: Remind yourself that the atoms in your body were forged in stars. You are literally made of stardust.",
        "A feeling of creative inspiration.": "✒️ The darkness sparks your imagination. Tip: Use the night as a prompt. Write a short poem or a few sentences about the moon, the stars, or the darkness itself.",
    },
    newMoonWish: {
        "To cultivate more self-love.": "💖 A beautiful intention. Tip: Look in the mirror, make eye contact with yourself, and say, 'I am worthy of love and kindness,' just once.",
        "To attract a new opportunity.": "🚪 You are opening doors. Tip: Clean up your email inbox or your workspace to physically and energetically make space for something new to come in.",
        "To find more joy in the everyday.": "😊 You are seeking simple pleasures. Tip: Create a 'joy list' of small things that make you happy (like the smell of coffee or a favorite song) and incorporate one of them into your day.",
        "To heal a part of myself.": "🌿 You are on a healing path. Tip: Place a hand over your heart, close your eyes, and send loving, healing energy to the part of you that needs it most.",
    }
};

export default function MoonAuraPage() {
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
        if (Object.keys(answers).length !== moonQuizQuestions.length) {
            toast({
                variant: 'destructive',
                title: "Please answer all questions.",
                description: "Your reflection is more accurate with complete answers.",
            });
            return;
        }

        const generatedAdvice = moonQuizQuestions.map(q => {
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
                        <Moon className="h-8 w-8 text-purple-400" />
                        Moon Aura
                    </h1>
                    <Button variant="ghost" onClick={() => router.push('/breathe')}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Breathing
                    </Button>
                </div>
            </header>
             <main className="flex-grow items-center justify-center p-4 md:p-6 space-y-8">
                 <div className="w-full max-w-4xl mx-auto text-center p-6 space-y-8">
                    <h2 className="text-3xl font-headline">Your Moon Aura Music</h2>
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
                             <div className={cn("absolute inset-0 bg-purple-400 rounded-full opacity-50 blur-xl", isBreathing && 'animate-breath-aura')} />
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
                        <p className="flex items-center gap-2"><span className="font-bold text-purple-400">5</span><Eye className="inline-block h-5 w-5"/> Acknowledge five things you see around you.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-purple-400">4</span><Hand className="inline-block h-5 w-5"/> Acknowledge four things you can touch around you.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-purple-400">3</span><Ear className="inline-block h-5 w-5"/> Acknowledge three things you can hear.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-purple-400">2</span><Rss className="inline-block h-5 w-5"/> Acknowledge two things you can smell.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-purple-400">1</span><Wind className="inline-block h-5 w-5"/> Acknowledge one thing you can taste.</p>
                    </CardContent>
                </Card>

                 <Card className="w-full max-w-4xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-purple-400" /> Reflect on Your Inner Moon</CardTitle>
                         <CardDescription>Answer these questions to connect with your intuition.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                         {!quizStarted ? (
                            <div className="text-center">
                                <Button onClick={() => setQuizStarted(true)}>Start Reflection</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {moonQuizQuestions.map((q, index) => (
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
                                     <Alert className="mt-4 border-purple-300 bg-purple-50 dark:bg-purple-900/20">
                                        <Lightbulb className="h-4 w-4 text-purple-500" />
                                        <AlertTitle className="text-purple-700 dark:text-purple-300">Your Moon Reflection</AlertTitle>
                                        <AlertDescription className="text-purple-600 dark:text-purple-200 whitespace-pre-wrap">
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
