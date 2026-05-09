import './styles.css';
import type { GameMode } from './types';
import { GameEngine } from './game/GameEngine';
import { Renderer } from './game/Renderer';
import { MenuScreen } from './ui/MenuScreen';
import { GameOverScreen } from './ui/GameOverScreen';
import { HighscoreScreen } from './ui/HighscoreScreen';
import { getHighscores, postHighscore } from './api/HighscoreApi';

function main(): void {
  const app = document.getElementById('app')!;

  let engine: GameEngine | null = null;
  let currentMode: GameMode = 'standard';
  let pendingScore = 0;
  let pendingLevel = 0;
  let pendingLines = 0;

  // Canvas-Wrapper
  const gameWrapper = document.createElement('div');
  gameWrapper.className = 'screen';
  const canvas = document.createElement('canvas');
  gameWrapper.appendChild(canvas);
  app.appendChild(gameWrapper);

  const menuScreen = new MenuScreen(app, startGame);
  const gameOverScreen = new GameOverScreen(app, onNameSubmit, showMenu);
  const highscoreScreen = new HighscoreScreen(app, showMenu);

  function hideAll(): void {
    gameWrapper.style.display = 'none';
    menuScreen.hide();
    gameOverScreen.hide();
    highscoreScreen.hide();
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
      // Highscore-Speichern fehlgeschlagen – trotzdem Highscore-Liste zeigen
    }
    await showHighscores();
  }

  async function showHighscores(): Promise<void> {
    try {
      const entries = await getHighscores(currentMode);
      hideAll();
      highscoreScreen.show(entries, currentMode);
    } catch {
      showMenu();
    }
  }

  showMenu();
}

main();
