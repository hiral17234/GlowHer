
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Droplet, Wind, Ear, Eye, Hand, Rss, Sparkles, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const videos = ["77ZozI0rw7w", "IvjMgVS6kng", "Unbi1YfQfBU", "RoRyvU4KZyQ"];
const breathingCycle = [
  { text: 'Inhale...', duration: 4000 },
  { text: 'Hold...', duration: 4000 },
  { text: 'Exhale...', duration: 6000 },
];

const waterQuizQuestions = [
    {
      question: "Which form of water best represents your emotional state right now?",
      options: ["A calm, still lake.", "A gentle, flowing river.", "A powerful, crashing wave.", "A refreshing, gentle rain."],
      key: "waterForm"
    },
    {
      question: "What emotion do you need to 'wash away' or cleanse?",
      options: ["Frustration or annoyance.", "Sadness or disappointment.", "Anxiety or worry.", "Guilt or regret."],
      key: "washAway"
    },
    {
      question: "If your feelings were a river, what is its current like?",
      options: ["Blocked or stagnant.", "Flowing smoothly and clearly.", "A turbulent, rapid current.", "Meandering without a clear direction."],
      key: "riverCurrent"
    },
    {
      question: "How do you best connect with your emotions?",
      options: ["By talking them through with someone.", "By writing them down in a journal.", "By expressing them through a creative outlet.", "By sitting with them in quiet reflection."],
      key: "emotionalConnection"
    },
    {
      question: "What does emotional 'flow' mean to you?",
      options: ["Allowing feelings to come and go without judgment.", "Being deeply absorbed in a positive activity.", "Feeling a strong connection with someone.", "Expressing my emotions freely and honestly."],
      key: "emotionalFlow"
    },
    {
      question: "What small act of emotional self-care can you offer yourself today?",
      options: ["Taking a warm, relaxing bath or shower.", "Listening to a song that moves me.", "Allowing myself a good cry if I need it.", "Drinking a calming cup of herbal tea."],
      key: "selfCareAct"
    },
];

const adviceMap: Record<string, Record<string, string>> = {
    waterForm: {
      "A calm, still lake.": "🏞️ You possess a deep sense of peace. Tip: Protect this stillness. Take a few moments to simply gaze out a window, allowing your mind to be as still as the lake.",
      "A gentle, flowing river.": "💧 Your emotions are moving in a healthy way. Tip: Encourage this flow by listening to music that matches your mood, allowing the feelings to move through you.",
      "A powerful, crashing wave.": "🌊 You are experiencing intense, powerful emotions. Tip: Find a safe, physical outlet for this energy. A brisk walk, dancing, or even punching a pillow can help.",
      "A refreshing, gentle rain.": "🌦️ You are in a state of gentle release and cleansing. Tip: A warm shower can be a powerful ritual. As the water washes over you, imagine it cleansing away any emotional residue.",
    },
    washAway: {
        "Frustration or annoyance.": "😤 This energy needs to move. Tip: Scribble all your frustrations down on a piece of paper, as fast as you can. Don't edit, just get it out. Then, rip it up.",
        "Sadness or disappointment.": "😢 Your heart feels heavy. Tip: Allow yourself to feel it. Wrap yourself in a cozy blanket, listen to a sad song, and give yourself permission to be sad for a little while.",
        "Anxiety or worry.": "🌪️ Your mind is spinning. Tip: Hold a piece of ice in your hand. The intense, cold sensation can jolt your focus back to the present moment and out of the anxious loop.",
        "Guilt or regret.": "⏪ You're looking backward. Tip: Practice self-forgiveness. Place a hand on your heart and say, 'I did the best I could with what I knew at the time.'",
    },
    riverCurrent: {
        "Blocked or stagnant.": "🧱 You feel emotionally stuck. Tip: Gentle movement can help. Do a few simple stretches, focusing on your breath, to encourage emotional and physical flow.",
        "Flowing smoothly and clearly.": "➡️ You are in a state of emotional balance. Tip: Savor it! Take a 'mental snapshot' of this feeling so you can recall it during more turbulent times.",
        "A turbulent, rapid current.": "🌊 Your feelings are intense and overwhelming. Tip: Ground yourself. Place both feet flat on the floor and push down, feeling the solidness of the earth beneath you.",
        "Meandering without a clear direction.": "🗺️ You feel emotionally adrift. Tip: Give yourself a simple, sensory anchor. Focus on the taste of a cup of tea or the scent of a candle to bring yourself into the here and now.",
    },
    emotionalConnection: {
        "By talking them through with someone.": "🗣️ You process verbally. Tip: Reach out to a trusted friend. You can even start by saying, 'I need to talk something out, are you free to just listen?'",
        "By writing them down in a journal.": "✍️ You find clarity on the page. Tip: Try 'stream of consciousness' journaling for 5 minutes. Write continuously without stopping or judging what comes out.",
        "By expressing them through a creative outlet.": "🎨 You speak through art. Tip: Put on a piece of music and draw or paint the colors and shapes that match your feelings. There's no right or wrong way to do it.",
        "By sitting with them in quiet reflection.": "🧘‍♀️ You connect through introspection. Tip: Name the emotion you're feeling ('This is sadness. This is anxiety.') Naming it can lessen its power and make it feel more manageable.",
    },
    emotionalFlow: {
        "Allowing feelings to come and go without judgment.": "☁️ You seek non-attachment. Tip: Visualize your emotions as clouds passing in the sky. You are the sky—vast and unchanging—simply observing them as they float by.",
        "Being deeply absorbed in a positive activity.": "✨ You find flow in action. Tip: Identify one activity that makes you lose track of time and dedicate 30 minutes to it this week, completely uninterrupted.",
        "Feeling a strong connection with someone.": "💞 You find flow in relationships. Tip: Practice mindful connection. During your next conversation, focus all your attention on the other person, as if they are the only person in the world.",
        "Expressing my emotions freely and honestly.": "📣 You value authenticity. Tip: Practice expressing a small, low-stakes feeling to someone safe, like, 'I'm feeling a little tired today,' to build your muscle of emotional expression.",
    },
    selfCareAct: {
        "Taking a warm, relaxing bath or shower.": "🛁 A powerful cleansing ritual. Tip: Add Epsom salts or a few drops of lavender essential oil to your bath to enhance the relaxing effect.",
        "Listening to a song that moves me.": "🎵 Music is your emotional medicine. Tip: Create a playlist specifically for your current mood. Giving your feeling a soundtrack can be incredibly validating.",
        "Allowing myself a good cry if I need it.": "💧 You recognize that tears are a healthy release. Tip: If you feel tears coming, don't fight them. Find a private space, put on a sad movie if it helps, and let it out. Crying releases stress hormones.",
        "Drinking a calming cup of herbal tea.": "☕ You find comfort in simple rituals. Tip: Prepare your tea mindfully. Pay attention to the sound of the water, the scent of the herbs, and the warmth of the mug in your hands.",
    }
};

