import { useEffect } from 'react'
import type { KalenderRace } from '../types/calendar'
import { getDagenTot, getRaceStatus, getCircuitSvgPath } from '../lib/kalenderApi'
import { getSeriesColor } from '../lib/seriesConfig'
import { SERIES_CIRCUIT_FOLDER } from '../lib/seriesConfig'
import SeriesBadge from './SeriesBadge'

const SESSIE_LABELS: Record<string, string> = {
  fp1: 'VT1', fp2: 'VT2', fp3: 'VT3',
  kwalificatie: 'Kwalificatie', race: 'Race',
  sprint: 'Sprint', sprint_kwalificatie: 'Sprint Kwalificatie',
  vrije_training: 'Vrije Training',
  vrije_training_1: 'VT1', vrije_training_2: 'VT2',
  race1: 'Race 1', race2: 'Race 2', superpole: 'Superpole', warmup: 'Warm-up',
}

interface Props {
  race: KalenderRace
  onClose: () => void
}

export default function RaceModal({ race, onClose }: Props) {
  const kleur = getSeriesColor(race.serie)
  const dagen = getDagenTot(race.datum)
  const status = getRaceStatus(race.datum)
  const circuitSvg = getCircuitSvgPath(race.serie, SERIES_CIRCUIT_FOLDER[race.serie], race.id)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="panel-card w-full max-w-2xl border-t-[3px]"
        style={{ borderTopColor: kleur }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-line p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <SeriesBadge series={race.serie} size="md" />
                {status === 'today' && (
                  <span className="flex items-center gap-1 font-body text-[10px] font-bold uppercase tracking-wider text-amber">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" /> Vandaag
                  </span>
                )}
                {status === 'finished' && (
                  <span className="font-body text-[10px] font-bold uppercase tracking-wider text-text-dim">Afgelopen</span>
                )}
              </div>
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide">{race.naam}</h2>
              <p className="mt-1 font-body text-sm text-text-secondary">
                {race.baan} · {race.stad}, {race.land}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-md p-1 text-xl font-bold text-text-secondary transition-colors hover:text-text-primary"
              aria-label="Sluiten"
            >
              ✕
            </button>
          </div>

          {status === 'upcoming' && (
            <div
              className="mt-4 inline-flex items-center gap-2 rounded px-4 py-2"
              style={{ background: `${kleur}15`, border: `1px solid ${kleur}30` }}
            >
              <span className="text-lg">⏱</span>
              <span className="font-display text-lg font-bold" style={{ color: kleur }}>
                {dagen} {dagen === 1 ? 'dag' : 'dagen'}
              </span>
              <span className="font-body text-xs text-text-secondary">tot de race</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {/* Circuit info */}
          <div>
            <div className="section-label mb-4">Circuit</div>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Datum</span>
                <span className="font-semibold text-text-primary">
                  {new Date(race.datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Starttijd</span>
                <span className="font-semibold text-text-primary">
                  {race.tijd_cet === 'TBC' ? 'Nog niet bevestigd' : `${race.tijd_cet} CET`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Lengte</span>
                <span className="font-semibold text-text-primary">{race.track_lengte_km} km</span>
              </div>
              {race.ronden && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Ronden</span>
                  <span className="font-semibold text-text-primary">{race.ronden}</span>
                </div>
              )}
            </div>

            {/* Circuit SVG */}
            <div
              className="mt-4 flex items-center justify-center overflow-hidden rounded-lg"
              style={{ height: 160, background: `${kleur}08`, border: `1px solid ${kleur}20` }}
            >
              <img
                src={circuitSvg}
                alt={`${race.baan} layout`}
                style={{
                  maxHeight: 150,
                  maxWidth: '100%',
                  filter: `drop-shadow(0 0 6px ${kleur}A6) drop-shadow(0 0 14px ${kleur}59)`,
                }}
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  target.nextElementSibling?.removeAttribute('style')
                }}
              />
              <span className="font-body text-xs text-text-dim" style={{ display: 'none' }}>
                Circuit layout — binnenkort
              </span>
            </div>
          </div>

          {/* Snelste ronde + programma */}
          <div>
            <div className="section-label mb-4">Snelste ronde ooit</div>
            <div className="rounded-lg p-4" style={{ background: `${kleur}10`, border: `1px solid ${kleur}25` }}>
              <div className="mb-1 font-display text-3xl font-black" style={{ color: kleur }}>
                {race.snelste_ronde_tijd}
              </div>
              <div className="font-body text-sm font-semibold text-text-primary">{race.snelste_ronde_rijder}</div>
              <div className="font-body text-xs text-text-secondary">{race.snelste_ronde_team}</div>
              <div className="mt-1 font-body text-xs text-text-dim">{race.snelste_ronde_jaar}</div>
            </div>

            {Object.keys(race.sessies).length > 0 && (
              <div className="mt-6">
                <div className="section-label mb-3">Programma</div>
                <div className="space-y-1.5">
                  {Object.entries(race.sessies).map(([key, sessie]) => (
                    <div key={key} className="flex items-center justify-between border-b border-line/50 py-1">
                      <span className="font-body text-xs text-text-secondary">{SESSIE_LABELS[key] ?? key}</span>
                      <span className="font-mono text-xs text-text-primary">
                        {new Date(sessie.datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} · {sessie.tijd_cet}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
