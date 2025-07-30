
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Brain, ChevronLeft, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const breathingCycle = [
    { text: 'Close your eyes and listen', duration: 5000 },
    { text: 'Hold...', duration: 9000 },
    { text: 'Exhale...', duration: 11000 },
];

const YOUTUBE_VIDEO_ID = '-5qhNRmMilI';

export default function BreathePage() {
    const router = useRouter();
    const [cycleText, setCycleText] = useState('Get Ready...');
    const [isBreathing, setIsBreathing] = useState(false);
    const playerRef = useRef<any>(null); // Ref to hold the YouTube player instance

    // Load the YouTube Iframe API script
    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);

        // This function creates an <iframe> (and YouTube player)
        // after the API code downloads.
        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('youtube-player', {
                height: '1',
                width: '1',
                videoId: YOUTUBE_VIDEO_ID,
                playerVars: {
                    playsinline: 1,
                    loop: 1,
                    playlist: YOUTUBE_VIDEO_ID, // Required for loop to work
                    controls: 0,
                },
            });
        };

        return () => {
            // Clean up the global function when the component unmounts
             if ((window as any).onYouTubeIframeAPIReady) {
                (window as any).onYouTubeIframeAPIReady = null;
            }
        }

    }, []);

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
    
    const stopPlaybackAndNavigate = (path: string) => {
        if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
            playerRef.current.stopVideo();
        }
        if (path === 'back') {
            router.back();
        } else {
            router.push(path);
        }
    };

    const handleGoBack = () => {
        stopPlaybackAndNavigate('back');
    };

    const handleFinish = () => {
        stopPlaybackAndNavigate('/');
    };
    
    const startBreathing = () => {
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
            playerRef.current.playVideo();
        }
        setIsBreathing(true);
    }

    return (
        <div 
            className="relative flex flex-col min-h-screen items-center justify-center p-4 overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('https://i.pinimg.com/736x/88/90/a8/8890a87eea99b61588a7e5646404dd57.jpg')" }}
            data-ai-hint="calm beach"
        >
             <Button variant="ghost" onClick={handleGoBack} className="absolute top-6 left-6 text-white hover:text-white hover:bg-white/10 z-20">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            
            {/* This div will be replaced by the YouTube iframe, positioned behind other elements */}
            <div id="youtube-player" className="absolute top-0 left-0 w-px h-px -z-10"></div>

            <div className="absolute top-0 left-0 w-full h-full bg-black/10" />

            <div className="w-full max-w-md bg-black/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 text-center text-white">
                 <div className="flex items-center justify-center gap-2">
                    <Brain className="h-8 w-8 text-pink-300" />
                    <h2 className="text-3xl font-bold text-white">MindDump</h2>
                </div>
                <p className="text-white/80">Write it. Dump it. Breathe.</p>

                <div className="relative h-48 flex items-center justify-center">
                    <div 
                        className={cn(
                            "absolute w-48 h-48 bg-blue-400 rounded-full opacity-50 blur-2xl",
                             isBreathing && "animate-breath"
                        )} 
                    />
                    <p className="text-2xl font-semibold z-10">{isBreathing ? cycleText : 'Ready to begin?'}</p>
                </div>

                {!isBreathing && (
                    <Button onClick={startBreathing} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-6 text-lg rounded-xl mt-4">
                        <Play className="mr-2 h-5 w-5"/>
                        Begin Breathing
                    </Button>
                )}

                {isBreathing && (
                    <>
                        <p className="text-green-300 font-semibold">Your thoughts have been released. ✨</p>
                        <p className="text-white/90">Breathe with the circle...</p>
                         <Button onClick={handleFinish} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-6 text-lg rounded-xl mt-4">
                            Finish
                        </Button>
                    </>
                )}
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
