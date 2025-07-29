
"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  themeUrl?: string;
}

const execCmd = (command: string, value?: string) => {
    if (typeof window !== 'undefined' && document) {
        document.execCommand(command, false, value);
    }
};

export function RichTextEditor({ value, onChange, placeholder, themeUrl }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isTypingRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isTypingRef.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };
  
  const handleBlur = () => {
      isTypingRef.current = false;
  }

  const handleToolbarMouseDown = (e: React.MouseEvent<HTMLButtonElement>, command: string) => {
    e.preventDefault();
    editorRef.current?.focus();
    execCmd(command);
    handleInput();
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editorRef.current?.focus();
    execCmd('foreColor', e.target.value);
    handleInput();
  };

  const handleColorButtonMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    colorInputRef.current?.click();
  };

  const editorStyle: React.CSSProperties = themeUrl ? {
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${themeUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'local',
  } : {};

  return (
    <div className="w-full rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <div className="p-2 border-b border-input flex items-center gap-1">
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onMouseDown={(e) => handleToolbarMouseDown(e, 'bold')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onMouseDown={(e) => handleToolbarMouseDown(e, 'italic')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onMouseDown={(e) => handleToolbarMouseDown(e, 'underline')}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onMouseDown={handleColorButtonMouseDown}
        >
          <Palette className="h-4 w-4" />
        </Button>
        <input
            type="color"
            ref={colorInputRef}
            className="h-0 w-0 opacity-0 absolute"
            onInput={handleColorChange}
            onChange={handleColorChange}
            aria-label="Font Color"
        />
      </div>
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        onBlur={handleBlur}
        className={cn(
            'min-h-[250px] w-full p-3 text-base bg-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300',
            !value && 'text-muted-foreground'
        )}
        data-placeholder={placeholder}
        style={{
            ...editorStyle,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
        }}
        />
    </div>
  );
}
