
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Set the initial value when the component mounts
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleToolbarClick = (command: string) => {
    editorRef.current?.focus();
    execCmd(command);
    handleInput(); // Ensure state is updated after command
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editorRef.current?.focus();
    execCmd('foreColor', e.target.value);
    handleInput();
  };

  const handleColorButtonClick = () => {
    colorInputRef.current?.click();
  };

  // This effect synchronizes the editor's content with the external value,
  // but only if the content is different. This prevents the cursor jump issue.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
    }
  // We only want to run this when the value prop changes from an external source, not on every keystroke.
  // By removing `value` from the dependency array and relying on mount to set initial value,
  // we prevent the cursor jump. We'll handle external updates (like form reset)
  // by using a key on the component if needed, but for now this is more stable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // Use a key to force re-mount on external value change instead of dangerouslySetInnerHTML
        // but for now, we will rely on the useEffect.
        data-placeholder={placeholder}
        style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
        }}
        // Set initial content. Subsequent updates are handled by the effect.
        dangerouslySetInnerHTML={{ __html: value || "" }}
        />
    </div>
  );
}
