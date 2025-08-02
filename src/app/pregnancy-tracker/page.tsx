
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, differenceInDays, startOfDay, addWeeks, subDays, differenceInWeeks } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, ChevronLeft, Info, Baby, Heart, Milestone, BarChart, BookOpen, Lightbulb, ClipboardPlus, Video, CheckSquare, Square, ThumbsUp, PartyPopper, History, Home, Stethoscope, FileText, CalendarCheck, Library, PanelLeft, ChevronDown } from 'lucide-react';
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
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';


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
    { week: 0, title: "Getting Started", size: "Your journey is about to begin.", summary: "Set your due date or last menstrual period to start tracking your pregnancy week by week.", development: "", bodyChanges: "", symptoms: "", tips: "", imageUrl: "https://placehold.co/600x400.png", aiHint: "pregnancy test" },
    { week: 1, title: "Week 1: The Journey Begins", size: "You're on your period, so not yet pregnant.", summary: "Pregnancy is counted from the first day of your last period. This week, your body is preparing for potential conception.", development: "Your body is shedding the uterine lining and preparing for a new cycle. Hormones are gearing up to mature and release a new egg.", bodyChanges: "Typical period symptoms like cramping and bloating are common. Estrogen and progesterone levels are low.", symptoms: "Bleeding, lower back pain, cramps, bloating, and mood swings are all related to your period, not pregnancy.", tips: "Focus on your health. Start taking prenatal vitamins with folic acid. Reduce alcohol and caffeine intake.", imageUrl: "https://placehold.co/600x400.png", aiHint: "calendar vitamins" },
    { week: 2, title: "Week 2: Preparing for Ovulation", size: "An egg is maturing in your ovary.", summary: "Your uterine lining is thickening, and your body is getting ready to release an egg. This is your fertile window.", development: "A dominant follicle containing an egg is growing. Your uterine lining is thickening to create a welcoming home for a fertilized egg.", bodyChanges: "You might feel a boost in energy and libido as estrogen levels rise. Cervical mucus becomes clear and stretchy.", symptoms: "Increased energy, heightened sense of smell, and changes in cervical mucus are key signs. Some feel a slight twinge of pain during ovulation (mittelschmerz).", tips: "This is the optimal time to try to conceive. Pay attention to signs of ovulation. Maintain a healthy lifestyle.", imageUrl: "https://placehold.co/600x400.png", aiHint: "flower blooming" },
    { week: 3, title: "Week 3: Fertilization & Implantation", size: "The fertilized egg, or blastocyst, is a microscopic ball of cells.", summary: "Success! A sperm has fertilized the egg, and this new ball of cells is making its way to your uterus for implantation.", development: "The fertilized egg (zygote) rapidly divides as it travels down the fallopian tube. It becomes a blastocyst and begins to implant into the uterine wall.", bodyChanges: "All the action is microscopic. Progesterone levels start to rise. Some women experience light implantation spotting or cramping.", symptoms: "Implantation spotting or cramping. Early fatigue and breast tenderness can begin. Many women feel no symptoms at all.", tips: "Continue 'acting pregnant'—avoid alcohol and keep taking prenatals. It's still too early for a pregnancy test.", imageUrl: "https://placehold.co/600x400.png", aiHint: "cells microscope" },
    { week: 4, title: "Week 4: A Positive Test!", size: "Your baby is the size of a poppy seed.", summary: "The blastocyst has successfully implanted in your uterine wall. This is the week you'll likely miss your period and get a positive pregnancy test!", development: "The blastocyst is now an embryo. The foundational layers for all organs are forming. The placenta and amniotic sac are developing.", bodyChanges: "A missed period is the biggest sign. hCG hormone levels are rising rapidly, causing fatigue, bloating, and sore breasts.", symptoms: "Profound fatigue, sore breasts, bloating, and possibly mild, period-like cramping are very common. A home pregnancy test should now be positive.", tips: "Take a home pregnancy test! Call your doctor to schedule your first prenatal appointment (usually around week 8).", imageUrl: "https://placehold.co/600x400.png", aiHint: "pregnancy test positive" },
    { week: 5, title: "Week 5: The Heart Begins to Beat", size: "Your baby is the size of an apple seed.", summary: "An incredible milestone: your baby's heart begins to beat! The neural tube, which becomes the brain and spinal cord, is also forming now.", development: "The heart, a simple tube, begins to beat and circulate blood. The neural tube is closing. The groundwork for the brain, eyes, and ears is being laid.", bodyChanges: "Hormones are surging, amplifying symptoms. Your uterus is growing, increasing pressure on your bladder.", symptoms: "Morning sickness, fatigue, and sore breasts may intensify. Frequent urination and food aversions are very common.", tips: "Eat small, frequent meals to combat nausea. Rest whenever you can. Stay hydrated, even if you don't feel like it.", imageUrl: "https://placehold.co/600x400.png", aiHint: "heartbeat wave" },
    { week: 6, title: "Week 6: Facial Features Form", size: "Your baby is the size of a lentil.", summary: "Basic facial features are taking shape. Dark spots mark where the eyes and nostrils will be, and tiny buds that will become arms and legs are sprouting.", development: "The eyes, nostrils, and jaw are beginning to form. Arm and leg buds are sprouting. The heart is beating in a more regular rhythm.", bodyChanges: "Bloating might make your pants feel tight. Your breasts continue to grow and may feel sore. The placenta is still developing, which causes fatigue.", symptoms: "Morning sickness is often at its peak. Fatigue can be overwhelming. Mood swings are common due to the hormonal rollercoaster.", tips: "Keep bland snacks on hand. A supportive, wireless bra can be a lifesaver. Share how you're feeling with your partner.", imageUrl: "https://placehold.co/600x400.png", aiHint: "embryo illustration" },
    { week: 7, title: "Week 7: Baby's Brain Development", size: "Your baby is the size of a blueberry.", summary: "Your baby's brain is developing at an astonishing rate, forming about 100 new cells every minute. Their arms and legs are getting longer.", development: "About 100 new brain cells are forming every minute. Arm and leg buds have grown into paddle-like limbs. Kidneys are now in place.", bodyChanges: "Your uterus has doubled in size. Your blood volume is increasing, which can cause headaches and dizziness. Progesterone may cause constipation.", symptoms: "Nausea and fatigue are still major players. Frequent urination continues. Some women notice more saliva or a metallic taste.", tips: "Drink plenty of fluids. Increase your fiber intake. Start writing down questions for your first prenatal visit.", imageUrl: "https://placehold.co/600x400.png", aiHint: "brain neurons" },
    { week: 8, title: "Week 8: Your First Glimpse", size: "Your baby is the size of a raspberry.", summary: "This is a common week for your first prenatal appointment and ultrasound, where you may see your baby and their flickering heartbeat for the first time.", development: "Fingers and toes are forming, though still webbed. The embryonic 'tail' is disappearing. The baby is constantly making small, spontaneous movements.", bodyChanges: "This is a big week for your first prenatal visit and ultrasound! Your waistline is thickening. The 'pregnancy glow' might appear.", symptoms: "Morning sickness and fatigue may be at their most intense. 'Pregnancy brain' or forgetfulness can start. Vivid dreams are common.", tips: "Prepare for your first appointment with questions. It might be time for maternity pants. Make a dental appointment, as gums can be sensitive.", imageUrl: "https://placehold.co/600x400.png", aiHint: "ultrasound scan" },
    { week: 9, title: "Week 9: Baby is Now a Fetus", size: "Your baby is the size of a cherry.", summary: "Big news! Your baby officially graduates from an embryo to a fetus. All their essential organs are formed and will now focus on growing and maturing.", development: "The embryo is now a fetus. All essential organs are formed. Joints like elbows and knees are working. Tiny tooth buds are forming in the gums.", bodyChanges: "Your uterus is now the size of a small melon. Fatigue is still significant as the placenta prepares to take over. You might notice round ligament pain.", symptoms: "Nausea may still be present. Heartburn and indigestion can begin. Headaches are common. Nasal congestion can occur.", tips: "Invest in comfortable clothing. Stay hydrated to help with headaches. Avoid spicy or greasy foods to manage heartburn.", imageUrl: "https://placehold.co/600x400.png", aiHint: "fetus illustration" },
    { week: 10, title: "Week 10: Fingernails and Hair Appear", size: "Your baby is the size of a strawberry.", summary: "Your fetus is looking more and more like a baby. Tiny fingernails are forming, and a fine, downy hair called lanugo is appearing on their skin.", development: "Tiny fingernails are forming. The skeleton is beginning to harden. The brain is developing rapidly. The fetus can bend its limbs.", bodyChanges: "The placenta is almost ready to take over hormone production. The linea nigra (a dark line on your abdomen) may appear. Round ligament pain can continue.", symptoms: "Morning sickness and fatigue may start to ease up. Increased vaginal discharge is normal. Dizziness can still occur.", tips: "Start thinking about your maternity leave plan. Moisturize your belly to help with itchiness. Keep up with gentle exercise.", imageUrl: "https://placehold.co/600x400.png", aiHint: "baby hand" },
    { week: 11, title: "Week 11: Reflexes Develop", size: "Your baby is the size of a fig.", summary: "The fetus is practicing reflexes, like opening and closing its fists and making sucking movements with its mouth. They're getting a workout in there!", development: "Baby can open and close its fists and make sucking motions. The diaphragm is forming, and they might get hiccups. Sex organs are forming.", bodyChanges: "Your baby bump might be starting to show. The placenta takes over hormone production, often leading to a surge of energy.", symptoms: "Energy levels rebound. Nausea subsides. Leg cramps, especially at night, can start. Headaches are still possible.", tips: "Take advantage of your energy! Establish a regular exercise routine. For cramps, stretch your calves before bed.", imageUrl: "https://placehold.co/600x400.png", aiHint: "baby feet" },
    { week: 12, title: "Week 12: End of the First Trimester", size: "Your baby is the size of a lime.", summary: "You've made it! At the end of the first trimester, your baby's reflexes are sharpening, and their unique fingerprints are forming.", development: "Unique fingerprints are forming. Vocal cords are complete. Intestines move into their permanent home in the abdomen. The fetus is very active.", bodyChanges: "End of the first trimester! The risk of miscarriage drops significantly. Your uterus can be felt in your lower abdomen. Your bump is starting to show.", symptoms: "The 'honeymoon' period often begins, with more energy and less nausea. Dizziness can still be an issue. You might feel abdominal aches as your uterus expands.", tips: "This is a popular time to announce your pregnancy. Listen to the baby's heartbeat at your next appointment. Start a baby name list for fun.", imageUrl: "https://placehold.co/600x400.png", aiHint: "celebration confetti" },
    { week: 13, title: "Week 13: Welcome to the Second Trimester!", size: "Your baby is the size of a pea pod.", summary: "Hello, second trimester! Often called the 'golden' trimester, you may feel your energy return. Your baby is busy developing vocal cords and unique fingerprints.", development: "Baby is now peeing! They swallow amniotic fluid and pass it as urine. Bones are hardening. The neck is getting longer.", bodyChanges: "Welcome to the second trimester! Your libido might increase. Your bump is more noticeable. You might notice a thin, milky vaginal discharge.", symptoms: "A surge of energy is common. Round ligament pain can occur. Varicose veins may start to appear. Clumsiness can set in.", tips: "Use a soft toothbrush for sensitive gums. Start researching childbirth classes. Wear comfortable, supportive shoes.", imageUrl: "https://placehold.co/600x400.png", aiHint: "yoga pose" },
    { week: 14, title: "Week 14: Baby Can Squint and Frown", size: "Your baby is the size of a lemon.", summary: "Your baby can now make facial expressions! They're also growing longer arms and a more distinct neck. Your energy levels are likely high.", development: "Baby can squint, frown, and grimace. Fine lanugo hair covers the body. The arms are now proportional to the body. The liver and spleen are working.", bodyChanges: "Your bump is likely obvious now. Your hair may seem thicker and more lustrous. Your appetite might be increasing.", symptoms: "Increased energy continues. A stuffy nose (pregnancy rhinitis) is common. Bleeding gums can persist. Backaches may start.", tips: "Stay active. Keep healthy snacks on hand. Practice good posture to prevent backaches. Read books about childbirth and newborn care.", imageUrl: "https://placehold.co/600x400.png", aiHint: "happy pregnant" },
    { week: 15, title: "Week 15: Forming a Skeleton", size: "Your baby is the size of an apple.", summary: "Your baby's skeleton is hardening from cartilage to bone, and they can now sense light through their fused eyelids. They may even be able to hear you!", development: "The skeleton is hardening (ossification). The baby can sense light. Tiny bones in the ears are developing, so they can likely hear muffled sounds.", bodyChanges: "You might get nosebleeds due to increased blood flow. Your uterus is about 3-4 inches below your navel. You're gaining about a pound a week.", symptoms: "A stuffy nose or nosebleeds are common. Heartburn and indigestion can be frequent. Leg cramps can interrupt sleep.", tips: "Get plenty of calcium. Your doctor may offer a quad screen test. Wear low-heeled shoes. Start talking to your baby!", imageUrl: "https://placehold.co/600x400.png", aiHint: "skeleton xray" },
    { week: 16, title: "Week 16: Growth Spurt", size: "Your baby is the size of an avocado.", summary: "Get ready for a growth spurt! Your baby's nervous system is maturing, and you might start to feel the first gentle flutters of movement, called 'quickening.'", development: "Baby is having a growth spurt! The heart is pumping 25 quarts of blood a day. The eyes can make small movements. The nervous system is maturing.", bodyChanges: "You might feel the first flutters of movement (quickening)! Your bump is growing. The 'pregnancy glow' is common.", symptoms: "'Pregnancy brain' or forgetfulness is real. Backaches become more noticeable. Vision changes, like blurriness, can occur.", tips: "Write things down to combat pregnancy brain. Don't worry if you haven't felt movement yet, especially if it's your first time.", imageUrl: "https://placehold.co/600x400.png", aiHint: "butterfly stomach" },
    { week: 17, title: "Week 17: Baby Packs on Fat", size: "Your baby is the size of a turnip.", summary: "Your baby is starting to accumulate fat, which is crucial for staying warm after birth. Their hearing is improving, and they may be startled by loud noises.", development: "Baby starts to accumulate fat. The umbilical cord is getting stronger. Reflexes like sucking and swallowing are maturing. Hearing is improving.", bodyChanges: "Your appetite may increase significantly. The expanding uterus can cause heartburn. You're gaining about 1-2 pounds per week.", symptoms: "Heartburn is common. Backaches and hip pain can occur. Your skin might be more sensitive to the sun. Swelling in ankles and feet may appear.", tips: "Eat smaller, more frequent meals. Elevate your feet to reduce swelling. Always wear sunscreen. Moisturize your itchy belly.", imageUrl: "https://placehold.co/600x400.png", aiHint: "healthy food" },
    { week: 18, title: "Week 18: Baby Can Hear You", size: "Your baby is the size of a sweet potato.", summary: "Baby's hearing is now well-developed! They can hear your heartbeat, your voice, and other sounds from the outside world. Start talking and singing to them!", development: "Hearing is well-developed. The nerves in the brain are being coated in myelin, allowing for faster connections. The baby is very active.", bodyChanges: "It's getting harder to sleep comfortably. Your uterus is the size of a cantaloupe. Your blood pressure may be lower than normal.", symptoms: "You're likely feeling kicks more consistently. Swelling in hands and feet is common. Leg cramps at night can be a nuisance.", tips: "Talk, sing, and read to your baby! Invest in a good pregnancy pillow for sleeping. The anatomy scan ultrasound is usually scheduled soon.", imageUrl: "https://placehold.co/600x400.png", aiHint: "woman singing" },
    { week: 19, title: "Week 19: Protective Coating Forms", size: "Your baby is the size of a mango.", summary: "A greasy, cheese-like substance called vernix caseosa is now coating your baby's skin, protecting it from the amniotic fluid.", development: "A waxy coating called vernix caseosa now protects the skin. The brain's sensory areas are developing. Hair is sprouting on the scalp.", bodyChanges: "You might develop chloasma ('mask of pregnancy'). The linea nigra on your abdomen may be more pronounced. Your uterus is at your navel.", symptoms: "Shortness of breath can become more common. Dizziness can still occur. Hip pain is possible as ligaments loosen. Itchy skin is common.", tips: "Use gentle moisturizers for itchy skin. Protect your skin from the sun. Gentle stretching can help with hip and back pain.", imageUrl: "https://placehold.co/600x400.png", aiHint: "lotion skin" },
    { week: 20, title: "Week 20: Halfway There!", size: "Your baby is the size of a banana.", summary: "You're at the halfway point! This week is often when the detailed anatomy scan ultrasound is performed. Your baby is busy practicing swallowing.", development: "Halfway there! Baby is swallowing more, which is good practice for the digestive system. They're producing meconium (their first poop).", bodyChanges: "The detailed anatomy scan is usually this week. Your belly button might pop out. Energy levels are still good.", symptoms: "Physical aches and pains are the main complaint: backaches, hip pain, leg cramps. Mild swelling is normal. Sleep becomes more challenging.", tips: "Start planning the nursery. Begin shopping for baby essentials. Decide if you want to find out the baby's gender. Celebrate the halfway mark!", imageUrl: "https://placehold.co/600x400.png", aiHint: "halfway sign" },
    { week: 21, title: "Week 21: Tasting Flavors", size: "Your baby is the size of a large carrot.", summary: "Baby's taste buds are working! The flavors from the food you eat can pass into the amniotic fluid, giving your baby their first taste of what you're having for dinner.", development: "Taste buds are working. Movements are becoming more coordinated, less random. Bone marrow is starting to make red blood cells.", bodyChanges: "You can likely feel kicks and punches much more strongly now. Heartburn can worsen. Stretch marks may appear.", symptoms: "Strong fetal movements are the main event. Increased heartburn. Leg cramps and backaches persist. Braxton Hicks 'practice' contractions can start.", tips: "Eat a varied diet to introduce flavors to your baby. Share the magic of feeling kicks with your partner. For Braxton Hicks, change positions or drink water.", imageUrl: "https://placehold.co/600x400.png", aiHint: "spices variety" },
    { week: 22, title: "Week 22: Baby Looks Like a Newborn", size: "Your baby is the size of a spaghetti squash.", summary: "With distinct lips, eyebrows, and eyelids, your baby now looks like a miniature newborn. Their pancreas is developing, which is key for producing hormones.", development: "Baby looks like a miniature newborn. The pancreas is developing. The iris of the eye still lacks pigment. The skin is becoming less translucent.", bodyChanges: "Your belly button might pop out. Your hair may seem extra thick and lustrous. Your feet might have grown a shoe size.", symptoms: "Increased vaginal discharge. Heartburn. Backaches. Swelling. Feeling hot. Trouble sleeping. You might feel the baby's hiccups!", tips: "Enjoy your great pregnancy hair! Start seriously thinking about your maternity leave plan. Invest in new, comfortable shoes if needed.", imageUrl: "https://placehold.co/600x400.png", aiHint: "newborn baby" },
    { week: 23, title: "Week 23: Viability Milestone", size: "Your baby is the size of a large mango or eggplant.", summary: "This is a major milestone: the age of viability. A baby born now has a chance of survival with intensive medical care as their lungs develop surfactant, a key substance for breathing.", development: "Age of viability! Lungs are developing surfactant, a substance crucial for breathing. Blood vessels in the lungs are developing. Hearing is improving.", bodyChanges: "You're gaining weight steadily. You're getting to know your baby's movement patterns. Your expanding uterus is putting pressure on all your organs.", symptoms: "Snoring can start or worsen. Clumsiness and 'pregnancy brain' continue. Swelling in ankles and feet is common. Backaches are frequent.", tips: "Sign up for childbirth classes. Swimming can feel amazing and relieve pressure. Elevate your feet to help with swelling.", imageUrl: "https://placehold.co/600x400.png", aiHint: "life preserver" },
    { week: 24, title: "Week 24: Responding to Touch", size: "Your baby is the size of an ear of corn.", summary: "Baby's brain is growing rapidly, and they can now feel movement and respond to your touch. Gently rubbing your belly is a new way to bond.", development: "Baby's brain is growing rapidly. They can feel movement and may respond to touch. The respiratory 'tree' in the lungs is developing.", bodyChanges: "Your doctor will recommend a glucose test soon to check for gestational diabetes. Your uterus is the size of a soccer ball. Your gait may change to a 'waddle'.", symptoms: "Your skin and eyes might feel dry. Braxton Hicks contractions can be more noticeable. Sleep disturbances are common. Heartburn is persistent.", tips: "Use lubricating eye drops if needed. For Braxton Hicks, relax and drink water. Gently rubbing your belly is a great way to bond.", imageUrl: "https://placehold.co/600x400.png", aiHint: "hand touching" },
    { week: 25, title: "Week 25: Hair Has Color and Texture", size: "Your baby is the size of a head of cauliflower.", summary: "That little head of hair is growing in and now has color and texture! Baby is also practicing breathing by inhaling and exhaling amniotic fluid.", development: "Baby's hair has color and texture. They are practicing breathing motions. Nostrils are opening. Hands are fully developed.", bodyChanges: "You might experience sciatica (sharp nerve pain down one leg). Carpal tunnel syndrome can appear. Your balance is increasingly challenged.", symptoms: "Sciatic nerve pain. Numbness or tingling in hands. Restless leg syndrome. Insomnia. Hemorrhoids. Feeling hot.", tips: "Gentle stretching can help with sciatica. For carpal tunnel, avoid repetitive hand movements. For restless legs, stretch before bed.", imageUrl: "https://placehold.co/600x400.png", aiHint: "colorful hair" },
    { week: 26, title: "Week 26: Eyes Are Opening", size: "Your baby is the size of a bunch of scallions or a kale.", summary: "Peek-a-boo! Your baby's eyelids, which were fused shut, are now beginning to open. They can see light and dark and will blink in response.", development: "Eyelids are opening and can blink. Brainwave activity for hearing and sight is now active. Lungs are producing more surfactant.", bodyChanges: "Your blood pressure may start to rise slightly. Your uterus is 2.5 inches above your navel. Swelling in your feet and ankles can be significant.", symptoms: "Trouble sleeping is very common. Braxton Hicks may be more frequent. Headaches and vision changes should be reported to your doctor.", tips: "Create a relaxing bedtime routine. Learn the signs of preeclampsia (severe headache, vision changes, sudden swelling). Finalize your pediatrician choice.", imageUrl: "https://placehold.co/600x400.png", aiHint: "eye open" },
    { week: 27, title: "Week 27: Welcome to the Third Trimester!", size: "Your baby is the size of a head of lettuce.", summary: "You've reached the final trimester! Your baby's brain is very active, and you might start to feel their tiny hiccups as rhythmic, jerky movements.", development: "Baby's brain is very active. They have regular sleep/wake cycles. You might feel their hiccups. They can distinguish sweet and sour tastes.", bodyChanges: "Welcome to the third trimester! Fatigue may return. Your uterus is up near your rib cage. You're in a period of rapid weight gain.", symptoms: "Shortness of breath is common. Backaches, swelling, and leg cramps can intensify. Constipation and hemorrhoids are frequent. Anxiety about labor is normal.", tips: "Finalize your birth plan, but be flexible. Pack your hospital bag. Take a hospital tour. Rest as much as possible.", imageUrl: "https://placehold.co/600x400.png", aiHint: "finish line" },
    { week: 28, title: "Week 28: Eyes Have Eyelashes", size: "Your baby is the size of a large eggplant.", summary: "Your baby can now blink and has a full set of eyelashes. They are also experiencing REM sleep, which means they are likely dreaming!", development: "Baby can blink and has eyelashes. They are experiencing REM sleep (dreaming!). Their brain is developing billions of neurons. Their bones are fully developed but soft.", bodyChanges: "Your prenatal appointments are likely every two weeks now. If you're Rh-negative, you'll get a RhoGAM shot. You're gaining about a pound a week.", symptoms: "Clumsiness is common. Braxton Hicks and restless legs continue. Insomnia is frequent. Heartburn can be bad. Itchy skin persists.", tips: "Start doing daily 'kick counts' to monitor baby's movement. Finalize childcare arrangements. Read up on the postpartum period.", imageUrl: "https://placehold.co/600x400.png", aiHint: "eyelashes close-up" },
    { week: 29, title: "Week 29: Getting Crowded in There", size: "Your baby is the size of a butternut squash.", summary: "As space gets tighter, baby's movements might feel less like sharp kicks and more like strong rolls and stretches. Their adrenal glands are now producing hormones.", development: "Movements feel more like rolls and stretches. Adrenal glands are producing hormones. The baby is gaining weight steadily, depositing fat.", bodyChanges: "The extra weight and pressure can strain your back, legs, and bladder. Your skin may feel stretched to the max. Pelvic girdle pain is possible.", symptoms: "Heartburn and constipation can be very bothersome. Tying your shoes is a challenge. Feeling emotional or 'over it' is understandable.", tips: "Eat a high-fiber diet for constipation. Use a stool to elevate your feet. Install the car seat and have it checked.", imageUrl: "https://placehold.co/600x400.png", aiHint: "crowded space" },
    { week: 30, title: "Week 30: Seeing in the Womb", size: "Your baby is the size of a large cabbage.", summary: "Your baby's eyesight is improving, and they can now see what's going on inside the uterus, like perceiving light filtering through your belly.", development: "Baby's eyesight is improving. Lanugo (fine hair) is disappearing. Bone marrow is producing red blood cells. The brain is getting its characteristic wrinkles.", bodyChanges: "Fatigue can return with a vengeance. Your belly button might be an 'outie.' Your balance is significantly off.", symptoms: "The 'nesting' instinct might kick in. Mood swings and anxiety are common. Insomnia is a major complaint. Clumsiness is a real risk.", tips: "Channel nesting energy productively, but don't overdo it. Talk about your feelings and anxieties. Finish packing your hospital bag.", imageUrl: "https://placehold.co/600x400.png", aiHint: "light through window" },
    { week: 31, title: "Week 31: Practice Breathing", size: "Your baby is the size of a coconut.", summary: "The baby is making rhythmic breathing movements, practicing for life on the outside. Their senses are all functional and they can regulate their own temperature.", development: "Baby is making rhythmic breathing movements. They can regulate their own temperature. All five senses are functional. Sucking reflex is strong.", bodyChanges: "You may leak colostrum (first milk). Braxton Hicks may be more frequent. Your uterus is crowding all your organs.", symptoms: "Frequent urination is a given. Sleep is fragmented. Heartburn and shortness of breath are common. Back pain is persistent.", tips: "Use nursing pads if you're leaking colostrum. Read up on breastfeeding. Know the difference between Braxton Hicks and true labor.", imageUrl: "https://placehold.co/600x400.png", aiHint: "breathing exercise" },
    { week: 32, title: "Week 32: Getting into Position", size: "Your baby is the size of a jicama or large squash.", summary: "Most babies flip into a head-down position this week in preparation for birth. Their soft skull plates are designed to overlap for an easier journey.", development: "Baby is likely moving into the head-down position. Lanugo is shedding. Skin is becoming smoother. Pupils can constrict and dilate.", bodyChanges: "Your provider will start checking baby's position. You might feel kicks under your ribs. Your blood volume has increased by 40-50%.", symptoms: "Shortness of breath and heartburn are at their peak. Strong Braxton Hicks are more frequent. Lower back pain and pelvic pressure are intense.", tips: "Familiarize yourself with signs of preterm labor. Discuss breech options with your doctor if needed. Eat small, frequent meals.", imageUrl: "https://placehold.co/600x400.png", aiHint: "gymnast pose" },
    { week: 33, title: "Week 33: Harder Bones", size: "Your baby is the size of a pineapple.", summary: "Baby's bones are hardening as they absorb lots of calcium from you. Their immune system is also getting a boost by borrowing your antibodies.", development: "Baby's bones are hardening. They are absorbing lots of antibodies from you for immunity. The brain is still developing rapidly. Fat layers are plumping up.", bodyChanges: "Amniotic fluid is at its peak volume. Your joints are very loose and unstable. Shortness of breath continues, but may improve if the baby drops.", symptoms: "Tingling or numbness in your hands and feet. Overheating. Difficulty sleeping. Heartburn. Backaches. Anxiety about labor.", tips: "Keep up your calcium intake. Wear supportive shoes. A warm bath can be soothing. Finalize your birth plan, but stay flexible.", imageUrl: "https://placehold.co/600x400.png", aiHint: "strong bones" },
    { week: 34, title: "Week 34: Baby's Lungs Maturing", size: "Your baby is the size of a cantaloupe.", summary: "Baby's lungs are now well-developed and have a good chance of breathing without assistance if born now. Their fingernails have reached their fingertips.", development: "Lungs are well-developed and producing surfactant. For boys, testicles have likely descended. Vernix coating is getting thicker. Fingernails are at the fingertips.", bodyChanges: "The baby may 'drop' into your pelvis (lightening), making it easier to breathe but increasing bladder pressure. Your cervix may start to soften.", symptoms: "Increased pelvic pressure and more frequent urination if the baby has dropped. Less heartburn. Blurry vision is possible. Impatience is high.", tips: "Rest as much as possible. Don't hesitate to ask for help. Know the signs of labor vs. Braxton Hicks. Do a trial run to the hospital.", imageUrl: "https://placehold.co/600x400.png", aiHint: "lungs diagram" },
    { week: 35, title: "Week 35: Rapid Weight Gain", size: "Your baby is the size of a honeydew melon.", summary: "Baby is packing on about half a pound per week now, plumping up for their arrival. Your prenatal appointments will likely become weekly.", development: "Baby is gaining about half a pound a week. Lungs are almost fully mature. Kidneys and liver are fully developed. Movements are more rolling than kicking.", bodyChanges: "Your appointments are now weekly. Your provider will do a Group B strep test. Your uterus is 1,000 times its original size.", symptoms: "Feeling very uncomfortable, tired, and impatient. Waking up frequently at night. Constant need to urinate. Strong Braxton Hicks.", tips: "Review the signs of labor. Have hospital bags packed. Stock your freezer with easy meals. Continue practicing relaxation techniques.", imageUrl: "https://placehold.co/600x400.png", aiHint: "weight scale" },
    { week: 36, title: "Week 36: Almost Full-Term", size: "Your baby is the size of a large head of romaine lettuce.", summary: "At 'early term,' your baby is getting ready for their debut. They are likely settled head-down in your pelvis, which can relieve pressure on your ribs but increase it on your bladder.", development: "Baby is 'early term.' They are practicing sucking and swallowing. The skull bones are still unfused for delivery. Lanugo is shedding.", bodyChanges: "Cervix may be effacing (thinning) and dilating (opening). Baby may have dropped into your pelvis. Your weight gain may stop.", symptoms: "Significant pelvic and rectal pressure. Increased discharge. 'Lightning crotch' nerve pains. Difficulty walking. False labor.", tips: "Keep doing kick counts. Walk to help the baby settle. Finalize your labor plan. Put a waterproof mattress protector on your bed.", imageUrl: "https://placehold.co/600x400.png", aiHint: "baby clothes" },
    { week: 37, title: "Week 37: Full-Term!", size: "Your baby is the size of a bunch of Swiss chard.", summary: "Congratulations, you're full-term! Your baby's lungs and brain are fully mature. From here on out, it's just a waiting game for their grand arrival.", development: "Full-term! Lungs and brain are mature. Grasp is firm. Head is likely engaged in the pelvis. Baby is ready for the outside world.", bodyChanges: "You could go into labor any day now. You might lose your mucus plug or see a 'bloody show.' Your cervix is likely making changes.", symptoms: "Confusion between true and false labor. Increased discharge. Intense pelvic pressure. Low, dull backache. A sudden burst of energy.", tips: "Relax and conserve your energy. Know the 5-1-1 rule for contractions. Trust your instincts. You will meet your baby soon!", imageUrl: "https://placehold.co/600x400.png", aiHint: "calendar due date" },
    { week: 38, title: "Week 38: Getting Ready", size: "Your baby is the size of a leek or small pumpkin.", summary: "Baby has a firm grasp now and their eye color is likely blue or gray, though this may change after birth. You're in the waiting game now!", development: "Baby has a firm grasp. Eye color is likely blue/gray but may change. They have about an ounce of meconium in their intestines.", bodyChanges: "You are in the waiting game. Your provider might offer a 'membrane sweep' to encourage labor. You are physically and emotionally ready.", symptoms: "Significant swelling in feet and ankles. General discomfort is at an all-time high. Sleep is nearly impossible. Frustrating false labor.", tips: "Rest, rest, rest. Gentle walking can help. Bounce on a birth ball. Watch for your water breaking. Trust your body.", imageUrl: "https://placehold.co/600x400.png", aiHint: "running race" },
    { week: 39, title: "Week 39: On The Brink", size: "Your baby is the size of a watermelon.", summary: "The final touches are being put on your baby's development. They are fully mature and just waiting for the right moment to arrive.", development: "Brain is still developing rapidly. Fat continues to be deposited for warmth. Skin is smooth and pale. The baby is fully mature.", bodyChanges: "Your doctor may discuss induction if you go past your due date. Your cervix is soft and possibly dilated. Losing your mucus plug is common.", symptoms: "Labor could start at any moment. Strong Braxton Hicks. Increased pelvic pressure. Diarrhea can be a sign labor is imminent.", tips: "Stay calm and trust the process. Call your provider when you think you're in labor. Stay hydrated. Lean on your support person.", imageUrl: "https://placehold.co/600x400.png", aiHint: "calm water" },
    { week: 40, title: "Week 40: Due Date!", size: "Your baby is the size of a small pumpkin.", summary: "Happy due date! While only 5% of babies arrive on this exact day, know that your baby is fully cooked and ready to meet you whenever they decide it's time.", development: "Baby is fully developed and waiting for the signal to be born. Average weight is between 6 and 9 pounds. All organ systems are mature.", bodyChanges: "Your due date is here! Don't be discouraged if it comes and goes. Your provider is monitoring you closely. You are on high alert.", symptoms: "A potent mix of physical misery and incredible excitement. Sleep is a distant memory. Everything hurts. Extreme impatience is normal.", tips: "Try gentle methods to encourage labor (walking, etc.), but rest is most important. Trust your body and your baby. You've got this!", imageUrl: "https://placehold.co/600x400.png", aiHint: "baby holding finger" }
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

