
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, ChevronLeft, BookText, History, ImageIcon, PlusCircle, X } from 'lucide-react';
import { RichTextEditor } from '@/components/glowher/RichTextEditor';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const themes = [
    { name: 'None', url: '' },
    { name: 'Theme 1', url: 'https://i.pinimg.com/736x/b7/c8/55/b7c855729051d9b0c53f9d8ac14f44e5.jpg' },
    { name: 'Theme 2', url: 'https://i.pinimg.com/736x/af/eb/54/afeb548a9f2ea67f3114a8ad8cd00f70.jpg' },
    { name: 'Theme 3', url: 'https://i.pinimg.com/736x/bb/86/15/bb8615133e2463ad2c9ac0d787f71fa9.jpg' },
    { name: 'Theme 4', url: 'https://i.pinimg.com/736x/20/44/87/204487aa4ed5b8ca3901600ff4802639.jpg' },
    { name: 'Theme 5', url: 'https://i.pinimg.com/736x/48/90/bd/4890bd90b28f004d7dd8b422e436ade7.jpg' },
    { name: 'Theme 6', url: 'https://i.pinimg.com/736x/85/33/00/853300d5833ad64bb1973764ceca7d63.jpg' },
    { name: 'Theme 7', url: 'https://i.pinimg.com/736x/15/ea/4a/15ea4a490a6a162a02c03745a1ff567b.jpg' },
    { name: 'Theme 8', url: 'https://i.pinimg.com/736x/c9/3c/90/c93c90c8be46f81e413eee311036c58d.jpg' },
    { name: 'Theme 9', url: 'https://i.pinimg.com/736x/cd/4b/90/cd4b901784885e7a2e0d577ab99500f2.jpg' },
    { name: 'Theme 10', url: 'https://i.pinimg.com/736x/d4/9f/3d/d49f3d3546a8e3f7ff584331dbd56c0b.jpg' },
    { name: 'Theme 11', url: 'https://i.pinimg.com/originals/f7/52/0b/f7520b5d577dedee57e9d6d511c7d4f1.png' },
];

const FormSchema = z.object({
  logDate: z.date({
    required_error: "A date is required.",
  }),
  notes: z.string().max(2000, { message: "Notes must be 2000 characters or less." }).optional(),
  themeUrl: z.string().optional(),
  imageUrl: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

const LOCAL_STORAGE_KEY_PREFIX = 'glowher-pregnancy-journal-';

export default function PregnancyJournalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      logDate: new Date(),
      notes: "",
      themeUrl: "",
      imageUrl: "",
    },
  });

  const notesValue = form.watch("notes");
  const logDate = form.watch("logDate");
  const selectedTheme = form.watch("themeUrl");

  useEffect(() => {
    if (isSameDay(logDate, currentDate)) return;

    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(logDate, 'yyyy-MM-dd')}`;
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        parsedData.logDate = new Date(parsedData.logDate);
        form.reset(parsedData);
        if (parsedData.imageUrl) {
            setImagePreview(parsedData.imageUrl);
        } else {
            setImagePreview(null);
        }
      } else {
        form.reset({
          logDate: logDate,
          notes: "",
          themeUrl: "",
          imageUrl: "",
        });
        setImagePreview(null);
      }
      setCurrentDate(logDate);
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
  }, [logDate, form, currentDate]);

  function onSubmit(data: FormData) {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(data.logDate, 'yyyy-MM-dd')}`;
    try {
        localStorage.setItem(key, JSON.stringify(data));
        toast({
            title: "Journal Entry Saved!",
            description: "Your entry for this day has been successfully saved.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error Saving Entry",
            description: "Could not save your entry. Please try again."
        });
        console.error("Failed to save to localStorage", error);
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const dataUrl = readerEvent.target?.result as string;
            form.setValue('imageUrl', dataUrl);
            setImagePreview(dataUrl);
        };
        reader.readAsDataURL(file);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-6 z-10">
        <div className="flex justify-between items-center">
          <GlowHerLogo />
          <Button variant="ghost" onClick={() => router.push('/pregnancy-tracker')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Tracker
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Pregnancy Journal</h1>
            <p className="mt-2 text-lg text-muted-foreground">A private space for your thoughts, questions, and feelings.</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>New Journal Entry</CardTitle>
                    <Button variant="outline" onClick={() => router.push('/pregnancy-journal-history')}>
                        <History className="mr-2 h-4 w-4" />
                        View History
                    </Button>
                </div>
                <CardDescription>
                    Use this space to jot down notes for your doctor, track feelings, or record special moments.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="logDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-lg font-semibold">Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={"w-[240px] pl-3 text-left font-normal"}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                        control={form.control}
                        name="themeUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg font-semibold flex items-center gap-2">
                                <ImageIcon /> Journal Theme
                            </FormLabel>
                            <FormControl>
                                <div className="flex flex-wrap gap-4 pt-2">
                                    {themes.map(theme => (
                                        <button
                                            key={theme.name}
                                            type="button"
                                            className={cn(
                                                "w-20 h-14 rounded-lg border-2 overflow-hidden transition-all duration-200 transform hover:scale-105",
                                                field.value === theme.url ? "border-primary ring-2 ring-primary/50" : "border-muted"
                                            )}
                                            onClick={() => field.onChange(theme.url)}
                                        >
                                            {theme.url ? (
                                                <Image src={theme.url} alt={theme.name} width={80} height={56} className="object-cover w-full h-full"/>
                                            ) : (
                                                <div className="w-full h-full bg-muted flex items-center justify-center text-sm">None</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          <BookText /> Journal Entry
                        </FormLabel>
                        <FormControl>
                            <RichTextEditor
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="E.g., Asked Dr. Smith about prenatal vitamins. Felt the first kick today! Feeling a bit anxious about the nursery..."
                                themeUrl={selectedTheme}
                            />
                        </FormControl>
                        <FormDescription className="text-right">
                          {notesValue?.length || 0} / 2000
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                   <FormItem>
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                            <ImageIcon /> Attach an Image
                        </FormLabel>
                        <FormControl>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                />
                                {!imagePreview ? (
                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Image
                                    </Button>
                                ) : (
                                    <div className="relative w-48 h-48">
                                        <Image src={imagePreview} alt="Preview" layout="fill" className="object-cover rounded-md border" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-7 w-7"
                                            onClick={() => {
                                                setImagePreview(null);
                                                form.setValue('imageUrl', '');
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </FormControl>
                    </FormItem>

                  <Button type="submit" size="lg" className="w-full">Save Entry</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

    
