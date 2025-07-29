
"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const execCmd = (command: string, value?: string) => {
    if (typeof window !== 'undefined' && document) {
        document.execCommand(command, false, value);
    }
};


export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  // To prevent cursor jumping, we only set the innerHTML when the value prop changes from an external source.
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);


  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleToolbarClick = (command: string) => {
    editorRef.current?.focus();
    execCmd(command);
    handleInput();
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editorRef.current?.focus();
    execCmd('foreColor', e.target.value);
    handleInput();
  };

  const handleColorButtonClick = () => {
    // We prevent default to stop the editor from losing focus when the button is clicked.
    // This is important for applying styles correctly.
    colorInputRef.current?.click();
  };

  return (
    <div className="w-full rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <div className="p-2 border-b border-input flex items-center gap-1">
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onMouseDown={(e) => { e.preventDefault(); handleToolbarClick('bold'); }}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onMouseDown={(e) => { e.preventDefault(); handleToolbarClick('italic'); }}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onMouseDown={(e) => { e.preventDefault(); handleToolbarClick('underline'); }}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onMouseDown={(e) => { e.preventDefault(); handleColorButtonClick(); }}
        >
          <Palette className="h-4 w-4" />
        </Button>
        <input
            type="color"
            ref={colorInputRef}
            className="h-0 w-0 opacity-0 absolute"
            onChange={handleColorChange}
            aria-label="Font Color"
        />
      </div>
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        className={cn(
            'min-h-[250px] w-full p-3 text-base bg-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            !value && 'text-muted-foreground'
        )}
        data-placeholder={placeholder}
        style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
        }}
        />
    </div>
  );
}
