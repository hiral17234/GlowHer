
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';

export default function PregnancyIntroPage() {
    const router = useRouter();

    return (
        <div 
            className="relative flex flex-col min-h-screen items-center justify-center p-4 text-center text-white bg-cover bg-center"
            style={{backgroundImage: "url('https://i.pinimg.com/736x/e2/43/86/e243863fedaf6e675fd150476c75a35a.jpg')"}}
        >
            <div className="absolute inset-0 bg-black/40 z-0" />
            
            <header className="absolute top-0 left-0 w-full container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center">
                    <GlowHerLogo />
                    <Button variant="ghost" onClick={() => router.push('/')} className="text-white hover:bg-white/10 hover:text-white">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            <main className="relative z-10 max-w-2xl">
                <div className="bg-black/20 backdrop-blur-sm p-8 rounded-2xl">
                    <blockquote className="space-y-4">
                        <p className="font-headline text-3xl md:text-4xl leading-tight">
                            "A baby is something you carry inside you for nine months, in your arms for three years, and in your heart until the day you die."
                        </p>
                        <footer className="text-lg text-white/80">
                            – Mary Mason
                        </footer>
                    </blockquote>
                    <Button 
                        onClick={() => router.push('/pregnancy-tracker')} 
                        size="lg" 
                        className="mt-8 bg-pink-500 hover:bg-pink-600 text-white font-bold"
                    >
                        Continue to My Journey <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </main>
        </div>
    );
}
