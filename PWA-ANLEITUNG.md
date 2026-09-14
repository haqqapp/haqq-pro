# Firtinaspor III. als Handy-App

Diese Version ist eine **PWA (Progressive Web App)**. Sie kann direkt von eurer Vercel-Adresse auf iPhone und Android installiert werden und startet danach wie eine eigene App mit Icon und ohne normale Browserleiste.

## Vercel

Die ZIP als neues Deployment im bestehenden Vercel-Projekt verwenden. Im Projekt müssen weiterhin diese Environment Variables gesetzt sein:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Supabase-Datenbank und Trainerkonten bleiben unverändert.

## iPhone installieren

1. Die Vercel-App in **Safari** öffnen.
2. Unten auf das **Teilen-Symbol** tippen.
3. **Zum Home-Bildschirm** wählen.
4. **Hinzufügen** wählen.
5. Danach die App über das Firtinaspor-Icon auf dem Homescreen starten.

## Android installieren

1. Die App in **Chrome** öffnen.
2. In der App auf **Installieren** tippen oder im Chrome-Menü **App installieren** wählen.
3. Installation bestätigen.

## Was weiterhin online benötigt wird

Die Oberfläche kann nach dem ersten Laden teilweise aus dem Cache starten. Login, Supabase-Synchronisation und Änderungen zwischen Trainern benötigen eine Internetverbindung. Supabase-Anfragen werden bewusst nicht offline zwischengespeichert, damit keine veralteten Mannschaftsdaten angezeigt werden.

## Später in App Store / Play Store

Diese PWA kann in einem nächsten Schritt mit Capacitor als iOS-/Android-Projekt verpackt werden. Für den Apple App Store wird ein Apple-Developer-Konto und Xcode auf einem Mac benötigt. Für Google Play wird daraus ein Android App Bundle (`.aab`) gebaut.
