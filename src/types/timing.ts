export type Series = 'f1' | 'motogp' | 'moto2' | 'moto3' | 'sbk'

// LET OP: de echte Command Center-feed levert GEEN paars/groen/geel-classificatie
// voor sectortijden (dat bestaat nergens in de Python-formatters) — dus we tonen
// de ruwe sectortijd als tekst i.p.v. een gekleurd blokje.
export interface TimingRow {
  pos: number
  name: string
  team: string
  gap: string
  lastLap: string
  bestLap: string
  sectors: [string, string, string]
  status: string
  carNumber: string
  laps: number
  pits: number
  tyre: string
}

// Komt overeen met Firebase RTDB pad, bv:
// MotoGP/2026/motogp_race/Live_Timing/  en  .../Algemeen_Sessie/
export interface LiveSession {
  series: Series
  sessionLabel: string // bv "Race • Ronde 42/58 — Circuit Zandvoort"
  isLive: boolean
  leaderboard: TimingRow[]
}
