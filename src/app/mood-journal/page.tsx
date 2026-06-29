"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, isSameDay, addDays, startOfDay, isWithinInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  CalendarIcon, ChevronLeft, Smile, BookText, History,
  PlusCircle, Brain, Image as ImageIcon, X, Info, Moon, Sun,
  Bold, Italic, Underline, Palette
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

// ─── DATA ────────────────────────────────────────────────────────────────────

const moods = [
  { name: 'Happy',   emoji: '😄' },
  { name: 'Calm',    emoji: '🙂' },
  { name: 'Neutral', emoji: '😐' },
  { name: 'Sad',     emoji: '😢' },
  { name: 'Angry',   emoji: '😠' },
  { name: 'Anxious', emoji: '😰' },
  { name: 'Tired',   emoji: '😴' },
  { name: 'Loved',   emoji: '😍' },
];

const themes = [
  { name: 'None',     url: '' },
  { name: 'Theme 1',  url: 'https://i.pinimg.com/736x/b7/c8/55/b7c855729051d9b0c53f9d8ac14f44e5.jpg' },
  { name: 'Theme 2',  url: 'https://i.pinimg.com/736x/af/eb/54/afeb548a9f2ea67f3114a8ad8cd00f70.jpg' },
  { name: 'Theme 3',  url: 'https://i.pinimg.com/736x/bb/86/15/bb8615133e2463ad2c9ac0d787f71fa9.jpg' },
  { name: 'Theme 4',  url: 'https://i.pinimg.com/736x/20/44/87/204487aa4ed5b8ca3901600ff4802639.jpg' },
  { name: 'Theme 5',  url: 'https://i.pinimg.com/736x/48/90/bd/4890bd90b28f004d7dd8b422e436ade7.jpg' },
  { name: 'Theme 6',  url: 'https://i.pinimg.com/736x/85/33/00/853300d5833ad64bb1973764ceca7d63.jpg' },
  { name: 'Theme 7',  url: 'https://i.pinimg.com/736x/15/ea/4a/15ea4a490a6a162a02c03745a1ff567b.jpg' },
  { name: 'Theme 8',  url: 'https://i.pinimg.com/736x/c9/3c/90/c93c90c8be46f81e413eee311036c58d.jpg' },
  { name: 'Theme 9',  url: 'https://i.pinimg.com/736x/cd/4b/90/cd4b901784885e7a2e0d577ab99500f2.jpg' },
  { name: 'Theme 10', url: 'https://i.pinimg.com/736x/d4/9f/3d/d49f3d3546a8e3f7ff584331dbd56c0b.jpg' },
  { name: 'Theme 11', url: 'https://i.pinimg.com/originals/f7/52/0b/f7520b5d577dedee57e9d6d511c7d4f1.png' },
];

const phaseTips: Record<string, { title: string; tip: string }> = {
  Menstrual:  { title: 'Menstrual Phase',  tip: "Your energy may be lower. Be gentle with yourself. It's a great time for reflection and rest." },
  Follicular: { title: 'Follicular Phase', tip: 'Energy is returning! You might feel more creative and outgoing. A great time to start new projects.' },
  Ovulatory:  { title: 'Ovulatory Phase',  tip: "Your mood and energy are likely at their peak. It's an excellent time for social connection." },
  Luteal:     { title: 'Luteal Phase',     tip: "It's common to feel more inward or irritable. Prioritize self-care and calming activities." },
};

const LOCAL_STORAGE_KEY_PREFIX = 'glowher-mood-journal-';

// ─── SCHEMA ──────────────────────────────────────────────────────────────────

const FormSchema = z.object({
  logDate:       z.date({ required_error: 'A date is required.' }),
  mood:          z.string({ required_error: 'Please select a mood.' }),
  customMood:    z.string().optional(),
  moodIntensity: z.array(z.number()).optional(),
  notes:         z.string().max(1000, { message: 'Notes must be 1000 characters or less.' }).optional(),
  themeUrl:      z.string().optional(),
  imageUrl:      z.string().optional(),
}).refine(
  data => data.mood !== 'Custom' || (data.customMood && data.customMood.length > 0),
  { message: 'Please enter a custom mood.', path: ['customMood'] }
);

type FormData = z.infer<typeof FormSchema>;

// ─── RICH TEXT EDITOR ────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  themeUrl?: string;
}

