import type { KalenderRace } from '../types/calendar'
import { getDagenTot, getRaceStatus } from '../lib/kalenderApi'
import { getSeriesColor } from '../lib/seriesConfig'
import SeriesBadge from './SeriesBadge'

interface Props {
  race: KalenderRace
  onClick: () => void
}

export default function RaceCard({ race, onClick }: Props) {
  const kleur = getSeriesColor(race.serie)
  const status = getRaceStatus(race.datum)
  const dagen = getDagenTot(race.datum)
  const datum = new Date(race.datum)

  return (
    <button
      onClick={onClick}
      className="panel-card cursor-pointer border-t-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-line-bright"
      style={{ borderTopColor: kleur }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-center font-mono">
          <div className="text-2xl font-bold leading-none" style={{ color: kleur }}>
            {datum.getDate()}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-text-dim">
            {datum.toLocaleDateString('nl-NL', { month: 'short' })}
          </div>
        </div>
        <SeriesBadge series={race.serie} />
      </div>

      <div className="mb-0.5 font-display text-base font-bold uppercase leading-tight">{race.naam}</div>
      <div className="truncate text-xs text-text-secondary">{race.baan}</div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 font-mono text-[10px]">
        {status === 'upcoming' && (
          <span className="text-text-secondary">{dagen === 1 ? 'Morgen' : `${dagen} dagen`}</span>
        )}
        {status === 'today' && (
          <span className="flex items-center gap-1 font-bold text-amber">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" /> Vandaag
          </span>
        )}
        {status === 'finished' && <span className="text-text-dim">Afgelopen</span>}
        <span className="text-text-secondary">{race.tijd_cet === 'TBC' ? 'Tijd TBC' : `${race.tijd_cet} CET`}</span>
      </div>
    </button>
  )
}
