// Web Audio API procedural sound engine for Floating Memory Island
// Generates dreamy romantic chords, gentle wind, water ripples, night crickets, and chimes

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private ambientNoiseNode: AudioNode | null = null;
  private ambientFilterNode: BiquadFilterNode | null = null;

  private masterVol: number = 0.7;
  private musicVol: number = 0.5;
  private envVol: number = 0.5;

  private currentTheme: 'morning' | 'afternoon' | 'sunset' | 'night' = 'sunset';

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.envVol, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(val: number) {
    this.masterVol = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.masterVol, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicVolume(val: number) {
    this.musicVol = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVol, this.ctx.currentTime, 0.05);
    }
  }

  public setEnvVolume(val: number) {
    this.envVol = Math.max(0, Math.min(1, val));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.envVol, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.masterVol,
        this.ctx.currentTime,
        0.05
      );
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolumes() {
    return {
      master: this.masterVol,
      music: this.musicVol,
      env: this.envVol,
      isMuted: this.isMuted,
      isPlaying: this.isMusicPlaying,
    };
  }

  public startAtmosphere(theme: 'morning' | 'afternoon' | 'sunset' | 'night' = 'sunset') {
    this.initContext();
    this.currentTheme = theme;
    this.startAmbientNoise();
    this.startMusicProgression();
  }

  public updateTheme(theme: 'morning' | 'afternoon' | 'sunset' | 'night') {
    this.currentTheme = theme;
    if (this.ambientFilterNode && this.ctx) {
      const targetFreq =
        theme === 'night' ? 280 : theme === 'morning' ? 650 : theme === 'sunset' ? 440 : 520;
      this.ambientFilterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 1.5);
    }
  }

  private startAmbientNoise() {
    if (!this.ctx || !this.ambientGain) return;
    if (this.ambientNoiseNode) return;

    // Pink noise generator for gentle breeze
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(440, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);
    this.ambientFilterNode = filter;

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);
    whiteNoise.start();
    this.ambientNoiseNode = whiteNoise;
  }

  private startMusicProgression() {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Romantic dreamy chords in F Major / D Minor pentatonic
    // Fmaj9, Cmaj7, Dm9, Bbmaj7
    const chords = [
      [349.23, 440.0, 523.25, 659.25], // F4, A4, C5, E5
      [261.63, 329.63, 392.0, 493.88], // C4, E4, G4, B4
      [293.66, 349.23, 440.0, 523.25], // D4, F4, A4, C5
      [233.08, 293.66, 349.23, 440.0], // Bb3, D4, F4, A4
    ];

    let chordIdx = 0;
    const playNext = () => {
      if (!this.isMusicPlaying) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      // Arpeggiate chord notes with soft music box / Rhodes tone
      notes.forEach((freq, i) => {
        setTimeout(() => {
          if (this.isMusicPlaying) {
            this.playMusicBoxTone(freq, 2.5);
          }
        }, i * 360);
      });

      this.musicTimer = window.setTimeout(playNext, 3800);
    };

    playNext();
  }

  private playMusicBoxTone(frequency: number, duration: number = 2.0) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    // Warm envelope
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  // Interaction sound effects
  public playChime(pitch: number = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((baseFreq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * pitch, this.ctx!.currentTime + i * 0.06);

      const t = this.ctx!.currentTime + i * 0.06;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + 1.25);
    });
  }

  public playPageTurn() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  public playWaterSplash() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public stopAll() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const audioService = new SoundEngine();
