# FLUTLICHT 27 – App (Demo)

Installierbare Web-App (PWA) der fiktiven Padelhalle FLUTLICHT 27, im Look der Scrollytelling-Seite
([Repo](https://github.com/Engelstraenen/flutlicht27-site) · [Live](https://engelstraenen.github.io/flutlicht27-site/)).

- **Live:** https://engelstraenen.github.io/flutlicht27-app/ (am Handy öffnen → „Zum Home-Bildschirm“)
- **Screens:** Start (Live-Belegung der 8 Courts), Buchen (Tag, Dauer, Uhrzeit, Court, Mitspieler), Mitspielen (offene Matches nach Level, Beitritt mit einem Tipp), Turnier (Rangliste + Americano-Generator mit Punkten), Bar & Verleih (Drinks an den Court mit Bestellstatus, Schläger reservieren), Profil (Level, Statistik, Buchungen)
- Daten sind Demo-Daten und werden nur im Browser gespeichert.

```bash
pnpm install
pnpm dev     # http://localhost:4360
STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/flutlicht27-app npx next build   # GitHub Pages → out/
```

Stack: Next.js (App Router), React, TypeScript strict, Service Worker + Manifest, Schrift Archivo (lokal).
