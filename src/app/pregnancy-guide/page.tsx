
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { ChevronLeft } from 'lucide-react';
import { weeklyDevelopment } from '@/lib/pregnancy-data';

export default function PregnancyGuidePage() {
    const router = useRouter();

    return (
        <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
            <header className="container mx-auto px-4 py-6 sticky top-0 bg-white/30 backdrop-blur-md z-40 border-b border-white/30">
                <div className="flex justify-between items-center">
                    <GlowHerLogo />
                    <Button variant="ghost" onClick={() => router.push('/pregnancy-tracker')}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Tracker
                    </Button>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Pregnancy Weekly Guide</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Select a week to see detailed information about your baby's development, your body, and more.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {weeklyDevelopment.slice(1).map((week) => (
                        <Card 
                            key={week.week} 
                            className="text-center p-4 cursor-pointer shadow-lg bg-white/50 backdrop-blur-sm border-white/30 hover:bg-pink-100/50 hover:scale-105 transition-all"
                            onClick={() => router.push(`/pregnancy-guide/${week.week}`)}
                        >
                            <p className="text-sm text-slate-500">Week</p>
                            <p className="text-4xl font-bold text-pink-500">{week.week}</p>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
