
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Flame, Wind, Ear, Eye, Hand, Rss, Sparkles, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
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

const adviceMap: Record<string, Record<string, string>> = {
    fireFeeling: {
      "A comforting warmth, like a fireplace.": "🏡 You seek comfort and safety. Your inner fire provides a gentle, reliable source of light. Tip: Nurture this warmth by creating cozy rituals, like enjoying a warm drink ☕ or reading a book in a quiet corner.",
      "An exciting energy, like a bonfire.": "🎉 You're drawn to community and vibrant energy. Your inner fire thrives on connection and shared experiences. Tip: Organize a small gathering or join a group activity that excites you to fuel this social flame.",
      "A powerful force of creation or destruction.": "💥 You recognize the immense power within you. Your fire can transform things, create new paths, or clear away the old. Tip: Channel this power into a creative project or a decluttering session to harness its constructive force.",
      "A flickering flame of a single candle.": "🕯️ You find beauty in quiet introspection and simplicity. Your inner fire is a focused point of light in the darkness. Tip: Embrace moments of solitude. A short, five-minute meditation can help you connect with your inner candle.",
    },
    passionMeaning: {
        "A deep love for my hobbies and interests.": "🎨 Your passion is rooted in personal joy and self-expression. Tip: Dedicate a small, sacred block of time this week exclusively to a hobby that makes you feel alive, no matter how simple.",
        "A romantic connection with someone.": "💞 Your passion is currently focused on partnership and shared intimacy. Tip: Plan a special, uninterrupted moment with your partner to share appreciation and connect on a deeper level.",
        "A driving ambition towards a professional goal.": "💼 Your passion is directed towards achievement and growth in your career. Tip: Acknowledge a recent professional win, no matter how small. Celebrate the progress you've already made. 🏆",
        "A quiet, steady dedication to my values.": "🧭 Your passion is a guiding principle, a compass that informs your choices. Tip: Reflect on one decision you made this week that aligned with your core values and feel the quiet strength in that consistency.",
    },
    energyFlame: {
        "Like a slow, steady, controlled burn.": "🐢 You have sustainable, enduring energy. You are reliable and consistent. Tip: This steady flame is perfect for long-term projects. Break a large goal into small, manageable steps to make consistent progress.",
        "Like a roaring, energetic bonfire.": "🦁 Your energy is high and infectious right now! You have the power to accomplish a lot. Tip: Harness this peak energy for a task that requires a big push, but also schedule downtime to avoid burning out.",
        "Like a tiny, flickering pilot light.": "💡 Your energy reserves are low, and that's okay. It’s a time for conservation and gentleness. Tip: Protect your pilot light. Say 'no' to one non-essential request this week and use that time for rest.",
        "Like scattered, unpredictable sparks.": "✨ Your energy may feel unfocused and erratic, pulling you in many directions. Tip: Ground yourself. Spend a few minutes with your feet on the earth or practice a simple breathing exercise to gather your sparks.",
    },
    creativeSpark: {
        "A spark of inspiration for a new project.": "💡 You are ready to create something new. Tip: Feed your muse by visiting a new place, listening to different music, or simply allowing yourself to daydream for 15 minutes without a goal.",
        "A spark of connection in my relationships.": "🤝 You are seeking deeper bonds with others. Tip: Reach out to one person you care about with a simple, heartfelt message, asking them a thoughtful question about their life.",
        "A spark of joy in my daily routine.": "💖 You are looking to infuse the mundane with magic. Tip: Intentionally add one small, delightful thing to your day—wear your favorite color, buy the nice coffee, or play your favorite song loudly.",
        "A spark of confidence in myself.": "💪 You are seeking to build your inner strength and self-belief. Tip: Write down three things you like about yourself or three accomplishments you're proud of, and read them back to yourself.",
    },
    challengeFire: {
        "The fire of determination to overcome it.": "🔥 You face challenges head-on with persistence. Tip: Your determination is a great strength. Remember to also allow for moments of rest so your determination doesn't lead to burnout.",
        "The fire of creativity to find a new way.": "🎨 You see obstacles as opportunities for innovation. Tip: When you feel stuck, change your physical environment. A short walk can often spark a new perspective.",
        "The fire of patience to wait for the right moment.": "⏳ You possess the wisdom to know that not everything requires immediate action. Tip: Your patience is a superpower. Use your waiting time for reflection and gathering strength, not just for idleness.",
        "The fire of courage to ask for help.": "🫂 You know that true strength lies in vulnerability and community. Tip: Identify one person in your support system you can lean on, and don't hesitate to reach out. It strengthens both of you.",
    },
    burnAway: {
        "Self-doubt and insecurity.": "🦋 You are ready to release the inner critic. Tip: When a doubtful thought arises, gently counter it with a past success or a quality you are proud of. Act as your own best friend.",
        "Old habits that no longer serve me.": "🌱 You are prepared for positive change. Tip: Start small. Choose one old habit and replace it with a new, positive one for just one day. Celebrate that small victory.",
        "Lingering resentment or anger.": "🕊️ You are seeking peace by letting go of past hurts. Tip: Write down your feelings of resentment on a piece of paper, and then safely burn it (or tear it up) as a symbolic act of release.",
        "The pressure of external expectations.": "🎧 You are ready to live more authentically for yourself. Tip: Practice tuning into your own needs. Ask yourself, 'What do *I* want right now?' before considering others' expectations.",
    }
};