const translations = {
    en: {
        backToDashboard: "Back to Dashboard",
        pageTitle: "Your Pregnancy Journey",
        progressText: (weeks: number, days: number) => `You are ${weeks} weeks and ${days} days pregnant.`,
        dueDate: "Estimated Due Date",
        daysToGo: "Days to Go",
        trimester: "Current Trimester",
        weeklyTitle: (title: string) => title,
        weeklySize: (size: string) => size,
        tabBaby: "Baby",
        tabBody: "Body",
        tabSymptoms: "Symptoms",
        tabTips: "Tips",
        symptomTrackerTitle: "How Are You Feeling Today?",
        symptomTrackerDesc: "Log your daily symptoms to keep track of your well-being.",
        viewHistory: "View History",
        customSymptoms: "Custom Symptoms or Notes",
        customSymptomsPlaceholder: "Anything else to add?",
        saveSymptoms: "Save Today's Symptoms",
        loggedToday: "Logged today:",
        babyLookTitle: "Here is what your baby might look like now",
        guidedWorkoutTitle: (trimester: number) => `Guided Workout for your Trimester ${trimester}`,
        myJournal: "My Pregnancy Journal",
        resetDate: "Reset / Enter New Date",
        getStartedTitle: "Let’s Get Started!",
        getStartedDesc: "Calculate your due date to begin tracking.",
        useDueDate: "Use Due Date",
        useLMP: "Use Last Period",
        yourDueDate: "Your Estimated Due Date",
        lmpDate: "First Day of Last Period (LMP)",
        pickDate: "Pick a date",
        trackPregnancy: "Track My Pregnancy",
        calculateAndTrack: "Calculate Due Date & Track"
    },
    hi: {
        backToDashboard: "डैशबोर्ड पर वापस",
        pageTitle: "आपकी गर्भावस्था यात्रा",
        progressText: (weeks: number, days: number) => `आप ${weeks} सप्ताह और ${days} दिन की गर्भवती हैं।`,
        dueDate: "अनुमानित देय तिथि",
        daysToGo: "शेष दिन",
        trimester: "वर्तमान तिमाही",
        weeklyTitle: (title: string) => title, // Assuming titles are kept in English for now
        weeklySize: (size: string) => size,
        tabBaby: "बच्चा",
        tabBody: "शरीर",
        tabSymptoms: "लक्षण",
        tabTips: "सुझाव",
        symptomTrackerTitle: "आज आप कैसा महसूस कर रही हैं?",
        symptomTrackerDesc: "अपनी सेहत पर नज़र रखने के लिए अपने दैनिक लक्षणों को लॉग करें।",
        viewHistory: "इतिहास देखें",
        customSymptoms: "कस्टम लक्षण या नोट्स",
        customSymptomsPlaceholder: "कुछ और जोड़ना है?",
        saveSymptoms: "आज के लक्षण सहेजें",
        loggedToday: "आज लॉग किया गया:",
        babyLookTitle: "आपका बच्चा अब ऐसा दिख सकता है",
        guidedWorkoutTitle: (trimester: number) => `आपकी ${trimester}. तिमाही के लिए निर्देशित कसरत`,
        myJournal: "मेरी गर्भावस्था जर्नल",
        resetDate: "रीसेट / नई तारीख दर्ज करें",
        getStartedTitle: "आइए शुरू करें!",
        getStartedDesc: "ट्रैकिंग शुरू करने के लिए अपनी देय तिथि की गणना करें।",
        useDueDate: "देय तिथि का उपयोग करें",
        useLMP: "अंतिम पीरियड का उपयोग करें",
        yourDueDate: "आपकी अनुमानित देय तिथि",
        lmpDate: "अंतिम पीरियड का पहला दिन (LMP)",
        pickDate: "एक तारीख चुनें",
        trackPregnancy: "मेरी गर्भावस्था को ट्रैक करें",
        calculateAndTrack: "देय तिथि की गणना करें और ट्रैक करें"
    }
};

