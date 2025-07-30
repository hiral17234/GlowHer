
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Cloud, Wind, Ear, Eye, Hand, Rss, Sparkles, Lightbulb } from 'lucide-react';
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

const cloudQuizQuestions = [
    {
      question: "What does a 'clear sky' in your mind feel like?",
      options: ["Absence of worry.", "A single, focused thought.", "Openness to new ideas.", "A feeling of peace and quiet."],
      key: "clearSky"
    },
    {
      question: "Which type of cloud represents your current emotional state?",
      options: ["Light and wispy cirrus clouds.", "A dense, heavy fog.", "Big, fluffy cumulus clouds.", "A grey, overcast sky."],
      key: "cloudState"
    },
    {
      question: "What thought do you wish would just 'drift away'?",
      options: ["A nagging to-do list.", "A worry about the future.", "A memory from the past.", "A critical self-judgment."],
      key: "driftAway"
    },
    {
      question: "If you could have a moment of mental clarity, what would you use it for?",
      options: ["To make an important decision.", "To solve a complex problem.", "To simply enjoy the silence.", "To find a creative insight."],
      key: "clarityUse"
    },
    {
      question: "What 'noise' is currently cluttering your mind?",
      options: ["External pressures and expectations.", "Internal worries and 'what-ifs'.", "Too many tasks and responsibilities.", "Digital noise from screens and media."],
      key: "mindNoise"
    },
    {
      question: "Imagine your thoughts are kites. What are you doing?",
      options: ["Holding on tightly to all the strings.", "Letting one fly high while holding it steady.", "Watching them all tangle together.", "Gently letting them all go, one by one."],
      key: "thoughtKites"
    },
];

const adviceMap: Record<string, Record<string, string>> = {
    clearSky: {
      "Absence of worry.": "😌 You're seeking tranquility. Tip: Try the 'leaves on a stream' meditation. Picture each worry as a leaf, place it on a stream, and watch it float away.",
      "A single, focused thought.": "🎯 You value focus and direction. Tip: Use a single word as a mantra for 5 minutes (e.g., 'calm,' 'focus,' 'breathe') to train your mind to stay on one point.",
      "Openness to new ideas.": "💡 Your mind is fertile ground for creativity. Tip: Change your physical environment. A short walk outside can often bring a fresh perspective and new ideas.",
      "A feeling of peace and quiet.": "🧘‍♀️ You crave inner silence. Tip: Find a quiet spot and simply listen. Pay attention to the subtle sounds around you for a few minutes to ground yourself in the present.",
    },
    cloudState: {
        "Light and wispy cirrus clouds.": "🌬️ Your emotions feel light and manageable. Tip: This is a great time for creative thinking or brainstorming, as your mind isn't weighed down.",
        "A dense, heavy fog.": "🌫️ Things feel confusing and unclear. Tip: Don't try to force a decision. Focus on a single, simple, physical task, like washing dishes, to give your mind a break.",
        "Big, fluffy cumulus clouds.": "☁️ You're feeling dreamy and imaginative. Tip: Allow yourself to daydream without a goal for 10 minutes. Let your mind wander freely and see where it goes.",
        "A grey, overcast sky.": "🌧️ A heavy or melancholic mood is present. Tip: Acknowledge the feeling without judgment. Listen to a piece of music that matches your mood to feel understood.",
    },
    driftAway: {
        "A nagging to-do list.": "📝 Your mind is occupied with responsibilities. Tip: Write down the top 3 most important tasks. Getting them out of your head and onto paper can bring immediate relief.",
        "A worry about the future.": "🔮 You're caught in 'what-if' thinking. Tip: Ground yourself in the present with the 5-4-3-2-1 technique (5 things you see, 4 you feel, etc.) to pull your focus back to now.",
        "A memory from the past.": "🕰️ A past event is taking up mental space. Tip: Acknowledge the memory, thank your mind for trying to process it, and then gently shift your focus to your physical breath.",
        "A critical self-judgment.": "💬 The inner critic is loud. Tip: Counter the critical thought with a simple, compassionate phrase like, 'I am doing my best,' or, 'May I be kind to myself.'",
    },
    clarityUse: {
        "To make an important decision.": "🤔 You need focus for a specific choice. Tip: Write down the pros and cons. The physical act of organizing the information can create mental clarity.",
        "To solve a complex problem.": "🧩 You're looking for a breakthrough. Tip: Step away from the problem completely. Engage in a totally unrelated activity for 20 minutes to allow for an 'aha' moment.",
        "To simply enjoy the silence.": "🤫 You desire a moment of pure being, not doing. Tip: Set a timer for 3 minutes. Close your eyes and do nothing but breathe. No pressure, just be.",
        "To find a creative insight.": "🎨 You're searching for inspiration. Tip: Expose yourself to something new—a different genre of music, a walk down an unfamiliar street, or a short documentary on a random topic.",
    },
    mindNoise: {
        "External pressures and expectations.": "👥 The outside world feels loud. Tip: Carve out a 15-minute 'no-input' window. No phone, no music, no TV. Give your brain a chance to hear its own thoughts.",
        "Internal worries and 'what-ifs'.": "🌪️ Your mind is creating its own storm. Tip: Schedule a 10-minute 'worry time' later in the day. When a worry pops up, tell yourself you'll deal with it then. Often, it will seem smaller later.",
        "Too many tasks and responsibilities.": "📋 You're feeling overwhelmed by your duties. Tip: Pick one small, easy task and complete it. The sense of accomplishment can reduce the feeling of being overwhelmed.",
        "Digital noise from screens and media.": "📱 You're experiencing digital overload. Tip: Turn on grayscale mode on your phone for an hour. It makes the device less appealing and can help break the cycle of constant checking.",
    },
    thoughtKites: {
        "Holding on tightly to all the strings.": "✊ You're trying to control every thought. Tip: Practice noticing your thoughts without engaging. Label them ('thinking,' 'worrying') as if you were an outside observer.",
        "Letting one fly high while holding it steady.": "🪁 You have a dominant thought or focus. Tip: This is a state of concentration. Lean into it, but set a timer so you remember to give your mind a rest.",
        "Watching them all tangle together.": "🕸️ Your thoughts feel chaotic and messy. Tip: Focus on a single physical sensation, like the feeling of your feet on the floor, to untangle your mental state.",
        "Gently letting them all go, one by one.": "🦋 You are practicing non-attachment. Tip: Visualize each thought as a balloon. Acknowledge it, and then gently release the string, watching it float away.",
    }
};

