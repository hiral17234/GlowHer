import { Button } from "@/components/ui/button";
import { GlowHerLogo } from "@/components/glowher/GlowHerLogo";
import { WellnessDashboard } from "@/components/glowher/WellnessDashboard";
import { AppFooter } from "@/components/glowher/AppFooter";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="container mx-auto px-4 py-6 z-10">
        <GlowHerLogo />
      </header>
      <main className="flex-grow">
        <section className="relative container mx-auto text-center py-16 md:py-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-card/50 via-background to-background blur-3xl" />
          <h1 className="font-headline text-4xl md:text-6xl font-bold max-w-3xl mx-auto">
            GlowHer – Your Calm, Your Cycle, Your Mood.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Track your wellness with ease and peace of mind.
          </p>
          <Button size="lg" className="mt-8 px-8 py-6 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl transition-shadow">
            Get Started Free
          </Button>
        </section>

        <WellnessDashboard />
      </main>
      <AppFooter />
    </div>
  );
}