const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/pregnancy-tracker', icon: Baby, label: 'Weekly Guide' },
    { href: '/pregnancy-symptom-history', icon: FileText, label: 'Health Log' },
    { href: '/appointments', icon: CalendarCheck, label: 'Appointments' },
    { href: '/resources', icon: Library, label: 'Resources' },
];

export default function PregnancyTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [pregnancyDetails, setPregnancyDetails] = useState<PregnancyDetails | null>(null);
  const [userName, setUserName] = useState('');
  const displayedToastWeekRef = useRef<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);


  const t = translations[language];

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
      const storedUser = localStorage.getItem('glowher-user');
      if (storedUser) {
        setUserName(JSON.parse(storedUser).name);
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
        const dataToSave = { ...values, logDate: new Date().toISOString() };
        localStorage.setItem(`${PREGNANCY_SYMPTOM_LOG_PREFIX}${todayKey}`, JSON.stringify(dataToSave));
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


  const currentWeekData = pregnancyDetails ? weeklyDevelopment[pregnancyDetails.gestationalAgeWeeks] : weeklyDevelopment[0];
  const trimesterVideoUrl = pregnancyDetails ? trimesterVideos[pregnancyDetails.trimester] : null;
  const babyLookVideoUrl = pregnancyDetails ? babyLookVideos[pregnancyDetails.trimester] : null;
  const loggedSymptoms = symptomForm.watch('symptoms') || [];

  if (pregnancyDetails && currentWeekData) {
    return (
        <div className="relative flex min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
            {/* Desktop Sidebar */}
            <nav className={cn(
                "hidden md:flex flex-col p-4 space-y-2 bg-white/50 border-r border-white/30 min-h-screen sticky top-0 transition-all duration-300",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="p-2 mb-4 flex items-center justify-between">
                    <GlowHerLogo className={cn(!isSidebarOpen && "hidden")} />
                    <div className={cn("md:hidden", isSidebarOpen && "hidden")}>
                        <Baby className="h-6 w-6 text-pink-500"/>
                    </div>
                </div>
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} title={item.label}>
                         <Button
                            variant={router.pathname === item.href ? 'secondary' : 'ghost'}
                            className={cn("w-full justify-start text-base", !isSidebarOpen && "justify-center")}
                        >
                            <item.icon className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
                            <span className={cn(!isSidebarOpen && "hidden")}>{item.label}</span>
                        </Button>
                    </Link>
                ))}
            </nav>

            <div className="flex-1 flex flex-col">
                <header className="container mx-auto px-4 md:px-8 py-4 sticky top-0 bg-white/30 backdrop-blur-md z-40 border-b border-white/30">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <PanelLeft className="h-6 w-6" />
                        </Button>
                        <div className="md:hidden">
                            <GlowHerLogo />
                        </div>
                        <h1 className="font-headline text-2xl md:text-3xl font-bold text-slate-900 hidden md:block">
                            {userName ? `Hi ${userName} 👋` : ''}
                        </h1>
                         <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                            <Home className="h-6 w-6 text-slate-700"/>
                        </Button>
                    </div>
                </header>

                <main className="flex-grow container mx-auto px-4 md:px-8 py-8 space-y-8">
                    <div className="text-center md:text-left md:hidden">
                        <h1 className="font-headline text-4xl font-bold text-slate-900">
                            {userName ? `Hi ${userName} 👋` : ''}
                        </h1>
                        <p className="mt-2 text-lg text-slate-600">{t.pageTitle}</p>
                    </div>

                     <p className="mt-2 text-lg text-slate-600 text-center md:text-left">{t.progressText(pregnancyDetails.gestationalAgeWeeks, pregnancyDetails.gestationalAgeDays)}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">{t.dueDate}</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-pink-500">{format(pregnancyDetails.dueDate, "MMM d, yyyy")}</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">{t.daysToGo}</CardTitle>
                                <Baby className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-blue-500">{pregnancyDetails.daysLeft}</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-lg bg-white/50 backdrop-blur-sm border-white/30">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">{t.trimester}</CardTitle>
                                <BarChart className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-purple-500">{pregnancyDetails.trimester}</p>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <div className="relative">
                                    <Image src={currentWeekData.imageUrl} data-ai-hint={currentWeekData.aiHint} alt={`Week ${currentWeekData.week} development`} width={600} height={600} className="object-cover w-full h-full" />
                                    <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                                        <h2 className="font-headline text-4xl text-white">{t.weeklyTitle(currentWeekData.title)}</h2>
                                        <p className="text-white/90 mt-1">{t.weeklySize(currentWeekData.size)}</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                     <div 
                                        className="bg-pink-100/30 p-4 rounded-lg cursor-pointer transition-all"
                                        onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-pink-800">Weekly Summary</h3>
                                            <ChevronDown className={cn("h-5 w-5 text-pink-800 transition-transform", isSummaryExpanded && "rotate-180")} />
                                        </div>
                                         <p className={cn("mt-2 text-sm text-slate-700", !isSummaryExpanded && "truncate")}>
                                            {currentWeekData.summary}
                                        </p>
                                        {isSummaryExpanded && 'development' in currentWeekData && (
                                            <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{currentWeekData.development}</div>
                                        )}
                                        {isSummaryExpanded && 'imageDescription' in currentWeekData && currentWeekData.imageDescription && (
                                            <>
                                                <p className="mt-2 text-sm text-slate-700">{currentWeekData.imageDescription}</p>
                                                {'imageCredit' in currentWeekData && currentWeekData.imageCredit && (
                                                    <a href={currentWeekData.imageCredit.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                                        {currentWeekData.imageCredit.text}
                                                    </a>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    
                                    {'keyTakeaways' in currentWeekData && currentWeekData.keyTakeaways ? (
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-lg text-slate-800">Key Takeaways</h4>
                                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                                                {currentWeekData.keyTakeaways.map((item: string, index: number) => <li key={index}>{item}</li>)}
                                            </ul>

                                            <h4 className="font-bold text-lg text-slate-800">Preparing for Pregnancy</h4>
                                            {currentWeekData.preparingForPregnancy.map((item: {title: string, content: string}, index: number) => (
                                                <div key={index}>
                                                    <h5 className="font-semibold">{item.title}</h5>
                                                    <p className="text-sm text-slate-700">{item.content}</p>
                                                </div>
                                            ))}
                                            
                                            <h4 className="font-bold text-lg text-slate-800">Common Symptoms</h4>
                                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                                                {currentWeekData.commonSymptoms.map((item: string, index: number) => <li key={index}>{item}</li>)}
                                            </ul>

                                            <h4 className="font-bold text-lg text-slate-800">Your Body This Week</h4>
                                            <p className="text-sm text-slate-700">{currentWeekData.yourBody}</p>

                                            <h4 className="font-bold text-lg text-slate-800">Tips for Conceiving</h4>
                                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                                                {currentWeekData.conceivingTips.map((item: string, index: number) => <li key={index}>{item}</li>)}
                                            </ul>

                                            <h4 className="font-bold text-lg text-slate-800">Checklist for This Week</h4>
                                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                                                {currentWeekData.checklist.map((item: string, index: number) => <li key={index}>{item}</li>)}
                                            </ul>
                                        </div>
                                    ) : (
                                        <Tabs defaultValue="body" className="w-full">
                                            <TabsList className="grid w-full grid-cols-4 bg-pink-100/50 text-pink-800">
                                                <TabsTrigger value="development" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.tabBaby}</TabsTrigger>
                                                <TabsTrigger value="body" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.tabBody}</TabsTrigger>
                                                <TabsTrigger value="symptoms" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.tabSymptoms}</TabsTrigger>
                                                <TabsTrigger value="tips" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.tabTips}</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="development" className="mt-4 prose max-w-none text-slate-700 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto"><p>{'development' in currentWeekData ? currentWeekData.development : ''}</p></TabsContent>
                                            <TabsContent value="body" className="mt-4 prose max-w-none text-slate-700 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto"><p>{'bodyChanges' in currentWeekData ? currentWeekData.bodyChanges : ''}</p></TabsContent>
                                            <TabsContent value="symptoms" className="mt-4 prose max-w-none text-slate-700 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto"><p>{'symptoms' in currentWeekData ? currentWeekData.symptoms : ''}</p></TabsContent>
                                            <TabsContent value="tips" className="mt-4 prose max-w-none text-slate-700 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto"><p>{'tips' in currentWeekData ? currentWeekData.tips : ''}</p></TabsContent>
                                        </Tabs>
                                    )}

                                </div>
                           </div>
                        </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="font-headline text-2xl text-pink-600">{t.symptomTrackerTitle}</CardTitle>
                                    <Button variant="outline" onClick={() => router.push('/pregnancy-symptom-history')}>
                                        <History className="mr-2 h-4 w-4" />
                                        {t.viewHistory}
                                    </Button>
                                </div>
                                <CardDescription className="text-slate-600">{t.symptomTrackerDesc}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...symptomForm}>
                                    <form onSubmit={symptomForm.handleSubmit(onSymptomFormSubmit)} className="space-y-6">
                                        <FormField
                                            control={symptomForm.control}
                                            name="symptoms"
                                            render={() => (
                                            <FormItem>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {pregnancySymptoms.map((item) => (
                                                    <FormField
                                                    key={item.id}
                                                    control={symptomForm.control}
                                                    name="symptoms"
                                                    render={({ field }) => {
                                                        return (
                                                        <FormItem
                                                            key={item.id}
                                                            className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-slate-300 p-3 hover:bg-pink-100/50 transition-colors"
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
                                                                className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                                                            />
                                                            </FormControl>
                                                            <FormLabel className="font-normal flex items-center gap-2 cursor-pointer text-slate-800">
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
                                                <FormLabel className="text-slate-700">{t.customSymptoms}</FormLabel>
                                                <FormControl>
                                                <Textarea
                                                    placeholder={t.customSymptomsPlaceholder}
                                                    className="resize-none"
                                                    {...field}
                                                />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <div className="flex items-center gap-4 flex-wrap">
                                             <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white">
                                                <ThumbsUp className="mr-2 h-4 w-4" />
                                                {t.saveSymptoms}
                                            </Button>
                                            {loggedSymptoms.length > 0 && (
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <span className="text-sm font-semibold text-slate-500">{t.loggedToday}</span>
                                                    {loggedSymptoms.map(symptomId => {
                                                        const symptom = pregnancySymptoms.find(s => s.id === symptomId);
                                                        return symptom ? <Badge key={symptomId} variant="secondary" className="bg-pink-100 text-pink-800 border-none">{symptom.label}</Badge> : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                        
                        <div className="space-y-8">
                            {babyLookVideoUrl && (
                                <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30">
                                    <CardHeader>
                                        <CardTitle className="font-headline text-2xl flex items-center gap-2 text-pink-600">
                                            <Video /> {t.babyLookTitle}
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

                             {trimesterVideoUrl && (
                                <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-white/30">
                                    <CardHeader>
                                        <CardTitle className="font-headline text-2xl flex items-center gap-2 text-pink-600">
                                            <Video /> {t.guidedWorkoutTitle(pregnancyDetails.trimester)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="aspect-video">
                                            <iframe
                                                className="w-full h-full rounded-lg"
                                                src={trimesterVideoUrl}
                                                title="Guided Workout YouTube video player"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                    </div>

                    <div className="mt-8 flex justify-center gap-4">
                        <Button onClick={() => router.push('/pregnancy-journal')} className="bg-pink-500 hover:bg-pink-600 text-white">
                            <ClipboardPlus className="mr-2 h-4 w-4"/>
                            {t.myJournal}
                        </Button>
                        <Button variant="outline" onClick={() => setPregnancyDetails(null)}>{t.resetDate}</Button>
                    </div>

                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white/80 backdrop-blur-md border-t border-white/30">
                <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
                    {navItems.map((item) => (
                         <Link key={item.href} href={item.href} className="inline-flex flex-col items-center justify-center px-2 hover:bg-pink-100/50 group">
                            <item.icon className={cn("w-6 h-6 mb-1 text-slate-500 group-hover:text-pink-600", router.pathname === item.href && "text-pink-600")} />
                            <span className={cn("text-xs text-slate-500 group-hover:text-pink-600", router.pathname === item.href && "text-pink-600")}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="pb-16 md:pb-0" /> {/* Spacer for bottom nav */}
        </div>
    )
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-white text-slate-800">
        <div className="relative z-10 flex flex-col min-h-screen">
        <header className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
            <GlowHerLogo />
            <Button variant="ghost" onClick={() => router.push('/')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                {t.backToDashboard}
            </Button>
            </div>
      </header>
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-8">
        <Card className="w-full max-w-lg shadow-xl bg-white/50 backdrop-blur-sm border-white/30">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-center text-pink-600">{t.getStartedTitle}</CardTitle>
                <CardDescription className="text-center text-slate-600">{t.getStartedDesc}</CardDescription>
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
                                    <TabsList className="grid w-full grid-cols-2 bg-pink-100/50 text-pink-800">
                                        <TabsTrigger value="dueDate" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.useDueDate}</TabsTrigger>
                                        <TabsTrigger value="lmp" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.useLMP}</TabsTrigger>
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
                                <FormLabel className="text-lg font-semibold text-slate-700">
                                    {pregnancyForm.watch('calculationMethod') === 'dueDate' ? t.yourDueDate : t.lmpDate}
                                </FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn("w-[280px] text-left font-normal", !field.value && "text-muted-foreground")}
                                        >
                                        {field.value ? format(field.value, "PPP") : <span>{t.pickDate}</span>}
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
                            <Button type="submit" size="lg" className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                                {pregnancyForm.watch('calculationMethod') === 'lmp' ? t.calculateAndTrack : t.trackPregnancy}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </main>
      </div>
    </div>
  );
}
