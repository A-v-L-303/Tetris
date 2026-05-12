import type { GameMode } from '../types';
import { MODE_CONFIGS } from '../types';

export class MenuScreen {
  private readonly el: HTMLElement;

  constructor(container: HTMLElement, onStart: (mode: GameMode) => void) {
    this.el = document.createElement('div');
    this.el.className = 'screen';
    this.el.innerHTML = `
      <h1 class="game-title">TETRIS</h1>
      <div class="mode-select">
        <p class="mode-label">Spielmodus wählen:</p>
        <div class="mode-buttons"></div>
      </div>
      <div class="controls-hint">
        <span>← → Bewegen</span>
        <span>↑ / X Drehen</span>
        <span>Z Gegenuhrzeigersinn</span>
        <span>↓ Soft Drop</span>
        <span>Leertaste Hard Drop</span>
        <span>C Hold</span>
      </div>
    `;
    container.appendChild(this.el);

    const modeButtons = this.el.querySelector('.mode-buttons')!;
    const modes: GameMode[] = ['standard', 'mittel', 'schwer'];
    for (const mode of modes) {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = MODE_CONFIGS[mode].label;
      btn.addEventListener('click', () => onStart(mode));
      modeButtons.appendChild(btn);
    }
  }

  show(): void { this.el.style.display = 'flex'; }
  hide(): void { this.el.style.display = 'none'; }
}
