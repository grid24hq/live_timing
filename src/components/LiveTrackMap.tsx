import React, { useEffect, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { rtdb } from '../lib/firebase'
import { useTimingStore } from '../store/useTimingStore'

interface Position {
  x: number
  y: number
}

interface AllPositions {
  [carNumber: string]: Position
}

// Kalibratie-matrix voor F1-meters naar jouw box
// Mocht een stip op een circuit iets te ver naar links of rechts rijden,
// dan kun je hier simpel de min/max waarden een klein tikje aanpassen!
const TRACK_BOUNDS: Record<string, { minX: number; maxX: number; minY: number; maxY: number }> = {
  australian_gp: { minX: -1200, maxX: 1200, minY: -1000, maxY: 1000 },
  british_gp: { minX: -1000, maxX: 1500, minY: -1200, maxY: 1200 },
  belgian_gp: { minX: -1500, maxX: 2000, minY: -1500, maxY: 1500 },
  dutch_gp: { minX: -800, maxX: 800, minY: -800, maxY: 800 },
  monaco_gp: { minX: -600, maxX: 650, minY: -500, maxY: 600 },
  // Standaard fallback voor de overige banen zodat ze nooit crashen
  default: { minX: -1500, maxX: 1500, minY: -1500, maxY: 1500 }
}

// Jouw sync-scripts gebruiken soms de landnaam (bv. "belgium_gp") waar de
// officiële benaming een bijvoeglijk naamwoord gebruikt (bv. "belgian_gp").
// Deze alias-lijst vangt dat verschil op vóórdat we naar de telemetrie-
// afbeelding zoeken.
const CIRCUIT_ALIASES: Record<string, string> = {
  belgium_gp: 'belgian_gp',
  britain_gp: 'british_gp', great_britain_gp: 'british_gp', uk_gp: 'british_gp',
  netherlands_gp: 'dutch_gp', holland_gp: 'dutch_gp',
  spain_gp: 'spanish_gp',
  italy_gp: 'italian_gp',
  japan_gp: 'japanese_gp',
  hungary_gp: 'hungarian_gp',
  austria_gp: 'austrian_gp',
  australia_gp: 'australian_gp',
  brazil_gp: 'brazilian_gp', sao_paulo_gp: 'brazilian_gp',
  china_gp: 'chinese_gp',
  saudi_gp: 'saudi_arabian_gp', saudi_arabia_gp: 'saudi_arabian_gp',
  usa_gp: 'us_gp', united_states_gp: 'us_gp', austin_gp: 'us_gp',
  mexican_gp: 'mexico_gp',
}

// De officiële 'circuit_slug' (zoals f1_ws_client.py 'm aanlevert, bv. "british_gp")
// -> de bestandsnaam van de nieuwe telemetrie-afbeelding (public/circuits__telemetry/).
// Dit zijn twee verschillende naamconventies (GP-naam vs. circuit-naam), vandaar
// deze losse koppeltabel i.p.v. rechtstreeks de slug in het pad te plakken.
const CIRCUIT_TELEMETRY_IMAGE: Record<string, string> = {
  australian_gp: 'albert_park',
  bahrain_gp: 'bahrain',
  saudi_arabian_gp: 'jeddah',
  japanese_gp: 'suzuka',
  chinese_gp: 'shanghai',
  miami_gp: 'miami',
  madrid_gp: 'madrid',
  monaco_gp: 'monaco',
  spanish_gp: 'catalunya',
  canadian_gp: 'montreal',
  austrian_gp: 'red_bull_ring',
  british_gp: 'silverstone',
  belgian_gp: 'spa',
  hungarian_gp: 'hungaroring',
  dutch_gp: 'zandvoort',
  italian_gp: 'monza',
  azerbaijan_gp: 'baku',
  singapore_gp: 'singapore',
  us_gp: 'austin',
  mexico_gp: 'mexico_city',
  brazilian_gp: 'interlagos',
  las_vegas_gp: 'las_vegas',
  qatar_gp: 'losail',
  abu_dhabi_gp: 'abu_dhabi',
}

interface LiveTrackMapProps {
  circuitSlug?: string // Wordt doorgegeven via de sessie (bijv. 'british_gp' of 'australian_gp')
}

// Rugnummer -> officiële 2026-teamkleur, rechtstreeks overgenomen uit src/data/f1Coureurs.ts
// zodat de stippen op de trackmap altijd matchen met de rest van de site.
const TEAM_COLORS: Record<string, string> = {
  '3': '#3671C6', '6': '#3671C6',   // Oracle Red Bull Racing (Verstappen, Hadjar)
  '41': '#6692FF', '30': '#6692FF', // Visa Cash App Racing Bulls (Lindblad, Lawson)
  '16': '#E8002D', '44': '#E8002D', // Scuderia Ferrari HP (Leclerc, Hamilton)
  '4': '#FF8000', '81': '#FF8000',  // McLaren (Norris, Piastri)
  '63': '#27F4D2', '12': '#27F4D2', // Mercedes-AMG PETRONAS (Russell, Antonelli)
  '14': '#229971', '18': '#229971', // Aston Martin Aramco (Alonso, Stroll)
  '23': '#64C4FF', '55': '#64C4FF', // Atlassian Williams (Albon, Sainz)
  '10': '#00A1E8', '43': '#00A1E8', // BWT Alpine (Gasly, Colapinto)
  '31': '#B6BABD', '87': '#B6BABD', // TGR Haas (Ocon, Bearman)
  '27': '#BB0A30', '5': '#BB0A30',  // Audi F1 Team (Hulkenberg, Bortoleto)
  '11': '#D4AF37', '77': '#D4AF37', // Cadillac F1 Team (Perez, Bottas)
}

export const LiveTrackMap: React.FC<LiveTrackMapProps> = ({ circuitSlug = 'british_gp' }) => {
  const { selectedSeries } = useTimingStore()
  const [positions, setPositions] = useState<AllPositions>({})

  useEffect(() => {
    if (selectedSeries !== 'f1') return

    // Luister naar de centrale verzamelmap van alle 20 auto's
    const positionsRef = ref(rtdb, 'live_telemetry/f1/track_positions')

    onValue(positionsRef, (snapshot) => {
      if (snapshot.exists()) {
        setPositions(snapshot.val() as AllPositions)
      }
    })

    return () => {
      off(positionsRef)
    }
  }, [selectedSeries])

  if (selectedSeries !== 'f1') return null

  // Landnaam -> bijvoeglijk-naamwoord normaliseren voordat we verder zoeken
  const normalizedSlug = CIRCUIT_ALIASES[circuitSlug] ?? circuitSlug

  // Zoek de juiste schaalinstellingen voor dit circuit
  const bounds = TRACK_BOUNDS[normalizedSlug] || TRACK_BOUNDS.default

  // Reken de meters live om naar procenten (0% - 100%) binnen de box
  const convertToPercentages = (x: number, y: number) => {
    const width = bounds.maxX - bounds.minX
    const height = bounds.maxY - bounds.minY

    // Bereken percentage en flip de Y-as (F1-feeds staan vaak spiegelbeeld op computerschermen)
    const pctX = ((x - bounds.minX) / width) * 100
    const pctY = 100 - ((y - bounds.minY) / height) * 100

    return {
      left: `${Math.min(Math.max(pctX, 2), 98)}%`,
      top: `${Math.min(Math.max(pctY, 2), 98)}%`
    }
  }

  // GP-slug -> telemetrie-afbeelding-id. Onbekende slugs vallen terug op de
  // slug zelf zonder '_gp' (bv. 'silverstone_gp' -> 'silverstone') als beste gok.
  const imageId = CIRCUIT_TELEMETRY_IMAGE[normalizedSlug] ?? normalizedSlug.replace(/_gp$/, '')
  const imagePath = `/circuits__telemetry/f1_${imageId}_telemetry.webp`

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
          LIVE POSITION TRACKER
        </h3>
        <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
          {normalizedSlug.replace('_', ' ')}
        </span>
      </div>

      {/* De relatieve box waarin alles wordt getekend */}
      <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-900/40 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)] p-4">

        {/* OFFICIËLE F1-CIRCUITAFBEELDING ALS ACHTERGROND */}
        <img
          src={imagePath}
          alt="Circuit Map"
          className="pointer-events-none absolute max-h-[93%] max-w-[93%] select-none object-contain opacity-80"
          onError={(e) => {
            // Als een bestand onverhoopt mist, toon dan een subtiele waarschuwing in plaats van een crash
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />

        {/* DE LIVE AUTO STIPPEN OVER DE CIRCUITAFBEELDING */}
        {Object.entries(positions).map(([carNumber, pos]) => {
          const style = convertToPercentages(pos.x, pos.y)
          const dotColor = TEAM_COLORS[carNumber] || '#ef4444' // Standaard rood voor onbekende nummers

          return (
            <div
              key={carNumber}
              className="absolute -ml-3 -mt-3 flex h-6 w-6 select-none items-center justify-center transition-all duration-500 ease-out"
              style={{ left: style.left, top: style.top }}
            >
              {/* Pulserende gloed-ring achter de stip */}
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40"
                style={{ backgroundColor: dotColor }}
              />
              <span
                className="relative flex h-5 w-5 items-center justify-center rounded-full border border-white/80 font-mono text-[9px] font-black text-white shadow-2xl"
                style={{ backgroundColor: dotColor, boxShadow: `0 0 10px ${dotColor}` }}
              >
                {carNumber}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
