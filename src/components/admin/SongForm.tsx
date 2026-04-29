'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Minus, Loader2 } from 'lucide-react';

interface Lyric { time: number; text: string; }

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
  lyrics?: Lyric[];
}

interface SongFormProps {
  song: Partial<Song> | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function SongForm({ song, onClose, onSaved }: SongFormProps) {
  const isEditing = !!song?.id;

  const emptyForm = {
    title: '',
    artist: '',
    category: '',
    duration: 0,
    coverUrl: '',
    audioUrl: '',
    description: '',
    chords: '',
  };

  const [form, setForm] = useState({ ...emptyForm, ...song });
  const [lyrics, setLyrics] = useState<Lyric[]>(song?.lyrics ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addLyricLine = () => setLyrics([...lyrics, { time: 0, text: '' }]);
  const removeLyricLine = (i: number) => setLyrics(lyrics.filter((_, idx) => idx !== i));
  const updateLyricLine = (i: number, field: 'time' | 'text', value: string) => {
    const updated = [...lyrics];
    if (field === 'time') updated[i].time = parseFloat(value) || 0;
    else updated[i].text = value;
    setLyrics(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...form,
      duration: Number(form.duration),
      lyrics: lyrics.sort((a, b) => a.time - b.time),
    };

    try {
      const url = isEditing ? `/api/admin/songs/${song!.id}` : '/api/admin/songs';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al guardar');
        return;
      }

      onSaved();
    } catch (err) {
      setError('Error de red. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
          <h2 className="text-lg font-bold">{isEditing ? `Editar: ${song?.title}` : 'Nueva Canción'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Main Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-white/50 uppercase tracking-widest">Título *</label>
              <Input name="title" value={form.title} onChange={handleChange} required className="bg-black/40 border-white/10 focus-visible:ring-accent" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/50 uppercase tracking-widest">Artista *</label>
              <Input name="artist" value={form.artist} onChange={handleChange} required className="bg-black/40 border-white/10 focus-visible:ring-accent" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/50 uppercase tracking-widest">Categoría / Álbum *</label>
              <Input name="category" value={form.category} onChange={handleChange} required className="bg-black/40 border-white/10 focus-visible:ring-accent" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/50 uppercase tracking-widest">Duración (segundos)</label>
              <Input name="duration" type="number" value={form.duration} onChange={handleChange} className="bg-black/40 border-white/10 focus-visible:ring-accent" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-white/50 uppercase tracking-widest">URL de la Portada *</label>
              <Input name="coverUrl" value={form.coverUrl} onChange={handleChange} required placeholder="https://... o /covers/nombre.jpg" className="bg-black/40 border-white/10 focus-visible:ring-accent" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-white/50 uppercase tracking-widest">URL del Audio *</label>
              <Input name="audioUrl" value={form.audioUrl} onChange={handleChange} required placeholder="https://... o /audio/nombre.mp3" className="bg-black/40 border-white/10 focus-visible:ring-accent" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-white/50 uppercase tracking-widest">Descripción / Reseña</label>
              <Textarea name="description" value={form.description} onChange={handleChange} rows={3} className="bg-black/40 border-white/10 focus-visible:ring-accent resize-none" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-white/50 uppercase tracking-widest">Acordes (Chord Sheet)</label>
              <Textarea name="chords" value={form.chords ?? ''} onChange={handleChange} rows={6} placeholder="[Intro]\nAm  G  F  Em..." className="bg-black/40 border-white/10 focus-visible:ring-accent resize-none font-mono text-sm" />
            </div>
          </div>

          {/* Lyrics Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest">Letra Sincronizada (LRC)</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLyricLine} className="rounded-full border-white/20 text-xs hover:bg-white/10">
                <Plus className="w-3 h-3 mr-1" /> Añadir Verso
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {lyrics.length === 0 && (
                <p className="text-white/30 text-sm text-center py-4">No hay versos. Haz clic en "Añadir Verso" para empezar.</p>
              )}
              {lyrics.map((lyric, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <Input
                    type="number"
                    value={lyric.time}
                    onChange={(e) => updateLyricLine(i, 'time', e.target.value)}
                    step="0.01"
                    className="w-24 flex-shrink-0 bg-black/40 border-white/10 text-xs text-center font-mono focus-visible:ring-accent"
                    placeholder="0.00"
                  />
                  <Input
                    value={lyric.text}
                    onChange={(e) => updateLyricLine(i, 'text', e.target.value)}
                    className="flex-1 bg-black/40 border-white/10 text-sm focus-visible:ring-accent"
                    placeholder="Letra del verso..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLyricLine(i)}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 h-8 w-8 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-all"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-center">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl hover:bg-white/5">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 rounded-xl bg-white text-black hover:bg-white/90 font-bold">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</> : (isEditing ? 'Guardar Cambios' : 'Crear Canción')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
