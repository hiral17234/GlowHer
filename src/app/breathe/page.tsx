
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

const breathingCycle = [
    { text: 'Close your eyes and listen', duration: 5000 },
    { text: 'Hold...', duration: 9000 },
    { text: 'Exhale...', duration: 11000 },
];

const auraSounds: { [key: string]: string } = {
    Cloud: 'https://cdn.pixabay.com/audio/2023/02/06/ocean-waves.mp3',
    Fire: 'https://cdn.pixabay.com/audio/2022/10/12/fire-crackling-loop.mp3',
    Leaf: 'https://cdn.pixabay.com/audio/2023/03/15/forest-wind-leaves.mp3',
    Water: 'https://cdn.pixabay.com/audio/2023/03/22/rain-ambience.mp3',
    Sun: 'https://cdn.pixabay.com/audio/2023/02/06/forest-birds-singing.mp3',
    Moon: 'https://cdn.pixabay.com/audio/2023/02/06/night-forest-crickets.mp3',
};


export default function BreathePage() {
    const router = useRouter();
    const [cycleText, setCycleText] = useState('Get Ready...');
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);


    useEffect(() => {
        // Get aura from local storage and set audio
        try {
            const selectedAura = localStorage.getItem('selectedAura');
            if (selectedAura && auraSounds[selectedAura]) {
                setAudioSrc(auraSounds[selectedAura]);
            }
        } catch (error) {
            console.error("Could not read from localStorage", error);
        }


        // Breathing animation logic
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

    const handleFinish = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        router.push('/');
    };

    return (
        <div 
            className="relative flex flex-col min-h-screen items-center justify-center p-4 overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('https://i.pinimg.com/736x/88/90/a8/8890a87eea99b61588a7e5646404dd57.jpg')" }}
            data-ai-hint="calm beach"
        >
             {audioSrc && (
                <audio ref={audioRef} src={audioSrc} autoPlay loop />
            )}
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
                 <Button onClick={handleFinish} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-6 text-lg rounded-xl mt-4">
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
