import type { GameMode, HighscoreEntry } from '../types';
import { MODE_CONFIGS } from '../types';
import { getHighscores } from '../api/HighscoreApi';

const MODES: GameMode[] = ['standard', 'mittel', 'schwer'];

export class HighscorePanel {
  private readonly lists: Map<GameMode, HTMLElement> = new Map();

  constructor(container: HTMLElement) {
    const row = document.createElement('div');
    row.id = 'highscore-row';

    for (const mode of MODES) {
      const box = document.createElement('div');
      box.className = 'highscore-box';
      box.innerHTML = `
        <h3 class="highscore-box-heading">${MODE_CONFIGS[mode].label}</h3>
        <ol class="highscore-box-list"></ol>
      `;
      row.appendChild(box);
      this.lists.set(mode, box.querySelector('.highscore-box-list')!);
    }

    container.appendChild(row);
  }

  async refreshAll(): Promise<void> {
    await Promise.all(MODES.map((mode) => this.refreshMode(mode)));
  }

  async refreshMode(mode: GameMode): Promise<void> {
    const listEl = this.lists.get(mode)!;
    try {
      const entries = await getHighscores(mode);
      this.render(listEl, entries);
    } catch {
      listEl.innerHTML = '<li class="highscore-box-empty">–</li>';
    }
  }

  private render(listEl: HTMLElement, entries: HighscoreEntry[]): void {
    listEl.innerHTML = '';
    if (entries.length === 0) {
      const li = document.createElement('li');
      li.className = 'highscore-box-empty';
      li.textContent = 'Keine Einträge';
      listEl.appendChild(li);
      return;
    }
    entries.slice(0, 10).forEach((entry) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="highscore-box-name">${entry.playerName}</span><span class="highscore-box-score">${entry.score.toLocaleString('de-DE')}</span>`;
      listEl.appendChild(li);
    });
  }
}
