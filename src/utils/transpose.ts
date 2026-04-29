const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function transposeChord(chord: string, steps: number): string {
  // Extract the root note and the rest of the chord (e.g. "C#m7" -> root="C#", rest="m7")
  // Allows for slash chords like D/F# (handled by splitting on / in the main text replacement)
  const match = chord.match(/^([CDEFGAB][#b]?)(.*)$/);
  if (!match) return chord;

  let root = match[1];
  const rest = match[2];

  // Normalize flat notes to sharp notes
  const flatToSharp: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };
  root = flatToSharp[root] || root;

  let currentIndex = NOTES.indexOf(root);
  if (currentIndex === -1) return chord;

  let newIndex = (currentIndex + steps) % 12;
  if (newIndex < 0) newIndex += 12;

  return NOTES[newIndex] + rest;
}

export function transposeText(text: string, steps: number): string {
  if (steps === 0) return text;

  const lines = text.split('\n');
  return lines.map(line => {
    // A heuristic to detect lines that are chords.
    // If a line is mostly valid chords and spaces, we transpose it.
    const words = line.trim().split(/\s+/);
    if (words.length === 0 || words[0] === '') return line;

    // Check if the line is enclosed in [] (like [Intro] or [Coro])
    if (/^\[.*\]$/.test(line.trim())) return line;

    const chordRegex = /^([CDEFGAB][#b]?(?:m|maj|min|aug|dim|sus)?(?:[245679]|11|13)?)$/i;
    let validChords = 0;

    for (const word of words) {
      // Split by slash for chords like D/F#
      const parts = word.split('/');
      let allPartsValid = true;
      for (const part of parts) {
        if (!chordRegex.test(part)) {
          allPartsValid = false;
          break;
        }
      }
      if (allPartsValid) validChords++;
    }

    // If more than 40% of the words are chords, treat as a chord line
    if (validChords > 0 && (validChords / words.length) >= 0.4) {
      // Replace every word that looks like a chord
      return line.replace(/\b([CDEFGAB][#b]?(?:m|maj|min|aug|dim|sus)?(?:[245679]|11|13)?)\b/g, (match) => {
        return transposeChord(match, steps);
      });
    }

    return line;
  }).join('\n');
}
