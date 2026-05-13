# Deployment

## Entwicklung (lokal)

Zwei Prozesse parallel starten:

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

Der Vite-Dev-Server proxied API-Anfragen nicht automatisch. Im Entwicklungsmodus muss die `BASE`-URL in `HighscoreApi.ts` bei Bedarf angepasst werden, oder CORS ist am Backend aktiviert.

## Produktion (Docker)

### Build

```bash
docker-compose up --build -d
```

Der Build läuft in drei Stages:

| Stage | Basis | Aufgabe |
|---|---|---|
| `frontend-build` | `node:22-alpine` | `npm run build` → `/build/frontend/dist` |
| `backend-build` | `node:22-alpine` | `tsc` → `/build/backend/dist` |
| Production | `node:22-alpine` | Backend-Dist + node_modules + Frontend als `/public` |

Das Produktions-Image startet mit:
```
node --disable-warning=ExperimentalWarning dist/app.js
```

### Konfiguration

| Variable | Standard | Beschreibung |
|---|---|---|
| `PORT` | `3001` | HTTP-Port des Backends |

### Ports und Volumes

```yaml
ports:
  - "3001:3001"
volumes:
  - tetris-data:/app/data
```

Die SQLite-Datenbank liegt im Container unter `/app/data/highscores.db` und wird im benannten Volume `tetris-data` persistiert.

### Neustart-Verhalten

```yaml
restart: unless-stopped
```

Der Container startet automatisch neu, außer er wurde manuell gestoppt.

## Datenpersistenz

Beim ersten Start legt das Backend das Verzeichnis `data/` und die Datenbank automatisch an (`fs.mkdirSync` mit `recursive: true`, `CREATE TABLE IF NOT EXISTS`). Kein manuelles Setup erforderlich.
