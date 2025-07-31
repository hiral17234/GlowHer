
"use client";

import { useRouter } from 'next/navigation';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CalendarDays, Heart, Droplet, Bed, BookOpen, Baby, Activity, ShoppingCart, Brain, Info, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
      icon: Settings,
      title: 'Settings',
      description: 'Manage your personal information and application settings.'
    },
];


export default function AboutPage() {
    const router = useRouter();

    return (
        <div 
            className="flex flex-col min-h-screen bg-background text-foreground bg-cover bg-center"
            style={{backgroundImage: "url('https://i.pinimg.com/736x/11/6f/02/116f025002e4bf1874ef5543d8439c3b.jpg')"}}
        >
            <header className="sticky top-0 left-0 w-full bg-background/80 backdrop-blur-lg container mx-auto px-4 py-6 z-20">
                <div className="flex justify-between items-center">
                    <GlowHerLogo />
                    <Button variant="ghost" onClick={() => router.push('/')}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-12 bg-background/80 backdrop-blur-sm p-4 sm:p-8 rounded-lg">
                    <section className="text-center">
                        <h1 className="text-4xl md:text-5xl font-headline text-primary">About GlowHer Wellness</h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            GlowHer Wellness is your personal sanctuary for holistic well-being. It is thoughtfully designed to help you connect with your body, understand your natural rhythms, and cultivate a daily practice of self-care. Whether you're tracking your cycle, navigating pregnancy, or simply seeking a moment of calm, this app provides the tools you need to nurture your mind and body.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-headline text-center text-primary mb-8">Features at a Glance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map(feature => (
                                <Card key={feature.title} className="flex flex-col">
                                    <CardHeader className="flex-row items-center gap-4">
                                        <feature.icon className="w-8 h-8 text-primary" />
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <CardDescription>{feature.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section className="text-center">
                        <h2 className="text-3xl font-headline text-primary">Created with Love</h2>
                        <div className="mt-4 text-lg text-foreground space-y-2">
                           <p>
                                This application was built by:
                           </p>
                           <p className="font-bold text-xl">
                                Hiral Goyal
                           </p>
                           <p className="text-sm text-muted-foreground">
                                B-Tech, MAC Student
                                <br/>
                                MITS College, Gwalior (MP)
                           </p>
                        </div>
                    </section>

                    <section className="text-center text-sm text-muted-foreground pt-8 border-t">
                        <p>&copy; {new Date().getFullYear()} GlowHer Wellness. All Rights Reserved.</p>
                        <p className="mt-2">The content and features of this application are for informational purposes only. All images and videos used are the property of their respective owners. No copyright infringement is intended. Unauthorized duplication or distribution of this app is strictly prohibited.</p>
                    </section>
                </div>
            </main>
        </div>
    );
}
