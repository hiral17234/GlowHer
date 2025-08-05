
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { Weight, LineChart as LineChartIcon } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { WeightLog } from './page';

interface WeightChartProps {
    logData: WeightLog[];
    unit: 'lbs' | 'kgs';
}

const chartConfig = {
    weight: {
        label: "Weight",
        color: "hsl(340 82% 52%)",
    },
} satisfies ChartConfig;

const LBS_TO_KG = 0.453592;

export function WeightChart({ logData, unit }: WeightChartProps) {
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if(logData.length > 0) {
            const sortedData = [...logData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setChartData(sortedData.map(log => {
                const weightInUnit = unit === 'kgs' ? parseFloat((log.weight * LBS_TO_KG).toFixed(1)) : parseFloat(log.weight.toFixed(1));
                return {
                    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    weight: weightInUnit,
                }
            }));
        } else {
            setChartData([]);
        }
    }, [logData, unit]);

    if (chartData.length < 2) {
        return (
            <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <LineChartIcon className="h-6 w-6 text-pink-500" />
                        Weight Trend
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                    <p className="text-slate-500">Log at least two entries to see your weight trend chart.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <LineChartIcon className="h-6 w-6 text-pink-500" />
                    Weight Trend
                </CardTitle>
                <CardDescription>Your weight progression over time.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="hsl(var(--muted-foreground))" fontSize={12} unit={unit} />
                            <Tooltip
                                content={<ChartTooltipContent 
                                    formatter={(value) => [`${value} ${unit}`, 'Weight']}
                                />}
                            />
                            <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
