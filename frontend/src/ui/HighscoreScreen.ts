import type { GameMode, HighscoreEntry } from '../types';
import { MODE_CONFIGS } from '../types';

export class HighscoreScreen {
  private readonly el: HTMLElement;
  private readonly titleEl: HTMLElement;
  private readonly listEl: HTMLElement;

  constructor(container: HTMLElement, onMenu: () => void) {
    this.el = document.createElement('div');
    this.el.className = 'screen';
    this.el.innerHTML = `
      <h2 class="highscore-title"></h2>
      <ol class="highscore-list"></ol>
      <button class="btn menu-btn">Zurück zum Menü</button>
    `;
    container.appendChild(this.el);

    this.titleEl = this.el.querySelector('.highscore-title')!;
    this.listEl = this.el.querySelector('.highscore-list')!;
    this.el.querySelector('.menu-btn')!.addEventListener('click', onMenu);
  }

  show(entries: HighscoreEntry[], mode: GameMode): void {
    this.titleEl.textContent = `HIGHSCORES – ${MODE_CONFIGS[mode].label}`;
    this.listEl.innerHTML = '';

    if (entries.length === 0) {
      const li = document.createElement('li');
      li.className = 'no-entries';
      li.textContent = 'Noch keine Einträge.';
      this.listEl.appendChild(li);
    } else {
      entries.forEach((entry, i) => {
        const li = document.createElement('li');
        const rank = String(i + 1).padStart(2, ' ');
        const name = entry.playerName.padEnd(5, ' ');
        const score = entry.score.toLocaleString('de-DE').padStart(9, ' ');
        li.textContent = `${rank}. ${name}  ${score}  Lv.${entry.level}`;
        this.listEl.appendChild(li);
      });
    }

    this.el.style.display = 'flex';
  }

  hide(): void { this.el.style.display = 'none'; }
}
