// Lightweight Web Audio API sound effects — no external assets, instant playback.

let ctx: AudioContext | null = null;
const getCtx = () => {
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

const tone = (
  freq: number,
  duration: number,
  type: OscillatorType,
  startAt = 0,
  gain = 0.18,
  freqEnd?: number,
) => {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime + startAt;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + duration);
  }

  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
};

const noiseBurst = (duration: number, startAt = 0, gain = 0.15) => {
  const ac = getCtx();
  if (!ac) return;
  const bufferSize = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ac.createBufferSource();
  const g = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1000;
  src.buffer = buffer;
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(ac.currentTime + startAt);
};

// 🏎️ Technical mode ON — F1 engine rev + pit-stop "go!" beep
export const playTechnicalOn = () => {
  // Tire screech / impact wrench burst
  noiseBurst(0.12, 0, 0.12);
  // Engine rev sweep down
  tone(180, 0.35, "sawtooth", 0.05, 0.22, 520);
  tone(90, 0.4, "square", 0.08, 0.12, 260);
  // Pit-stop "GO" beep
  tone(880, 0.08, "square", 0.45, 0.2);
  tone(1320, 0.12, "square", 0.55, 0.22);
};

// ✨ Beginner mode — playful "power down + happy sparkle" chime
export const playBeginnerOn = () => {
  // Soft "whoosh" power-down
  noiseBurst(0.18, 0, 0.06);
  // Bouncy ascending arpeggio (C-E-G-C major chord climb) — happy & friendly
  tone(523, 0.12, "triangle", 0.05, 0.18);   // C5
  tone(659, 0.12, "triangle", 0.13, 0.18);   // E5
  tone(784, 0.12, "triangle", 0.21, 0.18);   // G5
  tone(1047, 0.25, "triangle", 0.29, 0.22);  // C6 — sparkle finish
  // Magical sparkle on top
  tone(1568, 0.18, "sine", 0.32, 0.12);      // G6 shimmer
  tone(2093, 0.22, "sine", 0.4, 0.1);        // C7 fairy dust
};
