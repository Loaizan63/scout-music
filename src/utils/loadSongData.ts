interface Lyric {
  time: number;
  text: string;
}

/**
 * Fetches lyrics for a song from the database via the API route.
 * Falls back to empty array if the song has no lyrics stored.
 */
export const loadLyrics = async (songId: string): Promise<Lyric[]> => {
  if (!songId) return [];
  try {
    const res = await fetch(`/api/admin/songs/${songId}`);
    if (!res.ok) return [];
    const song = await res.json();
    const lyrics: Lyric[] = song.lyrics ?? [];
    return lyrics.sort((a: Lyric, b: Lyric) => a.time - b.time);
  } catch (e) {
    console.warn('loadLyrics error:', e);
    return [];
  }
};

/**
 * Fetches chord sheet for a song from the database via the API route.
 * Returns empty string if the song has no chords stored.
 */
export const loadChords = async (songId: string): Promise<string> => {
  if (!songId) return '';
  try {
    const res = await fetch(`/api/admin/songs/${songId}`);
    if (!res.ok) return '';
    const song = await res.json();
    return song.chords ?? '';
  } catch (e) {
    console.warn('loadChords error:', e);
    return '';
  }
};
