# GlowHer Wellness

GlowHer Wellness is a personalized digital sanctuary designed for holistic women's health. The platform integrates period tracking, mood journaling, pregnancy guidance, and AI-driven insights into a cohesive, user-centric interface.

---

## 1: PROJECT HIGHLIGHTS (For Word Report)

*   **Unified Holistic Health Platform:** Built a comprehensive wellness sanctuary covering menstrual cycle tracking, week-by-week pregnancy monitoring, and mental health support—integrating over 8 distinct health modules into a single, cohesive experience.
*   **AI-Driven Personalized Insights:** Integrated Google Genkit and Gemini AI to provide tailored wellness advice and daily "Thought of the Day" inspirations, dynamically generated based on user-logged moods and cycle phases.
*   **Privacy-First Data Architecture:** Engineered a secure data model utilizing Browser Local Storage to ensure sensitive health information remains exclusively on the user's device, providing maximum privacy and zero-latency data retrieval.
*   **Advanced Wellness Tooling:** Developed specialized interactive features including a fetal kick counter, a 5-1-1 rule contraction timer, and a rich-text mood journal with customizable themes and image attachments using ShadCN UI.

---

## 2: GITHUB SETUP INSTRUCTIONS (Terminal Commands)

Follow these exact steps in your terminal to move your files to GitHub:

1.  **Remove the existing remote:**
    ```bash
    git remote remove origin
    ```
2.  **Add all files:**
    ```bash
    git add .
    ```
3.  **Commit your changes:**
    ```bash
    git commit -m "Finalized project with correct report points"
    ```
4.  **Connect to your repository:**
    ```bash
    git remote add origin https://github.com/hiral17234/GlowHer
    ```
5.  **Push to GitHub (Force push):**
    ```bash
    git push -u origin main -f
    ```

---

## 3: SYSTEM REQUIREMENTS AND METHOD

### The System Requirements
The platform is optimized for modern web browsers and requires standard hardware (i5 processor, 8GB RAM) with stable internet for AI features.

### Method
GlowHer utilizes a modular, privacy-centric architecture built on the Next.js App Router framework. 

*   **Modular Frontend:** Leverages React Server Components for performance and ShadCN UI for accessible, professional components.
*   **Edge-Ready Logic:** Uses Next.js Server Actions to securely interact with the Genkit AI layer.
*   **Local-First Persistence:** Implements a robust state management system using Browser Local Storage, bypassing traditional cloud database latency and ensuring 100% data ownership for the user.

---

## 4: IMPLEMENTATION/EXECUTION

The implementation phase focused on transforming holistic health concepts into a responsive digital platform. The process was divided into three core modules:

**1. Frontend Design:** Developed using **Next.js, React, and TypeScript**. Styling and interactive elements are powered by **Tailwind CSS** and **ShadCN UI** components, providing a professional and accessible user experience.

**2. Backend & AI Integration:** Built using **Genkit** to handle personalized wellness advice and thought generation. This layer ensures efficient processing of user data (like mood and cycle phase) through secure, server-side LLM logic.

**3. Data Architecture:** Engineered exclusively on **Browser Local Storage**. This ensures health logs, pregnancy milestones, and profile data remain on the user's device, eliminating cloud latency and enhancing security.

---

## 5: RESULT AND DISCUSSION

The implementation resulted in a fully functional, user-friendly platform. Key modules such as the **Period Tracker**, **Pregnancy Guide**, and **MindDump** performed reliably under various user scenarios.

The dashboard effectively serves as a central hub, providing immediate access to notifications and AI-generated "Thoughts of the Day." User testing indicated that the local storage approach provided a highly responsive experience, while the AI-driven wellness tips added a unique layer of personalized care that standard trackers lack.

---

## 6: CONCLUSION

GlowHer Wellness successfully demonstrates how modern web technologies can be used to create a comprehensive yet private health companion. By combining a user-centric UI with powerful generative AI and a secure local data model, the project fulfills its objective of providing an accessible personal sanctuary for women's wellness.

---

## REFERENCES

1. Next.js Documentation (2025). "App Router and Server Actions."
2. Google Genkit Documentation (2025). "AI Integration for JavaScript/TypeScript."
3. React Documentation (2024). "Managing State with Hooks and Local Storage."
4. Lupton, D. (2016). *The Quantified Self: A Sociology of Self-Tracking*. Polity Press.