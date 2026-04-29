'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { loadLyrics, loadChords } from '@/utils/loadSongData';
import { Song } from '@/lib/data';
import { Player } from '@/components/Player';
import { ChordsDialog } from '@/components/ChordsDialog';
import { FastAverageColor } from 'fast-average-color';
import { getCoverImage } from '@/utils/getCoverImage';
import { resolveMediaUrl } from '@/utils/resolveMediaUrl';

interface AudioContextType {
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  currentSongIndex: number;
  playSong: (index: number) => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
  nextSong: () => void;
  previousSong: () => void;
  currentSong: Song | null;
  dominantColor: string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [currentLyrics, setCurrentLyrics] = useState<Array<{ time: number; text: string }>>([]);
  const [currentChords, setCurrentChords] = useState("");
  const [showChordsDialog, setShowChordsDialog] = useState(false);
  const [dominantColor, setDominantColor] = useState("rgba(0,0,0,0.5)");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = songs[currentSongIndex] || null;

  useEffect(() => {
    if (!currentSong) return;

    // Single fetch for both lyrics and chords
    const loadData = async () => {
      const [lyrics, chords] = await Promise.all([
        loadLyrics(currentSong.id),
        loadChords(currentSong.id),
      ]);
      setCurrentLyrics(lyrics);
      setCurrentChords(chords);
    };
    loadData();

    // Extract dominant color — skip for external URLs to avoid CORS issues
    const coverObj = getCoverImage(currentSong.coverUrl);
    const imageUrl = typeof coverObj === 'string' ? coverObj : coverObj.src;
    const isExternal = imageUrl.startsWith('http');

    if (!isExternal) {
      const fac = new FastAverageColor();
      fac.getColorAsync(imageUrl)
        .then(color => setDominantColor(color.rgba))
        .catch(() => setDominantColor('rgba(0,0,0,0.5)'));
      return () => fac.destroy();
    } else {
      // For external images, derive a neutral dark color without CORS fetch
      setDominantColor('rgba(20,20,30,0.85)');
    }
  }, [currentSong?.id]);

  useEffect(() => {
    if (!audioRef.current || !currentSong?.audioUrl) return;

    const audio = audioRef.current;
    const resolvedSrc = resolveMediaUrl(currentSong.audioUrl);
    
    // Only update src if it changed
    if (resolvedSrc && audio.src !== resolvedSrc) {
      audio.src = resolvedSrc;
      audio.load();
    }
    
    if (isPlaying) {
      audio.play().catch(e => console.error("Playback failed", e));
    }

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => nextSong();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Playback error", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Sync URL when song changes and is playing
  useEffect(() => {
    if (currentSong && isPlaying) {
      const newUrl = `/song/${currentSong.id}`;
      if (window.location.pathname !== newUrl) {
        window.history.pushState(null, '', newUrl);
      }
    }
  }, [currentSong?.id, isPlaying]);

  const playSong = (index: number) => {
    if (currentSongIndex === index) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSongIndex(index);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (songs.length === 0) return;
    setCurrentSongIndex((currentSongIndex + 1) % songs.length);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const previousSong = () => {
    if (songs.length === 0) return;
    setCurrentSongIndex(currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100;
    }
  };

  // Memoize context value to prevent excessive re-renders of HomeClient when currentTime changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contextValue = useMemo(() => ({
    songs,
    setSongs,
    currentSongIndex,
    playSong,
    isPlaying,
    togglePlayPause,
    nextSong,
    previousSong,
    currentSong,
    dominantColor,
  }), [songs, currentSongIndex, isPlaying, currentSong?.id, dominantColor]);

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} />
      
      <Player
        currentSong={currentSong ? { ...currentSong, lyrics: currentLyrics, chords: currentChords } : null}
        isPlaying={isPlaying}
        progress={currentTime}
        duration={duration}
        onPlayPause={togglePlayPause}
        onNext={nextSong}
        onPrevious={previousSong}
        onProgressChange={handleProgressChange}
        onVolumeChange={handleVolumeChange}
        onShowChords={() => setShowChordsDialog(true)}
        dominantColor={dominantColor}
      />

      <ChordsDialog
        isOpen={showChordsDialog}
        onClose={() => setShowChordsDialog(false)}
        song={currentSong ? { ...currentSong, chords: currentChords } : null}
      />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
