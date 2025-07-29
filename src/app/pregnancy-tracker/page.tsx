
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, differenceInDays, startOfDay, addWeeks, subDays, differenceInWeeks } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, ChevronLeft, Info, Baby, Heart, Milestone, BarChart, BookOpen, Lightbulb, ClipboardPlus } from 'lucide-react';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AppFooter } from '@/components/glowher/AppFooter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

const formSchema = z.object({
  calculationMethod: z.enum(['dueDate', 'lmp']),
  date: z.date({ required_error: "A date is required." }),
});

type PregnancyFormData = z.infer<typeof formSchema>;

type PregnancyDetails = {
  dueDate: Date;
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  daysLeft: number;
  trimester: number;
};

// Expanded fetal development data
const weeklyDevelopment = [
    { week: 0, title: "Getting Started", size: "", development: "", bodyChanges: "", symptoms: "", tips: "", imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg", aiHint: "pregnancy test" },
    {
        week: 1,
        title: "Week 1: The First Step",
        size: "Pregnancy is calculated from your LMP, so you're not technically pregnant yet.",
        development: "🗓️ This week is your menstrual period. Your body is shedding last month's uterine lining.\n\n🥚 It's also preparing a new egg for release in about two weeks.",
        bodyChanges: "🩸 You're experiencing your normal menstrual flow.\n\n📉 Hormone levels (estrogen and progesterone) are at their lowest point.",
        symptoms: " Cramping, bloating, and bleeding are the main events, just like a typical period.",
        tips: "💊 Start taking a prenatal vitamin with at least 400 mcg of folic acid. It's crucial for early development.\n\n🥗 Focus on a healthy, balanced diet.\n\n🏃‍♀️ Maintain your regular exercise routine.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "vitamins supplements"
    },
    {
        week: 2,
        title: "Week 2: Preparing for Ovulation",
        size: "An egg is maturing in your ovary, preparing for its grand exit.",
        development: "✨ Your uterine lining (endometrium) is thickening to create a cozy home for a fertilized egg.\n\n🌟 An egg is ripening inside a follicle in one of your ovaries, getting ready for ovulation.",
        bodyChanges: "⚡️ Estrogen levels are rising, which might give you an energy boost.\n\n💧 You may notice your cervical mucus becomes clearer and more slippery, a key sign of fertility.",
        symptoms: "🤩 Many feel more energetic and social this week.\n\n💥 Some experience a slight twinge of pain on one side during ovulation, known as 'mittelschmerz'.",
        tips: "💞 If you're trying to conceive, this is your fertile window!\n\n TRACK Your cycle using ovulation predictor kits or by tracking cervical mucus can help pinpoint the best time.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "calendar dates"
    },
    {
        week: 3,
        title: "Week 3: Fertilization & Implantation",
        size: "The fertilized egg, or blastocyst, is a microscopic ball of cells.",
        development: "🎉 Fertilization! A sperm meets the egg, creating a zygote.\n\n➗ This single cell begins dividing rapidly as it travels down the fallopian tube.\n\n🏡 By the end of the week, this ball of cells (blastocyst) will implant into your uterine wall.",
        bodyChanges: "🤫 You won't feel any different, but your body is starting to produce the pregnancy hormone hCG (human chorionic gonadotropin).",
        symptoms: "🌸 Some women notice light 'implantation spotting,' which is pink or brown and lasts a day or two. Most notice nothing at all.",
        tips: "🧘‍♀️ Continue to act as if you're pregnant: avoid alcohol and smoking.\n\n❌ It's still too early for a pregnancy test to be accurate.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "cells microscope"
    },
    {
        week: 4,
        title: "Week 4: A Positive Test!",
        size: "Your baby is the size of a poppy seed.",
        development: "🌱 The blastocyst is now fully implanted and has split into the embryo and the placenta.\n\n🔗 The placenta is burrowing into the uterine wall, forming the lifeline for nutrients and oxygen.",
        bodyChanges: "📈 hCG levels are now high enough to be detected by a home pregnancy test.\n\n😴 Rising hormones are working hard to sustain the pregnancy, which can make you feel very tired.",
        symptoms: "‼️ The most obvious sign is a missed period.\n\n🍈 Breasts may feel tender, swollen, and sore.\n\n🤢 Early signs of morning sickness and a heightened sense of smell can begin.",
        tips: "➕ Time to take a pregnancy test!\n\n👩‍⚕️ Once you get a positive result, schedule your first prenatal appointment (usually around week 8).\n\n💧 Continue your healthy habits and stay hydrated.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "pregnancy test positive"
    },
    {
        week: 5,
        title: "Week 5: The Heart Begins to Beat",
        size: "Your baby is the size of an apple seed.",
        development: "❤️ The baby's heart is forming and begins to flicker. It's the first organ system to function!\n\n🧠 The neural tube, the foundation of the brain and spinal cord, is closing.",
        bodyChanges: "⚡️ Your body is using a huge amount of energy to build the placenta and support the baby. Fatigue can be intense.\n\n🚽 Your growing uterus puts pressure on your bladder, leading to frequent urination.",
        symptoms: "🤢 Morning sickness may ramp up. Despite its name, it can strike at any time.\n\n😴 Extreme fatigue is very common.",
        tips: "🥨 Eat small, frequent meals. Keep crackers by your bed to eat before you get up.\n\n💤 Listen to your body and rest whenever you can. Naps are your friend!",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "heartbeat wave"
    },
    {
        week: 6,
        title: "Week 6: Facial Features Form",
        size: "Your baby is the size of a lentil.",
        development: "🙂 Facial features are taking shape with dark spots for eyes and nostrils.\n\n👂 Small pits on the side of the head mark where the ears will develop.\n\n👋 Tiny buds are sprouting that will become arms and legs.",
        bodyChanges: "🍈 Your breasts may feel even more sore and may have grown in size.\n\n💧 Blood volume is increasing to supply the embryo, which also contributes to fatigue.",
        symptoms: "😖 Nausea and fatigue may intensify.\n\n🍔 You might develop strong food aversions or cravings.\n\n🎭 Mood swings can be very pronounced due to hormonal shifts.",
        tips: "🧡 Try ginger tea, vitamin B6, or acupressure wristbands for nausea.\n\n⚖️ Don't worry if you aren't gaining weight yet; it's normal to even lose a little.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "embryo illustration"
    },
    {
        week: 7,
        title: "Week 7: Baby's Brain Development",
        size: "Your baby is the size of a blueberry.",
        development: "🧠 The brain is developing at an incredible pace—about 100 new brain cells are forming every minute!\n\n✋ Arm and leg buds have grown into paddle-like hands and feet.",
        bodyChanges: "📈 Your uterus has doubled in size, though it's still not visible externally.\n\n✨ Increased blood flow might give you that famous 'pregnancy glow' or, conversely, cause acne.",
        symptoms: "🤢 Morning sickness often continues.\n\n💦 You might notice excess saliva and a metallic taste in your mouth.",
        tips: "🚶‍♀️ Light exercise like walking can boost your energy and mood.\n\n👩‍⚕️ If you haven't yet, now is a great time to schedule your first prenatal appointment.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "brain neurons"
    },
    {
        week: 8,
        title: "Week 8: Your First Glimpse",
        size: "Your baby is the size of a raspberry.",
        development: "🖐️ Fingers and toes are now webbed but distinct.\n\n🦎 The embryonic tail at the base of the spine is disappearing.\n\n🤸 The baby is constantly moving, though you can't feel it yet.",
        bodyChanges: "👩‍⚕️ This is often when the first prenatal visit and ultrasound occur.\n\n❤️ You may be able to see the tiny embryo and hear its strong heartbeat for the first time!",
        symptoms: "Peak Symptoms: Nausea and fatigue can be at their most intense around this time.\n\n💥 Mild uterine cramping is normal as it expands.",
        tips: "❓ Prepare for your appointment by writing down any questions you have.\n\n🗣️ If you feel ready, this is a common time to share the news with close family.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "ultrasound scan"
    },
    {
        week: 9,
        title: "Week 9: Baby is Now a Fetus",
        size: "Your baby is the size of a cherry.",
        development: "👶 The baby graduates from an embryo to a fetus! This marks the end of the most critical development period.\n\n❤️ All essential organs, like the heart, brain, and lungs, have started to form.",
        bodyChanges: "💓 Your heart is working harder and pumping more blood, which can lead to fatigue and occasional dizziness.\n\n👖 Your waistline is likely starting to thicken as your uterus grows.",
        symptoms: "🔥 Heartburn may begin as hormones relax the valve to your stomach.\n\n🤏 You may feel sharp twinges in your lower abdomen, known as round ligament pain.",
        tips: "🚫 Avoid spicy or greasy foods to help with heartburn.\n\n😴 Try sleeping with your head slightly elevated on an extra pillow.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "fetus illustration"
    },
    {
        week: 10,
        title: "Week 10: Fingernails and Hair Appear",
        size: "Your baby is the size of a strawberry.",
        development: "💅 Tiny fingernails and toenails are beginning to form.\n\n🍑 The fetus is covered in a fine, downy hair called lanugo.\n\n🚽 The kidneys are now developed enough to produce urine.",
        bodyChanges: "〰️ A dark vertical line, the linea nigra, may appear on your abdomen due to hormones.\n\n🔵 Your veins might become more visible on your chest and stomach.",
        symptoms: "😵 Dizziness can occur due to shifts in blood pressure and volume.\n\n💥 Round ligament pain may continue as your uterus stretches.",
        tips: "🧘‍♀️ Move slowly when standing up to avoid feeling dizzy.\n\nStretch gently or change positions when you feel round ligament pain.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "baby hand"
    },
    {
        week: 11,
        title: "Week 11: Reflexes Develop",
        size: "Your baby is the size of a fig.",
        development: "✊ The baby can now open and close its fists.\n\n👄 The mouth can make sucking movements.\n\n🦷 Tooth buds for their baby teeth are developing inside the gums.",
        bodyChanges: "🤰 Your baby bump may start to make its debut as your uterus rises out of your pelvis.\n\n⚖️ It's normal and healthy to have gained a few pounds by now.",
        symptoms: "🤕 Headaches can be a new symptom due to hormonal shifts.\n\n🦵 Leg cramps, especially at night, can also begin.",
        tips: "🧊 For headaches, try a cool compress on your forehead and rest in a dark room.\n\n🍌 For leg cramps, stretch your calf by flexing your foot. Ensure you're getting enough calcium and magnesium.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "baby feet"
    },
    {
        week: 12,
        title: "Week 12: End of the First Trimester",
        size: "Your baby is the size of a lime.",
        development: "💪 The baby is developing reflexes—fingers curl, toes point, and the mouth makes sucking motions.\n\n🏠 The intestines, which were growing in the umbilical cord, are now moving into the baby's abdomen.",
        bodyChanges: "🎉 Congratulations! The risk of miscarriage drops significantly after this week.\n\n✨ The placenta is now fully formed and has taken over producing the hormones needed to sustain the pregnancy.",
        symptoms: "☀️ The 'honeymoon period' of pregnancy often begins now, with less nausea and more energy.",
        tips: "🗣️ This is a great time to share your news more widely if you choose.\n\n🧘‍♀️ Consider starting a prenatal exercise routine like swimming or yoga.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "celebration confetti"
    },
    {
        week: 13,
        title: "Week 13: Welcome to the Second Trimester!",
        size: "Your baby is the size of a pea pod.",
        development: "👆 Unique fingerprints have now formed on your baby's tiny fingers.\n\n🗣️ Vocal cords are developing—the first step towards their first cry after birth.",
        bodyChanges: "📈 You're officially in the second trimester!\n\n libido may increase as energy returns and nausea subsides.",
        symptoms: "💧 You might notice an increase in vaginal discharge (leukorrhea), which is normal and protective.\n\n👄 Your gums may be more sensitive and bleed easily when you brush.",
        tips: "🦷 Use a soft-bristled toothbrush and be gentle when flossing.\n\n👩‍🏫 Now is a good time to start researching childbirth classes.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "yoga pose"
    },
    {
        week: 14,
        title: "Week 14: Baby Can Squint and Frown",
        size: "Your baby is the size of a lemon.",
        development: "😠 Your baby can now make facial expressions like squinting, frowning, and grimacing.\n\n🦒 The neck is getting longer, and the chin is becoming more distinct.",
        bodyChanges: "🤰 Your baby bump is likely becoming more apparent and harder to hide.\n\n❤️ Focus on what your amazing body is doing rather than any body image concerns.",
        symptoms: "⚡️ You may experience a welcome energy boost.\n\n⚡️ Round ligament pain can continue as your uterus grows at a faster pace.",
        tips: "🧴 Keep your skin well-moisturized to help with any itchiness from stretching skin.\n\n👕 Wear comfortable, supportive clothing and a good bra.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "happy pregnant"
    },
    {
        week: 15,
        title: "Week 15: Forming a Skeleton",
        size: "Your baby is the size of an apple.",
        development: "🦴 The skeleton is hardening from soft cartilage to bone.\n\n💡 The baby can sense light through its fused eyelids and may turn away from a bright light shone on your belly.",
        bodyChanges: "🤧 You might feel a stuffy nose or get nosebleeds due to increased blood flow to your mucous membranes.",
        tips: "💨 Use a humidifier and saline nasal spray to relieve stuffiness.\n\n💧 For a nosebleed, pinch your nostrils firmly and lean forward for 10-15 minutes.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "skeleton xray"
    },
    {
        week: 16,
        title: "Week 16: Growth Spurt",
        size: "Your baby is the size of an avocado.",
        development: "📏 Your baby is undergoing a major growth spurt, doubling their weight.\n\n💓 The heart is now pumping about 25 quarts of blood each day.",
        bodyChanges: "🦋 You might feel the first flutters of movement, called 'quickening.' It can feel like gas bubbles or a gentle tapping.",
        symptoms: "🧠 Forgetfulness, or 'pregnancy brain,' is common.\n\n🚶‍♀️ Backaches may begin as your growing belly shifts your center of gravity.",
        tips: "🧍‍♀️ Practice good posture to minimize back pain.\n\n👟 Wear low-heeled, supportive shoes.\n\n📝 Write things down to help you remember appointments and tasks.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "butterfly stomach"
    },
    {
        week: 17,
        title: "Week 17: Baby Packs on Fat",
        size: "Your baby is the size of a turnip.",
        development: "👶 The baby is accumulating fat, which is crucial for regulating body temperature after birth.\n\n🔗 The umbilical cord is growing stronger and thicker.",
        bodyChanges: "😋 Your appetite may increase significantly as your baby's growth accelerates.\n\n🔥 Your expanding uterus is pushing up on your stomach, which can cause indigestion.",
        symptoms: "☀️ Your skin may be more sensitive to the sun, so be sure to wear sunscreen.\n\n😵 Dizziness can occur as your cardiovascular system adjusts.",
        tips: "🍎 Focus on nutrient-dense foods to satisfy your hunger and fuel your baby's growth.\n\n🚫 Avoid standing for very long periods and get up slowly.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "healthy food"
    },
    {
        week: 18,
        title: "Week 18: Baby Can Hear You",
        size: "Your baby is the size of a sweet potato.",
        development: "👂 The nerves around the ears are developed enough for your baby to hear sounds like your heartbeat and voice.\n\n👆 Unique fingerprints are now fully formed.",
        bodyChanges: "😴 It may become harder to find a comfortable sleeping position. Sleeping on your side is recommended for optimal blood flow.",
        symptoms: "🦵 Swelling in your hands and feet (edema) may start to appear.\n\n😣 Leg cramps at night can be a persistent issue.",
        tips: "🗣️ Talk, sing, or read to your baby! They are listening and learning the sound of your voice.\n\n🛌 Use pillows to support your belly and back for more comfortable sleep.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "woman singing"
    },
    {
        week: 19,
        title: "Week 19: Protective Coating Forms",
        size: "Your baby is the size of a mango.",
        development: "🤍 The baby's skin is now coated in vernix caseosa, a greasy, white substance that protects it from amniotic fluid.",
        bodyChanges: "✨ You might develop chloasma, or the 'mask of pregnancy'—darker patches of skin on your face. This is temporary.\n\n😣 Itchy skin, especially on your abdomen, is common as it stretches.",
        symptoms: "😮 Feeling short of breath is common as your growing uterus puts pressure on your diaphragm.",
        tips: "🧴 Use gentle, moisturizing lotions to soothe itchy skin.\n\n🏃‍♀️ Pace yourself and take breaks when you feel short of breath.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "lotion skin"
    },
    {
        week: 20,
        title: "Week 20: Halfway There!",
        size: "Your baby is the size of a banana.",
        development: "🎉 You've reached the halfway point!\n\n😋 The baby is swallowing more, which is good practice for their digestive system.",
        bodyChanges: "👩‍⚕️ You'll likely have a mid-pregnancy anatomy scan to check the baby's development. You may be able to find out the gender!\n\n navel is now at the level of your uterus.",
        symptoms: "💪 You're likely feeling pretty good with solid energy levels.\n\n🦵 The most common complaints are leg cramps, swelling, and backaches.",
        tips: "👶 Start planning the nursery or shopping for baby essentials if you haven't already.\n\n❓ Decide if you want to find out the baby's gender at the ultrasound.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "halfway sign"
    },
    {
        week: 21,
        title: "Week 21: Tasting Flavors",
        size: "Your baby is the size of a carrot.",
        development: "👅 The baby's taste buds are developed and they can taste flavors in the amniotic fluid from the foods you eat.\n\n🤸 Their movements are becoming more coordinated and less random.",
        bodyChanges: "💥 You'll feel kicks and punches more strongly now. Your partner might be able to feel them from the outside!",
        symptoms: "🔥 Heartburn and indigestion may become more noticeable.\n\n〰️ Stretch marks on your belly, hips, or breasts may appear or become more prominent.",
        tips: "🌶️ Eat a varied diet. The flavors you introduce now may influence your baby's food preferences later.\n\n🤝 Share the magical moment of feeling the baby kick with your partner.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "spices variety"
    },
    {
        week: 22,
        title: "Week 22: Baby Looks Like a Newborn",
        size: "Your baby is the size of a spaghetti squash.",
        development: "👶 The baby looks like a miniature newborn. Lips, eyebrows, and eyelids are distinct.\n\n✨ The pancreas is developing steadily, which is essential for hormone production.",
        bodyChanges: "✨ Your belly button may pop out, becoming an 'outie.' This is temporary!\n\n💇‍♀️ Your hair might seem thicker and more lustrous due to pregnancy hormones slowing down normal shedding.",
        symptoms: "💧 Increased vaginal discharge and mild swelling are common.",
        tips: "💇‍♀️ Enjoy the good hair days!\n\n🏢 Start thinking about your maternity leave plan and discussing it with your employer.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "newborn baby"
    },
    {
        week: 23,
        title: "Week 23: Viability Milestone",
        size: "Your baby is the size of a large mango.",
        development: "🌟 The baby is now considered viable, meaning they have a chance of survival with intensive medical care if born now.\n\n🫁 The lungs are developing surfactant, a substance that helps air sacs inflate after birth.",
        bodyChanges: "⚖️ Your weight gain should be steady, about a pound a week.\n\n🤸‍♀️ Feeling your baby move is a daily (and nightly!) occurrence.",
        symptoms: "😴 Snoring can start or worsen due to swelling in your nasal passages.\n\n🧠 Clumsiness and 'pregnancy brain' can continue as your center of gravity shifts.",
        tips: "🏫 Sign up for childbirth education classes. They provide valuable info on labor, delivery, and newborn care.\n\n🏊 Stay active with safe exercises like swimming or walking.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "life preserver"
    },
    {
        week: 24,
        title: "Week 24: Responding to Touch",
        size: "Your baby is the size of an ear of corn.",
        development: "🧠 The baby's brain is growing rapidly.\n\n✋ They can now feel movement and may respond if you gently press or rub your belly.",
        bodyChanges: "👩‍⚕️ Your doctor will likely test you for gestational diabetes between now and week 28.",
        symptoms: "🌵 Your skin and eyes might feel very dry.\n\n⚡️ You may start to feel Braxton Hicks contractions—irregular, painless 'practice' contractions.",
        tips: "💧 Drink plenty of water before your glucose screening test.\n\n👁️ Use lubricating eye drops (check with your doctor for a safe brand) if your eyes are dry.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "hand touching"
    },
    {
        week: 25,
        title: "Week 25: Hair Has Color and Texture",
        size: "Your baby is the size of a head of cauliflower.",
        development: "💇‍♀️ The baby's hair is growing and now has both color and texture.\n\n💨 They are practicing breathing by inhaling and exhaling amniotic fluid, which is vital for lung development.",
        bodyChanges: "💥 Your growing uterus can put pressure on your sciatic nerve, causing pain that radiates from your lower back down your leg.",
        symptoms: "✋ Carpal tunnel syndrome (numbness or tingling in your hands) can appear due to swelling.\n\n🦵 Restless leg syndrome at night is also common.",
        tips: "🧘‍♀️ Gentle stretching can help with sciatica. Avoid sitting or standing in one position for too long.\n\n👐 For carpal tunnel, try wearing a wrist splint at night.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "colorful hair"
    },
    {
        week: 26,
        title: "Week 26: Eyes Are Opening",
        size: "Your baby is the size of a scallion bunch.",
        development: "👁️ The baby's eyelids, previously fused shut, are beginning to open and blink.\n\n💡 The retinas are developing, allowing them to perceive light and dark.",
        bodyChanges: "📈 Your blood pressure may start to rise slightly after hitting a low point mid-pregnancy. Your doctor will monitor it closely.",
        symptoms: "😴 You may have trouble sleeping due to your size, heartburn, leg cramps, or general discomfort.\n\n⚡️ Braxton Hicks contractions may become more frequent.",
        tips: "🛁 Create a relaxing bedtime routine: a warm bath, reading a book, or listening to calming music.\n\n🛌 Use plenty of pillows to support your body in bed.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "eye open"
    },
    {
        week: 27,
        title: "Week 27: Welcome to the Third Trimester!",
        size: "Your baby is the size of a head of lettuce.",
        development: "🧠 The baby's brain is very active now, with developing sections for conscious thought.\n\n😴 They are likely sleeping and waking in more regular cycles.",
        bodyChanges: "🎉 You've reached the final trimester! The baby will gain weight rapidly from now on.\n\n😥 You might feel more tired again, similar to the first trimester.",
        symptoms: "😮 Shortness of breath is common as your uterus presses up against your diaphragm.\n\n🔥 Backaches, swelling, leg cramps, and heartburn can all intensify.",
        tips: "📝 Finalize your birth plan and discuss it with your provider.\n\n👜 Pack your hospital bag so it's ready to go.\n\n🏥 Take a tour of the hospital or birthing center.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "finish line"
    },
    {
        week: 28,
        title: "Week 28: Eyes Have Eyelashes",
        size: "Your baby is the size of an eggplant.",
        development: "✨ The baby can now blink and has eyelashes.\n\n👶 They are putting on more fat, which is smoothing out their wrinkled skin.\n\n🧠 Billions of neurons are developing in their brain.",
        bodyChanges: "👩‍⚕️ Your prenatal appointments will likely increase to every two weeks.\n\n💉 If your blood type is Rh-negative, you'll receive a RhoGAM shot around this time.",
        symptoms: "🥴 You may feel clumsy and off-balance as your belly grows.\n\n⚡️ Braxton Hicks, restless legs, and general discomfort are common.",
        tips: "👟 Start doing 'kick counts' to monitor your baby's movements. Pick a time each day and see how long it takes to feel 10 movements. Contact your doctor if you notice a significant decrease in activity.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "eyelashes close-up"
    },
    {
        week: 29,
        title: "Week 29: Getting Crowded in There",
        size: "Your baby is the size of a butternut squash.",
        development: "🧠 The baby's head is growing to accommodate the rapidly developing brain.\n\n🤸 As space gets tighter, movements may feel more like stretches and rolls than sharp kicks.",
        bodyChanges: "⚖️ You're likely gaining about a pound a week, with half of that going to the baby.\n\n😣 The extra weight can put a strain on your back, legs, and bladder.",
        symptoms: "🔥 Heartburn and constipation can be particularly bothersome.\n\n👟 Tying your shoes might feel like an Olympic sport.",
        tips: "🌾 To combat constipation, eat a high-fiber diet (fruits, veggies, whole grains), drink plenty of water, and stay active.\n\n🚽 Don't strain during bowel movements.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "crowded space"
    },
    {
        week: 30,
        title: "Week 30: Seeing in the Womb",
        size: "Your baby is the size of a large cabbage.",
        development: "👁️ The baby's eyesight continues to develop. They can perceive light filtering through your abdomen and may turn their head in response.",
        bodyChanges: "😴 Fatigue can return with a vengeance as your baby's growth demands more energy and sleep becomes more elusive.",
        symptoms: "둥지 The 'nesting' instinct might kick in—an overwhelming desire to clean and organize your home.\n\n🎭 Mood swings and anxiety about labor are also common.",
        tips: "🧹 Channel your nesting energy productively, but don't overdo it.\n\n🗣️ Talk to your partner, friends, or a therapist about any anxieties you're feeling.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "light through window"
    },
    {
        week: 31,
        title: "Week 31: Practice Breathing",
        size: "Your baby is the size of a coconut.",
        development: "💨 The baby makes rhythmic breathing movements, though their lungs are not yet fully mature.\n\n🌡️ They can now regulate their own body temperature to some extent.",
        bodyChanges: "💧 You may start to leak colostrum, the yellowish 'first milk' your breasts produce. This is a sign your body is readying itself for breastfeeding.",
        tips: "パッド If you're leaking, you can use nursing pads in your bra.\n\n📚 This is a good time to research breastfeeding and local lactation support.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "breathing exercise"
    },
    {
        week: 32,
        title: "Week 32: Getting into Position",
        size: "Your baby is the size of a jicama.",
        development: "👇 The baby is likely moving into the head-down position in preparation for birth.\n\n💅 Toenails are now fully formed.\n\n솜 The downy lanugo hair is starting to shed.",
        bodyChanges: "👩‍⚕️ Your provider will check the baby's position at your appointments.\n\n🦶 You might feel kicks higher up under your ribs.",
        symptoms: "😮‍💨 Shortness of breath and heartburn can be at their peak as your uterus is at its highest point.",
        tips: "🚨 Familiarize yourself with the signs of preterm labor (regular contractions, constant backache, fluid leak). Call your doctor immediately with any concerns.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "gymnast pose"
    },
    {
        week: 33,
        title: "Week 33: Harder Bones",
        size: "Your baby is the size of a pineapple.",
        development: "🦴 The baby's bones are hardening, though the skull remains soft and flexible for delivery.\n\n🛡️ They are absorbing antibodies from you, which will boost their immunity after birth.",
        bodyChanges: "🤰 The volume of amniotic fluid is at its maximum, making your belly feel very tight.",
        symptoms: "⚡️ You might feel tingling or numbness in your fingers and toes due to water retention (carpal tunnel).",
        tips: "🥛 Keep up your calcium intake to support your baby's bone development (dairy, leafy greens, fortified foods).",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "strong bones"
    },
    {
        week: 34,
        title: "Week 34: Baby's Lungs Maturing",
        size: "Your baby is the size of a cantaloupe.",
        development: "🫁 The baby's lungs are now well-developed.\n\n👦 If you're having a boy, his testicles are descending into the scrotum.",
        bodyChanges: "✨ You might feel the baby 'drop' into your pelvis. This is called lightening.\n\n😮‍💨 This can relieve pressure on your diaphragm, making it easier to breathe, but it increases pressure on your bladder.",
        symptoms: "🚽 With lightening comes an even more frequent need to urinate and more pelvic pressure.",
        tips: "😴 Rest as much as possible. Put your feet up whenever you can.\n\n🤝 Don't hesitate to ask for and accept help from your support system.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "lungs diagram"
    },
    {
        week: 35,
        title: "Week 35: Rapid Weight Gain",
        size: "Your baby is the size of a honeydew melon.",
        development: "⚖️ The baby is packing on about half a pound a week. This fat will help them regulate body temperature.",
        bodyChanges: "👩‍⚕️ Your prenatal visits are likely weekly now.\n\n🦠 Your provider will perform a Group B strep test, a routine swab to check for bacteria.",
        symptoms: "😩 You're likely feeling very uncomfortable, tired, and impatient.\n\n😴 Waking up frequently at night is standard procedure at this point.",
        tips: " Labor Signs: Review the signs of labor with your partner and know when to call your doctor or head to the hospital.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "weight scale"
    },
    {
        week: 36,
        title: "Week 36: Almost Full-Term",
        size: "Your baby is the size of a head of romaine lettuce.",
        development: "👶 Your baby is now considered 'early term.'\n\n😙 They are practicing sucking and swallowing to prepare for feeding.",
        bodyChanges: " cervix may be starting to efface (thin) and dilate (open). These are early signs of labor, but don't mean it's imminent.",
        symptoms: "✨ You may feel a mix of excitement and anxiety.\n\n💥 Pelvic pressure and Braxton Hicks contractions continue.",
        tips: "🚗 Install the baby's car seat and have it inspected.\n\n🍲 Do some meal prep. Freeze easy meals for the postpartum period.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "baby clothes"
    },
    {
        week: 37,
        title: "Week 37: Full-Term!",
        size: "Your baby is the size of a Swiss chard.",
        development: "🎉 Congratulations, your baby is now considered 'full-term'!\n\n🫁 Their lungs are mature and ready to breathe air.",
        bodyChanges: "⏰ You could go into labor any day now!\n\n😌 Try not to be discouraged if your due date comes and goes; it's very common.",
        symptoms: "💧 You might lose your mucus plug or see a 'bloody show,' a sign that your cervix is changing.",
        tips: "🧘‍♀️ Relax and conserve your energy. Go for gentle walks, watch movies, and enjoy these last few days of quiet.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "calendar due date"
    },
    {
        week: 38,
        title: "Week 38: Getting Ready",
        size: "Your baby is the size of a pumpkin.",
        development: "✊ The baby has a firm grasp.\n\n💩 They have about an ounce of meconium (their first bowel movement) in their intestines.",
        bodyChanges: "⏳ You are in a waiting game. Every twinge and cramp will have you wondering, 'Is this it?'",
        symptoms: "🎈 Swelling, discomfort, and impatience are at an all-time high.",
        tips: "😴 Rest, rest, rest. Sleep whenever you can.\n\n🍓 Eat small, easily digestible snacks to keep your energy up.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "running race"
    },
    {
        week: 39,
        title: "Week 39: On The Brink",
        size: "Your baby is the size of a watermelon.",
        development: "🧠 The baby's brain is still developing and will do so at an amazing rate for the first few years of life.",
        bodyChanges: "👩‍⚕️ Your doctor might discuss induction options if you go too far past your due date.",
        symptoms: "😬 The end is in sight! Labor could start at any moment.",
        tips: "🧘‍♀️ Stay calm and trust the process. When labor starts, remember your breathing techniques.\n\n💪 You are strong, and you can do this.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "calm water"
    },
    {
        week: 40,
        title: "Week 40: Due Date!",
        size: "Your baby is the size of a small pumpkin.",
        development: "👶 The baby is fully developed and waiting for the signal to begin their journey into the world.",
        bodyChanges: "📅 Your due date is here, but it's just an estimate. Only about 5% of babies are born on their due date.",
        symptoms: "😣 You are likely feeling a potent combination of being physically miserable and incredibly excited.",
        tips: "🌶️ If you're antsy, you can try natural methods that are *thought* to encourage labor, like walking (with your doctor's approval).\n\nsoon you'll be holding your baby!",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "baby holding finger"
    }
];


export default function PregnancyTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pregnancyDetails, setPregnancyDetails] = useState<PregnancyDetails | null>(null);

  const form = useForm<PregnancyFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calculationMethod: 'dueDate',
    },
  });

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('glowher-pregnancy-tracker');
      if (storedData) {
        const data = JSON.parse(storedData);
        data.dueDate = new Date(data.dueDate);
        calculateDetails(data.dueDate);
      }
    } catch (error) {
        console.error("Could not retrieve data from localStorage", error);
    }
  }, []);

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
        localStorage.setItem('glowher-pregnancy-tracker', JSON.stringify({ dueDate }));
    } catch(e) { console.error(e) }

  }

  function onSubmit(values: PregnancyFormData) {
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
  
  const currentWeekData = pregnancyDetails ? weeklyDevelopment[pregnancyDetails.gestationalAgeWeeks] : null;

  if (pregnancyDetails) {
    return (
        <div className="flex flex-col min-h-screen bg-green-500/5 text-foreground">
             <header className="container mx-auto px-4 py-6 z-10">
                <div className="flex justify-between items-center">
                <GlowHerLogo />
                <Button variant="ghost" onClick={() => router.push('/')}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Your Pregnancy Journey</h1>
                    <p className="mt-2 text-lg text-muted-foreground">You are <span className="text-primary font-semibold">{pregnancyDetails.gestationalAgeWeeks} weeks</span> and <span className="text-primary font-semibold">{pregnancyDetails.gestationalAgeDays} days</span> pregnant.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="shadow-sm">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Estimated Due Date</CardTitle>
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{format(pregnancyDetails.dueDate, "MMM d, yyyy")}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Days to Go</CardTitle>
                            <Baby className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{pregnancyDetails.daysLeft}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Current Trimester</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{pregnancyDetails.trimester}</p>
                        </CardContent>
                    </Card>
                </div>

                {currentWeekData && (
                    <Card className="shadow-lg">
                        <CardHeader>
                             <CardTitle className="font-headline text-3xl">{currentWeekData.title}</CardTitle>
                             <CardDescription>{currentWeekData.size}</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div>
                                    <Image src={currentWeekData.imageUrl} data-ai-hint={currentWeekData.aiHint} alt={`Week ${currentWeekData.week} development`} width={600} height={400} className="rounded-lg object-cover" />
                                </div>
                                <Tabs defaultValue="development" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="development"><Milestone className="mr-2 h-4 w-4" />Baby</TabsTrigger>
                                        <TabsTrigger value="body"><Heart className="mr-2 h-4 w-4" />Body</TabsTrigger>
                                        <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                                        <TabsTrigger value="tips"><Lightbulb className="mr-2 h-4 w-4"/>Tips</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="development" className="mt-4 prose max-w-none text-foreground text-sm whitespace-pre-wrap"><p>{currentWeekData.development}</p></TabsContent>
                                    <TabsContent value="body" className="mt-4 prose max-w-none text-foreground text-sm whitespace-pre-wrap"><p>{currentWeekData.bodyChanges}</p></TabsContent>
                                    <TabsContent value="symptoms" className="mt-4 prose max-w-none text-foreground text-sm whitespace-pre-wrap"><p>{currentWeekData.symptoms}</p></TabsContent>
                                    <TabsContent value="tips" className="mt-4 prose max-w-none text-foreground text-sm whitespace-pre-wrap"><p>{currentWeekData.tips}</p></TabsContent>
                                </Tabs>
                           </div>
                        </CardContent>
                    </Card>
                )}

                <div className="mt-8 flex justify-center gap-4">
                    <Button onClick={() => router.push('/pregnancy-journal')}>
                        <ClipboardPlus className="mr-2 h-4 w-4"/>
                        My Pregnancy Journal
                    </Button>
                    <Button variant="outline" onClick={() => setPregnancyDetails(null)}>Reset / Enter New Date</Button>
                </div>

            </main>
            <AppFooter/>
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-green-500/5">
        <header className="container mx-auto px-4 py-6 z-10">
            <div className="flex justify-between items-center">
            <GlowHerLogo />
            <Button variant="ghost" onClick={() => router.push('/')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            </div>
      </header>
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-8">
        <Card className="w-full max-w-lg shadow-xl">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-center">Let’s Get Started!</CardTitle>
                <CardDescription className="text-center">Calculate your due date to begin tracking.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                         <FormField
                            control={form.control}
                            name="calculationMethod"
                            render={({ field }) => (
                                <FormItem>
                                <Tabs defaultValue={field.value} onValueChange={(value) => field.onChange(value as 'dueDate' | 'lmp')} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="dueDate">Use Due Date</TabsTrigger>
                                        <TabsTrigger value="lmp">Use Last Period</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                </FormItem>
                            )}
                         />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-center">
                                <FormLabel className="text-lg font-semibold">
                                    {form.watch('calculationMethod') === 'dueDate' ? 'Your Estimated Due Date' : 'First Day of Last Period (LMP)'}
                                </FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn("w-[280px] text-left font-normal", !field.value && "text-muted-foreground")}
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
                                        disabled={form.watch('calculationMethod') === 'lmp' ? (date) => date > new Date() : undefined}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-col gap-2 pt-4">
                            <Button type="submit" size="lg" className="w-full">
                                {form.watch('calculationMethod') === 'lmp' ? 'Calculate Due Date & Track' : 'Track My Pregnancy'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </main>
      <AppFooter/>
    </div>
  );
}
