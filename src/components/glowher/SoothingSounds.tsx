import { Music } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const playlists = [
  {
    title: 'Meditation',
    description: 'Find your inner peace.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'meditation nature',
    link: 'https://music.youtube.com/search?q=meditation+music',
  },
  {
    title: 'Calming Rain',
    description: 'Relax to the sound of rain.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'rain window',
    link: 'https://music.youtube.com/search?q=calming+rain+sounds',
  },
  {
    title: 'Soft Piano',
    description: 'Gentle melodies to soothe your soul.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'piano keys',
    link: 'https://music.youtube.com/search?q=soft+piano+music',
  },
  {
    title: 'Lofi Beats',
    description: 'Chill beats to study/relax to.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'lofi study',
    link: 'https://music.youtube.com/search?q=lofi+beats',
  },
];

export function SoothingSounds() {
  return (
    <Card className="bg-green-500/5 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-shadow duration-300" style={{'--tw-shadow-color': '#D4EAC8'}}>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-2xl">
          <Music /> Soothing Sounds
        </CardTitle>
        <CardDescription>Listen to calming playlists for relaxation and focus.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {playlists.map((playlist) => (
            <a href={playlist.link} key={playlist.title} target="_blank" rel="noopener noreferrer" className="block group">
              <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <Image
                  src={playlist.imageUrl}
                  alt={playlist.title}
                  data-ai-hint={playlist.aiHint}
                  width={80}
                  height={80}
                  className="rounded-md aspect-square object-cover"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold">{playlist.title}</h3>
                  <p className="text-sm text-muted-foreground">{playlist.description}</p>
                </div>
                <Badge variant="secondary" className="hidden sm:inline-flex group-hover:bg-accent transition-colors">Listen</Badge>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
