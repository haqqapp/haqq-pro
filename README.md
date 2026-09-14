# Firtinaspor Trainer-App – Supabase Live-Version

Diese Version speichert die Mannschaftsdaten zentral in Supabase. Mehrere eingeloggte Trainer sehen denselben Datenstand und erhalten Änderungen per Realtime.

## 1. Supabase-Projekt erstellen

1. Auf https://supabase.com ein kostenloses Projekt anlegen.
2. Im Projekt **SQL Editor** öffnen.
3. Den kompletten Inhalt aus `supabase-setup.sql` einfügen und **Run** drücken.

## 2. Trainerkonten anlegen

In Supabase unter **Authentication -> Users** zwei Benutzer anlegen: einen für dich und einen für deinen Co-Trainer. Verwendet unterschiedliche E-Mail-Adressen und sichere Passwörter.

Die App selbst bietet absichtlich keine öffentliche Registrierung an. Nur Benutzer, die du in Supabase angelegt hast, können sich anmelden.

## 3. Vercel-Variablen setzen

In Supabase unter **Project Settings -> API** die Project URL und den Publishable/anon Key kopieren.

In Vercel: **Project -> Settings -> Environment Variables**

- `VITE_SUPABASE_URL` = deine Supabase Project URL
- `VITE_SUPABASE_ANON_KEY` = dein Publishable/anon Key

WICHTIG: Niemals den Service Role Key in Vercel als VITE-Variable eintragen.

Danach in Vercel **Redeploy** ausführen.

## 4. Lokal starten

`.env.example` nach `.env` kopieren und die beiden Werte ersetzen. Dann:

```bash
npm install
npm run dev
```

## Funktionsweise

- Beim ersten Login wird der bisherige Startdatenbestand einmalig in `public.app_state` angelegt.
- Jede Änderung an Training, Noten, Kader, Positionen, Spielen oder Aufstellung wird in Supabase gespeichert.
- Supabase Realtime verteilt den neuen Datenstand an alle gleichzeitig eingeloggten Trainer.
- Training und Bewertungen lösen weiterhin die Score-/Ranglisten-/Kader-/Aufstellungsberechnungen aus.

## Sicherheit

Row Level Security ist aktiviert. Nur eingeloggte Supabase-Benutzer dürfen den gemeinsamen App-Datenstand lesen oder ändern.

## Installierbare Handy-App (PWA)

Diese Version enthält ein Web-App-Manifest, App-Icons und einen Service Worker. Nach dem Deployment auf Vercel kann sie auf iPhone/Android auf dem Homescreen installiert werden. Details: `PWA-ANLEITUNG.md`.

## Version 2 Funktionen
- Spielerprofile mit Formkurve, Momentum Score, Positionsform und Meilensteinen
- Trainer-Einzelnoten mit automatisch berechnetem Durchschnitt pro Spieler/Spiel
- Trainervergleich im Spielerprofil
- Spielberichte mit Toren, Vorlagen und gelben Karten
- Bank-Empfehlung nach Positionsabdeckung und Score
- Formationen: 4-2-3-1, 4-1-4-1, 4-1-2-1-2, 4-3-3, 3-6-1
- Änderungsverlauf mit Trainer und Zeitstempel
- CSV-Export

Die Version 2 nutzt weiterhin nur die bestehende `app_state`-JSON-Zeile in Supabase. Es ist keine neue SQL-Migration nötig.
