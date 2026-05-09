export class GameOverScreen {
  private readonly el: HTMLElement;
  private readonly scoreEl: HTMLElement;
  private readonly nameInput: HTMLInputElement;
  private readonly submitBtn: HTMLButtonElement;
  private readonly errorEl: HTMLElement;

  constructor(
    container: HTMLElement,
    onSubmit: (name: string) => void,
    onMenu: () => void,
  ) {
    this.el = document.createElement('div');
    this.el.className = 'screen';
    this.el.innerHTML = `
      <h2 class="gameover-title">GAME OVER</h2>
      <p class="final-score"></p>
      <div class="name-form">
        <label class="name-label">Spielername (3–5 Zeichen):</label>
        <input class="name-input" type="text" maxlength="5" autocomplete="off" spellcheck="false" />
        <p class="name-error"></p>
        <button class="btn submit-btn">Eintragen</button>
      </div>
      <button class="btn btn-secondary menu-btn">Zurück zum Menü</button>
    `;
    container.appendChild(this.el);

    this.scoreEl = this.el.querySelector('.final-score')!;
    this.nameInput = this.el.querySelector('.name-input')!;
    this.submitBtn = this.el.querySelector('.submit-btn')!;
    this.errorEl = this.el.querySelector('.name-error')!;

    this.submitBtn.addEventListener('click', () => {
      const name = this.nameInput.value.trim().toUpperCase();
      if (name.length < 3 || name.length > 5) {
        this.errorEl.textContent = 'Name muss 3 bis 5 Zeichen haben.';
        return;
      }
      this.errorEl.textContent = '';
      onSubmit(name);
    });

    this.nameInput.addEventListener('keydown', (e) => {
      if (e.code === 'Enter') this.submitBtn.click();
    });

    this.el.querySelector('.menu-btn')!.addEventListener('click', onMenu);
  }

  show(score: number, level: number, lines: number): void {
    this.scoreEl.textContent = `Score: ${score.toLocaleString('de-DE')}  |  Level: ${level}  |  Reihen: ${lines}`;
    this.nameInput.value = '';
    this.errorEl.textContent = '';
    this.el.style.display = 'flex';
    setTimeout(() => this.nameInput.focus(), 50);
  }

  hide(): void { this.el.style.display = 'none'; }
}
