# Grid24HQ Live Timing 🏁

**The Ultimate Racing Hub** — F1 · MotoGP · Moto2 · Moto3 · WorldSBK

> Live timing · Race data · Circuits · Coureurs · Kalender · Standen · Live Center

---

## Tech stack

| Onderdeel  | Technologie                                               |
|------------|-------------------------------------------------------------|
| Frontend   | React 18 + Vite + TypeScript                                |
| Styling    | Tailwind CSS v4 (custom design tokens in `src/index.css`)   |
| Routing    | React Router v6                                              |
| State      | Zustand (UI state) + TanStack React Query (server state)    |
| Auth       | Firebase Authentication (e-mail/wachtwoord + eenmalige toegangscode) |
| E-mail     | EmailJS (welkomstmail + toegangscode-mail)                  |
| Database   | Cloud Firestore (profielen) + Realtime Database (live data) |
| i18n       | i18next (NL + EN)                                            |
| Hosting    | Cloudflare Pages                                              |
| Repo       | GitHub                                                        |

---

## Opstarten

```bash
# 1. Clone
git clone https://github.com/grid24hq/live_timing.git
cd live_timing

# 2. Installeer dependencies
npm install

# 3. Environment variables instellen
cp .env.example .env
# Vul je Firebase- en EmailJS-keys in .env (zie Firebase Console / EmailJS Dashboard)

# 4. Start de dev server
npm run dev
# Open: http://localhost:5173
```

---

## Hoe de live timing werkt

Grid24HQ zelf haalt geen data live op bij de bron — dat gebeurt via losse tools die
lokaal draaien (niet in deze repo, niet gehost).

```
Timing-bron  →  Command Center-scripts (lokaal)  →  Firebase Realtime Database  →  Grid24HQ website
```

- Losse Python-scripts (per raceserie: F1, MotoGP, Moto2/3, WorldSBK) grabben en
  formatteren live timing data en pushen die naar Firebase Realtime Database, via een
  Database Secret (omzeilt de security rules, alleen bedoeld voor deze scripts).
- Een aparte **API Sniffer**-tool wordt gebruikt om nieuwe timing-endpoints van
  timing-sites te ontdekken, zodat er nieuwe formatters/grabbers gebouwd kunnen worden.
- De website (`raceApi.ts`, `useTimingStore`) pollt Firebase en toont de live tab zodra
  een sessie op "LIVE" staat (`Sessie_Status`), anders de kampioenschapsstanden.
- Deze scripts draaien alleen lokaal op de PC van de beheerder — geen publieke API,
  geen deployment nodig voor die kant van de pipeline.

---

## Projectstructuur

```
live_timing/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── database.rules.json        # Realtime Database security rules
├── firestore.rules            # Firestore security rules
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx                 # Routes + auth-gate op /live-timing
    ├── index.css               # Design tokens (kleuren, fonts)
    │
    ├── pages/
    │   ├── Home.tsx
    │   ├── LiveTiming.tsx
    │   ├── Calendar.tsx
    │   ├── Standen.tsx
    │   ├── Coureurs.tsx
    │   ├── Circuits.tsx
    │   ├── Login.tsx
    │   └── Register.tsx
    │
    ├── components/
    │   ├── Navbar.tsx
    │   ├── LiveTimingPanel.tsx
    │   ├── LiveTelemetryPanel.tsx
    │   ├── LiveTrackMap.tsx
    │   ├── RequireLiveTimingAccess.tsx   # Poortwachter: mock / code / echte data
    │   ├── AccessCodeGate.tsx            # Eenmalige toegangscode-scherm
    │   ├── MockLiveTiming.tsx            # Nepdata-preview voor gasten
    │   ├── CircuitCard.tsx / MotoCircuitCard.tsx
    │   ├── RaceCard.tsx / RaceModal.tsx
    │   ├── CoureurCard.tsx / CoureurModal.tsx
    │   ├── SeriesBadge.tsx
    │   └── Clock.tsx
    │
    ├── lib/
    │   ├── firebase.ts          # Firebase-initialisatie (auth, firestore, rtdb)
    │   ├── raceApi.ts           # Live timing / standen ophalen uit Realtime Database
    │   ├── kalenderApi.ts       # Racekalender ophalen
    │   ├── authCode.ts          # Genereren/controleren van de toegangscode
    │   ├── emailjs.ts           # Welkomstmail + toegangscode-mail versturen
    │   ├── flag.ts              # Vlag-afbeeldingen per landcode
    │   ├── seriesConfig.ts      # Per-serie instellingen (labels, klasses)
    │   └── seriesTheme.ts       # Per-serie accentkleuren
    │
    ├── store/
    │   ├── useAuthStore.ts      # Login-status + otpVerified (live, via RTDB-listener)
    │   ├── useTimingStore.ts    # Geselecteerde raceserie
    │   ├── useLiveTiming.ts
    │   └── useTelemetryStore.ts
    │
    ├── data/                    # Statische data: circuits + coureurs per serie
    │   ├── f1Circuits.ts / f1Coureurs.ts
    │   ├── motogpCircuits.ts / motogpCoureurs.ts
    │   ├── moto2Circuits.ts / moto3Circuits.ts
    │   └── sbkCircuits.ts / sbkCoureurs.ts
    │
    ├── types/                   # TypeScript-types per domein
    ├── i18n/                    # NL/EN vertalingen (i18next)
    └── assets/
```

