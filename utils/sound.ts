// Web Audio API Synthesizer for Solo Leveling System SFX
import { getPactAudioProfile } from './pactAudioProfiles';

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockHandler = () => {
        this.unlockAudio();
        ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown'].forEach((evt) => {
          window.removeEventListener(evt, unlockHandler);
          document.removeEventListener(evt, unlockHandler);
        });
      };

      ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown'].forEach((evt) => {
        window.addEventListener(evt, unlockHandler, { passive: true });
        document.addEventListener(evt, unlockHandler, { passive: true });
      });
    }
  }

  public unlockAudio() {
    if (this.isUnlocked && this.ctx && this.ctx.state === 'running') return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      // Play a 1-sample silent buffer to unlock iOS Safari WebAudio
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      this.isUnlocked = true;
    } catch {
      // Ignore
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playBeep(freq = 600, duration = 0.08, type: OscillatorType = 'sine') {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio failure if restricted by browser
    }
  }

  public playLevelUp() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.07;
        const noteDuration = 0.35;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.25, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });
    } catch {
      // Ignore audio failure
    }
  }

  public playQuestComplete() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const notes = [523.25, 659.25, 783.99, 1046.5];
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.06;
        const noteDuration = 0.25;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });
    } catch {
      // Ignore
    }
  }

  public playQuestAccept() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const notes = [587.33, 739.99, 880.0];
      const now = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.05;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch {
      // Ignore
    }
  }

  public playItemEquip() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Ignore
    }
  }

  /**
   * Sound effect for breaking a forbidden pact:
   * Personalized per catalog pact, with Phase 1 (Specific Habit Impact/Fall)
   * transitioning into Phase 2 (Inspiring Thematic Resurgence & Rise).
   */
  public playPactViolation(pactId?: string) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;

      switch (pactId) {
        case 'pact_alcohol':
          this.playAlcoholPactSound(ctx, now);
          break;
        case 'pact_smoke':
          this.playSmokePactSound(ctx, now);
          break;
        case 'pact_soda':
          this.playSodaPactSound(ctx, now);
          break;
        case 'pact_sugar':
          this.playSugarPactSound(ctx, now);
          break;
        case 'pact_junk_food':
          this.playJunkFoodPactSound(ctx, now);
          break;
        case 'pact_doomscroll':
          this.playDoomscrollPactSound(ctx, now);
          break;
        case 'pact_sleep':
          this.playSleepPactSound(ctx, now);
          break;
        default:
          this.playDefaultPactSound(ctx, now);
          break;
      }
    } catch {
      // Ignore
    }
  }

  // --- CATALOG PACT AUDIO ENGINES ---

  /** 1. Alcohol & Beer: Drunken wobble/muffle -> Crystal bell of lucid mental clarity */
  private playAlcoholPactSound(ctx: AudioContext, now: number) {
    // Phase 1: Inebriation wobble (0.0s - 0.35s)
    const oscWobble = ctx.createOscillator();
    const gainWobble = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.35);

    oscWobble.type = 'triangle';
    oscWobble.frequency.setValueAtTime(130, now);
    oscWobble.frequency.exponentialRampToValueAtTime(55, now + 0.35);

    gainWobble.gain.setValueAtTime(0.35, now);
    gainWobble.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    oscWobble.connect(filter);
    filter.connect(gainWobble);
    gainWobble.connect(ctx.destination);

    oscWobble.start(now);
    oscWobble.stop(now + 0.35);

    // Slur bubble noise
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.setValueAtTime(650, now);
      bpf.Q.setValueAtTime(4, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      whiteNoise.connect(bpf);
      bpf.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);
      whiteNoise.stop(now + 0.12);
    } catch {}

    // Phase 2: Crystalline bells of lucid resurgence (D Major Triad in high octaves)
    const bellNotes = [
      { freq: 587.33, delay: 0.35, dur: 0.6, gain: 0.22 }, // D5
      { freq: 739.99, delay: 0.45, dur: 0.65, gain: 0.24 }, // F#5
      { freq: 880.00, delay: 0.58, dur: 0.75, gain: 0.26 }, // A5
      { freq: 1174.66, delay: 0.72, dur: 0.9, gain: 0.28 }, // D6 (Ringing crystal apex)
    ];

    bellNotes.forEach(({ freq, delay, dur, gain: vol }) => {
      const bOsc = ctx.createOscillator();
      const bGain = ctx.createGain();
      const start = now + delay;
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(freq, start);
      bGain.gain.setValueAtTime(0.001, start);
      bGain.gain.linearRampToValueAtTime(vol, start + 0.03);
      bGain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      bOsc.connect(bGain);
      bGain.connect(ctx.destination);
      bOsc.start(start);
      bOsc.stop(start + dur);
    });

    // Supporting warm pad for mental grounding
    const pad = ctx.createOscillator();
    const padGain = ctx.createGain();
    const padStart = now + 0.35;
    pad.type = 'triangle';
    pad.frequency.setValueAtTime(146.83, padStart); // D3
    padGain.gain.setValueAtTime(0.001, padStart);
    padGain.gain.linearRampToValueAtTime(0.16, padStart + 0.1);
    padGain.gain.exponentialRampToValueAtTime(0.001, padStart + 1.2);
    pad.connect(padGain);
    padGain.connect(ctx.destination);
    pad.start(padStart);
    pad.stop(padStart + 1.25);
  }

  /** 2. Tobacco & Vaping: Toxic hiss & choke -> Expansive fresh second-wind breath */
  private playSmokePactSound(ctx: AudioContext, now: number) {
    // Phase 1: Toxic hiss / choked gasp (0.0s - 0.28s)
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.22);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.setValueAtTime(3200, now);
      bpf.frequency.exponentialRampToValueAtTime(700, now + 0.22);
      bpf.Q.setValueAtTime(3, now);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.24, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      noise.connect(bpf);
      bpf.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.22);
    } catch {}

    const chokeOsc = ctx.createOscillator();
    const chokeGain = ctx.createGain();
    chokeOsc.type = 'sawtooth';
    chokeOsc.frequency.setValueAtTime(160, now);
    chokeOsc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
    chokeGain.gain.setValueAtTime(0.3, now);
    chokeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    chokeOsc.connect(chokeGain);
    chokeGain.connect(ctx.destination);
    chokeOsc.start(now);
    chokeOsc.stop(now + 0.25);

    // Phase 2: Second Wind (Expansive deep breath of pure oxygen in C Major)
    const breathChord = [
      { freq: 130.81, delay: 0.30, dur: 0.9, gain: 0.16 }, // C3
      { freq: 196.00, delay: 0.35, dur: 0.85, gain: 0.16 }, // G3
      { freq: 261.63, delay: 0.42, dur: 0.8, gain: 0.18 }, // C4
      { freq: 329.63, delay: 0.50, dur: 0.85, gain: 0.20 }, // E4
      { freq: 392.00, delay: 0.60, dur: 0.95, gain: 0.22 }, // G4
    ];

    breathChord.forEach(({ freq, delay, dur, gain: vol }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const start = now + delay;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0.001, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    });

    // Inhale sweep of pure air
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.6);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const air = ctx.createBufferSource();
      air.buffer = noiseBuffer;
      const airFilt = ctx.createBiquadFilter();
      airFilt.type = 'bandpass';
      const airStart = now + 0.35;
      airFilt.frequency.setValueAtTime(500, airStart);
      airFilt.frequency.exponentialRampToValueAtTime(2800, airStart + 0.5);
      airFilt.Q.setValueAtTime(2.5, airStart);
      const airGain = ctx.createGain();
      airGain.gain.setValueAtTime(0.001, airStart);
      airGain.gain.linearRampToValueAtTime(0.12, airStart + 0.2);
      airGain.gain.exponentialRampToValueAtTime(0.001, airStart + 0.55);
      air.connect(airFilt);
      airFilt.connect(airGain);
      airGain.connect(ctx.destination);
      air.start(airStart);
      air.stop(airStart + 0.55);
    } catch {}
  }

  /** 3. Soda: Acidic fizz/burn -> Pristine mountain spring water droplets */
  private playSodaPactSound(ctx: AudioContext, now: number) {
    // Phase 1: Acidic sizzle (0.0s - 0.26s)
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.2);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const fizz = ctx.createBufferSource();
      fizz.buffer = noiseBuffer;
      const hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.setValueAtTime(2600, now);
      const fGain = ctx.createGain();
      fGain.gain.setValueAtTime(0.25, now);
      fGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      fizz.connect(hpf);
      hpf.connect(fGain);
      fGain.connect(ctx.destination);
      fizz.start(now);
      fizz.stop(now + 0.2);
    } catch {}

    const fmCarrier = ctx.createOscillator();
    const fmMod = ctx.createOscillator();
    const fmModGain = ctx.createGain();
    const fmGain = ctx.createGain();
    fmCarrier.type = 'sawtooth';
    fmCarrier.frequency.setValueAtTime(360, now);
    fmCarrier.frequency.exponentialRampToValueAtTime(80, now + 0.26);
    fmMod.type = 'square';
    fmMod.frequency.setValueAtTime(75, now);
    fmModGain.gain.setValueAtTime(120, now);
    fmGain.gain.setValueAtTime(0.25, now);
    fmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    fmMod.connect(fmModGain);
    fmModGain.connect(fmCarrier.frequency);
    fmCarrier.connect(fmGain);
    fmGain.connect(ctx.destination);
    fmMod.start(now);
    fmCarrier.start(now);
    fmMod.stop(now + 0.26);
    fmCarrier.stop(now + 0.26);

    // Phase 2: Pristine spring water droplets (Pure sine pings)
    const waterDrops = [
      { freq: 523.25, dropEnd: 480, delay: 0.32, dur: 0.3, gain: 0.24 }, // C5
      { freq: 659.25, dropEnd: 620, delay: 0.44, dur: 0.35, gain: 0.25 }, // E5
      { freq: 783.99, dropEnd: 740, delay: 0.58, dur: 0.4, gain: 0.27 }, // G5
      { freq: 1046.50, dropEnd: 1000, delay: 0.72, dur: 0.55, gain: 0.28 }, // C6
    ];

    waterDrops.forEach(({ freq, dropEnd, delay, dur, gain: vol }) => {
      const dropOsc = ctx.createOscillator();
      const dropGain = ctx.createGain();
      const start = now + delay;
      dropOsc.type = 'sine';
      dropOsc.frequency.setValueAtTime(freq, start);
      dropOsc.frequency.exponentialRampToValueAtTime(dropEnd, start + dur * 0.4);
      dropGain.gain.setValueAtTime(0.001, start);
      dropGain.gain.linearRampToValueAtTime(vol, start + 0.02);
      dropGain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      dropOsc.connect(dropGain);
      dropGain.connect(ctx.destination);
      dropOsc.start(start);
      dropOsc.stop(start + dur);
    });

    // Clean sub-frequency hydration foundation
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subStart = now + 0.32;
    sub.type = 'sine';
    sub.frequency.setValueAtTime(65.41, subStart); // C2
    subGain.gain.setValueAtTime(0.001, subStart);
    subGain.gain.linearRampToValueAtTime(0.18, subStart + 0.08);
    subGain.gain.exponentialRampToValueAtTime(0.001, subStart + 1.1);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(subStart);
    sub.stop(subStart + 1.15);
  }

  /** 4. Sugar & Sweets: Hyperactive spike into glucose crash -> Steady martial rhythm & stamina */
  private playSugarPactSound(ctx: AudioContext, now: number) {
    // Phase 1: High spike into glucose collapse (0.0s - 0.28s)
    const spikeOsc = ctx.createOscillator();
    const spikeGain = ctx.createGain();
    spikeOsc.type = 'sawtooth';
    spikeOsc.frequency.setValueAtTime(950, now);
    spikeOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.09);
    spikeOsc.frequency.exponentialRampToValueAtTime(45, now + 0.28);
    spikeGain.gain.setValueAtTime(0.28, now);
    spikeGain.gain.linearRampToValueAtTime(0.35, now + 0.09);
    spikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    spikeOsc.connect(spikeGain);
    spikeGain.connect(ctx.destination);
    spikeOsc.start(now);
    spikeOsc.stop(now + 0.28);

    // Phase 2: Resolute martial cadence & stable stamina (A Major)
    // Three firm cadence beats
    const cadenceBeats = [
      { freq: 110.00, delay: 0.30, dur: 0.2, gain: 0.26 }, // A2
      { freq: 138.59, delay: 0.42, dur: 0.2, gain: 0.28 }, // C#3
      { freq: 164.81, delay: 0.54, dur: 0.2, gain: 0.30 }, // E3
    ];

    cadenceBeats.forEach(({ freq, delay, dur, gain: vol }) => {
      const beatOsc = ctx.createOscillator();
      const beatGain = ctx.createGain();
      const start = now + delay;
      beatOsc.type = 'triangle';
      beatOsc.frequency.setValueAtTime(freq, start);
      beatGain.gain.setValueAtTime(0.001, start);
      beatGain.gain.linearRampToValueAtTime(vol, start + 0.03);
      beatGain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      beatOsc.connect(beatGain);
      beatGain.connect(ctx.destination);
      beatOsc.start(start);
      beatOsc.stop(start + dur);
    });

    // Ascending triumphal triad of disciplined endurance
    const triad = [
      { freq: 220.00, delay: 0.66, dur: 0.6, gain: 0.20 }, // A3
      { freq: 277.18, delay: 0.74, dur: 0.65, gain: 0.22 }, // C#4
      { freq: 329.63, delay: 0.82, dur: 0.7, gain: 0.24 }, // E4
      { freq: 440.00, delay: 0.90, dur: 0.85, gain: 0.26 }, // A4
    ];

    triad.forEach(({ freq, delay, dur, gain: vol }) => {
      const tOsc = ctx.createOscillator();
      const tGain = ctx.createGain();
      const start = now + delay;
      tOsc.type = 'sine';
      tOsc.frequency.setValueAtTime(freq, start);
      tGain.gain.setValueAtTime(0.001, start);
      tGain.gain.linearRampToValueAtTime(vol, start + 0.03);
      tGain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      tOsc.connect(tGain);
      tGain.connect(ctx.destination);
      tOsc.start(start);
      tOsc.stop(start + dur);
    });
  }

  /** 5. Junk Food: Heavy sludge drop -> Warrior's Forge & Champion Fuel */
  private playJunkFoodPactSound(ctx: AudioContext, now: number) {
    // Phase 1: Heavy sluggish thump (0.0s - 0.32s)
    const sludge = ctx.createOscillator();
    const sFilter = ctx.createBiquadFilter();
    const sGain = ctx.createGain();

    sFilter.type = 'lowpass';
    sFilter.frequency.setValueAtTime(280, now);
    sFilter.frequency.exponentialRampToValueAtTime(60, now + 0.32);

    sludge.type = 'sawtooth';
    sludge.frequency.setValueAtTime(170, now);
    sludge.frequency.exponentialRampToValueAtTime(38, now + 0.32);

    sGain.gain.setValueAtTime(0.4, now);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    sludge.connect(sFilter);
    sFilter.connect(sGain);
    sGain.connect(ctx.destination);
    sludge.start(now);
    sludge.stop(now + 0.32);

    // Phase 2: Anvil Forge metallic chime (520Hz + 1040Hz)
    [520, 1040].forEach((freq) => {
      const anvil = ctx.createOscillator();
      const aGain = ctx.createGain();
      const start = now + 0.34;
      anvil.type = 'triangle';
      anvil.frequency.setValueAtTime(freq, start);
      aGain.gain.setValueAtTime(0.2, start);
      aGain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      anvil.connect(aGain);
      aGain.connect(ctx.destination);
      anvil.start(start);
      anvil.stop(start + 0.4);
    });

    // Heroic power progression in F Major (clean athlete metabolic fire)
    const forgeNotes = [
      { freq: 174.61, delay: 0.36, dur: 0.6, gain: 0.18 }, // F3
      { freq: 261.63, delay: 0.46, dur: 0.6, gain: 0.20 }, // C4
      { freq: 349.23, delay: 0.58, dur: 0.65, gain: 0.22 }, // F4
      { freq: 440.00, delay: 0.70, dur: 0.75, gain: 0.24 }, // A4
      { freq: 523.25, delay: 0.82, dur: 0.9, gain: 0.26 }, // C5
    ];

    forgeNotes.forEach(({ freq, delay, dur, gain: vol }) => {
      const fOsc = ctx.createOscillator();
      const fGain = ctx.createGain();
      const start = now + delay;
      fOsc.type = 'sine';
      fOsc.frequency.setValueAtTime(freq, start);
      fGain.gain.setValueAtTime(0.001, start);
      fGain.gain.linearRampToValueAtTime(vol, start + 0.04);
      fGain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      fOsc.connect(fGain);
      fGain.connect(ctx.destination);
      fOsc.start(start);
      fOsc.stop(start + dur);
    });
  }

  /** 6. Doomscrolling: Digital glitch void -> Holographic neural reconnection */
  private playDoomscrollPactSound(ctx: AudioContext, now: number) {
    // Phase 1: Rapid digital glitch stutter (0.0s - 0.28s)
    const glitchNotes = [720, 380, 840, 220, 600, 160];
    glitchNotes.forEach((freq, idx) => {
      const gOsc = ctx.createOscillator();
      const gGain = ctx.createGain();
      const start = now + idx * 0.045;
      gOsc.type = 'square';
      gOsc.frequency.setValueAtTime(freq, start);
      gGain.gain.setValueAtTime(0.18, start);
      gGain.gain.exponentialRampToValueAtTime(0.001, start + 0.04);
      gOsc.connect(gGain);
      gGain.connect(ctx.destination);
      gOsc.start(start);
      gOsc.stop(start + 0.04);
    });

    // Phase 2: High-tech neural awaken chime (E Major Pentatonic cyber arpeggio)
    const cyberChime = [
      { freq: 329.63, delay: 0.32, dur: 0.6, gain: 0.18 }, // E4
      { freq: 493.88, delay: 0.42, dur: 0.65, gain: 0.20 }, // B4
      { freq: 659.25, delay: 0.52, dur: 0.7, gain: 0.22 }, // E5
      { freq: 830.61, delay: 0.64, dur: 0.8, gain: 0.24 }, // G#5
      { freq: 987.77, delay: 0.76, dur: 0.95, gain: 0.26 }, // B5
    ];

    cyberChime.forEach(({ freq, delay, dur, gain: vol }) => {
      const cOsc = ctx.createOscillator();
      const cGain = ctx.createGain();
      const start = now + delay;
      cOsc.type = 'triangle';
      cOsc.frequency.setValueAtTime(freq, start);
      cGain.gain.setValueAtTime(0.001, start);
      cGain.gain.linearRampToValueAtTime(vol, start + 0.03);
      cGain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      cOsc.connect(cGain);
      cGain.connect(ctx.destination);
      cOsc.start(start);
      cOsc.stop(start + dur);
    });

    // High sweep of focus
    const focusSweep = ctx.createOscillator();
    const focusGain = ctx.createGain();
    const fStart = now + 0.32;
    focusSweep.type = 'sine';
    focusSweep.frequency.setValueAtTime(400, fStart);
    focusSweep.frequency.exponentialRampToValueAtTime(1600, fStart + 0.4);
    focusGain.gain.setValueAtTime(0.001, fStart);
    focusGain.gain.linearRampToValueAtTime(0.12, fStart + 0.1);
    focusGain.gain.exponentialRampToValueAtTime(0.001, fStart + 0.4);
    focusSweep.connect(focusGain);
    focusGain.connect(ctx.destination);
    focusSweep.start(fStart);
    focusSweep.stop(fStart + 0.4);
  }

  /** 7. Sleep Deprivation: Clock tick-tock drop -> Celestial restorative aurora & gong */
  private playSleepPactSound(ctx: AudioContext, now: number) {
    // Phase 1: Clock tick-tock depletion (0.0s - 0.32s)
    [880, 580].forEach((freq, idx) => {
      const tick = ctx.createOscillator();
      const tGain = ctx.createGain();
      const start = now + idx * 0.12;
      tick.type = 'triangle';
      tick.frequency.setValueAtTime(freq, start);
      tGain.gain.setValueAtTime(0.2, start);
      tGain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);
      tick.connect(tGain);
      tGain.connect(ctx.destination);
      tick.start(start);
      tick.stop(start + 0.05);
    });

    const yawn = ctx.createOscillator();
    const yGain = ctx.createGain();
    yawn.type = 'sine';
    yawn.frequency.setValueAtTime(90, now + 0.15);
    yawn.frequency.exponentialRampToValueAtTime(35, now + 0.35);
    yGain.gain.setValueAtTime(0.3, now + 0.15);
    yGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    yawn.connect(yGain);
    yGain.connect(ctx.destination);
    yawn.start(now + 0.15);
    yawn.stop(now + 0.35);

    // Phase 2: Restorative celestial aurora (Warm G Major 9 chord)
    const auroraNotes = [
      { freq: 196.00, delay: 0.35, dur: 1.1, gain: 0.18 }, // G3
      { freq: 246.94, delay: 0.44, dur: 1.0, gain: 0.20 }, // B3
      { freq: 293.66, delay: 0.54, dur: 1.0, gain: 0.22 }, // D4
      { freq: 369.99, delay: 0.65, dur: 1.1, gain: 0.22 }, // F#4
      { freq: 493.88, delay: 0.78, dur: 1.2, gain: 0.24 }, // B4
    ];

    auroraNotes.forEach(({ freq, delay, dur, gain: vol }) => {
      const aOsc = ctx.createOscillator();
      const aGain = ctx.createGain();
      const start = now + delay;
      aOsc.type = 'sine';
      aOsc.frequency.setValueAtTime(freq, start);
      aGain.gain.setValueAtTime(0.001, start);
      aGain.gain.linearRampToValueAtTime(vol, start + 0.08);
      aGain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      aOsc.connect(aGain);
      aGain.connect(ctx.destination);
      aOsc.start(start);
      aOsc.stop(start + dur);
    });

    // Deep restorative temple gong (49Hz)
    const gong = ctx.createOscillator();
    const gongGain = ctx.createGain();
    const gongStart = now + 0.35;
    gong.type = 'sine';
    gong.frequency.setValueAtTime(49.00, gongStart); // G1
    gongGain.gain.setValueAtTime(0.001, gongStart);
    gongGain.gain.linearRampToValueAtTime(0.25, gongStart + 0.05);
    gongGain.gain.exponentialRampToValueAtTime(0.001, gongStart + 1.4);
    gong.connect(gongGain);
    gongGain.connect(ctx.destination);
    gong.start(gongStart);
    gong.stop(gongStart + 1.45);
  }

  /** 8. Default / Custom Pact: Classic Shattered Oath -> Phoenix Resurgence */
  private playDefaultPactSound(ctx: AudioContext, now: number) {
    // Heavy dissonant descending saw drops
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(45, now + 0.38);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Minor second clash
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(233, now);
    osc2.frequency.exponentialRampToValueAtTime(50, now + 0.32);
    gain2.gain.setValueAtTime(0.25, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.35);

    // Phoenix / Monarch Resurgence
    const resurgenceNotes = [
      { freq: 146.83, delay: 0.35, dur: 0.6, gain: 0.18 }, // D3
      { freq: 220.00, delay: 0.42, dur: 0.5, gain: 0.16 }, // A3
      { freq: 293.66, delay: 0.50, dur: 0.55, gain: 0.18 }, // D4
      { freq: 369.99, delay: 0.60, dur: 0.6, gain: 0.20 }, // F#4
      { freq: 440.00, delay: 0.70, dur: 0.7, gain: 0.22 }, // A4
      { freq: 587.33, delay: 0.82, dur: 0.85, gain: 0.25 }, // D5
    ];

    resurgenceNotes.forEach(({ freq, delay, dur, gain: vol }) => {
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const startTime = now + delay;
      noteOsc.type = 'triangle';
      noteOsc.frequency.setValueAtTime(freq, startTime);
      noteGain.gain.setValueAtTime(0.001, startTime);
      noteGain.gain.linearRampToValueAtTime(vol, startTime + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
      noteOsc.connect(noteGain);
      noteGain.connect(ctx.destination);
      noteOsc.start(startTime);
      noteOsc.stop(startTime + dur);
    });

    const padOsc = ctx.createOscillator();
    const padGain = ctx.createGain();
    const padStart = now + 0.35;
    padOsc.type = 'sine';
    padOsc.frequency.setValueAtTime(73.42, padStart);
    padGain.gain.setValueAtTime(0.001, padStart);
    padGain.gain.linearRampToValueAtTime(0.2, padStart + 0.1);
    padGain.gain.exponentialRampToValueAtTime(0.001, padStart + 1.2);
    padOsc.connect(padGain);
    padGain.connect(ctx.destination);
    padOsc.start(padStart);
    padOsc.stop(padStart + 1.25);
  }

  /**
   * Spoken motivational prompt tailored specifically to the violated pact
   */
  public speakPactMotivationalPrompt(pactId?: string, customPhrase?: string) {
    if (customPhrase && customPhrase.trim()) {
      this.speakMotivationalPrompt(customPhrase.trim());
      return;
    }
    const profile = getPactAudioProfile(pactId);
    this.speakMotivationalPrompt(profile.spokenPrompt || profile.resurgenceQuote);
  }

  /**
   * Motivational system voice synthesis (spoken audio)
   */
  public speakMotivationalPrompt(text: string) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.02;
      utterance.pitch = 0.95;
      utterance.volume = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Fallback
    }
  }

  public playPenaltyWarning() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.5);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Ignore
    }
  }

  public playHeal() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;
      const notes = [329.63, 392.00, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.06;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {
      // Ignore
    }
  }

  public playRaidVictory() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const chord = [392.00, 493.88, 587.33, 783.99, 987.77];
      const now = ctx.currentTime;

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.09;
        const noteDuration = 0.8;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.18, noteStart + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });
    } catch {
      // Ignore
    }
  }

  public playWarning() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;
      [0, 0.18, 0.36].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + offset;
        const noteDuration = 0.14;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, noteStart);
        osc.frequency.exponentialRampToValueAtTime(880, noteStart + noteDuration);

        gain.gain.setValueAtTime(0.22, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });
    } catch {
      // Ignore
    }
  }

  public playPenaltyAlert() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;
      [0, 0.14, 0.28].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + offset;
        const noteDuration = 0.11;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, noteStart);

        gain.gain.setValueAtTime(0.28, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });
    } catch {
      // Ignore
    }
  }

  public playAwakening() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.4);
    } catch {
      // Ignore
    }
  }

  // Ambient Focus Generator
  private ambientOscL: OscillatorNode | null = null;
  private ambientOscR: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  public isAmbientPlaying: boolean = false;
  public currentAmbientMode: 'alpha' | 'rain' | 'noise' | 'off' = 'off';
  public voiceEnabled: boolean = true;

  public speakSystemVoice(text: string, lang = 'es-ES') {
    if (!this.enabled || !this.voiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.9;
      utterance.lang = lang;

      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(
        (v) => v.lang.startsWith(lang.split('-')[0]) || v.name.includes('Google') || v.name.includes('Natural')
      );
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore if speech synthesis blocked or unavailable
    }
  }

  public playAmbient(mode: 'alpha' | 'rain' | 'noise' | 'off') {
    if (mode === 'off') {
      this.stopAmbientFocus();
    } else {
      this.startAmbientFocus(mode);
    }
  }

  public stopAmbient() {
    this.stopAmbientFocus();
  }

  public startAmbientFocus(mode: 'alpha' | 'rain' | 'noise', volume = 0.08) {
    this.stopAmbientFocus();
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(volume, ctx.currentTime);
      this.ambientGain.connect(ctx.destination);

      if (mode === 'alpha') {
        // Binaural beat: 432Hz and 442Hz (10Hz Alpha focus wave)
        this.ambientOscL = ctx.createOscillator();
        this.ambientOscR = ctx.createOscillator();
        this.ambientOscL.type = 'sine';
        this.ambientOscR.type = 'sine';
        this.ambientOscL.frequency.setValueAtTime(432, ctx.currentTime);
        this.ambientOscR.frequency.setValueAtTime(442, ctx.currentTime);

        this.ambientOscL.connect(this.ambientGain);
        this.ambientOscR.connect(this.ambientGain);

        this.ambientOscL.start();
        this.ambientOscR.start();
      } else {
        // Synthesized noise buffer (rain / soothing white noise)
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (mode === 'rain') {
            // Brown/Pink filtered noise
            output[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
          } else {
            output[i] = white * 0.15;
          }
        }

        this.noiseSource = ctx.createBufferSource();
        this.noiseSource.buffer = noiseBuffer;
        this.noiseSource.loop = true;

        // Low-pass filter for soothing tone
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(mode === 'rain' ? 800 : 1200, ctx.currentTime);

        this.noiseSource.connect(filter);
        filter.connect(this.ambientGain);
        this.noiseSource.start();
      }

      this.isAmbientPlaying = true;
      this.currentAmbientMode = mode;
    } catch {
      // Audio restrict
    }
  }

  public stopAmbientFocus() {
    try {
      if (this.ambientOscL) {
        this.ambientOscL.stop();
        this.ambientOscL.disconnect();
        this.ambientOscL = null;
      }
      if (this.ambientOscR) {
        this.ambientOscR.stop();
        this.ambientOscR.disconnect();
        this.ambientOscR = null;
      }
      if (this.noiseSource) {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
        this.noiseSource = null;
      }
      if (this.ambientGain) {
        this.ambientGain.disconnect();
        this.ambientGain = null;
      }
    } catch {
      // Ignore
    }
    this.isAmbientPlaying = false;
    this.currentAmbientMode = 'off';
  }

  /** Subtle hover sound for RPG buttons */
  public playHover() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.025);
    } catch {}
  }

  /** Rattle sound for opening gacha/mystery chest */
  public playChestRattle() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140 + i * 40, now + i * 0.07);
        gain.gain.setValueAtTime(0.08, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.05);
      }
    } catch {}
  }

  /** Radiant triumphant burst for gacha item reveal */
  public playChestBurst() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;
      // Fanfare chord: C5, E5, G5, B5, C6
      const chord = [523.25, 659.25, 783.99, 987.77, 1046.50];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.04 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.85);
      });
    } catch {}
  }

  /** Sub-bass rumble for impact/screen shake events */
  public playImpactBoom() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  /**
   * Narrates a motivational resurgence prompt using Web Speech API
   * Styled like the System AI speaking directly to the Hunter
   */
  public speakMotivation(text: string, pitch = 0.92, rate = 1.05) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Prefer a natural Spanish voice if available
      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find(
        (v) =>
          v.lang.startsWith('es') &&
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Castilian') || v.name.includes('Sabina') || v.name.includes('Jorge'))
      ) || voices.find((v) => v.lang.startsWith('es'));

      if (esVoice) utterance.voice = esVoice;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore
    }
  }

  public stopVoice() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const sound = new SoundManager();
