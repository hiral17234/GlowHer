"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { weeklyDevelopment } from '@/lib/pregnancy-data';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PregnancyNav } from '@/components/glowher/PregnancyNav';

export default function WeekDetailPage({ params }: { params: Promise<{ week: string }> }) {
    const { week } = use(params);
    const router = useRouter();
    const [weekNumber, setWeekNumber] = useState<number | null>(null);

    useEffect(() => {
        if (week) {
            const num = parseInt(week, 10);
            if (!isNaN(num)) {
                setWeekNumber(num);
            }
        }
    }, [week]);

    if (weekNumber === null) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
        );
    }
    
    const weekData = weeklyDevelopment.find(w => w.week === weekNumber);

    if (!weekData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold">Week not found</h1>
                <Button onClick={() => router.push('/pregnancy-guide')} className="mt-4">
                    Back to Guide
                </Button>
            </div>
        );
    }
    
    const goToWeek = (wNum: number) => {
        if(wNum > 0 && wNum <= 41) {
            router.push(`/pregnancy-guide/${wNum}`);
        }
    }

    const weekTwoContent = weekData.details ? (
        <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30 mt-8">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-slate-800">{weekData.details.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {weekData.details.sections.map((section, index) => (
                    <div key={index}>
                        <h3 className="font-semibold text-xl text-slate-700">{section.heading}</h3>
                        <div className="prose max-w-none text-slate-600 mt-2 space-y-2">
                           {section.points.map((point, pIndex) => (
                               <p key={pIndex}>{point}</p>
                           ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    ) : null;

    return (
        <div className="relative flex min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
            
            <PregnancyNav />

            <div className="flex-1 flex flex-col">
                <header className="container mx-auto px-4 py-4 sticky top-0 bg-white/30 backdrop-blur-md z-40 border-b border-white/30 hidden md:block">
                    <div className="flex justify-end items-center">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" onClick={() => router.push('/pregnancy-guide')}>
                                <Home className="mr-2 h-4 w-4" />
                                Guide
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => goToWeek(weekNumber - 1)} disabled={weekNumber <= 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => goToWeek(weekNumber + 1)} disabled={weekNumber >= 41}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </header>
                <main className="flex-grow container mx-auto px-4 py-8 space-y-8 pb-24 md:pb-8">
                    <div className="flex justify-between items-center md:hidden mt-12">
                         <Button variant="ghost" size="icon" onClick={() => goToWeek(weekNumber - 1)} disabled={weekNumber <= 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => goToWeek(weekNumber + 1)} disabled={weekNumber >= 41}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <div className="relative h-64 lg:h-auto">
                                    <Image src={weekData.imageUrl} data-ai-hint={weekData.aiHint} alt={`Week ${weekData.week} development`} layout="fill" objectFit="cover" />
                                    <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                                        <h1 className="font-headline text-4xl text-white">{weekData.title}</h1>
                                        <p className="text-white/90 mt-1">{weekData.size}</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <Card className="bg-pink-100/30">
                                        <CardHeader>
                                            <CardTitle className="text-pink-800">Weekly Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-slate-700">{weekData.summary}</p>
                                        </CardContent>
                                    </Card>
                                    
                                    <Tabs defaultValue="development" className="w-full">
                                        <TabsList className="grid w-full grid-cols-4 bg-pink-100/50 text-pink-800">
                                            <TabsTrigger value="development" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">Baby</TabsTrigger>
                                            <TabsTrigger value="body" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">Body</TabsTrigger>
                                            <TabsTrigger value="symptoms" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">Symptoms</TabsTrigger>
                                            <TabsTrigger value="tips" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">Tips</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="development" className="mt-4 prose max-w-none text-slate-700 text-sm max-h-96 overflow-y-auto">
                                            <ul className="space-y-3">
                                                {weekData.development.map((item, index) => <li key={index} className="flex items-start gap-3"><span className="mt-1">{item.emoji}</span><span>{item.text}</span></li>)}
                                            </ul>
                                        </TabsContent>
                                        <TabsContent value="body" className="mt-4 prose max-w-none text-slate-700 text-sm max-h-96 overflow-y-auto">
                                            <ul className="space-y-3">
                                                {weekData.bodyChanges.map((item, index) => <li key={index} className="flex items-start gap-3"><span className="mt-1">{item.emoji}</span><span>{item.text}</span></li>)}
                                            </ul>
                                        </TabsContent>
                                        <TabsContent value="symptoms" className="mt-4 prose max-w-none text-slate-700 text-sm max-h-96 overflow-y-auto">
                                            <ul className="space-y-3">
                                                {weekData.symptoms.map((item, index) => <li key={index} className="flex items-start gap-3"><span className="mt-1">{item.emoji}</span><span>{item.text}</span></li>)}
                                            </ul>
                                        </TabsContent>
                                        <TabsContent value="tips" className="mt-4 prose max-w-none text-slate-700 text-sm max-h-96 overflow-y-auto">
                                            <ul className="space-y-3">
                                                {weekData.tips.map((item, index) => <li key={index} className="flex items-start gap-3"><span className="mt-1">{item.emoji}</span><span>{item.text}</span></li>)}
                                            </ul>
                                        </TabsContent>
                                    </Tabs>

                                </div>
                        </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30 overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-pink-800">Your Body's Journey: Week {weekData.week}</CardTitle>
                            <CardDescription>A visual look at how your body might be changing this week.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-center">
                            <Image src={weekData.motherImageUrl} alt={`Illustration of mother's body at week ${weekData.week}`} width={600} height={600} className="object-contain w-full h-auto max-w-sm" />
                        </CardContent>
                    </Card>
                    
                    {weekTwoContent}

                </main>
            </div>
        </div>
    );
}
