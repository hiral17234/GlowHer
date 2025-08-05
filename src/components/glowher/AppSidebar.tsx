
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Button } from '@/components/ui/button';
import {
    Home,
    Settings,
    ListTodo,
    User,
    CalendarDays,
    Droplet,
    Bed,
    BookOpen,
    Activity,
    ShoppingCart,
    Heart,
    Brain,
    PanelLeft,
    Baby
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const mainNavItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/period-tracker', icon: CalendarDays, label: 'Period Tracker' },
    { href: '/log-symptoms', icon: Heart, label: 'Log Symptoms' },
    { href: '/mood-journal', icon: BookOpen, label: 'Mood Journal' },
    { href: '/water-tracker', icon: Droplet, label: 'Water Tracker' },
    { href: '/sleep-tracker', icon: Bed, label: 'Sleep Tracker' },
    { href: '/fitness-goals', icon: Activity, label: 'Fitness Goals' },
    { href: '/grocery-list', icon: ShoppingCart, label: 'Grocery List' },
    { href: '/mental-health-check-in', icon: Brain, label: 'Mental Health' },
];

const pregnancyNavItems = [
    { href: '/pregnancy-tracker', icon: Baby, label: 'Pregnancy Tracker' },
];

const settingsNavItems = [
    { href: '/settings', icon: Settings, label: 'Settings' },
];

function NavContent() {
    const pathname = usePathname();
    const isPregnancyPath = pathname.startsWith('/pregnancy');

    return (
        <div className="flex flex-col h-full bg-background/90 text-foreground">
            <div className="p-4 flex items-center">
                <GlowHerLogo />
            </div>
            <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase">Main</p>
                {mainNavItems.map(item => (
                    <Link key={item.href} href={item.href} title={item.label}>
                         <Button
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className="w-full justify-start text-base"
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            <span>{item.label}</span>
                        </Button>
                    </Link>
                ))}
                
                <p className="px-2 pt-4 text-xs font-semibold text-muted-foreground uppercase">Pregnancy</p>
                {pregnancyNavItems.map(item => (
                    <Link key={item.href} href={item.href} title={item.label}>
                         <Button
                            variant={pathname.startsWith('/pregnancy') ? 'secondary' : 'ghost'}
                            className="w-full justify-start text-base"
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            <span>{item.label}</span>
                        </Button>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-border">
                {settingsNavItems.map(item => (
                     <Link key={item.href} href={item.href} title={item.label}>
                         <Button
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className="w-full justify-start text-base"
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            <span>{item.label}</span>
                        </Button>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export function AppSidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <>
            {/* Desktop Sidebar */}
            <nav className={cn(
                "hidden md:flex flex-col border-r bg-background min-h-screen sticky top-0 transition-all duration-300",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="p-2 mb-4 flex items-center justify-end">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <PanelLeft className="h-6 w-6" />
                    </Button>
                </div>
                 <div className="flex-grow overflow-y-auto">
                    {mainNavItems.map(item => (
                        <Link key={item.href} href={item.href} title={item.label}>
                            <Button
                                variant={usePathname() === item.href ? 'secondary' : 'ghost'}
                                className={cn("w-full justify-start text-base my-1", !isSidebarOpen && "justify-center")}
                            >
                                <item.icon className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
                                <span className={cn(!isSidebarOpen && "hidden")}>{item.label}</span>
                            </Button>
                        </Link>
                    ))}
                    <hr className="my-4"/>
                    {pregnancyNavItems.map(item => (
                         <Link key={item.href} href={item.href} title={item.label}>
                            <Button
                                variant={usePathname().startsWith('/pregnancy') ? 'secondary' : 'ghost'}
                                className={cn("w-full justify-start text-base my-1", !isSidebarOpen && "justify-center")}
                            >
                                <item.icon className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
                                <span className={cn(!isSidebarOpen && "hidden")}>{item.label}</span>
                            </Button>
                        </Link>
                    ))}
                 </div>
                 <div className="p-2 border-t">
                    {settingsNavItems.map(item => (
                        <Link key={item.href} href={item.href} title={item.label}>
                            <Button
                                variant={usePathname() === item.href ? 'secondary' : 'ghost'}
                                className={cn("w-full justify-start text-base my-1", !isSidebarOpen && "justify-center")}
                            >
                                <item.icon className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
                                <span className={cn(!isSidebarOpen && "hidden")}>{item.label}</span>
                            </Button>
                        </Link>
                    ))}
                 </div>
            </nav>

            {/* Mobile Sidebar */}
             <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-background/50 backdrop-blur-sm">
                            <PanelLeft className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 bg-background">
                       <NavContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
