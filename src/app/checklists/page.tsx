
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { differenceInDays, subDays } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PregnancyNav } from '@/components/glowher/PregnancyNav';
import { CheckSquare, ListTodo, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const checklists = {
    firstTrimester: {
        title: "First Trimester Checklist",
        items: [
            { id: 't1-prenatal', label: "Start taking a prenatal vitamin with folic acid." },
            { id: 't1-appointment', label: "Schedule your first prenatal appointment (usually around 8 weeks)." },
            { id: 't1-hydrate', label: "Focus on staying hydrated, especially if you have morning sickness." },
            { id: 't1-diet', label: "Review your diet and cut out unsafe foods (e.g., unpasteurized cheese, raw fish)." },
            { id: 't1-habits', label: "Quit smoking, alcohol, and reduce caffeine intake." },
            { id: 't1-insurance', label: "Look into your health insurance coverage for prenatal care and delivery." },
            { id: 't1-rest', label: "Listen to your body and rest when you feel fatigued." },
        ]
    },
    secondTrimester: {
        title: "Second Trimester Checklist",
        items: [
            { id: 't2-announce', label: "Plan how and when to announce your pregnancy, if you haven't already." },
            { id: 't2-anatomy', label: "Schedule your anatomy scan (mid-pregnancy ultrasound)." },
            { id: 't2-maternity', label: "Start shopping for comfortable maternity clothes." },
            { id: 't2-classes', label: "Research and sign up for childbirth education classes." },
            { id: 't2-registry', label: "Start working on your baby registry." },
            { id: 't2-exercise', label: "Establish a safe and regular exercise routine." },
            { id: 't2-moisturize', label: "Moisturize your belly to help with itchy, stretching skin." },
            { id: 't2-babymoon', label: "Plan a babymoon trip if you're interested." },
        ]
    },
    thirdTrimester: {
        title: "Third Trimester Checklist",
        items: [
            { id: 't3-hospital-tour', label: "Take a tour of the hospital or birth center." },
            { id: 't3-pediatrician', label: "Choose a pediatrician for your baby." },
            { id: 't3-kick-count', label: "Start doing daily kick counts (ask your provider for instructions)." },
            { id: 't3-birth-plan', label: "Write and discuss your birth plan with your provider." },
            { id: 't3-hospital-bag', label: "Pack your hospital bag." },
            { id: 't3-car-seat', label: "Install the infant car seat and have it inspected." },
            { id: 't3-nursery', label: "Finish setting up the nursery." },
            { id: 't3-postpartum', label: "Plan for your postpartum recovery (meals, help from family/friends)." },
            { id: 't3-labor-signs', label: "Review the signs of labor with your partner." },
        ]
    }
};

type ChecklistKey = keyof typeof checklists;
const CHECKLIST_STORAGE_KEY = 'glowher-pregnancy-checklists';

export default function ChecklistsPage() {
    const [currentTrimester, setCurrentTrimester] = useState<ChecklistKey | null>(null);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Determine current trimester
        try {
            const pregData = localStorage.getItem('glowher-pregnancy-tracker');
            if (pregData) {
                const { dueDate } = JSON.parse(pregData);
                const startDate = subDays(new Date(dueDate), 280);
                const totalDays = differenceInDays(new Date(), startDate);
                const week = Math.floor(totalDays / 7);
                if (week >= 28) setCurrentTrimester('thirdTrimester');
                else if (week >= 14) setCurrentTrimester('secondTrimester');
                else setCurrentTrimester('firstTrimester');
            }
        } catch (e) {
            console.error("Error getting pregnancy data", e);
        }

        // Load checked items from storage
        try {
            const savedCheckedItems = localStorage.getItem(CHECKLIST_STORAGE_KEY);
            if(savedCheckedItems) {
                setCheckedItems(JSON.parse(savedCheckedItems));
            }
        } catch (e) {
             console.error("Error loading checklist data", e);
        }
        
        setLoading(false);
    }, []);

    const handleCheckChange = (id: string, isChecked: boolean) => {
        const newCheckedItems = { ...checkedItems, [id]: isChecked };
        setCheckedItems(newCheckedItems);
        try {
            localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(newCheckedItems));
        } catch (e) {
            console.error("Error saving checklist data", e);
        }
    };
    
    const renderChecklist = (key: ChecklistKey) => {
        const checklist = checklists[key];
        const totalItems = checklist.items.length;
        const completedItems = checklist.items.filter(item => checkedItems[item.id]).length;
        const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        return (
            <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-2xl text-slate-800 flex items-center gap-2">
                                <ListTodo className="h-6 w-6 text-pink-500" />
                                {checklist.title}
                            </CardTitle>
                            <CardDescription className="text-slate-600">
                                {completedItems} of {totalItems} tasks completed.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 text-pink-600 font-bold">
                           <CheckSquare className="h-5 w-5" />
                           <span>{Math.round(progress)}%</span>
                        </div>
                    </div>
                    <Progress value={progress} className="w-full mt-4 h-2 [&>span]:bg-pink-500" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {checklist.items.map(item => (
                        <div key={item.id} className={cn(
                            "flex items-center space-x-3 p-3 rounded-md transition-all",
                            checkedItems[item.id] ? "bg-green-100/50 text-slate-500 line-through" : "bg-white/30"
                        )}>
                            <Checkbox
                                id={item.id}
                                checked={!!checkedItems[item.id]}
                                onCheckedChange={(checked) => handleCheckChange(item.id, Boolean(checked))}
                                className="data-[state=checked]:bg-pink-500"
                            />
                            <Label htmlFor={item.id} className="text-base font-medium cursor-pointer">
                                {item.label}
                            </Label>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if(loading) {
        return (
            <div className="relative flex min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
                <PregnancyNav />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-pink-500"/>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
            <PregnancyNav />

            <div className="flex-1 flex flex-col">
                <header className="container mx-auto px-4 py-4 sticky top-0 bg-white/30 backdrop-blur-md z-40 border-b border-white/30 hidden md:block">
                    <div className="flex items-center justify-center">
                        <h1 className="font-headline text-3xl font-bold text-slate-900">
                            Pregnancy Checklists
                        </h1>
                    </div>
                </header>

                <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
                   <div className="text-center mb-12 mt-12 md:mt-0">
                        <h1 className="font-headline text-4xl md:text-5xl font-bold text-slate-900">Pregnancy Checklists</h1>
                   </div>
                   <div className="max-w-4xl mx-auto space-y-8">
                    {currentTrimester ? (
                        <>
                            {renderChecklist(currentTrimester)}
                            {Object.keys(checklists).filter(key => key !== currentTrimester).map(key => (
                                <div key={key} className="opacity-60">
                                    {renderChecklist(key as ChecklistKey)}
                                </div>
                            ))}
                        </>
                    ) : (
                         <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
                            <CardHeader>
                                <CardTitle>No Pregnancy Data Found</CardTitle>
                                <CardDescription>Please set your due date in the tracker to see your personalized checklists.</CardDescription>
                            </CardHeader>
                         </Card>
                    )}
                   </div>
                </main>
            </div>
        </div>
    );
}
