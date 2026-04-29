import { Metadata, ResolvingMetadata } from 'next';
import { fetchSongById, fetchSongs } from '@/lib/data';
import { notFound } from 'next/navigation';
import SongDetailView from "@/components/SongDetailView";
import { getCoverImage } from '@/utils/getCoverImage';

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
  
  // Try to get a valid image URL for Open Graph
  let imageUrl = '';
  try {
    const cover = getCoverImage(song.coverUrl);
    imageUrl = typeof cover === 'string' ? cover : cover.src;
  } catch (e) {}

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'music.song',
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {})
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
