import type { Song } from '@/lib/data';

/** URL-safe slug from titulo (sin acentos, minúsculas, guiones). */
export function slugify(raw: string): string {
  if (!raw) return '';
  // Sin \p{:} Unicode (compat target ES5 en tsconfig): NFD + quitar marcas combinantes latinas
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ñ]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Segmento estable para URLs públicas (/song/[slug]). Si hay varias canciones
 * con el mismo título slugificado, las siguientes llevan sufijo `-2`, `-3`, ...
 */
export function publicSlugForSong(song: Song, allSongs: Song[]): string {
  const base = slugify(song.title) || 'cancion';
  const group = [...allSongs]
    .filter((s) => slugify(s.title) === slugify(song.title))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (group.length <= 1) return base;
  const idx = group.findIndex((s) => s.id === song.id);
  return idx <= 0 ? base : `${base}-${idx + 1}`;
}

export function findSongByPublicSlug(slug: string, allSongs: Song[]): Song | null {
  const normalized = slug.includes('%') ? decodeURIComponent(slug) : slug;
  for (const song of allSongs) {
    if (publicSlugForSong(song, allSongs) === normalized) return song;
  }
  return null;
}

/** Detecta IDs en formato UUID (enlaces antiguos /song/[uuid]). */
export function isLikelySongIdUuid(segment: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment.trim());
}
