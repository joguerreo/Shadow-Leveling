// Web Audio API Synthesizer for Solo Leveling System SFX

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
}

export const sound = new SoundManager();
