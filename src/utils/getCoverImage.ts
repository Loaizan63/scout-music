import fogataCover from "@/assets/fogata-cover.jpg";
import marchaCover from "@/assets/marcha-cover.jpg";
import ceremoniaCover from "@/assets/ceremonia-cover.jpg";

import { StaticImageData } from "next/image";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

// Legacy album key map for backward compatibility
const COVER_KEYS: Record<string, string | StaticImageData> = {
  fogata: fogataCover,
  marcha: marchaCover,
  ceremonia: ceremoniaCover,
};

export const getCoverImage = (coverUrl: string | null | undefined): string | StaticImageData => {
  if (!coverUrl) return fogataCover;

  // Full external URL or data URI → return as-is
  if (coverUrl.startsWith('http') || coverUrl.startsWith('data:image')) {
    return coverUrl;
  }

  // Path starting with "/" → public folder asset
  if (coverUrl.startsWith('/')) {
    return coverUrl;
  }

  // Numeric legacy id -> map to assets/song-{id}-cover.jpg
  if (/^\d+$/.test(coverUrl)) {
    return `/assets/song-${coverUrl}-cover.jpg`;
  }

  // If the string already looks like a song-... or upload_... filename, assume it's in /assets
  if (/^(song-|upload_)/.test(coverUrl)) {
    return `/assets/${coverUrl}`;
  }

  // Legacy short key (fogata / marcha / ceremonia)
  if (COVER_KEYS[coverUrl]) {
    return COVER_KEYS[coverUrl];
  }

  // Bare filename stored in DB (e.g. "upload_abc123.jpg")
  // resolveMediaUrl will prepend NEXT_PUBLIC_MEDIA_URL if set
  const resolved = resolveMediaUrl(coverUrl);
  if (resolved) return resolved;

  // Final fallback
  return fogataCover;
};

