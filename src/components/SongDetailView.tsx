'use client';

import { useEffect } from "react";
import Image from "next/image";
import { Play, Pause, Home, Share2, ArrowLeft } from "lucide-react";
import { Song } from "@/lib/data";
import { useAudio } from "@/contexts/AudioContext";
import { getCoverImage } from "@/utils/getCoverImage";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface SongDetailViewProps {
  initialSong: Song;
  allSongs: Song[];
  onBack?: () => void;
}

export default function SongDetailView({ initialSong, allSongs, onBack }: SongDetailViewProps) {
  const { songs, setSongs, playSong, currentSongIndex, isPlaying } = useAudio();
  const { toast } = useToast();
  
  // Set the playlist context on mount if it's empty
  useEffect(() => {
    if (songs.length === 0 && allSongs.length > 0) {
      setSongs(allSongs);
    }
  }, [allSongs, songs.length, setSongs]);

  const globalIndex = allSongs.findIndex(s => s.id === initialSong.id);
  // Check if THIS specific song is currently playing in the global context
  const isThisSongPlaying = isPlaying && currentSongIndex === globalIndex;

  const handlePlayClick = () => {
    playSong(globalIndex);
  };

  const handleShare = async () => {
    // If we are sharing from the global app, the URL might not be /song/[id] yet,
    // so we construct the direct link to the song.
    const shareUrl = `${window.location.origin}/song/${initialSong.id}`;
    const shareData = {
      title: initialSong.title,
      text: `Escucha "${initialSong.title}" de ${initialSong.artist}`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Enlace copiado",
          description: "El enlace se ha copiado al portapapeles",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Blur Effect (Spotify style) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={getCoverImage(initialSong.coverUrl)}
          alt="Background"
          fill
          className="object-cover opacity-20 blur-[100px] scale-150 transform-gpu"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full p-4 md:p-6 flex items-center justify-between">
        {onBack ? (
          <Button onClick={onBack} variant="ghost" size="icon" className="hover-lift rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/40">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
        ) : (
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover-lift rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/40">
              <Home className="w-5 h-5 text-white" />
            </Button>
          </Link>
        )}
        
        <span className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-white/50">
          Campfire Tunes
        </span>
        <Button onClick={handleShare} variant="ghost" size="icon" className="hover-lift rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/40">
          <Share2 className="w-5 h-5 text-white" />
        </Button>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 pb-40">
        <div className="w-full max-w-md flex flex-col items-center animate-slide-up">
          
          {/* Cover Art */}
          <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 transition-all duration-700 ${isThisSongPlaying ? 'scale-105 shadow-[0_20px_60px_rgba(var(--primary),0.3)]' : 'scale-100 hover:scale-105'}`}>
            <Image
              src={getCoverImage(initialSong.coverUrl)}
              alt={initialSong.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 256px, 320px"
            />
          </div>

          {/* Song Info */}
          <div className="text-center space-y-3 mb-10 w-full px-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg truncate">
              {initialSong.title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-medium">
              {initialSong.artist}
            </p>
            {initialSong.category && (
              <span className="inline-block mt-4 px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full bg-white/10 text-white/90 border border-white/20 backdrop-blur-sm">
                {initialSong.category}
              </span>
            )}
          </div>

          {/* Play Button */}
          <button
            onClick={handlePlayClick}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 ${
              isThisSongPlaying 
                ? 'bg-accent text-accent-foreground animate-pulse-glow shadow-[0_0_30px_hsl(var(--accent)/0.5)]' 
                : 'bg-primary text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.5)]'
            }`}
          >
            {isThisSongPlaying ? (
              <Pause className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" />
            ) : (
              <Play className="w-8 h-8 md:w-10 md:h-10 ml-2" fill="currentColor" />
            )}
          </button>
          
          {/* Description */}
          {initialSong.description && (
            <div className="mt-12 text-center max-w-sm bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/5">
              <p className="text-white/70 text-sm leading-relaxed">
                {initialSong.description}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
