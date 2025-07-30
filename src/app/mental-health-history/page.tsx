
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
import { ChevronLeft, Calendar, BookText, Cloud, Flame, Leaf, Droplet, Sun, Moon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LOCAL_STORAGE_KEY_PREFIX = 'glowher-mental-health-log-';

type LogData = {
  logDate: string;
  note: string;
  aura: string;
};

const auraIcons: { [key: string]: React.ElementType } = {
    Cloud, Fire, Leaf, Water: Droplet, Sun, Moon
};

export default function MentalHealthHistoryPage() {
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
          <Button variant="ghost" onClick={() => router.push('/mental-health-check-in')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Check-in
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Your Mental Health History</h1>
            <p className="mt-2 text-lg text-muted-foreground">Review your past check-ins and reflections.</p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              {loading ? (
                <p>Loading history...</p>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">You haven't saved any entries yet.</p>
                    <Button className="mt-4" onClick={() => router.push('/mind-dump')}>Start a New Entry</Button>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {logs.map((log) => {
                    const logDate = new Date(log.logDate);
                    if (!isValid(logDate)) return null;
                    const AuraIcon = auraIcons[log.aura] || Cloud;

                    return (
                    <AccordionItem key={log.logDate} value={log.logDate}>
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-4">
                            <Calendar className="h-5 w-5 text-primary" />
                            {format(logDate, 'EEEE, MMMM d, yyyy')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 space-y-4">
                        
                        <div className="flex items-center gap-2">
                           <AuraIcon className="h-5 w-5 text-secondary-foreground" />
                            <h4 className="font-semibold">Aura Selected:</h4>
                           <Badge variant="secondary">{log.aura}</Badge>
                        </div>
                        
                        {log.note && (
                           <div className="flex items-start gap-2">
                                <BookText className="h-5 w-5 text-secondary-foreground mt-1" />
                                <div>
                                    <h4 className="font-semibold mb-2">Your Thoughts:</h4>
                                    <p className="text-muted-foreground bg-muted/50 p-3 rounded-md border whitespace-pre-wrap">{log.note}</p>
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