---

## Firebase instellen

1. Ga naar [Firebase Console](https://console.firebase.google.com)
2. Maak project aan: `grid24hq-live-timing`
3. Voeg een Web App toe → kopieer de config
4. Activeer: **Authentication → Email/Password**
5. Activeer: **Firestore Database** → plak de inhoud van `firestore.rules` in de Rules-tab
6. Activeer: **Realtime Database** → plak de inhoud van `database.rules.json` in de Rules-tab
7. Vul de Firebase-waarden in `.env`

## EmailJS instellen

1. Ga naar [EmailJS Dashboard](https://dashboard.emailjs.com)
2. Maak een Service aan (bijv. Gmail) → kopieer de Service ID
3. Maak twee templates aan: **Welcome to GRID24HQ** en **Access code email**
   (zie `email-templates/` voor de kant-en-klare HTML)
4. Vul de Public Key, Service ID en beide Template ID's in `.env`

---

## Cloudflare Pages deploy

```bash
npm run build   # output → dist/
```

In Cloudflare Pages dashboard:
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables: voeg alle `VITE_*` keys toe (Firebase + EmailJS)

Push naar GitHub → Cloudflare deployt automatisch.

---

## Kleurpalet (design tokens)

Uit `src/index.css` — Tailwind v4 `@theme`-tokens, dus overal beschikbaar als
utility-classes (bijv. `bg-void`, `text-signal`, `border-line`).

**Basis**

| Token                      | Waarde    | Gebruik                              |
|-----------------------------|-----------|----------------------------------------|
| `--color-void`               | `#060708` | Paginabackground                      |
| `--color-panel`              | `#101215` | Kaarten, secties                       |
| `--color-panel-raised`       | `#17191d` | Invoervelden, verhoogde panelen        |
| `--color-line`               | `#26292f` | Randen                                 |
| `--color-line-bright`        | `#3a3e46` | Randen, sterker contrast                |
| `--color-text-primary`       | `#F2F3F5` | Hoofdtekst                             |
| `--color-text-secondary`     | `#868C97` | Subtekst, labels                       |
| `--color-text-dim`           | `#52565e` | Minst prominente tekst                 |

**Accenten**

| Token             | Waarde    | Gebruik                                   |
|--------------------|-----------|---------------------------------------------|
| `--color-signal`   | `#FF2D2D` | Hoofdaccent: knoppen, live-dot, GRID24**HQ** |
| `--color-amber`    | `#FFB020` | P1-positie, highlights                       |
| `--color-purple`   | `#B026FF` | Accent (ook WorldSBK-kleur)                  |
| `--color-green`    | `#00D97E` | Positieve status, "live"-indicatoren         |

**Per raceserie** (o.a. gebruikt op de Circuits- en Standen-pagina's)

| Token               | Waarde    | Serie     |
|----------------------|-----------|-----------|
| `--color-f1`         | `#E10600` | Formula 1 |
| `--color-motogp`     | `#0046D5` | MotoGP    |
| `--color-moto2`      | `#FF6B00` | Moto2     |
| `--color-moto3`      | `#00A651` | Moto3     |
| `--color-worldsbk`   | `#B026FF` | WorldSBK  |

**Typografie**

| Token             | Waarde                    | Gebruik                          |
|--------------------|----------------------------|-------------------------------------|
| `--font-display`   | `"Rajdhani", sans-serif`   | Koppen, grote titels                |
| `--font-mono`      | `"JetBrains Mono", monospace` | Labels, data, knoppen           |
| `--font-body`      | `"Inter", sans-serif`     | Lopende tekst                      |

---

## Beveiliging

- `/live-timing` is afgeschermd: gasten zien een nepdata-preview met een
  registratie-oproep, nieuwe accounts moeten eenmalig een 6-cijferige
  toegangscode via e-mail bevestigen voordat de echte live data zichtbaar wordt.
- `database.rules.json` en `firestore.rules` beschermen het `users`-knooppunt
  (alleen de eigenaar mag zijn eigen profiel/verificatiestatus lezen of aanpassen).
- De live-timingdata zelf (F1/MotoGP/Moto2/Moto3/WorldSBK/Kalender) is bewust
  publiek leesbaar op databaseniveau — de site haalt die data namelijk op via
  kale `fetch()`-aanroepen zonder inlog-token. De toegangspoort zit dus op
  paginaniveau, niet op databaseniveau. Zie `Website_Beveiligen_IDEE.txt` voor
  ideeën om dit verder te verharden.

---

## Roadmap

- [x] Projectstructuur (modulair)
- [x] Firebase auth (e-mail/wachtwoord + eenmalige toegangscode)
- [x] NL/EN taalwisseling
- [x] Protected route (Live Center)
- [x] Live timing pipeline (Command Center-scripts → Firebase) voor F1, MotoGP, Moto2/3, WorldSBK
- [x] Racekalender pagina
- [x] Kampioenschapsstanden pagina
- [x] Circuit detail pagina's
- [x] Coureur/Team profielen
- [ ] TypeScript types voor alle data (deels gedaan, nog niet overal)
- [ ] Google-login toevoegen
- [ ] Community & forums
- [ ] Fantasy league
- [ ] Mobile app
