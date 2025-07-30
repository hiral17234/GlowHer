
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchThoughtOfTheDay } from '@/app/actions';

type Stage = 'idle' | 'writing' | 'summary';

const quotes = [
    "The best way out is always through.",
    "You are enough just as you are.",
    "This, too, shall pass.",
    "Every day is a new beginning.",
    "Breathe. You're going to be okay.",
    "You are stronger than you think."
];

export default function MentalHealthCheckInPage() {
    const router = useRouter();
    const [stage, setStage] = useState<Stage>('idle');
    const [inputValue, setInputValue] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [displayedQuote, setDisplayedQuote] = useState('');
    const [fade, setFade] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/sounds/ambient-sound.mp3');
            if(audioRef.current) {
                audioRef.current.loop = true;
            }
        }
    }, []);

    useEffect(() => {
        const fetchQuote = async () => {
          const result = await fetchThoughtOfTheDay();
          if (result.success && result.thought) {
            setDisplayedQuote(result.thought);
          } else {
            setDisplayedQuote(quotes[Math.floor(Math.random() * quotes.length)]);
          }
        };

        if (stage === 'summary') {
            fetchQuote();
        }
    }, [stage]);
    
    useEffect(() => {
        if (stage === 'writing' && textAreaRef.current) {
            textAreaRef.current.focus();
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        } else {
            audioRef.current?.pause();
        }
        
        return () => {
            audioRef.current?.pause();
        }
    }, [stage]);

    const handleBegin = () => {
        setStage('writing');
        setStartTime(Date.now());
        setWordCount(0);
        setTimeElapsed(0);
        setInputValue('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setInputValue(text);

        if (fadeTimeoutRef.current) {
            clearTimeout(fadeTimeoutRef.current);
        }
        
        setFade(false); 
        
        fadeTimeoutRef.current = setTimeout(() => {
            setFade(true);
        }, 800);
    };
    
    const handleDone = () => {
        if (startTime) {
            setTimeElapsed(Math.round((Date.now() - startTime) / 1000));
        }
        setWordCount(inputValue.trim().split(/\s+/).filter(word => word.length > 0).length);
        setStage('summary');
    };

    const renderContent = () => {
        switch (stage) {
            case 'writing':
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-white/90">What's on your mind?</h2>
                        <div className="relative w-full max-w-2xl h-64">
                             <textarea
                                ref={textAreaRef}
                                value={inputValue}
                                onChange={handleInputChange}
                                className={cn(
                                    "absolute inset-0 w-full h-full bg-transparent border-none text-white text-3xl font-serif leading-relaxed p-4 focus:outline-none resize-none transition-opacity duration-1000",
                                    fade ? 'opacity-0' : 'opacity-100'
                                )}
                            />
                        </div>
                        <Button onClick={handleDone} className="mt-8 bg-white/90 text-slate-900 hover:bg-white px-8 py-6 text-lg">Done</Button>
                    </div>
                );
            case 'summary':
                return (
                    <div className="w-full max-w-2xl mx-auto text-center text-white p-6">
                        <h2 className="text-3xl font-bold mb-4">Nicely done.</h2>
                        <div className="text-lg space-y-2 mb-8 text-white/80">
                            <p>You wrote for <span className="font-bold text-white">{timeElapsed}</span> seconds.</p>
                            <p>You wrote <span className="font-bold text-white">{wordCount}</span> words.</p>
                        </div>
                        <blockquote className="text-xl italic border-l-4 border-white/50 pl-4 my-8">
                            {displayedQuote}
                        </blockquote>
                        <Button onClick={handleBegin} className="bg-white/90 text-slate-900 hover:bg-white px-8 py-6 text-lg">Do This Again</Button>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="text-center text-white p-6">
                        <h1 className="text-4xl md:text-5xl font-headline mb-4">Take a moment.</h1>
                        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl mx-auto">This is a space to clear your mind. Write whatever you feel, and watch it fade away. Nothing is saved.</p>
                        <Button onClick={handleBegin} className="bg-white/90 text-slate-900 hover:bg-white px-10 py-8 text-xl font-bold">Begin</Button>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white selection:bg-teal-300 selection:text-slate-900">
            <header className="absolute top-0 left-0 w-full container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center">
                    <GlowHerLogo className="[&>span]:text-white" />
                    <Button variant="ghost" onClick={() => router.push('/')} className="text-white hover:text-white hover:bg-white/10">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center">
                {renderContent()}
            </main>
        </div>
    );
}
