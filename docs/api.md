# REST API

Basis-URL: `/api/highscores`

## GET /api/highscores/:mode

Liefert die Top-10-Einträge für den angegebenen Modus, absteigend nach Score sortiert.

**Pfadparameter**

| Parameter | Werte |
|---|---|
| `mode` | `standard`, `mittel`, `schwer` |

**Response 200**

```json
[
  {
    "id": 1,
    "playerName": "AAA",
    "score": 12400,
    "level": 4,
    "lines": 42,
    "mode": "standard",
    "createdAt": "2026-05-09 14:23:00"
  }
]
```

**Response 400**

```json
{ "error": "Ungültiger Modus" }
```

---

## POST /api/highscores

Speichert einen neuen Highscore-Eintrag.

**Request Body (JSON)**

```json
{
  "playerName": "AAA",
  "score": 12400,
  "level": 4,
  "lines": 42,
  "mode": "standard"
}
```

| Feld | Typ | Validierung |
|---|---|---|
| `playerName` | string | 3–5 Zeichen, wird als Großbuchstaben gespeichert |
| `score` | number | – |
| `level` | number | – |
| `lines` | number | – |
| `mode` | string | `standard`, `mittel` oder `schwer` |

**Response 201** – gespeicherter Eintrag mit `id` und `createdAt`

```json
{
  "id": 42,
  "playerName": "AAA",
  "score": 12400,
  "level": 4,
  "lines": 42,
  "mode": "standard",
  "createdAt": "2026-05-09 14:23:00"
}
```

**Response 400** bei Validierungsfehler

```json
{ "error": "Name muss 3–5 Zeichen haben" }
```