export default function WaterAuraPage() {
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
        if (Object.keys(answers).length !== waterQuizQuestions.length) {
            toast({
                variant: 'destructive',
                title: "Please answer all questions.",
                description: "Your reflection is more accurate with complete answers.",
            });
            return;
        }

        const generatedAdvice = waterQuizQuestions.map(q => {
            const answer = answers[q.key];
            return adviceMap[q.key]?.[answer] || '';
        }).filter(Boolean).join('\n\n');
        
        setAdvice(generatedAdvice);
    };

    return (
        <div className="relative flex flex-col min-h-screen bg-cover bg-center text-white" style={{backgroundImage: "url('https://i.pinimg.com/736x/04/cf/75/04cf75523824b52f487fe02bd16445d3.jpg')"}}>
             <div className="absolute inset-0 bg-black/60 z-0"/>
             <div className="relative z-10 flex flex-col min-h-screen">
                <header className="container mx-auto px-4 py-6 z-10">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Droplet className="h-8 w-8 text-cyan-400" />
                            Water Aura
                        </h1>
                        <Button variant="ghost" onClick={() => router.push('/breathe')} className="text-white hover:bg-white/10 hover:text-white">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Breathing
                        </Button>
                    </div>
                </header>
                <main className="flex-grow items-center justify-center p-4 md:p-6 space-y-8">
                    <div className="w-full max-w-5xl mx-auto text-center p-6 space-y-6 bg-black/20 backdrop-blur-sm rounded-xl">
                        <h2 className="text-3xl font-headline">Your Water Aura Music</h2>
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
                                <div className={cn("absolute inset-0 bg-cyan-400 rounded-full opacity-50 blur-xl", isBreathing && 'animate-breath-aura')} />
                                <div className="z-10 flex flex-col items-center justify-center">
                                    <p className="text-xl font-semibold mb-2">{isBreathing ? cycleText : 'Ready?'}</p>
                                </div>
                            </div>
                            {!isBreathing ? (
                                <Button onClick={() => setIsBreathing(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white">Begin Breathing</Button>
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
                            <p className="flex items-center gap-2"><span className="font-bold text-cyan-500">5</span><Eye className="inline-block h-5 w-5"/> Acknowledge five things you see around you.</p>
                            <p className="flex items-center gap-2"><span className="font-bold text-cyan-500">4</span><Hand className="inline-block h-5 w-5"/> Acknowledge four things you can touch around you.</p>
                            <p className="flex items-center gap-2"><span className="font-bold text-cyan-500">3</span><Ear className="inline-block h-5 w-5"/> Acknowledge three things you can hear.</p>
                            <p className="flex items-center gap-2"><span className="font-bold text-cyan-500">2</span><Rss className="inline-block h-5 w-5"/> Acknowledge two things you can smell.</p>
                            <p className="flex items-center gap-2"><span className="font-bold text-cyan-500">1</span><Wind className="inline-block h-5 w-5"/> Acknowledge one thing you can taste.</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="w-full max-w-4xl mx-auto shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-cyan-400" /> Reflect on Your Emotional Flow</CardTitle>
                            <CardDescription className="text-slate-300">Answer these questions to connect with your feelings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {!quizStarted ? (
                                <div className="text-center">
                                    <Button onClick={() => setQuizStarted(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white">Start Reflection</Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {waterQuizQuestions.map((q, index) => (
                                        <div key={q.key}>
                                            <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                                            <RadioGroup onValueChange={(value) => handleAnswerChange(q.key, value)} value={answers[q.key]}>
                                                {q.options.map(opt => (
                                                    <div key={opt} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={opt} id={`${q.key}-${opt}`} className="border-cyan-400 text-cyan-400 focus:ring-cyan-400" />
                                                        <Label htmlFor={`${q.key}-${opt}`}>{opt}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    ))}
                                    <Button onClick={handleGetAdvice} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                                        Get My Reflection
                                    </Button>
                                    {advice && (
                                        <Alert className="mt-4 border-cyan-400/50 bg-cyan-500/10 text-white">
                                            <Lightbulb className="h-4 w-4 text-cyan-400" />
                                            <AlertTitle className="text-cyan-300">Your Water Reflection</AlertTitle>
                                            <AlertDescription className="text-slate-200 whitespace-pre-wrap">
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
        </div>
    );
}
