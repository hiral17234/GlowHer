
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Leaf, Wind, Ear, Eye, Hand, Rss, Sparkles, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const videos = ["Nmmsl2X_--U", "FMrtSHAAPhM"];
const breathingCycle = [
  { text: 'Inhale...', duration: 4000 },
  { text: 'Hold...', duration: 4000 },
  { text: 'Exhale...', duration: 6000 },
];

const leafQuizQuestions = [
    {
      question: "Which aspect of a tree resonates with you most right now?",
      options: ["The deep, unseen roots.", "The strong, steady trunk.", "The flexible, waving branches.", "The new, budding leaves."],
      key: "treeResonance"
    },
    {
      question: "What kind of 'growth' are you currently focused on?",
      options: ["Personal or emotional growth.", "Professional or skill-based growth.", "Growth in my relationships.", "Spiritual growth or understanding."],
      key: "growthFocus"
    },
    {
      question: "If you were to plant a seed today, what would you want it to grow into?",
      options: ["A new healthy habit.", "A creative project.", "A stronger friendship.", "A sense of inner peace."],
      key: "plantSeed"
    },
    {
      question: "What 'season' does your life feel like right now?",
      options: ["Spring: Full of new beginnings and potential.", "Summer: Vibrant, busy, and full of activity.", "Autumn: A time of harvest and letting go.", "Winter: A quiet period of rest and reflection."],
      key: "lifeSeason"
    },
    {
      question: "What needs 'pruning' in your life to make room for new growth?",
      options: ["A commitment that no longer serves me.", "A negative thought pattern.", "A physical clutter in my space.", "A draining relationship."],
      key: "pruningNeeds"
    },
    {
      question: "How do you connect with nature to feel grounded?",
      options: ["By walking barefoot on the grass.", "By listening to the sound of birds or wind.", "By tending to plants or a garden.", "By simply looking at a beautiful view."],
      key: "natureConnection"
    },
];

