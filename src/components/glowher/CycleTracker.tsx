"use client";

import { CalendarDays } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const cyclePhases = ["Menstruation", "Follicular", "Ovulation", "Luteal"];

type CycleTrackerProps = {
  selectedValue: string;
  onValueChange: (value: string) => void;
};

export function CycleTracker({ selectedValue, onValueChange }: CycleTrackerProps) {
  return (
    <Card className="shadow-lg shadow-card/20 hover:shadow-xl hover:shadow-card/40 transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-2xl">
          <CalendarDays /> Period Tracker
        </CardTitle>
        <CardDescription>Select your current cycle phase for personalized insights.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedValue} onValueChange={onValueChange} className="space-y-2">
          {cyclePhases.map((phase) => (
            <div key={phase} className="flex items-center space-x-2 rounded-md p-2 hover:bg-card/50 transition-colors">
              <RadioGroupItem value={phase} id={phase} />
              <Label htmlFor={phase} className="text-base cursor-pointer">{phase}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
