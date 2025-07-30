
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Brain, ChevronLeft, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const breathingCycle = [
  { text: 'Close your eyes and listen', duration: 5000 },
  { text: 'Hold...', duration: 9000 },
  { text: 'Exhale...', duration: 11000 },
];

const YOUTUBE_VIDEO_ID = '-5qhNRmMilI';

export default function BreathePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cycleText, setCycleText] = useState('Get Ready...');
  const [isBreathing, setIsBreathing] = useState(false);
  const [aura, setAura] = useState('');

  useEffect(() => {
    try {
      const selectedAura = localStorage.getItem('tempGlowherAura');
      if (selectedAura) {
        setAura(selectedAura);
      }
    } catch(e) { console.error(e) }

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

  const handleGoBack = () => router.push('/mind-dump');
  
  const handleNext = () => {
      if (aura) {
          router.push(`/aura/${aura.toLowerCase()}`);
      } else {
          toast({
              variant: 'destructive',
              title: 'No aura found',
              description: 'Something went wrong. Please start the check-in again.',
          });
          router.push('/mental-health-check-in');
      }
  };

  const startBreathing = () => {
    setIsBreathing(true);
  };

  return (
    <div
      className="relative flex flex-col min-h-screen items-center justify-center p-4 overflow-hidden bg-cover bg-center"
      style={{backgroundImage: "url('https://i.pinimg.com/736x/b5/6c/d2/b56cd20bf4f1bc58d5e24cb669cf69e6.jpg')"}}
    >
      <div className="absolute inset-0 bg-black/50 z-0" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        <Button variant="ghost" onClick={handleGoBack} className="absolute top-6 left-6 text-white hover:text-white hover:bg-white/10 z-20">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="w-full max-w-md bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 text-center text-white">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-purple-300" />
            <h2 className="text-3xl font-bold text-white">MindDump</h2>
          </div>
          <p className="text-white/80">Write it. Dump it. Breathe.</p>

          <div className="relative h-56 w-56 mx-auto flex items-center justify-center">
            <div className={cn("absolute inset-0 bg-purple-400 rounded-full opacity-50 blur-2xl", isBreathing && 'animate-breath')} />
            
            <div className="z-10 flex flex-col items-center justify-center">
              <p className="text-2xl font-semibold mb-2">{isBreathing ? cycleText : 'Ready to begin?'}</p>
            </div>
          </div>

          {!isBreathing && (
            <Button onClick={startBreathing} className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-6 text-lg rounded-xl mt-4 shadow-lg">
              <Play className="mr-2 h-5 w-5" />
              Begin Breathing
            </Button>
          )}

          {isBreathing && (
            <>
              <p className="text-green-300 font-semibold">Your thoughts have been released. ✨</p>
              <p className="text-white/90">Breathe with the circle...</p>
              
              <div className="aspect-video mt-4 rounded-lg overflow-hidden">
                  <iframe 
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0`}
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen>
                  </iframe>
              </div>

              <Button onClick={handleNext} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-6 text-lg rounded-xl mt-4 shadow-lg">
                Next
              </Button>
            </>
          )}
        </div>
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
