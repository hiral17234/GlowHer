
"use client";

import { useRouter } from 'next/navigation';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Coffee } from 'lucide-react';

export default function DonatePage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white selection:bg-teal-300 selection:text-slate-900">
            <header className="absolute top-0 left-0 w-full container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center">
                    <GlowHerLogo className="[&>span]:text-white" />
                    <Button variant="ghost" onClick={() => router.push('/')} className="text-white hover:text-white hover:bg-white/10">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-lg mx-auto text-center p-6 space-y-6">
                    <h1 className="text-4xl font-headline text-teal-300">Support the Project</h1>
                    <div className="prose prose-invert lg:prose-xl text-gray-300 mx-auto">
                        <p>
                           GlowHer is a personal project, built and maintained with love. If you find it helpful and would like to support its continued development and hosting, you can buy me a coffee!
                        </p>
                        <p>
                            Your support helps cover server costs and allows me to dedicate more time to making this space even better. Thank you for being a part of this community.
                        </p>
                    </div>
                     <a href="https://www.buymeacoffee.com" target="_blank" rel="noopener noreferrer">
                        <Button className="bg-white/90 text-slate-900 hover:bg-white px-8 py-6 text-lg mt-4">
                            <Coffee className="mr-2 h-5 w-5" />
                            Buy Me a Coffee
                        </Button>
                    </a>
                </div>
            </main>
        </div>
    );
}
