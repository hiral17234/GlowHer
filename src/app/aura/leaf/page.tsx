"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Leaf } from 'lucide-react';

export default function LeafAuraPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Leaf className="h-8 w-8 text-green-500" />
                        Leaf Aura
                    </h1>
                    <Button variant="ghost" onClick={() => router.push('/breathe')}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Breathing
                    </Button>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-2xl mx-auto text-center p-6 space-y-6">
                    <h2 className="text-3xl font-headline">Your Leaf Aura Music</h2>
                    <p className="text-muted-foreground">This is the placeholder page for the Leaf aura. You can add the YouTube video here.</p>
                </div>
            </main>
        </div>
    );
}
