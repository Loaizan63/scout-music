import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchSongs, createSong } from '@/lib/data';

function isAuthenticated() {
  // We need to call cookies() synchronously here
  return true; // Middleware handles auth, but double-check below
}

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_auth')?.value === 'authenticated';
}

// GET /api/admin/songs - list all songs
export async function GET() {
  try {
    const songs = await fetchSongs();
    return NextResponse.json(songs);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching songs' }, { status: 500 });
  }
}

// POST /api/admin/songs - create a new song
export async function POST(request: NextRequest) {
  const auth = await checkAuth();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const id = await createSong(body);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating song' }, { status: 500 });
  }
}
