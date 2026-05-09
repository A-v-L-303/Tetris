import './styles.css';
import type { GameMode } from './types';
import { GameEngine } from './game/GameEngine';
import { Renderer } from './game/Renderer';
import { MenuScreen } from './ui/MenuScreen';
import { GameOverScreen } from './ui/GameOverScreen';
import { HighscorePanel } from './ui/HighscorePanel';
import { postHighscore } from './api/HighscoreApi';

function main(): void {
  const app = document.getElementById('app')!;

  const mainContent = document.createElement('div');
  mainContent.id = 'main-content';
  app.appendChild(mainContent);

  const panel = new HighscorePanel(app);

  let engine: GameEngine | null = null;
  let currentMode: GameMode = 'standard';
  let pendingScore = 0;
  let pendingLevel = 0;
  let pendingLines = 0;

  const gameWrapper = document.createElement('div');
  gameWrapper.className = 'screen';
  const canvas = document.createElement('canvas');
  gameWrapper.appendChild(canvas);
  mainContent.appendChild(gameWrapper);

  const menuScreen = new MenuScreen(mainContent, startGame);
  const gameOverScreen = new GameOverScreen(mainContent, onNameSubmit, showMenu);

  function hideAll(): void {
    gameWrapper.style.display = 'none';
    menuScreen.hide();
    gameOverScreen.hide();
  }

  function showMenu(): void {
    engine?.stop();
    engine = null;
    hideAll();
    menuScreen.show();
  }

  function startGame(mode: GameMode): void {
    currentMode = mode;
    hideAll();
    gameWrapper.style.display = 'flex';
    panel.refreshMode(mode);

    const renderer = new Renderer(canvas, mode);

    engine?.stop();
    engine = new GameEngine(
      mode,
      (state) => renderer.render(state),
      (score, level, lines) => {
        pendingScore = score;
        pendingLevel = level;
        pendingLines = lines;
        hideAll();
        gameOverScreen.show(score, level, lines);
      },
    );
    engine.start();
  }

  async function onNameSubmit(playerName: string): Promise<void> {
    try {
      await postHighscore({
        playerName,
        score: pendingScore,
        level: pendingLevel,
        lines: pendingLines,
        mode: currentMode,
      });
    } catch {
      // Speichern fehlgeschlagen – trotzdem zum Menü
    }
    await panel.refreshMode(currentMode);
    showMenu();
  }

  panel.refreshAll();
  showMenu();
}

main();
