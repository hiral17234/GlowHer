
"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Palette, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string | undefined;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);
  const lastValue = useRef(value);

  useEffect(() => {
    if (editorRef.current && !isTypingRef.current && value !== lastValue.current) {
        editorRef.current.innerHTML = value || "";
        lastValue.current = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isTypingRef.current = true;
      const newValue = editorRef.current.innerHTML;
      lastValue.current = newValue;
      onChange(newValue);
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
    editorRef.current?.focus();
    colorInputRef.current?.click();
  };
  
  const handleImageButtonMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      editorRef.current?.focus();
      fileInputRef.current?.click();
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const dataUrl = readerEvent.target?.result;
            if (typeof dataUrl === 'string' && editorRef.current) {
                const imgHtml = `<img src="${dataUrl}" style="max-width: 100%; height: auto; border-radius: 8px;" /><p><br></p>`;
                
                editorRef.current.focus();
                execCmd('insertHTML', imgHtml);
                
                // Set cursor after the inserted image
                const range = document.createRange();
                const sel = window.getSelection();
                if (sel && editorRef.current.lastChild) {
                    range.setStartAfter(editorRef.current.lastChild);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }

                handleInput();
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const editorStyle: React.CSSProperties = themeUrl ? {
    backgroundImage: `url(${themeUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'local',
  } : {
    backgroundColor: 'hsl(var(--background))',
  };

  return (
    <div className="w-full rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <div className="p-2 border-b border-input flex items-center gap-1 flex-wrap">
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
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onMouseDown={handleImageButtonMouseDown}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <input
            type="color"
            ref={colorInputRef}
            className="h-0 w-0 opacity-0 absolute"
            onInput={handleColorChange}
            onChange={handleColorChange}
            aria-label="Font Color"
        />
        <input
            type="file"
            ref={fileInputRef}
            className="h-0 w-0 opacity-0 absolute"
            onChange={handleImageUpload}
            aria-label="Insert Image"
            accept="image/*"
        />
      </div>
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        onBlur={handleBlur}
        className={cn(
            'min-h-[250px] w-full p-3 text-base bg-transparent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300',
            !value && 'text-muted-foreground',
             themeUrl ? 'text-white' : 'text-foreground'
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
