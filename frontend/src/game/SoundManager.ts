export class SoundManager {
  private context: AudioContext | null = null;
  private pulseWave: PeriodicWave | null = null;

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
      this.pulseWave = this.buildPulseWave(this.context, 0.25);
    }
    if (this.context.state === 'suspended') {
      void this.context.resume();
    }
    return this.context;
  }

  unlock(): void {
    this.getContext();
  }

  playLineClear(lines: number): void {
    const ctx = this.getContext();
    if (lines >= 4) {
      this.playTetris(ctx);
    } else {
      this.playSweep(ctx, lines);
    }
  }

  // NES Tetris 1-3 Reihen: kurzer absteigender Frequenz-Sweep
  private playSweep(ctx: AudioContext, lines: number): void {
    const now = ctx.currentTime;
    const startFreq = 440 * Math.pow(2, (lines - 1) * 0.5); // je mehr Reihen, desto höher
    const endFreq = startFreq * 0.5;
    const duration = 0.08 + lines * 0.02;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.setPeriodicWave(this.pulseWave!);
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  // NES Tetris 4 Reihen: aufsteigende Arpeggio-Fanfare (E-G-B-E)
  private playTetris(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6
    const stepDuration = 0.07;

    notes.forEach((freq, i) => {
      const t = now + i * stepDuration;
      const duration = i === notes.length - 1 ? 0.22 : stepDuration;
      this.playPulseNote(ctx, freq, t, duration);
    });
  }

  private playPulseNote(ctx: AudioContext, freq: number, startTime: number, duration: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.setPeriodicWave(this.pulseWave!);
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.18, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // 25%-Duty-Cycle-Pulswelle wie NES APU Pulse-Kanal
  // Fourier: real[n] = (2/(nπ)) * sin(nπd), d = 0.25
  private buildPulseWave(ctx: AudioContext, duty: number): PeriodicWave {
    const harmonics = 64;
    const real = new Float32Array(harmonics);
    const imag = new Float32Array(harmonics);
    for (let n = 1; n < harmonics; n++) {
      real[n] = (2 / (n * Math.PI)) * Math.sin(Math.PI * n * duty);
    }
    return ctx.createPeriodicWave(real, imag);
  }
}
