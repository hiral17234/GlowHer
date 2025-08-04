
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { ChevronLeft, ChevronRight, ChevronsRight, Home } from 'lucide-react';
import { weeklyDevelopment } from '@/lib/pregnancy-data';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WeekDetailPage({ params }: { params: { week: string } }) {
    const router = useRouter();
    const weekNumber = parseInt(params.week, 10);
    const weekData = weeklyDevelopment.find(w => w.week === weekNumber);

    if (!weekData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold">Week not found</h1>
                <Button onClick={() => router.push('/pregnancy-guide')} className="mt-4">
                    Back to Guide
                </Button>
            </div>
        );
    }
    
    const goToWeek = (week: number) => {
        if(week > 0 && week <= 41) {
            router.push(`/pregnancy-guide/${week}`);
        }
    }

    const weekTwoContent = (
        <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30 mt-8">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-slate-800">Highlights This Week</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-slate-700">
                <h3>Are you pregnant this week?</h3>
                <p>You're not pregnant yet, but if you conceive this week, you'll be two weeks pregnant. That's because healthcare providers use your last menstrual period to determine your due date, so technically the first day of your period is also the first day of your pregnancy. Since you ovulate about two weeks into your cycle, conception happens around the time you're two weeks pregnant.</p>
                
                <h3>The best time to conceive</h3>
                <p>You're most fertile during the three days leading up to ovulation. Signs you may be ovulating include changes in your basal body temperature, breast tenderness, mild cramps, and increased vaginal discharge. During ovulation, you may feel many of these symptoms or none at all.</p>
                
                <h3>Detecting ovulation</h3>
                <p>To get pregnant faster, you can use ovulation test strips to figure out the days when sex (or insemination) is most likely to lead to pregnancy.</p>

                <h2 className="font-headline">Baby development at 2 weeks</h2>
                <h3>Getting ready to grow a baby</h3>
                <p>During the past few days, an increase in estrogen and progesterone prompted the lining of your uterus to thicken to support a fertilized egg. At the same time, in your ovaries, eggs have "ripened" in fluid-filled sacs called follicles.</p>
                
                <h3>An egg is released</h3>
                <p>Once you ovulate, an egg erupts from its follicle and is swept from your ovary into a fallopian tube. Ovulation doesn't necessarily occur right in the middle of your cycle. For example, it could happen any time between days 9 and 21 for women with a 28-day cycle.</p>
                
                <h3 className="font-headline">Fertilization</h3>
                <p>During the 24 hours after ovulation, your egg will be fertilized if one healthy sperm manages to swim from your vagina through your cervix, then up through your uterus into your fallopian tube, and penetrate the egg. There are nearly 250 million sperm in an ejaculation, and about 400 sperm survive the 10-hour journey to the egg. But it's usually only one that succeeds in burrowing through its outer membrane.</p>

                <h3>The genes combine</h3>
                <p>In the next 10 to 30 hours, the successful sperm's nucleus merges with the egg's and they combine their genetic material. If the sperm carries a Y chromosome, your baby will be a boy. If it has an X chromosome, you'll conceive a girl. The fertilized egg is called a zygote.</p>

                <h3>Implantation</h3>
                <p>The egg takes three or four days to travel from the fallopian tube to your uterus, dividing into 100 or more identical cells along the way. Once it enters the uterus, it's called a blastocyst. A day or two later, it will begin burrowing into the lush lining of your uterus, where it continues to grow and divide.</p>
                
                <h2 className="font-headline">Pregnancy symptoms during week 2</h2>
                <ul>
                    <li><strong>Slippery cervical mucus:</strong> In the days around ovulation, it'll be clear, slippery, and stretchy – like raw egg whites.</li>
                    <li><strong>Mild cramping:</strong> Some women notice mild cramps or twinges of pain in their abdomen, or a one-sided backache, around the time of ovulation. This is known as mittelschmerz.</li>
                    <li><strong>Increased sex drive:</strong> Your sex drive may rev up and your body odor may be more attractive to men around the time you're fertile.</li>
                    <li><strong>Heightened sense of smell:</strong> Some studies have found that a woman's sense of smell gets stronger near ovulation.</li>
                    <li><strong>Tender breasts:</strong> Hormonal changes around ovulation may make your breasts feel a bit full or sore.</li>
                    <li><strong>Cervical changes:</strong> During ovulation, your cervix is softer, higher, wetter, and more open.</li>
                    <li><strong>A boost in your basal body temperature (BBT):</strong> On the day after you ovulate, it goes up a bit and stays elevated until your next period.</li>
                </ul>

                <h2 className="font-headline">Pregnancy checklist at 2 weeks pregnant</h2>
                <ul>
                    <li><strong>Take your vitamins:</strong> If you haven't yet, start taking a prenatal vitamin with at least 400 micrograms (mcg) of folic acid every day.</li>
                    <li><strong>See your healthcare provider:</strong> It's a good idea to have a preconception checkup to make sure your body is in the best possible shape for baby-making.</li>
                    <li><strong>Consider this blood test:</strong> You and your partner may want to get genetic carrier screening to see whether you carry genes that would put your baby at risk for serious inherited illnesses.</li>
                    <li><strong>Have frequent sex:</strong> Studies show that the highest pregnancy rates are in couples who have sex daily or every other day.</li>
                    <li><strong>Make time for self-care:</strong> Reducing your stress levels can increase your odds of conceiving and having a healthy pregnancy.</li>
                    <li><strong>Prepare your body for pregnancy:</strong> A stronger core prevents back problems as your bump grows, and even shortens your recovery time after childbirth.</li>
                    <li><strong>Know what to avoid:</strong> When you're trying to conceive and newly pregnant, you'll want to steer clear of tobacco, marijuana, illegal drugs, alcohol, and too much caffeine.</li>
                </ul>
            </CardContent>
        </Card>
    );

    return (
        <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
            <header className="container mx-auto px-4 py-6 sticky top-0 bg-white/30 backdrop-blur-md z-40 border-b border-white/30">
                <div className="flex justify-between items-center">
                    <GlowHerLogo />
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => router.push('/pregnancy-guide')}>
                            <Home className="mr-2 h-4 w-4" />
                            Guide
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => goToWeek(weekNumber - 1)} disabled={weekNumber <= 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => goToWeek(weekNumber + 1)} disabled={weekNumber >= 41}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
                 <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="relative">
                                <Image src={weekData.imageUrl} data-ai-hint={weekData.aiHint} alt={`Week ${weekData.week} development`} width={600} height={600} className="object-cover w-full h-full" />
                                <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                                    <h1 className="font-headline text-4xl text-white">{weekData.title}</h1>
                                    <p className="text-white/90 mt-1">{weekData.size}</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <Card className="bg-pink-100/30">
                                    <CardHeader>
                                        <CardTitle className="text-pink-800">Weekly Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-700">{weekData.summary}</p>
                                    </CardContent>
                                </Card>
                                
                                <Tabs defaultValue="development" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4 bg-pink-100/50 text-pink-800">
                                        <TabsTrigger value="development" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">Baby</TabsTrigger>
                                        <TabsTrigger value="body" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">Body</TabsTrigger>
                                        <TabsTrigger value="symptoms" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">Symptoms</TabsTrigger>
                                        <TabsTrigger value="tips" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">Tips</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="development" className="mt-4 prose max-w-none text-slate-700 text-sm max-h-96 overflow-y-auto">
                                        <ul className="space-y-3">
                                            {weekData.development.map((item, index) => <li key={index} className="flex items-start gap-3"><span className="mt-1">{item.emoji}</span><span>{item.text}</span></li>)}
                                        </ul>
                                    </TabsContent>
                                    <TabsContent value="body" className="mt-4 prose max-w-none text-slate-700 text-sm max-h-96 overflow-y-auto">
                                        <ul className="space-y-3">
                                            {weekData.bodyChanges.map((item, index) => <li key={index} className="flex items-start gap-3"><span className="mt-1">{item.emoji}</span><span>{item.text}</span></li>)}
                                        </ul>
                                    </TabsContent>
                                    <TabsContent value="symptoms" className="mt-4 prose max-w-none text-slate-700 text-sm max-h-96 overflow-y-auto">
                                        <ul className="space-y-3">
                                            {weekData.symptoms.map((item, index) => <li key={index} className="flex items-start gap-3"><span className="mt-1">{item.emoji}</span><span>{item.text}</span></li>)}
                                        </ul>
                                    </TabsContent>
                                    <TabsContent value="tips" className="mt-4 prose max-w-none text-slate-700 text-sm max-h-96 overflow-y-auto">
                                        <ul className="space-y-3">
                                            {weekData.tips.map((item, index) => <li key={index} className="flex items-start gap-3"><span className="mt-1">{item.emoji}</span><span>{item.text}</span></li>)}
                                        </ul>
                                    </TabsContent>
                                </Tabs>

                            </div>
                       </div>
                    </CardContent>
                </Card>
                
                <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-pink-800">Your Body's Journey: Week {weekData.week}</CardTitle>
                        <CardDescription>A visual look at how your body might be changing this week.</CardDescription>
                    </CardHeader>
                     <CardContent className="p-0 flex items-center justify-center">
                        <Image src={weekData.motherImageUrl} alt={`Illustration of mother's body at week ${weekData.week}`} width={600} height={600} className="object-contain w-full h-auto max-w-sm" />
                    </CardContent>
                </Card>
                
                {weekNumber === 2 && weekTwoContent}

            </main>
        </div>
    );
}
