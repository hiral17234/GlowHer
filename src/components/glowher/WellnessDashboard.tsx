"use client";

import { useState } from 'react';
import Link from 'next/link';
import { HeartPulse, LoaderCircle, Sparkles, User } from 'lucide-react';

import { CycleTracker } from './CycleTracker';
import { MoodTracker } from './MoodTracker';
import { SoothingSounds } from './SoothingSounds';
import { SelfCareHub } from './SelfCareHub';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { generateWellnessAdvice } from '@/app/actions';

export function WellnessDashboard() {
  const [mood, setMood] = useState('');
  const [cyclePhase, setCyclePhase] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateAdvice = async () => {
    if (!mood || !cyclePhase) {
      setError('Please select your current mood and cycle phase to get personalized advice.');
      return;
    }
    setError('');
    setIsLoading(true);
    setAiAdvice('');

    const result = await generateWellnessAdvice({ mood, cycleData: cyclePhase });
    if (result.success && result.advice) {
      setAiAdvice(result.advice);
    } else {
      setError(result.error || 'An unknown error occurred.');
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <CycleTracker selectedValue={cyclePhase} onValueChange={setCyclePhase} />
        <MoodTracker selectedValue={mood} onValueChange={setMood} />
        <Card className="shadow-lg shadow-card/20 hover:shadow-xl hover:shadow-card/40 transition-shadow duration-300 flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-2xl">
                    <User /> Personal Details
                </CardTitle>
                <CardDescription>Keep your personal information up to date for a tailored experience.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center text-center">
                <p className="text-muted-foreground mb-4">Click here to view or edit your personal details.</p>
                <Button asChild size="lg">
                    <Link href="/personal-details">View Details</Link>
                </Button>
            </CardContent>
        </Card>
      </div>

      <Card className="bg-secondary/50 border-secondary shadow-lg shadow-secondary/20 text-center">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
            <Sparkles className="text-accent-foreground" />
            Your AI-Powered Wellness Guide
          </CardTitle>
          <CardDescription>
            Get a personalized wellness tip based on your mood and cycle.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button onClick={handleGenerateAdvice} disabled={isLoading} size="lg" className="shadow-md">
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : "Get My Glow Tip"}
          </Button>

          {error && (
             <Alert variant="destructive" className="max-w-md text-left">
                <HeartPulse className="h-4 w-4" />
                <AlertTitle>Oops!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {aiAdvice && !isLoading && (
             <Alert className="max-w-md text-left border-primary bg-primary/20">
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Your Personal Tip</AlertTitle>
                <AlertDescription>{aiAdvice}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SoothingSounds />
        <SelfCareHub />
      </div>
    </div>
  );
}
