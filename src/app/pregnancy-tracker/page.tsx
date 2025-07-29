
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
        size: "Pregnancy is calculated from the first day of your last menstrual period (LMP), so you are not yet pregnant.",
        development: "The first week of your pregnancy is actually your menstrual period. Your body is shedding last month's uterine lining and preparing for a potential pregnancy this month. The countdown to your due date begins now, even though conception hasn't occurred.",
        bodyChanges: "You are experiencing your regular menstrual cycle. Hormones like estrogen and progesterone are at their lowest levels. Your body is preparing to release an egg for fertilization in the coming weeks.",
        symptoms: "Typical menstrual symptoms like cramping, bloating, and bleeding are expected. This is the baseline from which your pregnancy journey begins.",
        tips: "Focus on general wellness. Ensure you are taking a prenatal vitamin with at least 400 mcg of folic acid, as this is crucial for preventing neural tube defects very early in development. Maintain a healthy diet and limit alcohol and caffeine.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "vitamins supplements"
    },
    {
        week: 2,
        title: "Week 2: Preparing for Ovulation",
        size: "An egg (ovum) is maturing within a follicle in your ovary, preparing for release.",
        development: "Your body is gearing up for ovulation. The uterine lining (endometrium) is starting to thicken again, creating a nourishing environment for a fertilized egg to implant. One of your ovaries is maturing an egg that will be released soon.",
        bodyChanges: "As estrogen levels rise, you may notice an increase in energy and possibly a higher libido. Your cervical mucus may become clearer, thinner, and more slippery—a sign of increasing fertility.",
        symptoms: "This week is generally symptom-free for most, though you might feel more energetic and social. Some women experience a slight twinge of pain on one side of their abdomen during ovulation (mittelschmerz).",
        tips: "This is the fertile window. If you are trying to conceive, now is the optimal time. Continue your healthy habits, including your prenatal vitamin regimen. Tracking your cycle can help you pinpoint ovulation.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "calendar dates"
    },
    {
        week: 3,
        title: "Week 3: Fertilization & Implantation",
        size: "If fertilization occurs, the resulting group of cells, called a blastocyst, is microscopic.",
        development: "This is the week of conception! If sperm fertilizes the egg, it forms a zygote, which begins rapidly dividing. This ball of cells travels down the fallopian tube to the uterus. Towards the end of this week, it will attempt to implant into the uterine wall, a crucial step for the pregnancy to continue.",
        bodyChanges: "Hormone levels, particularly human chorionic gonadotropin (hCG), begin to rise after implantation. You will not feel any different yet, but your body is beginning the monumental task of growing a human.",
        symptoms: "Some women experience light spotting, known as implantation bleeding, which is often mistaken for a light period. It's usually pinkish or brown and lasts only a day or two. Most women, however, will not notice any symptoms.",
        tips: "Continue to act as if you are pregnant. Avoid alcohol, smoking, and unsafe medications. Maintain a healthy diet. It's still too early to take a home pregnancy test, as hCG levels are not yet high enough to be detected.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "cells microscope"
    },
    {
        week: 4,
        title: "Week 4: A Positive Test!",
        size: "Your baby is the size of a poppy seed.",
        development: "The blastocyst is now fully implanted in the uterine lining and has split into two parts: the embryo (which will become the baby) and the placenta. The placenta is already starting to form and burrow into the uterine wall, creating a lifeline for oxygen and nutrients.",
        bodyChanges: "Your body is now producing hCG in large quantities, the hormone that pregnancy tests detect. The rising levels of progesterone and estrogen are working to sustain the pregnancy and are also responsible for the first early symptoms.",
        symptoms: "This is the week you might miss your period. You may start feeling extremely fatigued, have tender or swollen breasts, and experience mood swings. Some women notice a heightened sense of smell or early signs of morning sickness.",
        tips: "You can now take a home pregnancy test! Once you get a positive result, schedule your first prenatal appointment with your OB/GYN or midwife. This appointment is usually scheduled for around week 8. Continue your healthy habits.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "pregnancy test positive"
    },
    {
        week: 5,
        title: "Week 5: The Heart Begins to Beat",
        size: "Your baby is the size of an apple seed.",
        development: "The baby's heart is developing and may already be beating, although it's too early to hear. The neural tube, which will become the brain and spinal cord, is forming. The circulatory system is the first major system to function.",
        bodyChanges: "Hormonal changes are in full swing. You might feel very tired as your body devotes enormous energy to building the placenta and supporting the baby's rapid growth. Your uterus is beginning to expand, though it's not noticeable from the outside.",
        symptoms: "Morning sickness may kick in this week. Despite its name, it can occur at any time of day. Frequent urination is also common as your kidneys work harder to filter increased blood volume, and the growing uterus puts pressure on your bladder.",
        tips: "Eat small, frequent meals to combat nausea. Crackers or dry toast before getting out of bed can help. Stay well-hydrated, even if you don't feel like it. Listen to your body and rest whenever you can.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "heartbeat wave"
    },
    {
        week: 6,
        title: "Week 6: Facial Features Form",
        size: "Your baby is the size of a lentil.",
        development: "Facial features are beginning to take shape. Dark spots mark where the eyes and nostrils will be, and small pits on the sides of the head indicate the developing ears. Tiny buds that will grow into arms and legs are sprouting.",
        bodyChanges: "Your blood volume is increasing to supply the growing embryo, which can contribute to fatigue. Your breasts may continue to feel sore and grow larger as milk ducts develop.",
        symptoms: "Symptoms from week 5, like nausea and fatigue, may intensify. You might also experience food aversions or cravings. Mood swings can be pronounced due to fluctuating hormones.",
        tips: "If you're struggling with morning sickness, try ginger tea, vitamin B6, or acupressure wristbands. Don't worry if you're not gaining weight yet; it's common to even lose a little in the first trimester.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "embryo illustration"
    },
    {
        week: 7,
        title: "Week 7: Baby's Brain Development",
        size: "Your baby is the size of a blueberry.",
        development: "The baby's brain is developing at a remarkable rate, with about a hundred new brain cells forming every minute. The arm and leg buds have grown longer and are starting to form paddle-like hands and feet.",
        bodyChanges: "Your uterus has doubled in size, though it's still well within your pelvis. You might notice you need to urinate even more frequently. Increased blood flow can also lead to a 'pregnancy glow' for some, while for others it can cause acne.",
        symptoms: "Morning sickness, fatigue, and frequent urination continue. You might also experience excess saliva and a metallic taste in your mouth, both common side effects of pregnancy hormones.",
        tips: "Light exercise, like walking, can help boost your energy levels and mood. If you haven't already, start thinking about your prenatal care options and schedule your first appointment.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "brain neurons"
    },
    {
        week: 8,
        title: "Week 8: Your First Glimpse",
        size: "Your baby is the size of a raspberry.",
        development: "Webbed fingers and toes are now visible, and the tail-like structure at the bottom of the spinal cord is starting to disappear. The baby is constantly moving and shifting, although you won't be able to feel it for many weeks.",
        bodyChanges: "This is often the week of the first prenatal visit. Your doctor may perform an ultrasound, allowing you to see the tiny embryo and hear its heartbeat for the first time. You may not look pregnant yet, but your clothes might start to feel a bit snug around the waist.",
        symptoms: "Symptoms can be at their peak around this time. In addition to nausea and fatigue, you might experience mild cramping or a sense of fullness in your lower abdomen as your uterus expands.",
        tips: "Prepare for your first prenatal appointment by writing down any questions you have. Ask about genetic screening options if you're interested. Share the news with your partner and close family if you feel ready.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "ultrasound scan"
    },
    {
        week: 9,
        title: "Week 9: Baby is Now a Fetus",
        size: "Your baby is the size of a cherry.",
        development: "The embryonic period is ending, and the fetal period is beginning. This means the most critical development is complete, and the baby, now officially called a fetus, will focus on growing and maturing. All essential organs have begun to form.",
        bodyChanges: "Your heart is working harder and faster to pump the extra blood required. This increased workload can lead to fatigue and even occasional lightheadedness. Your waistline is likely starting to thicken.",
        symptoms: "Morning sickness might start to ease up for some, while for others it continues. Heartburn and indigestion may begin as the hormone progesterone relaxes the valve between your stomach and esophagus.",
        tips: "Eat smaller, more frequent meals to manage heartburn. Avoid spicy or greasy foods. Try to sleep with your head elevated. It's a good time to start thinking about a maternity wardrobe.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "fetus illustration"
    },
    {
        week: 10,
        title: "Week 10: Fingernails and Hair Appear",
        size: "Your baby is the size of a strawberry.",
        development: "Tiny fingernails and toenails are starting to form, and the fetus is covered in a fine, downy hair called lanugo. The kidneys are now producing urine, and if you're having a boy, his testes will begin producing testosterone.",
        bodyChanges: "You might notice a dark line, called the linea nigra, appearing on your abdomen. This is a common and harmless pigmentation change caused by pregnancy hormones. Your veins may also become more prominent on your chest and abdomen.",
        symptoms: "You may feel less nauseous but more round ligament pain—sharp twinges in your lower abdomen as the ligaments supporting your growing uterus stretch. Dizziness can also occur due to lower blood pressure.",
        tips: "Move slowly when changing positions to avoid dizziness. When you feel round ligament pain, try to rest and change positions. Gentle stretching can also help. Stay hydrated.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "baby hand"
    },
    {
        week: 11,
        title: "Week 11: Reflexes Develop",
        size: "Your baby is the size of a fig.",
        development: "The baby is now able to open and close its fists and mouth. Tooth buds for baby teeth are developing inside the gums. The diaphragm is forming, and the baby may start practicing breathing movements (hiccuping!).",
        bodyChanges: "Your baby bump might start to become noticeable as your uterus rises out of the pelvis. This can be an exciting milestone! You've likely gained a few pounds by now, which is perfectly normal and healthy.",
        symptoms: "As morning sickness subsides for many, appetite may return. Headaches can be a new symptom due to hormonal shifts and increased blood volume. Leg cramps, especially at night, can also start to appear.",
        tips: "For headaches, try resting in a dark, quiet room with a cool compress on your forehead. Stay hydrated. For leg cramps, stretch your calf muscles by flexing your foot. Ensure you're getting enough calcium and magnesium in your diet.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "baby feet"
    },
    {
        week: 12,
        title: "Week 12: End of the First Trimester",
        size: "Your baby is the size of a lime.",
        development: "The baby's reflexes are kicking in; fingers will curl, toes will point, and the mouth will make sucking movements. The intestines, which have been growing in the umbilical cord, are now moving into the abdominal cavity.",
        bodyChanges: "Congratulations, you've nearly reached the end of the first trimester! The risk of miscarriage drops significantly after this week. The placenta is now fully formed and has taken over the job of producing hormones to sustain the pregnancy.",
        symptoms: "Many of the pesky early symptoms like nausea and extreme fatigue will begin to fade, and you might start feeling more energetic. This is often referred to as the 'honeymoon phase' of pregnancy.",
        tips: "Now is a great time to share your news more widely if you haven't already. Start thinking about light, pregnancy-safe exercises like swimming or prenatal yoga to build strength for the months ahead.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "celebration confetti"
    },
    {
        week: 13,
        title: "Week 13: Welcome to the Second Trimester!",
        size: "Your baby is the size of a pea pod.",
        development: "Fingerprints and footprints are forming on the baby's tiny fingers and toes. The baby's vocal cords are developing, a first step toward that first cry after birth. The body is starting to grow faster than the head, becoming more proportional.",
        bodyChanges: "You're officially in the second trimester! Your uterus continues to expand up and out of the pelvis. You may notice your libido increasing as energy returns and nausea subsides.",
        symptoms: "You should be feeling much better overall. You might notice an increase in vaginal discharge (leukorrhea), which is normal and helps protect the birth canal from infection. Your gums may be more sensitive and prone to bleeding.",
        tips: "Use a soft-bristled toothbrush and be gentle when flossing. Maintain regular dental check-ups. Now is a good time to start researching childbirth classes and thinking about your birth preferences.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "yoga pose"
    },
    {
        week: 14,
        title: "Week 14: Baby Can Squint and Frown",
        size: "Your baby is the size of a lemon.",
        development: "The baby can now make facial expressions like squinting, frowning, and grimacing. The neck is getting longer, and the chin is becoming more distinct from the chest. The liver has started producing bile, and the spleen is producing red blood cells.",
        bodyChanges: "Your baby bump is likely becoming more apparent. This can be an exciting time, but it may also bring some body image concerns. Focus on what your amazing body is accomplishing.",
        symptoms: "You may experience an energy boost. Round ligament pain can continue as your uterus grows. Some women develop stretch marks on their abdomen, breasts, or hips as their skin stretches.",
        tips: "Keep your skin well-moisturized with lotions or oils to help with itchiness and potentially reduce the appearance of stretch marks. Wear comfortable, supportive clothing.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "happy pregnant"
    },
    {
        week: 15,
        title: "Week 15: Forming a Skeleton",
        size: "Your baby is the size of an apple.",
        development: "The baby's skeleton is now hardening, transforming from soft cartilage to bone, a process that will continue long after birth. The baby can sense light through its fused eyelids and may turn away from a bright light shone on your abdomen.",
        bodyChanges: "You might feel a stuffy nose or even experience nosebleeds. This is due to increased blood flow and hormonal effects on the mucous membranes in your nose.",
        tips: "Use a humidifier in your room and saline nasal spray to help with stuffiness. Stay hydrated. If you get a nosebleed, pinch your nostrils and lean forward.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "skeleton xray"
    },
    {
        week: 16,
        title: "Week 16: Growth Spurt",
        size: "Your baby is the size of an avocado.",
        development: "The baby is in the midst of a major growth spurt. The eyes are in their final position and can make small movements. The circulatory system is fully operational, with the heart pumping about 25 quarts of blood a day.",
        bodyChanges: "Around this time, you might feel the first flutters of your baby moving, known as 'quickening.' It can feel like bubbles, gas, or a gentle tapping. If it's your first pregnancy, you may not feel it for a few more weeks.",
        symptoms: "Backaches may begin as your growing belly shifts your center of gravity and pregnancy hormones relax your ligaments. Forgetfulness, often called 'pregnancy brain,' is also common.",
        tips: "Practice good posture. Sleep on your side with a pillow between your knees for back support. Wear low-heeled, comfortable shoes. Write things down to help with forgetfulness.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "butterfly stomach"
    },
    {
        week: 17,
        title: "Week 17: Baby Packs on Fat",
        size: "Your baby is the size of a turnip.",
        development: "The baby is starting to accumulate adipose tissue, or fat, which is crucial for regulating body temperature and storing energy after birth. The umbilical cord is growing stronger and thicker to accommodate the baby's needs.",
        bodyChanges: "Your appetite may increase significantly as your baby's growth accelerates. Your expanding uterus is pushing your organs aside, which can lead to indigestion and heartburn.",
        symptoms: "You might notice your skin is more sensitive to the sun. Dizziness and feeling faint can occur as your cardiovascular system adapts to the demands of pregnancy.",
        tips: "Focus on nutrient-dense foods to satisfy your hunger. Wear sunscreen whenever you go outside. Avoid standing for long periods and get up slowly to prevent dizziness.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "healthy food"
    },
    {
        week: 18,
        title: "Week 18: Baby Can Hear You",
        size: "Your baby is the size of a sweet potato.",
        development: "The nerves around the ears are now developed enough that your baby can likely hear sounds, including your heartbeat, your voice, and music. The baby's unique fingerprints and footprints are now fully formed.",
        bodyChanges: "Your growing belly is becoming more obvious. It's common to have trouble finding a comfortable sleeping position. Sleeping on your side is recommended to ensure optimal blood flow to the baby.",
        symptoms: "Swelling in your hands and feet (edema) may start to appear, especially at the end of the day. Leg cramps can also be a persistent issue.",
        tips: "Talk, sing, or read to your baby! They are starting to listen. Use pillows to support your belly and back for a more comfortable sleep. Elevate your feet to reduce swelling.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "woman singing"
    },
    {
        week: 19,
        title: "Week 19: Protective Coating Forms",
        size: "Your baby is the size of a mango.",
        development: "The baby's skin is now being coated in vernix caseosa, a greasy, cheese-like substance that protects it from the amniotic fluid. This coating will be absorbed or washed off shortly after birth.",
        bodyChanges: "As your skin stretches, you might experience itchiness, particularly on your abdomen. The linea nigra may become darker, and you might also develop chloasma, or the 'mask of pregnancy'—darker patches of skin on your face.",
        symptoms: "Dizziness and round ligament pain can continue. You may also feel out of breath more easily as your growing uterus puts pressure on your diaphragm.",
        tips: "Use gentle, moisturizing soaps and lotions to soothe itchy skin. All skin pigmentation changes are temporary and will fade after you give birth. Pace yourself and take breaks when you feel short of breath.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "lotion skin"
    },
    {
        week: 20,
        title: "Week 20: Halfway There!",
        size: "Your baby is the size of a banana.",
        development: "You've reached the halfway point! The baby is now swallowing more, which is good practice for the digestive system. You'll likely have a mid-pregnancy ultrasound this week to check on the baby's anatomy and development.",
        bodyChanges: "Your uterus has reached the level of your navel. You are clearly showing now. The mid-pregnancy scan is a major milestone where you can see your baby in incredible detail and may be able to find out the sex, if you wish.",
        symptoms: "You're likely feeling pretty good, with good energy levels. Leg cramps, swelling, and backaches are the most common complaints at this stage.",
        tips: "Prepare for your anatomy scan. Think about whether you want to know the baby's gender. This is a great time to start planning the nursery or shopping for baby essentials.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "halfway sign"
    },
    {
        week: 21,
        title: "Week 21: Tasting Flavors",
        size: "Your baby is the size of a carrot.",
        development: "The baby's taste buds are now developed, and they can taste the different flavors of the amniotic fluid, which changes based on what you eat. Their movements are becoming more coordinated.",
        bodyChanges: "You will feel the baby's kicks and punches more strongly and frequently now. Your partner might even be able to feel them by placing a hand on your belly.",
        symptoms: "Heartburn and indigestion may become more noticeable as your uterus presses up on your stomach. Stretch marks may become more prominent.",
        tips: "Eat a varied diet. The flavors you expose your baby to now may influence their food preferences later. Share the experience of feeling the baby move with your partner.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "spices variety"
    },
    {
        week: 22,
        title: "Week 22: Baby Looks Like a Newborn",
        size: "Your baby is the size of a spaghetti squash.",
        development: "The baby now looks like a miniature newborn. Lips, eyebrows, and eyelids are distinct, though the eyes still lack pigment. The pancreas, essential for hormone production, is developing steadily.",
        bodyChanges: "Your belly button might pop out, becoming an 'outie.' This is a normal result of your expanding abdomen and is temporary. You're likely feeling more and more pregnant every day.",
        symptoms: "Increased vaginal discharge, backaches, and mild swelling are common. You might also notice your hair seems thicker and more lustrous due to pregnancy hormones.",
        tips: "Enjoy the good hair days! Start thinking about your maternity leave plan and discussing it with your employer. It's never too early to be prepared.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "newborn baby"
    },
    {
        week: 23,
        title: "Week 23: Viability Milestone",
        size: "Your baby is the size of a large mango.",
        development: "The baby is now considered viable, meaning they would have a chance of survival if born prematurely, with intensive medical care. The lungs are developing branches of the respiratory tree and cells that produce surfactant, a substance that helps air sacs inflate.",
        bodyChanges: "Your weight gain should be steady, about a pound a week. The top of your uterus is now well above your navel. Feeling your baby move is a daily occurrence.",
        symptoms: "Snoring can start or worsen due to swelling in your nasal passages. Forgetfulness and clumsiness are also common as your center of gravity shifts.",
        tips: "If you haven't already, sign up for childbirth education classes. They can provide valuable information about labor, delivery, and newborn care. Stay active with safe exercises like swimming or walking.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "life preserver"
    },
    {
        week: 24,
        title: "Week 24: Responding to Touch",
        size: "Your baby is the size of an ear of corn.",
        development: "The baby's brain is growing rapidly, and they are becoming more responsive to external stimuli. They can feel movement and may respond to you rubbing your belly.",
        bodyChanges: "Your doctor will likely test you for gestational diabetes between this week and week 28. This is a routine screening to check how your body is processing sugar during pregnancy.",
        symptoms: "Your skin might feel dry and itchy. Your eyes might also feel dry and more sensitive. Some women experience Braxton Hicks contractions, which are irregular, painless 'practice' contractions.",
        tips: "Drink plenty of water for the glucose test. Use lubricating eye drops if your eyes feel dry. Learn to distinguish Braxton Hicks contractions from real labor; they should not be regular or increase in intensity.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "hand touching"
    },
    {
        week: 25,
        title: "Week 25: Hair Has Color and Texture",
        size: "Your baby is the size of a head of cauliflower.",
        development: "The baby's hair is growing and now has color and texture. They are practicing breathing by inhaling and exhaling small amounts of amniotic fluid, which is essential for lung development.",
        bodyChanges: "Your growing uterus is putting pressure on your veins, which can lead to varicose veins or hemorrhoids. It can also put pressure on your sciatic nerve, causing pain that radiates down your back and legs.",
        symptoms: "Sciatica, carpal tunnel syndrome (numbness or tingling in your hands), and restless leg syndrome can all make an appearance in the second half of pregnancy.",
        tips: "Avoid sitting or standing in one position for too long. Sleep with a pillow between your legs. Gentle stretching can help with sciatica. If you have carpal tunnel symptoms, try wearing a wrist splint at night.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "colorful hair"
    },
    {
        week: 26,
        title: "Week 26: Eyes Are Opening",
        size: "Your baby is the size of a scallion bunch.",
        development: "After being fused shut for months, the baby's eyelids are beginning to open, and they can blink. The retinas are developing, allowing them to perceive light and dark more clearly.",
        bodyChanges: "Your blood pressure may start to rise slightly after reaching its lowest point mid-pregnancy. Your doctor will monitor it closely at each visit. You're solidly in the 'looking pregnant' stage now.",
        symptoms: "You may have trouble sleeping due to your size, heartburn, or leg cramps. Braxton Hicks contractions may become more frequent.",
        tips: "Create a relaxing bedtime routine. Drink a glass of warm milk, take a warm bath, or read a book. Use plenty of pillows to get comfortable in bed.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "eye open"
    },
    {
        week: 27,
        title: "Week 27: Welcome to the Third Trimester!",
        size: "Your baby is the size of a head of lettuce.",
        development: "The baby's brain is very active, and they are likely sleeping and waking in more regular cycles. Their lungs are continuing to mature in preparation for breathing air.",
        bodyChanges: "You've reached the final trimester! The baby will be gaining weight rapidly from now until birth. You will feel bigger, more tired, and possibly more anxious about the upcoming labor and delivery.",
        symptoms: "All the previous symptoms—backaches, swelling, leg cramps, heartburn—can intensify. Shortness of breath is common as the uterus presses up against your diaphragm.",
        tips: "Finalize your birth plan and share it with your doctor or midwife. Pack your hospital bag. Take a tour of the hospital or birthing center where you plan to deliver.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "finish line"
    },
    {
        week: 28,
        title: "Week 28: Eyes Have Eyelashes",
        size: "Your baby is the size of an eggplant.",
        development: "The baby can now blink, and their eyes have eyelashes. They are putting on more fat, which is making their skin smoother and less wrinkled. They are also developing billions of neurons in their brain.",
        bodyChanges: "Your prenatal appointments will likely become more frequent, moving to every two weeks. If your blood type is Rh-negative, you'll receive a RhoGAM shot around this time.",
        symptoms: "You may feel clumsy and off-balance. Braxton Hicks contractions, restless leg syndrome, and general discomfort are the main events.",
        tips: "Start tracking your baby's movements (kick counts). Pick a time each day when your baby is active, and time how long it takes to feel 10 movements. Contact your doctor if you notice a significant decrease in activity.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "eyelashes close-up"
    },
    {
        week: 29,
        title: "Week 29: Getting Crowded in There",
        size: "Your baby is the size of a butternut squash.",
        development: "The baby's head is growing to make room for the developing brain. As the baby gets bigger and the space gets tighter, their movements may feel less like kicks and more like stretches and rolls.",
        bodyChanges: "You're likely gaining about a pound a week, with about half of that going directly to the baby. The extra weight can put a strain on your back and legs.",
        symptoms: "Heartburn, constipation, and hemorrhoids can be particularly bothersome now. Your growing belly can make simple tasks like tying your shoes a real challenge.",
        tips: "To combat constipation, eat a high-fiber diet, drink plenty of water, and stay as active as you can. Don't strain during bowel movements.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "crowded space"
    },
    {
        week: 30,
        title: "Week 30: Seeing in the Womb",
        size: "Your baby is the size of a large cabbage.",
        development: "The baby's eyesight is continuing to develop. While it's dark inside the womb, they can perceive light filtering through your abdomen and may turn their head in response.",
        bodyChanges: "You might feel like you've run a marathon just by climbing the stairs. Fatigue can return with a vengeance in the third trimester as the baby's growth demands more of your energy and sleep becomes more difficult.",
        symptoms: "Mood swings, anxiety about labor, and intense 'nesting' urges are common. You might have an overwhelming desire to clean and organize your home in preparation for the baby.",
        tips: "Channel your nesting energy productively, but don't overdo it. Rest when you need to. Talk to your partner, friends, or a professional about any anxieties you're feeling.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "light through window"
    },
    {
        week: 31,
        title: "Week 31: Practice Breathing",
        size: "Your baby is the size of a coconut.",
        development: "The baby is now making rhythmic breathing movements, though their lungs are not yet fully mature. All five senses are working, and the baby can regulate its own body temperature.",
        bodyChanges: "You may start to leak colostrum, the first milk your breasts produce. This is a sign that your body is getting ready to feed your baby. It can be clear to yellowish and is perfectly normal.",
        tips: "If you're leaking colostrum, you can use nursing pads in your bra to absorb it. This is a good time to research breastfeeding and lactation support options in your area.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "breathing exercise"
    },
    {
        week: 32,
        title: "Week 32: Getting into Position",
        size: "Your baby is the size of a jicama.",
        development: "The baby is likely getting into the head-down position in preparation for birth. The toenails are now fully formed, and the downy lanugo that covered their skin is starting to shed.",
        bodyChanges: "Your doctor will check the baby's position at your appointments. The baby's kicks might feel different, possibly higher up under your ribs, as they settle into your pelvis.",
        symptoms: "Shortness of breath and heartburn can be at their peak as the uterus is now pressing high up against your diaphragm and stomach. You're in the home stretch!",
        tips: "Pay attention to the signs of preterm labor, such as regular contractions, constant low backache, or a change in vaginal discharge. Call your doctor immediately if you have any concerns.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "gymnast pose"
    },
    {
        week: 33,
        title: "Week 33: Harder Bones",
        size: "Your baby is the size of a pineapple.",
        development: "The baby's bones are hardening, though the skull remains soft and flexible to allow for an easier passage through the birth canal. The baby is also absorbing antibodies from you, which will help protect them from illness after birth.",
        bodyChanges: "The volume of amniotic fluid is at its maximum, and your belly is likely feeling very large and tight. It's getting harder to bend over or find a comfortable position.",
        symptoms: "You might feel a tingling or numbness in your fingers and toes due to water retention putting pressure on your nerves. Overall achiness and discomfort are the new normal.",
        tips: "Keep drinking plenty of water, as it can actually help reduce water retention. Continue to eat a healthy diet to provide the calcium your baby needs for bone development.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "strong bones"
    },
    {
        week: 34,
        title: "Week 34: Baby's Lungs Maturing",
        size: "Your baby is the size of a cantaloupe.",
        development: "The baby's lungs are now well-developed, and the vernix caseosa coating on their skin is getting thicker. If you're having a boy, his testicles are descending from his abdomen into his scrotum.",
        bodyChanges: "You might feel the baby 'drop' as they settle lower into your pelvis. This is called lightening, and it can relieve pressure on your diaphragm, making it easier to breathe. However, it increases pressure on your bladder.",
        symptoms: "With lightening, you may feel an increased need to urinate and more pelvic pressure. Fatigue is likely very high at this point.",
        tips: "Rest as much as you possibly can. Put your feet up whenever you get the chance. Don't hesitate to ask for help from your partner, family, or friends.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "lungs diagram"
    },
    {
        week: 35,
        title: "Week 35: Rapid Weight Gain",
        size: "Your baby is the size of a honeydew melon.",
        development: "The baby won't get much longer, but they will continue to pack on the pounds—about half a pound a week. This fat will help them regulate their body temperature after birth.",
        bodyChanges: "Your prenatal visits are likely weekly now. Your doctor may perform a Group B strep test, which is a routine swab to check for bacteria that could be passed to the baby during delivery.",
        symptoms: "You're likely feeling very uncomfortable and impatient. Waking up frequently at night to use the bathroom or change positions is standard.",
        tips: "Review the signs of labor with your partner: contractions that get stronger, longer, and closer together; your water breaking; and the loss of your mucus plug. Know when to call your doctor or head to the hospital.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "weight scale"
    },
    {
        week: 36,
        title: "Week 36: Almost Full-Term",
        size: "Your baby is the size of a head of romaine lettuce.",
        development: "Your baby is now considered 'early term.' They are practicing sucking, swallowing, and breathing in preparation for life outside the womb. They are shedding most of the downy lanugo and vernix caseosa.",
        bodyChanges: "Your doctor will be checking your cervix for signs of effacement (thinning) and dilation (opening). These are signs that your body is preparing for labor, but they don't predict exactly when it will start.",
        symptoms: "You might experience a mix of excitement and anxiety. Pelvic pressure, backaches, and Braxton Hicks contractions are all part of the package.",
        tips: "Make sure your hospital bag is packed and ready to go. Install the baby's car seat and have it inspected. Do some meal prep and freeze some easy meals for after the baby arrives.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "baby clothes"
    },
    {
        week: 37,
        title: "Week 37: Full-Term!",
        size: "Your baby is the size of a Swiss chard.",
        development: "Congratulations, your baby is now considered 'full-term'! This means their lungs are mature enough to breathe on their own. Their main job now is to continue putting on fat.",
        bodyChanges: "You could go into labor any day now! But don't be discouraged if your due date comes and goes; it's very common, especially for first-time moms.",
        symptoms: "An increase in vaginal discharge, possibly tinged with blood (the 'bloody show'), and more frequent or intense Braxton Hicks contractions can be signs that labor is near.",
        tips: "Try to relax and conserve your energy. Go for gentle walks, watch movies, and enjoy these last few days or weeks of pregnancy. You've done an incredible job.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
aiHint: "calendar due date"
    },
    {
        week: 38,
        title: "Week 38: Getting Ready",
        size: "Your baby is the size of a pumpkin.",
        development: "The baby has a firm grasp, and their brain and nervous system are ready for life on the outside. They have about an ounce of meconium, their first bowel movement, in their intestines.",
        bodyChanges: "You are in a waiting game. Your body is making the final preparations for the marathon of labor. Every twinge and cramp will have you wondering, 'Is this it?'",
        symptoms: "Swelling, discomfort, and impatience are at an all-time high. It's hard to sleep, it's hard to move, and it's hard to wait.",
        tips: "Rest, rest, rest. Sleep whenever you can. Eat small, easily digestible meals to keep your energy up. Trust your body—it knows what to do.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "running race"
    },
    {
        week: 39,
        title: "Week 39: On The Brink",
        size: "Your baby is the size of a watermelon.",
        development: "The baby's brain is still developing and will continue to do so at an amazing rate for the first few years of life. They are plump and ready for birth.",
        bodyChanges: "Your cervix may be continuing to dilate and efface. Your doctor might discuss options for induction if you go too far past your due date.",
        symptoms: "The end is in sight! Labor could start at any moment. Contractions will be the most definitive sign.",
        tips: "Stay calm and trust the process. When labor starts, remember your breathing techniques from your childbirth class. You are strong, and you can do this.",
        imageUrl: "https://i.pinimg.com/1200x/0e/40/40/0e4040ee25da30655d857de0fb12943b.jpg",
        aiHint: "calm water"
    },
    {
        week: 40,
        title: "Week 40: Due Date!",
        size: "Your baby is the size of a small pumpkin.",
        development: "The baby is fully developed and ready to meet you. They are waiting for the signal to begin their journey into the world.",
        bodyChanges: "Your due date is here, but it's just an estimate. Only about 5% of babies are born on their actual due date. Don't worry if you're still pregnant.",
        symptoms: "You are likely feeling a potent combination of being physically miserable and incredibly excited.",
        tips: "If you're feeling antsy, try some natural methods that are thought to encourage labor, like walking or spicy food (with your doctor's approval, of course). Soon, you'll be holding your baby in your arms.",
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
                                    <TabsContent value="development" className="mt-4 prose max-w-none text-foreground text-sm"><p>{currentWeekData.development}</p></TabsContent>
                                    <TabsContent value="body" className="mt-4 prose max-w-none text-foreground text-sm"><p>{currentWeekData.bodyChanges}</p></TabsContent>
                                    <TabsContent value="symptoms" className="mt-4 prose max-w-none text-foreground text-sm"><p>{currentWeekData.symptoms}</p></TabsContent>
                                    <TabsContent value="tips" className="mt-4 prose max-w-none text-foreground text-sm"><p>{currentWeekData.tips}</p></TabsContent>
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
