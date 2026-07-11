// Overgenomen uit de oude GRID24HQ-website (services/raceApi.ts), aangepast
// naar onze eigen env-var voor de Firebase RTDB-URL i.p.v. een hardcoded URL.
import type { TimingRow } from '../types/timing'

const FIREBASE_RTDB = import.meta.env.VITE_FIREBASE_DATABASE_URL as string

interface FirebaseRijderData {
  car_bike_nr: string
  naam: string
  team: string
  huidige_positie: number
  huidige_ronde: number
  laatste_rondetijd: string
  snelste_rondetijd: string
  gap?: string
  status?: string
  sprint?: {
    sectoren: { s1: string; s2: string; s3: string }
    banden: { voor: string; achter: string }
    topsnelheid: string
  }
  race?: {
    sectoren: { s1: string; s2: string; s3: string }
    banden: { voor: string; achter: string }
    topsnelheid: string
  }
  endurance?: {
    tank_inhoud: string
    totaal_pitstops: number
    stint_lengte: number
    banden: string
  }
}

interface FirebaseAlgemeenSessie {
  laatste_update: string
  status: string
  circuit?: string
  circuit_slug?: string
  weer?: {
    baan?: string
    lucht?: string
    conditie?: string
    baan_temp?: string
    lucht_temp?: string
    luchtvochtigheid?: string
    wind_speed?: string
    droog_nat?: string
  }
}

export interface LiveSessie {
  klasse: string
  jaar: string
  gp: string
  gpNaam: string
  status: string
  circuit?: string
  circuit_slug?: string
  weer?: FirebaseAlgemeenSessie['weer']
}

// Bekende race series — Kalender en andere keys worden overgeslagen
const RACE_SERIES = ['F1', 'MotoGP', 'Moto2', 'Moto3', 'WEC', 'ELMS', 'LeMansCup', 'IMSA', 'WorldSBK']

// ─── Sessie Status (schakelaar vanuit Command Center) ─────────────────────────

/**
 * Haalt de /Sessie_Status node op uit Firebase.
 * Het Command Center schrijft hier naartoe bij start/stop van een sessie.
 */
export async function getSessieStatus(): Promise<Record<string, boolean>> {
  try {
    const res = await fetch(`${FIREBASE_RTDB}/Sessie_Status.json?t=${Date.now()}`)
    if (!res.ok) return {}
    const data = await res.json()
    return data ?? {}
  } catch {
    return {}
  }
}

/** Haalt alleen ACTIEVE sessies op — filtert op Sessie_Status === true */
export async function getLiveSessies(): Promise<LiveSessie[]> {
  try {
    const statusRes = await fetch(`${FIREBASE_RTDB}/Sessie_Status.json?t=${Date.now()}`)
    if (!statusRes.ok) return []
    const statusData: Record<string, boolean> | null = await statusRes.json()
    if (!statusData) return []

    const actieveGPs = Object.entries(statusData)
      .filter(([, v]) => v === true)
      .map(([k]) => k)

    if (actieveGPs.length === 0) return []

    const sessies: LiveSessie[] = []

    for (const klasse of RACE_SERIES) {
      try {
        const res = await fetch(`${FIREBASE_RTDB}/${klasse}.json?t=${Date.now()}`)
        if (!res.ok) continue
        const jaren: Record<string, Record<string, { Algemeen_Sessie?: FirebaseAlgemeenSessie }>> | null = await res.json()
        if (!jaren) continue

        for (const [jaar, gps] of Object.entries(jaren)) {
          if (jaar === 'championship_standings') continue
          for (const [gp, gpData] of Object.entries(gps)) {
            if (actieveGPs.includes(gp) && gpData?.Algemeen_Sessie) {
              sessies.push({
                klasse,
                jaar,
                gp,
                gpNaam: gp.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                status: gpData.Algemeen_Sessie.status,
                circuit: gpData.Algemeen_Sessie.circuit,
                circuit_slug: gpData.Algemeen_Sessie.circuit_slug,
                weer: gpData.Algemeen_Sessie.weer,
              })
            }
          }
        }
      } catch {
        continue
      }
    }

    return sessies
  } catch (err) {
    console.error('Fout bij ophalen live sessies:', err)
    return []
  }
}

// ─── Live timing per sessie ───────────────────────────────────────────────────

/**
 * Haalt live timing op voor een sessie.
 * sessionId formaat: "F1/2026/canada_gp"
 * Het Command Center schrijft naar: /F1/2026/canada_gp/Live_Timing/nr_1
 */
export async function getLiveTiming(sessionId: string): Promise<TimingRow[]> {
  try {
    const res = await fetch(`${FIREBASE_RTDB}/${sessionId}/Live_Timing.json?t=${Date.now()}`)
    if (!res.ok) return []
    const data: Record<string, FirebaseRijderData> | null = await res.json()
    if (!data) return []

    return Object.values(data).map((r) => {
      const detail = r.sprint ?? r.race
      const isLeider = r.huidige_positie === 1
      let gap = r.gap ?? (isLeider ? 'Leider' : '-')
      if (!gap || gap === '') gap = isLeider ? 'Leider' : '-'

      return {
        pos: r.huidige_positie ?? 999,
        name: r.naam ?? '—',
        team: r.team ?? '',
        gap,
        lastLap: r.laatste_rondetijd ?? '-',
        bestLap: r.snelste_rondetijd ?? '-',
        sectors: [detail?.sectoren?.s1 ?? '-', detail?.sectoren?.s2 ?? '-', detail?.sectoren?.s3 ?? '-'],
        status: r.status ?? 'racing',
        carNumber: r.car_bike_nr ?? '',
        laps: r.huidige_ronde ?? 0,
        pits: r.endurance?.totaal_pitstops ?? 0,
        tyre: detail?.banden?.voor ?? r.endurance?.banden ?? '-',
      }
    })
  } catch {
    return []
  }
}

export async function getAlgemeenSessie(sessionId: string): Promise<FirebaseAlgemeenSessie | null> {
  try {
    const res = await fetch(`${FIREBASE_RTDB}/${sessionId}/Algemeen_Sessie.json?t=${Date.now()}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
