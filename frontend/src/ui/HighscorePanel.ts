import type { GameMode, HighscoreEntry } from '../types';
import { MODE_CONFIGS } from '../types';
import { getHighscores } from '../api/HighscoreApi';

const MODES: GameMode[] = ['standard', 'mittel', 'schwer'];

export class HighscorePanel {
  private readonly sections: Map<GameMode, HTMLElement> = new Map();

  constructor(container: HTMLElement) {
    const el = document.createElement('div');
    el.className = 'highscore-panel';

    for (const mode of MODES) {
      const section = document.createElement('div');
      section.className = 'panel-section';
      section.innerHTML = `
        <h3 class="panel-mode-heading">${MODE_CONFIGS[mode].label}</h3>
        <ol class="panel-list"></ol>
      `;
      el.appendChild(section);
      this.sections.set(mode, section.querySelector('.panel-list')!);
    }

    container.appendChild(el);
  }

  async refreshAll(): Promise<void> {
    await Promise.all(MODES.map((mode) => this.refreshMode(mode)));
  }

  async refreshMode(mode: GameMode): Promise<void> {
    const listEl = this.sections.get(mode)!;
    try {
      const entries = await getHighscores(mode);
      this.render(listEl, entries);
    } catch {
      listEl.innerHTML = '<li class="panel-empty">–</li>';
    }
  }

  private render(listEl: HTMLElement, entries: HighscoreEntry[]): void {
    listEl.innerHTML = '';
    if (entries.length === 0) {
      const li = document.createElement('li');
      li.className = 'panel-empty';
      li.textContent = 'Keine Einträge';
      listEl.appendChild(li);
      return;
    }
    entries.slice(0, 10).forEach((entry) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="panel-name">${entry.playerName}</span><span class="panel-score">${entry.score.toLocaleString('de-DE')}</span>`;
      listEl.appendChild(li);
    });
  }
}
