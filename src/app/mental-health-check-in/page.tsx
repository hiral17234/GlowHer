
"use client";

import { useRouter } from 'next/navigation';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function MentalHealthCheckInPage() {
    const router = useRouter();

    const handleBegin = () => {
        router.push('/mind-dump');
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
                 <div className="text-center text-white p-6">
                    <h1 className="text-4xl md:text-5xl font-headline mb-4">Take a moment.</h1>
                    <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl mx-auto">This is a space to clear your mind. Write whatever you feel, and watch it fade away. Nothing is saved.</p>
                    <Button onClick={handleBegin} className="bg-white/90 text-slate-900 hover:bg-white px-10 py-8 text-xl font-bold">Begin</Button>
                </div>
            </main>
        </div>
    );
}
