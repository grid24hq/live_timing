export interface MotoCircuit {
  id: string
  naam: string              // "TT Circuit Assen"
  land: string
  countryCode: string
  lengte_km: number
  bochten: number
  eerste_gp: number
  opmerking?: string        // bv. bijzonderheden zoals een nieuwe lay-out in 2026
  aantal_races?: number
  capaciteit?: number
  record_tijd?: string        // Lap Record (Race)
  record_rijder?: string
  record_jaar?: number
  track_record_tijd?: string  // All-Time Track Record (Quali)
  track_record_rijder?: string
  track_record_jaar?: number
  afbeelding: string
}
