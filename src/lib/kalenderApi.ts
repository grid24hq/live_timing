import { ref, get } from 'firebase/database'
import { rtdb } from './firebase'
import { SERIES_VOLGORDE } from './seriesConfig'
import type { KalenderMaand, KalenderRace, Series } from '../types/calendar'

const MAANDEN = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
]

// Verwacht pad in de Realtime Database: Kalender/<Serie>/<jaar>/<raceId> = {...}
// bv: Kalender/F1/2026/british_gp = { naam, baan, datum, ... }
export async function getKalender(): Promise<KalenderMaand[]> {
  try {
    const snapshot = await get(ref(rtdb, 'Kalender'))
    if (!snapshot.exists()) return []
    const data: Record<string, Record<string, Record<string, any>>> = snapshot.val()

    const alleRaces: KalenderRace[] = []

    for (const serie of SERIES_VOLGORDE) {
      const serieKey = serie === 'worldsbk' ? 'WorldSBK' : serie === 'f1' ? 'F1' : serie === 'motogp' ? 'MotoGP' : serie === 'moto2' ? 'Moto2' : 'Moto3'
      const jaren = data[serieKey]
      if (!jaren) continue
      for (const [, races] of Object.entries(jaren)) {
        for (const [raceId, race] of Object.entries(races as Record<string, any>)) {
          alleRaces.push({
            id: raceId,
            serie,
            naam: race.naam,
            baan: race.baan,
            datum: race.datum,
            tijd_cet: race.tijd_cet,
            land: race.land,
            stad: race.stad,
            track_lengte_km: race.track_lengte_km,
            snelste_ronde_tijd: race.snelste_ronde_tijd,
            snelste_ronde_rijder: race.snelste_ronde_rijder,
            snelste_ronde_team: race.snelste_ronde_team,
            snelste_ronde_jaar: race.snelste_ronde_jaar,
            ronden: race.ronden,
            sessies: race.sessies ?? {},
          })
        }
      }
    }

    alleRaces.sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime())

    const maandMap = new Map<number, KalenderRace[]>()
    for (const race of alleRaces) {
      const maandNr = new Date(race.datum).getMonth() + 1
      if (!maandMap.has(maandNr)) maandMap.set(maandNr, [])
      maandMap.get(maandNr)!.push(race)
    }

    return Array.from(maandMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([maand, races]) => ({ maand, naam: MAANDEN[maand - 1], races }))
  } catch (err) {
    console.error('Kalender ophalen mislukt:', err)
    return []
  }
}

export function getDagenTot(datum: string): number {
  const nu = new Date()
  const doel = new Date(datum)
  nu.setHours(0, 0, 0, 0)
  doel.setHours(0, 0, 0, 0)
  return Math.ceil((doel.getTime() - nu.getTime()) / (1000 * 60 * 60 * 24))
}

export function getRaceStatus(datum: string): 'upcoming' | 'today' | 'finished' {
  const dagen = getDagenTot(datum)
  if (dagen > 0) return 'upcoming'
  if (dagen === 0) return 'today'
  return 'finished'
}

export function getCircuitSvgPath(serie: Series, folder: string, raceId: string): string {
  const filePrefix = serie === 'worldsbk' ? 'worldsbk' : serie
  return `/circuits/${folder}/${filePrefix}_${raceId}.svg`
}
