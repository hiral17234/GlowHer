"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PregnancyNav } from '@/components/glowher/PregnancyNav';
import { Timer, Play, StopCircle, History, Trash2, Siren } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type Contraction = {
    startTime: number;
    endTime: number | null;
    duration: number | null;
    frequency: number | null; // in seconds
};

const CONTRACTION_LOG_KEY = 'glowher-contraction-log';

export default function ContractionTimerPage() {
    const [isTiming, setIsTiming] = useState(false);
    const [timer, setTimer] = useState(0);
    const [log, setLog] = useState<Contraction[]>([]);
    const [lastContractionEnd, setLastContractionEnd] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const savedLog = localStorage.getItem(CONTRACTION_LOG_KEY);
            if (savedLog) {
                const parsedLog: Contraction[] = JSON.parse(savedLog);
                setLog(parsedLog);
                if (parsedLog.length > 0 && parsedLog[0].endTime) {
                    setLastContractionEnd(parsedLog[0].endTime);
                }
            }
        } catch (e) {
            console.error("Failed to load contraction log:", e);
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTiming) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTiming]);

    const handleStart = () => {
        setIsTiming(true);
        setTimer(0);
        const newContraction: Contraction = {
            startTime: Date.now(),
            endTime: null,
            duration: null,
            frequency: lastContractionEnd ? (Date.now() - lastContractionEnd) / 1000 : null,
        };
        setLog(prevLog => [newContraction, ...prevLog]);
    };

    const handleStop = () => {
        setIsTiming(false);
        setLastContractionEnd(Date.now());
        const updatedLog = log.map((c, index) => {
            if (index === 0) {
                const endTime = Date.now();
                return { ...c, endTime, duration: (endTime - c.startTime) / 1000 };
            }
            return c;
        });
        setLog(updatedLog);
        try {
            localStorage.setItem(CONTRACTION_LOG_KEY, JSON.stringify(updatedLog));
        } catch (e) {
            console.error("Failed to save contraction log:", e);
        }

        const lastThree = updatedLog.slice(0, 3);
        if (lastThree.length === 3 && lastThree.every(c => c.duration && c.frequency)) {
            const avgDuration = lastThree.reduce((sum, c) => sum + (c.duration || 0), 0) / 3;
            const avgFrequency = lastThree.reduce((sum, c) => sum + (c.frequency || 0), 0) / 3;

            // 5-1-1 Rule
            if (avgFrequency <= 300 && avgDuration >= 60) { // Freq <= 5 mins, Dur >= 1 min
                toast({
                    variant: 'destructive',
                    title: "5-1-1 Rule Alert!",
                    description: "Your contractions are averaging 5 minutes apart and lasting 1 minute. It might be time to call your doctor or head to the hospital!",
                    duration: 10000,
                });
            }
        }
    };
    
    const formatDuration = (seconds: number | null) => {
        if (seconds === null) return '--';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}m ${sec}s`;
    };
    
    const formatFrequency = (seconds: number | null) => {
        if (seconds === null) return 'First one';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}m ${sec}s`;
    };
    
    const clearLog = () => {
        setLog([]);
        setLastContractionEnd(null);
        try {
            localStorage.removeItem(CONTRACTION_LOG_KEY);
            toast({ title: "Log Cleared", description: "Your contraction history has been deleted." });
        } catch (e) {
             console.error("Failed to clear contraction log:", e);
        }
    };

    return (
        <div className="relative flex min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
            <PregnancyNav />

            <div className="flex-1 flex flex-col">
                <header className="container mx-auto px-4 py-4 sticky top-0 bg-white/30 backdrop-blur-md z-40 border-b border-white/30">
                    <div className="flex items-center justify-center">
                        <h1 className="font-headline text-3xl font-bold text-slate-900">
                            Contraction Timer
                        </h1>
                    </div>
                </header>

                <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <Alert variant="destructive" className="bg-red-100 border-red-300">
                            <Siren className="h-4 w-4" />
                            <AlertTitle>Disclaimer</AlertTitle>
                            <AlertDescription>
                                This tool is for tracking purposes only. Always consult your healthcare provider for medical advice and guidance on when to go to the hospital.
                            </AlertDescription>
                        </Alert>

                        <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30 text-center">
                            <CardHeader>
                                <CardTitle className="font-headline text-3xl text-pink-600 flex items-center justify-center gap-2">
                                    <Timer /> {isTiming ? "Contraction in Progress" : "Ready to Time?"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-8xl font-mono font-bold text-slate-800">{formatDuration(timer)}</p>
                                {isTiming ? (
                                    <Button onClick={handleStop} size="lg" className="w-full h-16 text-lg bg-red-500 hover:bg-red-600 text-white">
                                        <StopCircle className="mr-2 h-6 w-6"/> Stop
                                    </Button>
                                ) : (
                                    <Button onClick={handleStart} size="lg" className="w-full h-16 text-lg bg-green-500 hover:bg-green-600 text-white">
                                        <Play className="mr-2 h-6 w-6"/> Start
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                                        <History /> Contraction Log
                                    </CardTitle>
                                    {log.length > 0 && (
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Clear Log
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete all contraction data.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={clearLog}>Yes, Clear Log</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {log.length > 0 ? (
                                    <div className="space-y-4">
                                        {log.map((c, index) => (
                                            <div key={c.startTime} className="p-4 rounded-lg bg-white/40 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <p className="text-sm text-slate-500">Started</p>
                                                    <p className="font-semibold text-slate-800">{format(c.startTime, 'p')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Duration</p>
                                                    <p className="font-semibold text-slate-800">{formatDuration(c.duration)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Frequency</p>
                                                    <p className="font-semibold text-slate-800">{formatFrequency(c.frequency)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-8">Your log is empty. Start the timer when your next contraction begins.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}

    