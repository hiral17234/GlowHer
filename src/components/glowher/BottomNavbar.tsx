
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, ListTodo, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

const translations = {
    en: {
        home: "Home",
        reminders: "Reminders",
        profile: "Profile",
        settings: "Settings",
    },
    hi: {
        home: "होम",
        reminders: "रिमाइंडर",
        profile: "प्रोफ़ाइल",
        settings: "सेटिंग्स",
    }
}

export function BottomNavbar() {
    const pathname = usePathname();
    const { language } = useLanguage();
    const t = translations[language];

    const navItems = [
        { href: '/', icon: Home, label: t.home },
        { href: '/reminders', icon: ListTodo, label: t.reminders },
        { href: '/settings', icon: User, label: t.profile },
        { href: '/settings', icon: Settings, label: t.settings },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
            <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href + item.label} href={item.href} className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted group">
                            <item.icon className={cn("w-6 h-6 mb-1 text-muted-foreground group-hover:text-primary", isActive && "text-primary")} />
                            <span className={cn("text-xs text-muted-foreground group-hover:text-primary", isActive && "text-primary")}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