const adviceMap: Record<string, Record<string, string>> = {
    treeResonance: {
      "The deep, unseen roots.": "🌳 You are focused on your foundation and stability. Tip: Spend some time journaling about your core values. What truly grounds you and keeps you steady?",
      "The strong, steady trunk.": "💪 You value strength, resilience, and your core self. Tip: Acknowledge one way you have been strong recently. Stand tall and take a few deep, powerful breaths.",
      "The flexible, waving branches.": "🌬️ You are embracing adaptability and reaching out. Tip: Try something slightly out of your comfort zone today, even if it's just trying a new food or listening to new music.",
      "The new, budding leaves.": "🌱 You are in a phase of new beginnings and fresh potential. Tip: Write down one new thing you'd like to learn or start this month, no matter how small.",
    },
    growthFocus: {
        "Personal or emotional growth.": "💖 You are on a journey of self-discovery. Tip: Ask yourself, 'What is one thing I can do to be kinder to myself today?' and then do it.",
        "Professional or skill-based growth.": "📈 You are building your capabilities. Tip: Dedicate 20 minutes to learning a new micro-skill related to your goals. Small steps build expertise.",
        "Growth in my relationships.": "🤝 You are nurturing your connections. Tip: Send a message to a friend you haven't spoken to recently, just to let them know you're thinking of them.",
        "Spiritual growth or understanding.": "🌌 You are exploring deeper questions. Tip: Spend a few minutes in quiet contemplation, either meditating or simply sitting in silence, and see what insights arise.",
    },
    plantSeed: {
        "A new healthy habit.": "🍎 You are cultivating well-being. Tip: Start with the smallest possible step. If you want to exercise more, just put on your workout clothes. That's it. Celebrate that first step.",
        "A creative project.": "🎨 You are ready to bring an idea to life. Tip: Create a 'mood board' for your project, either digitally or physically. Gather images, colors, and words that inspire you.",
        "A stronger friendship.": "☕ You are investing in your community. Tip: Suggest a specific, low-pressure activity with a friend, like a walk in the park or a coffee date.",
        "A sense of inner peace.": "🕊️ You are seeking serenity. Tip: Find a comfortable spot and listen to a 5-minute guided meditation for peace. Let it be your gift to yourself.",
    },
    lifeSeason: {
        "Spring: Full of new beginnings and potential.": "🌸 Embrace this energy! Tip: This is the perfect time to brainstorm and dream without limits. Don't worry about the 'how' just yet, just explore the 'what if'.",
        "Summer: Vibrant, busy, and full of activity.": "☀️ Your life is full. Tip: Make sure to schedule small pockets of rest amidst the business. Even 5 minutes of quiet can help you recharge.",
        "Autumn: A time of harvest and letting go.": "🍂 Acknowledge your accomplishments and release what's no longer needed. Tip: Write down one thing you're proud of from the past year, and one thing you're ready to let go of.",
        "Winter: A quiet period of rest and reflection.": "❄️ This is a vital time for restoration. Tip: Give yourself permission to say 'no' to a social invitation and enjoy a quiet evening at home without guilt.",
    },
    pruningNeeds: {
        "A commitment that no longer serves me.": "✂️ Releasing obligations can be freeing. Tip: Can you delegate, reduce, or eliminate one small task on your plate this week to create more breathing room?",
        "A negative thought pattern.": "🧠 You are ready to rewire your thinking. Tip: When the thought appears, gently say to yourself, 'This is just a thought, not a fact,' to create some distance.",
        "A physical clutter in my space.": "📦 A clear space can lead to a clear mind. Tip: Set a timer for 10 minutes and declutter one small area—a single drawer, a shelf, or your desktop.",
        "A draining relationship.": "💧 Protecting your energy is essential. Tip: Create a boundary by deciding to limit your next interaction with this person to a specific, short amount of time.",
    },
    natureConnection: {
        "By walking barefoot on the grass.": "👣 You seek a direct, physical connection to the earth. Tip: This practice is called 'earthing.' Try it for just five minutes and notice how your body feels afterward.",
        "By listening to the sound of birds or wind.": "🎶 You are attuned to the soundtrack of nature. Tip: Find a recording of nature sounds (like a forest or ocean) and play it while you work or relax.",
        "By tending to plants or a garden.": "🌿 You find joy in nurturing life. Tip: Take a moment to truly look at one of your plants. Notice its colors, textures, and the details of its leaves.",
        "By simply looking at a beautiful view.": "🏞️ You are nourished by visual beauty. Tip: Find a beautiful nature photo online or in a book and let your eyes rest on it for a full minute, taking in all the details.",
    }
};

