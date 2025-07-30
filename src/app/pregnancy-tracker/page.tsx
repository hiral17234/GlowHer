
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, differenceInDays, startOfDay, addWeeks, subDays, differenceInWeeks } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, ChevronLeft, Info, Baby, Heart, Milestone, BarChart, BookOpen, Lightbulb, ClipboardPlus, Video, CheckSquare, Square, ThumbsUp, PartyPopper } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';


const pregnancyFormSchema = z.object({
  calculationMethod: z.enum(['dueDate', 'lmp']),
  date: z.date({ required_error: "A date is required." }),
});

const symptomFormSchema = z.object({
    symptoms: z.array(z.string()).optional(),
    notes: z.string().max(500, "Notes must be 500 characters or less.").optional(),
});


type PregnancyFormData = z.infer<typeof pregnancyFormSchema>;
type SymptomFormData = z.infer<typeof symptomFormSchema>;


type PregnancyDetails = {
  dueDate: Date;
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  daysLeft: number;
  trimester: number;
};

const pregnancySymptoms = [
    { id: 'nausea', label: 'Nausea' },
    { id: 'fatigue', label: 'Fatigue' },
    { id: 'backPain', label: 'Back Pain' },
    { id: 'swelling', label: 'Swelling' },
    { id: 'cravingsAversions', label: 'Food Cravings/Aversions' },
];

const PREGNANCY_TRACKER_KEY = 'glowher-pregnancy-tracker';
const PREGNANCY_SYMPTOM_LOG_PREFIX = 'glowher-pregnancy-symptom-';


