import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Share2, Minimize2, X, Music, Disc3 } from "lucide-react";
import Image from "next/image";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCoverImage } from "@/utils/getCoverImage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { transposeText } from "@/utils/transpose";

interface Lyric {
  time: number;
  text: string;
}

interface PlayerProps {
  currentSong: {
    id: string;
    title: string;
    artist: string;
    category: string;
    coverUrl: string;
    lyrics?: Lyric[];
    chords?: string;
  } | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onProgressChange: (value: number[]) => void;
  onVolumeChange: (value: number[]) => void;
  onShowChords?: () => void;
  dominantColor: string;
  /** Slug público (/song/[slug]); si falta usa id solo como último recurso */
  songShareSlug?: string | null;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const Player = ({
  currentSong,
  isPlaying,
  progress,
  duration,
  onPlayPause,
  onNext,
  onPrevious,
  onProgressChange,
  onVolumeChange,
  onShowChords,
  dominantColor,
  songShareSlug,
}: PlayerProps) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [volume, setVolume] = useState(70);
  const [viewMode, setViewMode] = useState<'lyrics' | 'chords'>('lyrics');
  const [transposeSteps, setTransposeSteps] = useState(0);

  const getCurrentLyricIndex = () => {
    if (!currentSong?.lyrics) return 0;
    for (let i = currentSong.lyrics.length - 1; i >= 0; i--) {
      if (progress >= currentSong.lyrics[i].time) {
        return i;
      }
    }
    return 0;
  };

