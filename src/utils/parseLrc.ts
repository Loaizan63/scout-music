export interface Lyric {
  time: number;
  text: string;
}

export function parseLrc(lrcText: string): Lyric[] {
  const lines = lrcText.split('\n');
  const lyrics: Lyric[] = [];
  
  // Regex to match [mm:ss.xx] or [mm:ss]
  const timeRegex = /\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\]/g;
  
  for (const line of lines) {
    let match;
    // Iterate over all time tags in the line
    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const time = minutes * 60 + seconds;
      
      // Use an inline regex literal for replace to avoid resetting timeRegex.lastIndex
      // which was causing an infinite loop!
      const text = line.replace(/\[\d{2}:\d{2}(?:\.\d{1,3})?\]/g, '').trim();
      
      // We only add if it has text or if it's an empty line for pacing
      lyrics.push({ time, text });
    }
  }
  
  // Sort by time
  return lyrics.sort((a, b) => a.time - b.time);
}
