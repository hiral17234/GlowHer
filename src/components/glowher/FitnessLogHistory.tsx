
"use client";

import React, { useState, useEffect } from 'react';
import { format, isValid } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Footprints, Dumbbell, Calendar, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DailyFitnessLog } from '@/app/fitness-goals/page';
import { DEFAULT_LOG_PREFIX } from '@/app/fitness-goals/page';


export function FitnessLogHistory() {
  const [logs, setLogs] = useState<DailyFitnessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(DEFAULT_LOG_PREFIX));
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
    <Card className="shadow-lg bg-background/80 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><History/> Fitness Log History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading history...</p>
        ) : logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No fitness activities logged yet.</p>
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
                    {log.steps && log.steps.count > 0 && (
                      <div className="flex items-start gap-3">
                        <Footprints className="h-5 w-5 mt-1 text-primary" />
                        <div>
                          <h4 className="font-semibold">Steps Activity</h4>
                          <p>
                            {log.steps.count.toLocaleString()} steps during a {log.steps.workoutType} session.
                          </p>
                        </div>
                      </div>
                    )}
                    {log.workout && log.workout.duration > 0 && (
                      <div className="flex items-start gap-3">
                        <Dumbbell className="h-5 w-5 mt-1 text-green-500" />
                        <div>
                          <h4 className="font-semibold">Workout Session</h4>
                          <p>
                             {log.workout.duration} minutes of {log.workout.type}.
                          </p>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
