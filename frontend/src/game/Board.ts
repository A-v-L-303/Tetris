import type { ActiveTetromino, TetrominoType } from './Tetromino';
import { COLORS, getShape } from './Tetromino';

export type Cell = string | null;
export type Grid = Cell[][];

export function createGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill(null) as Cell[]);
}

export function isValidPosition(
  grid: Grid,
  type: TetrominoType,
  rotation: number,
  x: number,
  y: number,
): boolean {
  const shape = getShape(type, rotation);
  const rows = grid.length;
  const cols = grid[0].length;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const boardX = x + c;
      const boardY = y + r;
      if (boardY < 0) continue;
      if (boardX < 0 || boardX >= cols || boardY >= rows) return false;
      if (grid[boardY][boardX] !== null) return false;
    }
  }
  return true;
}

export function lockPiece(grid: Grid, tetromino: ActiveTetromino): void {
  const shape = getShape(tetromino.type, tetromino.rotation);
  const color = COLORS[tetromino.type];

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const boardY = tetromino.y + r;
      const boardX = tetromino.x + c;
      if (boardY >= 0 && boardY < grid.length) {
        grid[boardY][boardX] = color;
      }
    }
  }
}

export function clearLines(grid: Grid): number {
  const cols = grid[0].length;
  let cleared = 0;

  for (let r = grid.length - 1; r >= 0; r--) {
    if (grid[r].every(cell => cell !== null)) {
      grid.splice(r, 1);
      grid.unshift(Array(cols).fill(null) as Cell[]);
      cleared++;
      r++;
    }
  }
  return cleared;
}
