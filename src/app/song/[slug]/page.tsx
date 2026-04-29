import { Metadata } from 'next';
import { fetchSongById, fetchSongByPublicSlug, fetchSongs } from '@/lib/data';
import { notFound, permanentRedirect } from 'next/navigation';
import SongDetailView from "@/components/SongDetailView";
import { resolveMediaUrl } from '@/utils/resolveMediaUrl';
import { isLikelySongIdUuid, publicSlugForSong } from '@/utils/songSlug';

type Props = {
  params: Promise<{ slug: string }>;
};

async function resolveSongForMetadata(rawSlug: string) {
  if (isLikelySongIdUuid(rawSlug.trim())) {
    return fetchSongById(rawSlug.trim());
  }
  return fetchSongByPublicSlug(rawSlug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSlug = decodeURIComponent(resolvedParams.slug);
  const song = await resolveSongForMetadata(rawSlug);

  if (!song) {
    return {
      title: 'Canción no encontrada | Scout Music',
    };
  }

  const title = `${song.title} - ${song.artist} | Scout Music`;
  const description =
    song.description ||
    `Escucha "${song.title}" de ${song.artist} en Scout Music, tu reproductor de música scout.`;

  let imageUrl = '';
  const rawCover = song.coverUrl ?? '';
  const resolved = resolveMediaUrl(rawCover);
  if (resolved) {
    if (resolved.startsWith('http')) {
      imageUrl = resolved;
    } else {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
      // Prefer absolute URL when configured, otherwise keep relative path so platforms can resolve it
      imageUrl = appUrl ? `${appUrl.replace(/\/$/, '')}${resolved}` : resolved;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'music.song',
      ...(imageUrl ? { images: [{ url: imageUrl, width: 800, height: 800 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export default async function SongSharePage({ params }: Props) {
  const resolvedParams = await params;
  const rawSlug = decodeURIComponent(resolvedParams.slug);

  if (isLikelySongIdUuid(rawSlug.trim())) {
    const byId = await fetchSongById(rawSlug.trim());
    if (!byId) {
      notFound();
    }
    const allForRedirect = await fetchSongs();
    const slugSeg = publicSlugForSong(byId, allForRedirect);
    permanentRedirect(`/song/${encodeURIComponent(slugSeg)}`);
  }

  const song = await fetchSongByPublicSlug(rawSlug);
  if (!song) {
    notFound();
  }

  const allSongs = await fetchSongs();
  return <SongDetailView initialSong={song} allSongs={allSongs} />;
}
