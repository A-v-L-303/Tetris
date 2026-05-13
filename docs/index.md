# Tetris – Projektdokumentation

## Inhalt

| Dokument | Beschreibung |
|---|---|
| [Architektur](architektur.md) | Tech-Stack, Schichtaufteilung, Dateistruktur |
| [Spielmechanik](spielmechanik.md) | Spielmodi, Steuerung, Punktesystem, Sound |
| [API](api.md) | REST-Endpunkte, Request/Response-Formate |
| [Deployment](deployment.md) | Docker-Build, Produktionsbetrieb |

## Kurzübersicht

Browser-basiertes Tetris mit drei Spielmodi, persistenten Highscores und NES-authentischer Spielmechanik.

**Frontend:** Vanilla TypeScript, HTML5 Canvas, Vite  
**Backend:** Node.js, Express, SQLite (`node:sqlite`)  
**Deployment:** Einzelner Docker-Container
