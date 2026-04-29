import Image from "next/image";
import { getCoverImage } from "@/utils/getCoverImage";

interface AlbumCardProps {
  albumName: string;
  coverUrl: string;
  songCount: number;
  onClick: () => void;
}

export const AlbumCard = ({ albumName, coverUrl, songCount, onClick }: AlbumCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col gap-3 cursor-pointer"
    >
      {/* Artwork Container */}
      <div className="relative aspect-square overflow-hidden rounded-2xl md:rounded-3xl bg-muted/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500">
        <Image
          src={getCoverImage(coverUrl)}
          alt={albumName}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          priority
        />
        <div className="absolute inset-0 bg-black/5 transition-opacity duration-500 group-hover:opacity-0" />
      </div>

      {/* Info Container */}
      <div className="flex flex-col gap-1 text-center mt-2">
        <h3 className="font-bold text-foreground truncate text-base md:text-lg">
          {albumName}
        </h3>
        <p className="text-sm text-muted-foreground">
          {songCount} {songCount === 1 ? 'canción' : 'canciones'}
        </p>
      </div>
    </div>
  );
};
