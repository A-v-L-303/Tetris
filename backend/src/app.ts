import express from 'express';
import path from 'path';
import fs from 'node:fs';
import highscoreRouter from './routes/highscore.js';

const app = express();
app.use(express.json());

// API
app.use('/api/highscores', highscoreRouter);

// Statische Frontend-Dateien nur wenn vorhanden (Production/Docker)
const publicPath = path.join(process.cwd(), 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

const PORT = process.env['PORT'] ?? 3001;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
