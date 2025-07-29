import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GlowHerLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <Leaf className="h-6 w-6 text-green-500" />
    <span className="font-headline text-2xl font-bold text-foreground">
      GlowHer
    </span>
  </div>
);
