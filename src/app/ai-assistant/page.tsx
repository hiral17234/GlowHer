
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';

export default function AiAssistantPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="flex-shrink-0 bg-background border-b z-10">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <GlowHerLogo />
                    <Button variant="ghost" onClick={() => router.push('/')}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </header>
            <main className="flex-grow">
                <iframe
                    src="https://chat.deepseek.com/"
                    className="w-full h-full border-none"
                    title="AI Assistant"
                ></iframe>
            </main>
        </div>
    );
}
