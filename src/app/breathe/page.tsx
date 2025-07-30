
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

const breathingCycle = [
    { text: 'Close your eyes and listen', duration: 5000 },
    { text: 'Hold...', duration: 9000 },
    { text: 'Exhale...', duration: 11000 },
];

export default function BreathePage() {
    const router = useRouter();
    const [cycleText, setCycleText] = useState('Get Ready...');

    useEffect(() => {
        const totalDuration = breathingCycle.reduce((sum, cycle) => sum + cycle.duration, 0);

        const cycleInterval = setInterval(() => {
            setCycleText(breathingCycle[0].text);
            setTimeout(() => setCycleText(breathingCycle[1].text), breathingCycle[0].duration);
            setTimeout(() => setCycleText(breathingCycle[2].text), breathingCycle[0].duration + breathingCycle[1].duration);
        }, totalDuration);

        // Set initial text
        setTimeout(() => setCycleText(breathingCycle[0].text), 2000);

        return () => clearInterval(cycleInterval);
    }, []);

    return (
        <div 
            className="relative flex flex-col min-h-screen items-center justify-center p-4 overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('https://i.pinimg.com/736x/88/90/a8/8890a87eea99b61588a7e5646404dd57.jpg')" }}
            data-ai-hint="calm beach"
        >
             <div className="absolute top-0 left-0 w-full h-full bg-black/10 -z-10" />

            <div className="w-full max-w-md bg-black/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 text-center text-white">
                 <div className="flex items-center justify-center gap-2">
                    <Brain className="h-8 w-8 text-pink-300" />
                    <h2 className="text-3xl font-bold text-white">MindDump</h2>
                </div>
                <p className="text-white/80">Write it. Dump it. Breathe.</p>

                <div className="relative h-48 flex items-center justify-center">
                    <div className="absolute w-48 h-48 bg-blue-400 rounded-full opacity-50 blur-2xl animate-breath" />
                    <p className="text-2xl font-semibold z-10">{cycleText}</p>
                </div>

                <p className="text-green-300 font-semibold">Your thoughts have been released. ✨</p>
                <p className="text-white/90">Breathe with the circle...</p>
                 <Button onClick={() => router.push('/')} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-6 text-lg rounded-xl mt-4">
                    Finish
                </Button>
            </div>
             <style jsx>{`
                @keyframes breath {
                    0%, 100% {
                        transform: scale(0.8);
                        opacity: 0.6;
                    }
                    30% {
                        transform: scale(1.2);
                        opacity: 0.9;
                    }
                    70% {
                        transform: scale(1.1);
                        opacity: 0.8;
                    }
                }
                .animate-breath {
                    animation: breath 25s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
