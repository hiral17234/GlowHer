
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { History, Brain, ChevronLeft } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';

export default function MentalHealthCheckInPage() {
    const router = useRouter();

    const handleBegin = () => {
        router.push('/mind-dump');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-sky-200 to-purple-200 text-slate-800 selection:bg-purple-500/30">
            <header className="absolute top-0 left-0 w-full container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center">
                    <GlowHerLogo />
                    <Button variant="ghost" onClick={() => router.push('/')} className="hover:bg-black/5">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center">
                 <div className="text-center p-6 space-y-8">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-white/50 rounded-full shadow-lg">
                           <Brain className="h-16 w-16 text-sky-500" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-headline mb-4">Take a moment.</h1>
                        <p className="text-lg md:text-xl text-slate-700 mb-8 max-w-xl mx-auto">This is a safe space to clear your mind. Write whatever you feel, and watch it fade away. Your entry will be saved for private reflection.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button onClick={handleBegin} size="lg" className="px-10 py-8 text-xl font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-lg">Begin</Button>
                        <Button variant="outline" onClick={() => router.push('/mental-health-history')} size="lg" className="px-8 py-6 text-lg bg-white/80 border-slate-400 hover:bg-white">
                            <History className="mr-2 h-5 w-5" />
                            View History
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
