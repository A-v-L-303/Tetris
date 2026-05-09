import type { GameMode } from '../types';
import { MODE_CONFIGS } from '../types';
import { COLORS, getShape, SHAPES } from './Tetromino';
import type { TetrominoType } from './Tetromino';
import type { Grid } from './Board';
import type { GameState } from './GameEngine';

const SIDEBAR_WIDTH = 160;
const SIDEBAR_GAP = 8;
const PREVIEW_CELL = 18;

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly cellSize: number;
  private readonly cols: number;
  private readonly rows: number;
  private readonly boardWidth: number;
  private readonly sidebarX: number;

  constructor(canvas: HTMLCanvasElement, mode: GameMode) {
    const config = MODE_CONFIGS[mode];
    this.cellSize = config.cellSize;
    this.cols = config.cols;
    this.rows = config.rows;
    this.boardWidth = this.cols * this.cellSize;
    this.sidebarX = this.boardWidth + SIDEBAR_GAP;

    canvas.width = this.boardWidth + SIDEBAR_GAP + SIDEBAR_WIDTH;
    canvas.height = this.rows * this.cellSize;

    this.ctx = canvas.getContext('2d')!;
  }

  render(state: GameState): void {
    const { ctx } = this;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.drawGrid();
    this.drawLockedCells(state.grid);
    this.drawGhost(state);
    this.drawCurrentPiece(state);
    this.drawSidebar(state);
  }

  private drawGrid(): void {
    const { ctx, cellSize, cols, rows } = this;
    ctx.strokeStyle = '#1c1c1c';
    ctx.lineWidth = 0.5;

    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellSize);
      ctx.lineTo(cols * cellSize, r * cellSize);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellSize, 0);
      ctx.lineTo(c * cellSize, rows * cellSize);
      ctx.stroke();
    }

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, cols * cellSize, rows * cellSize);
  }

  private drawLockedCells(grid: Grid): void {
    const rows = grid.length;
    const cols = grid[0].length;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (cell) this.drawCell(c, r, cell, 1);
      }
    }
  }

  private drawCell(col: number, row: number, color: string, alpha: number): void {
    const { ctx, cellSize } = this;
    const x = col * cellSize + 1;
    const y = row * cellSize + 1;
    const size = cellSize - 2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x, y, size, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x, y + size - 3, size, 3);
    ctx.restore();
  }

  private drawCurrentPiece(state: GameState): void {
    const { current } = state;
    const shape = getShape(current.type, current.rotation);
    const color = COLORS[current.type];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const boardY = current.y + r;
        if (boardY < 0) continue;
        this.drawCell(current.x + c, boardY, color, 1);
      }
    }
  }

  private drawGhost(state: GameState): void {
    const { current, ghostY } = state;
    if (ghostY === current.y) return;
    const shape = getShape(current.type, current.rotation);
    const color = COLORS[current.type];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const boardY = ghostY + r;
        if (boardY < 0) continue;
        this.drawCell(current.x + c, boardY, color, 0.2);
      }
    }
  }

  private drawSidebar(state: GameState): void {
    const { ctx, sidebarX } = this;
    const x = sidebarX + 12;
    let y = 20;

    ctx.fillStyle = '#888';
    ctx.font = '11px "Courier New"';
    ctx.fillText('NEXT', x, y);
    y += 8;

    this.drawPreview(x, y, state.next);
    y += 4 * PREVIEW_CELL + 24;

    this.drawLabel(x, y, 'SCORE');
    y += 16;
    this.drawValue(x, y, String(state.score));
    y += 30;

    this.drawLabel(x, y, 'LEVEL');
    y += 16;
    this.drawValue(x, y, String(state.level));
    y += 30;

    this.drawLabel(x, y, 'LINES');
    y += 16;
    this.drawValue(x, y, String(state.lines));
    y += 40;

    // Steuerung
    ctx.fillStyle = '#444';
    ctx.font = '10px "Courier New"';
    const controls = ['← → Bewegen', '↑/X Drehen', 'Z Gegenuhr', '↓ Soft Drop', 'SPC Hard Drop'];
    for (const line of controls) {
      ctx.fillText(line, x, y);
      y += 14;
    }
  }

  private drawLabel(x: number, y: number, text: string): void {
    this.ctx.fillStyle = '#666';
    this.ctx.font = '11px "Courier New"';
    this.ctx.fillText(text, x, y);
  }

  private drawValue(x: number, y: number, text: string): void {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 17px "Courier New"';
    this.ctx.fillText(text, x, y);
  }

  private drawPreview(x: number, y: number, type: TetrominoType): void {
    const shape = SHAPES[type][0];
    const color = COLORS[type];
    const cs = PREVIEW_CELL;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const px = x + c * cs;
        const py = y + r * cs;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);
        this.ctx.fillStyle = 'rgba(255,255,255,0.25)';
        this.ctx.fillRect(px + 1, py + 1, cs - 2, 3);
      }
    }
  }
}
