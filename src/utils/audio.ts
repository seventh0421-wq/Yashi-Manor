// Web Audio API ambient harp & celestial chime generator for FF14 cafe immersion
let audioCtx: AudioContext | null = null;
let isPlayingAmbient = false;
let ambientTimer: number | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Gentle celestial chime chord
export function playChime(freqMultiplier = 1) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const baseFreqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Celestial major)
    const now = ctx.currentTime;

    baseFreqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f * freqMultiplier, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.7);
    });
  } catch {
    // Graceful fallback if user hasn't interacted
  }
}

// Maid cute spell magic sound ("萌え萌えキュン~✨")
export function playMagicSpell() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [659.25, 783.99, 987.77, 1174.66, 1318.51, 1567.98]; // E5 to G6 twinkle

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gain.gain.setValueAtTime(0, now + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.05, now + i * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 1.0);
    });
  } catch {
    // Ignore audio context autoplay limitations
  }
}

// Ambient slow peaceful arpeggio
export function toggleAmbientMusic(onStateChange?: (playing: boolean) => void): boolean {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (isPlayingAmbient) {
    if (ambientTimer) clearInterval(ambientTimer);
    isPlayingAmbient = false;
    onStateChange?.(false);
    return false;
  } else {
    isPlayingAmbient = true;
    onStateChange?.(true);

    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00], // G7
    ];
    let step = 0;

    const playChordStep = () => {
      if (!isPlayingAmbient) return;
      const currentChord = chords[step % chords.length];
      const now = ctx.currentTime;

      currentChord.forEach((note, nIdx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now + nIdx * 0.25);

        gain.gain.setValueAtTime(0, now + nIdx * 0.25);
        gain.gain.linearRampToValueAtTime(0.025, now + nIdx * 0.25 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + nIdx * 0.25 + 2.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + nIdx * 0.25);
        osc.stop(now + nIdx * 0.25 + 3.0);
      });
      step++;
    };

    playChordStep();
    ambientTimer = window.setInterval(playChordStep, 4500);
    return true;
  }
}
