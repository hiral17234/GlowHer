
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function WelcomePage() {
    const router = useRouter();

    return (
        <div 
            className="relative flex flex-col min-h-screen items-center justify-center p-4 text-center text-white bg-cover bg-center"
            style={{backgroundImage: "url('https://i.pinimg.com/736x/11/6f/02/116f025002e4bf1874ef5543d8439c3b.jpg')"}}
        >
            <div className="absolute inset-0 bg-black/50 z-0" />
            
            <header className="absolute top-0 left-0 w-full container mx-auto px-4 py-6 z-10">
                <GlowHerLogo className="[&>span]:text-white" />
            </header>

            <main className="relative z-10 w-full max-w-3xl mx-auto space-y-8 bg-black/20 backdrop-blur-sm p-8 sm:p-12 rounded-2xl shadow-lg">
                <div className="flex justify-center mb-6 animate-pulse">
                    <Sparkles className="h-16 w-16 text-pink-300" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-6xl font-headline mb-4 text-shadow-lg">
                        Welcome to GlowHer
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
                        Your personal sanctuary for holistic well-being. Let's get started by setting up your profile.
                    </p>
                </div>
                <Button 
                    onClick={() => router.push('/onboarding')} 
                    size="lg" 
                    className="px-10 py-8 text-xl font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-lg transform hover:scale-105 transition-transform"
                >
                    Get Started <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
            </main>
        </div>
    );
}
