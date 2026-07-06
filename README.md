# GRID24HQ — Live Timing

Live timing platform voor F1, MotoGP, Moto2 en Moto3.

## Stack
- React 18 + Vite + TypeScript
- Tailwind CSS v4 (custom design tokens in `src/index.css`)
- React Router v6
- Zustand (UI state) + TanStack React Query (server state)
- Firebase Authentication + Realtime Database + Firestore
- i18next (NL + EN)
- Hosting: Cloudflare Pages

## Lokaal draaien

```bash
npm install
cp .env.example .env   # vul je Firebase-config in
npm run dev
```

## Databronnen
- **Realtime Database** — live timing feed (hoogfrequente updates), gevoed door
  het GRID24HQ Command Center. Pad: `<Serie>/<jaar>/<gp>/Live_Timing/...`
- **Firestore** — coureursprofielen, teams, kalender, kampioenschapsstand.

## Mapstructuur

```
src/
├── pages/        # Route-pagina's (Home, later DriverProfile, Calendar, ...)
├── components/   # Herbruikbare UI-componenten
├── store/        # Zustand stores (UI state)
├── lib/          # Firebase config, helpers
├── types/        # TypeScript types voor de timing data
└── i18n/         # Vertalingen (nl.json / en.json)
```

## Build & deploy
Cloudflare Pages bouwt automatisch bij elke push naar `main`:
- Build command: `npm run build`
- Output directory: `dist`
