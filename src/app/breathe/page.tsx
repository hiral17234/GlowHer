
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Brain, ChevronLeft, Play, Music } from 'lucide-react';
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
  const [playMusic, setPlayMusic] = useState(false);

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

  const handleGoBack = () => router.back();
  const handleFinish = () => router.push('/');
  const startBreathing = () => setIsBreathing(true);
  const handlePlayMusic = () => setPlayMusic(true);

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

      <div className="absolute top-0 left-0 w-full h-full bg-black/10" />

      <div className="w-full max-w-md bg-black/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 text-center text-white">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-pink-300" />
          <h2 className="text-3xl font-bold text-white">MindDump</h2>
        </div>
        <p className="text-white/80">Write it. Dump it. Breathe.</p>

        <div className="relative h-56 w-56 mx-auto flex items-center justify-center">
          {/* Blue breathing background */}
          <div className={cn("absolute inset-0 bg-blue-400 rounded-full opacity-50 blur-2xl", isBreathing && 'animate-breath')} />
          
          {isBreathing && playMusic && (
             <iframe
                className="absolute inset-0 w-full h-full rounded-full opacity-50"
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&controls=0&loop=1&playlist=${YOUTUBE_VIDEO_ID}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
          )}


          {/* Breathing text & unmute button */}
          <div className="z-10 flex flex-col items-center justify-center">
            <p className="text-2xl font-semibold mb-2">{isBreathing ? cycleText : 'Ready to begin?'}</p>

            {isBreathing && !playMusic && (
              <Button onClick={handlePlayMusic} variant="outline" className="bg-black/20 border-white/30 text-white hover:bg-black/40">
                  <Music className="mr-2 h-4 w-4" />
                  Play Music
              </Button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {!isBreathing && (
          <Button onClick={startBreathing} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-6 text-lg rounded-xl mt-4">
            <Play className="mr-2 h-5 w-5" />
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

      {/* Breathing animation */}
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
