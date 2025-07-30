
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Droplet, Wind, Ear, Eye, Hand, Rss } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const videos = ["77ZozI0rw7w", "IvjMgVS6kng", "Unbi1YfQfBU", "RoRyvU4KZyQ"];
const breathingCycle = [
  { text: 'Inhale...', duration: 4000 },
  { text: 'Hold...', duration: 4000 },
  { text: 'Exhale...', duration: 6000 },
];

export default function WaterAuraPage() {
    const router = useRouter();
    const [cycleText, setCycleText] = useState('Get Ready...');
    const [isBreathing, setIsBreathing] = useState(false);

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


    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Droplet className="h-8 w-8 text-cyan-500" />
                        Water Aura
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
                        <p className="flex items-center gap-2"><span className="font-bold text-cyan-500">5</span><Eye className="inline-block h-5 w-5"/> Acknowledge five things you see around you.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-cyan-500">4</span><Hand className="inline-block h-5 w-5"/> Acknowledge four things you can touch around you.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-cyan-500">3</span><Ear className="inline-block h-5 w-5"/> Acknowledge three things you can hear.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-cyan-500">2</span><Rss className="inline-block h-5 w-5"/> Acknowledge two things you can smell.</p>
                        <p className="flex items-center gap-2"><span className="font-bold text-cyan-500">1</span><Wind className="inline-block h-5 w-5"/> Acknowledge one thing you can taste.</p>
                    </CardContent>
                </Card>
                <div className="w-full max-w-5xl mx-auto text-center p-6 space-y-8">
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
            </main>
             <style jsx>{`
                @keyframes breath-aura {
                0%, 100% { transform: scale(0.9); opacity: 0.7; }
                50% { transform: scale(1.1); opacity: 0.9; }
                }
                .animate-breath-aura {
                animation: breath-aura 14s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
