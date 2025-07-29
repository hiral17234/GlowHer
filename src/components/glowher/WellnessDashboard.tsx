"use client";

import { useState, useEffect } from 'react';
import {
  CalendarDays,
  Heart,
  Droplet,
  Bed,
  BookOpen,
  Baby,
  Activity,
  ShoppingCart,
  Brain,
  User,
  Sparkles,
  LoaderCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchThoughtOfTheDay } from '@/app/actions';
import { useRouter } from 'next/navigation';

const wellnessFeatures = [
    {
      icon: CalendarDays,
      title: 'Period Tracker',
      description: 'Input Last Period, Cycle Length, Predict Next Period',
      href: '/period-tracker',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      icon: Heart,
      title: 'Log Symptoms & Moods',
      description: 'Select symptoms & emotional state',
      href: '/log-symptoms',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
    {
      icon: Droplet,
      title: 'Water Intake Tracker',
      description: 'Add glasses, view progress, set daily goal',
      href: '/water-tracker',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Bed,
      title: 'Sleep Tracker',
      description: 'Log hours & quality, view trends',
      href: '#',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    },
    {
      icon: BookOpen,
      title: 'Mood Journal',
      description: 'Daily mood + notes, view history',
      href: '#',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: Baby,
      title: 'Pregnancy Tracker',
      description: 'Enter due date, view week-by-week updates',
      href: '#',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Activity,
      title: 'Fitness Goals',
      description: 'Set fitness targets, log progress',
      href: '#',
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10'
    },
    {
      icon: ShoppingCart,
      title: 'Grocery List',
      description: 'Add items + expiry date, get alerts',
      href: '#',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      icon: Brain,
      title: 'Mental Health Check-In',
      description: 'Answer daily questions, breathing exercises',
      href: '#',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      icon: User,
      title: 'Personal Details',
      description: 'Opens on new page for profile & settings',
      href: '/personal-details',
      color: 'text-slate-500',
      bgColor: 'bg-slate-500/10'
    },
  ];

function FeatureCard({ icon: Icon, title, description, href, color, bgColor }: (typeof wellnessFeatures)[0]) {
    const router = useRouter();
    return (
        <Card 
            className={`shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${bgColor} border-0`}
            onClick={() => router.push(href)}
        >
        <CardHeader className="flex flex-row items-center gap-4">
            <Icon className={`w-8 h-8 ${color}`} />
            <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
        </Card>
    );
}

export function WellnessDashboard() {
  const [thought, setThought] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getThought = async () => {
      setIsLoading(true);
      const result = await fetchThoughtOfTheDay();
      if (result.success && result.thought) {
        setThought(result.thought);
      } else {
        setThought('"To fall in love with yourself is the first secret to happiness." - Robert Morley');
      }
      setIsLoading(false);
    };
    getThought();
  }, []);


  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
        <Card className="bg-accent/20 shadow-lg shadow-accent/20 text-center">
            <CardHeader>
                <CardTitle className="font-headline flex items-center justify-center gap-2 text-2xl">
                    <Sparkles className="text-accent-foreground" />
                    Thought of the Day
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <LoaderCircle className="h-5 w-5 animate-spin"/>
                        <span>Generating...</span>
                    </div>
                ) : (
                    <p className="font-serif italic text-lg text-accent-foreground/80">
                        "{thought}"
                    </p>
                )}
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wellnessFeatures.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
            ))}
        </div>
    </div>
  );
}
