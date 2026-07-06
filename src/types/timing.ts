export type Series = 'f1' | 'motogp' | 'moto2' | 'moto3'
export type SectorStatus = 'purple' | 'green' | 'yellow'

export interface TimingRow {
  pos: number
  name: string
  team: string
  gap: string
  lastLap: string
  sectors: [SectorStatus, SectorStatus, SectorStatus]
}

// Komt overeen met Firebase RTDB pad, bv:
// MotoGP/2026/asse_gp/Live_Timing/Algemeen_Sessie/
export interface LiveSession {
  series: Series
  sessionLabel: string // bv "Race • Ronde 42/58 — Circuit Zandvoort"
  isLive: boolean
  leaderboard: TimingRow[]
}
