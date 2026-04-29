import pool from '@/lib/db';
import { findSongByPublicSlug } from '@/utils/songSlug';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Song {
  id: string;
  title: string;
  artist: string;
  category: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  description: string;
  chords?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lyric {
  id: number;
  song_id: string;
  time: number;
  text: string;
}

// Fetch all songs or with filters
export async function fetchSongs(filters?: {
  category?: string;
  search?: string;
  limit?: number;
}): Promise<Song[]> {
  try {
    let query = 'SELECT * FROM songs WHERE 1=1';
    const params: (string | number)[] = [];

    if (filters?.category) {
      query += ' AND category LIKE ?';
      params.push(`%${filters.category}%`);
    }

    if (filters?.search) {
      query += ' AND (title LIKE ? OR artist LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at ASC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return (rows as Song[]).map(s => ({ ...s, duration: Number(s.duration) ?? 0 }));
  } catch (error) {
    console.error('Error fetching songs from DB:', error);
    return [];
  }
}

// Fetch a single song by ID (including its lyrics)
export async function fetchSongByPublicSlug(slug: string): Promise<Song | null> {
  try {
    const songs = await fetchSongs();
    const matched = findSongByPublicSlug(slug, songs);
    if (!matched) return null;
    return fetchSongById(matched.id);
  } catch (error) {
    console.error('Error fetching song by slug:', error);
    return null;
  }
}

export async function fetchSongById(id: string): Promise<Song | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM songs WHERE id = ?', [id]);
    if (rows.length === 0) return null;

    const song = rows[0] as Song;
    const [lyricRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM lyrics WHERE song_id = ? ORDER BY time ASC',
      [id]
    );
    return { ...song, lyrics: lyricRows as Lyric[] } as Song & { lyrics: Lyric[] };
  } catch (error) {
    console.error('Error fetching song by ID:', error);
    return null;
  }
}

// Get all unique categories
export async function fetchCategories(): Promise<string[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT DISTINCT category FROM songs ORDER BY category ASC'
    );
    return rows.map((r) => r.category as string);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Create a new song
export async function createSong(data: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO songs (id, title, artist, category, duration, coverUrl, audioUrl, description, chords)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.title, data.artist, data.category, data.duration, data.coverUrl, data.audioUrl, data.description, data.chords ?? null]
  );
  return id;
}

// Update an existing song
export async function updateSong(id: string, data: Partial<Omit<Song, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const fields = Object.keys(data).map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await pool.query(`UPDATE songs SET ${fields}, updated_at = NOW() WHERE id = ?`, values);
}

// Delete a song (cascades to lyrics if FK set, otherwise delete manually)
export async function deleteSong(id: string): Promise<void> {
  await pool.query('DELETE FROM lyrics WHERE song_id = ?', [id]);
  await pool.query('DELETE FROM songs WHERE id = ?', [id]);
}

// Update lyrics for a song (replace all)
export async function updateLyrics(songId: string, lyrics: { time: number; text: string }[]): Promise<void> {
  await pool.query('DELETE FROM lyrics WHERE song_id = ?', [songId]);
  if (lyrics.length === 0) return;
  const values = lyrics.map((l) => [songId, l.time, l.text]);
  await pool.query('INSERT INTO lyrics (song_id, time, text) VALUES ?', [values]);
}