export default function LeafAuraPage() {
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
        if (Object.keys(answers).length !== leafQuizQuestions.length) {
            toast({
                variant: 'destructive',
                title: "Please answer all questions.",
                description: "Your reflection is more accurate with complete answers.",
            });
            return;
        }

        const generatedAdvice = leafQuizQuestions.map(q => {
            const answer = answers[q.key];
            return adviceMap[q.key]?.[answer] || '';
        }).filter(Boolean).join('\n\n');
        
        setAdvice(generatedAdvice);
    };


    return (
        <div className="relative flex flex-col min-h-screen bg-cover bg-center text-white" style={{backgroundImage: "url('https://i.pinimg.com/736x/e0/c9/2c/e0c92c4df182ab414a85859de1bfc6a9.jpg')"}}>
            <div className="absolute inset-0 bg-black/60 z-0"/>
            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="container mx-auto px-4 py-6 z-10">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Leaf className="h-8 w-8 text-green-400" />
                            Leaf Aura (Nature)
                        </h1>
                        <Button variant="ghost" onClick={() => router.push('/breathe')} className="text-white hover:bg-white/10 hover:text-white">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Breathing
                        </Button>
                    </div>
                </header>
                <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 space-y-8">
                    <div className="w-full max-w-4xl mx-auto text-center p-6 space-y-6 bg-black/20 backdrop-blur-sm rounded-xl">
                        <h2 className="text-3xl font-headline">Your Leaf Aura Music</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                    <Card className="w-full max-w-4xl mx-auto shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
                        <CardHeader>
                            <CardDescription className="text-slate-300">Listen to the music to feel relaxed.</CardDescription>
                            <CardTitle className="font-headline text-3xl flex items-center gap-2"><Wind /> Take a moment to breathe</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 text-center p-6">
                            <div className="relative h-48 w-48 flex items-center justify-center">
                                <div className={cn("absolute inset-0 bg-green-400 rounded-full opacity-50 blur-xl", isBreathing && 'animate-breath-aura')} />
                                <div className="z-10 flex flex-col items-center justify-center">
                                    <p className="text-xl font-semibold mb-2">{isBreathing ? cycleText : 'Ready?'}</p>
                                </div>
                            </div>
                            {!isBreathing ? (
                                <Button onClick={() => setIsBreathing(true)} className="bg-green-500 hover:bg-green-600 text-white">Begin Breathing</Button>
                            ) : (
                                <div className="text-left">
                                    <p className="text-green-300 font-semibold">Breathing session started.</p>
                                    <p className="text-slate-300">Follow the prompts and sync your breath with the animation.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="w-full max-w-4xl mx-auto shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">5-4-3-2-1 Grounding</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="flex items-center gap-2"><span className="font-bold text-green-500">5</span><Eye className="inline-block h-5 w-5"/> Acknowledge five things you see around you.</p>
                            <p className="flex items-center gap-2"><span className="font-bold text-green-500">4</span><Hand className="inline-block h-5 w-5"/> Acknowledge four things you can touch around you.</p>
                            <p className="flex items-center gap-2"><span className="font-bold text-green-500">3</span><Ear className="inline-block h-5 w-5"/> Acknowledge three things you can hear.</p>
                            <p className="flex items-center gap-2"><span className="font-bold text-green-500">2</span><Rss className="inline-block h-5 w-5"/> Acknowledge two things you can smell.</p>
                            <p className="flex items-center gap-2"><span className="font-bold text-green-500">1</span><Wind className="inline-block h-5 w-5"/> Acknowledge one thing you can taste.</p>
                        </CardContent>
                    </Card>

                    <Card className="w-full max-w-4xl mx-auto shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-green-400" /> Reflect on Your Inner Nature</CardTitle>
                            <CardDescription className="text-slate-300">Answer these questions to connect with your personal growth.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {!quizStarted ? (
                                <div className="text-center">
                                    <Button onClick={() => setQuizStarted(true)} className="bg-green-500 hover:bg-green-600 text-white">Start Reflection</Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {leafQuizQuestions.map((q, index) => (
                                        <div key={q.key}>
                                            <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                                            <RadioGroup onValueChange={(value) => handleAnswerChange(q.key, value)} value={answers[q.key]}>
                                                {q.options.map(opt => (
                                                    <div key={opt} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={opt} id={`${q.key}-${opt}`} className="border-green-400 text-green-400 focus:ring-green-400" />
                                                        <Label htmlFor={`${q.key}-${opt}`}>{opt}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    ))}
                                    <Button onClick={handleGetAdvice} className="w-full bg-green-500 hover:bg-green-600 text-white">
                                        Get My Reflection
                                    </Button>
                                    {advice && (
                                        <Alert className="mt-4 border-green-400/50 bg-green-500/10 text-white">
                                            <Lightbulb className="h-4 w-4 text-green-400" />
                                            <AlertTitle className="text-green-300">Your Leaf Reflection</AlertTitle>
                                            <AlertDescription className="text-slate-200 whitespace-pre-wrap">
                                                {advice}
                                            </AlertDescription>
                                            <Button onClick={() => router.push('/aura/healing-reflection')} className="mt-4 bg-green-500 hover:bg-green-600">
                                                Next <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Alert>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </main>
            </div>
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
