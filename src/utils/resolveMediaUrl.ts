/**
 * Resolves a stored audioUrl/coverUrl from the database into a full, playable URL.
 *
 * Rules:
 *  1. Blank / null → return ''
 *  2. Already absolute (http/https) → return as-is
 *  3. Starts with "/" → treat as public-folder path, return as-is
 *  4. Bare filename (e.g. "upload_xyz.mp3") → prepend NEXT_PUBLIC_MEDIA_URL if set
 */
export function resolveMediaUrl(raw: string | null | undefined): string {
  if (!raw || raw.trim() === '') return '';

  // Already a full URL
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

  // Absolute path (public folder)
  if (raw.startsWith('/')) return raw;

  // Bare filename — prepend the configured media base URL
  const base = process.env.NEXT_PUBLIC_MEDIA_URL ?? '';
  if (base) {
    return `${base.replace(/\/$/, '')}/${raw}`;
  }

  // No base configured, serve from public root as fallback
  return `/${raw}`;
}
