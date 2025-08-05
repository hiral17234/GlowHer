"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PregnancyNav } from '@/components/glowher/PregnancyNav';
import { Footprints, Play, RotateCw, Timer, Siren, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KickCounterHistory } from './KickCounterHistory';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type KickCounterSession = {
    startTime: number;
    endTime: number;
    kicks: { time: number }[];
};

const KICK_COUNT_LOG_KEY = 'glowher-kick-count-log';

export default function KickCounterPage() {
    const [kickCount, setKickCount] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const [sessionLog, setSessionLog] = useState<KickCounterSession[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const savedLog = localStorage.getItem(KICK_COUNT_LOG_KEY);
            if (savedLog) {
                const parsedLog: KickCounterSession[] = JSON.parse(savedLog);
                setSessionLog(parsedLog);
            }
        } catch (e) {
            console.error("Failed to load kick count log:", e);
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isCounting) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isCounting]);

    const startSession = () => {
        setIsCounting(true);
        setKickCount(0);
        setTimer(0);
        setSessionStartTime(Date.now());
    };

    const handleKick = () => {
        if (!isCounting || kickCount >= 10) return;

        const newKickCount = kickCount + 1;
        setKickCount(newKickCount);

        if (newKickCount === 10) {
            setIsCounting(false);
            const endTime = Date.now();
            const newSession: KickCounterSession = {
                startTime: sessionStartTime!,
                endTime: endTime,
                kicks: [...Array(10)].map(() => ({ time: endTime })) // Simplified for logging
            };
            const updatedLog = [newSession, ...sessionLog];
            setSessionLog(updatedLog);
            try {
                 localStorage.setItem(KICK_COUNT_LOG_KEY, JSON.stringify(updatedLog));
            } catch(e) { console.error(e); }

            toast({
                title: "Session Complete!",
                description: `You felt 10 kicks in ${Math.floor(timer / 60)} minutes and ${timer % 60} seconds.`,
            });
        }
    };
    
    const resetSession = () => {
        setIsCounting(false);
        setKickCount(0);
        setTimer(0);
        setSessionStartTime(null);
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative flex min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
            <PregnancyNav />

            <div className="flex-1 flex flex-col">
                 <header className="container mx-auto px-4 py-4 sticky top-0 bg-white/30 backdrop-blur-md z-40 border-b border-white/30">
                    <div className="flex items-center justify-center">
                        <h1 className="font-headline text-3xl font-bold text-slate-900">
                            Kick Counter
                        </h1>
                    </div>
                </header>

                <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <Alert variant="destructive" className="bg-red-100 border-red-300">
                            <Siren className="h-4 w-4" />
                            <AlertTitle>Important</AlertTitle>
                            <AlertDescription>
                                This tool is for general awareness. If you are concerned about your baby's movements at any time, please contact your doctor or midwife immediately.
                            </AlertDescription>
                        </Alert>

                        <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30 text-center">
                            <CardHeader>
                                <CardTitle className="font-headline text-3xl text-pink-600">
                                    Count to 10
                                </CardTitle>
                                <CardDescription>
                                    Time how long it takes to feel 10 kicks, flutters, or rolls.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-white/40">
                                        <p className="text-lg font-semibold text-slate-600">Kicks</p>
                                        <p className="text-6xl font-bold text-slate-800">{kickCount}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-white/40">
                                        <p className="text-lg font-semibold text-slate-600">Timer</p>
                                        <p className="text-6xl font-mono font-bold text-slate-800">{formatTime(timer)}</p>
                                    </div>
                                </div>
                                {!isCounting && kickCount < 10 && (
                                     <Button onClick={startSession} size="lg" className="w-full h-16 text-lg bg-green-500 hover:bg-green-600 text-white">
                                        <Play className="mr-2 h-6 w-6"/> Start Session
                                    </Button>
                                )}
                                {isCounting && (
                                    <Button onClick={handleKick} size="lg" className="w-full h-16 text-lg bg-pink-500 hover:bg-pink-600 text-white">
                                        <Footprints className="mr-2 h-6 w-6"/> I Felt a Kick!
                                    </Button>
                                )}
                                {kickCount === 10 && (
                                    <div className="p-4 rounded-lg bg-green-100 text-green-800">
                                        <h3 className="font-bold text-lg flex items-center justify-center gap-2"><CheckCircle/> Session Complete!</h3>
                                        <p>Great job! Reset to start a new session.</p>
                                    </div>
                                )}
                                <Button onClick={resetSession} variant="outline" className="w-full">
                                    <RotateCw className="mr-2 h-4 w-4"/> Reset
                                </Button>
                            </CardContent>
                        </Card>
                        
                        <KickCounterHistory sessions={sessionLog} />
                    </div>
                </main>
            </div>
        </div>
    );
}
    