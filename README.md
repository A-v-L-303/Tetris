# Tetris

Browser-basiertes Tetris mit drei Spielmodi, persistenten Highscores und NES-authentischer Spielmechanik.
Dieses Spiel wurde vollständig mit Claude Code geplant und implementiert.

## Tech-Stack

| Schicht | Technologie |
|---|---|
| Frontend | Vanilla TypeScript, HTML5 Canvas, Vite 8 |
| Backend | Node.js 22, Express 4, `node:sqlite` (built-in) |
| Datenbank | SQLite (`data/highscores.db`) |
| Deployment | Docker (3-Stage-Build), docker-compose |

## Spielmodi

| Modus | Spalten | Zeilen |
|---|---|---|
| Standard | 10 | 20 |
| Mittel | 10 | 15 |
| Schwer | 6 | 12 |

## Steuerung

| Taste | Aktion |
|---|---|
| `←` / `→` | Bewegen |
| `↑` oder `X` | Rotation im Uhrzeigersinn |
| `Z` | Rotation gegen den Uhrzeigersinn |
| `↓` | Soft Drop |
| `Leertaste` | Hard Drop |
| `C` | Hold (einmal pro Piece) |

## Entwicklung (lokal)

```bash
# Frontend (Port 5173)
cd frontend
npm install
npm run dev

# Backend (Port 3001)
cd backend
npm install
npm run dev
```

## Produktion (Docker)

```bash
docker-compose up --build -d
```

Die App ist danach unter `http://localhost:3001` erreichbar.

Die SQLite-Datenbank wird im Docker-Volume `tetris-data` persistiert – kein manuelles Setup erforderlich.

## Dokumentation

Weitere Details in [`docs/`](docs/index.md):

- [Architektur](docs/architektur.md)
- [Spielmechanik](docs/spielmechanik.md)
- [API](docs/api.md)
- [Deployment](docs/deployment.md)
