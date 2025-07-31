
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { ChevronLeft, Calendar, Tag, Smile, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LOCAL_STORAGE_KEY_PREFIX = 'glowher-log-';

type LogData = {
  logDate: string;
  symptoms: string[];
  otherSymptom?: string;
  mood: string;
  moodIntensity?: number[];
  notes?: string;
};

export default function LogHistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(LOCAL_STORAGE_KEY_PREFIX));
      const savedLogs = keys.map(key => JSON.parse(localStorage.getItem(key)!));
      
      // Sort logs by date, most recent first
      savedLogs.sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());

      setLogs(savedLogs);
    } catch (error) {
      console.error("Failed to read logs from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://i.pinimg.com/1200x/77/f5/37/77f5373552698548522b033a838a3b35.jpg')"}}>
       <div className="absolute inset-0 bg-black/30 z-0"/>
       <div className="relative z-10 flex flex-col min-h-screen text-white">
          <header className="container mx-auto px-4 py-6 z-10">
            <div className="flex justify-between items-center">
              <GlowHerLogo />
              <Button variant="ghost" onClick={() => router.push('/log-symptoms')} className="text-white hover:text-white hover:bg-white/10">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Logging
              </Button>
            </div>
          </header>

          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Your Log History</h1>
                <p className="mt-2 text-lg text-white/80">Review your past entries and discover patterns in your wellness journey.</p>
              </div>

              <Card className="shadow-lg bg-black/20 backdrop-blur-lg border-white/20 text-white">
                <CardContent className="p-6">
                  {loading ? (
                    <p>Loading history...</p>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-white/70 text-lg">You haven't logged any symptoms or moods yet.</p>
                        <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => router.push('/log-symptoms')}>Start Logging</Button>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {logs.map((log) => (
                        <AccordionItem key={log.logDate} value={log.logDate} className="border-white/20">
                          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-4">
                                <Calendar className="h-5 w-5 text-primary" />
                                {format(new Date(log.logDate), 'EEEE, MMMM d, yyyy')}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-4 bg-black/10 p-4 rounded-b-md">
                            <div className="flex items-center gap-2">
                                <Smile className="h-5 w-5" />
                                <h4 className="font-semibold">Mood:</h4>
                                <Badge variant="secondary">{log.mood} (Intensity: {log.moodIntensity?.[0] ?? 'N/A'}/10)</Badge>
                            </div>

                            <div className="flex items-start gap-2">
                               <Tag className="h-5 w-5 mt-1" />
                                <div>
                                    <h4 className="font-semibold mb-2">Symptoms Logged:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {log.symptoms.map(symptom => (
                                            <Badge key={symptom} variant="outline" className="text-white text-sm">{symptom}</Badge>
                                        ))}
                                        {log.otherSymptom && <Badge variant="outline" className="text-white text-sm">{log.otherSymptom}</Badge>}
                                    </div>
                                </div>
                            </div>
                            
                            {log.notes && (
                                <div>
                                    <h4 className="font-semibold mb-2">Notes:</h4>
                                    <p className="text-white/80 bg-white/10 p-3 rounded-md border border-white/20">{log.notes}</p>
                                </div>
                            )}
                             <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/90" onClick={() => router.push('/log-symptoms')}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit this log (Go to Log Symptoms page and select this date)
                            </Button>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
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
