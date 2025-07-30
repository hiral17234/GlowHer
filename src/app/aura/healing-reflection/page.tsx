
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, History, Check, Smile } from 'lucide-react';

const LOCAL_STORAGE_KEY_PREFIX = 'glowher-healing-reflection-log-';

export default function HealingReflectionPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [healingValue, setHealingValue] = useState([50]);
    const [note, setNote] = useState("");

    const handleFinish = () => {
        try {
            const todayKey = `${LOCAL_STORAGE_KEY_PREFIX}${format(new Date(), 'yyyy-MM-dd')}`;
            const dataToSave = {
                logDate: new Date().toISOString(),
                healingPercentage: healingValue[0],
                note: note,
            };
            localStorage.setItem(todayKey, JSON.stringify(dataToSave));
            toast({
                title: "Reflection Saved!",
                description: "Your healing journey continues. Well done.",
            });
            router.push('/');
        } catch (error) {
            console.error("Failed to save healing reflection:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not save your reflection. Please try again.",
            });
        }
    };

    const handleRetry = () => {
        router.push('/breathe');
    };

    return (
        <div className="relative flex flex-col min-h-screen items-center justify-center p-4 bg-gray-900 text-white selection:bg-teal-300 selection:text-slate-900">
             <main className="w-full max-w-lg mx-auto">
                <Card className="shadow-2xl bg-black/20 backdrop-blur-lg border-white/10">
                    <CardHeader className="text-center">
                        <div className="flex justify-center items-center mb-4">
                           <Smile className="h-12 w-12 text-teal-300" />
                        </div>
                        <CardTitle className="font-headline text-3xl text-white">How do you feel now?</CardTitle>
                        <CardDescription className="text-slate-300">Reflect on your emotional shift.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div>
                            <label htmlFor="healing-slider" className="block text-center text-lg font-semibold mb-4">
                                I feel <span className="text-teal-300 font-bold">{healingValue[0]}%</span> more at peace.
                            </label>
                            <Slider
                                id="healing-slider"
                                min={10}
                                max={90}
                                step={10}
                                value={healingValue}
                                onValueChange={setHealingValue}
                                className="[&>span>span]:bg-teal-400 [&>span]:bg-teal-400/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="healing-note" className="block text-lg font-semibold mb-2">
                                Add a private note (optional)
                            </label>
                            <Textarea
                                id="healing-note"
                                placeholder="Any final thoughts or feelings to capture?"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={handleFinish} className="flex-1 bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold">
                                <Check className="mr-2 h-4 w-4" /> Finish
                            </Button>
                            <Button onClick={handleRetry} variant="outline" className="flex-1 bg-transparent hover:bg-white/10 border-white/20 text-white">
                                <History className="mr-2 h-4 w-4" /> Retry Process
                            </Button>
                        </div>
                    </CardContent>
                </Card>
             </main>
        </div>
    );
}
