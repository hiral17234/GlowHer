
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const auras = [
    { name: 'Cloud', emoji: '☁️' },
    { name: 'Fire', emoji: '🔥' },
    { name: 'Leaf', emoji: '🌿' },
    { name: 'Water', emoji: '💧' },
    { name: 'Sun', emoji: '☀️' },
    { name: 'Moon', emoji: '🌙' },
];

export default function MindDumpPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [selectedAura, setSelectedAura] = useState<string | null>(null);
    const [note, setNote] = useState("");

    const handleDump = () => {
        if (!selectedAura) {
            toast({
                variant: 'destructive',
                title: 'Please select an aura',
                description: 'Choose an aura that represents your mood to continue.',
            });
            return;
        }
        
        try {
            // Temporarily store data to be saved on the final page
            localStorage.setItem('tempGlowherNote', note);
            localStorage.setItem('tempGlowherAura', selectedAura);
        } catch (error) {
            console.error("Could not save to localStorage", error);
             toast({
                variant: 'destructive',
                title: 'Could not save entry',
                description: 'There was an issue saving your entry. Please try again.',
            });
            return;
        }
        
        toast({
            title: "Thoughts Captured!",
            description: "Now, take a moment to breathe and reset.",
        });
        router.push('/breathe');
    };

    return (
        <div 
            className="relative flex flex-col min-h-screen items-center justify-center p-4 overflow-hidden"
        >
            <video
                autoPlay
                loop
                muted
                className="absolute top-0 left-0 w-full h-full object-cover -z-20"
                src="https://videos.pexels.com/video-files/857251/857251-hd_1620_1080_25fps.mp4"
            />
             <div className="absolute top-0 left-0 w-full h-full bg-black/30 -z-10" />

            <div className="relative z-10 w-full flex flex-col items-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-shadow-lg animate-pulse">
                    ✨ Free Your Headspace ✨
                </h1>

                <div className="w-full max-w-md bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Brain className="h-8 w-8 text-purple-400" />
                            <h2 className="text-3xl font-bold text-white">MindDump</h2>
                        </div>
                        <p className="text-white/80">Write it. Dump it. Breathe.</p>
                    </div>

                    <Textarea 
                        placeholder="Write your thoughts here..."
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[150px] text-base"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />

                    <div>
                        <p className="text-center text-white/90 mb-3">Select the aura you want to feel relaxed</p>
                        <div className="flex justify-center flex-wrap gap-3">
                            {auras.map((aura) => (
                                <button
                                    key={aura.name}
                                    onClick={() => setSelectedAura(aura.name)}
                                    className={cn(
                                        "text-4xl p-3 rounded-full transition-all duration-200 transform hover:scale-110",
                                        selectedAura === aura.name ? 'bg-white/30 ring-2 ring-purple-300' : 'bg-white/10'
                                    )}
                                >
                                    {aura.emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button 
                        onClick={handleDump}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
                    >
                        Dump It
                    </Button>
                </div>
                <Button variant="link" onClick={() => router.push('/mental-health-check-in')} className="mt-4 text-white/70 hover:text-white">
                    Go Back
                </Button>
            </div>
        </div>
    );
}
