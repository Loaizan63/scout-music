'use client';

import { useState, useEffect } from "react";
import { Music, ArrowLeft, Play, Pause, MoreVertical, FileText } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import SongDetailView from "@/components/SongDetailView";
import { Song } from "@/lib/data";
import { useAudio } from "@/contexts/AudioContext";
import { AlbumCard } from "@/components/AlbumCard";
import Image from "next/image";
import { getCoverImage } from "@/utils/getCoverImage";
import { Button } from "@/components/ui/button";

interface HomeClientProps {
  initialSongs: Song[];
  initialCategories: string[];
}

export default function HomeClient({ initialSongs, initialCategories }: HomeClientProps) {
  const { songs, setSongs, playSong, currentSongIndex, isPlaying } = useAudio();
  
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSongDetail, setSelectedSongDetail] = useState<Song | null>(null);

  useEffect(() => {
    // Populate the global AudioContext playlist if it's empty
    if (songs.length === 0 && initialSongs.length > 0) {
      setSongs(initialSongs);
    }
  }, [initialSongs, songs.length, setSongs]);

  // Use the context songs if available, else fallback to initialSongs for initial render
  const displaySongs = songs.length > 0 ? songs : initialSongs;

  // Filter for search
  const query = searchQuery.toLowerCase().trim();
  const searchResults = query
    ? displaySongs.filter(
        (song) =>
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.category.toLowerCase().includes(query)
      )
    : [];

  const handlePlayAlbum = (albumSongs: Song[]) => {
    if (albumSongs.length > 0) {
      const globalIndex = displaySongs.findIndex(s => s.id === albumSongs[0].id);
      playSong(globalIndex);
    }
  };

  const handlePlaySong = (song: Song) => {
    const globalIndex = displaySongs.findIndex(s => s.id === song.id);
    playSong(globalIndex);
  };

  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // View: Song Detail Fullscreen
  if (selectedSongDetail) {
    return (
      <SongDetailView 
        initialSong={selectedSongDetail} 
        allSongs={displaySongs} 
        onBack={() => setSelectedSongDetail(null)} 
      />
    );
  }

  // View: Album Detail
  if (selectedAlbum && !query) {
    const albumSongs = displaySongs.filter(s => s.category === selectedAlbum);
    const coverUrl = albumSongs[0]?.coverUrl || "";
    
    // Check if any song in this album is currently playing
    const isAlbumPlaying = isPlaying && albumSongs.some(s => displaySongs.findIndex(ds => ds.id === s.id) === currentSongIndex);

    return (
      <div className="min-h-screen flex flex-col bg-background pb-32 animate-fade-in relative overflow-hidden">
        {/* Dynamic Gradient Background for Album Detail */}
        <div className="absolute inset-0 h-96 opacity-55 pointer-events-none transition-colors duration-1000 bg-[linear-gradient(180deg,rgba(128,59,255,0.42),rgba(34,197,94,0.22),transparent)]" />
        <div className="absolute inset-x-0 top-0 h-[28rem] pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(55,255,170,0.16),transparent_28%),radial-gradient(circle_at_top_left,rgba(155,81,224,0.18),transparent_30%)]" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 w-full pt-6 relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedAlbum(null)}
            className="mb-6 hover-lift bg-black/20 backdrop-blur-md border border-white/5 text-white rounded-full px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Álbumes
          </Button>

          {/* Album Header */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 mb-10 pb-8 border-b border-white/10">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 self-center md:self-auto">
              <Image
                src={getCoverImage(coverUrl)}
                alt={selectedAlbum}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 192px, 256px"
                priority
              />
            </div>
            <div className="flex-1 space-y-3 text-center md:text-left">
              <p className="text-sm font-bold tracking-widest uppercase text-white/70">Álbum</p>
              <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight">
                {selectedAlbum}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-1">
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                  Scout Music <span className="w-1 h-1 rounded-full bg-white/30" /> {albumSongs.length} canciones
                </p>
                <div className="">
                  <button
                    onClick={() => isAlbumPlaying ? playSong(currentSongIndex) : handlePlayAlbum(albumSongs)}
                    aria-label="Reproducir álbum"
                    className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_0_20px_hsl(var(--accent)/0.4)] hover:scale-105 active:scale-95 transition-all"
                  >
                    {isAlbumPlaying ? (
                      <Pause className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                    ) : (
                      <Play className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tracklist Table */}
          <div className="space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-[32px_48px_1fr_50px] md:grid-cols-[32px_48px_1fr_100px_50px] gap-3 px-4 py-2 text-sm text-muted-foreground border-b border-white/5 mb-4 font-medium uppercase tracking-wider">
              <div className="text-center">#</div>
              <div></div>
              <div>Título</div>
              <div className="hidden md:block">Duración</div>
              <div></div>
            </div>

            {/* Tracks */}
            {albumSongs.map((song, index) => {
              const globalIndex = displaySongs.findIndex(s => s.id === song.id);
              const isThisSongPlaying = isPlaying && currentSongIndex === globalIndex;
              const isCurrentSong = currentSongIndex === globalIndex;
              
              return (
                <div 
                  key={song.id}
                  onClick={() => handlePlaySong(song)}
                  className="group grid grid-cols-[32px_48px_1fr_50px] md:grid-cols-[32px_48px_1fr_100px_50px] gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer items-center"
                >
                  {/* Track number / play icon */}
                  <div className="text-center w-8 flex-shrink-0">
                    {isThisSongPlaying ? (
                      <Music className="w-4 h-4 text-accent animate-pulse mx-auto" />
                    ) : (
                      <>
                        <span className={`text-muted-foreground group-hover:hidden text-sm ${isCurrentSong ? 'text-accent' : ''}`}>{index + 1}</span>
                        <Play className="w-4 h-4 text-white hidden group-hover:block mx-auto" fill="currentColor" />
                      </>
                    )}
                  </div>

                  {/* Cover thumbnail */}
                  <div className="relative w-10 h-10 flex-shrink-0 rounded-md overflow-hidden">
                    <Image
                      src={getCoverImage(song.coverUrl)}
                      alt={song.title}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                    {/* Play overlay on hover */}
                    <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                      isThisSongPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {isThisSongPlaying
                        ? <Music className="w-3 h-3 text-accent" />
                        : <Play className="w-3 h-3 text-white" fill="currentColor" />}
                    </div>
                  </div>

                  {/* Title & artist */}
                  <div className="min-w-0">
                    <p className={`font-semibold truncate text-sm ${isCurrentSong ? 'text-accent' : 'text-foreground'}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  </div>

                  {/* Duration */}
                  <div className="hidden md:block text-muted-foreground text-sm">
                    {formatDuration(song.duration)}
                  </div>

                  {/* Review / description button */}
                  <div className="flex justify-end">
                    {song.description ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-white h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSongDetail(song);
                        }}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  // View: Albums Grid or Search Results
  return (
      <div className="min-h-screen flex flex-col bg-background pb-32 relative overflow-hidden">
      {/* Background Gradient for Main View */}
        <div className="fixed top-0 left-0 right-0 h-[32rem] opacity-70 pointer-events-none transition-colors duration-1000 z-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.42),transparent_44%),radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.18),transparent_34%),radial-gradient(ellipse_at_top_left,rgba(147,51,234,0.24),transparent_58%)]" />
      
      <main className="flex-1 overflow-y-auto relative z-10 pt-8 md:pt-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
              {query ? "Resultados" : "Álbumes"}
            </h1>
            <p className="text-muted-foreground font-medium text-lg">
              {query ? `${searchResults.length} encontradas` : 'Colección completa'}
            </p>
          </div>

          <div className="w-full md:w-96">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>

        {/* Content Grid */}
        {query ? (
          // Search Results (Songs directly)
          searchResults.length > 0 ? (
            <div className="space-y-2">
               {searchResults.map((song) => {
                  const globalIndex = displaySongs.findIndex(s => s.id === song.id);
                  const isThisSongPlaying = isPlaying && currentSongIndex === globalIndex;
                  return (
                    <div 
                      key={song.id}
                      onClick={() => playSong(globalIndex)}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10"
                    >
                      <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                        <Image src={getCoverImage(song.coverUrl)} alt={song.title} fill className="object-cover" />
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isThisSongPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {isThisSongPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${isThisSongPlaying ? 'text-accent' : 'text-foreground'}`}>{song.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{song.artist} • {song.category}</p>
                      </div>
                    </div>
                  );
               })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Music className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium">No se encontraron resultados</p>
            </div>
          )
        ) : (
          // Albums Grid
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {initialCategories.map((cat) => {
              const albumSongs = displaySongs.filter((s) => s.category === cat);
              if (albumSongs.length === 0) return null;
              
              return (
                <AlbumCard
                  key={cat}
                  albumName={cat}
                  coverUrl={albumSongs[0].coverUrl}
                  songCount={albumSongs.length}
                  onClick={() => setSelectedAlbum(cat)}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
