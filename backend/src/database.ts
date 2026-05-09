import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'highscores.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS highscores (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT    NOT NULL,
    score       INTEGER NOT NULL,
    level       INTEGER NOT NULL,
    lines       INTEGER NOT NULL,
    mode        TEXT    NOT NULL CHECK(mode IN ('standard', 'mittel', 'schwer')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

export default db;
