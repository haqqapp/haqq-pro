# Firtinaspor V4 Live

Diese Version nutzt die bestehende Supabase-Tabelle `app_state` (id `main`) und Supabase Auth.

Vercel Environment Variables:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Bestehende Daten werden beim Laden normalisiert, damit neue V4-Felder ergänzt werden, ohne alte Trainings-, Spiel- und Bewertungsdaten zu löschen.
