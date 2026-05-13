# Architektur

## Tech-Stack

| Schicht | Technologie |
|---|---|
| Frontend | Vanilla TypeScript, HTML5 Canvas, Vite 8 |
| Backend | Node.js 22, Express 4, `node:sqlite` (built-in) |
| Datenbank | SQLite, Datei `data/highscores.db` |
| Deployment | Docker (3-Stage-Build), docker-compose |

## Schichtaufteilung

```
Browser
  └── main.ts              Screen-Manager, Lebenszyklus
        ├── MenuScreen      Moduswahl
        ├── GameEngine      Spiellogik, Game-Loop (rAF)
        ├── Renderer        Canvas-Rendering
        ├── GameOverScreen  Namenseingabe nach Spielende
        └── HighscorePanel  Top-10-Anzeige (seitlich)

HTTP /api/highscores
  └── Express (app.ts)
        └── routes/highscore.ts  GET /:mode, POST /
              └── database.ts    node:sqlite, SQLite-Datei
```

Im Produktionsbetrieb liefert das Backend auch das gebaute Frontend aus `/public` (SPA-Fallback). Im Entwicklungsmodus läuft Vite separat auf Port 5173, das Backend auf Port 3001.

## Dateistruktur

```
frontend/src/
  types.ts                GameMode, ModeConfig, HighscoreEntry, MODE_CONFIGS
  main.ts                 Einstiegspunkt, Screen-Verwaltung
  styles.css              Globales CSS
  game/
    Tetromino.ts          7 Tetromino-Typen, Formen (4 Rotationen), Farben
    Board.ts              Grid, Kollisionsprüfung, Locking, Line-Clear
    GameEngine.ts         Game-Loop (requestAnimationFrame), DAS-Input, Scoring
    Renderer.ts           Canvas: Board, Ghost-Piece, Sidebar
    SoundManager.ts       Web Audio API, NES-Pulswelle
  ui/
    MenuScreen.ts         Moduswahl-Buttons, Steuerungshinweise
    GameOverScreen.ts     Namenseingabe (3–5 Zeichen)
    HighscorePanel.ts     Top-10-Tabelle pro Modus
  api/
    HighscoreApi.ts       fetch-Wrapper: GET/POST /api/highscores

backend/src/
  app.ts                  Express-Setup, statische Dateien, SPA-Fallback
  database.ts             SQLite-Initialisierung, Tabellenerstellung
  routes/
    highscore.ts          GET /:mode, POST /, Eingabevalidierung

Dockerfile                3-Stage-Build (frontend → backend → prod)
docker-compose.yml        Port 3001, Volume tetris-data
```

## Datenmodell

```sql
CREATE TABLE highscores (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT    NOT NULL,
  score       INTEGER NOT NULL,
  level       INTEGER NOT NULL,
  lines       INTEGER NOT NULL,
  mode        TEXT    NOT NULL CHECK(mode IN ('standard', 'mittel', 'schwer')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
)
```

## Bekannte Einschränkung

`node:sqlite` ist in Node 22 als experimentell markiert. Der Start-Warnhinweis wird per `--disable-warning=ExperimentalWarning` unterdrückt. Das Modul ist funktional stabil.
