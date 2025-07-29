"use client";

import { useState } from 'react';
import { HeartPulse, Droplet, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';


export function SelfCareHub() {
    const [waterCount, setWaterCount] = useState(3);
    const maxWater = 8;
  
    return (
      <Card className="bg-accent/20 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-2xl">
            <HeartPulse /> Self-Care Hub
          </CardTitle>
          <CardDescription>Gentle reminders for your well-being.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="text-center bg-accent/30 p-4 rounded-lg border border-accent">
                <p className="font-serif italic text-lg text-accent-foreground/80">
                “To fall in love with yourself is the first secret to happiness.”
                </p>
                <p className="text-sm text-muted-foreground mt-2">- Robert Morley</p>
            </div>

            <div>
                <Label className="font-semibold text-lg">Hydration Tracker</Label>
                <p className="text-sm text-muted-foreground mb-3">Track your daily water intake (goal: 8 glasses).</p>
                <div className="flex items-center gap-4">
                    <div className="flex-grow space-y-2">
                        <div className="flex justify-center gap-2">
                            {Array.from({ length: maxWater }).map((_, i) => (
                                <Droplet key={i} className={cn("h-8 w-8 transition-colors", i < waterCount ? "text-blue-400 fill-blue-400" : "text-gray-300")} />
                            ))}
                        </div>
                        <Progress value={(waterCount/maxWater) * 100} className="h-2" />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => setWaterCount(p => Math.max(0, p - 1))}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setWaterCount(p => Math.min(maxWater, p + 1))}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
    );
  }