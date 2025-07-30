
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
  Settings,
  Sparkles,
  LoaderCircle,
  Bell,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchThoughtOfTheDay } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';

const wellnessFeatures = [
    {
      id: 'period-tracker',
      icon: CalendarDays,
      title: { en: 'Period Tracker', hi: 'पीरियड ट्रैकर' },
      description: { en: 'Input Last Period, Cycle Length, Predict Next Period', hi: 'अंतिम पीरियड, साइकिल की लंबाई दर्ज करें' },
      href: '/period-tracker',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      id: 'mental-health-check-in',
      icon: Brain,
      title: { en: 'Mental Health Check-In', hi: 'मानसिक स्वास्थ्य जांच' },
      description: { en: 'A space to clear your mind and reflect.', hi: 'अपने मन को साफ़ करने और प्रतिबिंबित करने की जगह' },
      href: '/mental-health-check-in',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      id: 'water-tracker',
      icon: Droplet,
      title: { en: 'Water Intake Tracker', hi: 'पानी का सेवन ट्रैकर' },
      description: { en: 'Add glasses, view progress, set daily goal', hi: 'गिलास जोड़ें, प्रगति देखें, दैनिक लक्ष्य निर्धारित करें' },
      href: '/water-tracker',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'sleep-tracker',
      icon: Bed,
      title: { en: 'Sleep Tracker', hi: 'नींद ट्रैकर' },
      description: { en: 'Log hours & quality, view trends', hi: 'घंटे और गुणवत्ता लॉग करें, रुझान देखें' },
      href: '/sleep-tracker',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    },
    {
      id: 'mood-journal',
      icon: BookOpen,
      title: { en: 'Mood Journal', hi: 'मूड जर्नल' },
      description: { en: 'Daily mood + notes, view history', hi: 'दैनिक मूड + नोट्स, इतिहास देखें' },
      href: '/mood-journal',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      id: 'pregnancy-tracker',
      icon: Baby,
      title: { en: 'Pregnancy Tracker', hi: 'गर्भावस्था ट्रैकर' },
      description: { en: 'Enter due date, view week-by-week updates', hi: 'देय तिथि दर्ज करें, सप्ताह-दर-सप्ताह अपडेट देखें' },
      href: '/pregnancy-tracker',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'fitness-goals',
      icon: Activity,
      title: { en: 'Fitness Goals', hi: 'फिटनेस लक्ष्य' },
      description: { en: 'Set fitness targets, log progress, get cycle-aware tips', hi: 'फिटनेस लक्ष्य निर्धारित करें, प्रगति लॉग करें' },
      href: '/fitness-goals',
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10'
    },
    {
      id: 'grocery-list',
      icon: ShoppingCart,
      title: { en: 'Grocery List', hi: 'किराने की सूची' },
      description: { en: 'Manage your inventory and shopping list', hi: 'अपनी इन्वेंट्री और खरीदारी सूची प्रबंधित करें' },
      href: '/grocery-list',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
     {
      id: 'log-symptoms',
      icon: Heart,
      title: { en: 'Log Symptoms & Moods', hi: 'लक्षण और मूड लॉग करें' },
      description: { en: 'Select symptoms & emotional state', hi: 'लक्षण और भावनात्मक स्थिति चुनें' },
      href: '/log-symptoms',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
    {
        id: 'about',
        icon: Info,
        title: { en: 'About', hi: 'के बारे में' },
        description: { en: 'Learn more about the project and its purpose.', hi: 'परियोजना और उसके उद्देश्य के बारे में और जानें' },
        href: '/about',
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/10'
    },
    {
      id: 'settings',
      icon: Settings,
      title: { en: 'Settings', hi: 'सेटिंग्स' },
      description: { en: 'Manage your profile and app preferences.', hi: 'अपनी प्रोफ़ाइल और ऐप प्राथमिकताएं प्रबंधित करें' },
      href: '/settings',
      color: 'text-slate-500',
      bgColor: 'bg-slate-500/10'
    },
  ];

function FeatureCard({ icon: Icon, title, description, href, color, bgColor }: {
    icon: React.ElementType;
    title: string;
    description: string;
    href: string;
    color: string;
    bgColor: string;
}) {
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
  const { language } = useLanguage();
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
        <div className="relative">
            <Card className="flex-grow bg-accent/20 shadow-lg shadow-accent/20 text-center">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center justify-center gap-2 text-2xl">
                        <Sparkles className="text-accent-foreground" />
                        {language === 'hi' ? 'दिन का विचार' : 'Thought of the Day'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <LoaderCircle className="h-5 w-5 animate-spin"/>
                            <span>{language === 'hi' ? 'बना रहा है...' : 'Generating...'}</span>
                        </div>
                    ) : (
                        <p className="font-serif italic text-lg text-accent-foreground/80">
                            "{thought}"
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wellnessFeatures.map((feature) => (
                <FeatureCard 
                    key={feature.id} 
                    {...feature}
                    title={feature.title[language]}
                    description={feature.description[language]}
                />
            ))}
        </div>
    </div>
  );
}
