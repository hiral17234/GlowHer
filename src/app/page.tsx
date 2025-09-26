
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WellnessDashboard } from "@/components/glowher/WellnessDashboard";
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { LoaderCircle, AlertTriangle, ShoppingCart, Bell, Droplet, Bed, Activity, Heart, Baby, Check, X, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDays, isBefore, isToday, startOfDay, format, subDays, differenceInDays, isWithinInterval, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type GroceryItem = {
  id: string;
  name: string;
  expiryDate?: string;
  purchased: boolean;
};

type ShoppingListItem = {
    id: string;
    name: string;
};

type Notification = {
    id: string;
    icon: React.ElementType;
    message: string;
    color: string;
    href: string;
    isDismissible: boolean;
};


export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleDismissNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setNotifications(currentNotifications => currentNotifications.filter(n => n.id !== id));
  };


  useEffect(() => {
    let isMounted = true;

    function safeJsonParse(item: string | null) {
        if (!item) return null;
        try {
            return JSON.parse(item);
        } catch (e) {
            console.error("Failed to parse JSON from localStorage", e);
            return null;
        }
    }

    const loadData = () => {
        try {
            const storedData = localStorage.getItem('glowher-user');
            if (!storedData) {
                router.replace('/welcome');
                return;
            }
            
            const parsedUserData = safeJsonParse(storedData);
            if (!parsedUserData) {
                // Handle corrupted data, maybe clear and redirect
                localStorage.removeItem('glowher-user');
                router.replace('/welcome');
                return;
            }

            if (isMounted) {
              setUserData(parsedUserData);
            }
            
            const currentNotifications: Notification[] = [];
            const todayKey = format(new Date(), 'yyyy-MM-dd');
            const yesterdayKey = format(subDays(new Date(), 1), 'yyyy-MM-dd');

            // Check for Period/Pregnancy status
            const isPregnant = localStorage.getItem('glowher-fitness-is-pregnant') === 'true';
            if (isPregnant) {
              const pregData = safeJsonParse(localStorage.getItem('glowher-pregnancy-tracker'));
              if (pregData && pregData.dueDate) {
                  const startDate = subDays(new Date(pregData.dueDate), 280);
                  const totalDays = differenceInDays(new Date(), startDate);
                  const gestationalAgeWeeks = Math.floor(totalDays / 7);
                  currentNotifications.push({ id: 'preg-status', icon: Baby, message: `You are ${gestationalAgeWeeks} weeks pregnant.`, color: 'text-pink-400', href: '/pregnancy-tracker', isDismissible: false });
              }
            } else {
              const periodData = safeJsonParse(localStorage.getItem('glowher-period-tracker'));
              if (periodData && periodData.lastPeriodDate && periodData.cycleLength) {
                  let currentCycleStartDate = startOfDay(new Date(periodData.lastPeriodDate));
                  while (addDays(currentCycleStartDate, periodData.cycleLength) <= new Date()) {
                      currentCycleStartDate = addDays(currentCycleStartDate, periodData.cycleLength);
                  }
                  const nextPeriodStart = addDays(currentCycleStartDate, periodData.cycleLength);
                  const daysUntil = differenceInDays(nextPeriodStart, new Date());
                  if(daysUntil >= 0 && daysUntil <= 7) {
                      currentNotifications.push({ id: 'period-status', icon: Heart, message: `Your next period is predicted in ${daysUntil} days.`, color: 'text-red-400', href: '/period-tracker', isDismissible: false });
                  }
              }
            }

            // Check for expiring groceries
            const savedInventory = safeJsonParse(localStorage.getItem('glowher-grocery-list'));
            if (Array.isArray(savedInventory)) {
              const groceryList: GroceryItem[] = savedInventory;
              const today = startOfDay(new Date());

              const expiredItems = groceryList.filter(item => {
                  if (!item.expiryDate || item.purchased) return false;
                  try { return isBefore(parseISO(item.expiryDate), addDays(today, 1)); } catch (e) { return false; }
              });

              const expiringItems = groceryList.filter(item => {
                  if (!item.expiryDate || item.purchased || expiredItems.some(exp => exp.id === item.id)) return false;
                  try {
                      const tomorrow = addDays(today, 1);
                      const tenDaysFromNow = addDays(today, 10);
                      return isWithinInterval(parseISO(item.expiryDate), { start: tomorrow, end: tenDaysFromNow });
                  } catch(e) { return false; }
              });
              
              if (expiredItems.length > 0) {
                  expiredItems.forEach(item => {
                      const expiredMessage = `Oops! Your item "${item.name}" has expired.`;
                      currentNotifications.push({ id: `expired-item-${item.id}`, icon: AlertTriangle, message: expiredMessage, color: 'text-destructive', href: '/grocery-list', isDismissible: true });
                  });
              }

              if (expiringItems.length > 0) {
                  const expiringMessage = `Expiring soon: ${expiringItems.map(i => i.name).join(', ')}.`;
                  currentNotifications.push({ id: 'expiring-items', icon: AlertTriangle, message: expiringMessage, color: 'text-yellow-500', href: '/grocery-list', isDismissible: false });
              }
            }

            // Other checks
            const savedShoppingList = safeJsonParse(localStorage.getItem('glowher-shopping-list'));
            if(Array.isArray(savedShoppingList) && savedShoppingList.length > 0) {
                currentNotifications.push({ id: 'shopping-list', icon: ShoppingCart, message: `You have ${savedShoppingList.length} item(s) on your shopping list.`, color: 'text-blue-400', href: '/grocery-list', isDismissible: false });
            }
            
            if (!localStorage.getItem(`glowher-sleep-log-${yesterdayKey}`)) {
                currentNotifications.push({ id: 'sleep-log', icon: Bed, message: "Don't forget to log last night's sleep.", color: 'text-indigo-400', href: '/sleep-tracker', isDismissible: false });
            }
            
            const waterLog = safeJsonParse(localStorage.getItem(`glowher-water-tracker-${todayKey}`));
            if (!waterLog || waterLog.entries.length === 0) {
                currentNotifications.push({ id: 'water-log', icon: Droplet, message: "Remember to log your water intake today.", color: 'text-sky-400', href: '/water-tracker', isDismissible: false });
            }
            
            const fitnessLogKey = isPregnant ? `glowher-preg-fitness-log-${todayKey}` : `glowher-fitness-log-${todayKey}`;
            if (!localStorage.getItem(fitnessLogKey)) {
                currentNotifications.push({ id: 'fitness-log', icon: Activity, message: "Have you logged your fitness activity today?", color: 'text-teal-400', href: '/fitness-goals', isDismissible: false });
            }

            if (isMounted) {
              setNotifications(currentNotifications);
            }

        } catch (error) {
            console.error("Error during initial data load:", error);
            // In case of any error, redirect to a safe page
            router.replace('/welcome');
        } finally {
            if (isMounted) {
              setLoading(false);
            }
        }
    };

    loadData();

    return () => {
        isMounted = false;
    };
  }, [router]);

  if (loading || !userData) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Your Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="container mx-auto px-4 py-6 z-10">
        <div className="flex justify-between items-center">
            <GlowHerLogo />
             <div className="flex items-center gap-2">
                <Link href="/ai-assistant">
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary">
                        <Stethoscope className="h-7 w-7" />
                    </Button>
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 text-yellow-400 hover:text-yellow-500 hover:bg-yellow-400/10 relative">
                            <Bell className="h-6 w-6" />
                            {notifications.length > 0 && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">{notifications.length}</Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.length > 0 ? (
                            notifications.map((note) => (
                                <DropdownMenuItem key={note.id} onSelect={(e) => { e.preventDefault(); router.push(note.href); }} className="text-sm text-wrap flex items-start justify-between gap-2 cursor-pointer pr-2">
                                <div className="flex items-start gap-2 flex-grow" onClick={() => router.push(note.href)}>
                                    <note.icon className={`mt-1 h-4 w-4 shrink-0 ${note.color}`} />
                                    <span>{note.message}</span>
                                </div>
                                {note.isDismissible && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0"
                                        onClick={(e) => handleDismissNotification(e, note.id)}
                                    >
                                        <X className="h-4 w-4 text-muted-foreground"/>
                                    </Button>
                                )}
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </header>
      <main className="flex-grow">
        <section className="relative container mx-auto text-center py-16 md:py-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-card/50 via-background to-background blur-3xl" />
          <h1 className="font-headline text-4xl md:text-6xl font-bold max-w-3xl mx-auto">
            Welcome back, {userData.name}!
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Your calm, your cycle, your mood. Track your wellness with ease and peace of mind.
          </p>
        </section>

        <WellnessDashboard />
      </main>
    </div>
  );
}
