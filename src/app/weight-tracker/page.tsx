
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PregnancyNav } from '@/components/glowher/PregnancyNav';
import { Weight, Plus, Trash2, Calendar as CalendarIcon, Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { WeightChart } from './WeightChart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const weightLogSchema = z.object({
  date: z.date(),
  weight: z.coerce.number().min(1, "Weight must be a positive number."),
});

export type WeightLog = { id: string } & z.infer<typeof weightLogSchema>;

const WEIGHT_LOG_KEY = 'glowher-weight-log';

export default function WeightTrackerPage() {
    const [log, setLog] = useState<WeightLog[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof weightLogSchema>>({
        resolver: zodResolver(weightLogSchema),
        defaultValues: {
            date: new Date(),
            weight: undefined,
        },
    });

    useEffect(() => {
        try {
            const savedLog = localStorage.getItem(WEIGHT_LOG_KEY);
            if (savedLog) {
                const parsedLog: WeightLog[] = JSON.parse(savedLog).map((item: any) => ({
                    ...item,
                    date: new Date(item.date),
                }));
                setLog(parsedLog);
            }
        } catch (e) {
            console.error("Failed to load weight log:", e);
        }
    }, []);

    const saveLog = (updatedLog: WeightLog[]) => {
        try {
            localStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(updatedLog));
            setLog(updatedLog);
        } catch (e) {
            console.error("Failed to save weight log:", e);
        }
    };

    const onSubmit = (data: z.infer<typeof weightLogSchema>) => {
        // Prevent duplicate entries for the same day
        if (!editingId && log.some(entry => isSameDay(entry.date, data.date))) {
            toast({
                variant: 'destructive',
                title: "Duplicate Date",
                description: "You've already logged a weight for this date. Please edit the existing entry or choose a different date.",
            });
            return;
        }

        if (editingId) {
            const updatedLog = log.map(item => item.id === editingId ? { ...item, ...data } : item);
            saveLog(updatedLog);
            toast({ title: "Entry Updated" });
            setEditingId(null);
        } else {
            const newEntry: WeightLog = { ...data, id: new Date().toISOString() };
            saveLog([...log, newEntry]);
            toast({ title: "Weight Logged!" });
        }
        form.reset({ date: new Date(), weight: undefined });
    };

    const handleEdit = (entry: WeightLog) => {
        setEditingId(entry.id);
        form.reset(entry);
    };

    const handleDelete = (id: string) => {
        saveLog(log.filter(item => item.id !== id));
        toast({ title: "Entry Deleted" });
    };
    
    const sortedLog = [...log].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


    return (
        <div className="relative flex min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
            <PregnancyNav />

            <div className="flex-1 flex flex-col">
                <header className="container mx-auto px-4 py-4 sticky top-0 bg-white/30 backdrop-blur-md z-40 border-b border-white/30 hidden md:block">
                    <div className="flex items-center justify-center">
                        <h1 className="font-headline text-3xl font-bold text-slate-900">
                            Weight Tracker
                        </h1>
                    </div>
                </header>
                
                <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
                     <div className="text-center mb-12 mt-12 md:mt-0">
                        <h1 className="font-headline text-4xl md:text-5xl font-bold text-slate-900">Weight Tracker</h1>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30">
                                <CardHeader>
                                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                                        <Scale className="h-6 w-6 text-pink-500" />
                                        {editingId ? "Edit Weight Entry" : "Log Your Weight"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                 <FormField
                                                    control={form.control}
                                                    name="date"
                                                    render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Date</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : (<span>Pick a date</span>)}</Button></FormControl></PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /></PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                />
                                                 <FormField
                                                    control={form.control}
                                                    name="weight"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Weight (lbs)</FormLabel>
                                                            <FormControl><Input type="number" placeholder="e.g., 145.5" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                                                    <Plus className="mr-2 h-4 w-4" /> {editingId ? "Update Entry" : "Add Entry"}
                                                </Button>
                                                {editingId && (
                                                    <Button variant="ghost" onClick={() => { setEditingId(null); form.reset({ date: new Date(), weight: undefined }); }}>Cancel</Button>
                                                )}
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                            
                            <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
                                <CardHeader>
                                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                                        <Weight className="h-6 w-6 text-pink-500" />
                                        Weight Log
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {sortedLog.length > 0 ? (
                                         <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Weight (lbs)</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sortedLog.map(entry => (
                                                    <TableRow key={entry.id}>
                                                        <TableCell className="font-medium">{format(entry.date, "MMM d, yyyy")}</TableCell>
                                                        <TableCell>{entry.weight}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>Edit</Button>
                                                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(entry.id)}>Delete</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ): (
                                        <p className="text-center text-slate-500 py-8">No weight entries yet.</p>
                                    )}
                                </CardContent>
                            </Card>

                        </div>
                        <div className="lg:col-span-1">
                           <WeightChart logData={log} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
