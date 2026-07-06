import type { Series } from '../types/calendar'
import { SERIES_STROKE } from '../lib/seriesTheme'

interface Props {
  series: Series
  /** Pad naar de eigen circuit-SVG uit public/circuits/<serie>/, bv "/circuits/f1/f1_british_gp.svg" */
  circuitSvgUrl?: string
}

// Placeholder-outline, gebruikt zolang er nog geen eigen SVG voor dit circuit is.
const DEFAULT_TRACK_PATH =
  'M40 120 C 40 70, 90 40, 150 40 L 260 40 C 300 40, 320 60, 320 90 C 320 115, 300 125, 270 125 L 220 125 C 190 125, 180 145, 200 165 L 230 190 C 250 210, 240 230, 210 230 L 100 230 C 60 230, 40 200, 40 165 Z'

// Gloed-kleur per serie: F1 rood, MotoGP/Moto2/Moto3 oranje-tint, SBK roze/paars
const GLOW_FILTER: Record<Series, string> = {
  f1: 'drop-shadow(0 0 6px rgba(225,6,0,0.65)) drop-shadow(0 0 14px rgba(225,6,0,0.35))',
  motogp: 'drop-shadow(0 0 6px rgba(255,107,0,0.65)) drop-shadow(0 0 14px rgba(255,107,0,0.35))',
  moto2: 'drop-shadow(0 0 6px rgba(255,107,0,0.65)) drop-shadow(0 0 14px rgba(255,107,0,0.35))',
  moto3: 'drop-shadow(0 0 6px rgba(0,166,81,0.65)) drop-shadow(0 0 14px rgba(0,166,81,0.35))',
  worldsbk: 'drop-shadow(0 0 6px rgba(176,38,255,0.65)) drop-shadow(0 0 14px rgba(176,38,255,0.35))',
}

export default function CircuitTrack({ series, circuitSvgUrl }: Props) {
  if (circuitSvgUrl) {
    return (
      <img
        src={circuitSvgUrl}
        alt="Circuit layout"
        className="h-full w-full object-contain"
        style={{ filter: GLOW_FILTER[series] }}
      />
    )
  }

  return (
    <svg viewBox="0 0 360 270" className="h-full w-full" style={{ filter: GLOW_FILTER[series] }}>
      <path
        d={DEFAULT_TRACK_PATH}
        fill="none"
        className={SERIES_STROKE[series]}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