export default function CloudAuraPage() {
    const router = useRouter();
    const videoId = "RxXFPTHyJsI";
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
        if (Object.keys(answers).length !== cloudQuizQuestions.length) {
            toast({
                variant: 'destructive',
                title: "Please answer all questions.",
                description: "Your reflection is more accurate with complete answers.",
            });
            return;
        }

        const generatedAdvice = cloudQuizQuestions.map(q => {
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
                        <Cloud className="h-8 w-8 text-blue-400" />
                        Cloud Aura
                    </h1>
                    <Button variant="ghost" onClick={() => router.push('/breathe')}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Breathing
                    </Button>
                </div>
            </header>
            <main className="flex-grow items-center justify-center p-4 md:p-6 space-y-8">
                <div className="w-full max-w-2xl mx-auto text-center p-6 space-y-6">
                    <h2 className="text-3xl font-headline">Your Cloud Aura Music</h2>
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

                 <Card className="w-full max-w-4xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardDescription>Listen to the music to feel relaxed.</CardDescription>
                        <CardTitle className="font-headline text-3xl flex items-center gap-2"><Wind /> Take a moment to breathe</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 text-center p-6">
                        <div className="relative h-48 w-48 flex items-center justify-center">
                             <div className={cn("absolute inset-0 bg-blue-300 rounded-full opacity-50 blur-xl", isBreathing && 'animate-breath-aura')} />
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
                        <p className="flex items-center gap-2"><span className="font-bold text-blue-400">5</span><Eye className="inline-block h-5 w-5"/> Acknowledge five things you see around you.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-blue-400">4</span><Hand className="inline-block h-5 w-5"/> Acknowledge four things you can touch around you.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-blue-400">3</span><Ear className="inline-block h-5 w-5"/> Acknowledge three things you can hear.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-blue-400">2</span><Rss className="inline-block h-5 w-5"/> Acknowledge two things you can smell.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-blue-400">1</span><Wind className="inline-block h-5 w-5"/> Acknowledge one thing you can taste.</p>
                    </CardContent>
                </Card>

                <Card className="w-full max-w-4xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-blue-400" /> Reflect on Your Mind's Sky</CardTitle>
                         <CardDescription>Answer these questions for a moment of clarity.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                         {!quizStarted ? (
                            <div className="text-center">
                                <Button onClick={() => setQuizStarted(true)}>Start Reflection</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {cloudQuizQuestions.map((q, index) => (
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
                                     <Alert className="mt-4 border-blue-300 bg-blue-50 dark:bg-blue-900/20">
                                        <Lightbulb className="h-4 w-4 text-blue-500" />
                                        <AlertTitle className="text-blue-700 dark:text-blue-300">Your Cloud Reflection</AlertTitle>
                                        <AlertDescription className="text-blue-600 dark:text-blue-200 whitespace-pre-wrap">
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
