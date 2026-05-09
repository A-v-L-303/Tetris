import type { GameMode, HighscoreEntry } from '../types';
import { MODE_CONFIGS } from '../types';
import { getHighscores } from '../api/HighscoreApi';

export class HighscorePanel {
  private readonly modeEl: HTMLElement;
  private readonly listEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = document.createElement('div');
    el.className = 'highscore-panel';
    el.innerHTML = `
      <h3 class="panel-heading">TOP 10</h3>
      <p class="panel-mode"></p>
      <ol class="panel-list"></ol>
    `;
    container.appendChild(el);
    this.modeEl = el.querySelector('.panel-mode')!;
    this.listEl = el.querySelector('.panel-list')!;
  }

  async refresh(mode: GameMode): Promise<void> {
    this.modeEl.textContent = MODE_CONFIGS[mode].label;
    try {
      const entries = await getHighscores(mode);
      this.render(entries);
    } catch {
      this.listEl.innerHTML = '<li class="panel-empty">Server nicht erreichbar</li>';
    }
  }

  private render(entries: HighscoreEntry[]): void {
    this.listEl.innerHTML = '';
    if (entries.length === 0) {
      const li = document.createElement('li');
      li.className = 'panel-empty';
      li.textContent = 'Noch keine Einträge';
      this.listEl.appendChild(li);
      return;
    }
    entries.slice(0, 10).forEach((entry) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="panel-name">${entry.playerName}</span><span class="panel-score">${entry.score.toLocaleString('de-DE')}</span>`;
      this.listEl.appendChild(li);
    });
  }
}
