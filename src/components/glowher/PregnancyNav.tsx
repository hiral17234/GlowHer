"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Button } from '@/components/ui/button';
import { Home, FileText, CalendarCheck, BookOpen, Library, PanelLeft, Footprints, Timer, Weight, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function PregnancyNav() {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <>
            {/* Desktop Sidebar */}
            <nav className={cn(
                "hidden md:flex flex-col p-4 space-y-2 bg-black/10 backdrop-blur-lg border-r border-white/20 min-h-screen sticky top-0 transition-all duration-300",
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
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className={cn("w-full justify-start text-base text-white hover:bg-white/10 hover:text-white", !isSidebarOpen && "justify-center")}
                        >
                            <item.icon className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
                            <span className={cn(!isSidebarOpen && "hidden")}>{item.label}</span>
                        </Button>
                    </Link>
                ))}
            </nav>

             {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-20 bg-black/30 backdrop-blur-md border-t border-white/20 overflow-x-auto">
                <div className="flex h-full max-w-full mx-auto font-medium">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                             <Link key={item.href} href={item.href} className="inline-flex flex-col items-center justify-center px-3 hover:bg-pink-100/10 group flex-shrink-0 w-24">
                                <item.icon className={cn("w-6 h-6 mb-1 text-white/70 group-hover:text-pink-400", isActive && "text-pink-400")} />
                                <span className={cn("text-xs text-white/70 group-hover:text-pink-400 text-center", isActive && "text-pink-400")}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </>
    );
}

    