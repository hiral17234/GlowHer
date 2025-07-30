"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Droplet } from 'lucide-react';

const videos = ["77ZozI0rw7w", "IvjMgVS6kng", "Unbi1YfQfBU", "RoRyvU4KZyQ"];

export default function WaterAuraPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Droplet className="h-8 w-8 text-cyan-500" />
                        Water Aura
                    </h1>
                    <Button variant="ghost" onClick={() => router.push('/breathe')}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Breathing
                    </Button>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-5xl mx-auto text-center p-6 space-y-8">
                    <h2 className="text-3xl font-headline">Your Water Aura Music</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {videos.map(videoId => (
                            <div key={videoId} className="aspect-video">
                                <iframe
                                    className="w-full h-full rounded-lg shadow-xl"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
