interface Lyric {
  time: number;
  text: string;
}

interface SongData {
  lyrics: Lyric[];
  chords: string;
}

// Single fetch that returns both lyrics and chords — avoids two round-trips per song change
async function fetchSongData(songId: string): Promise<SongData> {
  if (!songId) return { lyrics: [], chords: '' };
  try {
    const res = await fetch(`/api/admin/songs/${songId}`);
    if (!res.ok) return { lyrics: [], chords: '' };
    const song = await res.json();
    const lyrics: Lyric[] = (song.lyrics ?? []).sort((a: Lyric, b: Lyric) => a.time - b.time);
    return { lyrics, chords: song.chords ?? '' };
  } catch (e) {
    console.warn('fetchSongData error:', e);
    return { lyrics: [], chords: '' };
  }
}

export const loadLyrics = async (songId: string): Promise<Lyric[]> => {
  const { lyrics } = await fetchSongData(songId);
  return lyrics;
};

export const loadChords = async (songId: string): Promise<string> => {
  const { chords } = await fetchSongData(songId);
  return chords;
};
