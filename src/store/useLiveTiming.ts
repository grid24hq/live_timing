import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { rtdb } from '../lib/firebase'
import type { LiveSession, Series, TimingRow } from '../types/timing'

// Onze interne serie-sleutels (lowercase) vs. de sleutels die het Command
// Center in Firebase gebruikt (met hoofdletter, exact zoals in config.json/"serie").
const FIREBASE_SERIE: Partial<Record<Series, string>> = {
  motogp: 'MotoGP',
  moto2: 'Moto2',
  moto3: 'Moto3',
  sbk: 'WorldSBK',
}

const JAAR = '2026'

// Eén rijder-record uit Live_Timing kan er per serie net iets anders uitzien
// (WorldSBK gebruikt bv. "auto"/"verschil"/"snelste_ronde" i.p.v.
// "team"/"gap"/"laatste_rondetijd", en heeft geen "sectoren"). Deze functie
// vangt beide vormen op zodat de rest van de app altijd hetzelfde shape krijgt.
function normaliseerRij(raw: any): TimingRow {
  return {
    pos: raw?.huidige_positie ?? 999,
    name: raw?.naam ?? '—',
    team: raw?.team ?? raw?.auto ?? raw?.klasse ?? '',
    gap: raw?.gap ?? raw?.verschil ?? '-',
    lastLap: raw?.laatste_rondetijd ?? raw?.snelste_ronde ?? '-',
    bestLap: raw?.snelste_rondetijd ?? raw?.snelste_ronde ?? '-',
    sectors: [
      raw?.race?.sectoren?.s1 ?? '-',
      raw?.race?.sectoren?.s2 ?? '-',
      raw?.race?.sectoren?.s3 ?? '-',
    ],
    status: raw?.status ?? '',
    carNumber: raw?.car_bike_nr ?? '',
    laps: raw?.huidige_ronde ?? 0,
    pits: raw?.endurance?.totaal_pitstops ?? 0,
    tyre: raw?.race?.banden?.voor ?? raw?.endurance?.banden ?? '-',
  }
}

/**
 * Live timing hook voor de MotoGP/Moto2/Moto3/WorldSBK-familie (dezelfde
 * Command Center-pijplijn). F1 heeft een eigen hook (useF1LiveTiming),
 * omdat de F1 SignalR-feed een ander datashape gebruikt.
 *
 * Werking:
 * 1. Luister op Sessie_Status — welke gp-sleutels staan er nu op true?
 * 2. Luister op {Serie}/2026 — welke van die sleutels bestaat hier ook echt?
 *    (dezelfde gp-sleutel kan in principe voor meerdere series bestaan,
 *    dus we controleren of 'ie ook echt onder DEZE serie hangt)
 * 3. Zodra we een match hebben: lees Algemeen_Sessie + Live_Timing live uit.
 */
export function useLiveTiming(series: Exclude<Series, 'f1'>): LiveSession | null {
  const [activeKeys, setActiveKeys] = useState<string[]>([])
  const [session, setSession] = useState<LiveSession | null>(null)

  useEffect(() => {
    const statusRef = ref(rtdb, 'Sessie_Status')
    return onValue(statusRef, (snap) => {
      const data = (snap.val() as Record<string, boolean>) ?? {}
      setActiveKeys(Object.keys(data).filter((k) => data[k]))
    })
  }, [])

  useEffect(() => {
    const serieNaam = FIREBASE_SERIE[series]
    if (!serieNaam) return
    const jaarRef = ref(rtdb, `${serieNaam}/${JAAR}`)
    return onValue(jaarRef, (snap) => {
      const jaarData = snap.val() ?? {}
      const gpKey = activeKeys.find((k) => jaarData[k])
      if (!gpKey) {
        setSession(null)
        return
      }
      const gp = jaarData[gpKey]
      const algemeen = gp?.Algemeen_Sessie ?? {}
      const timing = gp?.Live_Timing ?? {}

      const leaderboard: TimingRow[] = Object.values(timing)
        .map(normaliseerRij)
        .sort((a, b) => a.pos - b.pos)

      const sessieNaam = algemeen.sessie_naam ?? 'Sessie'
      const plek = algemeen.circuit ?? algemeen.event ?? ''
      const ronde = algemeen.ronden_totaal ? ` · ${algemeen.ronden_totaal} ronden` : ''

      setSession({
        series,
        sessionLabel: `${sessieNaam}${plek ? ` — ${plek}` : ''}${ronde}`,
        isLive: algemeen.status === 'Live',
        leaderboard,
      })
    })
  }, [series, activeKeys])

  return session
}
