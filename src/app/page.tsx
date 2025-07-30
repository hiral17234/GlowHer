
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WellnessDashboard } from "@/components/glowher/WellnessDashboard";
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { LoaderCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDays, isBefore, isToday } from 'date-fns';

type GroceryItem = {
  id: string;
  name: string;
  expiryDate?: string;
  purchased: boolean;
};

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    try {
      // Check for user data
      const storedData = localStorage.getItem('glowher-user');
      if (!storedData) {
        router.replace('/personal-details');
        return;
      }
      
      setUserData(JSON.parse(storedData));

      // Check for expiring groceries
      const savedList = localStorage.getItem('glowher-grocery-list');
      if (savedList) {
        const groceryList: GroceryItem[] = JSON.parse(savedList).map((item: any) => ({
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

    } catch (error) {
      console.error("Error during initial load:", error);
      // If localStorage is not available or other errors occur, redirect
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
