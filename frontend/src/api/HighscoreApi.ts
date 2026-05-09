import type { GameMode, HighscoreEntry } from '../types';

const BASE = '/api';

export async function getHighscores(mode: GameMode): Promise<HighscoreEntry[]> {
  const response = await fetch(`${BASE}/highscores/${mode}`);
  if (!response.ok) throw new Error('Fehler beim Laden der Highscores');
  return response.json() as Promise<HighscoreEntry[]>;
}

export async function postHighscore(
  entry: Omit<HighscoreEntry, 'id' | 'createdAt'>,
): Promise<HighscoreEntry> {
  const response = await fetch(`${BASE}/highscores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error('Fehler beim Speichern des Highscores');
  return response.json() as Promise<HighscoreEntry>;
}

export function qualifiesForHighscore(score: number, entries: HighscoreEntry[]): boolean {
  if (entries.length < 10) return true;
  return score > entries[entries.length - 1].score;
}
