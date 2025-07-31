
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, subDays, differenceInDays, isWithinInterval, startOfDay, isBefore, addDays, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { ChevronLeft, Baby, Heart, AlertTriangle, ShoppingCart, Droplet, Bed, Activity, Bell, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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


export default function RemindersPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    try {
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
            currentNotifications.push({ id: 'preg-status', icon: Baby, message: `You are ${gestationalAgeWeeks} weeks pregnant.`, color: 'text-pink-400', href: '/pregnancy-tracker', isDismissible: false });
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
                currentNotifications.push({ id: 'period-status', icon: Heart, message: `Your next period is predicted in ${daysUntil} days.`, color: 'text-red-400', href: '/period-tracker', isDismissible: false });
            }
        }
      }

      // Check for expiring groceries
      const savedInventory = localStorage.getItem('glowher-grocery-list');
      if (savedInventory) {
        const groceryList: GroceryItem[] = JSON.parse(savedInventory).map((item: any) => ({...item, expiryDate: item.expiryDate ? parseISO(item.expiryDate) : undefined, dateAdded: item.dateAdded ? parseISO(item.dateAdded) : new Date()}));
        const today = startOfDay(new Date());
        
        const dismissedExpired = JSON.parse(localStorage.getItem('glowher-dismissed-expired-items') || '[]');

        const expiredItems = groceryList.filter(item => {
            if (!item.expiryDate || item.purchased) return false;
            return isBefore(item.expiryDate, addDays(today, 1)) && !dismissedExpired.includes(item.id);
        });

        const expiringItems = groceryList.filter(item => {
            if (!item.expiryDate || item.purchased || expiredItems.some(exp => exp.id === item.id)) return false;
            const tomorrow = addDays(today, 1);
            const tenDaysFromNow = addDays(today, 10);
            return isWithinInterval(item.expiryDate, { start: tomorrow, end: tenDaysFromNow });
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

      // Check for items on shopping list
      const savedShoppingList = localStorage.getItem('glowher-shopping-list');
      if(savedShoppingList) {
          const shoppingList: ShoppingListItem[] = JSON.parse(savedShoppingList);
          if (shoppingList.length > 0) {
              const shoppingMessage = `You have ${shoppingList.length} item(s) on your shopping list.`;
              currentNotifications.push({ id: 'shopping-list', icon: ShoppingCart, message: shoppingMessage, color: 'text-blue-400', href: '/grocery-list', isDismissible: false });
          }
      }
      
      // Check sleep log for yesterday
      const sleepLog = localStorage.getItem(`glowher-sleep-log-${yesterdayKey}`);
      if (!sleepLog) {
          currentNotifications.push({ id: 'sleep-log', icon: Bed, message: "Don't forget to log last night's sleep.", color: 'text-indigo-400', href: '/sleep-tracker', isDismissible: false });
      }
      
      // Check water log for today
      const waterLog = localStorage.getItem(`glowher-water-tracker-${todayKey}`);
      if (!waterLog || JSON.parse(waterLog).entries.length === 0) {
          currentNotifications.push({ id: 'water-log', icon: Droplet, message: "Remember to log your water intake today.", color: 'text-sky-400', href: '/water-tracker', isDismissible: false });
      }
      
      // Check fitness log for today
      const fitnessLogKey = isPregnant ? `glowher-preg-fitness-log-${todayKey}` : `glowher-fitness-log-${todayKey}`;
      const fitnessLog = localStorage.getItem(fitnessLogKey);
      if (!fitnessLog) {
          currentNotifications.push({ id: 'fitness-log', icon: Activity, message: "Have you logged your fitness activity today?", color: 'text-teal-400', href: '/fitness-goals', isDismissible: false });
      }

      setNotifications(currentNotifications);

    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleDismissNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if(id.startsWith('expired-item-')){
        const itemId = id.replace('expired-item-', '');
        try {
            const dismissed = JSON.parse(localStorage.getItem('glowher-dismissed-expired-items') || '[]');
            if(!dismissed.includes(itemId)) {
                dismissed.push(itemId);
                localStorage.setItem('glowher-dismissed-expired-items', JSON.stringify(dismissed));
            }
        } catch(err){ console.error(err); }
    }
    setNotifications(currentNotifications => currentNotifications.filter(n => n.id !== id));
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-6 z-10">
        <div className="flex justify-between items-center">
          <GlowHerLogo />
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Reminders & Alerts</h1>
            <p className="mt-2 text-lg text-muted-foreground">Here are your current tasks and notifications.</p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              {loading ? (
                <p>Loading...</p>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">You're all caught up!</p>
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">No new notifications</Badge>
                </div>
              ) : (
                <ul className="space-y-4">
                  {notifications.map((note) => (
                    <li key={note.id}>
                        <Link href={note.href} className="block p-4 rounded-lg hover:bg-muted transition-colors border">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-grow">
                                    <note.icon className={`mt-1 h-5 w-5 shrink-0 ${note.color}`} />
                                    <span className="text-sm text-foreground">{note.message}</span>
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
                            </div>
                        </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
