
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Button } from '@/components/ui/button';
import { Home, FileText, CalendarCheck, BookOpen, Library, PanelLeft, Footprints, Timer, Weight, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
    { href: '/pregnancy-tracker', icon: Home, label: 'Dashboard' },
    { href: '/health-log', icon: FileText, label: 'Health Log' },
    { href: '/appointments', icon: CalendarCheck, label: 'Appointments' },
    { href: '/pregnancy-journal', icon: BookOpen, label: 'Journal' },
    { href: '/pregnancy-guide', icon: Library, label: 'Guide' },
    { href: '/kick-counter', icon: Footprints, label: 'Kick Counter' },
    { href: '/contraction-timer', icon: Timer, label: 'Contraction Timer' },
    { href: '/weight-tracker', icon: Weight, label: 'Weight Tracker' },
    { href: '/checklists', icon: ListTodo, label: 'Checklists' },
];

function NavContent() {
    const pathname = usePathname();
    return (
        <div className="flex flex-col h-full">
             <div className="p-4 flex items-center">
                <GlowHerLogo />
            </div>
            <nav className="flex-grow p-4 space-y-2">
            {navItems.map(item => (
                <Link key={item.href} href={item.href} title={item.label}>
                     <Button
                        variant={pathname === item.href ? 'secondary' : 'ghost'}
                        className="w-full justify-start text-base text-white hover:bg-white/10 hover:text-white"
                    >
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.label}</span>
                    </Button>
                </Link>
            ))}
            </nav>
        </div>
    )
}

export function PregnancyNav() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <>
            {/* Desktop Sidebar */}
            <nav className={cn(
                "hidden md:flex flex-col p-4 bg-black/10 backdrop-blur-lg border-r border-white/20 min-h-screen sticky top-0 transition-all duration-300",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="p-2 mb-4 flex items-center justify-between">
                    <div className={cn(!isSidebarOpen && "hidden")}>
                        <GlowHerLogo />
                    </div>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <PanelLeft className="h-6 w-6" />
                    </Button>
                </div>
                 {navItems.map(item => (
                    <Link key={item.href} href={item.href} title={item.label}>
                         <Button
                            variant={usePathname() === item.href ? 'secondary' : 'ghost'}
                            className={cn("w-full justify-start text-base text-white hover:bg-white/10 hover:text-white", !isSidebarOpen && "justify-center")}
                        >
                            <item.icon className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
                            <span className={cn(!isSidebarOpen && "hidden")}>{item.label}</span>
                        </Button>
                    </Link>
                ))}
            </nav>

            {/* Mobile Sidebar (replaces bottom nav) */}
             <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 text-white bg-black/20 hover:bg-black/40 hover:text-white">
                            <PanelLeft className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 bg-black/50 backdrop-blur-xl border-r-white/20 text-white">
                       <NavContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
