
"use client";

import { useState, useEffect } from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { History } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const LOCAL_STORAGE_PREFIX = 'glowher-sleep-log-';

type SleepLog = {
    sleepDuration: number[];
};

type WeeklyData = {
    name: string;
    date: string;
    hours: number;
};

const chartConfig = {
    hours: {
        label: "Hours Slept",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;


export function SleepLogHistory() {
    const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const today = startOfDay(new Date());
            const data: WeeklyData[] = [];

            for (let i = 6; i >= 0; i--) {
                const date = subDays(today, i);
                const dateKey = format(date, 'yyyy-MM-dd');
                const dayName = format(date, 'EEE');

                const savedLog = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${dateKey}`);
                let hoursSlept = 0;
                if (savedLog) {
                    const log: SleepLog = JSON.parse(savedLog);
                    if (log && Array.isArray(log.sleepDuration)) {
                        hoursSlept = log.sleepDuration[0] || 0;
                    }
                }

                data.push({
                    name: dayName,
                    date: dateKey,
                    hours: hoursSlept,
                });
            }
            setWeeklyData(data);
        } catch (error) {
            console.error("Failed to load weekly sleep data", error);
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
                <CardTitle className="flex items-center gap-2"><History/> Sleep Trends: Last 7 Days</CardTitle>
                <CardDescription>Your sleep duration over the past week.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                           <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}h`}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'hsl(var(--accent))', radius: 4 }}
                                content={<ChartTooltipContent
                                    formatter={(value, name, props) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold">{props.payload.hours.toFixed(1)} hours</span>
                                        </div>
                                    )}
                                    labelFormatter={(label, payload) => {
                                        const date = payload?.[0]?.payload.date;
                                        if (date) {
                                            const formattedDate = format(new Date(date), 'EEEE, MMMM d');
                                            return <div className="font-bold">{formattedDate}</div>
                                        }
                                        return null;
                                    }}
                                />}
                            />
                            <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Hours"/>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
