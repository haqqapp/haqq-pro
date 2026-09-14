# Firtinaspor Version 2

Neu in dieser Version:

- Spielerprofile mit Formkurve (letzte 10 Bewertungen)
- Momentum Score (neuere Spiele werden stärker gewichtet)
- Positionsform pro Spieler aus Spielnote + gespielter Position
- Trainervergleich mit getrennten Trainerbewertungen und automatischem Durchschnitt
- Spielbericht mit Freitext, Toren, Vorlagen und gelben Karten
- Bank-Empfehlung nach Positionsabdeckung und Score
- zusätzliche Formationen: 4-1-2-1-2, 4-3-3 und 3-6-1
- Änderungsverlauf mit Trainer, Zeit und Änderungstyp
- CSV-Export für Spielerübersicht und Spielbewertungen
- Meilensteine im Spielerprofil

## Datenbank
Keine neue SQL-Abfrage nötig. Die neuen Felder werden in der bestehenden `app_state`-JSON-Struktur gespeichert. Vorhandene Daten bleiben erhalten.

## Vercel
Die bestehenden Variablen `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` bleiben unverändert.
