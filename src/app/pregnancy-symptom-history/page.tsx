
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
import { ChevronLeft, Calendar, Tag, BookText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LOCAL_STORAGE_KEY_PREFIX = 'glowher-pregnancy-symptom-';

type LogData = {
  logDate: string;
  symptoms: string[];
  notes?: string;
};

export default function PregnancySymptomHistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(LOCAL_STORAGE_KEY_PREFIX));
      const savedLogs = keys.map(key => JSON.parse(localStorage.getItem(key)!));
      
      savedLogs.sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());

      setLogs(savedLogs);
    } catch (error) {
      console.error("Failed to read logs from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-6 z-10">
        <div className="flex justify-between items-center">
          <GlowHerLogo />
          <Button variant="ghost" onClick={() => router.push('/pregnancy-tracker')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Tracker
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Pregnancy Symptom History</h1>
            <p className="mt-2 text-lg text-muted-foreground">Review your past symptom entries from your pregnancy journey.</p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              {loading ? (
                <p>Loading history...</p>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">You haven't logged any symptoms yet.</p>
                    <Button className="mt-4" onClick={() => router.push('/pregnancy-tracker')}>Start Logging</Button>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {logs.map((log) => (
                    <AccordionItem key={log.logDate} value={log.logDate}>
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-4">
                            <Calendar className="h-5 w-5 text-primary" />
                            {format(new Date(log.logDate), 'EEEE, MMMM d, yyyy')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 space-y-4">
                        
                        {(log.symptoms && log.symptoms.length > 0) && (
                            <div className="flex items-start gap-2">
                               <Tag className="h-5 w-5 text-secondary-foreground mt-1" />
                                <div>
                                    <h4 className="font-semibold mb-2">Symptoms Logged:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {log.symptoms.map(symptom => (
                                            <Badge key={symptom} variant="outline">{symptom}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {log.notes && (
                           <div className="flex items-start gap-2">
                                <BookText className="h-5 w-5 text-secondary-foreground mt-1" />
                                <div>
                                    <h4 className="font-semibold mb-2">Notes:</h4>
                                    <p className="text-muted-foreground bg-muted/50 p-3 rounded-md border">{log.notes}</p>
                                </div>
                           </div>
                        )}
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
  );
}
