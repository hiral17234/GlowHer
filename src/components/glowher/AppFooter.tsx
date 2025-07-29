import { Instagram, Youtube, Mail } from 'lucide-react';
import { GlowHerLogo } from './GlowHerLogo';

export function AppFooter() {
  return (
    <footer className="bg-primary/30 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <GlowHerLogo />
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-foreground">
            <a href="#" className="hover:text-primary-foreground hover:underline">About</a>
            <a href="#" className="hover:text-primary-foreground hover:underline">Contact</a>
            <a href="#" className="hover:text-primary-foreground hover:underline">Terms of Service</a>
            <a href="#" className="hover:text-primary-foreground hover:underline">Privacy Policy</a>
          </nav>
          <div className="flex gap-4">
            <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" aria-label="YouTube" className="text-muted-foreground hover:text-foreground">
              <Youtube className="h-6 w-6" />
            </a>
            <a href="#" aria-label="Email" className="text-muted-foreground hover:text-foreground">
              <Mail className="h-6 w-6" />
            </a>
          </div>
        </div>
        <div className="text-center text-muted-foreground text-xs mt-8 pt-6 border-t border-primary/50">
          &copy; {new Date().getFullYear()} GlowHer Wellness. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
