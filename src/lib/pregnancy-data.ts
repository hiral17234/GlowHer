
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
    motherImageUrl: string;
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
        aiHint: "pregnancy test",
        motherImageUrl: "https://placehold.co/600x400.png"
    },
    { 
        week: 1, 
        title: "Week 1: The Journey Begins", 
        size: "You're on your period, so not yet pregnant.", 
        summary: "Pregnancy is counted from the first day of your last menstrual period. This week, your body is preparing for potential conception.",
        development: [
            { emoji: '🩸', text: "The first day of your period marks the beginning of your menstrual cycle and week 1 of pregnancy." },
            { emoji: '🧬', text: "Hormones like FSH (follicle-stimulating hormone) begin to rise, preparing your ovaries." },
            { emoji: '🥚', text: "Multiple follicles, each containing an egg, start to mature in your ovaries." },
            { emoji: '🧱', text: "Your body sheds last month's uterine lining to prepare a fresh, new one." },
            { emoji: '🌱', text: "Estrogen levels are low at the start of the week but will begin to rise." },
            { emoji: '⏲️', text: "This phase typically lasts between 3 to 7 days for most women." },
            { emoji: '✨', text: "Your body is resetting itself for a potential pregnancy this cycle." },
            { emoji: '💪', text: "It's a period of renewal and preparation on a microscopic level." }
        ],
        bodyChanges: [
            { emoji: '🩸', text: "The most obvious change is your menstrual period." },
            { emoji: '🌡️', text: "Your basal body temperature is at its lowest point during your period." },
            { emoji: '🧱', text: "The cervix is low, firm, and slightly open to allow blood to pass." },
            { emoji: '⚖️', text: "Hormone levels (estrogen and progesterone) are at their lowest." },
            { emoji: '😩', text: "You might feel tired or have less energy due to hormonal changes and blood loss." },
            { emoji: '💧', text: "Water retention from the previous cycle starts to decrease." },
            { emoji: '🧖‍♀️', text: "Some women find their skin is more prone to breakouts during this time." },
            { emoji: '😌', text: "For many, the start of their period brings relief from PMS symptoms." }
        ],
        symptoms: [
            { emoji: '🩸', text: "Vaginal bleeding is the primary symptom of this week." },
            { emoji: '😖', text: "Uterine cramping is common as your uterus contracts to shed its lining." },
            { emoji: '🎈', text: "Bloating and water retention can carry over from the days before your period." },
            { emoji: '🤕', text: "Hormonal headaches or migraines can occur due to the drop in estrogen." },
            { emoji: '😴', text: "Fatigue and low energy are very common." },
            { emoji: '🎢', text: "Mood swings, irritability, or feeling more emotional are possible." },
            { emoji: '😫', text: "Lower back pain often accompanies menstrual cramps." },
            { emoji: '🍫', text: "You might still experience food cravings from the premenstrual phase." }
        ],
        tips: [
            { emoji: '💊', text: "Start taking a prenatal vitamin with at least 400 mcg of folic acid now." },
            { emoji: '🗓️', text: "Track your cycle using a calendar or app to predict your fertile window." },
            { emoji: '🧘‍♀️', text: "Prioritize rest and gentle movement like walking or stretching." },
            { emoji: '👩‍⚕️', text: "Schedule a preconception check-up with your doctor to discuss your health." },
            { emoji: '🚭', text: "Reduce or eliminate alcohol and smoking to create a healthy environment for conception." },
            { emoji: '☕', text: "Limit caffeine intake to one or two cups of coffee per day." },
            { emoji: '🥗', text: "Focus on a balanced diet rich in iron and vitamin C to replenish your body." },
            { emoji: '💕', text: "Communicate with your partner about your plans and feelings on this journey." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/02-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "calendar vitamins",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/02-body-E-deeptan-4x3.png"
    },
    { 
        week: 2, 
        title: "Week 2: Preparing for Ovulation", 
        size: "An egg is maturing in your ovary.", 
        summary: "Your uterine lining is thickening, and your body is getting ready to release an egg. This is your fertile window.",
        development: [
            { emoji: '🥚', text: "A single dominant follicle outgrows the others and prepares for ovulation." },
            { emoji: '📈', text: "Rising estrogen levels cause the uterine lining (endometrium) to thicken." },
            { emoji: '🧠', text: "The pituitary gland releases a surge of Luteinizing Hormone (LH) to trigger ovulation." },
            { emoji: '💧', text: "Cervical mucus becomes clearer, thinner, and more slippery to help sperm." },
            { emoji: '✨', text: "The egg inside the follicle completes its first meiotic division." },
            { emoji: '🚪', text: "The cervix softens and opens slightly in preparation." },
            { emoji: '⏰', text: "Ovulation typically occurs around the end of this week." },
            { emoji: '🕊️', text: "The stage is set for the egg to be released and potentially fertilized." }
        ],
        bodyChanges: [
            { emoji: '⚡', text: "You may notice a significant increase in your energy levels." },
            { emoji: '💕', text: "Libido often peaks during this phase due to high estrogen." },
            { emoji: '🌡️', text: "Your basal body temperature will have a slight dip just before ovulation." },
            { emoji: '💧', text: "You'll notice clear, stretchy, 'egg-white' cervical mucus." },
            { emoji: '👃', text: "Some women experience a heightened sense of smell." },
            { emoji: '😊', text: "Your mood may be more positive, outgoing, and sociable." },
            { emoji: '✨', text: "Skin often appears clearer and more radiant—the 'ovulation glow.'" },
            { emoji: '😖', text: "Some women feel a slight twinge of pain on one side as the ovary releases the egg." }
        ],
        symptoms: [
            { emoji: '💧', text: "Increased, watery, or egg-white-like vaginal discharge is a key sign." },
            { emoji: '😊', text: "A general feeling of well-being and increased energy." },
            { emoji: '❤️', text: "Heightened sex drive is very common." },
            { emoji: '😖', text: "Mild one-sided pelvic pain (mittelschmerz) can occur during ovulation." },
            { emoji: '🎈', text: "Light bloating is possible for some women." },
            { emoji: '✨', text: "A small amount of light spotting can occur during ovulation." },
            { emoji: '🍈', text: "Breasts may feel slightly tender or sensitive." },
            { emoji: '✨', text: "Most symptoms this week are positive signs of peak fertility." }
        ],
        tips: [
            { emoji: '❤️', text: "This is the most fertile time in your cycle to try to conceive." },
            { emoji: '🧪', text: "Use ovulation predictor kits (OPKs) to pinpoint the LH surge." },
            { emoji: '🌡️', text: "Track your basal body temperature to confirm ovulation after it happens." },
            { emoji: '🥗', text: "Eat nutrient-dense foods to support hormonal health." },
            { emoji: '💧', text: "Stay well-hydrated, as it can improve cervical mucus quality." },
            { emoji: '🚭', text: "Continue avoiding alcohol, smoking, and excessive caffeine." },
            { emoji: '🧘‍♀️', text: "Manage stress with activities like yoga or meditation." },
            { emoji: '💬', text: "Keep communication open and enjoyable with your partner." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/02-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "flower blooming",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/02-body-E-deeptan-4x3.png"
    },
    { 
        week: 3, 
        title: "Week 3: Fertilization & Implantation", 
        size: "The fertilized egg, or blastocyst, is a microscopic ball of cells.", 
        summary: "Success! A sperm has fertilized the egg, and this new ball of cells is making its way to your uterus for implantation.",
        development: [
            { emoji: '🎉', text: "Fertilization! A single sperm penetrates the egg, creating a zygote." },
            { emoji: '🧬', text: "The baby's genetic makeup, including sex, is determined at this moment." },
            { emoji: '➗', text: "The zygote begins rapidly dividing into a ball of cells called a blastocyst." },
            { emoji: '🚗', text: "The blastocyst travels down the fallopian tube toward the uterus." },
            { emoji: '🏠', text: "The blastocyst begins to burrow into the plush uterine lining—this is implantation." },
            { emoji: '🤝', text: "The outer cells of the blastocyst will form the placenta." },
            { emoji: '👶', text: "The inner cells of the blastocyst will become the embryo." },
            { emoji: '📈', text: "The hormone hCG (human chorionic gonadotropin) begins to be produced." }
        ],
        bodyChanges: [
            { emoji: '🤫', text: "Externally, you won't notice any changes, as all the action is happening on a microscopic level." },
            { emoji: '📈', text: "Internally, the hormone progesterone begins to rise, signaled by the newly forming placenta." },
            { emoji: '🌸', text: "Some women (about 25%) experience light implantation spotting or cramping as the blastocyst embeds in the uterus." },
            { emoji: '🌡️', text: "Your basal body temperature will remain elevated after ovulation." },
            { emoji: '🍈', text: "You might experience very early breast tenderness due to rising hormones." },
            { emoji: '😴', text: "A wave of fatigue might hit as your body dedicates enormous energy to the implantation process." },
            { emoji: '🚽', text: "Increased progesterone can sometimes lead to early bloating or constipation." },
            { emoji: '✨', text: "Your immune system lowers slightly to prevent rejecting the new embryo." }
        ],
        symptoms: [
            { emoji: '🩸', text: "Light spotting (pink or brown) around 6-12 days past ovulation, known as implantation bleeding." },
            { emoji: '😖', text: "Mild cramping, similar to period cramps but usually lighter." },
            { emoji: '😴', text: "Early and unexplained fatigue is a very common first sign." },
            { emoji: '🍈', text: "Sore, tender, or swollen breasts." },
            { emoji: '🎈', text: "Bloating that feels similar to pre-menstrual bloating." },
            { emoji: '👃', text: "A heightened sense of smell can start this early for some." },
            { emoji: '🤢', text: "Some women may experience very mild, early nausea." },
            { emoji: '✨', text: "Many women experience no symptoms at all this week." }
        ],
        tips: [
            { emoji: '🧘‍♀️', text: "Act 'as if you are pregnant.' Continue healthy habits just in case." },
            { emoji: '⏳', text: "Resist the urge to take a pregnancy test yet; hCG levels are likely still too low." },
            { emoji: '💧', text: "Stay hydrated and eat nutritious, whole foods." },
            { emoji: '💊', text: "Don't forget your daily prenatal vitamin with folic acid." },
            { emoji: '😌', text: "This can be an anxious time. Practice mindfulness and relaxation techniques." },
            { emoji: '🏃‍♀️', text: "Continue with gentle to moderate exercise, avoiding any new, strenuous activities." },
            { emoji: '🚫', text: "Steer clear of alcohol, smoking, and unsafe foods like unpasteurized cheese." },
            { emoji: '❤️', text: "Lean on your partner or a friend for support during the 'two-week wait.'" }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/03-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "cells microscope",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/03-body-E-deeptan-4x3.png"
    },
    { 
        week: 4, 
        title: "Week 4: A Positive Test!", 
        size: "Your baby is the size of a poppy seed.", 
        summary: "The blastocyst has successfully implanted in your uterine wall. This is the week you'll likely miss your period and get a positive pregnancy test!", 
        development: [
            { emoji: '🏠', text: "The embryo is securely implanted in the uterine lining." },
            { emoji: '🧱', text: "It has differentiated into three distinct layers: ectoderm, mesoderm, and endoderm." },
            { emoji: '🧠', text: "The ectoderm will form the nervous system, skin, and hair." },
            { emoji: '❤️', text: "The mesoderm will develop into the skeleton, muscles, heart, and blood vessels." },
            { emoji: '🫁', text: "The endoderm will become the digestive system, liver, and lungs." },
            { emoji: '탯', text: "The placenta begins to form and produce the pregnancy hormone hCG." },
            { emoji: '💧', text: "The amniotic sac, which will cushion the baby, is also forming." },
            { emoji: '📈', text: "Growth is happening at an exponential rate." }
        ],
        bodyChanges: [
            { emoji: '🩸', text: "A missed period is the most common and clear sign of pregnancy." },
            { emoji: '➕', text: "Hormone hCG is now high enough to be detected by a home pregnancy test." },
            { emoji: '🍈', text: "Breasts may feel even more swollen, tender, and tingly." },
            { emoji: '🎈', text: "Progesterone-induced bloating can be significant." },
            { emoji: '🌡️', text: "Your basal body temperature remains elevated." },
            { emoji: '🚽', text: "You may notice an increased need to urinate as your uterus grows." },
            { emoji: '😩', text: "Fatigue can feel profound as your body works overtime." },
            { emoji: '🤫', text: "From the outside, there are no visible changes yet." }
        ],
        symptoms: [
            { emoji: '🗓️', text: "A missed menstrual period." },
            { emoji: '🍈', text: "Extremely sore and sensitive breasts." },
            { emoji: '😴', text: "Overwhelming fatigue that feels like you've run a marathon." },
            { emoji: '😖', text: "Mild, period-like cramping (without bleeding) is normal." },
            { emoji: '🤢', text: "Morning sickness (which can happen any time of day) may begin." },
            { emoji: '❤️', text: "Food cravings or aversions may start to appear." },
            { emoji: '🎢', text: "Mood swings due to the rapid increase in hormones." },
            { emoji: '👃', text: "A heightened sense of smell can make certain scents unbearable." }
        ],
        tips: [
            { emoji: '🧪', text: "Take a home pregnancy test first thing in the morning for the most accurate result." },
            { emoji: '🎉', text: "Celebrate! This is a huge moment. Let yourself feel all the emotions." },
            { emoji: '👩‍⚕️', text: "Call your doctor to schedule your first prenatal appointment, usually around week 8." },
            { emoji: '💊', text: "If you have not already, start taking your prenatal vitamins immediately." },
            { emoji: '🚭', text: "Double-down on healthy habits: no alcohol, no smoking." },
            { emoji: '💧', text: "Stay hydrated, even if you feel bloated." },
            { emoji: '😴', text: "Listen to your body and rest whenever you can. Naps are your friend." },
            { emoji: '❤️', text: "Share the news with your partner and decide together when to tell others." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/04-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "pregnancy test positive",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/04-body-E-deeptan-4x3.png"
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
            { emoji: '👩‍⚕️', text: "If you have not yet, schedule your first prenatal visit." },
            { emoji: '🤢', text: "Combat nausea by eating small, frequent meals. Ginger and vitamin B6 can help." },
            { emoji: '💧', text: "Stay hydrated, especially if you're experiencing vomiting. Sip water or electrolyte drinks." },
            { emoji: '😴', text: "Listen to your body's need for rest. Naps are essential." },
            { emoji: '🩲', text: "Invest in a comfortable, supportive bra." },
            { emoji: '🤔', text: "Start thinking about when and how you'll share your news with family and friends." },
            { emoji: '🥗', text: "Focus on nutrient-dense foods, even if you can only eat small amounts." },
            { emoji: '❤️', text: "Lean on your support system. Talk about how you're feeling, both physically and emotionally." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/05-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "apple seed nature",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/05-body-E-deeptan-4x3.png"
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
        aiHint: "sweet pea vegetable",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/06-body-E-deeptan-4x3.png"
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
            { emoji: '🫘', text: "The kidneys are in place and will soon begin to produce urine." }
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
        aiHint: "blueberry fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/07-body-E-deeptan-4x3.png"
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
            { emoji: '👃', text: "Your sense of smell might be incredibly sensitive, a 'superpower' you did not ask for." },
            { emoji: '❤️', text: "Your blood volume has increased by about 40-50%." },
            { emoji: '⚖️', text: "Weight gain is still minimal, typically around 1-5 pounds total so far." }
        ],
        symptoms: [
            { emoji: '🤢', text: "Nausea is still a very common symptom for many." },
            { emoji: '😴', text: "Deep fatigue that makes it hard to get through the day." },
            { emoji: '🍈', text: "Sore, heavy, and growing breasts." },
            { emoji: '🚽', text: "Frequent trips to the bathroom continue to be a bother." },
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
            { emoji: '🗣️', text: "Start thinking about how you want to announce your pregnancy, if you have not already." },
            { emoji: '❤️', text: "Share your feelings and anxieties with your partner or a trusted friend." },
            { emoji: '📚', text: "It's a good time to start reading up on pregnancy and childbirth." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/08-fetaldev-all-skintones_4x3.jpg?width=396", 
        aiHint: "raspberry fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/08-body-E-deeptan-4x3.png"
    },
    { 
        week: 9, 
        title: "Week 9: Officially a Fetus", 
        size: "Your baby is the size of a cherry.", 
        summary: "The embryonic period ends, and the fetal period begins. All essential organs have started to form.",
        development: [
            { emoji: '🎉', text: "Big news! The embryo is now officially called a fetus." },
            { emoji: '💪', text: "Muscles are developing, and the fetus is making stronger movements." },
            { emoji: '❤️', text: "The heart valves (aortic and pulmonary) are now formed." },
            { emoji: '🖐️', text: "Fingers and toes are more distinct, though still webbed." },
            { emoji: '👶', text: "Facial features are becoming more refined and recognizable." },
            { emoji: '🦴', text: "Bones are starting to harden (ossify) throughout the body." },
            { emoji: '👂', text: "The external ears are well-formed." },
            { emoji: '🫀', text: "All essential organs are in place and will now focus on maturing." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your uterus is continuing to grow, now about the size of a small melon." },
            { emoji: '😴', text: "Morning sickness and fatigue may still be at their peak." },
            { emoji: '🍈', text: "Your breasts might feel lumpy as milk ducts develop." },
            { emoji: '⚖️', text: "You may not have gained much weight yet, which is perfectly normal." },
            { emoji: '❤️', text: "Your heart is pumping more blood to supply the placenta." },
            { emoji: '🩸', text: "Increased blood volume can lead to visible veins on your chest and abdomen." },
            { emoji: '😊', text: "Emotionally, the reality of pregnancy might be setting in more deeply." },
            { emoji: '🤫', text: "You are likely still not showing to the outside world." }
        ],
        symptoms: [
            { emoji: '🤢', text: "Nausea and vomiting can still be significant." },
            { emoji: '😴', text: "Feeling tired is one of the most common complaints." },
            { emoji: '🎢', text: "Mood swings are common due to hormonal fluctuations." },
            { emoji: '🔥', text: "Heartburn and indigestion continue for many." },
            { emoji: '🎈', text: "Bloating and constipation are frequent companions." },
            { emoji: '🤕', text: "Headaches can occur due to hormonal changes and increased blood volume." },
            { emoji: '😵', text: "Dizziness or feeling faint is possible." },
            { emoji: '🤧', text: "You might feel congested due to pregnancy rhinitis." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Consider genetic screening options, like NIPT, which can be done starting this week." },
            { emoji: '💧', text: "Drink at least 8-10 glasses of water per day." },
            { emoji: '🥗', text: "Focus on calcium-rich foods like yogurt, leafy greens, and almonds." },
            { emoji: '🦷', text: "Be gentle when brushing your teeth, as your gums may be sensitive." },
            { emoji: '🗣️', text: "If you’re feeling anxious, talk about your fears. It’s normal to be worried." },
            { emoji: '🧘‍♀️', text: "Continue with safe, moderate exercise to help manage symptoms." },
            { emoji: '👖', text: "Maternity pants might become your new best friend for comfort." },
            { emoji: '❤️', text: "Plan a simple date night with your partner to connect." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/09-fetaldev-all-skintones_4x3.jpg?width=396",
        aiHint: "cherry fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/09-body-E-deeptan-4x3.png"
    },
    { 
        week: 10, 
        title: "Week 10: Fingernails & Hair", 
        size: "Your baby is the size of a prune.", 
        summary: "Tiny details are emerging, like fingernails and fine hair. Your baby is now practicing swallowing.",
        development: [
            { emoji: '💅', text: "Tiny fingernails and toenails are beginning to form." },
            { emoji: '🍑', text: "A fine, downy hair called lanugo is appearing on the skin." },
            { emoji: '🧠', text: "The brain is developing rapidly, and the forehead is temporarily bulging." },
            { emoji: '👶', text: "The fetus can now bend its limbs at the elbows and knees." },
            { emoji: '💧', text: "The fetus is swallowing amniotic fluid and the kidneys are producing urine." },
            { emoji: '🦷', text: "Tooth buds for baby teeth are forming within the gums." },
            { emoji: '🦴', text: "The skeleton is transitioning from cartilage to bone." },
            { emoji: '🤸', text: "The fetus is very active, kicking and stretching in the womb." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "You might start to see the very beginning of a baby bump, especially if this is not your first pregnancy." },
            { emoji: '🍈', text: "Your breasts are likely larger and more sensitive." },
            { emoji: '❤️', text: "You can see more prominent veins on your skin due to increased blood flow." },
            { emoji: '📈', text: "Hormone levels are peaking, which can intensify symptoms." },
            { emoji: '😖', text: "Round ligament pain, sharp pains in the lower abdomen, might occur as the uterus grows." },
            { emoji: '😊', text: "Some women start to feel a bit better as the first trimester nears its end." },
            { emoji: '⚖️', text: "A weight gain of 1-5 pounds is typical by this point." },
            { emoji: '✨', text: "Your body is now fully in pregnancy mode, supporting your growing baby." }
        ],
        symptoms: [
            { emoji: '🤢', text: "Nausea and fatigue may still be strong, but relief is often on the horizon." },
            { emoji: '🎈', text: "Bloating and gas continue to be common." },
            { emoji: '💧', text: "Increased vaginal discharge is normal." },
            { emoji: '🔥', text: "Heartburn can be an issue." },
            { emoji: '🤕', text: "Occasional headaches are still possible." },
            { emoji: '😵', text: "Dizziness can occur, so move slowly when changing positions." },
            { emoji: '😖', text: "Abdominal aches and pains from your stretching uterus." },
            { emoji: '🎢', text: "Emotional ups and downs are part of the journey." }
        ],
        tips: [
            { emoji: '🗣️', text: "If you have not told your employer yet, now might be a good time to start planning the conversation." },
            { emoji: '👩‍⚕️', text: "Ask your doctor about any upcoming tests or ultrasounds for the second trimester." },
            { emoji: '👖', text: "Start shopping for maternity clothes or comfortable alternatives." },
            { emoji: '🥗', text: "Ensure you’re getting enough Vitamin D, which is crucial for bone development." },
            { emoji: '🧘‍♀️', text: "Kegel exercises are great to start now to strengthen your pelvic floor." },
            { emoji: '☀️', text: "Your skin is more sensitive to the sun, so wear sunscreen daily." },
            { emoji: '💧', text: "Keep up with your water intake to support all the amazing changes happening." },
            { emoji: '❤️', text: "Start a pregnancy journal to document your thoughts and feelings." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/10-fetaldev-all-skintones_4x3.jpg?width=396",
        aiHint: "prune fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/10-body-E-deeptan-4x3.png"
    },
    { 
        week: 11, 
        title: "Week 11: Uncurling & Stretching", 
        size: "Your baby is the size of a lime.", 
        summary: "The baby's body is starting to straighten out. They can now open and close their hands into fists.",
        development: [
            { emoji: '🤸', text: "The fetus is stretching, kicking, and even hiccuping, though you can't feel it." },
            { emoji: '🖐️', text: "Fingers and toes are now fully separated; the webbing is gone." },
            { emoji: '👂', text: "The ears are moving to their final position on the sides of the head." },
            { emoji: '👶', text: "The head is still large, making up about half of the total body length." },
            { emoji: '🦴', text: "Bone hardening continues." },
            { emoji: '🌸', text: "Reproductive organs are forming—it’s a boy or a girl!" },
            { emoji: '👃', text: "Nostrils are open, and the nasal passages are formed." },
            { emoji: '🩸', text: "The placenta is developing rapidly and increasing hormone production." }
        ],
        bodyChanges: [
            { emoji: '🤢', text: "Good news! Morning sickness and fatigue may start to subside for many." },
            { emoji: '⚡', text: "You might start to feel a return of your energy levels." },
            { emoji: '🤰', text: "A small baby bump may be starting to show, especially in the evenings." },
            { emoji: '🍈', text: "Your breasts are still growing and preparing for milk production." },
            { emoji: '📈', text: "The risk of miscarriage drops significantly after this week." },
            { emoji: '✨', text: "You might notice a dark line appearing on your abdomen, called the linea nigra." },
            { emoji: '🔥', text: "Heartburn might persist as your digestive system slows down." },
            { emoji: '😊', text: "Many women start to feel more of the 'glow' and less of the 'green' around this time." }
        ],
        symptoms: [
            { emoji: '🤢', text: "Nausea may begin to decrease." },
            { emoji: '😴', text: "Fatigue might lessen, giving you a welcome energy boost." },
            { emoji: '🎈', text: "Gas and bloating are still common." },
            { emoji: '💧', text: "Vaginal discharge may increase." },
            { emoji: '😖', text: "Leg cramps can start to appear, especially at night." },
            { emoji: '🤕', text: "Headaches are still a possibility." },
            { emoji: '🍫', text: "Food cravings and aversions can still be strong." },
            { emoji: '✨', text: "A feeling of relief as you approach the end of the first trimester." }
        ],
        tips: [
            { emoji: '🎉', text: "Celebrate making it through the toughest part of the first trimester!" },
            { emoji: '🗣️', text: "You might feel more comfortable sharing your pregnancy news with a wider circle now." },
            { emoji: '🥗', text: "Continue to eat a balanced diet with plenty of fruits, vegetables, and protein." },
            { emoji: '💧', text: "Staying hydrated helps prevent headaches and constipation." },
            { emoji: '🏃‍♀️', text: "Enjoy your returning energy by going for walks or doing other safe exercises." },
            { emoji: '👩‍⚕️', text: "Ask your doctor about any upcoming tests or ultrasounds for the second trimester." },
            { emoji: '📚', text: "Start thinking about baby names—it’s a fun way to connect with your little one." },
            { emoji: '💰', text: "Begin to research the costs of baby gear and childcare to start budgeting." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/11-fetaldev-all-skintones_4x3.jpg?width=396",
        aiHint: "lime fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/11-body-E-deeptan-4x3.png"
    },
    { 
        week: 12, 
        title: "Week 12: Reflexes Develop", 
        size: "Your baby is the size of a plum.", 
        summary: "The first trimester is almost over! Your baby's reflexes are developing; they will curl their toes and squint their eyes.",
        development: [
            { emoji: '🧠', text: "The brain is fully formed and the fetus can feel pain." },
            { emoji: '👣', text: "The fetus is developing reflexes, like curling its toes and making sucking motions." },
            { emoji: '🎵', text: "The vocal cords are forming, preparing for that first cry." },
            { emoji: '🦴', text: "The skeleton continues to harden." },
            { emoji: '👶', text: "The intestines, which were growing in the umbilical cord, are moving into the abdomen." },
            { emoji: '🩸', text: "The bone marrow is beginning to produce white blood cells." },
            { emoji: '🕳️', text: "The pituitary gland at the base of the brain starts producing hormones." },
            { emoji: '✨', text: "All major body parts and organs are in place." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your uterus moves up and out of the pelvis, which may relieve pressure on your bladder." },
            { emoji: '✨', text: "Your baby bump might be more noticeable now." },
            { emoji: '❤️', text: "Your doctor can likely hear the baby's heartbeat with a fetal Doppler." },
            { emoji: '⚡', text: "Energy levels are often much better than in previous weeks." },
            { emoji: '🤢', text: "Morning sickness has likely subsided for most women." },
            { emoji: '😵', text: "Dizziness can still occur, so be careful." },
            { emoji: '🍈', text: "Your breasts might be less tender but continue to grow." },
            { emoji: '😊', text: "You may be feeling more excited and less anxious as the risk of miscarriage has dropped." }
        ],
        symptoms: [
            { emoji: '🤕', text: "Headaches may still be an issue for some." },
            { emoji: '💧', text: "An increase in vaginal discharge is normal." },
            { emoji: '🎈', text: "You might still experience some bloating." },
            { emoji: '✨', text: "A noticeable decrease in nausea and fatigue." },
            { emoji: '🔥', text: "Heartburn might continue or start now." },
            { emoji: '🤧', text: "Nasal congestion (pregnancy rhinitis) can be bothersome." },
            { emoji: '😴', text: "You might find it easier to get a good night's sleep." },
            { emoji: '💖', text: "A growing sense of connection to the baby." }
        ],
        tips: [
            { emoji: '🏃‍♀️', text: "Now is a great time to establish a regular, safe exercise routine." },
            { emoji: '🗣️', text: "Share the exciting news with friends and family if you have not already!" },
            { emoji: '🥗', text: "Focus on a nutrient-rich diet to support the baby's rapid growth." },
            { emoji: '🧘‍♀️', text: "Continue with Kegel exercises to support your pelvic floor muscles." },
            { emoji: '🤰', text: "Look into prenatal classes in your area." },
            { emoji: '💬', text: "Start discussing your birth plan and preferences with your partner and doctor." },
            { emoji: '❤️', text: "Hearing the heartbeat for the first time is a magical moment—enjoy it!" },
            { emoji: '👶', text: "Start dreaming and planning for your new arrival. This is a joyful time!" }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/12-fetaldev-H-beige_4x3.jpg?width=396",
        aiHint: "plum fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/12-body-E-deeptan-4x3.png"
    },
    { 
        week: 13, 
        title: "Week 13: Welcome to the 2nd Trimester!", 
        size: "Your baby is the size of a peach.", 
        summary: "You've made it! The second trimester is often called the 'honeymoon' phase of pregnancy. Your baby has unique fingerprints now.",
        development: [
            { emoji: '🎉', text: "Welcome to the second trimester!" },
            { emoji: '👍', text: "Unique fingerprints have formed on the baby's tiny fingertips." },
            { emoji: '🍑', text: "The baby's body is starting to catch up to its large head in size." },
            { emoji: '👶', text: "The intestines have moved completely into the baby's abdomen." },
            { emoji: '🦴', text: "Bones are hardening, and the skeleton is becoming more defined." },
            { emoji: '💧', text: "The baby is practicing breathing by moving amniotic fluid in and out of the lungs." },
            { emoji: '👂', text: "The ears are now in their correct position, and the baby may be able to hear sounds." },
            { emoji: '🌸', text: "If you're having a girl, her ovaries now contain millions of eggs." }
        ],
        bodyChanges: [
            { emoji: '✨', text: "You may truly feel the 'pregnancy glow' as early symptoms fade." },
            { emoji: '⚡', text: "Energy levels are typically at their best during the second trimester." },
            { emoji: '🤰', text: "Your baby bump is likely becoming more apparent." },
            { emoji: '❤️', text: "Your libido may increase as you feel more energetic and less nauseous." },
            { emoji: '🍈', text: "Your breasts are less tender but continue to prepare for breastfeeding." },
            { emoji: '💧', text: "Vaginal discharge may increase." },
            { emoji: '👖', text: "You will likely need maternity clothes now if you have not already switched." },
            { emoji: '😊', text: "This is often a period of emotional well-being and excitement." }
        ],
        symptoms: [
            { emoji: '✨', text: "A significant decrease in nausea and fatigue for most." },
            { emoji: '⚡', text: "Increased energy and a general sense of well-being." },
            { emoji: '😖', text: "Round ligament pain may continue as your uterus expands." },
            { emoji: '🔥', text: "Heartburn can still be an issue." },
            { emoji: '😵', text: "Some dizziness may persist." },
            { emoji: '🤕', text: "Headaches are still possible." },
            { emoji: '🎈', text: "Constipation can be a problem due to hormones slowing digestion." },
            { emoji: '👃', text: "You may still have a stuffy nose." }
        ],
        tips: [
            { emoji: '🎉', text: "Enjoy this 'honeymoon' phase of pregnancy!" },
            { emoji: '🏃‍♀️', text: "Take advantage of your increased energy to stay active." },
            { emoji: '🥗', text: "Focus on a diet rich in protein, calcium, and iron for baby's growth." },
            { emoji: '🗣️', text: "This is a good time to start telling colleagues about your pregnancy." },
            { emoji: '🤰', text: "Start moisturizing your belly, hips, and thighs to help with stretching skin." },
            { emoji: '👶', text: "Start planning the nursery and thinking about what you'll need." },
            { emoji: '✈️', text: "The second trimester is often the best time for a 'babymoon' trip." },
            { emoji: '❤️', text: "Connect with your baby by talking or singing to your bump." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2025/03/13-fetaldev-G-warmbeige_4x3.jpg?width=396",
        aiHint: "peach fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2024/08/13-body-E-deeptan-4x3.png"
    },
    { 
        week: 14, 
        title: "Week 14: Baby's First Expressions", 
        size: "Your baby is the size of a lemon.", 
        summary: "Your baby can now make facial expressions like squinting and frowning! They are also growing fine, downy hair called lanugo all over their body.",
        development: [
            { emoji: '😊', text: "The fetus can now squint, frown, and make other facial expressions." },
            { emoji: '🍑', text: "Lanugo, a fine, downy hair, covers the body to keep your baby warm." },
            { emoji: '💪', text: "The neck is getting longer, and the chin is more prominent." },
            { emoji: '🩸', text: "The spleen begins producing red blood cells." },
            { emoji: '🤸', text: "Movements are becoming more coordinated, though still too slight for you to feel." },
            { emoji: '👂', text: "Your baby can hear sounds from outside the womb, like your voice." },
            { emoji: '💧', text: "The baby is urinating into the amniotic fluid." },
            { emoji: '⚙️', text: "The liver starts to produce bile, and the pancreas produces insulin." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your uterus is now above your pubic bone, making your bump more visible." },
            { emoji: '⚡', text: "You should be feeling more energetic and less nauseous." },
            { emoji: '😖', text: "Round ligament pain, a sharp pain in the abdomen, is common as the uterus grows." },
            { emoji: '✨', text: "You may notice your hair looking thicker and shinier." },
            { emoji: '❤️', text: "Your heart is working 20% harder to pump extra blood." },
            { emoji: '👃', text: "Nasal congestion and even nosebleeds can occur due to increased blood flow." },
            { emoji: '🍈', text: "Your breasts continue to enlarge, and areolas may darken further." },
            { emoji: '😊', text: "Emotionally, this is often a very happy and stable time in pregnancy." }
        ],
        symptoms: [
            { emoji: '⚡', text: "Increased energy levels." },
            { emoji: '📈', text: "A noticeable increase in appetite." },
            { emoji: '😖', text: "Sharp, pulling pains in your abdomen (round ligament pain)." },
            { emoji: '👃', text: "A stuffy nose or occasional nosebleeds." },
            { emoji: '✨', text: "Thicker, more lustrous hair." },
            { emoji: '🔥', text: "Heartburn and indigestion may continue." },
            { emoji: '🩸', text: "Varicose veins may start to appear on your legs." },
            { emoji: '💧', text: "Increased vaginal discharge." }
        ],
        tips: [
            { emoji: '🗣️', text: "Talk, sing, or read to your baby. They can hear you now!" },
            { emoji: '🏃‍♀️', text: "Continue with safe exercises. Prenatal yoga and swimming are great options." },
            { emoji: '🥗', text: "Satisfy your increased appetite with healthy, nutrient-dense snacks." },
            { emoji: '👖', text: "Invest in some comfortable and stylish maternity clothes." },
            { emoji: '💧', text: "Drink plenty of water to help with constipation and stay hydrated." },
            { emoji: '🦷', text: "Keep up with good dental hygiene as gums can be sensitive." },
            { emoji: '👩‍⚕️', text: "Ask your doctor about the Quad Screen test, offered between weeks 15 and 20." },
            { emoji: '❤️', text: "Enjoy this time. The second trimester is often the most comfortable." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/14-fetaldev-E-deeptan-4x3.png",
        aiHint: "lemon fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/14-body-E-deeptan_4x3.jpg?width=300"
    },
    { 
        week: 15, 
        title: "Week 15: Seeing Light", 
        size: "Your baby is the size of an apple.", 
        summary: "Even with sealed eyelids, your baby can now sense light. Their taste buds are forming, and bones are getting harder.",
        development: [
            { emoji: '💡', text: "The baby can sense light through their fused eyelids." },
            { emoji: '👅', text: "Taste buds are forming on the tongue." },
            { emoji: '🦴', text: "The bones are continuing to ossify and harden." },
            { emoji: '🦵', text: "The baby's legs are now longer than its arms." },
            { emoji: '🤸', text: "The baby is very active, twisting, turning, and kicking." },
            { emoji: '👂', text: "The tiny bones in the middle ear are forming." },
            { emoji: '👶', text: "The proportions of the body are becoming more human-like." },
            { emoji: '💪', text: "Your baby is developing a strong grip." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your baby bump is growing more prominent." },
            { emoji: '❤️', text: "Your total blood volume has increased significantly." },
            { emoji: '👃', text: "Nasal congestion might lead to snoring at night." },
            { emoji: '✨', text: "You might see skin changes like the 'mask of pregnancy' (chloasma)." },
            { emoji: '😖', text: "Lower back pain may start as your posture shifts." },
            { emoji: '🧠', text: "'Pregnancy brain' or forgetfulness can be a real thing!" },
            { emoji: '⚖️', text: "You will likely be gaining about a pound per week now." },
            { emoji: '🍈', text: "Your breasts are preparing for milk production." }
        ],
        symptoms: [
            { emoji: '👃', text: "Stuffy nose and occasional nosebleeds." },
            { emoji: '🎈', text: "Continued bloating and constipation." },
            { emoji: '🔥', text: "Heartburn and indigestion." },
            { emoji: '✨', text: "Skin darkening on your face, nipples, or abdomen." },
            { emoji: '😖', text: "Achy legs or the beginning of varicose veins." },
            { emoji: '😵', text: "Feeling dizzy or lightheaded at times." },
            { emoji: '💧', text: "Increased vaginal discharge." },
            { emoji: '😴', text: "Leg cramps, often at night." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Consider amniocentesis if it's recommended by your doctor, usually done between weeks 15 and 20." },
            { emoji: '😴', text: "Start sleeping on your side, preferably the left, to improve circulation." },
            { emoji: '👟', text: "Wear comfortable, low-heeled shoes to help with back pain." },
            { emoji: '🧘‍♀️', text: "Practice good posture to alleviate backaches." },
            { emoji: '☀️', text: "Wear sunscreen religiously to prevent chloasma from darkening." },
            { emoji: '🥗', text: "Eat fiber-rich foods to combat constipation." },
            { emoji: '🗣️', text: "Start researching childbirth classes and hospital tours." },
            { emoji: '❤️', text: "Enjoy feeling your energy. This is a great time to tackle projects." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/15-fetaldev-E-deeptan-4x3.png",
        aiHint: "apple fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/15-body-E-deeptan_4x3.jpg?width=300"
    },
    { 
        week: 16, 
        title: "Week 16: Growth Spurt", 
        size: "Your baby is the size of an avocado.", 
        summary: "Your baby is undergoing a major growth spurt. Their eyes and ears are now in their final positions, and their heart is pumping about 25 quarts of blood a day.",
        development: [
            { emoji: '📈', text: "A major growth spurt is happening this week." },
            { emoji: '👁️', text: "The eyes are in their final position and can make small side-to-side movements." },
            { emoji: '👂', text: "The ears are also in their correct place, making the face look more defined." },
            { emoji: '❤️', text: "The heart is pumping about 25 quarts of blood each day." },
            { emoji: '💪', text: "The baby's head is more erect, and the neck is stronger." },
            { emoji: '🤸', text: "Movements are becoming stronger and more coordinated." },
            { emoji: '👶', text: "The nervous system is developing, allowing for more complex movements." },
            { emoji: '💅', text: "Toenails are beginning to form." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your growing bump is becoming undeniable." },
            { emoji: '✨', text: "You may start to feel the first flutters of movement, called 'quickening'." },
            { emoji: '🍈', text: "Your breasts are growing, and the areolas may be larger and darker." },
            { emoji: '📈', text: "Your appetite is likely strong to fuel this growth spurt." },
            { emoji: '💧', text: "You continue to have more blood circulating in your body." },
            { emoji: '😖', text: "Backaches may become more common." },
            { emoji: '✨', text: "Your skin might be glowing, but you could also have some breakouts." },
            { emoji: '⚖️', text: "Steady weight gain of about one pound per week is normal." }
        ],
        symptoms: [
            { emoji: '✨', text: "First fetal movements (quickening), which can feel like gas or flutters." },
            { emoji: '😫', text: "Backaches from your growing uterus and shifting center of gravity." },
            { emoji: '🧠', text: "Forgetfulness or 'pregnancy brain' might be noticeable." },
            { emoji: '🎈', text: "Constipation can be an ongoing issue." },
            { emoji: '👁️', text: "Your eyes may feel dry or sensitive to light." },
            { emoji: '🩸', text: "Varicose veins and hemorrhoids can appear." },
            { emoji: '🍈', text: "Breasts may occasionally leak a small amount of colostrum." },
            { emoji: '❤️', text: "Increased appetite." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Your mid-pregnancy ultrasound, the anatomy scan, is usually scheduled between weeks 18 and 22." },
            { emoji: '🗣️', text: "If you feel flutters, make a note of it! It's an exciting milestone." },
            { emoji: '🧘‍♀️', text: "Be mindful of your posture. Stand and sit up straight to minimize back pain." },
            { emoji: '😴', text: "Use pillows to support your back and belly while sleeping." },
            { emoji: '🥗', text: "Continue eating a healthy, balanced diet. Don't forget your prenatal vitamins." },
            { emoji: '💧', text: "Keep drinking plenty of water." },
            { emoji: '❤️', text: "Your partner might be able to hear the baby’s heartbeat by placing an ear on your belly soon." },
            { emoji: '👶', text: "Start thinking about whether you want to find out the baby’s sex at the anatomy scan." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/16-fetaldev-E-deeptan-4x3.png",
        aiHint: "avocado fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/16-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 17,
        title: "Week 17: Fat Stores Develop",
        size: "Your baby is the size of a turnip.",
        summary: "Your baby is now developing adipose tissue, or fat, which will help regulate body temperature after birth. The placenta is also growing to keep up with the baby's needs.",
        development: [
            { emoji: '🌡️', text: "Fat stores (adipose tissue) are beginning to accumulate under the skin." },
            { emoji: '탯', text: "The umbilical cord is growing stronger and thicker." },
            { emoji: '👣', text: "The baby can now coordinate its sucking and swallowing reflexes." },
            { emoji: '🤸', text: "Kicks and punches are getting stronger." },
            { emoji: '👂', text: "The baby is more sensitive to sound now." },
            { emoji: '❤️', text: "The heartbeat is now regulated by the brain and is more consistent." },
            { emoji: '🦴', text: "The skeleton is transforming from soft cartilage to bone." },
            { emoji: '💧', text: "The amniotic fluid is being replenished by the baby urinating." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your baby bump is growing steadily." },
            { emoji: '📈', text: "Rapid weight gain continues, about 1-2 pounds per week." },
            { emoji: '✨', text: "Your skin might be itchy as it stretches over your abdomen and breasts." },
            { emoji: '💧', text: "Increased body fluids can lead to swelling in your hands and feet." },
            { emoji: '🔥', text: "Heartburn and indigestion are common as your uterus presses on your stomach." },
            { emoji: '❤️', text: "You might feel your heart beating faster at times." },
            { emoji: '🍈', text: "Your breasts are preparing for milk production." },
            { emoji: '😅', text: "You might find yourself sweating more than usual." }
        ],
        symptoms: [
            { emoji: '✨', text: "Feeling the baby move is becoming more common." },
            { emoji: '😖', text: "Achy back, hips, and pelvis." },
            { emoji: '🎈', text: "Gas, bloating, and constipation." },
            { emoji: '🔥', text: "Heartburn after meals." },
            { emoji: '💧', text: "Slight swelling in your extremities." },
            { emoji: '✨', text: "Itchy skin, especially on your belly." },
            { emoji: '😴', text: "Leg cramps, often at night." },
            { emoji: '🧠', text: "Continued forgetfulness or 'pregnancy brain'." }
        ],
        tips: [
            { emoji: '🤰', text: "Moisturize your belly daily to help with itchiness and potentially reduce stretch marks." },
            { emoji: '👟', text: "Wear comfortable shoes and elevate your feet to reduce swelling." },
            { emoji: '😴', text: "Sleep on your left side to maximize blood flow to the baby." },
            { emoji: '🧘‍♀️', text: "Consider seeing a chiropractor who specializes in prenatal care for back pain." },
            { emoji: '🥗', text: "Avoid spicy or greasy foods to minimize heartburn." },
            { emoji: '💧', text: "Drink lots of water to help with swelling and constipation." },
            { emoji: '🗣️', text: "Start conversations about your parenting styles and values with your partner." },
            { emoji: '❤️', text: "Enjoy feeling your baby move and respond to your voice." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/17-fetaldev-E-deeptan-4x3.png",
        aiHint: "turnip vegetable",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/17-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 18,
        title: "Week 18: A Unique Identity",
        size: "Your baby is the size of a sweet potato.",
        summary: "Your baby's nervous system is maturing, and a substance called myelin is beginning to form around the nerves. You'll likely have your anatomy scan ultrasound soon!",
        development: [
            { emoji: '🧠', text: "Myelin, a protective insulation, is forming around nerves." },
            { emoji: '👂', text: "The baby can hear and may be startled by loud noises." },
            { emoji: '🤸', text: "The baby is very active, doing flips and turns in the womb." },
            { emoji: '👍', text: "Unique fingerprints and footprints are now fully formed." },
            { emoji: '👁️', text: "The baby's eyes are facing forward rather than to the sides." },
            { emoji: '🌸', text: "If it's a girl, her uterus and fallopian tubes are formed and in place." },
            { emoji: '🍆', text: "If it's a boy, his genitals are distinct and may be seen on an ultrasound." },
            { emoji: '💪', text: "The baby is practicing breathing movements." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your bump is getting bigger, and your center of gravity is shifting." },
            { emoji: '✨', text: "You may be feeling the baby move more regularly now." },
            { emoji: '😖', text: "Backaches are a common complaint." },
            { emoji: '😵', text: "Low blood pressure can cause dizziness, so stand up slowly." },
            { emoji: '📈', text: "Your appetite is likely hearty." },
            { emoji: '😴', text: "You might have trouble finding a comfortable sleeping position." },
            { emoji: '💧', text: "Some swelling in your feet and ankles is normal." },
            { emoji: '😊', text: "You are likely feeling emotionally well and connected to your baby." }
        ],
        symptoms: [
            { emoji: '✨', text: "More distinct baby movements." },
            { emoji: '😫', text: "Persistent backaches." },
            { emoji: '😴', text: "Difficulty sleeping." },
            { emoji: '😵', text: "Dizziness or lightheadedness." },
            { emoji: '💧', text: "Swollen feet and ankles." },
            { emoji: '🎈', text: "Indigestion and constipation." },
            { emoji: '🩸', text: "Hemorrhoids or varicose veins." },
            { emoji: '❤️', text: "A strong appetite." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Get ready for your mid-pregnancy ultrasound! Decide if you want to find out the gender." },
            { emoji: '😴', text: "A pregnancy pillow can be a lifesaver for getting comfortable at night." },
            { emoji: '👟', text: "Avoid standing for long periods to help with swelling and back pain." },
            { emoji: '🧘‍♀️', text: "Stretching can help alleviate aches and pains." },
            { emoji: '🥗', text: "Eat smaller, more frequent meals to help with indigestion." },
            { emoji: '💧', text: "Continue to drink plenty of water." },
            { emoji: '❤️', text: "Your partner might be able to hear the baby’s heartbeat by placing an ear on your belly soon." },
            { emoji: '👶', text: "Start thinking about whether you want to find out the baby’s sex at the anatomy scan." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/18-fetaldev-E-deeptan-4x3.png",
        aiHint: "sweet potato",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/18-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 19,
        title: "Week 19: Sensory Development",
        size: "Your baby is the size of a mango.",
        summary: "Your baby's senses—smell, sight, taste, touch, and hearing—are developing. A waxy coating called vernix caseosa begins to form on their skin.",
        development: [
            { emoji: '🧠', text: "The areas of the brain responsible for the senses are developing." },
            { emoji: '✨', text: "Vernix caseosa, a waxy coating, forms to protect the skin from amniotic fluid." },
            { emoji: '💪', text: "Arm and leg proportions are now even and more baby-like." },
            { emoji: '🤸', text: "You may be feeling kicks and punches more strongly now." },
            { emoji: '🌸', text: "A girl's ovaries contain about 6 million eggs at this point." },
            { emoji: '🦷', text: "The permanent teeth buds are forming behind the baby teeth buds." },
            { emoji: '🍑', text: "Lanugo, the fine hair, now covers the entire body." },
            { emoji: '👂', text: "The baby can definitely hear and recognize your voice." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your belly is expanding, and you likely look pregnant to others." },
            { emoji: '✨', text: "The linea nigra, the dark line on your abdomen, may be more pronounced." },
            { emoji: '😖', text: "You might experience sharp pains in your lower abdomen (round ligament pain)." },
            { emoji: '😵', text: "Dizziness can still be an issue." },
            { emoji: '❤️', text: "You might feel palpitations as your heart works hard." },
            { emoji: '🎈', text: "Your growing uterus can put pressure on your lungs, causing slight breathlessness." },
            { emoji: '🦵', text: "Leg cramps are common, especially at night." },
            { emoji: '😊', text: "Feeling the baby move can be a source of great joy and connection." }
        ],
        symptoms: [
            { emoji: '😖', text: "Round ligament pain." },
            { emoji: '😵', text: "Dizziness and lightheadedness." },
            { emoji: '😫', text: "Hip and pelvic pain." },
            { emoji: '🦵', text: "Leg cramps." },
            { emoji: '🔥', text: "Heartburn and indigestion." },
            { emoji: '🎈', text: "Constipation." },
            { emoji: '✨', text: "Skin changes, including darkening of the skin." },
            { emoji: '😴', text: "Difficulty finding a comfortable sleeping position." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Make sure your anatomy scan is scheduled for sometime between now and week 22." },
            { emoji: '🧘‍♀️', text: "Prenatal yoga can be excellent for relieving hip and back pain." },
            { emoji: '🍌', text: "Eat potassium-rich foods like bananas to help prevent leg cramps." },
            { emoji: '😴', text: "Use plenty of pillows to support your body in bed." },
            { emoji: '💧', text: "Drink water consistently throughout the day." },
            { emoji: '🗣️', text: "Start looking into childcare options if you’ll need them after the baby arrives." },
            { emoji: '❤️', text: "Take time to bond with your baby by noticing their movement patterns." },
            { emoji: '🤰', text: "Consider taking a prenatal class to learn about labor and delivery." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/19-fetaldev-E-deeptan-4x3.png",
        aiHint: "mango fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/19-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 20,
        title: "Week 20: Halfway There!",
        size: "Your baby is the size of a banana.",
        summary: "Congratulations, you're at the halfway point! Your baby is swallowing more, which is good practice for their digestive system.",
        development: [
            { emoji: '🎉', text: "You're halfway through your pregnancy!" },
            { emoji: '💧', text: "The baby is swallowing more amniotic fluid, which aids digestive system development." },
            { emoji: '💩', text: "The baby is producing meconium, the dark, sticky substance that will be their first bowel movement." },
            { emoji: '👂', text: "Your baby's hearing is well-established." },
            { emoji: '💪', text: "Kicks and punches are becoming more frequent and stronger." },
            { emoji: '🧠', text: "The nervous system is maturing rapidly." },
            { emoji: '🌸', text: "A girl's uterus is now fully formed." },
            { emoji: '✨', text: "The skin is getting thicker and developing more layers." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your uterus is now at the level of your belly button." },
            { emoji: '✨', text: "You can most likely feel your baby move every day." },
            { emoji: '📈', text: "Your weight gain should be steady." },
            { emoji: '😴', text: "Sleep may become more challenging." },
            { emoji: '😮‍💨', text: "You might feel short of breath as your uterus presses on your diaphragm." },
            { emoji: '🍈', text: "Your breasts might start leaking small amounts of colostrum." },
            { emoji: '✨', text: "Your belly button may flatten or even pop out." },
            { emoji: '😊', text: "Feeling good overall is common at this stage." }
        ],
        symptoms: [
            { emoji: '😮‍💨', text: "Shortness of breath." },
            { emoji: '🔥', text: "Heartburn and indigestion." },
            { emoji: '💧', text: "Swelling in hands and feet." },
            { emoji: '😫', text: "Lower back pain." },
            { emoji: '🦵', text: "Leg cramps." },
            { emoji: '🎈', text: "Constipation." },
            { emoji: '🍈', text: "Leaky breasts." },
            { emoji: '⚡', text: "A good amount of energy." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "The anatomy scan is a big milestone. Enjoy seeing your baby in detail!" },
            { emoji: '🗣️', text: "Start talking to your baby regularly." },
            { emoji: '😴', text: "Invest in a good pregnancy pillow if you have not already." },
            { emoji: '🧘‍♀️', text: "Practice good posture to help with back pain." },
            { emoji: '👶', text: "Start creating your baby registry." },
            { emoji: '🏥', text: "Sign up for a hospital tour and childbirth education classes." },
            { emoji: '🥗', text: "Ensure you are getting plenty of iron to prevent anemia." },
            { emoji: '❤️', text: "Celebrate this halfway mark with your partner!" }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/20-fetaldev-E-deeptan-4x3.png",
        aiHint: "banana fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/20-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 21,
        title: "Week 21: A Gourmet in the Making",
        size: "Your baby is the size of a carrot.",
        summary: "Your baby's taste buds are developed enough that they can now taste the flavors from the foods you eat, which pass into the amniotic fluid.",
        development: [
            { emoji: '👅', text: "Baby can now taste different flavors from the amniotic fluid." },
            { emoji: '💧', text: "The amniotic fluid is a complex substance containing hormones, nutrients, and antibodies." },
            { emoji: '💪', text: "Movements are becoming more purposeful." },
            { emoji: '❤️', text: "The bone marrow has taken over from the liver and spleen in producing blood cells." },
            { emoji: '👁️', text: "Eyelids and eyebrows are well-defined." },
            { emoji: '🧠', text: "The digestive system is practicing for life outside the womb." },
            { emoji: '🤸', text: "You'll likely feel kicks and punches more regularly." },
            { emoji: '⚖️', text: "The baby is gaining weight steadily." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your baby bump is growing, and you are clearly looking pregnant." },
            { emoji: '✨', text: "Stretch marks may start to appear on your abdomen, breasts, and thighs." },
            { emoji: '🍈', text: "Your breasts continue to get larger." },
            { emoji: '😖', text: "Your expanding uterus can cause aches and pains in your back and hips." },
            { emoji: '💧', text: "Ankles and feet may be more swollen, especially at the end of the day." },
            { emoji: '🔥', text: "Heartburn is a common complaint." },
            { emoji: '❤️', text: "Your heart is working hard, and you may feel it beating faster." },
            { emoji: '😊', text: "You are likely feeling happy and excited." }
        ],
        symptoms: [
            { emoji: '✨', text: "Stronger and more regular fetal movements." },
            { emoji: '🔥', text: "Heartburn and indigestion." },
            { emoji: '✨', text: "Appearance of stretch marks." },
            { emoji: '🩸', text: "Varicose veins." },
            { emoji: '😫', text: "Backaches." },
            { emoji: '💧', text: "Swollen feet and ankles." },
            { emoji: '🎈', text: "Constipation." },
            { emoji: '😖', text: "You might feel your first Braxton Hicks contractions (practice contractions)." }
        ],
        tips: [
            { emoji: '🥗', text: "Eat a variety of healthy foods to introduce your baby to different flavors." },
            { emoji: '🤰', text: "Use cocoa butter or other moisturizers to soothe itchy, stretching skin." },
            { emoji: '🧘‍♀️', text: "Gentle stretching can help with aches and pains." },
            { emoji: '👟', text: "Elevate your feet whenever possible to reduce swelling." },
            { emoji: '💧', text: "Drink plenty of water to stay hydrated and help prevent Braxton Hicks." },
            { emoji: '👩‍⚕️', text: "Ask your doctor about the glucose screening test, which usually happens between weeks 24 and 28." },
            { emoji: '🗣️', text: "Start thinking about your support system for after the baby is born." },
            { emoji: '❤️', text: "Enjoy feeling your baby move and respond to your voice." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/21-fetaldev-E-deeptan-4x3.png",
        aiHint: "carrot vegetable",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/21-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 22,
        title: "Week 22: Looking Like a Mini Newborn",
        size: "Your baby is the size of a spaghetti squash.",
        summary: "Your baby now resembles a miniature newborn. Their lips, eyelids, and eyebrows are more distinct, and they are developing a sense of touch.",
        development: [
            { emoji: '👶', text: "The baby looks like a miniature newborn." },
            { emoji: '👁️', text: "Eyes are developed, but the irises still lack pigment." },
            { emoji: '🧠', text: "The brain is continuing its rapid growth." },
            { emoji: '🖐️', text: "The baby can now perceive touch and may explore its face and the umbilical cord." },
            { emoji: '👂', text: "Hearing is becoming more acute." },
            { emoji: '💪', text: "The grip is getting stronger." },
            { emoji: '🦷', text: "Tooth buds for permanent teeth are developing." },
            { emoji: '⚖️', text: "Your baby weighs almost a pound now." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your baby bump is growing upwards, and your belly button may pop out." },
            { emoji: '✨', text: "Feeling the baby kick is a daily occurrence now." },
            { emoji: '😖', text: "Back pain is very common at this stage." },
            { emoji: '💧', text: "Swelling in your hands and feet might be more noticeable." },
            { emoji: '🔥', text: "Heartburn and indigestion can be frequent." },
            { emoji: '😮‍💨', text: "You may feel more out of breath." },
            { emoji: '❤️', text: "Your libido might still be high." },
            { emoji: '😊', text: "You might feel a mix of excitement and nervousness about the future." }
        ],
        symptoms: [
            { emoji: '✨', text: "Regular fetal movements." },
            { emoji: '😫', text: "Backaches." },
            { emoji: '💧', text: "Swelling of feet, ankles, and hands." },
            { emoji: '✨', text: "Stretch marks." },
            { emoji: '🔥', text: "Heartburn." },
            { emoji: '😮‍💨', text: "Shortness of breath." },
            { emoji: '🎈', text: "Constipation." },
            { emoji: '😖', text: "Occasional Braxton Hicks contractions." }
        ],
        tips: [
            { emoji: '👨‍🏫', text: "Sign up for childbirth education classes if you have not already." },
            { emoji: '🧘‍♀️', text: "A support belt can help alleviate back and pelvic pain." },
            { emoji: '😴', text: "Take rests during the day if you can." },
            { emoji: '💧', text: "Stay hydrated to help with swelling." },
            { emoji: '🥗', text: "Eat small, frequent meals to manage heartburn." },
            { emoji: '🗣️', text: "Have your partner talk to your belly so the baby can get to know their voice too." },
            { emoji: '👶', text: "Start finalizing your baby registry." },
            { emoji: '❤️', text: "Take weekly bump photos to document your amazing journey." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/22-fetaldev-E-deeptan-4x3.png",
        aiHint: "spaghetti squash",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/22-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 23,
        title: "Week 23: Viability Milestone",
        size: "Your baby is the size of a large mango.",
        summary: "This is a major milestone: your baby is now considered viable, meaning they could potentially survive outside the womb with intensive medical care. Hearing is also becoming more acute.",
        development: [
            { emoji: '🎉', text: "The baby has reached the age of viability." },
            { emoji: '👂', text: "Hearing is improving, and the baby may react to familiar sounds." },
            { emoji: '🫁', text: "The lungs are developing surfactant, a substance crucial for breathing after birth." },
            { emoji: '🩸', text: "Blood vessels in the lungs are developing." },
            { emoji: '🤸', text: "Movements are becoming more vigorous." },
            { emoji: '👁️', text: "The baby's eyes can now move rapidly." },
            { emoji: '✨', text: "The skin is still translucent but is getting less so as fat develops." },
            { emoji: '⚖️', text: "The baby weighs just over a pound." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your fundal height (top of your uterus) is now above your belly button." },
            { emoji: '✨', text: "Others can likely feel the baby kick by placing a hand on your belly." },
            { emoji: '😖', text: "Backaches and pelvic pressure are common." },
            { emoji: '💧', text: "Swelling can be an issue." },
            { emoji: '🎈', text: "Your growing uterus puts pressure on your bladder and intestines." },
            { emoji: '✨', text: "The linea nigra may be quite dark now." },
            { emoji: '😴', text: "Finding a comfortable sleep position is getting harder." },
            { emoji: '❤️', text: "You are deeply bonded with your baby now." }
        ],
        symptoms: [
            { emoji: '✨', text: "Strong and frequent baby kicks." },
            { emoji: '😫', text: "Backaches." },
            { emoji: '💧', text: "Swollen ankles and feet." },
            { emoji: '😖', text: "Practice contractions (Braxton Hicks)." },
            { emoji: '🎈', text: "Bloating and constipation." },
             { emoji: '🤧', text: "Snoring due to nasal congestion." },
            { emoji: '🧠', text: "Forgetfulness." },
            { emoji: '🔥', text: "Heartburn." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Talk to your doctor about the signs of preterm labor, just to be informed." },
            { emoji: '💧', text: "Drink at least 8-10 glasses of water a day. It helps with many symptoms." },
            { emoji: '😴', text: "Lie on your left side to improve blood flow." },
            { emoji: '🧘‍♀️', text: "A warm bath can help soothe aches and pains." },
            { emoji: '🥗', text: "Eat a diet rich in omega-3 fatty acids for baby’s brain development." },
            { emoji: '🗣️', text: "Finalize your hospital or birth center tour." },
            { emoji: '👶', text: "Start thinking about a pediatrician for your baby." },
            { emoji: '❤️', text: "Enjoy the kicks and wiggles—it’s a special connection." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/23-fetaldev-E-deeptan-4x3.png",
        aiHint: "large mango",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/23-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 24,
        title: "Week 24: Lung Development",
        size: "Your baby is the size of a cantaloupe.",
        summary: "Your baby's lungs are developing branches of the respiratory tree as well as cells that produce surfactant. This is a crucial step for breathing after birth.",
        development: [
            { emoji: '🫁', text: "The lungs are developing surfactant, a substance that helps air sacs inflate." },
            { emoji: '👶', text: "The baby has a lean appearance but is starting to fill out with fat." },
            { emoji: '👂', text: "The inner ear is fully developed, controlling balance." },
            { emoji: '🧠', text: "The brain continues to grow and mature." },
            { emoji: '👁️', text: "The eyes are fully developed." },
            { emoji: '✨', text: "The skin is still thin and translucent." },
            { emoji: '🤸', text: "The baby has a regular sleep-wake cycle." },
            { emoji: '⚖️', text: "The baby is gaining about 6 ounces a week now." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your bump is growing noticeably each week." },
            { emoji: '✨', text: "The top of your uterus is an inch or two above your belly button." },
            { emoji: '💧', text: "Swelling might increase." },
            { emoji: '😖', text: "Backaches are common." },
            { emoji: '✨', text: "Your skin may be itchy and dry." },
            { emoji: '😴', text: "Getting a full night of comfortable sleep is a challenge." },
            { emoji: '❤️', text: "You might be feeling more emotionally sensitive." },
            { emoji: '🎈', text: "Your belly button might be officially an 'outie'." }
        ],
        symptoms: [
            { emoji: '😫', text: "Back pain." },
            { emoji: '💧', text: "Swelling." },
            { emoji: '✨', text: "Itchy abdomen." },
            { emoji: '😖', text: "Practice contractions." },
            { emoji: '🎈', text: "Constipation." },
            { emoji: '😵', text: "Dizziness." },
            { emoji: '🦵', text: "Leg cramps." },
            { emoji: '🔥', text: "Heartburn." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Your glucose screening test is usually done between now and week 28." },
            { emoji: '💧', text: "Keep drinking plenty of water." },
            { emoji: '🧘‍♀️', text: "Do gentle stretches to relieve back pain." },
            { emoji: '😴', text: "Take naps when you can." },
            { emoji: '🗣️', text: "Talk to your doctor about any concerns you have." },
            { emoji: '👶', text: "Start shopping for baby essentials." },
            { emoji: '❤️', text: "Have your partner feel for kicks and movements." },
            { emoji: '🚗', text: "Research and install your baby’s car seat." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/24-fetaldev-E-deeptan-4x3.png",
        aiHint: "cantaloupe melon",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/24-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 25,
        title: "Week 25: Hair and Color",
        size: "Your baby is the size of a head of cauliflower.",
        summary: "Your baby is not only growing hair, but it's also developing its color and texture. They are also starting to add more body fat, making them look less wrinkly.",
        development: [
            { emoji: '🧑‍🦰', text: "Hair is growing and developing its color and texture." },
            { emoji: '🌡️', text: "The baby is plumping up with more fat, which helps with temperature regulation." },
            { emoji: '👃', text: "Nostrils are opening, and the baby is practicing breathing." },
            { emoji: '🩸', text: "Capillaries are forming, giving the skin a pinker hue." },
            { emoji: '👂', text: "The baby can hear and may respond to your voice with movement." },
            { emoji: '🖐️', text: "The baby can make a fist and has a strong grip." },
            { emoji: '🧠', text: "The brain is continuing its complex development." },
            { emoji: '🤸', text: "The baby is establishing a more regular pattern of activity and rest." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your uterus is now about the size of a soccer ball." },
            { emoji: '✨', text: "You may develop a 'waddle' as your hips loosen to prepare for birth." },
            { emoji: '😖', text: "Sciatic nerve pain (shooting pain down the back of your leg) can start." },
            { emoji: '😴', text: "You might find yourself getting tired more easily again." },
            { emoji: '🎈', text: "Constipation and hemorrhoids can be troublesome." },
            { emoji: '❤️', text: "You might feel more emotional as the due date gets closer." },
            { emoji: '✨', text: "Stretch marks are common." },
            { emoji: '😮‍💨', text: "Feeling out of breath is normal." }
        ],
        symptoms: [
            { emoji: '😫', text: "Back pain and sciatica." },
            { emoji: '😴', text: "Trouble sleeping." },
            { emoji: '🔥', text: "Heartburn." },
            { emoji: '🎈', text: "Hemorrhoids." },
            { emoji: '💧', text: "Swelling." },
            { emoji: '😮‍💨', text: "Shortness of breath." },
            { emoji: '😖', text: "Practice contractions." },
            { emoji: '✨', text: "Itchy skin." }
        ],
        tips: [
            { emoji: '🧘‍♀️', text: "Do pelvic tilts and gentle stretches to help with sciatica and back pain." },
            { emoji: '😴', text: "Use pillows strategically to find a more comfortable sleeping position." },
            { emoji: '🥗', text: "Eat plenty of fiber and drink lots of water to help with constipation." },
            { emoji: '👟', text: "Avoid long periods of sitting or standing." },
            { emoji: '🗣️', text: "Start writing down your birth plan." },
            { emoji: '👶', text: "Think about who you want in the delivery room with you." },
            { emoji: '❤️', text: "Let your partner and family help you more around the house." },
            { emoji: '👩‍⚕️', text: "Do not hesitate to call your doctor with any concerns." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/25-fetaldev-E-deeptan-4x3.png",
        aiHint: "cauliflower vegetable",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/25-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 26,
        title: "Week 26: Responding to Touch",
        size: "Your baby is the size of a head of lettuce.",
        summary: "Your baby's eyes are beginning to open and can respond to stimuli like touch. If you gently poke your belly, you might get a kick in response!",
        development: [
            { emoji: '👁️', text: "The eyes are starting to open and can detect light and dark." },
            { emoji: '🧠', text: "Brain wave activity for hearing and sight becomes active." },
            { emoji: '👂', text: "The baby will respond to sounds, and the heartbeat may quicken." },
            { emoji: '💪', text: "The baby is practicing inhaling and exhaling amniotic fluid." },
            { emoji: '✨', text: "The skin is becoming more opaque." },
            { emoji: '🤸', text: "The baby has coordinated movements and can respond to touch." },
            { emoji: '⚖️', text: "The baby is gaining weight steadily, now weighing about 2 pounds." },
            { emoji: '💅', text: "Nails now cover the fingertips." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your baby bump is a prominent feature now." },
            { emoji: '❤️', text: "Your blood pressure might be slightly higher than it was mid-pregnancy." },
            { emoji: '😖', text: "Backaches and pelvic pressure continue." },
            { emoji: '😴', text: "Sleep is often interrupted by bathroom trips and discomfort." },
            { emoji: '💧', text: "Swelling in your hands and feet is common." },
            { emoji: '✨', text: "You may be feeling a strong nesting instinct to prepare for the baby." },
            { emoji: '😮‍💨', text: "Feeling breathless is normal." },
            { emoji: '😊', text: "You might feel a mix of excitement and impatience." }
        ],
        symptoms: [
            { emoji: '😫', text: "Back pain." },
            { emoji: '😴', text: "Insomnia or difficulty sleeping." },
            { emoji: '💧', text: "Swelling." },
            { emoji: '🤕', text: "Headaches." },
            { emoji: '😖', text: "Practice contractions." },
            { emoji: '🧠', text: "Forgetfulness." },
            { emoji: '🎈', text: "Bloating and gas." },
            { emoji: '🔥', text: "Heartburn." }
        ],
        tips: [
            { emoji: '🖐️', text: "Gently press on your belly and see if the baby responds. It’s a fun way to interact!" },
            { emoji: '🗣️', text: "Finalize your birth plan and discuss it with your doctor or midwife." },
            { emoji: '😴', text: "Create a relaxing bedtime routine to help improve your sleep." },
            { emoji: '👩‍⚕️', text: "Know the difference between Braxton Hicks and real contractions." },
            { emoji: '🥗', text: "Eat smaller, more frequent meals to help with heartburn." },
            { emoji: '👟', text: "Keep your feet elevated when possible." },
            { emoji: '👶', text: "Take a breastfeeding or newborn care class." },
            { emoji: '❤️', text: "Make time for yourself to relax and de-stress." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/26-fetaldev-E-deeptan-4x3.png",
        aiHint: "head lettuce",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/26-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 27,
        title: "Week 27: Welcome to the Third Trimester!",
        size: "Your baby is the size of a rutabaga.",
        summary: "You've reached the final stretch! Your baby has a good chance of survival if born now. They are also practicing breathing and have a regular sleep-wake cycle.",
        development: [
            { emoji: '🎉', text: "Welcome to the third trimester!" },
            { emoji: '🫁', text: "The lungs are mature enough that the baby could survive with medical help if born now." },
            { emoji: '😴', text: "The baby has regular cycles of sleeping and waking." },
            { emoji: '🧠', text: "The brain is very active, with more grooves and indentations on the surface." },
            { emoji: '👁️', text: "The baby can open and close its eyes and may be able to see what’s going on inside the uterus." },
            { emoji: '👍', text: "The baby may be sucking its thumb." },
            { emoji: '⚖️', text: "The baby weighs about 2 pounds and is around 14.5 inches long." },
            { emoji: '🤸', text: "You can likely feel hiccups, which feel like rhythmic twitches." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your baby bump is growing quickly now." },
            { emoji: '😫', text: "You might feel more aches and pains as your body supports the extra weight." },
            { emoji: '😴', text: "Sleep is becoming increasingly difficult." },
            { emoji: '😮‍💨', text: "Shortness of breath is common." },
            { emoji: '💧', text: "Swelling is a persistent symptom for many." },
            { emoji: '❤️', text: "Your heart and circulatory system are working hard." },
            { emoji: '✨', text: "Nesting instincts might be in full force." },
            { emoji: '😊', text: "You are on the home stretch, which can bring a mix of emotions." }
        ],
        symptoms: [
            { emoji: '😫', text: "Backaches, pelvic pressure, and hip pain." },
            { emoji: '🦵', text: "Leg cramps and restless leg syndrome." },
            { emoji: '🎈', text: "Constipation and hemorrhoids." },
            { emoji: '🔥', text: "Heartburn." },
            { emoji: '💧', text: "Swelling." },
            { emoji: '😖', text: "More frequent Braxton Hicks contractions." },
            { emoji: '😴', text: "Fatigue may return." },
            { emoji: '✨', text: "Feeling the baby hiccup." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Your prenatal visits will likely become more frequent now, every two weeks." },
            { emoji: '🗣️', text: "Talk to your doctor about creating a birth plan." },
            { emoji: '👟', text: "Keep up with gentle exercise like walking, but listen to your body." },
            { emoji: '👶', text: "Start packing your hospital bag." },
            { emoji: '😴', text: "Sleep on your side with pillows for support." },
            { emoji: '💧', text: "Stay hydrated to help with swelling and contractions." },
            { emoji: '🏥', text: "If you have not, take a tour of the labor and delivery unit at your hospital." },
            { emoji: '❤️', text: "Take time to relax and connect with your partner before the baby arrives." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/27-fetaldev-E-deeptan-4x3.png",
        aiHint: "rutabaga vegetable",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/27-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 28,
        title: "Week 28: Eyes Wide Open",
        size: "Your baby is the size of an eggplant.",
        summary: "Your baby can now open their eyes and blink. They are also adding more fat and can likely perceive changes in light from outside the womb.",
        development: [
            { emoji: '👁️', text: "Baby can open and close their eyes and has eyelashes." },
            { emoji: '💡', text: "They can perceive light and may turn away from a bright light shone on your belly." },
            { emoji: '🧠', text: "The brain surface is becoming more grooved and complex." },
            { emoji: '😴', text: "The baby is likely dreaming, as indicated by rapid eye movement (REM) sleep." },
            { emoji: '🌡️', text: "Fat layers are continuing to build, plumping up your baby." },
            { emoji: '🫁', text: "The lungs are continuing to mature." },
            { emoji: '🤸', text: "The baby is very active, though space is getting tighter." },
            { emoji: '⚖️', text: "Your baby weighs about 2.5 pounds." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your uterus extends well above your belly button." },
            { emoji: '😖', text: "Aches and pains in your back, hips, and pelvis are common." },
            { emoji: '😴', text: "Finding a comfortable position for sleep is a major challenge." },
            { emoji: '💧', text: "You may have some swelling in your hands and feet." },
            { emoji: '❤️', text: "Your heart is working 50% harder than it did pre-pregnancy." },
            { emoji: '✨', text: "Stretch marks might be more prominent." },
            { emoji: '🍈', text: "Your breasts may be leaking colostrum." },
            { emoji: '😮‍💨', text: "Shortness of breath is normal." }
        ],
        symptoms: [
            { emoji: '😫', text: "General aches and pains." },
            { emoji: '😴', text: "Difficulty sleeping." },
            { emoji: '😮‍💨', text: "Shortness of breath." },
            { emoji: '🔥', text: "Heartburn." },
            { emoji: '🎈', text: "Constipation." },
            { emoji: '💧', text: "Swelling." },
            { emoji: '😖', text: "Practice contractions." },
            { emoji: '✨', text: "Itchy skin on your abdomen." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Ask your doctor about getting the Tdap vaccine to protect your baby from whooping cough." },
            { emoji: '👶', text: "Finalize your choice of pediatrician." },
            { emoji: '🧘‍♀️', text: "Continue with gentle exercises like prenatal yoga and swimming." },
            { emoji: '😴', text: "Use pillows to support your body and sleep on your left side." },
            { emoji: '🗣️', text: "Start tracking your baby's kicks to monitor their well-being." },
            { emoji: '🏥', text: "Make sure your hospital bag is mostly packed." },
            { emoji: '❤️', text: "Spend quality time with your partner." },
            { emoji: '🥗', text: "Eat plenty of protein, calcium, and iron." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/28-fetaldev-E-deeptan-4x3.png",
        aiHint: "eggplant vegetable",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/28-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 29,
        title: "Week 29: Getting Snug",
        size: "Your baby is the size of a butternut squash.",
        summary: "Space is getting tight in the womb, but your baby is still active. Their bones are absorbing lots of calcium, so be sure to get enough in your diet.",
        development: [
            { emoji: '🦴', text: "The baby’s skeleton is hardening, and they are absorbing a lot of calcium from you." },
            { emoji: '💪', text: "Muscles and lungs are continuing to mature." },
            { emoji: '🧠', text: "The brain is now able to help control body temperature." },
            { emoji: '🤸', text: "Kicks and jabs are strong and definite now." },
            { emoji: '⚖️', text: "The baby is gaining about half a pound per week." },
            { emoji: '👶', text: "The head is growing to make room for the developing brain." },
            { emoji: '✨', text: "The baby is accumulating more and more body fat." },
            { emoji: '👂', text: "The baby is listening to your voice and your heartbeat." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "You are gaining about a pound a week, with half of that going to the baby." },
            { emoji: '😫', text: "Aches and pains are a daily reality for many." },
            { emoji: '🔥', text: "Heartburn and constipation can be major annoyances." },
            { emoji: '😮‍💨', text: "You may feel out of breath just from walking across a room." },
            { emoji: '💧', text: "Swelling is common." },
            { emoji: '😴', text: "Good sleep is hard to come by." },
            { emoji: '🍈', text: "Your breasts might be leaky." },
            { emoji: '😊', text: "You are in the final countdown, which is exciting and a bit scary." }
        ],
        symptoms: [
            { emoji: '🔥', text: "Heartburn." },
            { emoji: '🎈', text: "Constipation and hemorrhoids." },
            { emoji: '😫', text: "Backaches and pelvic pain." },
            { emoji: '😮‍💨', text: "Shortness of breath." },
            { emoji: '😴', text: "Insomnia." },
            { emoji: '💧', text: "Swelling." },
            { emoji: '🧠', text: "Brain fog." },
            { emoji: '😖', text: "Practice contractions." }
        ],
        tips: [
            { emoji: '🥛', text: "Load up on calcium-rich foods like dairy, leafy greens, and almonds." },
            { emoji: '🧘‍♀️', text: "A maternity support belt can work wonders for back and pelvic pain." },
            { emoji: '😴', text: "Try to nap when you can to make up for lost sleep at night." },
            { emoji: '🗣️', text: "Talk to your baby; they can hear and are comforted by your voice." },
            { emoji: '👶', text: "Start washing baby clothes and setting up the nursery." },
            { emoji: '👩‍⚕️', text: "Learn the signs of preterm labor." },
            { emoji: '❤️', text: "Let your partner and family help you with chores." },
            { emoji: '💧', text: "Keep drinking plenty of water." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/29-fetaldev-E-deeptan-4x3.png",
        aiHint: "butternut squash",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/29-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 30,
        title: "Week 30: Seeing the World (in Red)",
        size: "Your baby is the size of a large cabbage.",
        summary: "Your baby's eyesight continues to develop. They can't see much, but they can perceive light and may even be able to follow a light source with their eyes.",
        development: [
            { emoji: '👁️', text: "The baby can see, and their vision is developing, though it’s blurry." },
            { emoji: '🧠', text: "The brain is growing, and the surface is becoming even more wrinkled." },
            { emoji: '🩸', text: "The bone marrow is now fully responsible for producing red blood cells." },
            { emoji: '🍑', text: "Lanugo, the fine body hair, is beginning to disappear." },
            { emoji: '⚖️', text: "Your baby weighs about 3 pounds now." },
            { emoji: '💪', text: "The baby’s grip is strong." },
            { emoji: '😴', text: "The baby has distinct sleep and wake cycles." },
            { emoji: '✨', text: "More fat is accumulating, making the baby look plumper." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your baby bump is growing high and might be making you feel breathless." },
            { emoji: '😫', text: "You are likely feeling tired and achy." },
            { emoji: '😴', text: "Sleep is probably a fond, distant memory." },
            { emoji: '🔥', text: "Heartburn can be very intense now." },
            { emoji: '💧', text: "Swelling in your feet and ankles is to be expected." },
            { emoji: '🎢', text: "Mood swings can return as you deal with discomfort and anticipation." },
            { emoji: '✨', text: "Your nesting instinct might be urging you to clean and organize everything." },
            { emoji: '❤️', text: "Feeling the baby move is a constant, reassuring presence." }
        ],
        symptoms: [
            { emoji: '😴', text: "Fatigue and difficulty sleeping." },
            { emoji: '😫', text: "Backaches." },
            { emoji: '😮‍💨', text: "Shortness of breath." },
            { emoji: '🔥', text: "Intense heartburn." },
            { emoji: '💧', text: "Swelling." },
            { emoji: '😖', text: "More frequent practice contractions." },
            { emoji: '✨', text: "Itchy skin." },
            { emoji: '🎢', text: "Moodiness and impatience." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Discuss any concerns about labor and delivery with your doctor." },
            { emoji: '😴', text: "Take short breaks to rest and put your feet up throughout the day." },
            { emoji: '🧘‍♀️', text: "Gentle stretching can help with aches." },
            { emoji: '🥗', text: "Eat small, frequent meals to combat heartburn." },
            { emoji: '🗣️', text: "Finalize your hospital bag and your baby’s going-home outfit." },
            { emoji: '🚗', text: "Practice the drive to the hospital or birth center." },
            { emoji: '❤️', text: "Lean on your support system. It’s okay to ask for help." },
            { emoji: '👶', text: "Read up on newborn care and the postpartum period." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/30-fetaldev-E-deeptan-4x3.png",
        aiHint: "large cabbage",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/30-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 31,
        title: "Week 31: All Senses Go!",
        size: "Your baby is the size of a coconut.",
        summary: "All five of your baby's senses are now active. They are processing information, tracking light, and tasting what you eat. They are getting ready for the outside world!",
        development: [
            { emoji: '🖐️', text: "All five senses are working." },
            { emoji: '🧠', text: "Trillions of brain connections are forming." },
            { emoji: '🤸', text: "The baby can turn its head from side to side." },
            { emoji: '⚖️', text: "The baby is gaining about half a pound a week." },
            { emoji: '🌡️', text: "The fat layers continue to develop, helping with temperature control." },
            { emoji: '🫁', text: "The lungs are still maturing." },
            { emoji: '💪', text: "The baby is getting stronger every day." },
            { emoji: '💧', text: "The amount of amniotic fluid peaks around this time." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "You might feel the baby's movements are jabs and pokes rather than flutters." },
            { emoji: '😮‍💨', text: "Shortness of breath is common as your uterus presses up against your diaphragm." },
            { emoji: '😖', text: "Braxton Hicks contractions may be more frequent." },
            { emoji: '🍈', text: "Your breasts may leak colostrum, the first milk." },
            { emoji: '😴', text: "Sleep can be very challenging due to your size and discomfort." },
            { emoji: '😫', text: "Your back, hips, and pelvis are likely feeling the strain." },
            { emoji: '💧', text: "Swelling in your extremities is normal." },
            { emoji: '✨', text: "The nesting urge to clean and organize might be very strong." }
        ],
        symptoms: [
            { emoji: '😮‍💨', text: "Breathlessness." },
            { emoji: '😖', text: "Braxton Hicks contractions." },
            { emoji: '😴', text: "Difficulty sleeping and finding a comfortable position." },
            { emoji: '😫', text: "Achy body, especially the back and hips." },
            { emoji: '🎈', text: "Hemorrhoids." },
            { emoji: '🔥', text: "Heartburn." },
            { emoji: '🍈', text: "Leaky breasts." },
            { emoji: '💧', text: "Swelling." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Know the difference between Braxton Hicks and real labor. When in doubt, call your doctor." },
            { emoji: '🗣️', text: "Take a childbirth class to prepare for labor, delivery, and postpartum." },
            { emoji: '🧘‍♀️', text: "A warm bath can do wonders for your aching muscles." },
            { emoji: '😴', text: "Nap whenever you get the chance." },
            { emoji: '👶', text: "Finish any last-minute shopping for baby supplies." },
            { emoji: '🏥', text: "Pack your hospital bag so it's ready to go." },
            { emoji: '❤️', text: "Accept offers of help from friends and family." },
            { emoji: '💧', text: "Continue to drink lots of water." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/31-fetaldev-E-deeptan-4x3.png",
        aiHint: "coconut fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/31-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 32,
        title: "Week 32: Practice Makes Perfect",
        size: "Your baby is the size of a jicama.",
        summary: "Your baby is practicing all the skills they'll need for the outside world, like breathing, sucking, and swallowing. They are likely in a head-down position now.",
        development: [
            { emoji: '👇', text: "The baby is likely positioned head-down in preparation for birth." },
            { emoji: '🫁', text: "Rhythmic breathing movements are occurring, though no air is inhaled." },
            { emoji: '💅', text: "Fingernails and toenails are fully formed." },
            { emoji: '🍑', text: "The lanugo is starting to shed." },
            { emoji: '⚖️', text: "Your baby weighs close to 4 pounds." },
            { emoji: '💪', text: "Bones are fully developed but still soft and flexible." },
            { emoji: '👁️', text: "The pupils can constrict and dilate in response to light." },
            { emoji: '✨', text: "The skin is smooth and soft." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your fundal height is about halfway between your belly button and your sternum." },
            { emoji: '😮‍💨', text: "You are likely feeling very breathless." },
            { emoji: '😖', text: "Braxton Hicks contractions might be stronger and more frequent." },
            { emoji: '😫', text: "Your body is feeling very tired and heavy." },
            { emoji: '🔥', text: "Heartburn is a constant companion for many." },
            { emoji: '💧', text: "Swelling is common." },
            { emoji: '😴', text: "Sleep is elusive." },
            { emoji: '❤️', text: "You are eagerly awaiting the arrival of your little one." }
        ],
        symptoms: [
            { emoji: '😮‍💨', text: "Shortness of breath." },
            { emoji: '😖', text: "Stronger Braxton Hicks." },
            { emoji: '😫', text: "Back pain and pelvic pressure." },
            { emoji: '🔥', text: "Heartburn." },
            { emoji: '🎈', text: "Constipation." },
            { emoji: '💧', text: "Swelling." },
            { emoji: '😴', text: "Fatigue." },
            { emoji: '🍈', text: "Leaky breasts." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Your prenatal visits will likely be every two weeks from now on." },
            { emoji: '🗣️', text: "Discuss your pain management options for labor with your doctor." },
            { emoji: '😴', text: "Sleep propped up with pillows to help with heartburn and breathlessness." },
            { emoji: '🧘‍♀️', text: "Continue with gentle stretches and walking if you feel up to it." },
            { emoji: '👶', text: "Install the baby's car seat and have it inspected." },
            { emoji: '🥗', text: "Eat small, frequent meals." },
            { emoji: '❤️', text: "Spend some quiet time each day just focusing on your baby's movements." },
            { emoji: '📝', text: "Make a list of people to call or text when you go into labor." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/32-fetaldev-E-deeptan-4x3.png",
        aiHint: "jicama vegetable",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/32-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 33,
        title: "Week 33: Brain Power",
        size: "Your baby is the size of a pineapple.",
        summary: "Your baby's brain is developing at an incredible pace, and their head is growing to accommodate it. They are also passing antibodies from you, building their immune system.",
        development: [
            { emoji: '🧠', text: "The baby's brain is growing rapidly, and the head circumference increases by about half an inch this week." },
            { emoji: '💪', text: "The baby is developing its own immune system, but also absorbing antibodies from you." },
            { emoji: '🦴', text: "The bones in the baby's skull are still soft and not yet fused to allow for delivery." },
            { emoji: '💧', text: "The amount of amniotic fluid has reached its maximum level." },
            { emoji: '⚖️', text: "The baby weighs about 4 to 4.5 pounds." },
            { emoji: '👁️', text: "The pupils can now react to light." },
            { emoji: '✨', text: "The skin is becoming less red and wrinkled." },
            { emoji: '🤸', text: "Movements might feel less like sharp kicks and more like rolls and stretches." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "You are gaining about a pound a week." },
            { emoji: '😖', text: "You might feel pressure in your pelvis as the baby settles lower." },
            { emoji: '😮‍💨', text: "Shortness of breath can be intense." },
            { emoji: '😴', text: "Getting comfortable is nearly impossible." },
            { emoji: '😫', text: "Your body is feeling very tired and heavy." },
            { emoji: '💧', text: "You may have numbness or tingling in your hands (carpal tunnel syndrome)." },
            { emoji: '🔥', text: "Heartburn is likely still an issue." },
            { emoji: '😊', text: "You are in the home stretch!" }
        ],
        symptoms: [
            { emoji: '😮‍💨', text: "Shortness of breath." },
            { emoji: '😫', text: "Aches and pains." },
            { emoji: '😴', text: "Difficulty sleeping." },
            { emoji: '💧', text: "Numbness or tingling in hands and feet." },
            { emoji: '🔥', text: "Heartburn." },
            { emoji: '😖', text: "Braxton Hicks contractions." },
            { emoji: '🎈', text: "Constipation." },
            { emoji: '🧠', text: "Clumsiness and brain fog." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Discuss any signs of preeclampsia with your doctor, such as severe swelling or headaches." },
            { emoji: '🗣️', text: "Review your birth plan with your partner and provider." },
            { emoji: '😴', text: "Rest as much as you can. Put your feet up whenever possible." },
            { emoji: '🧘‍♀️', text: "Gentle stretching and deep breathing can help with discomfort." },
            { emoji: '👶', text: "Finish any last-minute nursery preparations." },
            { emoji: '❤️', text: "Have a date night with your partner before the baby arrives." },
            { emoji: '🥗', text: "Continue to eat a healthy diet and drink lots of water." },
            { emoji: '📝', text: "Start thinking about your postpartum recovery plan." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/33-fetaldev-E-deeptan-4x3.png",
        aiHint: "pineapple fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/33-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 34,
        title: "Week 34: Final Touches",
        size: "Your baby is the size of a butternut squash.",
        summary: "The baby's lungs and central nervous system are continuing to mature. The waxy vernix on their skin is getting thicker, providing protection.",
        development: [
            { emoji: '🫁', text: "The lungs are well-developed." },
            { emoji: '🧠', text: "The central nervous system is still maturing." },
            { emoji: '✨', text: "The vernix caseosa, the waxy coating on the skin, is getting thicker." },
            { emoji: '⚖️', text: "The baby weighs around 5 pounds." },
            { emoji: '💅', text: "Fingernails have reached the fingertips." },
            { emoji: '🤸', text: "Movements might feel different as space becomes more limited." },
            { emoji: '👇', text: "If you're having a boy, his testicles are descending into the scrotum." },
            { emoji: '😴', text: "The baby is spending a lot of time sleeping." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your baby bump might be making it hard to see your feet." },
            { emoji: '😮‍💨', text: "You may feel like you can't take a deep breath." },
            { emoji: '😴', text: "Fatigue has likely returned with a vengeance." },
            { emoji: '💧', text: "Your ankles and feet might be quite swollen." },
            { emoji: '😖', text: "Braxton Hicks contractions can be more noticeable." },
            { emoji: '👁️', text: "Your vision might be a bit blurry due to fluid retention." },
            { emoji: '😫', text: "General discomfort is the name of the game." },
            { emoji: '😊', text: "The anticipation is building!" }
        ],
        symptoms: [
            { emoji: '😴', text: "Fatigue." },
            { emoji: '😫', text: "Achy body." },
            { emoji: '😖', text: "Braxton Hicks." },
            { emoji: '💧', text: "Swelling." },
            { emoji: '🎈', text: "Constipation." },
            { emoji: '🔥', text: "Heartburn." },
            { emoji: '😮‍💨', text: "Shortness of breath." },
            { emoji: '👁️', text: "Blurry vision." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Learn the 5-1-1 rule for timing contractions: when they are 5 minutes apart, last for 1 minute, for at least 1 hour." },
            { emoji: '🧘‍♀️', text: "Practice the breathing techniques you learned in childbirth class." },
            { emoji: '😴', text: "Rest, rest, and more rest." },
            { emoji: '💧', text: "Drink plenty of water to reduce swelling and prevent contractions." },
            { emoji: '👶', text: "Wash all the baby's clothes, blankets, and sheets." },
            { emoji: '🏥', text: "Keep your hospital bag by the door." },
            { emoji: '❤️', text: "Arrange for help after the baby is born (e.g., meal delivery, help with cleaning)." },
            { emoji: '🗣️', text: "Talk to your partner about your hopes and fears for labor and parenthood." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/34-fetaldev-E-deeptan-4x3.png",
        aiHint: "butternut squash",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/34-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 35,
        title: "Week 35: Gaining Weight",
        size: "Your baby is the size of a honeydew melon.",
        summary: "Your baby doesn't have much room to move, but you'll still feel stretches and wiggles. They are rapidly gaining fat, which will help them regulate their body temperature after birth.",
        development: [
            { emoji: '⚖️', text: "The baby is gaining about half a pound per week." },
            { emoji: '🫁', text: "The lungs are nearly fully mature." },
            { emoji: '💪', text: "The baby has a firm grasp." },
            { emoji: '🧠', text: "The brain continues to develop at a rapid pace." },
            { emoji: '👶', text: "The baby is likely in the head-down position." },
            { emoji: '✨', text: "The kidneys are fully developed." },
            { emoji: '💧', text: "The liver can process some waste products." },
            { emoji: '👂', text: "The baby listens and responds to familiar voices." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your uterus is now up under your ribs." },
            { emoji: '😮‍💨', text: "You might feel like you have more room to breathe if the baby has 'dropped' into your pelvis." },
            { emoji: '🚽', text: "You'll have to pee even more frequently once the baby drops." },
            { emoji: '😖', text: "You'll feel more pressure in your lower abdomen and pelvis." },
            { emoji: '😴', text: "Sleeping is very difficult." },
            { emoji: '😫', text: "You are likely feeling very ready to be done with pregnancy." },
            { emoji: '💧', text: "Swelling can be significant." },
            { emoji: '❤️', text: "Your emotions might be all over the place." }
        ],
        symptoms: [
            { emoji: '🚽', text: "Frequent urination." },
            { emoji: '😫', text: "Pelvic pressure and discomfort." },
            { emoji: '😮‍💨', text: "Shortness of breath or easier breathing if baby has dropped." },
            { emoji: '😖', text: "Braxton Hicks contractions." },
            { emoji: '😴', text: "Insomnia." },
            { emoji: '🔥', text: "Heartburn." },
            { emoji: '😫', text: "General achiness." },
            { emoji: '💧', text: "Swelling." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Your doctor may perform a Group B strep test around now." },
            { emoji: '🧘‍♀️', text: "Rest as much as humanly possible." },
            { emoji: '💧', text: "Keep drinking water." },
            { emoji: '👶', text: "Stock your freezer with easy meals for after the baby comes." },
            { emoji: '🗣️', text: "Review the signs of labor with your partner." },
            { emoji: '🏥', text: "Finalize what you need in your hospital bag." },
            { emoji: '❤️', text: "Lean on your support system." },
            { emoji: '👩‍⚕️', text: "Ask your doctor about perineal massage to prepare for delivery." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/35-fetaldev-E-deeptan-4x3.png",
        aiHint: "honeydew melon",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/35-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 36,
        title: "Week 36: Getting Ready",
        size: "Your baby is the size of a head of romaine lettuce.",
        summary: "Your baby is considered 'early term.' They continue to gain weight, and their lungs are preparing for their first breath of air.",
        development: [
            { emoji: '🎉', text: "The baby is now considered 'early term'." },
            { emoji: '👇', text: "The baby is dropping lower into your pelvis, a process called 'lightening'." },
            { emoji: '🍑', text: "Most of the downy lanugo has been shed." },
            { emoji: '✨', text: "The waxy vernix is still protecting the skin." },
            { emoji: '⚖️', text: "The baby weighs nearly 6 pounds." },
            { emoji: '🫁', text: "The lungs are mature." },
            { emoji: '💪', text: "The baby's immune system is still developing." },
            { emoji: '😴', text: "The baby is practicing for life on the outside." }
        ],
        bodyChanges: [
            { emoji: '😮‍💨', text: "You might be able to breathe more easily as the baby drops." },
            { emoji: '🚽', text: "The trade-off for easier breathing is even more pressure on your bladder." },
            { emoji: '😖', text: "Pelvic pressure can be intense." },
            { emoji: '💧', text: "Your vaginal discharge might increase." },
            { emoji: '😴', text: "Sleeping is a real challenge." },
            { emoji: '😫', text: "You are likely feeling very uncomfortable." },
            { emoji: '✨', text: "Nesting instinct is strong." },
            { emoji: '❤️', text: "The end is in sight!" }
        ],
        symptoms: [
            { emoji: '🚽', text: "Increased urination." },
            { emoji: '😖', text: "Pelvic pressure." },
            { emoji: '😮‍💨', text: "Easier breathing." },
            { emoji: '😴', text: "Difficulty sleeping." },
            { emoji: '💧', text: "Changes in vaginal discharge." },
            { emoji: '😫', text: "General discomfort." },
            { emoji: '😖', text: "Braxton Hicks." },
            { emoji: '🔥', text: "Heartburn." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Your doctor will start checking your cervix for dilation and effacement." },
            { emoji: '🧘‍♀️', text: "Rest as much as you can. Save your energy for labor." },
            { emoji: '🗣️', text: "Review your birth plan, but be prepared for it to change." },
            { emoji: '👶', text: "Make sure everything is ready for the baby's arrival." },
            { emoji: '❤️', text: "Spend quality time with your partner." },
            { emoji: '🏥', text: "Know the route to the hospital like the back of your hand." },
            { emoji: '💧', text: "Stay hydrated." },
            { emoji: '📝', text: "Write a letter to your baby to read in the future." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/36-fetaldev-E-deeptan-4x3.png",
        aiHint: "romaine lettuce",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/36-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 37,
        title: "Week 37: Full Term!",
        size: "Your baby is the size of a bunch of Swiss chard.",
        summary: "Congratulations! Your baby is now considered full term. Their organs are ready for life outside the womb. Now, it's just a waiting game.",
        development: [
            { emoji: '🎉', text: "Your baby is officially 'full term'!" },
            { emoji: '🧠', text: "The brain and lungs will continue to mature until birth." },
            { emoji: '💪', text: "The baby has a strong grip." },
            { emoji: '✨', text: "The baby is shedding the last of its lanugo." },
            { emoji: '⚖️', text: "The baby is gaining about half an ounce a day." },
            { emoji: '🤸', text: "Movements might be less dramatic but you should still feel them regularly." },
            { emoji: '👇', text: "The baby is likely settled head-down in your pelvis." },
            { emoji: '😴', text: "The baby is getting ready for its big debut." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "Your body is preparing for labor." },
            { emoji: '💧', text: "You might lose your mucus plug, a sign that labor is near." },
            { emoji: '😖', text: "Braxton Hicks contractions might be more frequent and intense." },
            { emoji: '🚽', text: "You are living in the bathroom." },
            { emoji: '😫', text: "You are likely feeling very impatient and uncomfortable." },
            { emoji: '😴', text: "Sleep is a luxury." },
            { emoji: '❤️', text: "Emotions are running high." },
            { emoji: '✨', text: "Your body has done an amazing thing." }
        ],
        symptoms: [
            { emoji: '😖', text: "Stronger Braxton Hicks." },
            { emoji: '💧', text: "Loss of mucus plug or 'bloody show'." },
            { emoji: '😫', text: "Pelvic pressure and cramping." },
            { emoji: '🚽', text: "Constant need to urinate." },
            { emoji: '😴', text: "Insomnia." },
            { emoji: '😫', text: "Back pain." },
            { emoji: '💧', text: "Swelling." },
            { emoji: '🎢', text: "Anxiety and excitement." }
        ],
        tips: [
            { emoji: '👩‍⚕️', text: "Pay close attention to your baby's movements. Call your doctor if you notice a decrease." },
            { emoji: '🧘‍♀️', text: "Rest as much as you can. Conserve your energy." },
            { emoji: '🗣️', text: "Review the signs of labor one more time." },
            { emoji: '🏥', text: "Have your hospital bag in the car." },
            { emoji: '❤️', text: "Trust your body. It knows what to do." },
            { emoji: '👶', text: "Enjoy these last few days or weeks of pregnancy." },
            { emoji: '💧', text: "Stay hydrated." },
            { emoji: '🎥', text: "Watch a funny movie to pass the time and relax." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/37-fetaldev-E-deeptan-4x3.png",
        aiHint: "swiss chard",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/37-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 38,
        title: "Week 38: Final Preparations",
        size: "Your baby is the size of a pumpkin.",
        summary: "Your baby has plumped up and their organs are fully mature. They are just waiting for the right time to make their grand entrance.",
        development: [
            { emoji: '🫁', text: "The lungs are producing plenty of surfactant." },
            { emoji: '🧠', text: "The brain is still forming new connections." },
            { emoji: '⚖️', text: "The baby weighs around 6.5 to 7 pounds." },
            { emoji: '👁️', text: "The eyes are likely a dark grey or blue; true eye color will develop after birth." },
            { emoji: '💪', text: "The baby's grip is very strong." },
            { emoji: '✨', text: "The vernix caseosa and lanugo are almost completely gone." },
            { emoji: '💧', text: "The baby continues to swallow amniotic fluid." },
            { emoji: '😴', text: "The baby is resting up for the journey of birth." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "You are at the finish line." },
            { emoji: '😖', text: "You might be experiencing early labor signs." },
            { emoji: '💧', text: "Your water might break at any time." },
            { emoji: '😫', text: "You are likely very ready to meet your baby." },
            { emoji: '😴', text: "Sleep is hard to come by." },
            { emoji: '🍈', text: "Your breasts are full and may be leaking." },
            { emoji: '❤️', text: "Your emotions are a mix of excitement, fear, and impatience." },
            { emoji: '✨', text: "Any day now!" }
        ],
        symptoms: [
            { emoji: '💧', text: "Leaking amniotic fluid." },
            { emoji: '😖', text: "Contractions." },
            { emoji: '😫', text: "Pelvic and rectal pressure." },
            { emoji: '😴', text: "Insomnia." },
            { emoji: '💧', text: "Swelling." },
            { emoji: '😫', text: "Extreme fatigue." },
            { emoji: '🚽', text: "Frequent urination." },
            { emoji: '✨', text: "Bloody show." }
        ],
        tips: [
            { emoji: '🧘‍♀️', text: "Rest, rest, rest." },
            { emoji: '💧', text: "Stay hydrated." },
            { emoji: '🗣️', text: "Keep your support person close." },
            { emoji: '🏥', text: "Know when to go to the hospital." },
            { emoji: '❤️', text: "Try to relax and trust the process." },
            { emoji: '👶', text: "Enjoy the quiet moments before your life changes forever." },
            { emoji: '👩‍⚕️', text: "Don't hesitate to call your doctor with any questions or concerns." },
            { emoji: '🎥', text: "Binge-watch your favorite show while you wait." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/38-fetaldev-E-deeptan-4x3.png",
        aiHint: "pumpkin vegetable",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/38-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 39,
        title: "Week 39: Ready for a Cuddle",
        size: "Your baby is the size of a watermelon.",
        summary: "Your baby is fully developed and ready for life on the outside. They are nice and plump, with a layer of fat to keep them warm.",
        development: [
            { emoji: '🎉', text: "The baby is fully mature and ready for birth." },
            { emoji: '🧠', text: "The brain is still developing and will continue to do so for years." },
            { emoji: '💪', text: "The baby is strong and has coordinated reflexes." },
            { emoji: '⚖️', text: "The average birth weight is around 7 to 8 pounds." },
            { emoji: '👁️', text: "Vision is still blurry at birth." },
            { emoji: '✨', text: "The baby is receiving antibodies from you to protect against illness." },
            { emoji: '🫁', text: "The lungs are ready for their first breath." },
            { emoji: '😴', text: "The baby is just waiting for the signal to be born." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "You are at the finish line." },
            { emoji: '😖', text: "You might be experiencing early labor signs." },
            { emoji: '💧', text: "Your water might break at any time." },
            { emoji: '😫', text: "You are likely very uncomfortable." },
            { emoji: '😴', text: "Sleep is a distant dream." },
            { emoji: '❤️', text: "The anticipation is at its peak." },
            { emoji: '✨', text: "Your body is amazing." },
            { emoji: '👶', text: "You will meet your baby very soon." }
        ],
        symptoms: [
            { emoji: '💧', text: "Leaking amniotic fluid." },
            { emoji: '😖', text: "Regular, painful contractions." },
            { emoji: '😫', text: "Intense pelvic pressure." },
            { emoji: '✨', text: "Losing your mucus plug." },
            { emoji: '😴', text: "Exhaustion." },
            { emoji: '🎢', text: "A rollercoaster of emotions." },
            { emoji: '✨', text: "A sudden burst of energy (nesting)." },
            { emoji: '🚽', text: "Diarrhea or loose stools." }
        ],
        tips: [
            { emoji: '🧘‍♀️', text: "Try to stay as relaxed as possible." },
            { emoji: '💧', text: "Stay hydrated." },
            { emoji: '🚶‍♀️', text: "Gentle walking can help labor progress." },
            { emoji: '🗣️', text: "Lean on your support person." },
            { emoji: '🏥', text: "Head to the hospital when your contractions are consistent and strong." },
            { emoji: '❤️', text: "You've got this!" },
            { emoji: '👩‍⚕️', text: "Call your doctor if your water breaks or if you have any concerns." },
            { emoji: '👶', text: "Get ready for the moment you've been waiting for." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/39-fetaldev-E-deeptan-4x3.png",
        aiHint: "watermelon fruit",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/39-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 40,
        title: "Week 40: Due Date!",
        size: "Your baby is the size of a small pumpkin.",
        summary: "This is your estimated due date, but don't worry if your baby hasn't arrived yet. Many first-time moms go past their due date. Your baby is ready whenever you are.",
        development: [
            { emoji: '🎉', text: "Happy due date! But remember, it's just an estimate." },
            { emoji: '⚖️', text: "The baby is fully grown and ready for the world." },
            { emoji: '🧠', text: "Brain development continues." },
            { emoji: '💪', text: "The baby is strong and has all the necessary reflexes for survival." },
            { emoji: '😴', text: "The baby is waiting patiently (or not so patiently!)." },
            { emoji: '✨', text: "The baby's head has likely engaged in your pelvis." },
            { emoji: '🫁', text: "The lungs are mature and ready for air." },
            { emoji: '❤️', text: "The heart and circulatory system are ready for the transition to life outside the womb." }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "You are likely feeling very, very pregnant." },
            { emoji: '😖', text: "You might be experiencing signs of early labor." },
            { emoji: '😫', text: "Discomfort is at an all-time high." },
            { emoji: '❤️', text: "Impatience and excitement are your constant companions." },
            { emoji: '✨', text: "Your body is poised and ready." },
            { emoji: '😴', text: "Rest is crucial." },
            { emoji: '💧', text: "Look out for your water breaking." },
            { emoji: '👶', text: "It's time!" }
        ],
        symptoms: [
            { emoji: '😖', text: "Labor contractions (regular, getting stronger, and closer together)." },
            { emoji: '💧', text: "Your water breaking." },
            { emoji: '✨', text: "Bloody show." },
            { emoji: '😫', text: "Intense back pain." },
            { emoji: '🚽', text: "Diarrhea." },
            { emoji: '😴', text: "Exhaustion mixed with bursts of energy." },
            { emoji: '🎢', text: "Every emotion imaginable." },
            { emoji: '👶', text: "The feeling that the baby is very low in your pelvis." }
        ],
        tips: [
            { emoji: '🧘‍♀️', text: "Try to stay as relaxed as possible." },
            { emoji: '💧', text: "Keep sipping water." },
            { emoji: '🚶‍♀️', text: "Gentle walking can help labor progress." },
            { emoji: '🗣️', text: "Lean on your support person." },
            { emoji: '🏥', text: "Time your contractions and know when to go to the hospital." },
            { emoji: '❤️', text: "You are about to embark on the most amazing journey. You can do this." },
            { emoji: '👩‍⚕️', text: "Stay in close contact with your doctor or midwife." },
            { emoji: '👶', text: "Get ready for the moment you've been waiting for." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/40-fetaldev-E-deeptan-4x3.png",
        aiHint: "small pumpkin",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/40-body-E-deeptan_4x3.jpg?width=300"
    },
    {
        week: 41,
        title: "Week 41: Overdue but Not for Long",
        size: "Your baby is the size of a watermelon.",
        summary: "It's common to go past your due date, especially with a first baby. Your doctor will be monitoring you and your baby closely and may discuss induction.",
        development: [
            { emoji: '⏰', text: "The baby is fashionably late, but still comfortable." },
            { emoji: '💪', text: "Your baby continues to grow, and their hair and nails are getting longer." },
            { emoji: '✨', text: "The vernix caseosa is mostly gone, so the skin might be a bit dry after birth." },
            { emoji: '🧠', text: "Brain development is ongoing." },
            { emoji: '⚖️', text: "The baby is still gaining a bit of weight." },
            { emoji: '😴', text: "The baby is conserving energy for the upcoming birth." },
            { emoji: '🤸', text: "You should still feel regular movements." },
            { emoji: '👶', text: "Your baby is fully cooked and ready to come out!" }
        ],
        bodyChanges: [
            { emoji: '🤰', text: "You feel larger than life and are probably tired of being pregnant." },
            { emoji: '👩‍⚕️', text: "Your doctor will monitor you closely with non-stress tests or biophysical profiles." },
            { emoji: '🤔', text: "You might be discussing induction options with your provider." },
            { emoji: '😫', text: "Discomfort levels are very high." },
            { emoji: '❤️', text: "Impatience is the primary emotion of the week." },
            { emoji: '✨', text: "Your body is still preparing, and labor could start at any moment." },
            { emoji: '😖', text: "You continue to experience Braxton Hicks and other late-pregnancy symptoms." },
            { emoji: '😴', text: "Resting is your most important job right now." }
        ],
        symptoms: [
            { emoji: '😫', text: "Extreme discomfort." },
            { emoji: '😴', text: "Exhaustion." },
            { emoji: '💧', text: "Swelling." },
            { emoji: '😖', text: "Pelvic pressure." },
            { emoji: '🚽', text: "Frequent urination." },
            { emoji: '🎢', text: "Anxiety and impatience." },
            { emoji: '✨', text: "Possible signs of labor at any time." },
            { emoji: '🔥', text: "Heartburn." }
        ],
        tips: [
            { emoji: '🧘‍♀️', text: "Try to stay patient and relaxed, though it's hard." },
            { emoji: '🗣️', text: "Talk to your doctor about the pros and cons of induction." },
            { emoji: '🚶‍♀️', text: "Continue gentle walking if you feel up to it." },
            { emoji: '❤️', text: "Do something nice for yourself to pass the time." },
            { emoji: '👩‍⚕️', text: "Keep a close eye on your baby's movements and call your doctor if they decrease." },
            { emoji: '😴', text: "Sleep and rest as much as possible." },
            { emoji: '💧', text: "Stay hydrated." },
            { emoji: '👶', text: "Know that your baby will be here very, very soon." }
        ],
        imageUrl: "https://assets.babycenter.com/ims/2024/09/41-fetaldev-E-deeptan-4x3.png",
        aiHint: "waiting baby",
        motherImageUrl: "https://assets.babycenter.com/ims/2025/03/41-body-E-deeptan_4x3.jpg?width=300"
    }
];
