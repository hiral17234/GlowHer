
"use client";

import { useRouter } from 'next/navigation';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CalendarDays, Heart, Droplet, Bed, BookOpen, Baby, Activity, ShoppingCart, Brain, Info, DollarSign, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const features = [
    {
      icon: CalendarDays,
      title: 'Period Tracker',
      description: 'Log your cycle details, predict future periods and fertile windows, and receive wellness tips tailored to your current phase.'
    },
    {
      icon: Heart,
      title: 'Log Symptoms & Moods',
      description: 'Easily track daily symptoms and emotional states to better understand your body\'s patterns.'
    },
    {
      icon: Droplet,
      title: 'Water Intake Tracker',
      description: 'Stay hydrated by logging your water intake, setting goals, and viewing your progress over time.'
    },
    {
      icon: Bed,
      title: 'Sleep Tracker',
      description: 'Monitor your sleep duration and quality to build healthier rest habits and discover patterns.'
    },
    {
      icon: BookOpen,
      title: 'Mood Journal',
      description: 'A rich text journal to express your thoughts and feelings, complete with themes and image attachments.'
    },
    {
      icon: Baby,
      title: 'Pregnancy Tracker',
      description: 'Follow your pregnancy week-by-week with detailed updates on your baby\'s development and your body\'s changes.'
    },
    {
      icon: Activity,
      title: 'Fitness Goals',
      description: 'Set personalized fitness goals, log activities, and receive exercise suggestions that align with your cycle or pregnancy stage.'
    },
    {
      icon: ShoppingCart,
      title: 'Grocery List',
      description: 'A smart grocery manager to keep track of your inventory, manage expiry dates, and build your shopping list.'
    },
    {
      icon: Brain,
      title: 'Mental Health Check-In',
      description: 'A guided journey to clear your mind. Write down your thoughts, select an aura, and reflect on your emotional shift.'
    },
    {
        icon: Info,
        title: 'About',
        description: 'Learn more about the project, its features, and the creator.'
    },
    {
        icon: DollarSign,
        title: 'Donate',
        description: 'If you find this app helpful, you can support its continued development and hosting costs.'
    },
    {
      icon: User,
      title: 'Personal Details',
      description: 'Manage your personal information to help us tailor the experience for you.'
    },
];


export default function AboutPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white selection:bg-teal-300 selection:text-slate-900">
            <header className="sticky top-0 left-0 w-full bg-gray-900/80 backdrop-blur-lg container mx-auto px-4 py-6 z-20">
                <div className="flex justify-between items-center">
                    <GlowHerLogo className="[&>span]:text-white" />
                    <Button variant="ghost" onClick={() => router.push('/')} className="text-white hover:text-white hover:bg-white/10">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-12">
                    <section className="text-center">
                        <h1 className="text-4xl md:text-5xl font-headline text-teal-300">About GlowHer Wellness</h1>
                        <p className="mt-4 text-lg text-gray-300">
                            GlowHer Wellness is your personal sanctuary for holistic well-being. It is thoughtfully designed to help you connect with your body, understand your natural rhythms, and cultivate a daily practice of self-care. Whether you're tracking your cycle, navigating pregnancy, or simply seeking a moment of calm, this app provides the tools you need to nurture your mind and body.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-headline text-center text-teal-300 mb-8">Features at a Glance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map(feature => (
                                <Card key={feature.title} className="bg-white/5 border-white/10 text-white flex flex-col">
                                    <CardHeader className="flex-row items-center gap-4">
                                        <feature.icon className={`w-8 h-8 ${feature.color || 'text-teal-400'}`} />
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <CardDescription className="text-gray-400">{feature.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section className="text-center">
                        <h2 className="text-3xl font-headline text-teal-300">Created with Love</h2>
                        <div className="mt-4 text-lg text-gray-300 space-y-2">
                           <p>
                                This application was built by:
                           </p>
                           <p className="font-bold text-white text-xl">
                                Hiral Goyal
                           </p>
                           <p className="text-gray-400">
                                B-Tech, MAC Student
                                <br/>
                                MITS College, Gwalior (MP)
                           </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
