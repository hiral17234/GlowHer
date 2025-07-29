
"use client";

import { useState, useEffect } from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { History } from 'lucide-react';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const LOCAL_STORAGE_PREFIX = 'glowher-water-tracker-';

type DailyLog = {
    entries: { time: string; amount: number }[];
};

type WeeklyData = {
    name: string;
    date: string;
    actual: number;
    goal: number;
};

const chartConfig = {
    actual: {
        label: "Actual",
        color: "hsl(var(--primary))",
    },
    goal: {
        label: "Goal",
        color: "hsl(var(--primary))",
    }
} satisfies ChartConfig;


export function WaterLogHistory() {
    const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const today = startOfDay(new Date());
            const data: WeeklyData[] = [];
            let goal = 8; // Default goal
            let unit: 'cups' | 'ml' | 'oz' = 'cups';

            // Get saved settings
            const savedSettings = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}settings`);
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                goal = settings.goal;
                unit = settings.unit;
            }

            for (let i = 6; i >= 0; i--) {
                const date = subDays(today, i);
                const dateKey = format(date, 'yyyy-MM-dd');
                const dayName = format(date, 'EEE');

                const savedLog = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${dateKey}`);
                let totalIntake = 0;
                if (savedLog) {
                    const log: DailyLog = JSON.parse(savedLog);
                    if (log && Array.isArray(log.entries)) {
                        totalIntake = log.entries.reduce((sum, entry) => sum + entry.amount, 0);
                    }
                }

                data.push({
                    name: dayName,
                    date: dateKey,
                    actual: totalIntake,
                    goal: goal,
                });
            }
            setWeeklyData(data);
        } catch (error) {
            console.error("Failed to load weekly water data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return <p>Loading history...</p>;
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History/> Weekly View</CardTitle>
                <CardDescription>Your hydration performance over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyData}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                                label={{ value: 'Cups', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                content={<ChartTooltipContent
                                    formatter={(value, name) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold capitalize">{name}: {value} cups</span>
                                        </div>
                                    )}
                                    labelFormatter={(label, payload) => {
                                        const date = payload?.[0]?.payload.date;
                                        if (date) {
                                            return <div className="font-bold">{format(new Date(date), 'MMMM d')}</div>
                                        }
                                        return null;
                                    }}
                                />}
                                cursor={{ fill: 'hsl(var(--accent))', radius: 4 }}
                            />
                            <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Actual"/>
                            <Bar dataKey="goal" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.3} name="Goal"/>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
