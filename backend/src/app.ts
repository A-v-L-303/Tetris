import express from 'express';
import path from 'path';
import highscoreRouter from './routes/highscore.js';

const app = express();
app.use(express.json());

// Frontend-Dateien (nach dem Build)
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));

// API
app.use('/api/highscores', highscoreRouter);

// SPA-Fallback für alle anderen Routen
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const PORT = process.env['PORT'] ?? 3001;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
