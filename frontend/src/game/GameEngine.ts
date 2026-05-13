import type { GameMode } from '../types';
import { MODE_CONFIGS } from '../types';
import type { ActiveTetromino, TetrominoType } from './Tetromino';
import { SevenBag } from './Tetromino';
import type { Grid } from './Board';
import { clearLines, createGrid, isValidPosition, lockPiece } from './Board';
import { SoundManager } from './SoundManager';

export interface GameState {
  grid: Grid;
  current: ActiveTetromino;
  next: TetrominoType;
  held: TetrominoType | null;
  score: number;
  level: number;
  lines: number;
  ghostY: number;
}

// NES-Fallgeschwindigkeit in ms pro Zelle
const DROP_INTERVALS: number[] = [
  800, 717, 633, 550, 467, 383, 300, 217, 133, 100, // Level 0-9
  83,  83,  83,                                       // Level 10-12
  67,  67,  67,                                       // Level 13-15
  50,  50,  50,                                       // Level 16-18
  33,  33,  33,  33,  33,  33,  33,  33,  33,  33,  // Level 19-28
  17,                                                  // Level 29+
];

function getDropInterval(level: number): number {
  return DROP_INTERVALS[Math.min(level, DROP_INTERVALS.length - 1)];
}

// NES-Punktetabelle: Punkte × (Level + 1)
const SCORE_TABLE = [0, 100, 300, 500, 800];

const DAS_DELAY = 170;
const DAS_REPEAT = 50;
const SOFT_DROP_INTERVAL = 50;

const SPAWN_WIDTH: Record<TetrominoType, number> = {
  I: 4, O: 2, T: 3, J: 3, L: 3, S: 3, Z: 3,
};

export class GameEngine {
  private grid: Grid;
  private current!: ActiveTetromino;
  private next: TetrominoType;
  private readonly bag = new SevenBag();
  private score = 0;
  private level = 0;
  private lines = 0;

  private held: TetrominoType | null = null;
  private holdUsed = false;

  private readonly cols: number;
  private readonly rows: number;

  private dropAccumulator = 0;
  private softDrop = false;
  private leftHeld = false;
  private rightHeld = false;
  private leftTimer = 0;
  private rightTimer = 0;

  private animationId = 0;
  private lastTime = 0;
  private running = false;

  private readonly soundManager = new SoundManager();

  private readonly onStateUpdate: (state: GameState) => void;
  private readonly onGameOver: (score: number, level: number, lines: number) => void;

  constructor(
    mode: GameMode,
    onStateUpdate: (state: GameState) => void,
    onGameOver: (score: number, level: number, lines: number) => void,
  ) {
    this.onStateUpdate = onStateUpdate;
    this.onGameOver = onGameOver;
    const config = MODE_CONFIGS[mode];
    this.cols = config.cols;
    this.rows = config.rows;
    this.grid = createGrid(this.rows, this.cols);
    this.next = this.bag.next();
  }

