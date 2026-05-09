export type GameMode = 'standard' | 'mittel' | 'schwer';

export interface ModeConfig {
  cols: number;
  rows: number;
  label: string;
  cellSize: number;
}

export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  standard: { cols: 10, rows: 20, label: 'Standard (10×20)', cellSize: 40 },
  mittel:   { cols: 10, rows: 15, label: 'Mittel (10×15)',   cellSize: 44 },
  schwer:   { cols:  6, rows: 12, label: 'Schwer (6×12)',    cellSize: 55 },
};

export interface HighscoreEntry {
  id?: number;
  playerName: string;
  score: number;
  level: number;
  lines: number;
  mode: GameMode;
  createdAt?: string;
}
