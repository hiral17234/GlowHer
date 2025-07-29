
"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const execCmd = (command: string) => {
    if (typeof window !== 'undefined' && document) {
        document.execCommand(command, false);
    }
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleToolbarClick = (command: string) => {
    editorRef.current?.focus();
    execCmd(command);
  };
  
  // This effect synchronizes the editor's content with the external value.
  // It's important for scenarios like form resets or loading initial data.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  if (!isMounted) {
    return (
        <div className="w-full rounded-md border border-input bg-background min-h-[250px] p-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
            Loading Editor...
        </div>
    );
  }

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
      </div>
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        className={cn(
            'min-h-[250px] w-full p-3 text-base bg-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            !value && 'text-muted-foreground'
        )}
        dangerouslySetInnerHTML={{ __html: value || "" }}
        data-placeholder={placeholder}
        style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
        }}
        />
    </div>
  );
}


    