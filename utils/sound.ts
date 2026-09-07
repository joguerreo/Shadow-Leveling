// Web Audio API Synthesizer for Solo Leveling System SFX

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playBeep(freq = 600, duration = 0.08, type: OscillatorType = 'sine') {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
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
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }, idx * 70);
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
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }, idx * 60);
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
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
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
      const chord = [392.00, 493.88, 587.33, 783.99, 987.77];
      chord.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.8);
        }, idx * 100);
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
      [0, 200, 400].forEach((delay) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }, delay);
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
      [0, 150, 300].forEach((delay) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        }, delay);
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
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
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
