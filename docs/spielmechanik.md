# Spielmechanik

## Spielmodi

| Modus | Spalten | Zeilen | Zellgröße |
|---|---|---|---|
| Standard | 10 | 20 | 40 px |
| Mittel | 10 | 15 | 44 px |
| Schwer | 6 | 12 | 55 px |

Der Modus bestimmt Boardgröße und Zellgröße. Alle anderen Regeln (Punktesystem, Level, Fallgeschwindigkeit) sind identisch.

## Tetrominos

7 klassische Tetrominos mit je 4 Rotationszuständen:

| Typ | Farbe |
|---|---|
| I | Cyan `#00f0f0` |
| O | Gelb `#f0f000` |
| T | Lila `#a000f0` |
| J | Blau `#0000f0` |
| L | Orange `#f0a000` |
| S | Grün `#00f000` |
| Z | Rot `#f00000` |

Spawning: zufälliges Piece aus gleichverteiltem Pool (keine Bag-Randomisierung). I-Piece spawnt eine Zeile oberhalb des sichtbaren Boards (y = -1), alle anderen bei y = 0.

## Steuerung

| Taste | Aktion |
|---|---|
| `←` / `→` | Bewegen |
| `↑` oder `X` | Rotation im Uhrzeigersinn |
| `Z` | Rotation gegen den Uhrzeigersinn |
| `↓` | Soft Drop |
| `Leertaste` | Hard Drop |
| `C` | Hold (einmal pro Piece) |

**DAS (Delayed Auto Shift):** 170 ms Initialverzögerung, danach Wiederholung alle 50 ms.  
**Soft Drop:** Fällt alle 50 ms eine Zeile (unabhängig vom aktuellen Level-Intervall).

## Fallgeschwindigkeit (NES-Tabelle)

| Level | ms/Zeile |
|---|---|
| 0 | 800 |
| 1 | 717 |
| 2 | 633 |
| 3 | 550 |
| 4 | 467 |
| 5 | 383 |
| 6 | 300 |
| 7 | 217 |
| 8 | 133 |
| 9 | 100 |
| 10–12 | 83 |
| 13–15 | 67 |
| 16–18 | 50 |
| 19–28 | 33 |
| 29+ | 17 |

Level steigt alle 10 geklärten Linien: `level = floor(totalLines / 10)`.

## Punktesystem (NES-Stil)

```
Punkte = Basiswert × (Level + 1)
```

| Geklärte Linien | Basiswert |
|---|---|
| 1 (Single) | 100 |
| 2 (Double) | 300 |
| 3 (Triple) | 500 |
| 4 (Tetris) | 800 |

## Highscore

- Top 10 Einträge pro Modus, sortiert nach Score (absteigend)
- Spielername: 3–5 Zeichen, wird als Großbuchstaben gespeichert
- Ein Eintrag qualifiziert sich, wenn weniger als 10 Einträge vorhanden oder der Score den letzten Platz übertrifft

## Ghost-Piece

Der Renderer zeigt eine transparente Vorschau, wo das aktuelle Piece landen würde. Die Ghost-Y-Position wird jedes Frame neu berechnet.

## Hold

Mit `C` kann das aktuelle Piece einmalig pro gesetztem Piece auf Hold gelegt werden. Bei erstmaliger Nutzung wird das nächste Piece gespielt; danach tauschen aktuelles und gehaltenes Piece.

## Sound

Implementiert über Web Audio API mit synthetisierter NES-Pulswelle (25 % Duty Cycle, 64 Harmonische).

| Ereignis | Sound |
|---|---|
| 1–3 Linien | Absteigender Frequenz-Sweep (Dauer: 80–140 ms) |
| 4 Linien (Tetris) | Aufsteigende Arpeggio-Fanfare: E5 → G5 → B5 → E6 |

Der AudioContext wird beim ersten Tastendruck entsperrt (Browser-Autoplay-Policy).
