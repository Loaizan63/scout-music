import { Metadata, ResolvingMetadata } from 'next';
import { fetchSongById, fetchSongs } from '@/lib/data';
import { notFound } from 'next/navigation';
import SongDetailView from "@/components/SongDetailView";
import { resolveMediaUrl } from '@/utils/resolveMediaUrl';

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const song = await fetchSongById(resolvedParams.id);

  if (!song) {
    return {
      title: 'Canción no encontrada | Campfire Tunes'
    };
  }

  const title = `${song.title} - ${song.artist} | Campfire Tunes`;
  const description = song.description || `Escucha "${song.title}" de ${song.artist} en Campfire Tunes, tu reproductor de música scout.`;

  // Build an absolute OG image URL — WhatsApp/Facebook need a full https:// URL
  let imageUrl = '';
  const rawCover = song.coverUrl ?? '';
  const resolved = resolveMediaUrl(rawCover);
  if (resolved) {
    if (resolved.startsWith('http')) {
      imageUrl = resolved;
    } else {
      // Relative path — make it absolute using the configured app URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
      imageUrl = appUrl ? `${appUrl.replace(/\/$/, '')}${resolved}` : '';
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'music.song',
      ...(imageUrl ? { images: [{ url: imageUrl, width: 800, height: 800 }] } : {})
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {})
    }
  };
}

export default async function SongSharePage({ params }: Props) {
  const resolvedParams = await params;
  const song = await fetchSongById(resolvedParams.id);

  if (!song) {
    notFound();
  }

  // We fetch all songs to hydrate the global AudioContext so that if the user clicks "Next",
  // they can continue listening to the rest of the catalog.
  const allSongs = await fetchSongs();

  return <SongDetailView initialSong={song} allSongs={allSongs} />;
}