  const resetIdleTimer = () => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = setTimeout(() => {
      if (isPlaying && isExpanded) {
        setIsIdle(true);
      }
    }, 4000);
  };

  useEffect(() => {
    if (isExpanded && isPlaying) {
      resetIdleTimer();
    } else {
      setIsIdle(false);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    }
    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [isExpanded, isPlaying]);

  const handleToggleIdle = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, [role="slider"]')) {
      return;
    }
    setIsIdle(!isIdle);
    if (isIdle) {
      resetIdleTimer();
    }
  };

  const currentIndex = getCurrentLyricIndex();

  // Auto-scroll lyrics reference
  const activeLyricRef = useRef<HTMLParagraphElement>(null);

  // Scroll active lyric into view
  // We use currentIndex instead of progress to prevent calling scrollIntoView 
  // multiple times per second, which causes Out of Memory errors in the browser.
  useEffect(() => {
    if (activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentIndex, viewMode, isExpanded]);

  const handleVolumeUp = () => {
    const newVolume = Math.min(100, volume + 10);
    setVolume(newVolume);
    onVolumeChange([newVolume]);
  };

  const handleVolumeDown = () => {
    const newVolume = Math.max(0, volume - 10);
    setVolume(newVolume);
    onVolumeChange([newVolume]);
  };

  const handleVolumeChangeInternal = (value: number[]) => {
    setVolume(value[0]);
    onVolumeChange(value);
  };

  useKeyboardShortcuts({
    onPlayPause,
    onNext,
    onPrevious,
    onVolumeUp: handleVolumeUp,
    onVolumeDown: handleVolumeDown,
    isEnabled: true,
  });

  if (!currentSong) {
    return null;
  }

  const handleShare = async () => {
    const pathSeg = songShareSlug ?? currentSong.id;
    const shareUrl = `${window.location.origin}/song/${encodeURIComponent(pathSeg)}`;
    const shareData = {
      title: currentSong.title,
      text: `Escucha "${currentSong.title}" de ${currentSong.artist}`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        toast({
          title: "Enlace copiado",
          description: "El enlace se ha copiado al portapapeles",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Expanded/Fullscreen view with lyrics
  if (isExpanded && currentSong.lyrics) {
    return (
      <div 
        className="fixed inset-0 z-50 transition-colors duration-1000 animate-fade-in cursor-pointer"
        style={{ 
          background: `radial-gradient(circle at center, ${dominantColor} 0%, hsl(var(--background)) 100%)` 
        }}
        onClick={handleToggleIdle}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl pointer-events-none" />
        <div className="relative h-full flex flex-col p-4 md:p-6 max-w-4xl mx-auto animate-slide-up z-10">
          {/* Header */}
          <div className={`flex items-center justify-between transition-all duration-500 overflow-hidden ${isIdle ? 'h-0 opacity-0 mb-0' : 'h-10 opacity-100 mb-4 md:mb-6'}`}>
            <div className="flex items-center gap-2">
              <Disc3 className={`w-5 h-5 md:w-6 md:h-6 text-accent ${isPlaying ? "animate-spin" : ""}`} />
              <h3 className="text-lg md:text-2xl font-bold">Now Playing</h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                variant="ghost"
                size="icon"
                className="hover:bg-muted hover-lift transition-all duration-200"
                aria-label="Minimizar vista"
              >
                <Minimize2 className="w-5 h-5" />
              </Button>
              <Button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                variant="ghost"
                size="icon"
                className="hover:bg-muted hover-lift transition-all duration-200"
                aria-label="Cerrar vista"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content - Mobile optimized layout */}
          <div className="flex-1 flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 overflow-hidden">
            {/* Album art and info */}
            <div className={`flex flex-col animate-scale-in transition-all duration-700 ${isIdle ? 'md:w-0 md:opacity-0 md:h-0 overflow-hidden absolute pointer-events-none opacity-0 h-0 w-0' : 'w-full opacity-100 h-auto'}`}>
              <div className="aspect-square max-h-48 md:max-h-none rounded-2xl overflow-hidden shadow-2xl mb-4 md:mb-6 relative group hover-glow transition-all duration-300">
                <Image
                  src={getCoverImage(currentSong.coverUrl)}
                  alt={currentSong.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover transition-all duration-500 ${
                    isPlaying ? "scale-110" : "scale-105"
                  }`}
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
                  <h2 className="font-bold text-white text-xl md:text-3xl mb-1 md:mb-2 drop-shadow-2xl">
                    {currentSong.title}
                  </h2>
                  <p className="text-white/90 text-sm md:text-lg drop-shadow-lg">{currentSong.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <span className="inline-block px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm rounded-full bg-primary/20 text-primary border border-primary/30 font-medium">
                  {currentSong.category}
                </span>

                {currentSong.chords && (
                  <Button
                    onClick={() => setViewMode(viewMode === 'lyrics' ? 'chords' : 'lyrics')}
                    variant={viewMode === 'chords' ? 'default' : 'outline'}
                    size="sm"
                    className={`text-xs md:text-sm hover-lift transition-all duration-200 ${
                      viewMode === 'lyrics' ? 'border-accent/30 hover:bg-accent/10 hover:text-accent hover:border-accent' : 'bg-accent text-accent-foreground'
                    }`}
                  >
                    <Music className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    {viewMode === 'chords' ? 'Ver Letra' : 'Modo Fogata'}
                  </Button>
                )}
              </div>
            </div>

            {/* Right Panel: Lyrics or Chords */}
            <div className={`flex flex-col min-h-0 bg-black/20 rounded-2xl p-4 md:p-6 backdrop-blur-md border border-white/5 relative transition-all duration-700 ${isIdle ? 'md:col-span-2 col-span-1 flex-1 h-full' : 'flex-1'}`}>
              {viewMode === 'lyrics' ? (
                <>
                  <h4 className={`text-base md:text-xl font-semibold flex items-center gap-2 text-white transition-all duration-500 overflow-hidden ${isIdle ? 'h-0 mb-0 opacity-0' : 'mb-3 md:mb-4 h-6 opacity-100'}`}>
                    <span className="text-accent text-xl md:text-2xl animate-pulse">♪</span> Karaoke
                  </h4>
                  <ScrollArea className="flex-1 pr-2 md:pr-4">
                    <div className="space-y-4 md:space-y-6 pb-20 pt-10">
                      {currentSong.lyrics && currentSong.lyrics.length > 0 ? (
                        currentSong.lyrics.map((lyric, index) => {
                          const isActive = index === currentIndex;
                          return (
                            <p
                              key={index}
                              ref={isActive ? activeLyricRef : null}
                              onClick={() => onProgressChange([lyric.time])}
                              className={`transition-all duration-500 cursor-pointer hover:text-white hover-lift active:scale-95 ${
                                isActive
                                  ? "text-white font-bold text-2xl md:text-3xl scale-105 origin-left shadow-[0_0_15px_hsl(var(--accent)/0.1)] py-1"
                                  : "text-white/50 text-xl md:text-2xl"
                              }`}
                            >
                              {lyric.text || "♪"}
                            </p>
                          );
                        })
                      ) : (
                        <p className="text-white/50 italic text-center mt-10">
                          Letra no disponible para esta canción.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h4 className="text-base md:text-xl font-semibold flex items-center gap-2 text-white">
                      🔥 Acordes
                    </h4>
                    <div className="flex items-center gap-2 bg-black/40 rounded-full p-1 border border-white/10">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setTransposeSteps(s => s - 1)}
                        className="h-8 w-8 p-0 rounded-full text-white hover:bg-white/20"
                      >
                        -1
                      </Button>
                      <span className="text-xs font-bold w-12 text-center text-accent">
                        {transposeSteps > 0 ? `+${transposeSteps}` : transposeSteps}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setTransposeSteps(s => s + 1)}
                        className="h-8 w-8 p-0 rounded-full text-white hover:bg-white/20"
                      >
                        +1
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 pr-2 md:pr-4">
                    <div className="pb-10 font-mono text-sm md:text-base leading-relaxed text-white whitespace-pre-wrap">
                      {transposeText(currentSong.chords || "", transposeSteps)}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          </div>

          {/* Player Controls */}
          <div className={`mt-auto pt-6 border-t border-border transition-all duration-500 overflow-hidden ${isIdle ? 'h-0 opacity-0 pt-0 border-transparent pointer-events-none' : 'h-auto opacity-100'}`}>
            <div className="max-w-2xl mx-auto">
              {/* Progress Bar */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-muted-foreground min-w-[40px]">
                  {formatTime(progress)}
                </span>
                <Slider
                  value={[progress]}
                  max={duration}
                  step={1}
                  onValueChange={onProgressChange}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[40px]">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={onPrevious}
                  className="text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-200"
                  aria-label="Canción anterior"
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                <button
                  onClick={onPlayPause}
                  className={`w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-110 active:scale-100 transition-all duration-200 shadow-lg ${
                    isPlaying ? "animate-pulse-glow" : ""
                  }`}
                  aria-label={isPlaying ? "Pausar" : "Reproducir"}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" fill="currentColor" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                  )}
                </button>

                <button
                  onClick={onNext}
                  className="text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-200"
                  aria-label="Siguiente canción"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal player view (bottom bar)
  return (
    <div className="fixed bottom-0 left-0 right-0 p-2 md:p-4 z-40 pointer-events-none pb-[env(safe-area-inset-bottom,0.5rem)]">
      <div 
        className="pointer-events-auto max-w-7xl mx-auto rounded-2xl md:rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors duration-1000 overflow-hidden animate-slide-up relative"
        style={{
          background: `linear-gradient(to top, rgba(0,0,0,0.85), ${dominantColor.replace(/rgba?\(([^)]+)\)/, 'rgba($1, 0.3)')})`,
          backdropFilter: 'blur(30px)'
        }}
      >
        {/* Subtle highlight at the top edge */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Mobile Layout */}
        <div className="lg:hidden p-2 md:p-3 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden hover-lift hover-glow transition-all duration-300 cursor-pointer">
            <Image
              src={getCoverImage(currentSong.coverUrl)}
              alt={currentSong.title}
              fill
              sizes="48px"
              className="object-cover"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate text-sm">{currentSong.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong.artist}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={handleShare}
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover-lift transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            {currentSong.lyrics && (
              <Button
                onClick={() => setIsExpanded(true)}
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover-lift transition-all duration-200"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onPrevious}
            className="text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={onPlayPause}
            className={`w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-110 active:scale-100 transition-all duration-200 shadow-lg flex-shrink-0 ${
              isPlaying ? "animate-pulse-glow" : ""
            }`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
            )}
          </button>

          <button
            onClick={onNext}
            className="text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-2">
            <Slider
              value={[progress]}
              max={duration}
              step={1}
              onValueChange={onProgressChange}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground min-w-[35px] text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Song Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden hover-lift hover-glow transition-all duration-300 cursor-pointer flex-shrink-0">
              <Image
                src={getCoverImage(currentSong.coverUrl)}
                alt={currentSong.title}
                fill
                sizes="56px"
                className="object-cover"
                priority
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{currentSong.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {currentSong.artist}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleShare}
                variant="ghost"
                size="icon"
                className="flex-shrink-0 hover-lift transition-all duration-200"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              {currentSong.lyrics && (
                <Button
                  onClick={() => setIsExpanded(true)}
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 hover-lift transition-all duration-200"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-[2] max-w-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={onPrevious}
              className="text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Canción anterior"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={onPlayPause}
              className={`w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-110 active:scale-100 transition-all duration-200 shadow-lg ${
                isPlaying ? "animate-pulse-glow" : ""
              }`}
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
              )}
            </button>

            <button
              onClick={onNext}
              className="text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Siguiente canción"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center gap-2">
            <span className="text-xs text-muted-foreground min-w-[40px]">
              {formatTime(progress)}
            </span>
            <Slider
              value={[progress]}
              max={duration}
              step={1}
              onValueChange={onProgressChange}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

          {/* Volume */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <Slider 
              value={[volume]} 
              max={100} 
              step={1} 
              onValueChange={handleVolumeChangeInternal}
              className="w-24" 
            />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