// Expanded fetal development data
const weeklyDevelopment = [
    { week: 0, title: "Getting Started", size: "", development: "", bodyChanges: "", symptoms: "", tips: "", imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg", aiHint: "pregnancy test" },
    {
        week: 1,
        title: "Week 1: The First Step",
        size: "Pregnancy is calculated from your LMP, so you're not technically pregnant yet.",
        development: "🗓️ This week is technically your menstrual period, the first day of which marks the start of your pregnancy cycle.\n\n🥚 Your body sheds last month's uterine lining, making way for a new cycle.\n\n🌿 A new follicle, containing an egg, begins to mature in one of your ovaries.\n\n hormonal baseline is established, with low levels of estrogen and progesterone.\n\n🌸 The pituitary gland starts to release Follicle-Stimulating Hormone (FSH) to encourage follicular growth.\n\n⏳ Your body is preparing for ovulation, which will occur in about two weeks.\n\n🧱 The foundation for a potential pregnancy is being laid, even before conception occurs.\n\n🔄 This is the very beginning of a 280-day journey, starting from a biological reset.",
        bodyChanges: "🩸 You're experiencing normal menstrual bleeding as the uterine lining is shed.\n\n📉 Hormone levels are at their lowest point, which can affect energy and mood.\n\n cramps or pelvic discomfort are common as the uterus contracts.\n\n💧 You might experience water retention and bloating.\n\n🌡️ Your basal body temperature is at its lowest point in the cycle.\n\n tired or having lower energy is a common experience during this phase.\n\n🧠 Hormonal shifts can sometimes lead to mood changes or irritability.\n\nCLEANSE Your body is essentially 'cleaning house' to prepare for a fresh start.",
        symptoms: " Cramping in the lower abdomen or back is very common.\n\n🌬️ Bloating and a feeling of heaviness are frequently reported.\n\n🍈 Breast tenderness or soreness can occur due to hormonal fluctuations.\n\n😴 Fatigue and lower energy levels are typical during menstruation.\n\n🤕 Headaches, particularly hormonal migraines, can be triggered.\n\n🍔 You might experience cravings for specific foods, like salty snacks or chocolate.\n\n🎭 Mood swings, from sadness to irritability, are possible.\n\n💩 Changes in bowel habits, such as diarrhea or constipation, can happen.",
        tips: "💊 Begin taking a prenatal vitamin containing at least 400 mcg of folic acid now.\n\n🥗 Focus on a nutrient-dense diet rich in iron (leafy greens, red meat) to replenish what's lost during your period.\n\n💧 Stay well-hydrated with water and herbal teas to help with cramps and bloating.\n\n🏃‍♀️ Continue with gentle exercise like walking or stretching, which can help alleviate cramps.\n\n🚭 Eliminate alcohol, smoking, and recreational drugs, as these can harm a developing embryo.\n\n☕ Reduce caffeine intake to improve your chances of conception and for a healthier pregnancy.\n\n👩‍⚕️ Schedule a preconception check-up with your doctor to discuss your health and any concerns.\n\n🧘‍♀️ Pay attention to your body and rest when you feel tired; this is a time for self-care.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "vitamins supplements"
    },
    {
        week: 2,
        title: "Week 2: Preparing for Ovulation",
        size: "An egg is maturing in your ovary, preparing for its grand exit.",
        development: "🥚 A dominant follicle in your ovary is now maturing, preparing to release an egg.\n\n✨ Your uterine lining (endometrium) is thickening, creating a rich, blood-vessel-filled bed for a fertilized egg.\n\n📈 Estrogen levels are rising rapidly, signaling to your body that ovulation is approaching.\n\n💧 Cervical mucus becomes clearer, more slippery, and stretchy—resembling egg whites—to help sperm travel.\n\n hormonal surge will trigger the release of Luteinizing Hormone (LH), the final signal for ovulation.\n\n OVULATION is imminent, typically occurring at the end of this week or the beginning of the next.\n\n⏳ This period is your most fertile window, the optimal time for conception.\n\n🌟 Your body is creating the perfect environment for fertilization to occur.",
        bodyChanges: "⚡️ You might feel a significant boost in energy and mood thanks to rising estrogen.\n\n😊 Skin may become clearer and you might feel more attractive—a biological trick to encourage mating.\n\n LIBIDO often peaks during this fertile window.\n\n💧 You'll notice a marked change in cervical mucus, a key indicator of peak fertility.\n\n🍈 Some experience slight breast tenderness as hormones shift.\n\n💥 A small number of women might feel a slight twinge of pain on one side as the ovary prepares to release the egg.\n\n👃 Your sense of smell may become more acute.\n\n🗣️ You may feel more social, confident, and communicative.",
        symptoms: "🤩 Increased energy and a general sense of well-being are common.\n\n💧 Watery, stretchy, clear cervical mucus is the most prominent sign.\n\n sex drive is a frequent symptom of this fertile phase.\n\n✨ Some report feeling a 'glow' as skin improves.\n\n🤏 Mild, one-sided pelvic cramping (mittelschmerz) can occur around the time of ovulation.\n\n🌬️ Minor bloating can still be present.\n\n💕 You may feel more emotionally connected and affectionate.\n\n🌟 Overall, this week is often considered one of the most physically and emotionally positive weeks of the cycle.",
        tips: "💞 This is the prime time to try to conceive if that is your goal.\n\n TRACK Ovulation predictor kits (OPKs) can help you pinpoint the LH surge that precedes ovulation.\n\n🩺 Basal body temperature (BBT) tracking will show a slight dip before ovulation and a spike after.\n\n🥗 Continue eating a healthy diet, focusing on whole foods, lean proteins, and healthy fats.\n\n🏃‍♀️ Enjoy your higher energy levels with more vigorous workouts.\n\n🍆 Sperm-friendly lubricants can be helpful if needed; check labels to ensure they're appropriate.\n\n🧘‍♀️ Maintain a healthy lifestyle, as both partners' health can impact conception.\n\n💑 Enjoy this time of connection with your partner.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "calendar dates"
    },
    {
        week: 3,
        title: "Week 3: Fertilization & Implantation",
        size: "The fertilized egg, or blastocyst, is a microscopic ball of cells.",
        development: "🎉 Fertilization! A single sperm penetrates the mature egg, usually in the fallopian tube, creating a zygote.\n\n🧬 The genetic material from the egg and sperm combine to create a unique blueprint of 46 chromosomes.\n\n➗ The zygote begins to divide rapidly, becoming a morula (a solid ball of cells) and then a blastocyst (a hollow ball).\n\n🚗 This tiny blastocyst travels down the fallopian tube towards the uterus, a journey of several days.\n\n🏠 Implantation occurs: the blastocyst burrows into the rich uterine lining around the end of this week.\n\n Inner cells will form the embryo, while the outer cells will form the placenta.\n\n🤫 The pregnancy hormone, hCG (human chorionic gonadotropin), begins to be produced by the newly-implanted cells.\n\n🔐 The cervix forms a mucus plug to seal off the uterus and protect the pregnancy.",
        bodyChanges: "🤫 Externally, you won't notice any changes, as all the action is happening on a microscopic level.\n\n📈 Internally, the hormone progesterone begins to rise, signaled by the newly forming placenta.\n\n🌸 Some women (about 25%) experience light implantation spotting or cramping as the blastocyst embeds in the uterus.\n\n🌡️ Your basal body temperature will remain elevated after ovulation.\n\n🍈 You might experience very early breast tenderness due to rising hormones.\n\n😴 A wave of fatigue might hit as your body dedicates enormous energy to the implantation process.\n\n👃 A heightened sense of smell can be one of the very first clues of pregnancy for some.\n\n✨ Your immune system slightly lowers its defenses to prevent your body from rejecting the 'foreign' embryo.",
        symptoms: "🌸 Light spotting (pink or brown) for a day or two could be implantation bleeding.\n\n🤏 Mild, short-lived cramping, different from period cramps, may also signal implantation.\n\n😴 Early-onset fatigue is a very common first sign.\n\n🍈 Breast soreness, tenderness, or a feeling of heaviness may begin.\n\n🤢 A need to urinate more frequently can start, even this early.\n\n👃 Aversions to certain smells or a metallic taste in the mouth can occur.\n\n🤷‍♀️ Many women feel no symptoms at all during this week and are completely unaware they are pregnant.\n\n🤔 A feeling of 'just knowing' or intuition is something many mothers report.",
        tips: "🧘‍♀️ Continue to 'act pregnant'—avoid alcohol, smoking, and high-mercury fish.\n\n💊 Keep taking your prenatal vitamin every day; folic acid is critical for neural tube development which happens soon.\n\n❌ It is still too early for a home pregnancy test to give an accurate positive result.\n\n💧 Drink plenty of water and maintain a balanced, healthy diet.\n\n🏃‍♀️ Gentle exercise is fine, but avoid starting any new, strenuous workout routines.\n\n☕ Limit caffeine intake to under 200mg per day (about one 12-oz cup of coffee).\n\n😌 Try to manage stress with relaxation techniques like deep breathing or meditation.\n\n🗓️ Mark down the date of your last period; you will need it for your first doctor's appointment.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "cells microscope"
    },
    {
        week: 4,
        title: "Week 4: A Positive Test!",
        size: "Your baby is the size of a poppy seed.",
        development: "🌱 The implanted blastocyst is now officially an embryo.\n\n Layers of cells are developing: the endoderm (inner layer), mesoderm (middle), and ectoderm (outer).\n\n🧠 The ectoderm will form the nervous system, brain, skin, and hair.\n\n❤️ The mesoderm will become the heart, circulatory system, bones, and muscles.\n\n🍞 The endoderm will develop into the digestive system, liver, and lungs.\n\n🔗 The placenta is developing rapidly, burrowing into the uterine wall to establish a strong connection.\n\n💧 The amniotic sac is forming around the embryo, filling with fluid to cushion it.\n\n yolk sac provides initial nourishment until the placenta is fully functional.",
        bodyChanges: "‼️ The most significant sign this week is usually a missed menstrual period.\n\n📈 hCG levels are now rising exponentially, doubling every 48-72 hours.\n\n🍈 Breasts are likely to feel sore, tingly, and noticeably heavier or fuller.\n\n AREOLAS (the area around the nipple) may start to darken.\n\n😴 Fatigue can be profound as your body directs a massive amount of resources to support the new pregnancy.\n\n🌬️ You might feel bloated, similar to how you might feel right before your period.\n\n🌡️ Your basal body temperature remains high.\n\n🚽 The growing uterus, though still tiny, puts pressure on your bladder, increasing the need to urinate.",
        symptoms: "😴 Extreme fatigue is one of the most common and earliest symptoms.\n\n🍈 Sore, swollen, or tender breasts are very typical.\n\n🤢 Mild nausea, or 'morning sickness,' can begin to appear at any time of day.\n\n🌬️ Bloating and a feeling of abdominal fullness or mild cramping are normal.\n\n🎭 Mood swings, similar to PMS, can be triggered by the rapid hormonal shifts.\n\n🤕 A dull backache can be an early symptom.\n\n👃 A heightened sense of smell and taste changes (like a metallic taste) may continue or start now.\n\n➕ A home pregnancy test should now be able to detect hCG and show a positive result!",
        tips: "➕ Take a home pregnancy test! For the most accurate result, use your first-morning urine, which has the highest concentration of hCG.\n\n👩‍⚕️ Once you have a positive test, call your doctor or midwife to schedule your first prenatal appointment (usually around week 8).\n\n💊 Continue taking your prenatal vitamin without fail.\n\n💧 Stay well-hydrated, as your blood volume is starting to increase.\n\n🥨 To combat nausea, try eating small, frequent meals and keeping plain crackers by your bed.\n\n❤️ Share the news with your partner and decide together when you'll tell family and friends.\n\n📖 Start a pregnancy journal to document your thoughts, feelings, and physical changes.\n\n✅ Confirm your result with a second test if you're unsure, or ask your doctor for a blood test.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "pregnancy test positive"
    },
    {
        week: 5,
        title: "Week 5: The Heart Begins to Beat",
        size: "Your baby is the size of an apple seed.",
        development: "❤️ The baby's heart, a simple tube-like structure, begins to form and beat, circulating blood.\n\n🧠 The neural tube, which will become the brain and spinal cord, continues to develop and close.\n\nSystem Foundations: The groundwork for all major organ systems is being laid.\n\n🔗 The primitive placenta and umbilical cord are now delivering nourishment and oxygen.\n\n📏 The embryo is C-shaped and has a noticeable tail, which will disappear later.\n\n👀 Optic vesicles, which will later form the eyes, begin to emerge.\n\n👂 Rudimentary structures for the ears are also beginning to form.\n\n🌱 The embryo is growing at an astonishing rate, now clearly visible on an ultrasound as a tiny sac.",
        bodyChanges: "📈 Hormone levels, especially hCG and progesterone, are surging, driving most of your symptoms.\n\n😴 The fatigue can be overwhelming as your body builds the placenta—an entirely new organ.\n\n🚽 Your uterus is growing, putting more pressure on your bladder and sending you to the bathroom more often.\n\n💧 Your kidneys are becoming more efficient at processing waste for both you and the embryo.\n\n🍈 Breast changes continue, with more tenderness, growth, and darkening of the areolas.\n\n✨ Increased blood volume can sometimes lead to the 'pregnancy glow' or, conversely, acne flare-ups.\n\n🤰 Your belly won't be showing yet, but you might feel bloated or notice your pants are a bit snug.\n\n❤️ Your own heart is beginning to work harder, pumping more blood to support the pregnancy.",
        symptoms: "🤢 Morning sickness may ramp up. Despite its name, it can strike at any time of day or night.\n\n😴 Debilitating fatigue is extremely common. You may feel like you could sleep all day.\n\n🍈 Very sore, heavy, and sensitive breasts are a hallmark of this stage.\n\n🚽 Frequent urination is a classic early symptom that often starts around now.\n\n🍔 Food cravings or, more commonly, food aversions, may develop. You might suddenly hate a food you used to love.\n\n👃 A super-sensitive sense of smell can trigger nausea.\n\n💧 You might notice an increase in saliva, sometimes accompanied by a metallic taste.\n\n🎭 Mood swings can be intense, leaving you feeling weepy one moment and happy the next.",
        tips: "🥨 To manage nausea, eat small, frequent meals high in protein and carbs. Avoid letting your stomach get empty.\n\n💤 Give in to the fatigue. Rest, nap, and go to bed earlier. Your body is doing incredible work.\n\n🧡 Try ginger (tea, chews) or vitamin B6 (after consulting your doctor) for nausea.\n\n💧 Stay hydrated, especially if you're dealing with morning sickness. Sip small amounts of water or electrolyte drinks throughout the day.\n\n🏃‍♀️ Light exercise like walking can help with energy levels and mood, but don't push yourself.\n\n👩‍⚕️ Your first prenatal visit is likely a few weeks away. Use this time to write down any questions you have.\n\n🤫 You may still be keeping the news to yourself. Find a trusted friend or your partner to confide in for support.\n\n💑 Involve your partner in what you're experiencing; it can help them feel connected.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "heartbeat wave"
    },
    {
        week: 6,
        title: "Week 6: Facial Features Form",
        size: "Your baby is the size of a lentil.",
        development: "🙂 Basic facial features are beginning to form. Dark spots mark where the eyes and nostrils will be.\n\n👂 Small depressions on the sides of the head indicate where the ears are developing.\n\n🧠 The brain is dividing into its major sections (forebrain, midbrain, hindbrain).\n\n❤️ The heart is now beating with a more regular rhythm, around 100-160 times per minute.\n\n👋 Tiny buds are sprouting from the torso that will grow into arms and legs.\n\n👄 The jaw and mouth are starting to take shape.\n\n internal organs like the liver, lungs, and kidneys are continuing their early development.\n\n ultrasound this week might be able to detect the heartbeat.",
        bodyChanges: "📈 hCG levels are still doubling every couple of days, likely intensifying your symptoms.\n\n🍈 Your breasts may continue to grow and feel even more sore and tingly.\n\n💧 Your blood volume is increasing to efficiently supply the embryo, contributing to fatigue and the need to urinate.\n\n🤰 While you don't look pregnant on the outside, your uterus is expanding to accommodate the growing embryo.\n\n✨ Your skin might be unpredictable—some get the 'glow,' others get acne.\n\n👖 Your regular pants might feel tight around the waist due to bloating.\n\n🔥 The relaxed muscle tone (thanks to progesterone) can affect your digestive system, leading to gas and bloating.\n\n⚖️ Your weight may not have changed much, or you may have even lost a pound or two from nausea.",
        symptoms: "😖 Nausea and vomiting (morning sickness) are often at their peak around this time.\n\n😴 Fatigue continues to be a major player. You might feel completely drained of energy.\n\n🍔 Strong food aversions and cravings can be very pronounced. The smell of certain foods might be unbearable.\n\n🎭 Mood swings are very real, thanks to the hormonal rollercoaster. It's okay to feel emotional.\n\n🌸 Light spotting can occur, but it's always worth mentioning to your doctor.\n\n🌬️ Bloating and gas are common as progesterone slows down your digestion.\n\n💧 Excess saliva production (ptyalism) can be an annoying symptom for some.\n\n😵 You might feel dizzy or lightheaded at times.",
        tips: "👩‍⚕️ If you have severe nausea and vomiting (can't keep any liquids down), call your doctor. This could be hyperemesis gravidarum.\n\n🤝 Be open with your partner about how you're feeling, both physically and emotionally.\n\n🥨 Keep bland snacks like crackers, toast, or pretzels on hand at all times.\n\n👕 Switch to comfortable clothing. A supportive wireless bra can be a lifesaver for sore breasts.\n\n🚶‍♀️ Even a short walk can help boost your mood and combat fatigue.\n\n🤔 Start thinking about your healthcare provider options (OB-GYN, family doctor, midwife).\n\n📖 Read up on the next few weeks of pregnancy to know what to expect.\n\n🤫 Don't feel pressured to tell people your news until you are ready. The first trimester is your time.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "embryo illustration"
    },
    {
        week: 7,
        title: "Week 7: Baby's Brain Development",
        size: "Your baby is the size of a blueberry.",
        development: "🧠 The brain is developing at a phenomenal rate, with about 100 new brain cells forming every minute!\n\n✋ Arm and leg buds have grown longer and are starting to form paddle-like hands and feet.\n\n elbows and knees are now becoming distinct.\n\n❤️ The heart is developing into its four chambers.\n\n🚽 The embryo has developed a set of kidneys, which will soon begin to produce urine.\n\n👁️ The primary lenses of the eyes have now formed.\n\n👅 The tongue is beginning to develop.\n\n🔗 The umbilical cord, the lifeline between mother and baby, is clearly visible.",
        bodyChanges: "📈 Your uterus has doubled in size since conception, though it's still tucked inside your pelvis.\n\n💧 Your total blood volume has increased by about 10 percent and will continue to rise.\n\n🤰 You may or may not be noticing a change in your waistline, but bloating is common.\n\n Mucus plug is forming in your cervical canal to seal off the uterus.\n\n🔥 Heartburn might begin as the hormone progesterone relaxes the valve between your stomach and esophagus.\n\n Constipation can become an issue as progesterone also slows down your digestive tract.\n\nVeins may become more prominent on your chest and abdomen due to increased blood flow.\n\n⚖️ Weight gain is still minimal for most women at this stage.",
        symptoms: "🤢 Morning sickness and fatigue are likely still your primary companions.\n\n🚽 The need to urinate frequently continues, as your growing uterus and increased blood volume put pressure on your bladder.\n\n🍔 Food cravings and aversions are in full swing.\n\n💦 You might notice more vaginal discharge (leukorrhea), which is normal.\n\n🥴 A metallic taste in your mouth is a strange but common symptom.\n\n💥 Occasional, mild uterine cramping or twinges are normal as it grows.\n\nACNE breakouts can occur due to the hormonal shifts.\n\n🤤 Excess saliva can be an issue for some women.",
        tips: "🥤 Drink plenty of fluids. If water is unappealing due to nausea, try adding lemon or sipping on diluted fruit juice.\n\n👖 If your pants are getting uncomfortable, try the hair-tie trick on the button or invest in a belly band.\n\n🍎 To help with constipation, increase your fiber intake with fruits, vegetables, and whole grains.\n\n❓ Start writing down questions for your first prenatal visit. No question is too silly!\n\n🚶‍♀️ Incorporate gentle physical activity into your day, like a 15-20 minute walk.\n\n🦷 Pay attention to oral hygiene, as pregnancy hormones can make gums more sensitive (pregnancy gingivitis).\n\n🤝 If you haven't already, find a supportive friend who has been through pregnancy to talk to.\n\n🧘‍♀️ Practice self-compassion. It's okay if you don't feel blissful or productive right now.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "brain neurons"
    },
    {
        week: 8,
        title: "Week 8: Your First Glimpse",
        size: "Your baby is the size of a raspberry.",
        development: "🖐️ Fingers and toes are now forming, although they are still webbed.\n\n👁️ Eyelids are taking shape, beginning to cover the developing eyes.\n\n👃 The tip of the nose is now visible.\n\n🦎 The embryonic 'tail' at the base of the spine is almost gone.\n\n🤸 The baby is in constant motion, making spontaneous movements, though you won't feel them for many more weeks.\n\n The upper lip and palate are fusing together.\n\n🫁 Bronchial tubes are branching out in the lungs.\n\n❤️ The heart is beating at a rapid 150-170 beats per minute—about twice as fast as yours.",
        bodyChanges: "👩‍⚕️ This is a very common week for the first prenatal appointment and ultrasound.\n\n❤️ On the ultrasound, you may be able to see the tiny embryo and see the flickering heartbeat.\n\n📈 Your blood volume has increased significantly, and your heart is working harder.\n\n👖 Your clothes are likely feeling tighter, even if you don't have a distinct 'bump' yet.\n\n😴 The placenta is still developing, which requires a huge amount of energy from your body, causing fatigue.\n\nYour sense of smell is likely at an all-time high.\n\nYour breasts are probably larger, fuller, and more tender.\n\n✨ The 'mask of pregnancy' (chloasma), or darkening skin on your face, can start to appear.",
        symptoms: "Peak Symptoms: For many, this is when nausea and fatigue are at their most intense.\n\n💥 Mild uterine cramping or a feeling of pulling in your abdomen is normal as ligaments stretch.\n\n🧠 'Pregnancy brain' or forgetfulness might start to set in.\n\n😴 You may have very vivid or strange dreams.\n\nConstipation and bloating continue to be common complaints.\n\n🔥 Heartburn can be a fiery nuisance.\n\nYou may feel breathless at times due to progesterone's effect on your lungs.\n\nYour emotions can be all over the place, from joy and excitement to anxiety and fear.",
        tips: "❓ Come prepared for your first prenatal visit with your list of questions and the date of your last period.\n\n🗣️ This is often when people start sharing the news with close family after seeing a heartbeat.\n\n💪 Eat protein-rich snacks to help with energy levels and stabilize blood sugar.\n\n👖 It might be time to invest in some maternity pants or use a belly band for comfort.\n\n🧊 If you feel lightheaded, lie down on your left side or sit with your head between your knees.\n\n🦷 Make a dental appointment. It's important to have healthy teeth and gums during pregnancy.\n\n📚 Start looking into different childbirth philosophies or classes if that interests you.\n\n🤗 Celebrate this milestone! Seeing your baby's heartbeat for the first time is a magical moment.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "ultrasound scan"
    },
    {
        week: 9,
        title: "Week 9: Baby is Now a Fetus",
        size: "Your baby is the size of a cherry.",
        development: "👶 Big news! The embryo officially graduates to a fetus, meaning 'little one.'\n\n❤️ All essential organs are now formed and will spend the rest of the pregnancy growing and maturing.\n\n Joints like elbows, wrists, and knees are functional, allowing for more movement.\n\n👂 The external parts of the ears are well-formed.\n\nTOES are now visible and no longer webbed.\n\n💪 Muscle development is progressing, making movements stronger.\n\n The heart's four chambers are complete, and valves are forming.\n\n🦷 Tooth buds for all 20 baby teeth are in place within the gums.",
        bodyChanges: "💓 Your heart is working about 25% harder than usual to pump the increased blood volume through your body.\n\n🤰 Your uterus continues to grow and is now about the size of a small melon.\n\n👖 Your waistline is probably thickening, making non-maternity pants a challenge.\n\n😴 Fatigue is likely still significant as the placenta gets ready to take over hormone production.\n\n🔵 Veins, especially on your chest and abdomen, may be more noticeable.\n\nYour breasts have likely gone up a cup size and feel heavy.\n\nRound ligament pain, a sharp twinge in the lower abdomen, may start as the uterus stretches.\n\nYour kidneys are working overtime to filter the increased volume of blood.",
        symptoms: "🤢 Morning sickness may still be going strong, but hang in there—it often subsides in the next few weeks.\n\n😴 Fatigue continues to be a top complaint. You may need more sleep than you ever thought possible.\n\n🔥 Heartburn and indigestion can become more frequent as progesterone relaxes digestive muscles.\n\n🤕 Headaches can be common due to hormonal shifts and increased blood volume.\n\n💨 Gas and bloating are par for the course thanks to slowed digestion.\n\n😵 Feeling dizzy or lightheaded, especially when standing up quickly, can occur.\n\n🤧 Nasal congestion or stuffiness (rhinitis of pregnancy) can start, caused by hormones swelling nasal passages.\n\n🎭 Moodiness and emotional sensitivity are still very common.",
        tips: "👕 Invest in a few key maternity pieces, like comfortable pants and supportive bras. You'll be glad you did.\n\n💧 Drink even more water now. It helps with headaches, constipation, and circulation.\n\n🍊 Eat small, frequent meals to keep blood sugar stable and nausea at bay.\n\n🏃‍♀️ Gentle exercise, like walking or swimming, is excellent for circulation and mood.\n\n🚫 Avoid spicy, greasy, or very acidic foods to help manage heartburn.\n\n😴 When you feel dizzy, sit or lie down immediately. Try to stand up slowly.\n\n💨 A humidifier at night can help with pregnancy rhinitis.\n\n🤝 Start a conversation with your partner about your hopes and fears for parenthood.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "fetus illustration"
    },
    {
        week: 10,
        title: "Week 10: Fingernails and Hair Appear",
        size: "Your baby is the size of a strawberry.",
        development: "💅 Tiny fingernails and toenails are beginning to form on the tips of the fingers and toes.\n\n🍑 The fetus is covered in a very fine, downy hair called lanugo, which will help regulate temperature.\n\n🧠 The forehead is temporarily bulging with the rapidly developing brain.\n\n🦴 The skeleton is beginning to harden from cartilage to bone (ossification).\n\n🚽 The kidneys are fully formed and are now producing urine.\n\n💪 The fetus can bend its limbs and is constantly, actively moving.\n\nSPINE is clearly visible on an ultrasound and the spinal nerves are stretching out from the spinal cord.\n\n👁️ The eyelids are fused shut and will remain so for several more months to protect the developing eyes.",
        bodyChanges: "✨ The placenta has almost finished developing and is preparing to take over the crucial job of producing pregnancy-sustaining hormones.\n\n🤰 Your uterus is now the size of a large orange and is starting to rise out of your pelvis.\n\n〰️ You might notice a dark vertical line, the linea nigra, appearing on your abdomen. This is temporary.\n\n💥 Round ligament pain—sharp, brief pains in your groin or lower belly—may occur as your uterus grows.\n\n💓 Your heart rate has likely increased to handle the extra blood flow.\n\nYour breasts are continuing to grow and prepare for milk production.\n\nYour immune system is still suppressed, making you more susceptible to colds and flu.\n\n⚖️ You've probably gained a few pounds by now, but it's also normal to have gained none, especially if you had morning sickness.",
        symptoms: "🤢 Good news! For many, morning sickness starts to ease up around this time.\n\n😴 Fatigue might also begin to lessen as the placenta takes over hormone production.\n\n💧 An increase in vaginal discharge (leukorrhea) is normal.\n\n💥 You may still feel those sharp round ligament pains when you change positions quickly.\n\n💨 Bloating and gas are still common companions.\n\nVisible veins on your stomach and breasts are normal.\n\n🤕 Headaches can persist due to hormones and dehydration.\n\nYour gums may be swollen and bleed easily when you brush (pregnancy gingivitis).",
        tips: "👖 Shop for maternity clothes. Don't wait until you're uncomfortable; having clothes that fit well can be a huge mood booster.\n\n💧 Drink plenty of water. It's crucial for forming amniotic fluid, increasing blood volume, and preventing UTIs.\n\n🍎 Focus on a diet rich in calcium for your baby's developing bones and teeth.\n\n🦷 Be extra gentle when brushing and flossing your teeth.\n\n🏃 Stretch your sides gently to help alleviate round ligament pain.\n\n👩‍⚕️ If you are over 35 or have other risk factors, your doctor may discuss genetic screening options with you, like the NIPT blood test.\n\n SUNSCREEN is a must, as your skin is more sensitive to the sun and prone to discoloration (chloasma).\n\n💕 Start moisturising your belly, hips, and breasts to help with skin elasticity and itchiness.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "baby hand"
    },
    {
        week: 11,
        title: "Week 11: Reflexes Develop",
        size: "Your baby is the size of a fig.",
        development: "✊ The fetus can now open and close its fists.\n\n👄 The mouth can make sucking and yawning movements.\n\n👣 Tiny toes will curl and stretch.\n\n🦷 Tooth buds for their permanent adult teeth are developing deep inside the gums.\n\n💪 The fetus is having a growth spurt! Its length will almost double in the next three weeks.\n\n👶 The head is still very large, making up about half of the total body length.\n\nDIAPHRAGM is forming, and the baby may get hiccups, though you can't feel them.\n\n SEX ORGANS are forming, but it's still too early to tell the gender on an ultrasound.",
        bodyChanges: "🤰 Your baby bump might be starting to make a small appearance as your uterus rises above the pubic bone.\n\n✨ The placenta is now fully functional and has taken over most of the hormone production from your ovaries.\n\n⚡️ This hormonal shift often leads to an increase in energy and a decrease in nausea—welcome to the 'honeymoon' phase!\n\nYour hair and nails may start to grow faster and stronger.\n\n🔥 Heartburn might persist as progesterone continues to relax the esophageal sphincter.\n\n⚖️ Healthy weight gain is typically about 1-4 pounds in the first trimester.\n\nYour heart is pumping blood more vigorously than before pregnancy.\n\nYour areolas may have gotten larger and darker.",
        symptoms: "☀️ Energy levels may start to rebound. You might feel more like your old self.\n\n😊 Nausea and vomiting often begin to subside for many women.\n\n🦵 Leg cramps, especially at night, can start to become an issue.\n\n🤕 Headaches can still occur, often related to hormones, dehydration, or caffeine withdrawal.\n\n😵 Dizziness is still possible, especially if you stand up too quickly.\n\nConstipation can be an ongoing issue due to slowed digestion.\n\n💧 You might still have increased vaginal discharge.\n\nYour appetite may return as nausea fades.",
        tips: "🥗 Now that you're feeling better, focus on eating a variety of healthy, nutrient-dense foods.\n\n🏃‍♀️ Take advantage of your returning energy to establish a regular, pregnancy-safe exercise routine.\n\n🍌 For leg cramps, try stretching your calf muscles before bed. Ensure you're getting enough potassium and magnesium.\n\n🧘‍♀️ When you feel a headache, rest in a dark, quiet room with a cool cloth on your forehead.\n\n💧 Stay hydrated! Keep a water bottle with you at all times.\n\n🗣️ Start thinking about how and when you want to announce your pregnancy to a wider circle of friends or at work.\n\n💰 Begin planning financially for the baby. It's never too early to start a budget.\n\n👶 If you have other children, this is a good time to start talking to them about the new baby.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "baby feet"
    },
    {
        week: 12,
        title: "Week 12: End of the First Trimester",
        size: "Your baby is the size of a lime.",
        development: "💪 The fetus's reflexes are becoming more refined; they will squint, frown, and grimace.\n\n🏠 The intestines, which were partially growing inside the umbilical cord, are now moving into their permanent home in the baby's abdomen.\n\n🧠 The pituitary gland at the base of the brain is beginning to produce hormones.\n\nVOCAL CORDS are now complete, a crucial step for their first cry.\n\n🦴 The skeleton is continuing to harden from cartilage into bone.\n\nNAILS are continuing to grow on the tiny fingers and toes.\n\nFINGERPRINTS, unique to your baby, are beginning to form on their fingertips.\n\n🤸 The fetus is very active, kicking and stretching, but is still too small for you to feel.",
        bodyChanges: "🎉 Congratulations, you've reached the end of the first trimester!\n\n✨ The risk of miscarriage drops significantly after this week, providing peace of mind for many.\n\n🤰 Your uterus has grown enough that your provider can now feel the top of it (the fundus) in your lower abdomen.\n\nYour baby bump is likely starting to show, especially if this isn't your first pregnancy.\n\n The placenta is now fully in charge of producing progesterone and estrogen.\n\nYour energy levels are likely increasing, and nausea is hopefully a thing of the past.\n\nYour skin's pigmentation changes, like the linea nigra, may become more pronounced.\n\nYour digestion is still sluggish, so bloating and constipation can continue.",
        symptoms: "☀️ The 'honeymoon period' of pregnancy often begins now, with less nausea and more energy.\n\n😵 Dizziness can still be an issue due to hormonal changes and your expanding circulatory system.\n\n🤕 Headaches are still a common complaint for some.\n\n💧 Increased vaginal discharge (leukorrhea) is normal.\n\n🔥 Heartburn might still be present.\n\nYour breasts are probably less tender than they were a few weeks ago, but are still growing.\n\nYou might feel some abdominal aches as your uterus expands.\n\nAppetite may increase, so focus on healthy choices.",
        tips: "🗣️ This is a very popular time to share your exciting news with friends, family, and coworkers.\n\n🧘‍♀️ Consider starting prenatal yoga or other pregnancy-safe exercise classes.\n\nListen to your baby's heartbeat with a Doppler at your next prenatal appointment—it's a thrilling sound!\n\n🏢 Start planning for maternity leave. Look into your company's policies and your country's laws.\n\n🥗 Focus on a balanced diet with plenty of lean protein, fruits, vegetables, and whole grains.\n\n👖 Embrace maternity clothes! Comfort is key.\n\n🤝 Talk to your partner about expectations for the second trimester.\n\n📝 Start a baby name list with your partner for fun.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "celebration confetti"
    },
    {
        week: 13,
        title: "Week 13: Welcome to the Second Trimester!",
        size: "Your baby is the size of a pea pod.",
        development: "👆 Unique fingerprints are now fully patterned on your baby's tiny fingertips.\n\n🗣️ Vocal cords are developing, preparing for that first cry after birth.\n\nPEEING The fetus is now swallowing amniotic fluid and passing it as urine, a process that helps the urinary tract mature.\n\n🦴 Bones are beginning to harden in the arms and legs.\n\n🦒 The neck is getting longer, allowing the head to be more erect and less curled onto the chest.\n\nEYES, once on the sides of the head, are now moving closer together on the face.\n\n The spleen is beginning to produce red blood cells.\n\nOVARIES or TESTES are fully formed internally.",
        bodyChanges: "📈 You are now officially in the second trimester, often called the 'golden period' of pregnancy.\n\n LIBIDO may increase as energy returns and nausea subsides. Many women report feeling more interested in sex.\n\n🤰 Your uterus is continuing to grow and expand out of your pelvis, making your bump more noticeable.\n\n💧 You might notice a thin, milky-white vaginal discharge called leukorrhea; this is normal and protective.\n\n👄 Your gums may be more sensitive and prone to bleeding (pregnancy gingivitis) due to hormonal changes.\n\nYour breasts are continuing to prepare for milk production, and you might notice veins becoming more visible.\n\nRound ligament pain may continue as your uterus stretches.\n\nYour body is starting to produce the hormone relaxin, which loosens ligaments in your pelvis for birth.",
        symptoms: "☀️ A welcome surge of energy is common as first-trimester fatigue fades.\n\n😊 Nausea has likely subsided, and your appetite might be returning with a vengeance.\n\n💧 Increased vaginal discharge is a common and normal symptom.\n\n💥 Sharp but brief round ligament pains can occur when you move suddenly.\n\nVEINS on your legs (spider veins) or even varicose veins can start to appear.\n\nCLUMSINESS can set in as your center of gravity begins to shift.\n\nYour breasts are likely still growing but may feel less tender.\n\nConstipation can remain an issue due to slowed digestion.",
        tips: "🦷 Use a soft-bristled toothbrush and be gentle when flossing to care for your sensitive gums.\n\n👩‍🏫 Now is a good time to start researching childbirth classes and decide which approach is right for you.\n\n🗣️ If you haven't told your employer yet, this is often a good time to do so.\n\n👟 Wear comfortable, supportive shoes to help with balance and prevent back pain.\n\n🥗 Focus on nutrient-dense foods to satisfy your increased appetite.\n\n🧴 Keep your skin, especially your belly, well-moisturized to help with itchiness and potentially reduce stretch marks.\n\n👩‍❤️‍👨 Reconnect with your partner. With more energy, it's a great time for a date night or a weekend getaway (a 'babymoon').\n\n💪 Incorporate Kegel exercises into your daily routine to strengthen your pelvic floor muscles.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "yoga pose"
    },
    {
        week: 14,
        title: "Week 14: Baby Can Squint and Frown",
        size: "Your baby is the size of a lemon.",
        development: "😠 Your baby can now make a range of facial expressions like squinting, frowning, and grimacing.\n\n🍑 A fine, downy hair called lanugo is covering the baby's body, providing warmth.\n\n🦒 The neck is getting longer, and the chin is becoming more distinct from the chest.\n\n💪 The arms have grown longer and are now proportional to the rest of the body.\n\n The liver has begun to produce bile, and the spleen has started to make red blood cells.\n\nROOF of the mouth is now fully formed.\n\n The thyroid gland has matured and is producing hormones.\n\n🤸 The baby is wiggling its fingers and toes and can even grasp.",
        bodyChanges: "🤰 Your baby bump is likely becoming more apparent, and it may be getting difficult to hide.\n\n❤️ Focus on the amazing things your body is doing rather than getting stressed about body image.\n\n⚡️ You may be enjoying a welcome energy boost and a feeling of general well-being.\n\n👖 You are probably living in maternity clothes or loose-fitting items by now.\n\nHAIR may appear thicker and more lustrous as hormones slow down the rate of normal hair shedding.\n\nYour round ligaments are continuing to stretch, which can cause occasional sharp pains.\n\nYour appetite might be increasing as your baby goes through a growth spurt.\n\nYour heart is working harder to pump blood to you and your growing baby.",
        symptoms: "⚡️ Increased energy is a hallmark of the second trimester for many.\n\n💥 Occasional round ligament pain is normal and expected.\n\n🤧 A stuffy nose (pregnancy rhinitis) might appear or continue due to increased blood flow to mucous membranes.\n\n👄 Bleeding gums can persist, so maintain good oral hygiene.\n\nVaricose veins may develop, especially if you're on your feet a lot.\n\n🤕 Headaches can still occur, often linked to hormonal shifts.\n\nYour appetite has likely increased.\n\nForgetfulness or 'pregnancy brain' is a real phenomenon for many.",
        tips: "🚶‍♀️ Take advantage of your increased energy to stay active. Walking, swimming, and prenatal yoga are excellent choices.\n\n🍎 Keep healthy snacks on hand to satisfy your growing appetite and keep your energy stable.\n\n🧴 Moisturize your stretching skin on your belly, hips, and thighs to relieve itchiness.\n\n👕 Wear comfortable, supportive clothing and a well-fitting bra.\n\n🧍‍♀️ Practice good posture—stand up straight and pull your shoulders back to help prevent backaches.\n\n👩‍🏫 If you're interested, start looking into doula services in your area.\n\n📖 Read books about childbirth and newborn care to feel more prepared.\n\n😴 Even with more energy, ensure you're still getting plenty of sleep.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "happy pregnant"
    },
    {
        week: 15,
        title: "Week 15: Forming a Skeleton",
        size: "Your baby is the size of an apple.",
        development: "🦴 The skeleton is actively hardening from soft cartilage to bone (a process called ossification).\n\n💡 The baby can now sense light. Though their eyelids are fused shut, they may turn away from a bright light shone on your belly.\n\n🦵 The legs are now longer than the arms, and the baby is moving all of its joints and limbs.\n\n👂 The tiny bones in the ears are developing, meaning the baby can likely hear muffled sounds from the outside world.\n\nSKIN is very thin and translucent, with blood vessels visible.\n\nHAIR patterns on the scalp are beginning to form.\n\nTASTE BUDS are fully formed.\n\nBREATHING movements are being practiced, as the baby inhales and exhales amniotic fluid.",
        bodyChanges: "🤧 You might experience a stuffy nose or even nosebleeds due to increased blood flow and hormones affecting your mucous membranes.\n\n🤰 Your uterus can now be felt about 3-4 inches below your navel.\n\n⚖️ You're likely gaining weight more steadily now, about a pound a week.\n\n💧 Your heart is pumping about 20% more blood than it did pre-pregnancy to support the baby.\n\nYour growing belly is starting to shift your center of gravity.\n\nYour appetite is probably quite healthy as your baby's growth accelerates.\n\nSKIN changes, like the linea nigra or darker patches, may be more evident.\n\nYour gums continue to be sensitive.",
        symptoms: "🤧 A stuffy nose or occasional nosebleeds are common.\n\n🔥 Heartburn and indigestion can be frequent as your uterus puts pressure on your stomach.\n\n👄 Swollen and bleeding gums require gentle care.\n\n🚶‍♀️ Lower backaches may start to appear due to your changing posture and relaxin hormone.\n\n🦵 Leg cramps can interrupt your sleep.\n\n💨 Gas and bloating are still common.\n\n💧 A slight increase in vaginal discharge is normal.\n\nYour energy levels are generally good.",
        tips: "💨 Use a humidifier or saline nasal spray to relieve a stuffy nose.\n\n💧 For a nosebleed, pinch your nostrils firmly and lean forward for about 10 minutes.\n\n🥛 Make sure you're getting plenty of calcium (dairy, leafy greens, fortified foods) for your baby's hardening bones.\n\n👩‍⚕️ Your provider may offer a maternal serum screening test (quad screen) between now and week 20 to check for certain congenital conditions.\n\n👟 Wear low-heeled, comfortable shoes to help with your changing center of gravity and back pain.\n\n🗣️ Start talking to your baby! They may be able to hear your voice now.\n\n🚫 Avoid lying flat on your back for extended periods, as this can compress a major vein.\n\n🧘‍♀️ Sleep on your side, with pillows propped between your knees and under your belly for support.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "skeleton xray"
    },
    {
        week: 16,
        title: "Week 16: Growth Spurt",
        size: "Your baby is the size of an avocado.",
        development: "📏 Your baby is undergoing a major growth spurt, potentially doubling their weight in the coming weeks.\n\n💓 The heart is now pumping about 25 quarts of blood each day.\n\n👁️ The eyes have moved to the front of the head and can make small side-to-side movements.\n\n👂 The ears are in their final position, and the baby's hearing is becoming more acute.\n\n💪 The muscles in the back are getting stronger, allowing the baby to straighten their head and neck more.\n\nNERVOUS SYSTEM is continuing to mature, allowing for more coordinated movements.\n\nFACIAL MUSCLES are developing, allowing for a variety of expressions.\n\n💅 Fingernails are now well-formed.",
        bodyChanges: "🦋 You might feel the first incredible flutters of your baby's movement, called 'quickening.'\n\n🤰 Your uterus is growing rapidly, and your bump is becoming more prominent.\n\n✨ The 'pregnancy glow' is common now, thanks to increased blood volume bringing more blood to the skin's surface.\n\nYour breasts are growing, and the areolas may be getting darker and larger.\n\nYour appetite is likely strong.\n\nYour round ligaments are stretching to support your heavy uterus.\n\nYour cardiovascular system is adapting to the increased demands.\n\nRelaxin is loosening your joints, which can sometimes cause hip or pelvic pain.",
        symptoms: "🦋 First-time moms might feel quickening between now and week 20. It can feel like gas bubbles, a gentle tapping, or popcorn popping.\n\n🧠 Forgetfulness, or 'pregnancy brain,' is a common complaint.\n\n🚶‍♀️ Backaches may become more noticeable as your growing belly shifts your center of gravity and hormones relax your ligaments.\n\nConstipation can be an ongoing issue.\n\n🦵 Occasional leg cramps, especially at night, can occur.\n\nYour gums may still be sensitive and bleed when you brush.\n\nSome women experience vision changes, like blurriness, due to fluid retention.\n\nYour energy levels are generally good.",
        tips: "📝 Write things down! To-do lists and reminders can be a lifesaver for pregnancy brain.\n\n🧍‍♀️ Practice good posture: stand tall, tuck your pelvis, and avoid slouching to minimize back pain.\n\n👟 Wear low-heeled, supportive shoes to provide a stable base.\n\n🍎 Eat fiber-rich foods and drink lots of water to combat constipation.\n\n👩‍⚕️ Mention any vision changes to your doctor, as it can sometimes be a sign of a problem.\n\n🗣️ Don't worry if you haven't felt the baby move yet, especially if it's your first pregnancy. It will happen soon!\n\n🛌 Sleep on your side with pillows for support to improve comfort and circulation.\n\n❓ Start thinking about your preferences for labor and delivery. What's important to you?",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "butterfly stomach"
    },
    {
        week: 17,
        title: "Week 17: Baby Packs on Fat",
        size: "Your baby is the size of a turnip.",
        development: "👶 The baby is starting to accumulate adipose tissue, or fat, which is crucial for maintaining body temperature and providing energy after birth.\n\n🔗 The umbilical cord is growing stronger and thicker to transport more nutrients.\n\nREFLEXES are maturing; the baby can now coordinate sucking and swallowing.\n\n👂 The auditory system is well-developed, and the baby may be startled by loud external noises.\n\nHEARTBEAT is now regulated by the brain and is no longer spontaneous.\n\nSWEAT GLANDS are beginning to develop all over the body.\n\nUnique fingerprints and footprints are now fully in place.\n\nSKELETON is still transforming from soft cartilage to hard bone.",
        bodyChanges: "😋 Your appetite may increase significantly as your baby's growth accelerates and they begin to build up fat stores.\n\n🔥 Your expanding uterus is pushing your stomach upwards, which can cause or worsen heartburn and indigestion.\n\n⚖️ You are likely gaining about 1 to 2 pounds per week now.\n\n🤰 Your baby bump is growing steadily.\n\nYour center of gravity is changing, which can make you feel a bit wobbly or off-balance.\n\nYour skin is stretching to accommodate your growth, which can cause itchiness.\n\nYour body is producing more fluids, leading to increased vaginal discharge and sweat.\n\nYour heart is working hard, and you might feel it beating faster at times.",
        symptoms: "🔥 Heartburn and indigestion are very common.\n\n🚶‍♀️ Backaches, hip pain, and pelvic pressure can occur as ligaments loosen.\n\n☀️ Your skin may be more sensitive to the sun, a condition called photosensitivity.\n\n😵 Dizziness or lightheadedness can happen, especially when changing positions.\n\n🦵 Swelling in your ankles and feet (edema) may start to appear, especially at the end of the day.\n\nITCHY SKIN, particularly on your abdomen and breasts, is common.\n\nSciatica—a sharp pain that runs from your lower back down one leg—can occur.\n\nIncreased appetite is a definite symptom for most.",
        tips: "🍎 Focus on nutrient-dense foods to satisfy your hunger. Keep healthy snacks like nuts, yogurt, and fruit readily available.\n\n🚫 To manage heartburn, eat smaller, more frequent meals and avoid lying down right after eating.\n\n🚫 Avoid standing for very long periods and try to elevate your feet when you sit to reduce swelling.\n\n🧴 Use a good moisturizer or oil on your belly, hips, and breasts to soothe itchy, stretching skin.\n\n🌞 Always wear a broad-spectrum sunscreen with a high SPF when you go outside.\n\n💧 Drink plenty of water, which helps with swelling and keeps everything running smoothly.\n\n👟 Be mindful of your balance and wear supportive shoes.\n\n👩‍🏫 This is a great time to start looking into baby care basics classes.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "healthy food"
    },
    {
        week: 18,
        title: "Week 18: Baby Can Hear You",
        size: "Your baby is the size of a sweet potato.",
        development: "👂 The nerves connected to the ears are now myelinated, meaning they are coated with a protective sheath that allows messages to travel faster. Your baby can definitely hear now!\n\n🎤 The baby can hear your heartbeat, your digestion, and the sound of your voice, which they will recognize at birth.\n\n👁️ The retinas in the eyes can now detect light if a bright light is shone on your abdomen.\n\n🤸 The baby is very active, kicking, punching, twisting, and turning. You're more likely to be feeling these movements now.\n\nDIGESTIVE SYSTEM is practicing its processes.\n\n👆 Unique fingerprints and toe prints are now fully formed and in place.\n\nNERVOUS SYSTEM is maturing rapidly.\n\nFEMALE fetuses have developed a uterus and fallopian tubes.",
        bodyChanges: "😴 It may become harder to find a comfortable sleeping position. Experts recommend sleeping on your side (preferably the left) for optimal blood flow.\n\n🤰 Your uterus is about the size of a cantaloupe and can be felt just below your navel.\n\n📉 Your blood pressure may be lower than normal at this stage, which can contribute to dizziness.\n\nYour back may be aching from the strain of your growing belly.\n\nYour feet may be swelling, and you might need to go up a shoe size.\n\nYour appetite is likely robust.\n\nItchy skin on your belly continues as it stretches.\n\nYour 'inny' belly button might be getting shallower.",
        symptoms: "🤸‍♀️ You are likely feeling your baby's movements more consistently now, which is a reassuring and exciting feeling.\n\n😴 Trouble sleeping due to your growing belly and active mind is very common.\n\n🦵 Swelling in your hands, ankles, and feet (edema) can be more pronounced, especially in warm weather or at the end of the day.\n\n😣 Leg cramps at night can be a painful, sleep-disrupting nuisance.\n\n🚶‍♀️ Backaches are a frequent complaint.\n\n😵 Feeling faint or dizzy is common, especially if you get up too fast.\n\n🤧 A stuffy nose and occasional nosebleeds can continue.\n\n🔥 Heartburn and indigestion are still common.",
        tips: "🗣️ Talk, sing, or read to your baby! They are listening and learning the rhythms of your voice.\n\n🛌 Invest in a good pregnancy pillow to support your belly, back, and legs for more comfortable side-sleeping.\n\n👟 To reduce swelling, elevate your feet whenever possible, avoid long periods of standing, and drink lots of water.\n\n🍌 To prevent leg cramps, stretch your calves before bed and make sure you're getting enough calcium, potassium, and magnesium.\n\n👩‍⚕️ Your mid-pregnancy anatomy scan is usually scheduled between now and week 22. It's a detailed ultrasound to check all of the baby's organs and structures.\n\n🤔 Decide if you want to find out the baby's sex at the anatomy scan.\n\n💪 Stay active with pregnancy-safe exercises, which can help with many common aches and pains.\n\n💧 Keep up your water intake!",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "woman singing"
    },
    {
        week: 19,
        title: "Week 19: Protective Coating Forms",
        size: "Your baby is the size of a mango.",
        development: "🤍 The baby's skin is now being coated in vernix caseosa, a greasy, white, cheese-like substance that protects it from the amniotic fluid.\n\n🧠 The areas of the brain responsible for the five senses—sight, hearing, smell, taste, and touch—are developing.\n\n🦵 The legs are now proportional to the rest of the body.\n\nHAIR on the scalp is beginning to sprout.\n\nKIDNEYS are continuing to produce urine.\n\nBROWN FAT, a special type of fat that generates heat, is forming.\n\nREPRODUCTIVE system development is continuing. For girls, the uterus is formed and the ovaries hold millions of primitive eggs.\n\nSKELETON continues to harden and ossify.",
        bodyChanges: "✨ You might develop chloasma, or the 'mask of pregnancy'—darker patches of skin on your forehead, cheeks, or upper lip. This is temporary and caused by hormones.\n\n〰️ The linea nigra, the dark line down your abdomen, may be more pronounced.\n\n😣 Itchy skin, especially on your growing abdomen and breasts, is very common.\n\n🤰 Your uterus has grown to the level of your navel.\n\n⚖️ You are continuing to gain weight steadily.\n\nYour center of gravity is definitely shifting, which can affect your balance.\n\nYour hair may feel wonderfully thick and full.\n\nRound ligament pain, a sharp pain in the groin area, can strike when you move suddenly.",
        symptoms: "😮 Feeling short of breath can become more common as your growing uterus puts pressure on your diaphragm and lungs.\n\n😵 Dizziness or lightheadedness can still occur.\n\n🚶‍♀️ Backaches are a common companion.\n\n🦵 Leg cramps continue to be an issue for many.\n\nHip pain can start as the hormone relaxin loosens your ligaments.\n\nSKIN pigmentation changes are very common.\n\nFeeling the baby move is becoming more frequent and stronger.\n\nHeartburn and indigestion are ongoing issues.",
        tips: "🧴 Use gentle, moisturizing lotions or oils (like coconut or almond oil) to soothe itchy, stretching skin.\n\n🌞 Protect your skin from the sun with a high-SPF sunscreen to prevent chloasma from darkening further.\n\n🏃‍♀️ Pace yourself and take breaks when you feel short of breath. Your body is working hard!\n\n🧘‍♀️ Gentle stretching can help with hip and back pain. Consider seeing a prenatal chiropractor or physical therapist if the pain is severe.\n\n👟 Be mindful of your posture and avoid lifting heavy objects.\n\n🏢 Start thinking about your childcare options for after the baby arrives, as daycare lists can be long.\n\n👩‍🏫 Look into childbirth education classes. They can empower you with knowledge and reduce anxiety.\n\n💧 Drink lots of water to support your increased blood volume and amniotic fluid.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "lotion skin"
    },
    {
        week: 20,
        title: "Week 20: Halfway There!",
        size: "Your baby is the size of a banana.",
        development: "🎉 You've reached the halfway point of your pregnancy! Congratulations!\n\n😋 The baby is swallowing more amniotic fluid, which is great practice for their digestive system.\n\n💩 The intestines are producing meconium, a black, sticky substance that will be their first bowel movement after birth.\n\n👂 The baby can now clearly hear and recognize your voice.\n\nHAIR and eyebrows are growing longer.\n\n💅 Fingernails have reached the tips of the fingers.\n\nSEX can often be determined by ultrasound at this point, if the baby cooperates!\n\nTEETH buds are developing under the gums for both baby and permanent teeth.",
        bodyChanges: "👩‍⚕️ This is the week for the big anatomy scan! It's a detailed ultrasound that checks all the baby's organs, measures growth, and checks placenta location.\n\n🤰 Your uterus is at the level of your belly button.\n\nYour belly button might start to flatten or even pop out to become an 'outie.'\n\nYour energy levels are likely still good, making this a productive time.\n\nYour heart is working hard, and you might notice your pulse is faster.\n\nYour appetite is probably healthy.\n\nYour breasts are continuing to grow and prepare for nursing.\n\nYour weight gain is steady at about a pound per week.",
        symptoms: "💪 You're likely feeling pretty good, with solid energy levels and less nausea.\n\n🦵 The most common complaints now are physical aches and pains: backaches, hip pain, and leg cramps.\n\n👟 Mild swelling in your feet and ankles is normal.\n\n🔥 Heartburn can still be an issue.\n\n💨 You might feel short of breath as your uterus presses upward.\n\n😴 Sleep may become more challenging as it gets harder to find a comfortable position.\n\n〰️ Stretch marks may start to appear on your belly, breasts, or hips.\n\nFeeling the baby kick, twist, and turn is now a daily event.",
        tips: "👶 Start planning the nursery or creating a space for the baby in your home.\n\n🛍️ Begin shopping for baby essentials like a car seat, stroller, and crib.\n\n❓ Decide if you want to find out the baby's sex at the ultrasound and plan accordingly.\n\n👩‍🏫 Sign up for hospital tours and childbirth classes.\n\n🧘‍♀️ Continue with your prenatal exercise routine to manage aches and pains and prepare for labor.\n\n🗣️ Talk and sing to your baby often. Your partner can join in too!\n\n🤝 Celebrate the halfway mark! Go on a 'babymoon' or a special date night with your partner.\n\n📝 Start creating your baby registry.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "halfway sign"
    },
    {
        week: 21,
        title: "Week 21: Tasting Flavors",
        size: "Your baby is the size of a large carrot.",
        development: "👅 The baby's taste buds are developed, and they can taste the different flavors from the food you eat that pass into the amniotic fluid.\n\n🤸 Their movements are becoming more coordinated and less random, feeling more like distinct kicks and punches.\n\nDIGESTIVE SYSTEM is mature enough to absorb small amounts of sugars from the amniotic fluid they swallow.\n\nEYEBROWS and eyelids are now fully formed.\n\nBONE MARROW is starting to take over the job of making red blood cells from the liver and spleen.\n\nLANUGO, the fine downy hair, now covers their entire body.\n\nFingernails now cover the entire nail bed.\n\nSLEEP-WAKE cycles are becoming more established.",
        bodyChanges: "💥 You'll likely feel kicks and punches much more strongly and frequently now. Your partner might even be able to feel them by placing a hand on your belly!\n\n🔥 Heartburn and indigestion may become more of a problem as your uterus crowds your stomach.\n\n〰️ Stretch marks on your belly, hips, breasts, or thighs may appear or become more prominent. They are a badge of honor!\n\nYour legs might feel achy or heavy, and varicose veins can develop or worsen.\n\nYour skin is stretching, which can lead to dryness and itching.\n\nYour balance may be increasingly off-kilter.\n\nYour appetite is likely still strong.\n\nYour body is continuing to gain weight steadily to support the baby's growth.",
        symptoms: "🤸‍♀️ Stronger and more frequent fetal movements are the main event this week.\n\n🔥 Increased heartburn is very common.\n\nLEG CRAMPS and backaches are persistent issues.\n\n💨 Shortness of breath can occur with exertion.\n\n👟 Mild swelling of the ankles and feet is normal.\n\nBRAXTON HICKS contractions—painless, irregular 'practice' contractions—can sometimes start around now.\n\nIncreased vaginal discharge continues.\n\nItchy skin, especially on the abdomen, is common.",
        tips: "🌶️ Eat a varied diet! The flavors you introduce now may influence your baby's food preferences after they're born.\n\n🤝 Share the magical moment of feeling the baby kick with your partner and other loved ones.\n\n🚫 To manage heartburn, eat small meals, avoid spicy/greasy foods, and don't lie down immediately after eating.\n\n🧘‍♀️ When you experience Braxton Hicks, try changing positions or drinking a glass of water, which often makes them stop.\n\n👟 Put your feet up whenever you can to help with swelling.\n\n🧴 Keep your skin well-moisturized to combat itchiness.\n\n👩‍🏫 Look into breastfeeding classes or resources if you plan to nurse.\n\n💪 Continue with Kegel exercises to strengthen your pelvic floor for delivery and recovery.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "spices variety"
    },
    {
        week: 22,
        title: "Week 22: Baby Looks Like a Newborn",
        size: "Your baby is the size of a spaghetti squash.",
        development: "👶 The baby now looks like a miniature newborn. Their lips, eyebrows, and eyelids are distinct and fully formed.\n\n✨ The pancreas is developing steadily, which is essential for producing important hormones like insulin.\n\n👁️ Eyes have formed, but the iris (the colored part of the eye) still lacks pigment.\n\n🧠 The brain is continuing its rapid growth and development.\n\n👂 The baby can hear and respond to a wider range of sounds.\n\nSKIN is still thin and wrinkled but is becoming less translucent.\n\nREPRODUCTIVE organs continue to mature.\n\nTEETH buds for permanent teeth are forming behind the buds for baby teeth.",
        bodyChanges: "✨ Your belly button may pop out to become an 'outie' if it hasn't already. This is temporary and will revert after birth.\n\n💇‍♀️ Your hair might seem its thickest and most lustrous now, as pregnancy hormones slow down the normal cycle of hair shedding.\n\n⚖️ Your weight gain is consistent, supporting your baby's rapid growth.\n\n🤰 Your fundal height (the distance from your pubic bone to the top of your uterus) now roughly corresponds to the week of pregnancy.\n\nYour feet might have grown a half or full size due to relaxin loosening ligaments.\n\nYour skin continues to stretch, and stretch marks are common.\n\nYour body's fluid levels are high, contributing to swelling.\n\nYour joints and ligaments are becoming more lax, which can lead to aches.",
        symptoms: "💧 Increased vaginal discharge and mild swelling in the hands and feet are very common.\n\n🔥 Heartburn and indigestion are ongoing.\n\n🚶‍♀️ Backaches are a daily reality for many.\n\nCravings for strange food combinations can occur.\n\nHemorrhoids may develop due to increased pressure and constipation.\n\nFeeling hot is common due to an increased metabolic rate.\n\n😴 Finding a comfortable sleeping position becomes more of a challenge.\n\nFeeling the baby's hiccups can be a new and funny sensation.",
        tips: "💇‍♀️ Enjoy your great pregnancy hair! But be prepared for some postpartum shedding.\n\n🏢 Start seriously thinking about your maternity leave plan and discussing it with your employer.\n\n👟 If your feet have grown, invest in new, comfortable, and supportive shoes.\n\n🌾 To prevent or manage hemorrhoids, avoid constipation by eating a high-fiber diet and drinking plenty of water.\n\n🛌 Use pillows strategically to find a more comfortable sleeping position on your side.\n\n👩‍❤️‍👨 Keep the lines of communication open with your partner about your physical and emotional changes.\n\n👶 Start to think about a pediatrician for your baby.\n\n🧘‍♀️ Continue your gentle exercise routine, which can help with energy levels and aches.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "newborn baby"
    },
    {
        week: 23,
        title: "Week 23: Viability Milestone",
        size: "Your baby is the size of a large mango or eggplant.",
        development: "🌟 This is a major milestone: the age of viability. A baby born now has a chance of survival with intensive medical care.\n\n🫁 The lungs are developing surfactant, a substance that helps the air sacs inflate after birth. This is a critical step for breathing.\n\nBLOOD VESSELS in the lungs are developing to prepare for breathing air.\n\n👂 The baby's hearing is even better, and they can be startled by loud noises from the outside.\n\n🤸 Movements are becoming stronger and more noticeable.\n\nSKIN is still thin and red because the blood vessels are so close to the surface.\n\nEYES are moving rapidly behind the fused eyelids (REM sleep).\n\nBODY is becoming more proportional, though the head is still large.",
        bodyChanges: "⚖️ Your weight gain should be steady, about a pound a week. Your provider is tracking it to ensure a healthy progression.\n\n🤸‍♀️ Feeling your baby move is a daily (and often nightly!) occurrence. You're getting to know their patterns.\n\n🤰 Your fundal height should be about 23 centimeters from your pubic bone.\n\nYour expanding uterus is putting pressure on all of your internal organs.\n\nYour ligaments, especially in your pelvis and back, are continuing to loosen.\n\nYour breasts may begin to produce small amounts of colostrum (early milk).\n\nYour balance is compromised, so you need to be more careful.\n\nYour body's core temperature is slightly higher than usual.",
        symptoms: "😴 Snoring can start or worsen due to pregnancy hormones causing swelling in your nasal passages.\n\n🧠 Clumsiness and 'pregnancy brain' can continue as your center of gravity shifts and hormones rage.\n\n👟 Swelling in your ankles and feet, especially at the end of the day, is common.\n\nLINEA NIGRA, the dark line on your belly, may be more prominent.\n\nBackaches and hip pain are frequent complaints.\n\n🔥 Heartburn continues to be an issue.\n\nBraxton Hicks contractions may be happening occasionally.\n\nShortness of breath is common.",
        tips: "🏫 Sign up for childbirth education classes. They provide valuable information on labor, delivery, postpartum recovery, and newborn care.\n\n🏊 Stay active with safe exercises like swimming, which can make you feel weightless and relieve pressure on your joints.\n\n👟 To combat swelling, drink lots of water, avoid salty foods, and elevate your feet.\n\nBe mindful when moving around to prevent falls.\n\n🗣️ Talk to your doctor about any symptoms that concern you. No question is too small.\n\n👶 Research basic baby gear like car seats and strollers. Safety is the top priority.\n\n🤝 Connect with other expectant parents, either online or in person. Shared experience is powerful.\n\n😴 Nap whenever you can!",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "life preserver"
    },
    {
        week: 24,
        title: "Week 24: Responding to Touch",
        size: "Your baby is the size of an ear of corn.",
        development: "🧠 The baby's brain is growing very rapidly, and they are developing consciousness.\n\n✋ They can now feel movement and may respond if you gently press or rub your belly.\n\n🫁 The branches of the respiratory 'tree' in the lungs are developing, as are the cells that produce surfactant.\n\nFACE is almost fully formed and looks much like it will at birth.\n\nINNER EAR is fully developed, meaning their sense of balance is established.\n\nTASTE BUDS are fully mature.\n\nSKIN is still thin and translucent, but is becoming pinker as capillaries form.\n\nSLEEP patterns are becoming more consistent.",
        bodyChanges: "👩‍⚕️ Your doctor will likely recommend a glucose screening test between now and week 28 to check for gestational diabetes.\n\n🤰 Your uterus is now about the size of a soccer ball.\n\nYour belly is growing upwards, putting more pressure on your lungs.\n\nYour growing belly can make it difficult to see your feet!\n\nYour body continues to produce relaxin, making your joints and ligaments more flexible.\n\nYour skin is stretching, and you may have an itchy belly.\n\nYour breasts are fully capable of producing milk now, although they won't until after birth.\n\nYour circulation is working hard, which can sometimes lead to varicose veins.",
        symptoms: "🌵 Your skin and eyes might feel particularly dry due to hormonal changes.\n\n⚡️ You may start to feel Braxton Hicks contractions more noticeably—they feel like a tightening or hardening of your abdomen.\n\n🚶‍♀️ Your gait may change to a 'waddle' as you adjust to your new center of gravity.\n\n😴 Sleep disturbances are common, from discomfort to frequent bathroom trips.\n\n🔥 Heartburn, indigestion, and constipation are persistent.\n\nBackaches and pelvic pressure are common.\n\nFeeling out of breath, even with minimal exertion, is normal.\n\nSwelling in your hands and feet can be an issue.",
        tips: "💧 You will likely have to drink a sugary beverage for the glucose screening test. Follow your doctor's instructions carefully.\n\n👁️ Use lubricating eye drops (check with your doctor for a safe brand) if your eyes are feeling dry and irritated.\n\n🧘‍♀️ When you feel a Braxton Hicks contraction, try to relax, drink water, or change your position. They should ease up.\n\n🤝 Gently rubbing your belly is a great way to bond with your baby, who can now feel your touch.\n\n🚫 Don't be afraid to ask for help with things like putting on your shoes.\n\n🏫 Continue with your childbirth education classes.\n\n🍎 Eat a healthy diet to manage weight gain and provide essential nutrients for your baby.\n\n🏊‍♀️ Stay active, but listen to your body and don't overdo it.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "hand touching"
    },
    {
        week: 25,
        title: "Week 25: Hair Has Color and Texture",
        size: "Your baby is the size of a head of cauliflower.",
        development: "💇‍♀️ The baby's hair is continuing to grow and now has both color and texture.\n\n💨 They are practicing breathing by inhaling and exhaling amniotic fluid, which is vital for lung development.\n\n👃 Nostrils are beginning to open.\n\n🤲 The hands are now fully developed and can be opened and closed into fists.\n\nSPINAL CORD structure is maturing, with vertebrae, ligaments, and nerves all in place.\n\nBLOOD VESSELS are expanding and the capillaries are giving the skin a pinkish hue.\n\n⚖️ The baby is steadily gaining fat, which is smoothing out their wrinkled skin.\n\nREFLEXES are becoming more fine-tuned.",
        bodyChanges: "💥 Your growing uterus can put pressure on your sciatic nerve, causing sciatica—a sharp pain that radiates from your lower back or buttock down one leg.\n\n✋ Carpal tunnel syndrome (numbness, tingling, or pain in your hands and wrists) can appear due to pregnancy-related swelling pressing on nerves.\n\nYour belly is growing steadily, and you're looking more pregnant each day.\n\nYour balance is increasingly challenged.\n\nIt might be getting harder to take a deep breath.\n\nYour digestive system is very sluggish, leading to constipation.\n\nYour ligaments are very relaxed, which can cause pelvic or hip pain.\n\nYour body is storing fat in preparation for breastfeeding.",
        symptoms: "💥 Sciatic nerve pain can be a sharp, shooting, or burning pain down the back of your leg.\n\n✋ Numbness or tingling in your hands, especially at night, could be carpal tunnel syndrome.\n\n🦵 Restless leg syndrome (an uncontrollable urge to move your legs) can make it hard to sleep.\n\n😴 Insomnia and frequent waking are very common.\n\nHemorrhoids can be a painful result of constipation and pressure.\n\nYour 'outie' belly button may be more pronounced.\n\nFeeling hot and sweating more is normal.\n\nFeeling your baby move is a constant and reassuring presence.",
        tips: "🧘‍♀️ Gentle stretching (like pigeon pose) can help with sciatica. Avoid sitting or standing in one position for too long.\n\n👐 For carpal tunnel, try to avoid repetitive hand movements and consider wearing a wrist splint at night.\n\n🍌 For restless legs, try stretching before bed and ensure you're getting enough iron and magnesium.\n\n🌾 Combat constipation with a high-fiber diet, lots of water, and physical activity.\n\nSitz baths or witch hazel pads can soothe hemorrhoids.\n\n👶 Start thinking about your baby's name if you haven't already.\n\n📝 Begin to formulate your birth plan, thinking about your preferences for labor and delivery.\n\n🤝 Talk to other new moms about their experiences and advice.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "colorful hair"
    },
    {
        week: 26,
        title: "Week 26: Eyes Are Opening",
        size: "Your baby is the size of a bunch of scallions or a kale.",
        development: "👁️ The baby's eyelids, previously fused shut, are beginning to open and blink.\n\n💡 The retinas are developing, and the eyes can now perceive light and dark.\n\n🧠 Brainwave activity for hearing and sight is now recordable.\n\n🫁 The lungs are continuing to mature, producing more surfactant.\n\n💨 Rhythmic breathing movements are occurring about 10-20% of the time.\n\nIMMUNE system is developing as it receives antibodies from you through the placenta.\n\n⚖️ The baby is gaining about a third of an ounce each day.\n\nNAILS on fingers and toes are now fully grown.",
        bodyChanges: "📈 Your blood pressure may start to rise slightly after hitting a low point mid-pregnancy. Your doctor will monitor it closely for signs of preeclampsia.\n\n🤰 Your uterus is now about 2.5 inches above your belly button.\n\nYour center of gravity is very different, making you prone to clumsiness.\n\nSwelling in your feet and ankles can make your shoes feel tight.\n\nYour breasts might begin to produce small amounts of colostrum (early milk).\n\nBackaches are a constant companion for many.\n\nYour digestive system is still slow, leading to heartburn and constipation.\n\nYou're likely feeling the heat more due to your increased metabolism.",
        symptoms: "😴 You may have significant trouble sleeping due to your size, heartburn, leg cramps, or general discomfort.\n\n⚡️ Braxton Hicks contractions may become more frequent or noticeable. They should be irregular and not painful.\n\n🤕 Headaches can occur, but you should report any severe or persistent headache to your doctor.\n\nVISION changes like blurriness can happen, but should also be reported to your doctor.\n\nSwelling (edema) in your hands, feet, and face is something to watch.\n\nIncreased forgetfulness or 'pregnancy brain'.\n\nFeeling overwhelmed or anxious about the upcoming birth is normal.\n\nStrong fetal movements are a daily reassurance.",
        tips: "🛁 Create a relaxing bedtime routine to promote better sleep: a warm bath, reading a book, or listening to calming music.\n\n🛌 Use a fortress of pillows to support your body in a comfortable side-sleeping position.\n\n🚨 Learn the difference between Braxton Hicks and real labor contractions. Real contractions become stronger, longer, and closer together over time.\n\n👩‍⚕️ Be aware of the signs of preeclampsia: severe headache, vision changes, sudden swelling, and upper abdominal pain. Call your provider immediately if you experience these.\n\n👶 Finalize your choice for a pediatrician and make sure they are accepting new patients.\n\n🚗 Look into infant CPR and first aid classes for you and your partner.\n\n🗣️ Talk to your partner about the division of labor after the baby arrives.\n\n🧘‍♀️ Practice relaxation and breathing techniques you're learning in childbirth class.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "eye open"
    },
    {
        week: 27,
        title: "Week 27: Welcome to the Third Trimester!",
        size: "Your baby is the size of a head of lettuce.",
        development: "🧠 The baby's brain is very active now, with sulci and gyri (grooves and folds) forming on the surface.\n\n😴 They are likely sleeping and waking in more regular cycles, which you might start to notice.\n\nHICCUPS are common, and you may be able to feel these rhythmic, jerky movements.\n\nTASTE BUDS are now fully developed, and they can distinguish between sweet and sour.\n\n🫁 The lungs are continuing to mature, though they wouldn't be ready to work on their own just yet.\n\n⚖️ The baby has a 90% chance of survival if born now with medical intervention.\n\nFAT is continuing to be deposited under the skin, making the baby look plumper.\n\nEYES can open and close and can perceive changes in light.",
        bodyChanges: "🎉 You've reached the final trimester! The home stretch!\n\n😥 You might feel more tired again, similar to the fatigue of the first trimester, as the baby's growth demands a lot of energy.\n\n🤰 Your uterus is now up near your rib cage, putting pressure on your diaphragm and lungs.\n\n⚖️ You're in a period of rapid weight gain, as the baby will more than double in size from now until birth.\n\nYour back, hips, and pelvis may ache from the weight and pressure.\n\nYour breasts might leak more colostrum.\n\nYour belly button is likely a full-fledged 'outie'.\n\nSwelling in your extremities is common.",
        symptoms: "😮 Shortness of breath is very common as your uterus crowds your lungs.\n\n🔥 Backaches, swelling, leg cramps, and heartburn can all intensify in the third trimester.\n\n🦵 Restless Leg Syndrome can make it very difficult to relax in the evenings.\n\nConstipation and hemorrhoids are frequent complaints.\n\nItching, especially on the abdomen, can be intense.\n\nFeeling clumsy and off-balance is normal.\n\nAnxiety about labor and delivery might increase.\n\n⚡️ Braxton Hicks contractions become more frequent.",
        tips: "📝 Finalize your birth plan. Think about your preferences for pain management, laboring positions, and newborn procedures, but be prepared to be flexible.\n\n👜 It's not too early to pack your hospital bag so you're not scrambling at the last minute.\n\n🏥 Take a tour of the hospital or birthing center where you plan to deliver.\n\n👟 Put your feet up as much as possible and wear comfortable shoes to manage swelling.\n\n🗣️ Talk to your doctor about any concerns. Now is the time to ask all your questions about labor.\n\n💪 Continue with gentle exercise like walking or swimming to maintain strength and stamina.\n\n🥛 Eat smaller, more frequent meals to help with heartburn and feeling overly full.\n\n🤝 Line up your support system for after the baby arrives. Don't be afraid to ask for help!",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "finish line"
    },
    {
        week: 28,
        title: "Week 28: Eyes Have Eyelashes",
        size: "Your baby is the size of a large eggplant.",
        development: "✨ The baby can now blink and has a full set of eyelashes.\n\n👶 They are putting on more fat, which is smoothing out their previously wrinkled skin.\n\n🧠 Billions of neurons are developing in their brain, and they are capable of learning and memory.\n\n😴 The baby is experiencing REM (rapid eye movement) sleep, which means they are likely dreaming!\n\nHEAD is now more proportional to the body.\n\n🫁 Lungs are capable of breathing air, but would likely need medical support if born now.\n\nIMMUNITY is being boosted as they receive antibodies from you.\n\nBones are fully developed, but still soft and flexible for delivery.",
        bodyChanges: "👩‍⚕️ Your prenatal appointments will likely increase to every two weeks from now until 36 weeks.\n\n💉 If your blood type is Rh-negative, you'll receive a RhoGAM shot around this time to protect future pregnancies.\n\n🤰 You're gaining about a pound a week, and about half of that goes directly to the baby.\n\nYour fundal height is about 28 cm from your pubic bone.\n\nPelvic and back pain can increase as the hormone relaxin continues to loosen your ligaments.\n\nYour breasts are large, heavy, and may be leaking colostrum.\n\nYour growing belly can make simple tasks like bending over feel monumental.\n\nYour body is working hard, and you may feel winded easily.",
        symptoms: "🥴 You may feel especially clumsy and off-balance as your belly grows and your center of gravity shifts.\n\n⚡️ Braxton Hicks, restless legs, and general discomfort are common companions in the third trimester.\n\n😴 Insomnia is a frequent complaint, whether from discomfort, anxiety, or frequent bathroom trips.\n\n🔥 Heartburn can be particularly bad as your uterus crowds your stomach.\n\nSciatica and other nerve pains (like carpal tunnel) can act up.\n\nSwelling in your feet and hands is common.\n\nShortness of breath continues.\n\nItchy skin, especially on your abdomen, persists.",
        tips: "👟 Start doing daily 'kick counts' to monitor your baby's movements. Pick a time when your baby is usually active, relax, and see how long it takes to feel 10 movements. Call your doctor if you notice a significant decrease in activity.\n\n🚗 Finalize your choice of pediatrician and any childcare arrangements.\n\n📚 Read up on the 'fourth trimester'—the postpartum period. Knowing what to expect can ease the transition.\n\n🧘‍♀️ Practice breathing exercises. They are invaluable for managing pain during labor and for staying calm.\n\n🍎 Eat iron-rich foods (like lean meat, beans, and spinach) to prevent anemia, which is common at this stage.\n\n💧 Stay very well hydrated to help with swelling and prevent preterm labor.\n\n🤝 Discuss your birth plan with your doctor or midwife to ensure you're on the same page.\n\n💑 Plan a 'babymoon' or a special date night—it's a great time to connect before the baby arrives.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "eyelashes close-up"
    },
    {
        week: 29,
        title: "Week 29: Getting Crowded in There",
        size: "Your baby is the size of a butternut squash.",
        development: "🧠 The baby's head is growing to accommodate the rapidly developing brain and senses.\n\n🤸 As space gets tighter, movements may feel less like sharp kicks and more like strong stretches, rolls, and jabs.\n\nADRENAL GLANDS are maturing and producing hormones like cortisol.\n\nBones are absorbing a lot of calcium from you as they continue to harden.\n\n⚖️ The baby is gaining weight steadily, depositing fat stores that will help them regulate their temperature after birth.\n\nSKIN is becoming smoother and less red.\n\nThe baby is sensitive to light, noise, and touch.\n\n🫁 Lungs continue to mature in preparation for their first breath.",
        bodyChanges: "⚖️ You're likely gaining about a pound a week, with about half of that going directly to the baby.\n\n😣 The extra weight and pressure from your growing uterus can put a significant strain on your back, legs, and bladder.\n\nYour belly is growing, and you may feel that your skin is stretched to the max.\n\nYour ligaments are continuing to loosen, which can lead to pelvic girdle pain.\n\nYour breasts are heavy and may be leaking colostrum.\n\nYour cardiovascular system is working 50% harder than it did before pregnancy.\n\nIt's getting harder to bend over or see your own feet.\n\nYour body is producing more of the hormone prolactin, which is essential for milk production.",
        symptoms: "🔥 Heartburn and constipation can be particularly bothersome as your organs become more and more compressed.\n\n👟 Tying your shoes might feel like an Olympic sport.\n\nHemorrhoids are a common and painful problem.\n\n😴 Difficulty sleeping is almost universal at this stage.\n\n💨 Feeling short of breath is normal as your lungs have less room to expand.\n\n🦵 Leg cramps, backaches, and pelvic pain are frequent.\n\n⚡️ Braxton Hicks contractions may be happening more often.\n\nFeeling emotional or 'over it' is completely understandable.",
        tips: "🌾 To combat constipation, eat a high-fiber diet, drink plenty of water, and stay as active as you comfortably can. Talk to your doctor before taking any stool softeners.\n\n🚽 Don't strain during bowel movements, and try using a stool to elevate your feet.\n\n🥛 You need about 1,000 milligrams of calcium per day for your baby's bones. If you don't get enough from your diet, your body will take it from your own stores. Good sources include dairy, fortified orange juice, and leafy greens.\n\n👟 Put your feet up whenever you can, and sleep on your left side to improve circulation and reduce swelling.\n\n🚗 If you haven't already, install the baby's car seat and have it checked by a certified technician.\n\n👶 Wash some of the baby's new clothes and blankets in a gentle, baby-safe detergent.\n\n👩‍🏫 Practice the pain-coping techniques you've learned, like breathing, visualization, and massage.\n\n❤️ Take time for yourself. A warm bath, a good book, or coffee with a friend can do wonders for your mood.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "crowded space"
    },
    {
        week: 30,
        title: "Week 30: Seeing in the Womb",
        size: "Your baby is the size of a large cabbage.",
        development: "👁️ The baby's eyesight continues to develop. They can now perceive light filtering through your abdomen and may turn their head in response.\n\nLANUGO, the fine body hair, is beginning to disappear, though some may remain at birth.\n\nBONE MARROW has completely taken over the production of red blood cells.\n\n🧠 The brain is taking on its characteristic wrinkled and grooved appearance, which allows for a greater surface area.\n\n⚖️ The baby is gaining about half a pound per week from now on.\n\nNAILS on the fingers have reached the fingertips.\n\nThe baby can distinguish your voice from others.\n\nTheir movements are strong and you can likely identify body parts like a foot or an elbow pressing against your belly.",
        bodyChanges: "😴 Fatigue can return with a vengeance, rivaling what you felt in the first trimester. Your body is working hard, and sleep is elusive.\n\n🤰 Your uterus is now about 4 inches above your belly button.\n\nYour growing belly can throw off your sense of balance significantly.\n\nIt's becoming very difficult to get comfortable in any position, whether sitting, standing, or lying down.\n\nYour ankles and feet may be noticeably swollen by the end of the day.\n\nShortness of breath is common as your uterus presses on your diaphragm.\n\nYour breasts are large and may be leaking more colostrum.\n\nYour body is preparing for labor, and you might notice more Braxton Hicks contractions.",
        symptoms: "둥지 The 'nesting' instinct might kick in—an overwhelming desire to clean, organize, and prepare your home for the baby.\n\n🎭 Mood swings, impatience, and anxiety about the upcoming labor and life change are very common.\n\n😴 Insomnia due to discomfort and a busy mind is a major complaint.\n\n🔥 Heartburn and indigestion are still fiery foes.\n\n🚶‍♀️ Backaches and pelvic pressure are par for the course.\n\nItchy skin on your belly continues.\n\nFeeling hot and sweaty is your new normal.\n\nClumsiness is a real risk, so move carefully.",
        tips: "🧹 Channel your nesting energy productively, but don't overdo it. Focus on small, manageable tasks like organizing drawers or packing the hospital bag. Don't climb ladders or move heavy furniture.\n\n🗣️ Talk about your feelings. Share any anxieties you have about labor, delivery, or parenthood with your partner, a friend, or your healthcare provider.\n\n🧘‍♀️ Practice relaxation techniques daily. Deep breathing, meditation, or listening to guided imagery can help calm your mind.\n\n👜 Finish packing your hospital bag and your baby's bag. Keep them by the door.\n\n👶 Finalize your baby name choices.\n\n🏥 Know the route to the hospital and have a backup plan.\n\n😴 Nap whenever you get the chance. Don't feel guilty about resting; it's what your body needs.\n\n🤝 Accept offers of help from friends and family.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "light through window"
    },
    {
        week: 31,
        title: "Week 31: Practice Breathing",
        size: "Your baby is the size of a coconut.",
        development: "💨 The baby is making rhythmic breathing movements, though their lungs are not yet fully mature. This is practice for life on the outside.\n\n🌡️ They can now regulate their own body temperature to some extent.\n\nSENSES are all functional: sight, sound, taste, and touch are all working.\n\n💅 The toenails have now reached the tips of the toes.\n\nSUCKING reflex is strong, and you might catch them sucking their thumb on an ultrasound.\n\nURINATING about a pint of urine into the amniotic fluid each day.\n\n🧠 The connections between individual nerve cells (neurons) are forming at an incredible rate.\n\n⚖️ The baby will gain a third to half of their birth weight during the next seven weeks.",
        bodyChanges: "💧 You may start to leak colostrum, the yellowish 'first milk,' from your breasts. This is a sign your body is getting ready for breastfeeding.\n\n⚡️ Braxton Hicks contractions may be more frequent now. They're typically painless but can be uncomfortable.\n\nYour growing uterus is crowding all of your organs, from your bladder to your lungs to your stomach.\n\nYour ligaments are very loose, which can lead to an unstable feeling in your pelvis.\n\nYour heart is working very hard, pumping 30-50% more blood.\n\nYour baby's kicks might be strong enough to take your breath away, especially if they're aimed at your ribs.\n\nFinding a comfortable position to sit or sleep in is a major challenge.\n\nYour weight gain is steady.",
        symptoms: "🚽 The need to urinate becomes even more frequent as the baby's head may be pressing on your bladder.\n\n😴 Sleep is increasingly fragmented and difficult.\n\n🔥 Heartburn and shortness of breath are common as your organs run out of space.\n\n🚶‍♀️ A waddling gait is now pretty much standard.\n\nHemorrhoids and constipation can be very uncomfortable.\n\nBack pain is a constant for many.\n\nLeg cramps can wake you up at night.\n\nFeeling impatient and ready to be done is completely normal.",
        tips: "パッド If you're leaking colostrum, you can tuck disposable or reusable nursing pads into your bra to absorb moisture.\n\n📚 If you plan to breastfeed, this is a good time to read up on it, watch videos, or find a local lactation consultant or support group.\n\n🚨 Distinguish between Braxton Hicks and real labor. If contractions become regular, stronger, and closer together, or if your water breaks, call your provider.\n\n🥣 Stock your freezer with easy-to-reheat meals for the first few weeks postpartum. You'll be so glad you did.\n\n👶 Set up the baby's safe sleep space (bassinet or crib) with a firm mattress and a fitted sheet only.\n\nKeep your feet elevated as much as possible to help with swelling.\n\n🧘‍♀️ Continue with gentle stretches to relieve aches and pains.\n\n❤️ Spend quality time with your partner. Life is about to change in a big and beautiful way.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "breathing exercise"
    },
    {
        week: 32,
        title: "Week 32: Getting into Position",
        size: "Your baby is the size of a jicama or large squash.",
        development: "👇 The baby is likely moving into the head-down (vertex) position in preparation for birth. Some may remain in a breech (feet-down) position for now.\n\n💅 Toenails are now fully formed, and fingernails are at the fingertips.\n\n솜 The downy lanugo hair that covered the body is starting to shed, though some may be present at birth.\n\nSKIN is becoming more opaque, thicker, and smoother as fat accumulates.\n\nBONES are fully formed but are still soft and pliable, especially the skull plates, which will overlap to help navigate the birth canal.\n\n👁️ The pupils can now constrict and dilate in response to light.\n\nIMMUNE system is continuing to borrow antibodies from you.\n\nLUNGS are still maturing, but the baby is practicing breathing motions regularly.",
        bodyChanges: "👩‍⚕️ Your healthcare provider will start checking the baby's position at your appointments by feeling your abdomen.\n\n🦶 If the baby is head-down, you might feel their kicks higher up, under your ribs. If they're breech, kicks will be lower down.\n\n😮‍💨 You might be feeling very short of breath and experiencing significant heartburn, as your uterus is at its highest point, right under your sternum.\n\n⚖️ Your blood volume has increased by 40-50% over your pre-pregnancy level.\n\nYour belly button is likely protruding quite a bit.\n\nYour joints, particularly in your pelvis, are very loose.\n\nYour body is continuing to gain about a pound a week.\n\nColostrum leakage may be more frequent.",
        symptoms: "😮‍💨 Shortness of breath and heartburn are often at their peak around this time.\n\n💥 Strong Braxton Hicks contractions are more frequent, helping to tone the uterus for labor.\n\nLower back pain and pelvic pressure are intense.\n\n😴 Sleep is very elusive due to discomfort and frequent urination.\n\nVaricose veins and hemorrhoids can be troublesome.\n\nClumsiness and a waddling gait are your new norm.\n\nItchy skin on your stretched abdomen can be very distracting.\n\nFeeling large, uncomfortable, and impatient is the theme of the week.",
        tips: "🚨 Familiarize yourself with the signs of preterm labor: contractions every 10 minutes or more, constant low backache, fluid leakage, or pelvic pressure. Call your doctor immediately with any concerns.\n\n👶 If your provider determines your baby is breech, they may discuss options like an external cephalic version (ECV) to try and turn the baby in a few weeks.\n\n🍽️ Eat small, frequent meals to combat heartburn and the feeling of having no room for food.\n\n🧘‍♀️ Sleep propped up on pillows to help with heartburn and breathing.\n\n🚗 Have the car seat installed and ready to go.\n\nDiscuss your maternity leave and postpartum plans with your employer and partner.\n\nPrepare your other children or pets for the new arrival.\n\nPack your hospital bag if you haven't already. Don't forget snacks and a phone charger!",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "gymnast pose"
    },
    {
        week: 33,
        title: "Week 33: Harder Bones",
        size: "Your baby is the size of a pineapple.",
        development: "🦴 The baby's bones are continuing to harden, though the skull plates will remain soft and separated to allow for an easier passage through the birth canal.\n\n🛡️ They are absorbing a huge amount of antibodies from you, which will provide them with immunity for the first few months of life.\n\n🧠 The brain is still developing at a rapid pace.\n\nFAT layers are continuing to plump up the baby, which will help regulate body temperature after birth.\n\nSKIN is becoming less red and wrinkled.\n\nAMNIOTIC FLUID is at its peak volume now, providing a cushion for the baby.\n\n👂 The baby is listening intently to your voice and other sounds.\n\nSUCKING and swallowing skills are being perfected in preparation for feeding.",
        bodyChanges: "🤰 The volume of amniotic fluid is at its maximum, making your belly feel very tight and stretched.\n\nYour fundal height is about 33 cm from your pubic bone.\n\nYou are continuing to gain about a pound per week.\n\nYour body is working hard, and you may feel easily fatigued.\n\nYour ligaments are very loose, and you might feel wobbly or unstable.\n\nShortness of breath is still an issue, but may improve if the baby 'drops' soon.\n\nYour bladder is under immense pressure, leading to constant bathroom trips.\n\nYour breasts are heavy and ready for nursing.",
        symptoms: "⚡️ You might feel tingling or numbness in your fingers and toes due to water retention and pressure on nerves (carpal tunnel).\n\nOverheating is a common complaint as your metabolism is in high gear.\n\n😴 Difficulty finding a comfortable sleeping position is a nightly struggle.\n\n🔥 Heartburn and indigestion are still major players.\n\nBackaches, hip pain, and pelvic pressure are ongoing.\n\nAnxiety about the upcoming labor can increase.\n\nFeeling 'touched out' or sensitive to physical contact is normal.\n\nImpatience to meet your baby is growing every day.",
        tips: "🥛 Keep up your calcium intake to support your baby's hardening bones and protect your own bone density. Aim for around 1,200 mg per day.\n\n👟 Wear supportive shoes and don't be shy about asking for help with tasks like putting them on.\n\n🧘‍♀️ A warm bath can be very soothing for aches and pains. Make sure it's not too hot.\n\n👩‍🏫 Finalize your birth plan, but remember to stay flexible. Labor can be unpredictable.\n\n🧑‍🤝‍🧑 Confirm who will be with you during labor and delivery for support.\n\nFreeze some 'padsicles' (maternity pads with witch hazel and aloe) for postpartum relief.\n\n😴 Rest whenever possible. Put your feet up and conserve your energy for the marathon of labor.\n\n🗣️ Talk to your baby. It's a wonderful way to bond before you even meet.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "strong bones"
    },
    {
        week: 34,
        title: "Week 34: Baby's Lungs Maturing",
        size: "Your baby is the size of a cantaloupe.",
        development: "🫁 The baby's lungs are now well-developed, and they are producing a good amount of surfactant. A baby born now would have a very good chance of breathing without assistance.\n\n👦 If you're having a boy, his testicles have likely descended from his abdomen into the scrotum.\n\nVERNIX CASEOSA, the waxy coating on the skin, is getting thicker.\n\nFAT continues to accumulate, especially around the shoulders.\n\nFINGERNAILS have reached the tips of the fingers and might need a trim soon after birth!\n\nIMMUNE system is maturing.\n\nSKULL bones are still soft and not yet fused.\n\nVISION is developing, and they can track light.",
        bodyChanges: "✨ You might feel the baby 'drop' into your pelvis. This is called lightening and is a sign your body is preparing for labor.\n\n😮‍💨 If the baby drops, it can relieve pressure on your diaphragm, making it much easier to breathe. The tradeoff is even more bladder pressure.\n\nYour cervix might be starting to soften and thin out (efface) in preparation for delivery.\n\nYour joints are very loose, so be careful with your movements.\n\nYour Braxton Hicks contractions might be getting stronger and more frequent.\n\nYour ankles and feet are likely quite swollen, especially at the end of the day.\n\nYour weight gain is slowing down or might even stop in these last few weeks.\n\nFatigue is significant.",
        symptoms: "🚽 If the baby has dropped, you'll experience even more frequent urination and a feeling of heaviness or pressure in your pelvis.\n\n😮‍💨 On the plus side, you might have less heartburn and be able to take a deeper breath.\n\n😴 Sleep is still a major challenge due to discomfort.\n\nBackaches are persistent.\n\nBlurry vision can occur. Mention it to your doctor, but it's often due to hormones and fluid shifts.\n\nFeeling of nesting may be strong.\n\nImpatience is likely at an all-time high.\n\nFeeling large and ungainly is normal.",
        tips: "😴 Rest as much as possible. Your body is about to do the hardest work of its life. Put your feet up whenever you can.\n\n🤝 Don't hesitate to ask for and accept help from your support system for chores, errands, or just emotional support.\n\n perineal massage. Some research suggests it may help reduce the risk of tearing during delivery. Talk to your provider about it.\n\n🏥 Know the signs of labor vs. Braxton Hicks. True labor contractions will become stronger, longer, and closer together and won't stop with a change in activity.\n\n💧 Drink lots of water, which can help reduce Braxton Hicks contractions and swelling.\n\n🚗 Do a trial run to the hospital so you know the route, where to park, and where to enter.\n\n👶 Finish any last-minute baby shopping or nursery prep.\n\n❤️ Enjoy these last moments of pregnancy. Meditate, listen to music, and connect with your baby.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "lungs diagram"
    },
    {
        week: 35,
        title: "Week 35: Rapid Weight Gain",
        size: "Your baby is the size of a honeydew melon.",
        development: "⚖️ The baby is packing on about half a pound to a pound a week. This fat will help them regulate body temperature and blood sugar after birth.\n\n🫁 The lungs are almost fully mature.\n\nKIDNEYS are fully developed and processing waste.\n\nLIVER can now process some waste products as well.\n\nSpace is very tight, so movements might feel less like acrobatic kicks and more like strong, rolling motions.\n\nSUCKING reflex is well-established.\n\nLISTENING intently to the sounds of your world.\n\nGETTING into the final head-down position if they haven't already.",
        bodyChanges: "👩‍⚕️ Your prenatal visits are likely weekly now. Your provider will check your blood pressure, urine, and the baby's position and heart rate.\n\n🦠 Your provider will perform a Group B strep (GBS) test between now and week 37. It's a routine swab to check for bacteria that is harmless to you but could affect the baby during delivery.\n\nYour uterus has grown to about 1,000 times its original size.\n\nThe top of your uterus is right up under your ribs.\n\nYour cervix may be continuing to dilate (open) and efface (thin).\n\nYour body is conserving energy for the big event.\n\nPelvic pressure and discomfort are significant.\n\nYour total weight gain is likely between 24 and 29 pounds.",
        symptoms: "😩 You're likely feeling very uncomfortable, tired, and impatient. The end is in sight!\n\n😴 Waking up frequently at night to shift positions or use the bathroom is standard procedure.\n\n🚽 The need to urinate is constant, as the baby's head is like a bowling ball on your bladder.\n\n⚡️ Braxton Hicks contractions continue, and may be stronger.\n\nHeartburn, constipation, and hemorrhoids are ongoing issues.\n\nSwelling in your hands and feet.\n\nSharp nerve pains in your pelvis or legs.\n\nA general feeling of being 'done' with pregnancy.",
        tips: "🚨 Review the signs of labor with your partner and know when to call your doctor or head to the hospital (e.g., contractions 5 minutes apart, lasting 1 minute, for 1 hour; water breaking).\n\n👜 Have your hospital bags packed and in the car.\n\n👶 Finalize the setup of the nursery and baby gear.\n\n🥣 Stock your pantry and freezer with easy meals and snacks for the postpartum period.\n\n👩‍⚕️ If your GBS test is positive, don't worry. You'll simply receive IV antibiotics during labor to protect the baby.\n\n🧘‍♀️ Continue practicing your breathing and relaxation techniques.\n\n💧 Keep drinking plenty of water.\n\n😴 Prioritize rest above all else. Let the housework go and put your feet up.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "weight scale"
    },
    {
        week: 36,
        title: "Week 36: Almost Full-Term",
        size: "Your baby is the size of a large head of romaine lettuce.",
        development: "👶 Your baby is now considered 'early term.' They are getting ready for their debut!\n\n😙 They are practicing sucking and swallowing to prepare for their first meals.\n\nCHEEKS have filled out with fat, giving them a plump appearance.\n\nSKULL bones are still unfused, which allows them to overlap for an easier journey through the birth canal.\n\nLANUGO is shedding, and the vernix caseosa is still providing a protective coating.\n\nThe baby's movements are less dramatic due to lack of space but should still be consistent.\n\nLUNGS are continuing to mature.\n\nDIGESTIVE system is ready for milk.",
        bodyChanges: " cervix may be starting to efface (thin) and dilate (open). Your provider may start offering cervical checks to gauge progress (you can decline these).\n\n✨ The baby may have 'dropped' into your pelvis (lightening), which gives your lungs more room but puts immense pressure on your bladder.\n\nYour prenatal appointments are now weekly.\n\nYour body is likely feeling very heavy and cumbersome.\n\nYour weight gain may slow or stop completely.\n\nBraxton Hicks may be more frequent and intense.\n\nYour nesting instinct could be in overdrive.\n\nYour emotions might be a mix of excitement, fear, and extreme impatience.",
        symptoms: "PRESSURE in your pelvis and rectum is significant, especially if the baby has dropped.\n\nDISCHARGE may increase and change in consistency.\n\n😴 Sleep is often poor due to discomfort and anxiety.\n\nBackaches are a constant presence.\n\nSwelling in your feet and ankles is common.\n\n⚡️ You may experience lightning-like nerve pains in your pelvis or vagina as the baby settles.\n\nIt's hard to eat a large meal because your stomach is so squished.\n\nYou have to pee all the time.",
        tips: "🚗 Have the baby's car seat properly installed and inspected by a certified technician.\n\n🍲 Do some final meal prep. Freeze easy meals for the postpartum period when you won't have time or energy to cook.\n\n👟 Keep monitoring your baby's movements with kick counts. Call your provider if you notice a decrease in activity.\n\nWalk around and stay upright to use gravity to help the baby settle into your pelvis.\n\nFinalize your plan for who to call and what to do when labor starts.\n\nPut a waterproof mattress protector on your bed in case your water breaks at night.\n\n🧘‍♀️ Rest, relax, and try to enjoy this quiet time. Watch movies, read books, take baths.\n\n🤝 Talk to your partner about your expectations for labor and the first few days with the baby.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "baby clothes"
    },
    {
        week: 37,
        title: "Week 37: Full-Term!",
        size: "Your baby is the size of a bunch of Swiss chard.",
        development: "🎉 Congratulations, your baby is now considered 'full-term'! This means their lungs and brain are mature enough for life outside the womb.\n\n🫁 Their lungs are mature and ready to take their first breath of air.\n\nGRASP is firm and coordinated.\n\nHEAD is now likely settled down into your pelvis ('engaged').\n\nHAIR on their head could be over an inch long.\n\nThe baby is getting its final coating of vernix.\n\nThey don't have much room to move, but you should still feel regular activity.\n\nBRAIN and nervous system are fine-tuning their connections.",
        bodyChanges: "⏰ You could go into labor any day now, or in a few weeks. Every pregnancy is different!\n\n💧 You might lose your mucus plug or see a 'bloody show' (discharge tinged with blood). This is a sign your cervix is changing and labor could be hours or days away.\n\nYour cervix is continuing to soften, efface, and possibly dilate.\n\nBraxton Hicks contractions might feel more like the real thing, which can be confusing.\n\nPelvic pressure is intense.\n\nYour provider will continue to monitor you and the baby closely each week.\n\nYour body has done its job of growing a baby; now it's preparing to deliver.\n\nEmotional state can be a rollercoaster of anticipation and anxiety.",
        symptoms: "CONFUSION between true and false labor is very common.\n\n💧 Increased or different vaginal discharge is a key sign to watch for.\n\n⚡️ 'Lightning crotch'—sharp, shooting pains in the pelvis or vagina—is common as the baby presses on nerves.\n\nPelvic pressure and rectal pressure can feel intense.\n\nLow, dull backache that comes and goes.\n\nCramping similar to menstrual cramps.\n\nA sudden burst of energy or nesting instinct.\n\nDifficulty walking or feeling very wobbly.",
        tips: "🧘‍♀️ Relax and conserve your energy. Don't try to 'force' labor with intense activity. Gentle walks are great, but rest is paramount.\n\n🚨 Know the signs of when to go to the hospital. Follow the 5-1-1 rule (contractions are 5 mins apart, last 1 min, for at least 1 hour) or your provider's specific instructions.\n\n📞 Keep your phone charged and your support people in the loop.\n\nHave your hospital bags by the door.\n\nTrust your instincts. If something feels off, or you think you might be in labor, it's always okay to call your doctor or midwife.\n\nTry to sleep, even if it's justin short bursts.\n\nEat small, easily digestible snacks to keep your energy up.\n\nTake a deep breath. You are ready for this, and you will meet your baby soon!",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "calendar due date"
    },
    {
        week: 38,
        title: "Week 38: Getting Ready",
        size: "Your baby is the size of a leek or small pumpkin.",
        development: "✊ The baby has a firm grasp and will be able to hold your finger tightly after birth.\n\n💩 They have about an ounce of meconium (their first tar-like bowel movement) in their intestines.\n\nEYE color is likely blue or gray at birth, but the true color may not be apparent for months.\n\nBRAIN is still adding connections and growing.\n\nThe baby's fat layers are making them nice and plump.\n\nThey are shedding the last of their lanugo and vernix.\n\nCIRCUMFERENCE of the head and abdomen are about the same size.\n\nLUNGS are fully mature.",
        bodyChanges: "⏳ You are in a waiting game. Every twinge and cramp will have you wondering, 'Is this it?'\n\nYour cervix is likely making changes, even if you don't feel them.\n\nYour provider might offer a 'membrane sweep' at your appointment to try and encourage labor, which you can accept or decline.\n\nYour body is producing more relaxin to loosen the pelvic ligaments.\n\nYour weight gain has likely plateaued.\n\nWalking can feel very awkward and uncomfortable.\n\nYour breasts are full and may be leaking colostrum.\n\nYou are physically and emotionally ready for pregnancy to be over.",
        symptoms: "🎈 Swelling in your feet and ankles can be significant.\n\n😣 General discomfort is at an all-time high.\n\n😴 It is nearly impossible to get a full night's sleep.\n\nAnxiety and excitement are mixed together.\n\nFalse labor (Braxton Hicks that are strong but irregular) can be very frustrating.\n\nPelvic pressure is intense.\n\nBackaches are a given.\n\nYou might feel surprisingly calm or incredibly antsy.",
        tips: "😴 Rest, rest, rest. Sleep and nap whenever you can. You're storing up energy for labor.\n\n🍓 Eat small, easily digestible snacks to keep your energy levels stable.\n\n🚶‍♀️ Gentle walking can help ease discomfort and encourage the baby to settle into the pelvis.\n\n Bounce on a birth ball to help open your hips.\n\nWatch for signs of your water breaking—it can be a big gush or a slow, steady trickle.\n\nIf your water breaks, call your provider and note the time, color, and odor of the fluid.\n\nEnjoy the final quiet moments. Read a book, watch a favorite movie, listen to music.\n\nTrust your body. It knows what to do.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "running race"
    },
    {
        week: 39,
        title: "Week 39: On The Brink",
        size: "Your baby is the size of a watermelon.",
        development: "🧠 The baby's brain is still developing at an amazing rate and will continue to do so for the first few years of life.\n\nFAT continues to be deposited, which is crucial for temperature regulation after birth.\n\nSKIN is now smooth and pale due to the thick fat layer underneath.\n\nLUNGS are continuing to produce surfactant, ensuring they'll work well.\n\nANTIBODIES are still being passed from you to the baby, providing passive immunity.\n\nThe baby is likely in the head-down position, ready for birth.\n\nThey have little room for big movements, but you should still feel plenty of wiggles and shifts.\n\nThey are fully ready for the outside world.",
        bodyChanges: "👩‍⚕️ Your doctor might discuss the possibility of induction if you go too far past your due date, outlining the risks and benefits.\n\nYour cervix is probably soft and may be slightly dilated.\n\nLosing your mucus plug is a common sign at this stage.\n\nYour body is in the final stages of preparation for the marathon of labor.\n\nWalking is likely slow and deliberate.\n\nYour emotions can be a tangle of excitement, fear, and sheer exhaustion.\n\nEvery day feels like an eternity.\n\nYour body feels heavy and tired.",
        symptoms: "😬 The end is in sight! Labor could start at any moment.\n\n⚡️ Strong and frequent Braxton Hicks contractions are common.\n\nIncreased pelvic pressure and low backache.\n\nTrouble sleeping is a given.\n\nFeeling clumsy and having difficulty with simple movements.\n\nSwelling in your legs, feet, and hands.\n\nDiarrhea or loose stools can be a sign that labor is imminent.\n\nA strange mix of exhaustion and a sudden burst of nesting energy.",
        tips: "🧘‍♀️ Stay calm and trust the process. When labor starts, remember your breathing techniques and coping mechanisms.\n\n💪 You are strong, and you can do this. Remind yourself of your power.\n\nCall your provider if you think you're in labor or if your water breaks.\n\nTry to relax. Stress and anxiety can sometimes stall labor.\n\nStay hydrated and keep eating small snacks.\n\nLet your support person know what you need from them during labor.\n\nGo for a gentle walk to pass the time and let gravity do its work.\n\nDouble-check that your hospital bag has everything you need.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "calm water"
    },
    {
        week: 40,
        title: "Week 40: Due Date!",
        size: "Your baby is the size of a small pumpkin.",
        development: "👶 The baby is fully developed and just waiting for the signal to begin their journey into the world.\n\n⚖️ The average baby at this stage weighs between 6 and 9 pounds and is 19 to 22 inches long.\n\nHAIR and nails are continuing to grow.\n\nThe vernix caseosa is still protecting their skin.\n\nThey are snugly tucked into your pelvis.\n\nLUNGS are ready and waiting to take that first breath.\n\nAll organ systems are mature and ready for life on the outside.\n\nThey are biding their time until their birthday arrives.",
        bodyChanges: "📅 Your due date is here, but it's just an estimate. Only about 5% of babies are born on their actual due date.\n\nTry not to be discouraged if your due date comes and goes. It's very common to go a bit beyond 40 weeks, especially with a first baby.\n\nYour provider will be monitoring you and the baby very closely.\n\nThey will likely discuss induction options with you if you go to 41 or 42 weeks.\n\nYour body is physically and hormonally primed for labor.\n\nYour cervix is likely effaced and may be dilated.\n\nYour patience is being tested to its absolute limit.\n\nYou are on high alert for any sign of labor starting.",
        symptoms: "😣 You are likely feeling a potent combination of being physically miserable and incredibly excited.\n\n😴 Sleep is something that happens to other people.\n\nEverything hurts: your back, your hips, your pelvis.\n\nWalking is a chore.\n\nStrong, frequent Braxton Hicks keep you guessing.\n\nConstant pressure on your bladder and rectum.\n\nExtreme impatience and frustration are normal if your due date passes.\n\nYou are ready to not be pregnant anymore.",
        tips: "🌶️ If you're feeling antsy, you can try some methods that are *thought* to encourage labor, like walking, having sex, or eating spicy food (with your doctor's approval, of course). There's little scientific evidence, but it can make you feel more proactive.\n\nsoon you'll be holding your baby! This is the most important thing to remember.\n\nTrust your body and your baby. They know the right time.\n\nIf you're scheduled for an induction, ask your provider questions so you know what to expect.\n\nRest as much as humanly possible.\n\nStay in close contact with your provider.\n\nLean on your support system.\n\nTake one day at a time. Your baby will be here before you know it.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "baby holding finger"
    }
];

const trimesterVideos: { [key: number]: string } = {
    1: "https://www.youtube.com/embed/-LHNfkaaMFA",
    2: "https://www.youtube.com/embed/IPj4dJnP85o",
    3: "https://www.youtube.com/embed/lpDW00nQhUo",
};

const babyLookVideos: { [key: number]: string } = {
    1: "https://www.youtube.com/embed/D_jxGJsEY2A",
    2: "https://www.youtube.com/embed/H6mZRds0dHo",
    3: "https://www.youtube.com/embed/f2dcTHQXwTI",
};


const milestoneMessages: { [key: number]: { title: string; description: string } } = {
    13: { title: "Trimester 1 Complete!", description: "You've made it through the first trimester! Many of the early discomforts may start to fade." },
    27: { title: "Welcome to the Third Trimester!", description: "You're on the home stretch! Your baby will be doing a lot of growing from here." },
    30: { title: "Just 10 Weeks to Go!", description: "You've reached 30 weeks! Time to start finalizing preparations for your baby's arrival." },
    37: { title: "Your Baby is Full-Term!", description: "Congratulations! Your baby is considered full-term and could arrive any day now." },
    40: { title: "Happy Due Date!", description: "The big day is here! Remember, due dates are just an estimate. Your baby will arrive when they're ready." },
};

const supportiveMessages: { [key: number]: string } = {
    9: "Feeling overwhelmed in week 9 is common. Your body is doing incredible work. You’re doing amazing.",
    15: "Your baby is growing fast — and so are you. Don’t forget to rest today.",
    22: "Seeing your baby on the ultrasound is a magical moment. Cherish this halfway point!",
    34: "Feeling breathless? Your baby is taking up a lot of space. This is normal, but take it easy.",
    38: "The waiting game is tough, but you're so close to meeting your little one. You've got this.",
};


export default function PregnancyTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pregnancyDetails, setPregnancyDetails] = useState<PregnancyDetails | null>(null);
  const displayedToastWeekRef = useRef<number | null>(null);

  const pregnancyForm = useForm<PregnancyFormData>({
    resolver: zodResolver(pregnancyFormSchema),
    defaultValues: {
      calculationMethod: 'dueDate',
    },
  });

  const symptomForm = useForm<SymptomFormData>({
    resolver: zodResolver(symptomFormSchema),
    defaultValues: {
        symptoms: [],
        notes: "",
    },
  });

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(PREGNANCY_TRACKER_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        data.dueDate = new Date(data.dueDate);
        calculateDetails(data.dueDate);
      }
    } catch (error) {
        console.error("Could not retrieve data from localStorage", error);
    }

    try {
        const todayKey = format(new Date(), 'yyyy-MM-dd');
        const storedSymptoms = localStorage.getItem(`${PREGNANCY_SYMPTOM_LOG_PREFIX}${todayKey}`);
        if(storedSymptoms) {
            symptomForm.reset(JSON.parse(storedSymptoms));
        }
    } catch (error) {
        console.error("Could not retrieve symptoms from localStorage", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pregnancyDetails && pregnancyDetails.gestationalAgeWeeks !== displayedToastWeekRef.current) {
        const week = pregnancyDetails.gestationalAgeWeeks;
        const milestone = milestoneMessages[week];
        const supportiveMessage = supportiveMessages[week];

        if(milestone){
            toast({
                title: (
                    <div className="flex items-center gap-2">
                        <PartyPopper className="text-yellow-400" />
                        <span className="font-bold">{milestone.title}</span>
                    </div>
                ),
                description: milestone.description,
                duration: 5000,
            });
        } else if (supportiveMessage) {
            toast({
                title: "A Little Note For You",
                description: supportiveMessage,
                duration: 5000,
            });
        }
        displayedToastWeekRef.current = week;
    }
  }, [pregnancyDetails, toast]);


  const calculateDetails = (dueDate: Date) => {
    const today = startOfDay(new Date());
    const startDate = subDays(dueDate, 280); // 40 weeks * 7 days
    
    const totalDays = differenceInDays(today, startDate);
    if (totalDays < 0) {
        toast({
            variant: 'destructive',
            title: "Invalid Date",
            description: "The calculated pregnancy start date is in the future. Please check your entered date.",
        });
        return;
    }
    const gestationalAgeWeeks = Math.floor(totalDays / 7);
    const gestationalAgeDays = totalDays % 7;

    const daysLeft = differenceInDays(dueDate, today);

    let trimester = 1;
    if (gestationalAgeWeeks >= 28) trimester = 3;
    else if (gestationalAgeWeeks >= 14) trimester = 2;

    const details = {
        dueDate,
        gestationalAgeWeeks,
        gestationalAgeDays,
        daysLeft,
        trimester
    };
    
    setPregnancyDetails(details);
    try {
        localStorage.setItem(PREGNANCY_TRACKER_KEY, JSON.stringify({ dueDate }));
    } catch(e) { console.error(e) }

  }

  function onPregnancyFormSubmit(values: PregnancyFormData) {
    let calculatedDueDate: Date;
    if (values.calculationMethod === 'lmp') {
      calculatedDueDate = addDays(values.date, 280); // Naegele's rule
    } else {
      calculatedDueDate = values.date;
    }
    
    calculateDetails(calculatedDueDate);

    toast({
      title: "Pregnancy Tracked!",
      description: "Your due date and progress have been calculated.",
    });
  }
  
  function onSymptomFormSubmit(values: SymptomFormData) {
    try {
        const todayKey = format(new Date(), 'yyyy-MM-dd');
        localStorage.setItem(`${PREGNANCY_SYMPTOM_LOG_PREFIX}${todayKey}`, JSON.stringify(values));
        toast({
            title: "Symptoms Logged!",
            description: "Today's symptoms have been saved successfully.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save your symptoms. Please try again.",
        });
    }
  }


  const currentWeekData = pregnancyDetails ? weeklyDevelopment[pregnancyDetails.gestationalAgeWeeks] : null;
  const currentVideoUrl = pregnancyDetails ? trimesterVideos[pregnancyDetails.trimester] : null;
  const babyLookVideoUrl = pregnancyDetails ? babyLookVideos[pregnancyDetails.trimester] : null;
  const loggedSymptoms = symptomForm.watch('symptoms') || [];

  if (pregnancyDetails) {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-slate-100">
             <header className="container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center">
                <GlowHerLogo className="[&>span]:text-white" />
                <Button variant="ghost" onClick={() => router.push('/')} className="text-slate-200 hover:text-white hover:bg-white/10">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
                <div className="text-center">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-white">Your Pregnancy Journey</h1>
                    <p className="mt-2 text-lg text-slate-300">You are <span className="text-teal-300 font-semibold">{pregnancyDetails.gestationalAgeWeeks} weeks</span> and <span className="text-teal-300 font-semibold">{pregnancyDetails.gestationalAgeDays} days</span> pregnant.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="shadow-lg bg-white/5 border-white/10 text-white">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Estimated Due Date</CardTitle>
                            <CalendarIcon className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{format(pregnancyDetails.dueDate, "MMM d, yyyy")}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg bg-white/5 border-white/10 text-white">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Days to Go</CardTitle>
                            <Baby className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{pregnancyDetails.daysLeft}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg bg-white/5 border-white/10 text-white">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Current Trimester</CardTitle>
                            <BarChart className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{pregnancyDetails.trimester}</p>
                        </CardContent>
                    </Card>
                </div>

                {currentWeekData && (
                    <Card className="shadow-2xl bg-slate-800/50 border-white/10 text-slate-200">
                        <CardHeader>
                             <CardTitle className="font-headline text-3xl text-teal-300">{currentWeekData.title}</CardTitle>
                             <CardDescription className="text-slate-400">{currentWeekData.size}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {currentVideoUrl && (
                                <div className="mb-6 aspect-video">
                                    <iframe
                                        className="w-full h-full rounded-lg"
                                        src={currentVideoUrl}
                                        title="YouTube video player"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div>
                                    <Image src={currentWeekData.imageUrl} data-ai-hint={currentWeekData.aiHint} alt={`Week ${currentWeekData.week} development`} width={600} height={400} className="rounded-lg object-cover" />
                                </div>
                                <Tabs defaultValue="development" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4 bg-slate-700/50 text-slate-300">
                                        <TabsTrigger value="development" className="data-[state=active]:bg-teal-500/80 data-[state=active]:text-white">Baby</TabsTrigger>
                                        <TabsTrigger value="body" className="data-[state=active]:bg-teal-500/80 data-[state=active]:text-white">Body</TabsTrigger>
                                        <TabsTrigger value="symptoms" className="data-[state=active]:bg-teal-500/80 data-[state=active]:text-white">Symptoms</TabsTrigger>
                                        <TabsTrigger value="tips" className="data-[state=active]:bg-teal-500/80 data-[state=active]:text-white">Tips</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="development" className="mt-4 prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-wrap"><p>{currentWeekData.development}</p></TabsContent>
                                    <TabsContent value="body" className="mt-4 prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-wrap"><p>{currentWeekData.bodyChanges}</p></TabsContent>
                                    <TabsContent value="symptoms" className="mt-4 prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-wrap"><p>{currentWeekData.symptoms}</p></TabsContent>
                                    <TabsContent value="tips" className="mt-4 prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-wrap"><p>{currentWeekData.tips}</p></TabsContent>
                                </Tabs>
                           </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="shadow-2xl bg-slate-800/50 border-white/10 text-slate-200">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-teal-300">How Are You Feeling Today?</CardTitle>
                        <CardDescription className="text-slate-400">Log your daily symptoms to keep track of your well-being.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...symptomForm}>
                            <form onSubmit={symptomForm.handleSubmit(onSymptomFormSubmit)} className="space-y-6">
                                <FormField
                                    control={symptomForm.control}
                                    name="symptoms"
                                    render={() => (
                                    <FormItem>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {pregnancySymptoms.map((item) => (
                                            <FormField
                                            key={item.id}
                                            control={symptomForm.control}
                                            name="symptoms"
                                            render={({ field }) => {
                                                return (
                                                <FormItem
                                                    key={item.id}
                                                    className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-slate-700 p-3 hover:bg-slate-700/50 transition-colors"
                                                >
                                                    <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                (value) => value !== item.id
                                                                )
                                                            );
                                                        }}
                                                        className="data-[state=checked]:bg-teal-400 data-[state=checked]:border-teal-400"
                                                    />
                                                    </FormControl>
                                                    <FormLabel className="font-normal flex items-center gap-2 cursor-pointer text-slate-200">
                                                     {item.label}
                                                    </FormLabel>
                                                </FormItem>
                                                );
                                            }}
                                            />
                                        ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={symptomForm.control}
                                    name="notes"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Custom Symptoms or Notes</FormLabel>
                                        <FormControl>
                                        <Textarea
                                            placeholder="Anything else to add?"
                                            className="resize-none bg-slate-700/50 border-slate-600 text-slate-200"
                                            {...field}
                                        />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <div className="flex items-center gap-4">
                                     <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white">
                                        <ThumbsUp className="mr-2 h-4 w-4" />
                                        Save Today's Symptoms
                                    </Button>
                                    {loggedSymptoms.length > 0 && (
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="text-sm font-semibold text-slate-400">Logged today:</span>
                                            {loggedSymptoms.map(symptomId => {
                                                const symptom = pregnancySymptoms.find(s => s.id === symptomId);
                                                return symptom ? <Badge key={symptomId} variant="secondary" className="bg-teal-400/20 text-teal-200 border-none">{symptom.label}</Badge> : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {babyLookVideoUrl && (
                     <Card className="shadow-2xl bg-slate-800/50 border-white/10 text-slate-200">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center gap-2 text-teal-300">
                                <Video /> Here is what your baby might look like now
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-video">
                                <iframe
                                    className="w-full h-full rounded-lg"
                                    src={babyLookVideoUrl}
                                    title="Baby Look YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </CardContent>
                    </Card>
                )}


                <div className="mt-8 flex justify-center gap-4">
                    <Button onClick={() => router.push('/pregnancy-journal')} className="bg-teal-500 hover:bg-teal-600 text-white">
                        <ClipboardPlus className="mr-2 h-4 w-4"/>
                        My Pregnancy Journal
                    </Button>
                    <Button variant="outline" onClick={() => setPregnancyDetails(null)} className="text-slate-200 border-slate-600 hover:bg-slate-700 hover:text-white">Reset / Enter New Date</Button>
                </div>

            </main>
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-slate-100">
        <header className="container mx-auto px-4 py-6 z-10">
            <div className="flex justify-between items-center">
            <GlowHerLogo className="[&>span]:text-white"/>
            <Button variant="ghost" onClick={() => router.push('/')} className="text-slate-200 hover:text-white hover:bg-white/10">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            </div>
      </header>
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-8">
        <Card className="w-full max-w-lg shadow-xl bg-slate-800/50 border-white/10 text-slate-200">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-center text-teal-300">Let’s Get Started!</CardTitle>
                <CardDescription className="text-center text-slate-400">Calculate your due date to begin tracking.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...pregnancyForm}>
                    <form onSubmit={pregnancyForm.handleSubmit(onPregnancyFormSubmit)} className="space-y-6">
                         <FormField
                            control={pregnancyForm.control}
                            name="calculationMethod"
                            render={({ field }) => (
                                <FormItem>
                                <Tabs defaultValue={field.value} onValueChange={(value) => field.onChange(value as 'dueDate' | 'lmp')} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 text-slate-300">
                                        <TabsTrigger value="dueDate" className="data-[state=active]:bg-teal-500/80 data-[state=active]:text-white">Use Due Date</TabsTrigger>
                                        <TabsTrigger value="lmp" className="data-[state=active]:bg-teal-500/80 data-[state=active]:text-white">Use Last Period</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                </FormItem>
                            )}
                         />

                        <FormField
                            control={pregnancyForm.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-center">
                                <FormLabel className="text-lg font-semibold text-slate-200">
                                    {pregnancyForm.watch('calculationMethod') === 'dueDate' ? 'Your Estimated Due Date' : 'First Day of Last Period (LMP)'}
                                </FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn("w-[280px] text-left font-normal bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white", !field.value && "text-slate-400")}
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
                                        disabled={pregnancyForm.watch('calculationMethod') === 'lmp' ? (date) => date > new Date() : undefined}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-col gap-2 pt-4">
                            <Button type="submit" size="lg" className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                                {pregnancyForm.watch('calculationMethod') === 'lmp' ? 'Calculate Due Date & Track' : 'Track My Pregnancy'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

