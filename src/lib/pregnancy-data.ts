
type WeeklyInfo = {
    emoji: string;
    text: string;
}

export const weeklyDevelopment: Array<{
    week: number;
    title: string;
    size: string;
    summary: string;
    development: WeeklyInfo[];
    bodyChanges: WeeklyInfo[];
    symptoms: WeeklyInfo[];
    tips: WeeklyInfo[];
    imageUrl: string;
    aiHint: string;
}> = [
    { 
        week: 0, 
        title: "Getting Started", 
        size: "Your journey is about to begin.", 
        summary: "Set your due date or last menstrual period to start tracking your pregnancy week by week.",
        development: [],
        bodyChanges: [],
        symptoms: [],
        tips: [],
        imageUrl: "https://placehold.co/600x400.png", 
        aiHint: "pregnancy test" 
    },
    { 
        week: 1, 
        title: "Week 1: The Journey Begins", 
        size: "You're on your period, so not yet pregnant.", 
        summary: "Pregnancy is counted from the first day of your last menstrual period. This week, your body is preparing for potential conception.",
        development: [
            { emoji: '🩸', text: 'The first day of your period marks the beginning of your menstrual cycle and week 1 of pregnancy.' },
            { emoji: '🧬', text: 'Hormones like FSH (follicle-stimulating hormone) begin to rise, preparing your ovaries.' },
            { emoji: '🥚', text: 'Multiple follicles, each containing an egg, start to mature in your ovaries.' },
            { emoji: '🧱', text: 'Your body sheds last month\'s uterine lining to prepare a fresh, new one.' },
            { emoji: '🌱', text: 'Estrogen levels are low at the start of the week but will begin to rise.' },
            { emoji: '⏲️', text: 'This phase typically lasts between 3 to 7 days for most women.' },
            { emoji: '✨', text: 'Your body is resetting itself for a potential pregnancy this cycle.' },
            { emoji: '💪', text: 'It\'s a period of renewal and preparation on a microscopic level.' }
        ],
        bodyChanges: [
            { emoji: '🩸', text: 'The most obvious change is your menstrual period.' },
            { emoji: '🌡️', text: 'Your basal body temperature is at its lowest point during your period.' },
            { emoji: '🧱', text: 'The cervix is low, firm, and slightly open to allow blood to pass.' },
            { emoji: '⚖️', text: 'Hormone levels (estrogen and progesterone) are at their lowest.' },
            { emoji: '😩', text: 'You might feel tired or have less energy due to hormonal changes and blood loss.' },
            { emoji: '💧', text: 'Water retention from the previous cycle starts to decrease.' },
            { emoji: '🧖‍♀️', text: 'Some women find their skin is more prone to breakouts during this time.' },
            { emoji: '😌', text: 'For many, the start of their period brings relief from PMS symptoms.' }
        ],
        symptoms: [
            { emoji: '🩸', text: 'Vaginal bleeding is the primary symptom of this week.' },
            { emoji: '😖', text: 'Uterine cramping is common as your uterus contracts to shed its lining.' },
            { emoji: '🎈', text: 'Bloating and water retention can carry over from the days before your period.' },
            { emoji: '🤕', text: 'Hormonal headaches or migraines can occur due to the drop in estrogen.' },
            { emoji: '😴', text: 'Fatigue and low energy are very common.' },
            { emoji: '🎢', text: 'Mood swings, irritability, or feeling more emotional are possible.' },
            { emoji: '😫', text: 'Lower back pain often accompanies menstrual cramps.' },
            { emoji: '🍫', text: 'You might still experience food cravings from the premenstrual phase.' }
        ],
        tips: [
            { emoji: '💊', text: 'Start taking a prenatal vitamin with at least 400 mcg of folic acid now.' },
            { emoji: '🗓️', text: 'Track your cycle using a calendar or app to predict your fertile window.' },
            { emoji: '🧘‍♀️', text: 'Prioritize rest and gentle movement like walking or stretching.' },
            { emoji: '👩‍⚕️', text: 'Schedule a preconception check-up with your doctor to discuss your health.' },
            { emoji: '🚭', text: 'Reduce or eliminate alcohol and smoking to create a healthy environment for conception.' },
            { emoji: '☕', text: 'Limit caffeine intake to one or two cups of coffee per day.' },
            { emoji: '🥗', text: 'Focus on a balanced diet rich in iron and vitamin C to replenish your body.' },
            { emoji: '💕', text: 'Communicate with your partner about your plans and feelings on this journey.' }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/02-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "calendar vitamins" 
    },
    { 
        week: 2, 
        title: "Week 2: Preparing for Ovulation", 
        size: "An egg is maturing in your ovary.", 
        summary: "Your uterine lining is thickening, and your body is getting ready to release an egg. This is your fertile window.",
        development: [
            { emoji: '🥚', text: 'A single dominant follicle outgrows the others and prepares for ovulation.' },
            { emoji: '📈', text: 'Rising estrogen levels cause the uterine lining (endometrium) to thicken.' },
            { emoji: '🧠', text: 'The pituitary gland releases a surge of Luteinizing Hormone (LH) to trigger ovulation.' },
            { emoji: '💧', text: 'Cervical mucus becomes clearer, thinner, and more slippery to help sperm.' },
            { emoji: '✨', text: 'The egg inside the follicle completes its first meiotic division.' },
            { emoji: '🚪', text: 'The cervix softens and opens slightly in preparation.' },
            { emoji: '⏰', text: 'Ovulation typically occurs around the end of this week.' },
            { emoji: '🕊️', text: 'The stage is set for the egg to be released and potentially fertilized.' }
        ],
        bodyChanges: [
            { emoji: '⚡', text: 'You may notice a significant increase in your energy levels.' },
            { emoji: '💕', text: 'Libido often peaks during this phase due to high estrogen.' },
            { emoji: '🌡️', text: 'Your basal body temperature will have a slight dip just before ovulation.' },
            { emoji: '💧', text: 'You\'ll notice clear, stretchy, "egg-white" cervical mucus.' },
            { emoji: '👃', text: 'Some women experience a heightened sense of smell.' },
            { emoji: '😊', text: 'Your mood may be more positive, outgoing, and sociable.' },
            { emoji: '✨', text: 'Skin often appears clearer and more radiant—the "ovulation glow."' },
            { emoji: '🤏', text: 'Some women feel a slight twinge of pain on one side as the ovary releases the egg.' }
        ],
        symptoms: [
            { emoji: '💧', text: 'Increased, watery, or egg-white-like vaginal discharge is a key sign.' },
            { emoji: '😊', text: 'A general feeling of well-being and increased energy.' },
            { emoji: '❤️', text: 'Heightened sex drive is very common.' },
            { emoji: '🤕', text: 'Mild one-sided pelvic pain (mittelschmerz) can occur during ovulation.' },
            { emoji: '🎈', text: 'Light bloating is possible for some women.' },
            { emoji: '✨', text: 'A small amount of light spotting can occur during ovulation.' },
            { emoji: '🍈', text: 'Breasts may feel slightly tender or sensitive.' },
            { emoji: '✨', text: 'Most symptoms this week are positive signs of peak fertility.' }
        ],
        tips: [
            { emoji: '❤️', text: 'This is the most fertile time in your cycle to try to conceive.' },
            { emoji: '🧪', text: 'Use ovulation predictor kits (OPKs) to pinpoint the LH surge.' },
            { emoji: '🌡️', text: 'Track your basal body temperature to confirm ovulation after it happens.' },
            { emoji: '🥗', text: 'Eat nutrient-dense foods to support hormonal health.' },
            { emoji: '💧', text: 'Stay well-hydrated, as it can improve cervical mucus quality.' },
            { emoji: '🚭', text: 'Continue avoiding alcohol, smoking, and excessive caffeine.' },
            { emoji: '🧘‍♀️', text: 'Manage stress with activities like yoga or meditation.' },
            { emoji: '💬', text: 'Keep communication open and enjoyable with your partner.' }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/02-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "flower blooming" 
    },
    { 
        week: 3, 
        title: "Week 3: Fertilization & Implantation", 
        size: "The fertilized egg, or blastocyst, is a microscopic ball of cells.", 
        summary: "Success! A sperm has fertilized the egg, and this new ball of cells is making its way to your uterus for implantation.",
        development: [
            { emoji: '🎉', text: 'Fertilization! A single sperm penetrates the egg, creating a zygote.' },
            { emoji: '🧬', text: 'The baby\'s genetic makeup, including sex, is determined at this moment.' },
            { emoji: '➗', text: 'The zygote begins rapidly dividing into a ball of cells called a blastocyst.' },
            { emoji: '🚗', text: 'The blastocyst travels down the fallopian tube toward the uterus.' },
            { emoji: '🏠', text: 'The blastocyst begins to burrow into the plush uterine lining—this is implantation.' },
            { emoji: '🤝', text: 'The outer cells of the blastocyst will form the placenta.' },
            { emoji: '👶', text: 'The inner cells of the blastocyst will become the embryo.' },
            { emoji: '📈', text: 'The hormone hCG (human chorionic gonadotropin) begins to be produced.' }
        ],
        bodyChanges: [
            { emoji: '🤫', text: 'Externally, you won\'t notice any changes, as all the action is happening on a microscopic level.' },
            { emoji: '📈', text: 'Internally, the hormone progesterone begins to rise, signaled by the newly forming placenta.' },
            { emoji: '🌸', text: 'Some women (about 25%) experience light implantation spotting or cramping as the blastocyst embeds in the uterus.' },
            { emoji: '🌡️', text: 'Your basal body temperature will remain elevated after ovulation.' },
            { emoji: '🍈', text: 'You might experience very early breast tenderness due to rising hormones.' },
            { emoji: '😴', text: 'A wave of fatigue might hit as your body dedicates enormous energy to the implantation process.' },
            { emoji: '🚽', text: 'Increased progesterone can sometimes lead to early bloating or constipation.' },
            { emoji: '✨', text: 'Your immune system lowers slightly to prevent rejecting the new embryo.' }
        ],
        symptoms: [
            { emoji: '🩸', text: 'Light spotting (pink or brown) around 6-12 days past ovulation, known as implantation bleeding.' },
            { emoji: '😖', text: 'Mild cramping, similar to period cramps but usually lighter.' },
            { emoji: '😴', text: 'Early and unexplained fatigue is a very common first sign.' },
            { emoji: '🍈', text: 'Sore, tender, or swollen breasts.' },
            { emoji: '🎈', text: 'Bloating that feels similar to pre-menstrual bloating.' },
            { emoji: '👃', text: 'A heightened sense of smell can start this early for some.' },
            { emoji: '🤢', text: 'Some women may experience very mild, early nausea.' },
            { emoji: '✨', text: 'Many women experience no symptoms at all this week.' }
        ],
        tips: [
            { emoji: '🧘‍♀️', text: '"Act as if you are pregnant." Continue healthy habits just in case.' },
            { emoji: '⏳', text: 'Resist the urge to take a pregnancy test yet; hCG levels are likely still too low.' },
            { emoji: '💧', text: 'Stay hydrated and eat nutritious, whole foods.' },
            { emoji: '💊', text: 'Don\'t forget your daily prenatal vitamin with folic acid.' },
            { emoji: '😌', text: 'This can be an anxious time. Practice mindfulness and relaxation techniques.' },
            { emoji: '🏃‍♀️', text: 'Continue with gentle to moderate exercise, avoiding any new, strenuous activities.' },
            { emoji: '🚫', text: 'Steer clear of alcohol, smoking, and unsafe foods like unpasteurized cheese.' },
            { emoji: '❤️', text: 'Lean on your partner or a friend for support during the "two-week wait."' }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/03-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "cells microscope" 
    },
    { 
        week: 4, 
        title: "Week 4: A Positive Test!", 
        size: "Your baby is the size of a poppy seed.", 
        summary: "The blastocyst has successfully implanted in your uterine wall. This is the week you'll likely miss your period and get a positive pregnancy test!", 
        development: [
            { emoji: '🏠', text: 'The embryo is securely implanted in the uterine lining.' },
            { emoji: '🧱', text: 'It has differentiated into three distinct layers: ectoderm, mesoderm, and endoderm.' },
            { emoji: '🧠', text: 'The ectoderm will form the nervous system, skin, and hair.' },
            { emoji: '❤️', text: 'The mesoderm will develop into the skeleton, muscles, heart, and blood vessels.' },
            { emoji: '🫁', text: 'The endoderm will become the digestive system, liver, and lungs.' },
            { emoji: '탯', text: 'The placenta begins to form and produce the pregnancy hormone hCG.' },
            { emoji: '💧', text: 'The amniotic sac, which will cushion the baby, is also forming.' },
            { emoji: '📈', text: 'Growth is happening at an exponential rate.' }
        ],
        bodyChanges: [
            { emoji: '🩸', text: 'A missed period is the most common and clear sign of pregnancy.' },
            { emoji: '➕', text: 'Hormone hCG is now high enough to be detected by a home pregnancy test.' },
            { emoji: '🍈', text: 'Breasts may feel even more swollen, tender, and tingly.' },
            { emoji: '🎈', text: 'Progesterone-induced bloating can be significant.' },
            { emoji: '🌡️', text: 'Your basal body temperature remains elevated.' },
            { emoji: '🚽', text: 'You may notice an increased need to urinate as your uterus grows.' },
            { emoji: '😩', text: 'Fatigue can feel profound as your body works overtime.' },
            { emoji: '🤫', text: 'From the outside, there are no visible changes yet.' }
        ],
        symptoms: [
            { emoji: '🗓️', text: 'A missed menstrual period.' },
            { emoji: '🍈', text: 'Extremely sore and sensitive breasts.' },
            { emoji: '😴', text: 'Overwhelming fatigue that feels like you\'ve run a marathon.' },
            { emoji: '😖', text: 'Mild, period-like cramping (without bleeding) is normal.' },
            { emoji: '🤢', text: 'Morning sickness (which can happen any time of day) may begin.' },
            { emoji: '❤️', text: 'Food cravings or aversions may start to appear.' },
            { emoji: '🎢', text: 'Mood swings due to the rapid increase in hormones.' },
            { emoji: '👃', text: 'A heightened sense of smell can make certain scents unbearable.' }
        ],
        tips: [
            { emoji: '🧪', text: 'Take a home pregnancy test first thing in the morning for the most accurate result.' },
            { emoji: '🎉', text: 'Celebrate! This is a huge moment. Let yourself feel all the emotions.' },
            { emoji: '👩‍⚕️', text: 'Call your doctor to schedule your first prenatal appointment, usually around week 8.' },
            { emoji: '💊', text: 'If you haven\'t already, start taking your prenatal vitamins immediately.' },
            { emoji: '🚭', text: 'Double-down on healthy habits: no alcohol, no smoking.' },
            { emoji: '💧', text: 'Stay hydrated, even if you feel bloated.' },
            { emoji: '😴', text: 'Listen to your body and rest whenever you can. Naps are your friend.' },
            { emoji: '❤️', text: 'Share the news with your partner and decide together when to tell others.' }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/04-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "pregnancy test positive" 
    },
    { 
        week: 5, 
        title: "Week 5: Heartbeat Begins", 
        size: "Your baby is the size of an apple seed.", 
        summary: "Your baby's heart is beginning to beat, though it's too early to hear. The neural tube, which becomes the brain and spinal cord, is forming.",
        development: [
            { emoji: '❤️', text: "The heart tube begins to beat spontaneously, a major milestone." },
            { emoji: '🧠', text: "The neural tube, the precursor to the brain and spinal cord, is closing." },
            { emoji: '🔗', text: "The umbilical cord forms, connecting the baby to the placenta." },
            { emoji: '💪', text: "Arm and leg buds begin to appear, looking like tiny paddles." },
            { emoji: '👶', text: "The embryo now looks more like a tadpole than a person." },
            { emoji: '🧬', text: "Key organs like the kidneys and liver are in their earliest stages of development." },
            { emoji: '📏', text: "The embryo measures about 1/17 of an inch long." },
            { emoji: '⏩', text: "Rapid cell division and differentiation continue at an astonishing pace." }
        ],
        bodyChanges: [
            { emoji: '😩', text: "Fatigue is likely your most prominent symptom right now." },
            { emoji: '🍈', text: "Your breasts may feel larger, more tender, and the areolas may darken." },
            { emoji: '🤢', text: "Morning sickness might kick into high gear this week." },
            { emoji: '🚽', text: "Frequent urination continues as your uterus expands and presses on your bladder." },
            { emoji: '🎈', text: "Bloating is still common due to high levels of progesterone." },
            { emoji: '🤫', text: "There's still no visible 'baby bump' to the outside world." },
            { emoji: '🌡️', text: "You might feel slightly warmer than usual due to increased blood flow." },
            { emoji: '⚖️', text: "It's normal to have gained a few pounds, or even lost a little if nausea is severe." }
        ],
        symptoms: [
            { emoji: '🤢', text: "Nausea and vomiting (morning sickness) are very common." },
            { emoji: '😴', text: "Extreme tiredness that can feel overwhelming." },
            { emoji: '🍈', text: "Sore, heavy, or tingling breasts." },
            { emoji: '🚽', text: "Needing to pee more often than usual." },
            { emoji: '😖', text: "Mild cramping can still occur as your uterus grows." },
            { emoji: '🍫', text: "Intense food cravings or sudden aversions to foods you once loved." },

            { emoji: '🤤', text: "Excess saliva (ptyalism) can be an unexpected symptom." },
            { emoji: '🎢', text: "Heightened emotions and mood swings continue." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "If you haven't yet, schedule your first prenatal visit." },
            { emoji: '🤢', text: "Combat nausea by eating small, frequent meals. Ginger and vitamin B6 can help." },
            { emoji: '💧', text: "Stay hydrated, especially if you're experiencing vomiting. Sip water or electrolyte drinks." },
            { emoji: '😴', text: "Listen to your body's need for rest. Naps are essential." },
            { emoji: '🩲', text: "Invest in a comfortable, supportive bra." },
            { emoji: '🤔', text: "Start thinking about when and how you'll share your news with family and friends." },
            { emoji: '🥗', text: "Focus on nutrient-dense foods, even if you can only eat small amounts." },
            { emoji: '❤️', text: "Lean on your support system. Talk about how you're feeling, both physically and emotionally." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/05-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "apple seed nature"
    },
    { 
        week: 6, 
        title: "Week 6: Facial Features Form", 
        size: "Your baby is the size of a sweet pea.", 
        summary: "Facial features like the eyes, nose, and mouth are beginning to form. The baby's heart is beating more regularly now.",
        development: [
            { emoji: '❤️', text: "The heart is now beating at a regular rhythm, around 100-160 beats per minute." },
            { emoji: '👁️', text: "Dark spots where the eyes will be are forming on the sides of the head." },
            { emoji: '👃', text: "The nose and mouth are beginning to take shape with small pits and folds." },
            { emoji: '👂', text: "The inner ear is developing, a crucial step for hearing and balance." },
            { emoji: '🧠', text: "The brain is developing into its major sections." },
            { emoji: '💪', text: "Arm and leg buds are growing longer." },
            { emoji: '👶', text: "The baby is starting to make its first, tiny, involuntary movements." },
            { emoji: '🩸', text: "A primitive circulatory system is now in place." }
        ],
        bodyChanges: [
            { emoji: '🤢', text: "Morning sickness may peak around this time." },
            { emoji: '⚖️', text: "Your uterus is expanding, but it's still not noticeable from the outside." },
            { emoji: '🍈', text: "Your breasts continue to grow and may feel heavy and sore." },
            { emoji: '🎈', text: "Bloating and constipation can be persistent issues." },
            { emoji: '😴', text: "Fatigue remains a constant companion for many." },
            { emoji: '🌡️', text: "Increased blood volume can sometimes lead to dizziness." },
            { emoji: '💧', text: "You might notice more vaginal discharge, which is normal." },
            { emoji: '😊', text: "Emotionally, you might be feeling a mix of excitement and anxiety." }
        ],
        symptoms: [
            { emoji: '🤢', text: "Persistent nausea and potential vomiting." },
            { emoji: '😴', text: "Feeling exhausted, even after a full night's sleep." },
            { emoji: '🍈', text: "Breast tenderness, fullness, and sensitivity." },
            { emoji: '🚽', text: "Frequent trips to the bathroom." },
            { emoji: '😖', text: "Mild uterine cramping or a pulling sensation." },
            { emoji: '🍫', text: "Strong food cravings or aversions." },
            { emoji: '🔥', text: "Heartburn may start as progesterone relaxes the esophageal sphincter." },
            { emoji: '😵', text: "Dizziness or lightheadedness, especially when standing up quickly." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Prepare questions for your first prenatal appointment. No question is too small!" },
            { emoji: '🤢', text: "Keep crackers by your bed and nibble on them before getting up to help with nausea." },
            { emoji: '💧', text: "Continue to prioritize hydration throughout the day." },
            { emoji: '🏃‍♀️', text: "Gentle exercise like walking can help with mood and energy levels." },
            { emoji: '👖', text: "Don't be afraid to switch to pants with a stretchy waistband for comfort." },
            { emoji: '❤️', text: "Talk to your partner about your symptoms so they can better support you." },
            { emoji: '🥗', text: "Eat what you can tolerate. A little bit of something is better than nothing." },

            { emoji: '🚫', text: "Be aware of workplace hazards and environmental exposures that could be harmful." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/06-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "sweet pea vegetable"
    },
    { 
        week: 7, 
        title: "Week 7: Hands and Feet Emerge", 
        size: "Your baby is the size of a blueberry.", 
        summary: "The arm and leg buds have grown, and hands and feet are now emerging, though they look more like small paddles.",
        development: [
            { emoji: '👐', text: "Webbed fingers and toes are starting to form on the hand and foot plates." },
            { emoji: '🧠', text: "The brain is growing at an incredible rate, with about 100 new brain cells forming every minute." },
            { emoji: '❤️', text: "The heart has now divided into right and left chambers." },
            { emoji: '👶', text: "The baby's tail, a remnant of our evolutionary past, is starting to shrink." },
            { emoji: '🦴', text: "The skeleton is beginning to form, though it's made of cartilage, not bone." },
            { emoji: '👁️', text: "The lenses of the eyes are forming." },
            { emoji: '👅', text: "The tongue and mouth cavity are developing." },
            { emoji: ' kidneys', text: "The kidneys are in place and will soon begin to produce urine." }
        ],
        bodyChanges: [
            { emoji: '👕', text: "Your clothes might be feeling a bit snug around the waist, even without a real bump." },
            { emoji: '🍈', text: "Your breasts are likely noticeably larger now." },
            { emoji: '⚖️', text: "Your uterus has doubled in size since conception." },
            { emoji: '💧', text: "Blood volume has increased, which is why you may feel tired and dizzy." },
            { emoji: '✨', text: "You might notice your skin changing - some get the 'pregnancy glow,' others get acne." },
            { emoji: '😴', text: "Fatigue is still a major player as the placenta develops." },
            { emoji: '🎈', text: "Bloating can make you feel much more pregnant than you look." },
            { emoji: '❤️', text: "Your heart is working harder to pump the extra blood through your body." }
        ],
        symptoms: [
            { emoji: '🤢', text: "Morning sickness can be at its peak for many women this week." },
            { emoji: '😴', text: "Profound fatigue continues." },
            { emoji: '🍈', text: "Breast soreness and changes in size or color." },
            { emoji: '🚽', text: "The need to urinate frequently is still a common complaint." },
            { emoji: '🍫', text: "Cravings and aversions are in full swing." },
            { emoji: '🤤', text: "Excessive saliva can be an annoying symptom for some." },
            { emoji: '🔥', text: "Heartburn and indigestion may become more noticeable." },
            { emoji: '😊', text: "It's normal to feel a rollercoaster of emotions, from joy to worry." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Your first prenatal visit is likely coming up soon. Write down all your questions." },
            { emoji: '🤢', text: "Try to identify and avoid your nausea triggers, which are often strong smells." },
            { emoji: '💧', text: "Drink plenty of water to support your increased blood volume and help with constipation." },
            { emoji: '🥗', text: "If you're struggling to eat, focus on small, nutrient-dense snacks throughout the day." },
            { emoji: '😴', text: "Don't feel guilty about needing extra sleep. Your body is doing something amazing." },
            { emoji: '👖', text: "Comfort is key. Leggings, joggers, and loose dresses are your best friends." },
            { emoji: '🦷', text: "Schedule a dental check-up. Pregnancy hormones can affect your gums." },
            { emoji: '❤️', text: "Connect with other expecting parents online or in your community for support." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/07-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "blueberry fruit"
    },
    { 
        week: 8, 
        title: "Week 8: Baby is Moving!", 
        size: "Your baby is the size of a raspberry.", 
        summary: "Your baby is constantly moving, though you won't feel it yet. Their fingers and toes are now more defined.",
        development: [
            { emoji: '🕺', text: "Baby is making spontaneous movements, twitching and stretching its tiny limbs." },
            { emoji: '👁️', text: "Eyelids are forming and beginning to cover the eyes." },
            { emoji: '👃', text: "The tip of the nose is now distinguishable." },
            { emoji: '👄', text: "The upper lip and palate are fusing together." },
            { emoji: '👂', text: "The external parts of the ears are taking shape." },
            { emoji: '🦴', text: "Bone formation (ossification) begins in the skeleton." },
            { emoji: '👶', text: "The embryonic tail is almost completely gone. Baby looks much more human." },
            { emoji: '❤️', text: "The heart is beating strong at about 150-170 beats per minute." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "You might start to notice a slight thickening of your waistline." },
            { emoji: '🍈', text: "Your breasts continue to grow, and you might see blue veins under the skin." },
            { emoji: '😴', text: "Fatigue is still a major factor as the placenta takes over hormone production." },
            { emoji: '🎈', text: "Bloating and gas can be uncomfortable." },
            { emoji: '💧', text: "Increased vaginal discharge (leukorrhea) is normal and healthy." },
            { emoji: '👃', text: "Your sense of smell might be incredibly sensitive, a 'superpower' you didn't ask for." },
            { emoji: '❤️', text: "Your blood volume has increased by about 40-50%." },
            { emoji: '⚖️', text: "Weight gain is still minimal, typically around 1-5 pounds total so far." }
        ],
        symptoms: [
            { emoji: '🤢', text: "Nausea is still a very common symptom for many." },
            { emoji: '😴', text: "Deep fatigue that makes it hard to get through the day." },
            { emoji: '🍈', text: "Sore, heavy, and growing breasts." },
            { emoji: '🚽', text: "Frequent urination continues to be a bother." },
            { emoji: '😖', text: "You might experience 'round ligament pain' – sharp twinges in your lower abdomen as your uterus stretches." },
            { emoji: '🧠', text: "You may experience 'pregnancy brain' - feeling forgetful or foggy." },
            { emoji: '💤', text: "You may have very vivid and unusual dreams." },
            { emoji: '🔥', text: "Heartburn and indigestion can be persistent." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "At your first prenatal appointment, you may get to hear the baby's heartbeat!" },
            { emoji: '👟', text: "Invest in comfortable, supportive shoes as your ligaments loosen." },
            { emoji: '💧', text: "Drink plenty of water to help with bloating and constipation." },
            { emoji: '🧘‍♀️', text: "Gentle exercise can boost your mood and energy. Try prenatal yoga or swimming." },
            { emoji: '🥗', text: "Focus on folic acid, calcium, and iron in your diet." },
            { emoji: '🗣️', text: "Start thinking about how you want to announce your pregnancy, if you haven't already." },
            { emoji: '❤️', text: "Share your feelings and anxieties with your partner or a trusted friend." },
            { emoji: '📚', text: "It's a good time to start reading up on pregnancy and childbirth." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/08-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "raspberry fruit" 
    },
    { 
        week: 9, 
        title: "Week 9: Officially a Fetus", 
        size: "Your baby is the size of a cherry.", 
        summary: "The embryonic period ends, and the fetal period begins. All essential organs have started to form.",
        development: [
            { emoji: '🎉', text: 'Big news! The embryo is now officially called a fetus.' },
            { emoji: '💪', text: 'Muscles are developing, and the fetus is making stronger movements.' },
            { emoji: '❤️', text: 'The heart valves (aortic and pulmonary) are now formed.' },
            { emoji: '🖐️', text: 'Fingers and toes are more distinct, though still webbed.' },
            { emoji: '👶', text: 'Facial features are becoming more refined and recognizable.' },
            { emoji: '🦴', text: 'Bones are starting to harden (ossify) throughout the body.' },
            { emoji: '👂', text: 'The external ears are well-formed.' },
            { emoji: ' órgão', text: 'All essential organs are in place and will now focus on maturing.' }
        ],
        bodyChanges: [
            { emoji: '🤰', text: 'Your uterus is continuing to grow, now about the size of a small melon.' },
            { emoji: '😴', text: 'Morning sickness and fatigue may still be at their peak.' },
            { emoji: '🍈', text: 'Your breasts might feel lumpy as milk ducts develop.' },
            { emoji: '⚖️', text: 'You may not have gained much weight yet, which is perfectly normal.' },
            { emoji: '❤️', text: 'Your heart is pumping more blood to supply the placenta.' },
            { emoji: '🩸', text: 'Increased blood volume can lead to visible veins on your chest and abdomen.' },
            { emoji: '😊', text: 'Emotionally, the reality of pregnancy might be setting in more deeply.' },
            { emoji: '🤫', text: 'You are likely still not showing to the outside world.' }
        ],
        symptoms: [
            { emoji: '🤢', text: 'Nausea and vomiting can still be significant.' },
            { emoji: '😴', text: 'Feeling tired is one of the most common complaints.' },
            { emoji: '🎢', text: 'Mood swings are common due to hormonal fluctuations.' },
            { emoji: '🔥', text: 'Heartburn and indigestion continue for many.' },
            { emoji: '🎈', text: 'Bloating and constipation are frequent companions.' },
            { emoji: '🤕', text: 'Headaches can occur due to hormonal changes and increased blood volume.' },
            { emoji: '😵', text: 'Dizziness or feeling faint is possible.' },
            { emoji: '🤧', text: 'You might feel congested due to pregnancy rhinitis.' }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: 'Consider genetic screening options, like NIPT, which can be done starting this week.' },
            { emoji: '💧', text: 'Drink at least 8-10 glasses of water per day.' },
            { emoji: '🥗', text: 'Focus on calcium-rich foods like yogurt, leafy greens, and almonds.' },
            { emoji: '🦷', text: 'Be gentle when brushing your teeth, as your gums may be sensitive.' },
            { emoji: '🗣️', text: 'If you’re feeling anxious, talk about your fears. It’s normal to be worried.' },
            { emoji: '🧘‍♀️', text: 'Continue with safe, moderate exercise to help manage symptoms.' },
            { emoji: '👖', text: 'Maternity pants might become your new best friend for comfort.' },
            { emoji: '❤️', text: 'Plan a simple date night with your partner to connect.' }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/09-fetaldev-all-skintones_4x3.jpg?width=396",
        aiHint: "cherry fruit"
    },
    { 
        week: 10, 
        title: "Week 10: Fingernails & Hair", 
        size: "Your baby is the size of a prune.", 
        summary: "Tiny details are emerging, like fingernails and fine hair. Your baby is now practicing swallowing.",
        development: [
            { emoji: '💅', text: 'Tiny fingernails and toenails are beginning to form.' },
            { emoji: '🍑', text: 'A fine, downy hair called lanugo is appearing on the skin.' },
            { emoji: '🧠', text: 'The brain is developing rapidly, and the forehead is temporarily bulging.' },
            { emoji: '👶', text: 'The fetus can now bend its limbs at the elbows and knees.' },
            { emoji: '💧', text: 'The fetus is swallowing amniotic fluid and the kidneys are producing urine.' },
            { emoji: '🦷', text: 'Tooth buds for baby teeth are forming within the gums.' },
            { emoji: '🦴', text: 'The skeleton is transitioning from cartilage to bone.' },
            { emoji: '🤸', text: 'The fetus is very active, kicking and stretching in the womb.' }
        ],
        bodyChanges: [
            { emoji: '🤰', text: 'You might start to see the very beginning of a baby bump, especially if this isn’t your first pregnancy.' },
            { emoji: '🍈', text: 'Your breasts are likely larger and more sensitive.' },
            { emoji: '❤️', text: 'You can see more prominent veins on your skin due to increased blood flow.' },
            { emoji: '📈', text: 'Hormone levels are peaking, which can intensify symptoms.' },
            { emoji: '😩', text: 'Round ligament pain, sharp pains in the lower abdomen, might occur as the uterus grows.' },
            { emoji: '😊', text: 'Some women start to feel a bit better as the first trimester nears its end.' },
            { emoji: '⚖️', text: 'A weight gain of 1-5 pounds is typical by this point.' },
            { emoji: '✨', text: 'Your body is now fully in pregnancy mode, supporting your growing baby.' }
        ],
        symptoms: [
            { emoji: '🤢', text: 'Nausea and fatigue may still be strong, but relief is often on the horizon.' },
            { emoji: '🎈', text: 'Bloating and gas continue to be common.' },
            { emoji: '💧', text: 'Increased vaginal discharge is normal.' },
            { emoji: '🔥', text: 'Heartburn can be an issue.' },
            { emoji: '🤕', text: 'Occasional headaches are still possible.' },
            { emoji: '😵', text: 'Dizziness can occur, so move slowly when changing positions.' },
            { emoji: '😖', text: 'Abdominal aches and pains from your stretching uterus.' },
            { emoji: '🎢', text: 'Emotional ups and downs are part of the journey.' }
        ],
        tips: [
            { emoji: '🗣️', text: 'If you haven’t told your employer yet, now might be a good time to start planning the conversation.' },
            { emoji: '👩‍⚕️', text: 'Ask your doctor about the results of any early screenings you’ve had.' },
            { emoji: '👖', text: 'Start shopping for maternity clothes or comfortable alternatives.' },
            { emoji: '🥗', text: 'Ensure you’re getting enough Vitamin D, which is crucial for bone development.' },
            { emoji: '🧘‍♀️', text: 'Kegel exercises are great to start now to strengthen your pelvic floor.' },
            { emoji: '☀️', text: 'Your skin is more sensitive to the sun, so wear sunscreen daily.' },
            { emoji: '💧', text: 'Keep up with your water intake to support all the amazing changes happening.' },
            { emoji: '❤️', text: 'Start a pregnancy journal to document your thoughts and feelings.' }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/10-fetaldev-all-skintones_4x3.jpg?width=396",
        aiHint: "prune fruit"
    },
    { 
        week: 11, 
        title: "Week 11: Uncurling & Stretching", 
        size: "Your baby is the size of a lime.", 
        summary: "The baby's body is starting to straighten out. They can now open and close their hands into fists.",
        development: [
            { emoji: '🤸', text: 'The fetus is stretching, kicking, and even hiccuping, though you can\'t feel it.' },
            { emoji: '🖐️', text: 'Fingers and toes are now fully separated; the webbing is gone.' },
            { emoji: '👂', text: 'The ears are moving to their final position on the sides of the head.' },
            { emoji: '👶', text: 'The head is still large, making up about half of the total body length.' },
            { emoji: '🦴', text: 'Bone hardening continues.' },
            { emoji: '🌸', text: 'Reproductive organs are forming—it’s a boy or a girl!' },
            { emoji: '👃', text: 'Nostrils are open, and the nasal passages are formed.' },
            { emoji: '🩸', text: 'The placenta is developing rapidly and increasing hormone production.' }
        ],
        bodyChanges: [
            { emoji: '🤢', text: 'Good news! Morning sickness and fatigue may start to subside for many.' },
            { emoji: '⚡', text: 'You might start to feel a return of your energy levels.' },
            { emoji: '🤰', text: 'A small baby bump may be starting to show, especially in the evenings.' },
            { emoji: '🍈', text: 'Your breasts are still growing and preparing for milk production.' },
            { emoji: '📈', text: 'The risk of miscarriage drops significantly after this week.' },
            { emoji: '✨', text: 'You might notice a dark line appearing on your abdomen, called the linea nigra.' },
            { emoji: '🔥', text: 'Heartburn might persist as your digestive system slows down.' },
            { emoji: '😊', text: 'Many women start to feel more of the "glow" and less of the "green" around this time.' }
        ],
        symptoms: [
            { emoji: '🤢', text: 'Nausea may begin to decrease.' },
            { emoji: '😴', text: 'Fatigue might lessen, giving you a welcome energy boost.' },
            { emoji: '🎈', text: 'Gas and bloating are still common.' },
            { emoji: '💧', text: 'Vaginal discharge may increase.' },
            { emoji: '😖', text: 'Leg cramps can start to appear, especially at night.' },
            { emoji: '🤕', text: 'Headaches are still a possibility.' },
            { emoji: '🍫', text: 'Food cravings and aversions can still be strong.' },
            { emoji: '✨', text: 'A feeling of relief as you approach the end of the first trimester.' }
        ],
        tips: [
            { emoji: '🎉', text: 'Celebrate making it through the toughest part of the first trimester!' },
            { emoji: '🗣️', text: 'You might feel more comfortable sharing your pregnancy news with a wider circle now.' },
            { emoji: '🥗', text: 'Continue to eat a balanced diet with plenty of fruits, vegetables, and protein.' },
            { emoji: '💧', text: 'Staying hydrated helps prevent headaches and constipation.' },
            { emoji: '🏃‍♀️', text: 'Enjoy your returning energy by going for walks or doing other safe exercises.' },
            { emoji: '👩‍⚕️', text: 'Ask your doctor about any upcoming tests or ultrasounds for the second trimester.' },
            { emoji: '📚', text: 'Start thinking about baby names—it’s a fun way to connect with your little one.' },
            { emoji: '💰', text: 'Begin to research the costs of baby gear and childcare to start budgeting.' }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/11-fetaldev-all-skintones_4x3.jpg?width=396",
        aiHint: "lime fruit"
    },
    { 
        week: 12, 
        title: "Week 12: Reflexes Develop", 
        size: "Your baby is the size of a plum.", 
        summary: "The first trimester is almost over! Your baby's reflexes are developing; they will curl their toes and squint their eyes.",
        development: [
            { emoji: '🧠', text: 'The brain is fully formed and the fetus can feel pain.' },
            { emoji: '👣', text: 'The fetus is developing reflexes, like curling its toes and making sucking motions.' },
            { emoji: '🎵', text: 'The vocal cords are forming, preparing for that first cry.' },
            { emoji: '🦴', text: 'The skeleton continues to harden.' },
            { emoji: '👶', text: 'The intestines, which were growing in the umbilical cord, are moving into the abdomen.' },
            { emoji: '🩸', text: 'The bone marrow is beginning to produce white blood cells.' },
            { emoji: ' pituitary', text: 'The pituitary gland at the base of the brain starts producing hormones.' },
            { emoji: '✨', text: 'All major body parts and organs are in place.' }
        ],
        bodyChanges: [
            { emoji: '🤰', text: 'Your uterus moves up and out of the pelvis, which may relieve pressure on your bladder.' },
            { emoji: '✨', text: 'Your baby bump might be more noticeable now.' },
            { emoji: '❤️', text: 'Your doctor can likely hear the baby\'s heartbeat with a fetal Doppler.' },
            { emoji: '⚡', text: 'Energy levels are often much better than in previous weeks.' },
            { emoji: '🤢', text: 'Morning sickness has likely subsided for most women.' },
            { emoji: '😵', text: 'Dizziness can still occur, so be careful.' },
            { emoji: '🍈', text: 'Your breasts might be less tender but continue to grow.' },
            { emoji: '😊', text: 'You may be feeling more excited and less anxious as the risk of miscarriage has dropped.' }
        ],
        symptoms: [
            { emoji: '🤕', text: 'Headaches may still be an issue for some.' },
            { emoji: '💧', text: 'An increase in vaginal discharge is normal.' },
            { emoji: '🎈', text: 'You might still experience some bloating.' },
            { emoji: '✨', text: 'A noticeable decrease in nausea and fatigue.' },
            { emoji: '🔥', text: 'Heartburn might continue or start now.' },
            { emoji: '🤧', text: 'Nasal congestion (pregnancy rhinitis) can be bothersome.' },
            { emoji: '😴', text: 'You might find it easier to get a good night\'s sleep.' },
            { emoji: '💖', text: 'A growing sense of connection to the baby.' }
        ],
        tips: [
            { emoji: '🏃‍♀️', text: 'Now is a great time to establish a regular, safe exercise routine.' },
            { emoji: '🗣️', text: 'Share the exciting news with friends and family if you haven\'t already!' },
            { emoji: '🥗', text: 'Focus on a nutrient-rich diet to support the baby\'s rapid growth.' },
            { emoji: '🧘‍♀️', text: 'Continue with Kegel exercises to support your pelvic floor muscles.' },
            { emoji: '🤰', text: 'Look into prenatal classes in your area.' },
            { emoji: '💬', text: 'Start discussing your birth plan and preferences with your partner and doctor.' },
            { emoji: '❤️', text: 'Hearing the heartbeat for the first time is a magical moment—enjoy it!' },
            { emoji: '👶', text: 'Start dreaming and planning for your new arrival. This is a joyful time!' }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/12-fetaldev-H-beige_4x3.jpg?width=396",
        aiHint: "plum fruit"
    },
    { 
        week: 13, 
        title: "Week 13: Welcome to the 2nd Trimester!", 
        size: "Your baby is the size of a peach.", 
        summary: "You've made it! The second trimester is often called the 'honeymoon' phase of pregnancy. Your baby has unique fingerprints now.",
        development: [
            { emoji: '🎉', text: 'Welcome to the second trimester!' },
            { emoji: '👍', text: 'Unique fingerprints have formed on the baby\'s tiny fingertips.' },
            { emoji: '🍑', text: 'The baby\'s body is starting to catch up to its large head in size.' },
            { emoji: '👶', text: 'The intestines have moved completely into the baby\'s abdomen.' },
            { emoji: '🦴', text: 'Bones are hardening, and the skeleton is becoming more defined.' },
            { emoji: '💧', text: 'The baby is practicing breathing by moving amniotic fluid in and out of the lungs.' },
            { emoji: '👂', text: 'The ears are now in their correct position, and the baby may be able to hear sounds.' },
            { emoji: '🌸', text: 'If you\'re having a girl, her ovaries now contain millions of eggs.' }
        ],
        bodyChanges: [
            { emoji: '✨', text: 'You may truly feel the "pregnancy glow" as early symptoms fade.' },
            { emoji: '⚡', text: 'Energy levels are typically at their best during the second trimester.' },
            { emoji: '🤰', text: 'Your baby bump is likely becoming more apparent.' },
            { emoji: '❤️', text: 'Your libido may increase as you feel more energetic and less nauseous.' },
            { emoji: '🍈', text: 'Your breasts are less tender but continue to prepare for breastfeeding.' },
            { emoji: '💧', text: 'Vaginal discharge may increase.' },
            { emoji: '👖', text: 'You will likely need maternity clothes now if you haven’t already switched.' },
            { emoji: '😊', text: 'This is often a period of emotional well-being and excitement.' }
        ],
        symptoms: [
            { emoji: '✨', text: 'A significant decrease in nausea and fatigue for most.' },
            { emoji: '⚡', text: 'Increased energy and a general sense of well-being.' },
            { emoji: '😖', text: 'Round ligament pain may continue as your uterus expands.' },
            { emoji: '🔥', text: 'Heartburn can still be an issue.' },
            { emoji: '😵', text: 'Some dizziness may persist.' },
            { emoji: '🤕', text: 'Headaches are still possible.' },
            { emoji: '🎈', text: 'Constipation can be a problem due to hormones slowing digestion.' },
            { emoji: '👃', text: 'You may still have a stuffy nose.' }
        ],
        tips: [
            { emoji: '🎉', text: 'Enjoy this "honeymoon" phase of pregnancy!' },
            { emoji: '🏃‍♀️', text: 'Take advantage of your increased energy to stay active.' },
            { emoji: '🥗', text: 'Focus on a diet rich in protein, calcium, and iron for baby\'s growth.' },
            { emoji: '🗣️', text: 'This is a good time to start telling colleagues about your pregnancy.' },
            { emoji: '🤰', text: 'Start moisturizing your belly, hips, and thighs to help with stretching skin.' },
            { emoji: '👶', text: 'Start planning the nursery and thinking about what you\'ll need.' },
            { emoji: '✈️', text: 'The second trimester is often the best time for a "babymoon" trip.' },
            { emoji: '❤️', text: 'Connect with your baby by talking or singing to your bump.' }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/13-fetaldev-G-warmbeige_4x3.jpg?width=396",
        aiHint: "peach fruit"
    },
    { 
        week: 14, 
        title: "Week 14: Placeholder Title", 
        size: "Placeholder size for week 14", 
        summary: "Placeholder summary for week 14.",
        development: [{ emoji: '🚧', text: `Detailed content for week 14 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 14 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 14 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 14 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/14-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    { 
        week: 15, 
        title: "Week 15: Placeholder Title", 
        size: "Placeholder size for week 15", 
        summary: "Placeholder summary for week 15.",
        development: [{ emoji: '🚧', text: `Detailed content for week 15 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 15 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 15 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 15 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/15-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    { 
        week: 16, 
        title: "Week 16: Placeholder Title", 
        size: "Placeholder size for week 16", 
        summary: "Placeholder summary for week 16.",
        development: [{ emoji: '🚧', text: `Detailed content for week 16 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 16 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 16 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 16 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/16-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 17,
        title: "Week 17: Placeholder Title",
        size: "Placeholder size for week 17",
        summary: "Placeholder summary for week 17.",
        development: [{ emoji: '🚧', text: `Detailed content for week 17 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 17 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 17 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 17 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/17-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 18,
        title: "Week 18: Placeholder Title",
        size: "Placeholder size for week 18",
        summary: "Placeholder summary for week 18.",
        development: [{ emoji: '🚧', text: `Detailed content for week 18 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 18 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 18 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 18 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/18-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 19,
        title: "Week 19: Placeholder Title",
        size: "Placeholder size for week 19",
        summary: "Placeholder summary for week 19.",
        development: [{ emoji: '🚧', text: `Detailed content for week 19 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 19 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 19 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 19 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/19-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 20,
        title: "Week 20: Placeholder Title",
        size: "Placeholder size for week 20",
        summary: "Placeholder summary for week 20.",
        development: [{ emoji: '🚧', text: `Detailed content for week 20 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 20 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 20 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 20 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/20-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 21,
        title: "Week 21: Placeholder Title",
        size: "Placeholder size for week 21",
        summary: "Placeholder summary for week 21.",
        development: [{ emoji: '🚧', text: `Detailed content for week 21 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 21 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 21 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 21 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/21-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 22,
        title: "Week 22: Placeholder Title",
        size: "Placeholder size for week 22",
        summary: "Placeholder summary for week 22.",
        development: [{ emoji: '🚧', text: `Detailed content for week 22 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 22 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 22 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 22 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/22-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 23,
        title: "Week 23: Placeholder Title",
        size: "Placeholder size for week 23",
        summary: "Placeholder summary for week 23.",
        development: [{ emoji: '🚧', text: `Detailed content for week 23 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 23 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 23 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 23 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/23-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 24,
        title: "Week 24: Placeholder Title",
        size: "Placeholder size for week 24",
        summary: "Placeholder summary for week 24.",
        development: [{ emoji: '🚧', text: `Detailed content for week 24 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 24 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 24 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 24 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/24-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 25,
        title: "Week 25: Placeholder Title",
        size: "Placeholder size for week 25",
        summary: "Placeholder summary for week 25.",
        development: [{ emoji: '🚧', text: `Detailed content for week 25 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 25 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 25 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 25 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/25-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 26,
        title: "Week 26: Placeholder Title",
        size: "Placeholder size for week 26",
        summary: "Placeholder summary for week 26.",
        development: [{ emoji: '🚧', text: `Detailed content for week 26 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 26 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 26 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 26 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/26-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 27,
        title: "Week 27: Placeholder Title",
        size: "Placeholder size for week 27",
        summary: "Placeholder summary for week 27.",
        development: [{ emoji: '🚧', text: `Detailed content for week 27 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 27 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 27 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 27 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/27-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 28,
        title: "Week 28: Placeholder Title",
        size: "Placeholder size for week 28",
        summary: "Placeholder summary for week 28.",
        development: [{ emoji: '🚧', text: `Detailed content for week 28 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 28 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 28 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 28 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/28-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 29,
        title: "Week 29: Placeholder Title",
        size: "Placeholder size for week 29",
        summary: "Placeholder summary for week 29.",
        development: [{ emoji: '🚧', text: `Detailed content for week 29 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 29 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 29 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 29 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/29-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    },
    {
        week: 30,
        title: "Week 30: Placeholder Title",
        size: "Placeholder size for week 30",
        summary: "Placeholder summary for week 30.",
        development: [{ emoji: '🚧', text: `Detailed content for week 30 development is being generated.` }],
        bodyChanges: [{ emoji: '🚧', text: `Detailed content for week 30 body changes is being generated.` }],
        symptoms: [{ emoji: '🚧', text: `Detailed content for week 30 symptoms is being generated.` }],
        tips: [{ emoji: '🚧', text: `Detailed content for week 30 tips is being generated.` }],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/30-fetaldev-E-deeptan-4x3.png",
        aiHint: "baby illustration"
    }
];

// Populate remaining weeks with placeholder data to avoid errors
for (let i = 31; i <= 40; i++) {
    if (!weeklyDevelopment.find(w => w.week === i)) {
        weeklyDevelopment.push({
            week: i,
            title: `Week ${i}: Placeholder Title`,
            size: `Placeholder size for week ${i}`,
            summary: `Placeholder summary for week ${i}.`,
            development: [{ emoji: '🚧', text: `Detailed content for week ${i} development is being generated.` }],
            bodyChanges: [{ emoji: '🚧', text: `Detailed content for week ${i} body changes is being generated.` }],
            symptoms: [{ emoji: '🚧', text: `Detailed content for week ${i} symptoms is being generated.` }],
            tips: [{ emoji: '🚧', text: `Detailed content for week ${i} tips is being generated.` }],
            imageUrl: "https://placehold.co/600x400.png",
            aiHint: "baby illustration"
        });
    }
}
weeklyDevelopment.sort((a,b) => a.week - b.week);
