import { Router } from 'express';
import type { Request, Response } from 'express';
import db from '../database.js';

const router = Router();

const VALID_MODES = ['standard', 'mittel', 'schwer'];

router.get('/:mode', (req: Request, res: Response): void => {
  const { mode } = req.params;
  if (!VALID_MODES.includes(mode)) {
    res.status(400).json({ error: 'Ungültiger Modus' });
    return;
  }

  const entries = db
    .prepare(
      `SELECT id,
              player_name AS playerName,
              score, level, lines, mode,
              created_at  AS createdAt
       FROM   highscores
       WHERE  mode = ?
       ORDER  BY score DESC
       LIMIT  10`,
    )
    .all(mode);

  res.json(entries);
});

router.post('/', (req: Request, res: Response): void => {
  const { playerName, score, level, lines, mode } = req.body as {
    playerName: unknown;
    score: unknown;
    level: unknown;
    lines: unknown;
    mode: unknown;
  };

  if (
    typeof playerName !== 'string' ||
    playerName.trim().length < 3 ||
    playerName.trim().length > 5
  ) {
    res.status(400).json({ error: 'Name muss 3–5 Zeichen haben' });
    return;
  }
  if (typeof mode !== 'string' || !VALID_MODES.includes(mode)) {
    res.status(400).json({ error: 'Ungültiger Modus' });
    return;
  }
  if (typeof score !== 'number' || typeof level !== 'number' || typeof lines !== 'number') {
    res.status(400).json({ error: 'Ungültige Spielwerte' });
    return;
  }

  const result = db
    .prepare(
      `INSERT INTO highscores (player_name, score, level, lines, mode)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(playerName.trim().toUpperCase(), score, level, lines, mode);

  const entry = db
    .prepare(
      `SELECT id,
              player_name AS playerName,
              score, level, lines, mode,
              created_at  AS createdAt
       FROM   highscores
       WHERE  id = ?`,
    )
    .get(result.lastInsertRowid);

  res.status(201).json(entry);
});

export default router;
