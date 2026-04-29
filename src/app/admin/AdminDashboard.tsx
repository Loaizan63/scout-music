'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Music,
  Search,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Disc3,
  AlertTriangle,
  Loader2,
  FileText,
  Users,
  Wand2,
} from 'lucide-react';
import SongForm from '@/components/admin/SongForm';
import { logoutAction } from './actions';
import Link from 'next/link';

interface Song {
  id: string;
  title: string;
  artist: string;
  category: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  description: string;
  chords?: string;
  lyrics?: { time: number; text: string }[];
}

export default function AdminDashboard() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filtered, setFiltered] = useState<Song[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/songs');
      const data = await res.json();
      setSongs(data);
      setFiltered(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(songs.filter((s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)));
  }, [search, songs]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await fetch(`/api/admin/songs/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      loadSongs();
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async (song: Song) => {
    // Fetch full song with lyrics
    const res = await fetch(`/api/admin/songs/${song.id}`);
    const full = await res.json();
    setEditSong(full);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditSong(null);
    setShowForm(true);
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditSong(null);
    loadSongs();
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const categories = Array.from(new Set(songs.map((s) => s.category)));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/40 to-accent/10 border border-accent/30 flex items-center justify-center">
              <Disc3 className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-none">Scout Music</h1>
              <p className="text-[10px] text-white/40 leading-none mt-0.5">Panel de Administración</p>
            </div>
          </div>

          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm" className="rounded-full gap-2 hover:bg-white/10 text-white/60 hover:text-white">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: Music, label: 'Canciones', value: songs.length, color: 'from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400' },
            { icon: FileText, label: 'Álbumes', value: categories.length, color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400' },
            { icon: Users, label: 'Con Letras', value: songs.filter(s => s.description).length, color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className={`rounded-2xl border bg-gradient-to-br ${color} p-4 space-y-1`}>
              <Icon className="w-5 h-5 opacity-60" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-white/40">{label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, artista, álbum..."
              className="pl-9 bg-white/5 border-white/10 focus-visible:ring-accent rounded-xl"
            />
          </div>
          <Link href="/admin/sync">
            <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/10 gap-2 shrink-0 text-white/70 hover:text-white">
              <Wand2 className="w-4 h-4" />
              Sincronizar Letras
            </Button>
          </Link>
          <Button onClick={handleNew} className="rounded-xl bg-white text-black hover:bg-white/90 font-bold gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all shrink-0">
            <Plus className="w-4 h-4" />
            Nueva Canción
          </Button>
        </div>

        {/* Songs Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] md:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-4 py-3 bg-white/5 text-xs font-bold uppercase tracking-widest text-white/30">
            <span className="hidden md:block">#</span>
            <span>Título</span>
            <span className="hidden md:block">Álbum</span>
            <span className="text-center">Duración</span>
            <span className="text-center">Acordes</span>
            <span className="text-center">Acciones</span>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-white/30">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Cargando canciones desde la base de datos...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/30">
              <Music className="w-10 h-10 opacity-20" />
              <p className="text-sm">{search ? 'No se encontraron resultados.' : 'No hay canciones. ¡Agrega la primera!'}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((song, i) => (
                <div
                  key={song.id}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto] md:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-white/5 transition-colors group"
                >
                  <span className="hidden md:block text-xs text-white/20 font-mono w-6">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate text-sm">{song.title}</p>
                    <p className="text-xs text-white/40 truncate">{song.artist}</p>
                  </div>
                  <span className="hidden md:block text-xs text-white/40 truncate">
                    <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{song.category}</span>
                  </span>
                  <span className="text-xs text-white/40 font-mono text-center">{formatDuration(song.duration)}</span>
                  <span className="text-center">
                    {song.chords ? (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" title="Tiene acordes" />
                    ) : (
                      <span className="inline-block w-2 h-2 rounded-full bg-white/10" title="Sin acordes" />
                    )}
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(song)}
                      className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(song.id)}
                      className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Song Form Modal */}
      {showForm && (
        <SongForm
          song={editSong}
          onClose={() => { setShowForm(false); setEditSong(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm bg-zinc-900 border border-red-500/20 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">¿Eliminar canción?</h3>
                <p className="text-sm text-white/50 mt-1">Esta acción es permanente. También se eliminarán sus letras sincronizadas.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl hover:bg-white/5">Cancelar</Button>
              <Button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sí, eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
