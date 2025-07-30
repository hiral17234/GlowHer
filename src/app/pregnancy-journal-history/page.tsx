
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { ChevronLeft, Calendar, BookText, ImageIcon } from 'lucide-react';
import Image from 'next/image';

const LOCAL_STORAGE_KEY_PREFIX = 'glowher-pregnancy-journal-';

type LogData = {
  logDate: string;
  notes: string;
  themeUrl?: string;
  imageUrl?: string;
};

export default function PregnancyJournalHistoryPage() {
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
    <div className="flex flex-col min-h-screen text-foreground" style={{ backgroundImage: "url('https://i.pinimg.com/736x/e2/43/86/e243863fedaf6e675fd150476c75a35a.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <header className="container mx-auto px-4 py-6 z-10 bg-black/10 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <GlowHerLogo />
          <Button variant="outline" onClick={() => router.push('/pregnancy-journal')} className="bg-white/80 text-black hover:bg-white">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Journal
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 p-4 rounded-lg bg-black/20 backdrop-blur-sm">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-white">Your Pregnancy Journal History</h1>
            <p className="mt-2 text-lg text-white/90">Review your past notes and reflections.</p>
          </div>

          <Card className="shadow-lg bg-background/80 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              {loading ? (
                <p>Loading history...</p>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">You haven't logged any journal entries yet.</p>
                    <Button className="mt-4" onClick={() => router.push('/pregnancy-journal')}>Start Journaling</Button>
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
                        {log.notes && (
                            <div className="flex items-start gap-2">
                                <BookText className="h-5 w-5 text-secondary-foreground mt-1" />
                                <div className="w-full">
                                    <h4 className="font-semibold mb-2">Journal Entry:</h4>
                                     <div 
                                        className="prose max-w-none text-foreground bg-muted/50 p-3 rounded-md border min-h-[100px] bg-cover bg-center"
                                        style={{ 
                                            backgroundImage: log.themeUrl ? `url(${log.themeUrl})` : 'none',
                                        }}
                                        dangerouslySetInnerHTML={{ __html: log.notes }} 
                                    >
                                    </div>
                                </div>
                            </div>
                        )}
                        {log.imageUrl && (
                             <div className="flex items-start gap-2">
                                <ImageIcon className="h-5 w-5 text-secondary-foreground mt-1" />
                                <div className="w-full">
                                    <h4 className="font-semibold mb-2">Attached Image:</h4>
                                    <Image src={log.imageUrl} alt="Journal image" width={200} height={200} className="rounded-md border object-cover"/>
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
