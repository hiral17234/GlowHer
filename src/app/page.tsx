
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WellnessDashboard } from "@/components/glowher/WellnessDashboard";
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { LoaderCircle, AlertTriangle, ShoppingCart, Bell, Droplet, Bed, Activity, Heart, Baby, Check, X, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDays, isBefore, isToday, startOfDay, format, subDays, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

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
};


export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleDismissNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications(currentNotifications => currentNotifications.filter(n => n.id !== id));
  };


  useEffect(() => {
    try {
      const storedData = localStorage.getItem('glowher-user');
      if (!storedData) {
        router.replace('/personal-details');
        return;
      }
      
      const parsedUserData = JSON.parse(storedData);
      setUserData(parsedUserData);
      
      const currentNotifications: Notification[] = [];
      const todayKey = format(new Date(), 'yyyy-MM-dd');
      const yesterdayKey = format(subDays(new Date(), 1), 'yyyy-MM-dd');

      // Check for Period/Pregnancy status
      const isPregnant = localStorage.getItem('glowher-fitness-is-pregnant') === 'true';
      if (isPregnant) {
        const pregData = localStorage.getItem('glowher-pregnancy-tracker');
        if (pregData) {
            const { dueDate } = JSON.parse(pregData);
            const startDate = subDays(new Date(dueDate), 280);
            const totalDays = differenceInDays(new Date(), startDate);
            const gestationalAgeWeeks = Math.floor(totalDays / 7);
            currentNotifications.push({ id: 'preg-status', icon: Baby, message: `You are ${gestationalAgeWeeks} weeks pregnant.`, color: 'text-pink-500', href: '/pregnancy-tracker' });
        }
      } else {
        const periodData = localStorage.getItem('glowher-period-tracker');
        if (periodData) {
            const data = JSON.parse(periodData);
            let currentCycleStartDate = startOfDay(new Date(data.lastPeriodDate));
            while (addDays(currentCycleStartDate, data.cycleLength) <= new Date()) {
                currentCycleStartDate = addDays(currentCycleStartDate, data.cycleLength);
            }
            const nextPeriodStart = addDays(currentCycleStartDate, data.cycleLength);
            const daysUntil = differenceInDays(nextPeriodStart, new Date());
            if(daysUntil >= 0 && daysUntil <= 7) {
                currentNotifications.push({ id: 'period-status', icon: Heart, message: `Your next period is predicted in ${daysUntil} days.`, color: 'text-red-500', href: '/period-tracker' });
            }
        }
      }

      // Check for expiring groceries
      const savedInventory = localStorage.getItem('glowher-grocery-list');
      if (savedInventory) {
        const groceryList: GroceryItem[] = JSON.parse(savedInventory).map((item: any) => ({
            ...item,
            expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString() : undefined,
        }));
        
        const expiringItems = groceryList.filter(item => {
            if (!item.expiryDate || item.purchased) return false;
            const expiryDate = new Date(item.expiryDate);
            const threeDaysFromNow = addDays(new Date(), 3);
            return isBefore(expiryDate, threeDaysFromNow) && !isBefore(expiryDate, new Date()) || isToday(expiryDate);
        });

        if (expiringItems.length > 0) {
            const expiringMessage = `Expiring soon: ${expiringItems.map(i => i.name).join(', ')}.`;
            currentNotifications.push({ id: 'expiring-items', icon: AlertTriangle, message: expiringMessage, color: 'text-destructive', href: '/grocery-list' });
            toast({
                variant: "destructive",
                title: (
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-bold">Items Expiring Soon!</span>
                    </div>
                ),
                description: `Don't forget to use these items: ${expiringItems.map(i => i.name).join(', ')}.`,
                duration: 8000,
            });
        }
      }

      // Check for items on shopping list
      const savedShoppingList = localStorage.getItem('glowher-shopping-list');
      if(savedShoppingList) {
          const shoppingList: ShoppingListItem[] = JSON.parse(savedShoppingList);
          if (shoppingList.length > 0) {
              const shoppingMessage = `You have ${shoppingList.length} item(s) on your shopping list.`;
              currentNotifications.push({ id: 'shopping-list', icon: ShoppingCart, message: shoppingMessage, color: 'text-blue-500', href: '/grocery-list' });
          }
      }
      
      // Check sleep log for yesterday
      const sleepLog = localStorage.getItem(`glowher-sleep-log-${yesterdayKey}`);
      if (!sleepLog) {
          currentNotifications.push({ id: 'sleep-log', icon: Bed, message: "Don't forget to log last night's sleep.", color: 'text-indigo-500', href: '/sleep-tracker' });
      }
      
      // Check water log for today
      const waterLog = localStorage.getItem(`glowher-water-tracker-${todayKey}`);
      if (!waterLog || JSON.parse(waterLog).entries.length === 0) {
          currentNotifications.push({ id: 'water-log', icon: Droplet, message: "Remember to log your water intake today.", color: 'text-sky-500', href: '/water-tracker' });
      }
      
      // Check fitness log for today
      const fitnessLogKey = isPregnant ? `glowher-preg-fitness-log-${todayKey}` : `glowher-fitness-log-${todayKey}`;
      const fitnessLog = localStorage.getItem(fitnessLogKey);
      if (!fitnessLog) {
          currentNotifications.push({ id: 'fitness-log', icon: Activity, message: "Have you logged your fitness activity today?", color: 'text-teal-500', href: '/fitness-goals' });
      }

      setNotifications(currentNotifications);

    } catch (error) {
      console.error("Error during initial load:", error);
      router.replace('/personal-details');
    } finally {
        setLoading(false);
    }
  }, [router, toast]);

  if (loading || !userData) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="container mx-auto px-4 py-6 z-10">
        <div className="flex justify-between items-center">
            <GlowHerLogo />
             <div className="flex items-center gap-2">
                <a href="https://chat.deepseek.com/" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-12 w-12 text-teal-500 hover:text-teal-600 hover:bg-teal-500/10">
                        <Stethoscope className="h-6 w-6" />
                    </Button>
                </a>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10 relative">
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
                                <DropdownMenuItem key={note.id} onSelect={() => router.push(note.href)} className="text-sm text-wrap flex items-start justify-between gap-2 cursor-pointer pr-2">
                                <div className="flex items-start gap-2">
                                    <note.icon className={`mt-1 h-4 w-4 shrink-0 ${note.color}`} />
                                    <span>{note.message}</span>
                                </div>
                                <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0"
                                        onClick={(e) => handleDismissNotification(e, note.id)}
                                    >
                                        <X className="h-4 w-4 text-muted-foreground"/>
                                    </Button>
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
