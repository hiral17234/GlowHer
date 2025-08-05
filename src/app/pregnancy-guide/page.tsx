
"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { ChevronLeft, Home, PanelLeft, FileText, CalendarCheck, Library, BookOpen } from 'lucide-react';
import { weeklyDevelopment } from '@/lib/pregnancy-data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const navItems = [
    { href: '/pregnancy-tracker', icon: Home, label: 'Dashboard' },
    { href: '/log-symptoms', icon: FileText, label: 'Health Log' },
    { href: '/appointments', icon: CalendarCheck, label: 'Appointments' },
    { href: '/pregnancy-journal', icon: BookOpen, label: 'Journal' },
    { href: '/pregnancy-guide', icon: Library, label: 'Guide' },
];

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
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const firstTrimesterWeeks = weeklyDevelopment.filter(w => w.week >= 1 && w.week <= 13);
    const secondTrimesterWeeks = weeklyDevelopment.filter(w => w.week >= 14 && w.week <= 27);
    const thirdTrimesterWeeks = weeklyDevelopment.filter(w => w.week >= 28 && w.week <= 41);


    return (
        <div className="relative flex min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
            <nav className={cn(
                "hidden md:flex flex-col p-4 space-y-2 bg-white/50 border-r border-white/30 min-h-screen sticky top-0 transition-all duration-300",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="p-2 mb-4 flex items-center justify-between">
                    <GlowHerLogo className={cn(!isSidebarOpen && "hidden")} />
                </div>
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} title={item.label}>
                         <Button
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className={cn("w-full justify-start text-base", !isSidebarOpen && "justify-center")}
                        >
                            <item.icon className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
                            <span className={cn(!isSidebarOpen && "hidden")}>{item.label}</span>
                        </Button>
                    </Link>
                ))}
            </nav>

            <div className="flex-1 flex flex-col">
                <header className="container mx-auto px-4 py-4 sticky top-0 bg-white/30 backdrop-blur-md z-40 border-b border-white/30">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <PanelLeft className="h-6 w-6" />
                        </Button>
                        <div className="md:hidden">
                            <GlowHerLogo />
                        </div>
                        <h1 className="font-headline text-3xl font-bold text-slate-900 hidden md:block">
                            Pregnancy Guide
                        </h1>
                        <Button variant="ghost" onClick={() => router.push('/')}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Main Dashboard
                        </Button>
                    </div>
                </header>

                <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
                    <div className="text-center mb-12 md:hidden">
                        <h1 className="font-headline text-4xl md:text-5xl font-bold">Pregnancy Week by Week</h1>
                        <p className="mt-2 text-lg text-muted-foreground">Explore the amazing journey of your pregnancy, from conception to birth.</p>
                    </div>
                    
                    <Trimester title="First Trimester" weeks={firstTrimesterWeeks} />
                    <Trimester title="Second Trimester" weeks={secondTrimesterWeeks} />
                    <Trimester title="Third Trimester" weeks={thirdTrimesterWeeks} />

                </main>
            </div>

            <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white/80 backdrop-blur-md border-t border-white/30">
                <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                             <Link key={item.href} href={item.href} className="inline-flex flex-col items-center justify-center px-2 hover:bg-pink-100/50 group">
                                <item.icon className={cn("w-6 h-6 mb-1 text-slate-500 group-hover:text-pink-600", isActive && "text-pink-600")} />
                                <span className={cn("text-xs text-slate-500 group-hover:text-pink-600", isActive && "text-pink-600")}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