  start(): void {
    this.spawnPiece();
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    this.running = true;
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.animationId);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }

  private readonly loop = (time: number): void => {
    if (!this.running) return;
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.update(Math.min(delta, 100)); // Clamp bei Tab-Wechsel
    this.emit();
    this.animationId = requestAnimationFrame(this.loop);
  };

  private update(delta: number): void {
    this.handleDAS(delta);

    const interval = this.softDrop ? SOFT_DROP_INTERVAL : getDropInterval(this.level);
    this.dropAccumulator += delta;

    while (this.dropAccumulator >= interval) {
      this.dropAccumulator -= interval;
      this.drop();
    }
  }

  private handleDAS(delta: number): void {
    if (this.leftHeld) {
      this.leftTimer += delta;
      if (this.leftTimer >= DAS_DELAY) {
        const elapsed = this.leftTimer - DAS_DELAY;
        const prevElapsed = Math.max(0, elapsed - delta);
        if (Math.floor(elapsed / DAS_REPEAT) > Math.floor(prevElapsed / DAS_REPEAT)) {
          this.tryMove(-1, 0);
        }
      }
    }
    if (this.rightHeld) {
      this.rightTimer += delta;
      if (this.rightTimer >= DAS_DELAY) {
        const elapsed = this.rightTimer - DAS_DELAY;
        const prevElapsed = Math.max(0, elapsed - delta);
        if (Math.floor(elapsed / DAS_REPEAT) > Math.floor(prevElapsed / DAS_REPEAT)) {
          this.tryMove(1, 0);
        }
      }
    }
  }

  private drop(): void {
    if (!this.tryMove(0, 1)) {
      this.lock();
    }
  }

  private tryMove(dx: number, dy: number): boolean {
    const nx = this.current.x + dx;
    const ny = this.current.y + dy;
    if (isValidPosition(this.grid, this.current.type, this.current.rotation, nx, ny)) {
      this.current.x = nx;
      this.current.y = ny;
      return true;
    }
    return false;
  }

  private tryRotate(dr: number): void {
    const newRotation = ((this.current.rotation + dr) % 4 + 4) % 4;
    if (isValidPosition(this.grid, this.current.type, newRotation, this.current.x, this.current.y)) {
      this.current.rotation = newRotation;
    }
  }

  private hardDrop(): void {
    while (this.tryMove(0, 1)) { /* fallen */ }
    this.lock();
  }

  private lock(): void {
    lockPiece(this.grid, this.current);
    const cleared = clearLines(this.grid);
    if (cleared > 0) {
      this.soundManager.playLineClear(cleared);
      this.score += SCORE_TABLE[cleared] * (this.level + 1);
      this.lines += cleared;
      this.level = Math.floor(this.lines / 10);
    }
    this.dropAccumulator = 0;
    this.spawnPiece();
  }

  private spawnPiece(): void {
    const type = this.next;
    this.next = this.bag.next();
    this.holdUsed = false;

    const spawnX = Math.floor((this.cols - SPAWN_WIDTH[type]) / 2);
    const spawnY = type === 'I' ? -1 : 0;

    this.current = { type, rotation: 0, x: spawnX, y: spawnY };

    if (!isValidPosition(this.grid, this.current.type, this.current.rotation, this.current.x, this.current.y)) {
      this.stop();
      this.onGameOver(this.score, this.level, this.lines);
    }
  }

  private holdPiece(): void {
    if (this.holdUsed) return;
    this.holdUsed = true;

    const currentType = this.current.type;
    let newType: TetrominoType;

    if (this.held === null) {
      newType = this.next;
      this.next = this.bag.next();
    } else {
      newType = this.held;
    }

    this.held = currentType;

    const spawnX = Math.floor((this.cols - SPAWN_WIDTH[newType]) / 2);
    const spawnY = newType === 'I' ? -1 : 0;
    this.current = { type: newType, rotation: 0, x: spawnX, y: spawnY };
    this.dropAccumulator = 0;

    if (!isValidPosition(this.grid, this.current.type, this.current.rotation, this.current.x, this.current.y)) {
      this.stop();
      this.onGameOver(this.score, this.level, this.lines);
    }
  }

  private calcGhostY(): number {
    let ghostY = this.current.y;
    while (isValidPosition(this.grid, this.current.type, this.current.rotation, this.current.x, ghostY + 1)) {
      ghostY++;
    }
    return ghostY;
  }

  private emit(): void {
    this.onStateUpdate({
      grid: this.grid,
      current: this.current,
      next: this.next,
      held: this.held,
      score: this.score,
      level: this.level,
      lines: this.lines,
      ghostY: this.calcGhostY(),
    });
  }

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (e.repeat) return;
    this.soundManager.unlock();
    switch (e.code) {
      case 'ArrowLeft':
        e.preventDefault();
        this.leftHeld = true;
        this.leftTimer = 0;
        this.tryMove(-1, 0);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.rightHeld = true;
        this.rightTimer = 0;
        this.tryMove(1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.softDrop = true;
        this.dropAccumulator = 0;
        break;
      case 'ArrowUp':
      case 'KeyX':
        e.preventDefault();
        this.tryRotate(1);
        break;
      case 'KeyZ':
        this.tryRotate(-1);
        break;
      case 'KeyC':
        this.holdPiece();
        break;
      case 'Space':
        e.preventDefault();
        this.hardDrop();
        break;
    }
  };

  private readonly onKeyUp = (e: KeyboardEvent): void => {
    switch (e.code) {
      case 'ArrowLeft':
        this.leftHeld = false;
        this.leftTimer = 0;
        break;
      case 'ArrowRight':
        this.rightHeld = false;
        this.rightTimer = 0;
        break;
      case 'ArrowDown':
        this.softDrop = false;
        break;
    }
  };
}
