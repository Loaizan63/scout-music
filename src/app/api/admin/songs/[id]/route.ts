import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchSongById, updateSong, deleteSong, updateLyrics } from '@/lib/data';

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_auth')?.value === 'authenticated';
}

// GET /api/admin/songs/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const song = await fetchSongById(id);
  if (!song) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(song);
}

// PUT /api/admin/songs/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const { lyrics, ...songData } = body;

    await updateSong(id, songData);

    if (lyrics && Array.isArray(lyrics)) {
      await updateLyrics(id, lyrics);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error updating song' }, { status: 500 });
  }
}

// DELETE /api/admin/songs/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await deleteSong(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting song' }, { status: 500 });
  }
}
