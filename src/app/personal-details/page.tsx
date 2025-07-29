"use client";

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  dob: z.date({ required_error: "A date of birth is required." }),
});

export default function PersonalDetailsPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // For now, we'll just log the values.
    console.log(values);
    // Later, you could save this to a database or local storage.
    alert('Details saved!');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="container mx-auto px-4 py-6 z-10">
            <div className="flex justify-between items-center">
                <GlowHerLogo />
                <Button variant="ghost" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Tell Us About Yourself</CardTitle>
                        <CardDescription>This information helps us personalize your experience.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dob"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of Birth</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-[240px] pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" size="lg">Save Details</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
