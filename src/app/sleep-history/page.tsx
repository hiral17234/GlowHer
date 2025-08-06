
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, isValid } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { ChevronLeft, Calendar, Bed, Star, BookText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { SleepLog } from '@/app/sleep-tracker/page';

const LOCAL_STORAGE_KEY_PREFIX = 'glowher-sleep-log-';

export default function SleepHistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(LOCAL_STORAGE_KEY_PREFIX));
      const savedLogs: SleepLog[] = keys.map(key => JSON.parse(localStorage.getItem(key)!));
      
      savedLogs.sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());

      setLogs(savedLogs);
    } catch (error) {
      console.error("Failed to read logs from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getQualityLabel = (value: number) => {
    if (value <= 2) return 'Poor';
    if (value <= 5) return 'Fair';
    if (value <= 8) return 'Good';
    return 'Excellent';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 text-foreground">
        <header className="container mx-auto px-4 py-6 z-10">
            <div className="flex justify-between items-center">
            <GlowHerLogo />
            <Button variant="ghost" onClick={() => router.push('/sleep-tracker')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Tracker
            </Button>
            </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Sleep Log History</h1>
                <p className="mt-2 text-lg text-muted-foreground">A complete record of your sleep patterns.</p>
              </div>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">You haven't logged any sleep yet.</p>
                        <Button className="mt-4" onClick={() => router.push('/sleep-tracker')}>Start Logging</Button>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {logs.map((log) => {
                        const logDate = new Date(log.logDate);
                        if (!isValid(logDate)) return null;

                        return (
                        <AccordionItem key={log.logDate} value={log.logDate}>
                          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-4">
                                <Calendar className="h-5 w-5 text-primary" />
                                {format(logDate, 'EEEE, MMMM d, yyyy')}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-4 bg-muted/20 p-4 rounded-b-md">
                            <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
                                <div className="flex items-center gap-2">
                                    <Bed className="h-5 w-5 text-indigo-400" />
                                    <h4 className="font-semibold">Duration:</h4>
                                    <Badge variant="outline">{log.sleepDuration[0]} hours</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-indigo-400" />
                                    <h4 className="font-semibold">Quality:</h4>
                                    <Badge variant="outline">{getQualityLabel(log.sleepQuality[0])}</Badge>
                                </div>
                            </div>
                            
                            {log.notes && (
                                <div className="flex items-start gap-3">
                                    <BookText className="h-5 w-5 text-indigo-400 mt-1" />
                                    <div>
                                        <h4 className="font-semibold">Notes:</h4>
                                        <p className="text-muted-foreground bg-background/50 p-3 rounded-md border">{log.notes}</p>
                                    </div>
                                </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                        )
                      })}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </div>
        </main>
    </div>
  );
}
