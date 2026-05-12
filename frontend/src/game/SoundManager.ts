interface ScheduledNote {
  freq: number;
  startOffset: number;
  duration: number;
}

export class SoundManager {
  private context: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
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
    const now = ctx.currentTime;
    for (const note of this.notesForLines(lines)) {
      this.playSquareNote(ctx, note.freq, now + note.startOffset, note.duration);
    }
  }

  private notesForLines(lines: number): ScheduledNote[] {
    // NES Tetris: kurze aufsteigende Arpeggio-Folge, bei Tetris (4 Reihen) länger
    const sweepNotes: ScheduledNote[] = [
      { freq: 523.25, startOffset: 0.00, duration: 0.07 },
      { freq: 659.25, startOffset: 0.07, duration: 0.07 },
      { freq: 783.99, startOffset: 0.14, duration: 0.07 },
      { freq: 1046.50, startOffset: 0.21, duration: 0.14 },
    ];
    if (lines >= 4) {
      return sweepNotes;
    }
    return sweepNotes.slice(0, lines);
  }

  private playSquareNote(ctx: AudioContext, frequency: number, startTime: number, duration: number): void {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }
}
