
"use client";

import { useRouter } from 'next/navigation';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function AboutPage() {
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
                <div className="w-full max-w-2xl mx-auto text-left p-6 space-y-6">
                    <h1 className="text-4xl font-headline text-teal-300">About this Space</h1>
                    <div className="prose prose-invert lg:prose-xl text-gray-300">
                        <p>
                            In a world that constantly demands our attention, finding a moment of genuine peace can feel like a luxury. We are bombarded with notifications, tasks, and the endless pressure to be productive. This constant noise can be overwhelming, leaving our minds cluttered and our spirits heavy.
                        </p>
                        <p>
                            This little corner of the internet was created as an antidote to that chaos. It’s a simple, private space designed for one purpose: to help you clear your head.
                        </p>
                        <p>
                            The core idea is based on the therapeutic practice of stream-of-consciousness writing, but with a digital twist. As you type your thoughts, they gently fade away. There is no save button, no history, no judgment. It’s not about crafting the perfect sentence or remembering a brilliant idea. It’s about the act of release itself.
                        </p>
                        <p>
                            By letting your thoughts flow out and disappear, you give yourself permission to let go. Let go of the anxieties, the to-do lists, the passing frustrations, and the mental clutter that weighs you down. It’s a digital exhale.
                        </p>
                        <p>
                            This is not a productivity tool. It is a space for quiet reflection. A place to untangle your thoughts without the pressure of permanence.
                        </p>
                        <p>
                            I hope it brings you a moment of calm.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
