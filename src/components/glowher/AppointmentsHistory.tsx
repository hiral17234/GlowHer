
"use client";

import { useState } from 'react';
import { format, isFuture, isPast, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Stethoscope, BookText, Trash2, ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Appointment } from '@/app/appointments/page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from 'next/image';

interface AppointmentsHistoryProps {
    appointments: Appointment[];
    setAppointments: (appointments: Appointment[]) => void;
}

export function AppointmentsHistory({ appointments, setAppointments }: AppointmentsHistoryProps) {

  const upcomingAppointments = appointments
    .filter(a => isFuture(parseISO(a.date.toISOString())))
    .sort((a, b) => parseISO(a.date.toISOString()).getTime() - parseISO(b.date.toISOString()).getTime());

  const pastAppointments = appointments
    .filter(a => isPast(parseISO(a.date.toISOString())))
    .sort((a, b) => parseISO(b.date.toISOString()).getTime() - parseISO(a.date.toISOString()).getTime());

  const handleDelete = (id: string) => {
    const updatedAppointments = appointments.filter(a => a.id !== id);
    setAppointments(updatedAppointments);
  };


  return (
    <Card className="shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle>Your Appointments</CardTitle>
        <CardDescription className="text-white/80">A list of your upcoming and past prenatal visits.</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-white/70">
            <p>You have no appointments scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-headline text-xl mb-4 text-pink-400">Upcoming Appointments</h3>
              {upcomingAppointments.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {upcomingAppointments.map((appt) => (
                    <AccordionItem key={appt.id} value={appt.id} className="border-b border-white/20">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex justify-between items-center w-full pr-4">
                           <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-left">
                                <span className="font-bold text-base">{appt.purpose}</span>
                                <Badge variant="default" className="bg-pink-500 w-fit">{format(appt.date, 'PPP')}</Badge>
                           </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 space-y-3 bg-black/20 rounded-b-md px-4">
                        <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-slate-400" /> <strong>Time:</strong> {appt.time}</div>
                        {appt.doctor && <div className="flex items-center gap-2 text-sm"><Stethoscope className="h-4 w-4 text-slate-400" /> <strong>Doctor:</strong> {appt.doctor}</div>}
                        {appt.location && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-slate-400" /> <strong>Location:</strong> {appt.location}</div>}
                        {appt.notes && <div className="flex items-start gap-2 text-sm"><BookText className="h-4 w-4 mt-1 flex-shrink-0 text-slate-400" /> <div><strong>Notes:</strong><p className="whitespace-pre-wrap">{appt.notes}</p></div></div>}
                        {appt.imageUrl && (
                             <div className="flex items-start gap-2 text-sm"><ImageIcon className="h-4 w-4 mt-1 flex-shrink-0 text-slate-400" /> 
                                <div><strong>Photo:</strong>
                                    <div className="mt-2">
                                        <Image src={appt.imageUrl} alt="Appointment image" width={200} height={200} className="rounded-md border object-cover"/>
                                    </div>
                                </div>
                            </div>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="mt-2">
                                    <Trash2 className="mr-2 h-4 w-4"/> Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete this appointment. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(appt.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-sm text-white/70">No upcoming appointments.</p>
              )}
            </div>

            <div>
              <h3 className="font-headline text-xl mb-4 text-slate-400">Past Appointments</h3>
              {pastAppointments.length > 0 ? (
                 <Accordion type="single" collapsible className="w-full">
                  {pastAppointments.map((appt) => (
                    <AccordionItem key={appt.id} value={appt.id} className="border-b border-white/20 opacity-70">
                      <AccordionTrigger className="hover:no-underline">
                         <div className="flex justify-between items-center w-full pr-4">
                           <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-left">
                                <span className="font-semibold text-base">{appt.purpose}</span>
                                <Badge variant="secondary">{format(appt.date, 'PPP')}</Badge>
                           </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 space-y-3 bg-black/20 rounded-b-md px-4">
                        <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-slate-400" /> <strong>Time:</strong> {appt.time}</div>
                        {appt.doctor && <div className="flex items-center gap-2 text-sm"><Stethoscope className="h-4 w-4 text-slate-400" /> <strong>Doctor:</strong> {appt.doctor}</div>}
                        {appt.location && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-slate-400" /> <strong>Location:</strong> {appt.location}</div>}
                        {appt.notes && <div className="flex items-start gap-2 text-sm"><BookText className="h-4 w-4 mt-1 flex-shrink-0 text-slate-400" /> <div><strong>Notes:</strong><p className="whitespace-pre-wrap">{appt.notes}</p></div></div>}
                         {appt.imageUrl && (
                             <div className="flex items-start gap-2 text-sm"><ImageIcon className="h-4 w-4 mt-1 flex-shrink-0 text-slate-400" /> 
                                <div><strong>Photo:</strong>
                                    <div className="mt-2">
                                        <Image src={appt.imageUrl} alt="Appointment image" width={200} height={200} className="rounded-md border object-cover"/>
                                    </div>
                                </div>
                            </div>
                        )}
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="mt-2">
                                    <Trash2 className="mr-2 h-4 w-4"/> Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete this appointment. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(appt.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-sm text-white/70">No past appointments.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
