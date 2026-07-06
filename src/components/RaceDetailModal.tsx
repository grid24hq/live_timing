import type { Race } from '../types/calendar'
import { SERIES_BADGE } from '../lib/seriesTheme'
import CircuitTrack from './CircuitTrack'

const SERIES_DOT: Record<Race['series'], string> = {
  f1: 'bg-f1',
  motogp: 'bg-moto2',
  moto2: 'bg-moto2',
  moto3: 'bg-moto3',
  worldsbk: 'bg-purple',
}

interface Props {
  race: Race
  onClose: () => void
}

export default function RaceDetailModal({ race, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-line bg-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line p-6">
          <div>
            <div className="flex items-center gap-3">
              <span className={`rounded border px-2 py-0.5 font-display text-xs font-bold tracking-wide ${SERIES_BADGE[race.series]}`}>
                {race.seriesLabel}
              </span>
              <span className="font-mono text-xs uppercase tracking-wide text-text-dim">{race.statusLabel}</span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold">{race.name}</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {race.circuitName} · {race.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-secondary hover:bg-panel-raised hover:text-text-primary"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {/* Links: circuit info + track */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className={`h-3 w-1 rounded-full ${SERIES_DOT[race.series]}`} />
              <span className="font-display text-xs font-bold uppercase tracking-widest text-text-dim">Circuit</span>
            </div>
            <dl className="space-y-2 font-mono text-sm">
              <div className="flex justify-between border-b border-line pb-2">
                <dt className="text-text-secondary">Datum</dt>
                <dd>{race.dateLabel}</dd>
              </div>
              <div className="flex justify-between border-b border-line pb-2">
                <dt className="text-text-secondary">Starttijd</dt>
                <dd>{race.startTime}</dd>
              </div>
              <div className="flex justify-between border-b border-line pb-2">
                <dt className="text-text-secondary">Lengte</dt>
                <dd>{race.lengthKm.toFixed(3)} km</dd>
              </div>
              <div className="flex justify-between pb-2">
                <dt className="text-text-secondary">Ronden</dt>
                <dd>{race.laps}</dd>
              </div>
            </dl>
            <div className="mt-4 aspect-square rounded-lg border border-line bg-panel-raised p-4">
              <CircuitTrack series={race.series} circuitSvgUrl={race.circuitSvgUrl} />
            </div>
          </div>

          {/* Rechts: snelste ronde + programma */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-1 rounded-full bg-signal" />
              <span className="font-display text-xs font-bold uppercase tracking-widest text-text-dim">Snelste ronde ooit</span>
            </div>
            <div className="rounded-lg border border-signal/40 bg-signal/10 p-4">
              <div className="font-mono text-2xl font-bold text-signal">{race.fastestLapEver.time}</div>
              <div className="mt-1 font-semibold">{race.fastestLapEver.driver}</div>
              <div className="text-sm text-text-secondary">
                {race.fastestLapEver.team} · {race.fastestLapEver.year}
              </div>
            </div>

            <div className="mb-3 mt-6 flex items-center gap-2">
              <span className={`h-3 w-1 rounded-full ${SERIES_DOT[race.series]}`} />
              <span className="font-display text-xs font-bold uppercase tracking-widest text-text-dim">Programma</span>
            </div>
            <div className="space-y-1 font-mono text-sm">
              {race.sessions.map((s) => (
                <div key={s.label} className="flex justify-between border-b border-line py-2 last:border-none">
                  <span className="text-text-primary">{s.label}</span>
                  <span className="text-text-secondary">{s.dateLabel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
