
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { weeklyDevelopment } from '@/lib/pregnancy-data';
import Image from 'next/image';
import { PregnancyNav } from '@/components/glowher/PregnancyNav';

const Trimester = ({ title, weeks }: { title: string; weeks: typeof weeklyDevelopment }) => {
    const router = useRouter();
    
    return (
        <section className="mb-12">
            <h2 className="font-headline text-3xl md:text-4xl text-center text-slate-800 mb-8">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {weeks.map((week) => (
                    <Card 
                        key={week.week}
                        className="flex flex-col cursor-pointer shadow-lg bg-white/50 backdrop-blur-sm border-white/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                        onClick={() => router.push(`/pregnancy-guide/${week.week}`)}
                    >
                        <div className="relative w-full h-48 overflow-hidden">
                            <Image
                                src={week.imageUrl}
                                alt={`Illustration for week ${week.week} of pregnancy`}
                                data-ai-hint={week.aiHint}
                                layout="fill"
                                objectFit="cover"
                                className="transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <CardContent className="p-4 flex-grow flex flex-col">
                           <h3 className="font-bold text-lg text-pink-600">{week.week} weeks pregnant</h3>
                           <p className="text-sm text-slate-600 mt-2 flex-grow">{week.summary}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
};


export default function PregnancyGuidePage() {
    const firstTrimesterWeeks = weeklyDevelopment.filter(w => w.week >= 1 && w.week <= 13);
    const secondTrimesterWeeks = weeklyDevelopment.filter(w => w.week >= 14 && w.week <= 27);
    const thirdTrimesterWeeks = weeklyDevelopment.filter(w => w.week >= 28 && w.week <= 41);

    return (
        <div className="relative flex min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
            <PregnancyNav />

            <div className="flex-1 flex flex-col">
                <header className="container mx-auto px-4 py-4 sticky top-0 bg-white/30 backdrop-blur-md z-40 border-b border-white/30 hidden md:block">
                     <div className="flex items-center justify-center">
                        <h1 className="font-headline text-3xl font-bold text-slate-900">
                            Pregnancy Guide
                        </h1>
                    </div>
                </header>

                <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
                    <div className="text-center mb-12 mt-12 md:mt-0">
                        <h1 className="font-headline text-4xl md:text-5xl font-bold">Pregnancy Week by Week</h1>
                        <p className="mt-2 text-lg text-muted-foreground">Explore the amazing journey of your pregnancy, from conception to birth.</p>
                    </div>
                    
                    <Trimester title="First Trimester" weeks={firstTrimesterWeeks} />
                    <Trimester title="Second Trimester" weeks={secondTrimesterWeeks} />
                    <Trimester title="Third Trimester" weeks={thirdTrimesterWeeks} />

                </main>
            </div>
        </div>
    );
}
