"use client";

import { Smile } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const moods = [
  { name: 'Happy', emoji: '😊' },
  { name: 'Sad', emoji: '😔' },
  { name: 'Calm', emoji: '😌' },
  { name: 'Stressed', emoji: '😩' },
  { name: 'Energetic', emoji: '⚡️' },
];

type MoodTrackerProps = {
    selectedValue: string;
    onValueChange: (value: string) => void;
  };

export function MoodTracker({ selectedValue, onValueChange }: MoodTrackerProps) {
  return (
    <Card className="shadow-lg shadow-card/20 hover:shadow-xl hover:shadow-card/40 transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-2xl">
          <Smile /> Mood Journal
        </CardTitle>
        <CardDescription>How are you feeling today? Select a mood.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => (
            <Button
              key={mood.name}
              variant={selectedValue === mood.name ? 'secondary' : 'outline'}
              className={cn(
                "flex-grow h-16 text-lg transition-all duration-200 transform hover:scale-105",
                selectedValue === mood.name && "border-2 border-accent ring-2 ring-accent/50"
              )}
              onClick={() => onValueChange(mood.name)}
            >
              <span className="text-2xl mr-2">{mood.emoji}</span> {mood.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
