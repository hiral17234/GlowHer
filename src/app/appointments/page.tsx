
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, subDays, startOfDay, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, ChevronLeft, BookText, PlusCircle, Clock, Image as ImageIcon, X } from 'lucide-react';
import { AppointmentsHistory } from '@/components/glowher/AppointmentsHistory';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import Image from 'next/image';


const appointmentFormSchema = z.object({
  date: z.date({
    required_error: "An appointment date is required.",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please use HH:mm format."),
  doctor: z.string().min(1, "Doctor's name is required.").optional(),
  location: z.string().optional(),
  purpose: z.string().min(1, "Purpose of visit is required."),
  notes: z.string().max(500).optional(),
  imageUrl: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

export type Appointment = AppointmentFormData & { id: string };

const APPOINTMENTS_KEY = 'glowher-appointments';


export default function AppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [historyKey, setHistoryKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      purpose: "",
      notes: "",
      doctor: "",
      location: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    try {
      const savedAppointments = localStorage.getItem(APPOINTMENTS_KEY);
      if (savedAppointments) {
        setAppointments(JSON.parse(savedAppointments).map((appt: any) => ({
            ...appt,
            date: parseISO(appt.date)
        })));
      }
    } catch(e) {
      console.error("Failed to load appointments:", e);
    }
  }, []);

  const saveAppointments = (updatedAppointments: Appointment[]) => {
    try {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);
      setHistoryKey(prev => prev + 1);
    } catch (e) {
      console.error("Failed to save appointments:", e);
      toast({ variant: 'destructive', title: 'Error saving appointment.' });
    }
  }

  function onSubmit(data: AppointmentFormData) {
    const newAppointment: Appointment = {
      ...data,
      id: new Date().toISOString(),
    };
    
    const updatedAppointments = [...appointments, newAppointment];
    saveAppointments(updatedAppointments);
    
    toast({
      title: "Appointment Saved!",
      description: `Your appointment for ${data.purpose} has been added.`,
    });
    form.reset({
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      purpose: "",
      notes: "",
      doctor: "",
      location: "",
      imageUrl: "",
    });
    setImagePreview(null);
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
    <div className="flex flex-col min-h-screen bg-cover bg-center" style={{backgroundImage: "url('https://i.pinimg.com/1200x/22/56/2b/22562ba3f7c7b7c70ee31d9757b3afb5.jpg')"}}>
       <div className="absolute inset-0 bg-black/30 z-0"/>
      <header className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center text-white">
          <GlowHerLogo />
          <Button variant="ghost" onClick={() => router.push('/pregnancy-tracker')} className="text-white hover:bg-white/10 hover:text-white">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Tracker
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center text-white">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Appointments</h1>
            <p className="mt-2 text-lg text-white/80">Keep track of your prenatal visits and important dates.</p>
          </div>

          <Card className="shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PlusCircle className="text-pink-400"/> Add a New Appointment</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="font-semibold text-white">Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn("w-full justify-start text-left font-normal bg-white/10 border-white/20 hover:bg-white/20 text-white", !field.value && "text-slate-400")}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < subDays(new Date(), 1)}
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
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold text-white">Time</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                                    <Input type="time" {...field} className="pl-9 bg-white/10 border-white/20 text-white"/>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-white">Purpose of Visit</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., 20-week anatomy scan" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="doctor"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold text-white">Doctor (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Dr. Smith" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold text-white">Location (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., General Hospital" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold flex items-center gap-2 text-white">
                          <BookText /> Questions or Notes
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="e.g., Ask about exercise recommendations, discuss birth plan..."
                                className="resize-y bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel className="font-semibold flex items-center gap-2 text-white">
                        <ImageIcon /> Attach a Photo (Optional)
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
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-transparent hover:bg-white/10 border-white/30 text-white">
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

                  <Button type="submit" size="lg" className="w-full bg-pink-500 hover:bg-pink-600 text-white">Save Appointment</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <AppointmentsHistory key={historyKey} appointments={appointments} setAppointments={saveAppointments} />

        </div>
      </main>
    </div>
  );
}