export default function FireAuraPage() {
    const router = useRouter();
    const videoId = "5gBJrZmbGLo";
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
        if (Object.keys(answers).length !== fireQuizQuestions.length) {
            toast({
                variant: 'destructive',
                title: "Please answer all questions.",
                description: "Your reflection is more accurate with complete answers.",
            });
            return;
        }

        const generatedAdvice = fireQuizQuestions.map(q => {
            const answer = answers[q.key];
            return adviceMap[q.key]?.[answer] || '';
        }).filter(Boolean).join('\n\n');
        
        setAdvice(generatedAdvice);
    };


    return (
        <div className="relative flex flex-col min-h-screen bg-cover bg-center text-white" style={{backgroundImage: "url('https://i.pinimg.com/1200x/52/79/d2/5279d2b1d028c0af35434cd92bab2555.jpg')"}}>
            <div className="absolute inset-0 bg-black/60 z-0"/>
            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="container mx-auto px-4 py-6 z-10">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Flame className="h-8 w-8 text-orange-400" />
                            Fire Aura
                        </h1>
                        <Button variant="ghost" onClick={() => router.push('/breathe')} className="text-white hover:bg-white/10 hover:text-white">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Breathing
                        </Button>
                    </div>
                </header>
                <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 space-y-8">
                    <div className="w-full max-w-2xl mx-auto text-center p-6 space-y-6 bg-black/20 backdrop-blur-sm rounded-xl">
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

                    <Card className="w-full max-w-4xl mx-auto shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
                        <CardHeader>
                            <CardDescription className="text-slate-300">Turn on the music below to feel relaxed.</CardDescription>
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
                                <Button onClick={() => setIsBreathing(true)} className="bg-orange-500 hover:bg-orange-600 text-white">Begin Breathing</Button>
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
                            <p className="flex items-center gap-2"><span className="font-bold text-orange-500">5</span><Eye className="inline-block h-5 w-5"/> Acknowledge five things you see around you.</p>
                            <p className="flex items-center gap-2"><span className="font-bold text-orange-500">4</span><Hand className="inline-block h-5 w-5"/> Acknowledge four things you can touch around you.</p>
                            <p className="flex items-center gap-2"><span className="font-bold text-orange-500">3</span><Ear className="inline-block h-5 w-5"/> Acknowledge three things you can hear.</p>
                            <p className="flex items-center gap-2"><span className="font-bold text-orange-500">2</span><Rss className="inline-block h-5 w-5"/> Acknowledge two things you can smell.</p>
                            <p className="flex items-center gap-2"><span className="font-bold text-orange-500">1</span><Wind className="inline-block h-5 w-5"/> Acknowledge one thing you can taste.</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="w-full max-w-4xl mx-auto shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-orange-400" /> Reflect on Your Inner Fire</CardTitle>
                            <CardDescription className="text-slate-300">Answer these questions to get a personalized insight.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {!quizStarted ? (
                                <div className="text-center">
                                    <Button onClick={() => setQuizStarted(true)} className="bg-orange-500 hover:bg-orange-600 text-white">Start Reflection</Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {fireQuizQuestions.map((q, index) => (
                                        <div key={q.key}>
                                            <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                                            <RadioGroup onValueChange={(value) => handleAnswerChange(q.key, value)} value={answers[q.key]}>
                                                {q.options.map(opt => (
                                                    <div key={opt} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={opt} id={`${q.key}-${opt}`} className="border-orange-400 text-orange-400 focus:ring-orange-400" />
                                                        <Label htmlFor={`${q.key}-${opt}`}>{opt}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    ))}
                                    <Button onClick={handleGetAdvice} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                                        Get My Reflection
                                    </Button>
                                    {advice && (
                                        <Alert className="mt-4 border-orange-400/50 bg-orange-500/10 text-white">
                                            <Lightbulb className="h-4 w-4 text-orange-400" />
                                            <AlertTitle className="text-orange-300">Your Fire Reflection</AlertTitle>
                                            <AlertDescription className="text-slate-200 whitespace-pre-wrap">
                                                {advice}
                                            </AlertDescription>
                                            <Button onClick={() => router.push('/aura/healing-reflection')} className="mt-4 bg-orange-500 hover:bg-orange-600">
                                                Next <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Alert>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
                <style jsx>{`
                    @keyframes breath-aura {
                        0%, 100% { transform: scale(1.1); opacity: 0.9; } /* Inhale End / Exhale Start */
                        50% { transform: scale(0.9); opacity: 0.7; } /* Inhale Mid / Exhale End */
                    }
                    .animate-breath-aura {
                        animation: breath-aura 14s ease-in-out infinite;
                    }
                `}</style>
            </div>
        </div>
    );
}
