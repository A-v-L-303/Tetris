export type GameMode = 'standard' | 'mittel' | 'schwer';

export interface ModeConfig {
  cols: number;
  rows: number;
  label: string;
  cellSize: number;
}

export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  standard: { cols: 10, rows: 50, label: 'Standard (10×50)', cellSize: 14 },
  mittel:   { cols: 10, rows: 35, label: 'Mittel (10×35)',   cellSize: 20 },
  schwer:   { cols: 10, rows: 20, label: 'Schwer (10×20)',   cellSize: 35 },
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