function RichTextEditor({ value, onChange, placeholder, themeUrl }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [boldActive, setBoldActive]           = useState(false);
  const [italicActive, setItalicActive]       = useState(false);
  const [underlineActive, setUnderlineActive] = useState(false);
  const colorRef = useRef<HTMLInputElement>(null);

  // Sync external value into editor only on mount / external reset
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value ?? '')) {
      editorRef.current.innerHTML = value ?? '';
    }
  }, [value]);

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    updateState();
  };

  const updateState = () => {
    setBoldActive(document.queryCommandState('bold'));
    setItalicActive(document.queryCommandState('italic'));
    setUnderlineActive(document.queryCommandState('underline'));
  };

  const handleInput = () => {
    const text = editorRef.current?.innerText ?? '';
    if (text.length <= 1000) {
      onChange(editorRef.current?.innerHTML ?? '');
    } else {
      // trim to 1000 chars
      if (editorRef.current) {
        const trimmed = text.slice(0, 1000);
        editorRef.current.innerText = trimmed;
        // move caret to end
        const range = document.createRange();
        const sel   = window.getSelection();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
        onChange(editorRef.current.innerHTML);
      }
    }
    updateState();
  };

  const hasTheme = !!themeUrl;

  return (
    <div
      className={cn(
        'rounded-xl border transition-colors duration-200',
        'border-pink-200/50 dark:border-white/10',
        'focus-within:border-pink-400/70 dark:focus-within:border-pink-400/50',
        'overflow-hidden'
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2.5 py-2 bg-pink-50/80 dark:bg-white/5 border-b border-pink-200/40 dark:border-white/10">
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); execCmd('bold'); }}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all',
            'border border-pink-200/50 dark:border-white/10',
            'hover:bg-pink-100 dark:hover:bg-white/10',
            boldActive
              ? 'bg-pink-200/60 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-400/50'
              : 'bg-white/70 dark:bg-white/5 text-gray-600 dark:text-gray-300'
          )}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); execCmd('italic'); }}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all',
            'border border-pink-200/50 dark:border-white/10',
            'hover:bg-pink-100 dark:hover:bg-white/10',
            italicActive
              ? 'bg-pink-200/60 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-400/50'
              : 'bg-white/70 dark:bg-white/5 text-gray-600 dark:text-gray-300'
          )}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); execCmd('underline'); }}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all',
            'border border-pink-200/50 dark:border-white/10',
            'hover:bg-pink-100 dark:hover:bg-white/10',
            underlineActive
              ? 'bg-pink-200/60 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-400/50'
              : 'bg-white/70 dark:bg-white/5 text-gray-600 dark:text-gray-300'
          )}
          title="Underline"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-pink-200/50 dark:bg-white/10 mx-1" />

        {/* Color picker */}
        <div className="relative">
          <button
            type="button"
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
              'border border-pink-200/50 dark:border-white/10',
              'bg-white/70 dark:bg-white/5',
              'hover:bg-pink-100 dark:hover:bg-white/10',
              'text-gray-600 dark:text-gray-300'
            )}
            title="Text color"
            onClick={() => colorRef.current?.click()}
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
          <input
            ref={colorRef}
            type="color"
            defaultValue="#c9748f"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            onInput={e => execCmd('foreColor', (e.target as HTMLInputElement).value)}
          />
        </div>
      </div>

      {/* Editor area — theme bg sits behind, editor is transparent */}
      <div className="relative min-h-[160px]">
        {/* Theme background — full natural color, NO tint overlay */}
        {hasTheme && (
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url('${themeUrl}')` }}
          />
        )}

        {/* Fallback solid bg when no theme */}
        {!hasTheme && (
          <div className="absolute inset-0 bg-pink-50/60 dark:bg-white/[0.03] z-0" />
        )}

        {/* Editable — transparent so theme shows through */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={handleInput}
          onKeyUp={updateState}
          onMouseUp={updateState}
          className={cn(
            'relative z-10 min-h-[160px] p-3.5 outline-none text-sm leading-relaxed',
            'bg-transparent',
            // text color: dark on theme so it reads over the image
            hasTheme
              ? 'text-gray-900 [text-shadow:0_0_6px_rgba(255,255,255,0.7),0_1px_3px_rgba(255,255,255,0.5)]'
              : 'text-foreground',
            // placeholder via CSS
            'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 empty:before:pointer-events-none'
          )}
        />
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function MoodJournalPage() {
  const router               = useRouter();
  const { toast }            = useToast();
  const [currentDate, setCurrentDate]           = useState(new Date());
  const [showCustomMoodInput, setShowCustomMoodInput] = useState(false);
  const fileInputRef                            = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview]         = useState<string | null>(null);
  const [currentPhase, setCurrentPhase]         = useState<string | null>(null);
  const [darkMode, setDarkMode]                 = useState(false);

  // ── Toggle dark mode on <html> ──────────────────────────────────────────
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      logDate:       new Date(),
      mood:          'Neutral',
      moodIntensity: [5],
      notes:         '',
      customMood:    '',
      themeUrl:      '',
      imageUrl:      '',
    },
  });

  const notesValue    = form.watch('notes');
  const logDate       = form.watch('logDate');
  const selectedMood  = form.watch('mood');
  const selectedTheme = form.watch('themeUrl');

  // ── Cycle phase + custom mood toggle ───────────────────────────────────
  useEffect(() => {
    try {
      const periodData = localStorage.getItem('glowher-period-tracker');
      if (periodData) {
        const data   = JSON.parse(periodData);
        const today  = startOfDay(new Date());
        let start    = startOfDay(new Date(data.lastPeriodDate));
        while (addDays(start, data.cycleLength) <= today) {
          start = addDays(start, data.cycleLength);
        }
        const nextPeriodStart = addDays(start, data.cycleLength);
        const ovulationDay    = addDays(nextPeriodStart, -(data.lutealPhaseLength || 14));
        const periodEnd       = addDays(start, 4);

        if (isWithinInterval(today, { start, end: periodEnd }))
          setCurrentPhase('Menstrual');
        else if (isWithinInterval(today, { start: addDays(periodEnd, 1), end: addDays(ovulationDay, -1) }))
          setCurrentPhase('Follicular');
        else if (isSameDay(today, ovulationDay))
          setCurrentPhase('Ovulatory');
        else if (isWithinInterval(today, { start: addDays(ovulationDay, 1), end: addDays(nextPeriodStart, -1) }))
          setCurrentPhase('Luteal');
      }
    } catch (e) { console.error(e); }

    if (selectedMood === 'Custom') {
      setShowCustomMoodInput(true);
    } else {
      setShowCustomMoodInput(false);
      form.setValue('customMood', '');
    }
  }, [selectedMood, form]);

  // ── Load entry when date changes ────────────────────────────────────────
  useEffect(() => {
    if (isSameDay(logDate, currentDate)) return;
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(logDate, 'yyyy-MM-dd')}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed    = JSON.parse(saved);
        parsed.logDate  = new Date(parsed.logDate);
        form.reset(parsed);
        setImagePreview(parsed.imageUrl || null);
      } else {
        form.reset({ logDate, mood: 'Neutral', moodIntensity: [5], notes: '', customMood: '', themeUrl: '', imageUrl: '' });
        setImagePreview(null);
      }
      setCurrentDate(logDate);
    } catch (e) { console.error(e); }
  }, [logDate, form, currentDate]);

  // ── Submit ──────────────────────────────────────────────────────────────
  function onSubmit(data: FormData) {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${format(data.logDate, 'yyyy-MM-dd')}`;
    try {
      localStorage.setItem(key, JSON.stringify(data));
      toast({ title: 'Mood Saved!', description: 'Your entry for this day has been successfully saved.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error Saving Entry', description: 'Could not save your entry. Please try again.' });
    }
  }

  // ── Image upload ────────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        const url = ev.target?.result as string;
        form.setValue('imageUrl', url);
        setImagePreview(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const relevantTip = currentPhase ? phaseTips[currentPhase] : null;

  // ── Background style ────────────────────────────────────────────────────
  // Light: illustrated SVG inline; Dark: the original photo
  const lightBg = darkMode ? {} : {};   // handled via className

  return (
    <div
      className={cn(
        'flex flex-col min-h-screen transition-colors duration-500',
        darkMode
          ? 'bg-[#0a0414]'
          : 'bg-[#ffe0f4]'
      )}
    >
      {/* ── Background layers ── */}
      {/* Dark mode: photo bg */}
      {darkMode && (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://i.pinimg.com/736x/e5/56/3b/e5563b287cdd04ec1dcbb4f03408b145.jpg')" }}
        />
      )}
      {/* Dark overlay */}
      <div
        className={cn(
          'fixed inset-0 z-0 transition-all duration-500',
          darkMode
            ? 'bg-[rgba(8,4,20,0.86)] backdrop-blur-[2px]'
            : 'bg-[rgba(255,228,242,0.72)] backdrop-blur-[2px]'
        )}
      />
      {/* Light mode: soft pink/purple gradient + SVG clouds + strawberries */}
      {!darkMode && (
        <svg
          className="fixed inset-0 z-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="skyG" cx="50%" cy="28%" r="85%">
              <stop offset="0%" stopColor="#ffe0f4"/>
              <stop offset="52%" stopColor="#f7ccee"/>
              <stop offset="100%" stopColor="#e6ccff"/>
            </radialGradient>
            <filter id="s4"><feGaussianBlur stdDeviation="4"/></filter>
            <filter id="s7"><feGaussianBlur stdDeviation="7"/></filter>
          </defs>
          <rect width="1440" height="900" fill="url(#skyG)"/>
          <ellipse cx="180" cy="145" rx="360" ry="200" fill="#ffb0de" opacity="0.30" filter="url(#s7)"/>
          <ellipse cx="1300" cy="185" rx="310" ry="175" fill="#d8b0ff" opacity="0.28" filter="url(#s7)"/>
          <ellipse cx="720" cy="810" rx="440" ry="220" fill="#ffbce6" opacity="0.24" filter="url(#s7)"/>
          {/* Clouds */}
          <g opacity="0.88" filter="url(#s4)"><ellipse cx="168" cy="112" rx="98" ry="52" fill="white"/><ellipse cx="112" cy="122" rx="60" ry="42" fill="white"/><ellipse cx="230" cy="124" rx="68" ry="40" fill="white"/><ellipse cx="168" cy="132" rx="88" ry="33" fill="white"/></g>
          <g opacity="0.78" filter="url(#s4)" transform="translate(918,48)"><ellipse cx="128" cy="74" rx="118" ry="56" fill="white"/><ellipse cx="74" cy="84" rx="70" ry="46" fill="white"/><ellipse cx="186" cy="86" rx="74" ry="42" fill="white"/><ellipse cx="128" cy="95" rx="108" ry="36" fill="white"/></g>
          <g opacity="0.62" filter="url(#s4)" transform="translate(508,12)"><ellipse cx="84" cy="54" rx="74" ry="37" fill="white"/><ellipse cx="48" cy="62" rx="46" ry="31" fill="white"/><ellipse cx="124" cy="63" rx="54" ry="29" fill="white"/></g>
          <g opacity="0.50" filter="url(#s4)" transform="translate(0,708)"><ellipse cx="108" cy="64" rx="112" ry="50" fill="#ffd0ec"/><ellipse cx="60" cy="74" rx="66" ry="40" fill="#ffd0ec"/><ellipse cx="165" cy="76" rx="78" ry="38" fill="#ffd0ec"/></g>
          {/* Strawberry 1 */}
          <g transform="translate(1340,30) rotate(-14)"><ellipse cx="20" cy="25" rx="18" ry="22" fill="#e53e58"/><ellipse cx="20" cy="22" rx="15" ry="17" fill="#ee6474"/><ellipse cx="14" cy="19" rx="1.8" ry="2.2" fill="#fff" opacity="0.74"/><ellipse cx="20" cy="14" rx="1.8" ry="2.2" fill="#fff" opacity="0.74"/><ellipse cx="26" cy="19" rx="1.8" ry="2.2" fill="#fff" opacity="0.74"/><ellipse cx="14" cy="28" rx="1.8" ry="2.2" fill="#fff" opacity="0.74"/><ellipse cx="26" cy="28" rx="1.8" ry="2.2" fill="#fff" opacity="0.74"/><ellipse cx="11" cy="6" rx="9" ry="4.5" fill="#50b85e" transform="rotate(28,11,6)"/><ellipse cx="20" cy="2" rx="9" ry="4.5" fill="#40a84e"/><ellipse cx="29" cy="6" rx="9" ry="4.5" fill="#50b85e" transform="rotate(-28,29,6)"/></g>
          {/* Strawberry 2 */}
          <g transform="translate(22,368) rotate(12)" opacity="0.88"><ellipse cx="24" cy="29" rx="21" ry="26" fill="#e53e58"/><ellipse cx="24" cy="26" rx="18" ry="21" fill="#ee6474"/><ellipse cx="16" cy="22" rx="2" ry="2.5" fill="#fff" opacity="0.72"/><ellipse cx="24" cy="16" rx="2" ry="2.5" fill="#fff" opacity="0.72"/><ellipse cx="32" cy="22" rx="2" ry="2.5" fill="#fff" opacity="0.72"/><ellipse cx="16" cy="32" rx="2" ry="2.5" fill="#fff" opacity="0.72"/><ellipse cx="32" cy="32" rx="2" ry="2.5" fill="#fff" opacity="0.72"/><ellipse cx="13" cy="7" rx="11" ry="5" fill="#50b85e" transform="rotate(26,13,7)"/><ellipse cx="24" cy="2" rx="11" ry="5" fill="#40a84e"/><ellipse cx="35" cy="7" rx="11" ry="5" fill="#50b85e" transform="rotate(-26,35,7)"/></g>
          {/* Strawberry 3 */}
          <g transform="translate(53,52) rotate(-22)" opacity="0.70"><ellipse cx="14" cy="17" rx="12" ry="15" fill="#e53e58"/><ellipse cx="14" cy="15" rx="10" ry="11" fill="#ee6474"/><ellipse cx="9" cy="12" rx="1.4" ry="1.8" fill="#fff" opacity="0.72"/><ellipse cx="14" cy="9" rx="1.4" ry="1.8" fill="#fff" opacity="0.72"/><ellipse cx="19" cy="12" rx="1.4" ry="1.8" fill="#fff" opacity="0.72"/><ellipse cx="9" cy="19" rx="1.4" ry="1.8" fill="#fff" opacity="0.72"/><ellipse cx="19" cy="19" rx="1.4" ry="1.8" fill="#fff" opacity="0.72"/><ellipse cx="7" cy="4" rx="7" ry="3.5" fill="#50b85e" transform="rotate(28,7,4)"/><ellipse cx="14" cy="1" rx="7" ry="3.5" fill="#40a84e"/><ellipse cx="21" cy="4" rx="7" ry="3.5" fill="#50b85e" transform="rotate(-28,21,4)"/></g>
          {/* Strawberry 4 bottom */}
          <g transform="translate(672,845) rotate(-9)" opacity="0.74"><ellipse cx="20" cy="24" rx="18" ry="22" fill="#e53e58"/><ellipse cx="20" cy="21" rx="15" ry="17" fill="#ee6474"/><ellipse cx="14" cy="18" rx="1.8" ry="2.2" fill="#fff" opacity="0.72"/><ellipse cx="20" cy="13" rx="1.8" ry="2.2" fill="#fff" opacity="0.72"/><ellipse cx="26" cy="18" rx="1.8" ry="2.2" fill="#fff" opacity="0.72"/><ellipse cx="14" cy="27" rx="1.8" ry="2.2" fill="#fff" opacity="0.72"/><ellipse cx="26" cy="27" rx="1.8" ry="2.2" fill="#fff" opacity="0.72"/><ellipse cx="11" cy="5" rx="9" ry="4.5" fill="#50b85e" transform="rotate(28,11,5)"/><ellipse cx="20" cy="1" rx="9" ry="4.5" fill="#40a84e"/><ellipse cx="29" cy="5" rx="9" ry="4.5" fill="#50b85e" transform="rotate(-28,29,5)"/></g>
          <text x="415" y="84" fontSize="16" opacity="0.26" fill="#e53e58">♡</text>
          <text x="762" y="45" fontSize="14" opacity="0.26" fill="#c8a0d8">✦</text>
          <text x="352" y="804" fontSize="11" opacity="0.25" fill="#c068b0">✦</text>
        </svg>
      )}

      {/* ── HEADER ── */}
      <header className={cn(
        'relative z-10 sticky top-0 px-6 py-3.5',
        'backdrop-blur-xl border-b',
        darkMode
          ? 'bg-[rgba(8,4,20,0.60)] border-white/10'
          : 'bg-[rgba(255,225,240,0.90)] border-pink-200/30'
      )}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <GlowHerLogo />
          <div className="flex items-center gap-2">
            {/* Dark / Light toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(d => !d)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                darkMode
                  ? 'bg-white/10 border border-white/15 text-yellow-300 hover:bg-white/15'
                  : 'bg-pink-100/80 border border-pink-200/50 text-pink-700 hover:bg-pink-200/60'
              )}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className={cn(
                'text-sm',
                darkMode
                  ? 'bg-white/10 border-white/15 text-white hover:bg-white/15'
                  : 'bg-pink-50/80 border-pink-200/50 text-pink-800 hover:bg-pink-100/80'
              )}
            >
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="relative z-10 flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">

          {/* Hero */}
          <div className="text-center py-2">
            <p className={cn(
              'text-[10px] tracking-[3px] uppercase font-medium mb-2',
              darkMode ? 'text-amber-400/80' : 'text-pink-500'
            )}>
              Daily check-in
            </p>
            <h1 className={cn(
              'font-serif text-4xl md:text-5xl font-normal leading-tight mb-2',
              darkMode ? 'text-white/93' : 'text-[#2e1624]'
            )}>
              How are you feeling <em className="text-pink-500 italic">today?</em>
            </h1>
            <p className={cn(
              'text-base font-light',
              darkMode ? 'text-white/45' : 'text-pink-400/80'
            )}>
              Log your emotions to understand yourself better.
            </p>
          </div>

          {/* ── JOURNAL CARD ── */}
          <Card className={cn(
            'border shadow-lg overflow-hidden',
            darkMode
              ? 'bg-[rgba(18,10,32,0.76)] border-white/12 backdrop-blur-2xl'
              : 'bg-[rgba(255,249,253,0.92)] border-pink-200/30 backdrop-blur-2xl'
          )}>
            <CardHeader className={cn(
              'pb-3 border-b',
              darkMode ? 'border-white/10' : 'border-pink-100/60'
            )}>
              <div className="flex items-center justify-between">
                <CardTitle className={cn(
                  'text-base font-medium flex items-center gap-2',
                  darkMode ? 'text-white/90' : 'text-[#2e1624]'
                )}>
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 inline-block" />
                  New entry
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/mood-history')}
                  className={cn(
                    'text-xs',
                    darkMode ? 'text-white/50 hover:text-white/80' : 'text-pink-400 hover:text-pink-600'
                  )}
                >
                  <History className="mr-1.5 h-3.5 w-3.5" />
                  View History
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">

                  {/* DATE */}
                  <FormField
                    control={form.control}
                    name="logDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <SectionLabel darkMode={darkMode}>Date</SectionLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-[220px] pl-3 text-left font-normal text-sm',
                                  darkMode
                                    ? 'bg-white/7 border-white/12 text-white/85 hover:bg-white/12'
                                    : 'bg-pink-50/90 border-pink-200/40 text-[#2e1624] hover:bg-pink-100/60'
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={date => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* MOOD */}
                  <FormField
                    control={form.control}
                    name="mood"
                    render={({ field }) => (
                      <FormItem>
                        <SectionLabel darkMode={darkMode} icon={<Smile className="w-3.5 h-3.5" />}>
                          Select your mood
                        </SectionLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
                            {moods.map(mood => (
                              <button
                                key={mood.name}
                                type="button"
                                onClick={() => field.onChange(mood.name)}
                                className={cn(
                                  'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs transition-all duration-200 border',
                                  field.value === mood.name
                                    ? darkMode
                                      ? 'bg-pink-500/15 border-pink-400/50 text-white shadow-[0_0_0_1px_rgba(201,116,143,0.3)]'
                                      : 'bg-pink-100/80 border-pink-400 text-[#2e1624] shadow-[0_0_0_1px_rgba(212,98,138,0.25)]'
                                    : darkMode
                                      ? 'bg-white/6 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/85'
                                      : 'bg-pink-50/70 border-pink-200/30 text-pink-700/70 hover:bg-pink-100/60 hover:text-[#2e1624]',
                                  'hover:-translate-y-0.5'
                                )}
                              >
                                <span className="text-2xl leading-none">{mood.emoji}</span>
                                <span>{mood.name}</span>
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => field.onChange('Custom')}
                              className={cn(
                                'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs transition-all duration-200 border',
                                field.value === 'Custom'
                                  ? darkMode
                                    ? 'bg-pink-500/15 border-pink-400/50 text-white'
                                    : 'bg-pink-100/80 border-pink-400 text-[#2e1624]'
                                  : darkMode
                                    ? 'bg-white/6 border-white/10 text-pink-400/80 hover:bg-white/10'
                                    : 'bg-pink-50/70 border-pink-200/30 text-pink-500 hover:bg-pink-100/60',
                                'hover:-translate-y-0.5'
                              )}
                            >
                              <PlusCircle className="w-6 h-6" />
                              <span>Custom</span>
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CUSTOM MOOD */}
                  {showCustomMoodInput && (
                    <FormField
                      control={form.control}
                      name="customMood"
                      render={({ field }) => (
                        <FormItem>
                          <SectionLabel darkMode={darkMode}>Custom mood</SectionLabel>
                          <FormControl>
                            <Input
                              placeholder="Describe your mood…"
                              {...field}
                              className={cn(
                                'text-sm',
                                darkMode
                                  ? 'bg-white/7 border-white/12 text-white placeholder:text-white/35'
                                  : 'bg-pink-50/90 border-pink-200/40 text-[#2e1624]'
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* INTENSITY */}
                  <FormField
                    control={form.control}
                    name="moodIntensity"
                    render={({ field }) => (
                      <FormItem>
                        <SectionLabel darkMode={darkMode}>
                          Mood intensity — <span className="text-pink-500 font-semibold">{field.value?.[0]}</span>/10
                        </SectionLabel>
                        <FormControl>
                          <Slider
                            value={field.value}
                            max={10}
                            min={1}
                            step={1}
                            onValueChange={field.onChange}
                            className="mt-2"
                          />
                        </FormControl>
                        <div className="flex justify-between mt-1">
                          <span className={cn('text-[10.5px]', darkMode ? 'text-white/38' : 'text-pink-400/70')}>Low</span>
                          <span className={cn('text-[10.5px]', darkMode ? 'text-white/38' : 'text-pink-400/70')}>High</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* THEME */}
                  <FormField
                    control={form.control}
                    name="themeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <SectionLabel darkMode={darkMode} icon={<ImageIcon className="w-3.5 h-3.5" />}>
                          Journal theme
                        </SectionLabel>
                        <FormControl>
                          <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                            {themes.map(theme => (
                              <button
                                key={theme.name}
                                type="button"
                                onClick={() => field.onChange(theme.url)}
                                className={cn(
                                  'flex-shrink-0 w-16 h-11 rounded-lg overflow-hidden transition-all duration-200',
                                  'border-2',
                                  field.value === theme.url
                                    ? 'border-pink-500 shadow-[0_0_0_1.5px_theme(colors.pink.400)]'
                                    : darkMode
                                      ? 'border-white/10 hover:border-pink-400/40'
                                      : 'border-pink-200/30 hover:border-pink-400/50',
                                  'hover:scale-105'
                                )}
                              >
                                {theme.url ? (
                                  <Image
                                    src={theme.url}
                                    alt={theme.name}
                                    width={64}
                                    height={44}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className={cn(
                                    'w-full h-full flex items-center justify-center text-[10px]',
                                    darkMode ? 'bg-white/6 text-white/40' : 'bg-pink-50/80 text-pink-400'
                                  )}>
                                    None
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* JOURNAL ENTRY — Rich Text Editor */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <SectionLabel darkMode={darkMode} icon={<BookText className="w-3.5 h-3.5" />}>
                          Journal entry
                        </SectionLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Anything on your mind today?"
                            themeUrl={selectedTheme}
                          />
                        </FormControl>
                        <FormDescription className={cn(
                          'text-right text-[10.5px] mt-1',
                          (notesValue?.length ?? 0) > 900
                            ? 'text-red-500'
                            : darkMode ? 'text-white/35' : 'text-pink-400/70'
                        )}>
                          {notesValue?.length || 0} / 1000
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* IMAGE UPLOAD */}
                  <FormItem>
                    <SectionLabel darkMode={darkMode} icon={<ImageIcon className="w-3.5 h-3.5" />}>
                      Attach an image
                    </SectionLabel>
                    <FormControl>
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleImageUpload}
                          accept="image/*"
                        />
                        {!imagePreview ? (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                              'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all',
                              'border border-dashed',
                              darkMode
                                ? 'bg-white/5 border-white/18 text-white/45 hover:text-white/70 hover:border-pink-400/40'
                                : 'bg-pink-50/80 border-pink-300/40 text-pink-400 hover:text-pink-600 hover:border-pink-400'
                            )}
                          >
                            <PlusCircle className="w-4 h-4" />
                            Add image
                          </button>
                        ) : (
                          <div className="relative inline-block">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              width={128}
                              height={128}
                              className="object-cover rounded-xl border border-pink-200/30"
                            />
                            <button
                              type="button"
                              onClick={() => { setImagePreview(null); form.setValue('imageUrl', ''); }}
                              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/90 border border-white/40 text-white text-xs flex items-center justify-center hover:scale-110 transition-transform"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>

                  {/* SAVE */}
                  <Button
                    type="submit"
                    size="lg"
                    className={cn(
                      'w-full rounded-xl font-medium tracking-wide border-none',
                      darkMode
                        ? 'bg-gradient-to-r from-[#7d3f52] to-[#c9748f] hover:opacity-88'
                        : 'bg-gradient-to-r from-[#c9748f] to-[#e896b8] hover:opacity-88 text-white'
                    )}
                  >
                    Save entry
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* ── INSIGHTS CARD ── */}
          <Card className={cn(
            'border shadow-lg overflow-hidden',
            darkMode
              ? 'bg-[rgba(18,10,32,0.76)] border-white/12 backdrop-blur-2xl'
              : 'bg-[rgba(255,249,253,0.92)] border-pink-200/30 backdrop-blur-2xl'
          )}>
            <CardHeader className={cn('pb-3 border-b', darkMode ? 'border-white/10' : 'border-pink-100/60')}>
              <CardTitle className={cn(
                'text-base font-medium flex items-center gap-2',
                darkMode ? 'text-white/90' : 'text-[#2e1624]'
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <Brain className="w-4 h-4 text-amber-500" />
                Mood & cycle insights
              </CardTitle>
              <CardDescription className={cn(darkMode ? 'text-white/38' : 'text-pink-400/80')}>
                Understanding how your cycle can influence your emotions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {relevantTip ? (
                <Alert className={cn(
                  'border',
                  darkMode ? 'bg-pink-500/10 border-pink-400/25' : 'bg-pink-50/70 border-pink-200/50'
                )}>
                  <div className={cn(
                    'inline-flex items-center gap-1.5 text-[9.5px] uppercase tracking-widest font-medium mb-2',
                    'bg-pink-100/60 dark:bg-pink-500/15 text-pink-600 dark:text-pink-300',
                    'border border-pink-200/50 dark:border-pink-400/25 rounded-full px-2.5 py-0.5'
                  )}>
                    ✦ {currentPhase}
                  </div>
                  <AlertTitle className={cn('font-medium text-sm', darkMode ? 'text-white/90' : 'text-[#2e1624]')}>
                    {relevantTip.title}
                  </AlertTitle>
                  <AlertDescription className={cn('text-sm', darkMode ? 'text-white/60' : 'text-pink-700/80')}>
                    {relevantTip.tip}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className={cn(
                  'border',
                  darkMode ? 'bg-white/4 border-white/10' : 'bg-pink-50/60 border-pink-200/40'
                )}>
                  <Info className="h-4 w-4 text-pink-400" />
                  <AlertTitle className={cn('font-medium text-sm', darkMode ? 'text-white/90' : 'text-[#2e1624]')}>
                    No cycle data found
                  </AlertTitle>
                  <AlertDescription className={cn('text-sm', darkMode ? 'text-white/55' : 'text-pink-600/80')}>
                    Enter your information in the Period Tracker to get personalized mood insights.
                  </AlertDescription>
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-1.5 text-pink-500 text-sm"
                    onClick={() => router.push('/period-tracker')}
                  >
                    Go to Period Tracker →
                  </Button>
                </Alert>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function SectionLabel({
  children,
  darkMode,
  icon,
}: {
  children: React.ReactNode;
  darkMode: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className={cn(
      'flex items-center gap-2 text-[10px] tracking-[2px] uppercase font-medium mb-2',
      darkMode ? 'text-amber-400/80' : 'text-pink-500'
    )}>
      {icon}
      <span>{children}</span>
      <div className={cn('flex-1 h-px', darkMode ? 'bg-white/8' : 'bg-pink-200/25')} />
    </div>
  );
}
