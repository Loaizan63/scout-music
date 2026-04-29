'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Clock, Plus,
  Trash2, Download, Upload, Save, Loader2, RotateCcw,
  CheckCircle2, Music, AlignLeft, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

interface Lyric {
  time: number;
  text: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
}

type Mode = 'list' | 'paste' | 'import';

export default function LyricsSyncPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);

  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState('');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [lyrics, setLyrics] = useState<Lyric[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [importJson, setImportJson] = useState('');
  const [mode, setMode] = useState<Mode>('list');

  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState('');

  // Load songs list
  useEffect(() => {
    fetch('/api/admin/songs')
      .then(r => r.json())
      .then(setSongs)
      .catch(console.error);
  }, []);

  // Load selected song with lyrics
  useEffect(() => {
    if (!selectedSongId) return;
    fetch(`/api/admin/songs/${selectedSongId}`)
      .then(r => r.json())
      .then(data => {
        setCurrentSong(data);
        setLyrics((data.lyrics ?? []).sort((a: Lyric, b: Lyric) => a.time - b.time));
      })
      .catch(console.error);
  }, [selectedSongId]);

  // Sync active lyric index as audio plays
  useEffect(() => {
    let idx = -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) { idx = i; break; }
    }
    setActiveIndex(idx);
  }, [currentTime, lyrics]);

  // Auto-scroll to active lyric
  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex]);

  // Audio event handlers
  const onTimeUpdate = useCallback(() => {
    setCurrentTime(audioRef.current?.currentTime ?? 0);
  }, []);
  const onLoadedMetadata = useCallback(() => {
    setDuration(audioRef.current?.duration ?? 0);
  }, []);
  const onPlay = useCallback(() => setIsPlaying(true), []);
  const onPause = useCallback(() => setIsPlaying(false), []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
  };

  const seek = (delta: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + delta));
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  };

  // Mark: set the time of a pending lyric line
  const markTime = useCallback(() => {
    if (pendingIndex === null) {
      // Find first line with time = 0 (unmarked), skip index 0 if set
      const first = lyrics.findIndex((l, i) => i > 0 && l.time === 0) ?? 0;
      setPendingIndex(first >= 0 ? first : 0);
      return;
    }
    const updated = [...lyrics];
    updated[pendingIndex] = { ...updated[pendingIndex], time: parseFloat(currentTime.toFixed(2)) };
    setLyrics(updated.sort((a, b) => a.time - b.time));
    // Advance to the next unset line
    const nextPending = updated.findIndex((l, i) => i > pendingIndex && l.time === 0);
    setPendingIndex(nextPending >= 0 ? nextPending : null);
  }, [currentTime, lyrics, pendingIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'Enter') { e.preventDefault(); markTime(); }
      if (e.code === 'ArrowLeft') { e.preventDefault(); seek(-2); }
      if (e.code === 'ArrowRight') { e.preventDefault(); seek(2); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, markTime]);

  // Parse pasted plain text
  const parsePastedText = () => {
    const lines = pastedText.split('\n').map(l => l.trim()).filter(Boolean);
    setLyrics(lines.map(text => ({ time: 0, text })));
    setMode('list');
    setPastedText('');
  };

  // Import from JSON
  const importFromJson = () => {
    try {
      const parsed = JSON.parse(importJson);
      if (Array.isArray(parsed)) {
        setLyrics(parsed.sort((a, b) => a.time - b.time));
        setMode('list');
        setImportJson('');
      }
    } catch { setError('JSON inválido. Revisa el formato.'); }
  };

  // Export as JSON
  const exportJson = () => {
    const data = JSON.stringify(lyrics.sort((a, b) => a.time - b.time), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentSong?.title ?? 'lyrics'}.json`;
    a.click();
  };

  // Save to database
  const save = async () => {
    if (!selectedSongId) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/songs/${selectedSongId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics }),
      });
      if (!res.ok) throw new Error('Error saving');
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
    } catch { setError('Error al guardar. Inténtalo de nuevo.'); }
    finally { setSaving(false); }
  };

  const addLine = () => setLyrics([...lyrics, { time: 0, text: '' }]);
  const removeLine = (i: number) => setLyrics(lyrics.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: 'time' | 'text', val: string) => {
    const updated = [...lyrics];
    if (field === 'time') updated[i].time = parseFloat(val) || 0;
    else updated[i].text = val;
    setLyrics(updated);
  };
  const clearTimes = () => setLyrics(lyrics.map(l => ({ ...l, time: 0 })));

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.round((s % 1) * 10);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${ms}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const unmarkedCount = lyrics.filter(l => l.time === 0).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Hidden audio element */}
      {currentSong?.audioUrl && (
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onPlay={onPlay}
          onPause={onPause}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-sm leading-none">Sincronizador de Letras</h1>
              <p className="text-[10px] text-white/40 leading-none mt-0.5">
                {currentSong ? `${currentSong.title} · ${currentSong.artist}` : 'Selecciona una canción para empezar'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lyrics.length > 0 && (
              <Button onClick={exportJson} variant="ghost" size="sm" className="rounded-full gap-2 hover:bg-white/10 text-white/60 hover:text-white">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            )}
            <Button
              onClick={save}
              disabled={saving || !selectedSongId || lyrics.length === 0}
              className={`rounded-full gap-2 font-bold text-sm px-4 transition-all ${savedOk ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-white/90'}`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedOk ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Guardando...' : savedOk ? 'Guardado' : 'Guardar'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* Left Panel */}
        <div className="space-y-4">
          {/* Song Selector */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Canción</label>
            <select
              value={selectedSongId}
              onChange={e => { setSelectedSongId(e.target.value); setIsPlaying(false); setPendingIndex(null); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">-- Seleccionar canción --</option>
              {songs.map(s => (
                <option key={s.id} value={s.id}>{s.title} — {s.artist}</option>
              ))}
            </select>
          </div>

          {/* Player */}
          {currentSong && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Reproductor</label>

              {/* Big time display */}
              <div className="text-center">
                <span className="text-4xl font-mono font-bold tracking-tighter tabular-nums text-accent">
                  {fmt(currentTime)}
                </span>
                <span className="text-white/30 text-sm ml-2 font-mono">/ {fmt(duration)}</span>
              </div>

              {/* Progress bar */}
              <div
                className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  seekTo(pct * duration);
                }}
              >
                <div className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all" style={{ left: `${progressPct}%`, transform: 'translateX(-50%) translateY(-50%)' }} />
              </div>

              {/* Transport controls */}
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => seek(-5)} className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-0.5" fill="currentColor" />}
                </button>
                <button onClick={() => seek(5)} className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Mark button */}
              <button
                onClick={markTime}
                className={`w-full py-4 rounded-xl font-bold text-base transition-all active:scale-95 ${
                  pendingIndex !== null
                    ? 'bg-accent text-accent-foreground shadow-[0_0_20px_hsl(var(--accent)/0.4)] animate-pulse'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                {pendingIndex !== null
                  ? `⏱ Marcar línea #${pendingIndex + 1} [Enter]`
                  : '⏱ Iniciar Marcado [Enter]'}
              </button>

              {/* Keyboard shortcuts hint */}
              <div className="grid grid-cols-2 gap-1 text-[11px] text-white/20">
                <span><kbd className="bg-white/10 rounded px-1">Space</kbd> Play/Pausa</span>
                <span><kbd className="bg-white/10 rounded px-1">Enter</kbd> Marcar tiempo</span>
                <span><kbd className="bg-white/10 rounded px-1">←</kbd> -2s</span>
                <span><kbd className="bg-white/10 rounded px-1">→</kbd> +2s</span>
              </div>
            </div>
          )}

          {/* Lyrics Controls */}
          {selectedSongId && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-3">Herramientas</label>
              <Button onClick={() => setMode(mode === 'paste' ? 'list' : 'paste')} variant="outline" size="sm" className="w-full justify-start rounded-xl border-white/10 hover:bg-white/10 gap-2">
                <AlignLeft className="w-4 h-4" /> Pegar Letra Plana
              </Button>
              <Button onClick={() => setMode(mode === 'import' ? 'list' : 'import')} variant="outline" size="sm" className="w-full justify-start rounded-xl border-white/10 hover:bg-white/10 gap-2">
                <Upload className="w-4 h-4" /> Importar desde JSON
              </Button>
              <Button onClick={clearTimes} variant="outline" size="sm" className="w-full justify-start rounded-xl border-white/10 hover:bg-white/10 gap-2 text-yellow-400/70 hover:text-yellow-400">
                <RotateCcw className="w-4 h-4" /> Limpiar Todos los Tiempos
              </Button>
            </div>
          )}
        </div>

        {/* Right Panel: Lyrics Editor / Preview */}
        <div className="space-y-4 min-h-0">
          {/* Paste Mode */}
          {mode === 'paste' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold">Pegar Letra</h3>
              <p className="text-xs text-white/40">Pega la letra completa. Cada línea se convertirá en un verso sincronizable.</p>
              <Textarea
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                rows={10}
                placeholder={"Intro\nCuánto cuesta lo que prometí\nAunque no sé si lo puedo cumplir..."}
                className="bg-black/40 border-white/10 font-mono text-sm resize-none focus-visible:ring-accent"
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={() => setMode('list')} variant="ghost" className="flex-1 rounded-xl">Cancelar</Button>
                <Button onClick={parsePastedText} disabled={!pastedText.trim()} className="flex-1 rounded-xl bg-white text-black hover:bg-white/90 font-bold">
                  Cargar {pastedText.split('\n').filter(Boolean).length} versos
                </Button>
              </div>
            </div>
          )}

          {/* Import JSON Mode */}
          {mode === 'import' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold">Importar JSON</h3>
              <p className="text-xs text-white/40">Formato: <code className="bg-white/10 rounded px-1">[{`{"time": 0, "text": "Verso"}`}]</code></p>
              <Textarea
                value={importJson}
                onChange={e => setImportJson(e.target.value)}
                rows={10}
                placeholder={'[\n  { "time": 19, "text": "Cuánto cuesta lo que prometí" }\n]'}
                className="bg-black/40 border-white/10 font-mono text-sm resize-none focus-visible:ring-accent"
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={() => setMode('list')} variant="ghost" className="flex-1 rounded-xl">Cancelar</Button>
                <Button onClick={importFromJson} disabled={!importJson.trim()} className="flex-1 rounded-xl bg-white text-black hover:bg-white/90 font-bold">Importar</Button>
              </div>
            </div>
          )}

          {/* Lyrics List */}
          {mode === 'list' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {/* List header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{lyrics.length} versos</span>
                  {unmarkedCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                      {unmarkedCount} sin marcar
                    </span>
                  )}
                  {unmarkedCount === 0 && lyrics.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      ✓ Todos marcados
                    </span>
                  )}
                </div>
                <Button onClick={addLine} variant="ghost" size="sm" className="rounded-full gap-1.5 text-white/60 hover:text-white hover:bg-white/10">
                  <Plus className="w-4 h-4" /> Añadir Verso
                </Button>
              </div>

              {/* Empty state */}
              {lyrics.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/20">
                  <Music className="w-10 h-10 opacity-30" />
                  <p className="text-sm text-center">
                    {selectedSongId ? 'Sin letra. Pega el texto o añade versos manualmente.' : 'Selecciona una canción para empezar.'}
                  </p>
                </div>
              )}

              {/* Lyric rows */}
              <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
                {lyrics.map((lyric, i) => {
                  const isActive = i === activeIndex;
                  const isPending = i === pendingIndex;
                  const isMarked = lyric.time > 0;

                  return (
                    <div
                      key={i}
                      ref={isActive ? activeRowRef : undefined}
                      className={`flex items-center gap-3 px-4 py-2.5 transition-all ${
                        isActive ? 'bg-accent/10 border-l-2 border-accent' : isPending ? 'bg-yellow-500/10 border-l-2 border-yellow-500' : 'border-l-2 border-transparent hover:bg-white/5'
                      }`}
                    >
                      {/* Line number */}
                      <span className="text-xs text-white/20 w-5 text-right flex-shrink-0 font-mono">{i + 1}</span>

                      {/* Time input */}
                      <button
                        onClick={() => { updateLine(i, 'time', String(parseFloat(currentTime.toFixed(2)))); }}
                        title="Clic para marcar el tiempo actual"
                        className={`flex-shrink-0 w-20 font-mono text-xs rounded-lg px-2 py-1.5 text-center border transition-all ${
                          isPending
                            ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                            : isMarked
                            ? 'bg-white/5 border-white/10 text-white/60 hover:bg-accent/10 hover:border-accent/30 hover:text-accent'
                            : 'bg-white/5 border-white/10 text-white/20 hover:bg-accent/10 hover:border-accent/30 hover:text-accent'
                        }`}
                      >
                        {isMarked ? fmt(lyric.time) : '00:00.0'}
                      </button>

                      {/* Text input */}
                      <Input
                        value={lyric.text}
                        onChange={e => updateLine(i, 'text', e.target.value)}
                        className={`flex-1 h-8 text-sm border-transparent bg-transparent focus-visible:bg-white/5 focus-visible:border-white/20 focus-visible:ring-0 px-2 transition-all ${
                          isActive ? 'text-white font-semibold' : 'text-white/60'
                        }`}
                        placeholder={`Verso ${i + 1}...`}
                      />

                      {/* Pending indicator */}
                      {isPending && <span className="text-yellow-400 text-xs flex-shrink-0">← siguiente</span>}

                      {/* Delete */}
                      <button
                        onClick={() => removeLine(i)}
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 text-white/30 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
