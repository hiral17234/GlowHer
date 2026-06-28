
"use client";

import React, { useState, useEffect } from 'react';
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
import { ChevronLeft, History, Dumbbell, Calendar, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
const PREGNANCY_LOG_PREFIX = 'glowher-preg-fitness-log-';

type PregnancyLogData = {
  logDate: string;
  minutes: number;
  feeling?: string;
  notes?: string;
};
export default function PregnancyFitnessHistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<PregnancyLogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const pregnancyKeys = Object.keys(localStorage).filter(key => key.startsWith(PREGNANCY_LOG_PREFIX));
      
      const allLogs: PregnancyLogData[] = [];

      pregnancyKeys.forEach(key => {
        const logData = JSON.parse(localStorage.getItem(key)!);
        allLogs.push(logData);
      });
      
      // Sort logs by date, most recent first
      allLogs.sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());

      setLogs(allLogs);
    } catch (error) {
      console.error("Failed to read logs from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);


  return (
    <div className="relative flex flex-col min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://i.pinimg.com/1200x/b1/0a/fa/b10afa0b0f7754dad02c7c0e71cc9f97.jpg')"}}>
       <div className="absolute inset-0 bg-black/30 z-0"/>
       <div className="relative z-10 flex flex-col min-h-screen text-white">
          <header className="container mx-auto px-4 py-6 z-10">
            <div className="flex justify-between items-center">
              <GlowHerLogo />
              <Button variant="ghost" onClick={() => router.back()} className="text-white hover:text-white hover:bg-white/10">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </header>

          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Pregnancy Fitness History</h1>
                <p className="mt-2 text-lg text-white/80">A complete record of your pregnancy movement logs.</p>
              </div>

              <Card className="shadow-lg bg-black/20 backdrop-blur-lg border-white/20 text-white">
                <CardContent className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full bg-white/20" />
                      <Skeleton className="h-12 w-full bg-white/20" />
                      <Skeleton className="h-12 w-full bg-white/20" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-white/70 text-lg">You haven't logged any pregnancy fitness activities yet.</p>
                        <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => router.push('/pregnancy-fitness')}>Start Logging</Button>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {logs.map((log) => {
                         const logDate = new Date(log.logDate);
                         if (!isValid(logDate)) return null;

                         return (
                            <AccordionItem key={log.logDate} value={log.logDate} className="border-white/20">
                              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                <div className="flex items-center gap-4">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <span>{format(logDate, 'EEEE, MMMM d, yyyy')}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-4 space-y-4 bg-black/10 p-4 rounded-b-md">
                                <div className="flex items-start gap-3">
                                    <Dumbbell className="h-5 w-5 mt-1 text-primary" />
                                    <div>
                                        <h4 className="font-semibold">Pregnancy Movement</h4>
                                        <p>{log.minutes} minutes logged.</p>
                                        {log.feeling && <p>Felt: <Badge variant="outline" className="text-white border-white/50">{log.feeling}</Badge></p>}
                                        {log.notes && <p className="text-sm text-white/80 mt-2">Notes: {log.notes}</p>}
                                    </div>
                                </div>
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
    </div>
  );
}
