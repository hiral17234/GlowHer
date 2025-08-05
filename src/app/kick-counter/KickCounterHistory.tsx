
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import { KickCounterSession } from './page';

interface KickCounterHistoryProps {
    sessions: KickCounterSession[];
}

export function KickCounterHistory({ sessions }: KickCounterHistoryProps) {

    if (sessions.length === 0) {
        return (
             <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Activity className="h-6 w-6 text-pink-500" />
                        Session History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-center text-slate-500 py-8">No sessions recorded yet.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Activity className="h-6 w-6 text-pink-500" />
                    Session History
                </CardTitle>
                <CardDescription>A log of your previous kick counting sessions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sessions.map(session => (
                        <div key={session.startTime} className="p-4 rounded-lg bg-white/40 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-slate-500">Date & Time</p>
                                <p className="font-semibold text-slate-800">{format(new Date(session.startTime), 'MMM d, p')}</p>
                            </div>
                             <div>
                                <p className="text-sm text-slate-500">Kicks Counted</p>
                                <p className="font-semibold text-slate-800">{session.kickCount}</p>
                            </div>
                             <div>
                                <p className="text-sm text-slate-500">Duration</p>
                                <p className="font-semibold text-slate-800">{Math.floor(session.duration / 60)}m {session.duration % 60}s</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

    
