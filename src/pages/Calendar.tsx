import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getKalender } from '../lib/kalenderApi'
import { SERIES_CONFIG, SERIES_VOLGORDE, getSeriesColor } from '../lib/seriesConfig'
import type { KalenderMaand, KalenderRace, Series } from '../types/calendar'
import RaceCard from '../components/RaceCard'
import RaceModal from '../components/RaceModal'

export default function Calendar() {
  const [maanden, setMaanden] = useState<KalenderMaand[]>([])
  const [laden, setLaden] = useState(true)
  const [geselecteerd, setGeselecteerd] = useState<KalenderRace | null>(null)
  const [filterSerie, setFilterSerie] = useState<Series | 'alle'>('alle')

  useEffect(() => {
    getKalender().then((data) => {
      setMaanden(data)
      setLaden(false)
    })
  }, [])

  const gefilterd = maanden
    .map((m) => ({
      ...m,
      races: filterSerie === 'alle' ? m.races : m.races.filter((r) => r.serie === filterSerie),
    }))
    .filter((m) => m.races.length > 0)

  return (
    <div className="min-h-screen bg-void text-text-primary">
      <nav className="sticky top-0 z-50 border-b border-line bg-void/85 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-8">
          <Link to="/" className="font-display text-xl font-bold tracking-wide">
            GRID24<span className="text-signal">HQ</span>
          </Link>
          <Link to="/" className="font-display text-sm font-semibold text-text-secondary hover:text-text-primary">
            ← Terug naar home
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="mb-8">
          <div className="section-label mb-3">2026 Seizoen</div>
          <h1 className="mb-2 font-display text-4xl font-black uppercase tracking-wide">Racekalender</h1>
          <p className="font-body text-sm text-text-secondary">Alle races van het 2026 seizoen — klik op een race voor meer info</p>
        </div>

        {/* Serie filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterButton actief={filterSerie === 'alle'} kleur="#FFB020" onClick={() => setFilterSerie('alle')}>
            Alle series
          </FilterButton>
          {SERIES_VOLGORDE.map((serie) => (
            <FilterButton
              key={serie}
              actief={filterSerie === serie}
              kleur={getSeriesColor(serie)}
              onClick={() => setFilterSerie(serie)}
            >
              {SERIES_CONFIG[serie].label}
            </FilterButton>
          ))}
        </div>

        {laden && (
          <div className="flex items-center justify-center gap-3 py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-amber" />
            <span className="font-body text-sm text-text-secondary">Kalender laden...</span>
          </div>
        )}

        {!laden && gefilterd.length === 0 && (
          <div className="panel-card p-12 text-center">
            <div className="mb-4 text-4xl">📅</div>
            <h2 className="mb-2 font-display text-xl font-bold uppercase">Geen races gevonden</h2>
            <p className="font-body text-sm text-text-secondary">
              {maanden.length === 0
                ? 'Nog geen kalenderdata in Firebase — voeg races toe onder het pad "Kalender".'
                : 'Probeer een andere serie-filter.'}
            </p>
          </div>
        )}

        {!laden &&
          gefilterd.map((maand) => (
            <div key={maand.maand} className="mb-10">
              <div className="mb-4 flex items-center gap-4">
                <h2 className="font-display text-xl font-bold uppercase tracking-wider">{maand.naam}</h2>
                <div className="h-px flex-1 bg-line" />
                <span className="font-mono text-xs text-text-secondary">
                  {maand.races.length} {maand.races.length === 1 ? 'race' : 'races'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {maand.races.map((race) => (
                  <RaceCard key={`${race.serie}-${race.id}`} race={race} onClick={() => setGeselecteerd(race)} />
                ))}
              </div>
            </div>
          ))}
      </div>

      {geselecteerd && <RaceModal race={geselecteerd} onClose={() => setGeselecteerd(null)} />}
    </div>
  )
}

function FilterButton({
  actief,
  kleur,
  onClick,
  children,
}: {
  actief: boolean
  kleur: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="rounded px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider transition-all duration-200"
      style={
        actief
          ? { background: kleur, color: '#fff', border: `1px solid ${kleur}` }
          : { background: 'transparent', color: '#888', border: '1px solid #222' }
      }
    >
      {children}
    </button>
  )
}
