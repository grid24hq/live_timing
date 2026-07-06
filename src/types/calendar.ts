export type Series = 'f1' | 'motogp' | 'moto2' | 'moto3' | 'worldsbk'

export interface KalenderSessie {
  datum: string     // "2026-07-05"
  tijd_cet: string  // "16:00" of "TBC"
}

export interface KalenderRace {
  id: string
  serie: Series
  naam: string              // "BRITISH GP"
  baan: string               // "Silverstone Circuit"
  datum: string               // "2026-07-05"
  tijd_cet: string            // "16:00" of "TBC"
  land: string
  stad: string
  track_lengte_km: string
  snelste_ronde_tijd: string
  snelste_ronde_rijder: string
  snelste_ronde_team: string
  snelste_ronde_jaar: number
  ronden?: number
  sessies: Record<string, KalenderSessie>
}

export interface KalenderMaand {
  maand: number // 1-12
  naam: string  // "Juli"
  races: KalenderRace[]
}
