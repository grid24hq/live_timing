export interface F1Circuit {
  id: string
  naam: string            // "Albert Park Grand Prix Circuit"
  kortenaam: string       // "Albert Park" — gebruikt op de kaart zelf
  stad: string
  land: string
  countryCode: string     // 'au' — voor de vlag, zelfde codes als elders in de site
  lengte_km: number
  bochten: number
  eerste_gp: number
  aantal_races?: number
  capaciteit?: number      // toeschouwerscapaciteit
  tags: string[]          // bv. ["Difficult Overtaking", "High Speed"]
  beschrijving: string
  record_tijd?: string        // Officieel Lap Record — alleen gereden tijdens de zondagse hoofdrace
  record_rijder?: string
  record_jaar?: number
  track_record_tijd?: string  // All-Time Track Record — snelste ronde ooit, doorgaans in kwalificatie
  track_record_rijder?: string
  track_record_jaar?: number
  afbeelding: string      // pad naar de circuit-tekening in public/
}
