
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PregnancyIntroPage() {
    const router = useRouter();

    return (
        <div 
            className="relative flex flex-col min-h-screen items-center justify-center p-4 text-center text-white bg-cover bg-center"
            style={{backgroundImage: "url('https://i.pinimg.com/736x/e2/43/86/e243863fedaf6e675fd150476c75a35a.jpg')"}}
        >
            <div className="absolute inset-0 bg-black/40 z-0" />
            
            <header className="absolute top-0 left-0 w-full container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center">
                    <GlowHerLogo />
                    <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }), "text-white hover:bg-white/10 hover:text-white")}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="relative z-10 w-full max-w-6xl mx-auto pt-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/20 backdrop-blur-sm p-8 rounded-2xl">
                    <div className="space-y-8">
                        <blockquote className="space-y-4">
                            <p className="font-headline text-3xl md:text-4xl leading-tight">
                                "A baby is something you carry inside you for nine months, in your arms for three years, and in your heart until the day you die."
                            </p>
                            <footer className="text-lg text-white/80">
                                – Mary Mason
                            </footer>
                        </blockquote>
                        <Button 
                            onClick={() => router.push('/pregnancy-tracker')} 
                            size="lg" 
                            className="bg-pink-500 hover:bg-pink-600 text-white font-bold"
                        >
                            Continue to My Journey <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                    <div className="aspect-w-16 aspect-h-9">
                         <iframe 
                            title="Embryo to Fetus" 
                            frameBorder="0" 
                            allowFullScreen
                            allow="autoplay; fullscreen; xr-spatial-tracking" 
                            src="https://sketchfab.com/models/2745a63da7924f5bb16109e51d6f391a/embed"
                            className="w-full h-full rounded-lg"
                            style={{minHeight: '400px'}}
                        ></iframe>
                    </div>
                </div>

                <div className="mt-8 space-y-8">
                    <div className="bg-black/20 backdrop-blur-sm p-8 rounded-2xl">
                         <div className="aspect-w-16 aspect-h-9">
                            <iframe 
                                title="Human embryonic - fetal development stages" 
                                frameBorder="0" 
                                allowFullScreen
                                allow="autoplay; fullscreen; xr-spatial-tracking" 
                                src="https://sketchfab.com/models/9fb225b983c14b20b67b639e17126f5b/embed?ui_theme=dark"
                                className="w-full h-full rounded-lg"
                                style={{minHeight: '400px'}}
                            ></iframe>
                        </div>
                    </div>
                    <div className="bg-black/20 backdrop-blur-sm p-8 rounded-2xl">
                         <div className="aspect-w-16 aspect-h-9">
                            <iframe 
                                title="Fetus week eight" 
                                frameBorder="0" 
                                allowFullScreen
                                allow="autoplay; fullscreen; xr-spatial-tracking" 
                                src="https://sketchfab.com/models/8bf872eed84e47dba4555f4675077453/embed?ui_theme=dark"
                                className="w-full h-full rounded-lg"
                                style={{minHeight: '400px'}}
                            ></iframe>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
