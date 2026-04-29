import { Play, Pause, FileText } from "lucide-react";
import Image from "next/image";
import { getCoverImage } from "@/utils/getCoverImage";
import { useState } from "react";

import { Song } from "@/lib/data";

interface SongCardProps {
  song: Song;
  isPlaying: boolean;
  onPlay: () => void;
  onShowDescription?: (song: SongCardProps["song"]) => void;
}

const formatDuration = (seconds: number): string => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const SongCard = ({ song, isPlaying, onPlay, onShowDescription }: SongCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div className="group flex flex-col gap-3">
      {/* Artwork Container */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/20">
        <Image
          src={getCoverImage(song.coverUrl)}
          alt={song.title}
          fill
          className={`object-cover transition-all duration-500 ${
            isImageLoaded ? "opacity-100" : "opacity-0 scale-95"
          } group-hover:scale-105`}
          onLoad={() => setIsImageLoaded(true)}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        />
        
        {/* Play Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={onPlay}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground transform transition-transform hover:scale-110 active:scale-95 shadow-xl"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 ml-1" fill="currentColor" />
            )}
          </button>
        </div>

        {/* Info Overlay Buttons (top right) */}
        {song.description && onShowDescription && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowDescription(song);
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-md"
          >
            <FileText className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Info Container */}
      <div className="flex flex-col gap-1">
        <h3 
          className="font-medium text-foreground truncate text-sm md:text-base" 
          title={song.title}
        >
          {song.title}
        </h3>
        <p 
          className="text-xs text-muted-foreground truncate" 
          title={song.artist}
        >
          {song.artist}
        </p>
      </div>
    </div>
  );
};
