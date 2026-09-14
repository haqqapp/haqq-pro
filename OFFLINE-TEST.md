# Firtinaspor V2 – Offline Test

Diese Variante verbindet sich **nicht** mit Supabase. Änderungen landen nur im localStorage des Browsers.
Dadurch können alle neuen Funktionen gefahrlos getestet werden, ohne die Live-Daten zu verändern.

## Start

```bash
npm install
npm run dev
```

Dann die angezeigte localhost-Adresse öffnen.

## Testdaten zurücksetzen
Im Browser die Website-Daten / localStorage für localhost löschen.

## Nicht enthalten
Realtime-Sync und echter Mehrtrainer-Login sind in dieser Testvariante absichtlich deaktiviert.
