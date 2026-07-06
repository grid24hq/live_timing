import { useTranslation } from 'react-i18next'
import { useTimingStore, type Series } from '../store/useTimingStore'
import type { LiveSession } from '../types/timing'

// Tijdelijke mock data — zelfde vorm als het echte Firebase RTDB pad.
// Vervang dit later door een hook (bv. useLiveTiming) die op
// MotoGP/2026/<gp>/Live_Timing/Algemeen_Sessie/ luistert.
const MOCK_SESSIONS: Record<Series, LiveSession> = {
  f1: {
    series: 'f1',
    sessionLabel: 'Race • Ronde 42/58 — Circuit Zandvoort',
    isLive: true,
    leaderboard: [
      { pos: 1, name: 'M. Verstappen', team: 'Red Bull Racing', gap: 'Leider', lastLap: '1:11.203', sectors: ['purple', 'green', 'yellow'] },
      { pos: 2, name: 'L. Norris', team: 'McLaren', gap: '+2.981', lastLap: '1:11.540', sectors: ['green', 'yellow', 'green'] },
      { pos: 3, name: 'C. Leclerc', team: 'Ferrari', gap: '+6.114', lastLap: '1:11.902', sectors: ['yellow', 'yellow', 'green'] },
    ],
  },
  motogp: {
    series: 'motogp',
    sessionLabel: 'Grand Prix • Ronde 18/26 — TT Circuit Assen',
    isLive: true,
    leaderboard: [
      { pos: 1, name: 'F. Bagnaia', team: 'Ducati Lenovo', gap: 'Leider', lastLap: '1:33.104', sectors: ['purple', 'yellow', 'green'] },
      { pos: 2, name: 'J. Martin', team: 'Pramac Racing', gap: '+0.812', lastLap: '1:33.221', sectors: ['green', 'green', 'yellow'] },
    ],
  },
  moto2: {
    series: 'moto2',
    sessionLabel: 'Race — TT Circuit Assen',
    isLive: false,
    leaderboard: [
      { pos: 1, name: 'T. Öncü', team: 'Red Bull KTM Ajo', gap: 'Leider', lastLap: '1:38.210', sectors: ['purple', 'green', 'green'] },
    ],
  },
  moto3: {
    series: 'moto3',
    sessionLabel: 'Race — TT Circuit Assen',
    isLive: false,
    leaderboard: [
      { pos: 1, name: 'D. Holgado', team: 'Red Bull KTM Ajo', gap: 'Leider', lastLap: '1:43.552', sectors: ['purple', 'yellow', 'green'] },
    ],
  },
}

const SERIES_LABEL: Record<Series, string> = {
  f1: 'FORMULA 1',
  motogp: 'MOTOGP',
  moto2: 'MOTO2',
  moto3: 'MOTO3',
}

const SERIES_ACCENT: Record<Series, string> = {
  f1: 'border-f1 text-f1',
  motogp: 'border-motogp text-motogp',
  moto2: 'border-moto2 text-moto2',
  moto3: 'border-moto3 text-moto3',
}

const SECTOR_COLOR: Record<string, string> = {
  purple: 'text-purple',
  green: 'text-green',
  yellow: 'text-amber',
}

export default function Home() {
  const { t } = useTranslation()
  const { selectedSeries, setSelectedSeries } = useTimingStore()
  const session = MOCK_SESSIONS[selectedSeries]

  return (
    <div className="min-h-screen bg-void text-text-primary font-body">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-line bg-void/85 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-8">
          <div className="font-display text-xl font-bold tracking-wide">
            GRID24<span className="text-signal">HQ</span>
          </div>
          <div className="hidden gap-7 md:flex">
            <a href="#timing" className="font-display text-sm font-semibold text-text-secondary hover:text-text-primary">
              {t('nav.liveTiming')}
            </a>
            <a href="#calendar" className="font-display text-sm font-semibold text-text-secondary hover:text-text-primary">
              {t('nav.calendar')}
            </a>
            <a href="#standings" className="font-display text-sm font-semibold text-text-secondary hover:text-text-primary">
              {t('nav.standings')}
            </a>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-line-bright px-3.5 py-1.5 font-mono text-xs text-text-secondary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
            {t('status.live')}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="font-display text-6xl font-bold tracking-wide md:text-8xl">
          GRID24<span className="text-signal">HQ</span>
        </h1>
        <p className="mt-5 max-w-lg text-text-secondary">{t('hero.tagline')}</p>
      </section>

      {/* LIVE TIMING CONSOLE */}
      <section id="timing" className="mx-auto max-w-[1180px] px-8 py-12">
        <div className="overflow-hidden rounded-xl border border-line bg-panel">
          <div className="flex border-b border-line bg-panel-raised">
            {(Object.keys(SERIES_LABEL) as Series[]).map((series) => (
              <button
                key={series}
                onClick={() => setSelectedSeries(series)}
                className={`border-b-2 px-6 py-4 font-display text-sm font-semibold tracking-wide ${
                  selectedSeries === series ? SERIES_ACCENT[series] : 'border-transparent text-text-secondary'
                }`}
              >
                {SERIES_LABEL[series]}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-b border-line px-6 py-4 font-mono text-sm text-text-secondary">
            <span>{session.sessionLabel}</span>
            {session.isLive && (
              <span className="flex items-center gap-2 text-signal">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
                LIVE
              </span>
            )}
          </div>

          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="px-5 py-3">Pos</th>
                <th className="px-5 py-3">Coureur</th>
                <th className="px-5 py-3">Gap</th>
                <th className="px-5 py-3">Laatste ronde</th>
                <th className="px-5 py-3">S1</th>
                <th className="px-5 py-3">S2</th>
                <th className="px-5 py-3">S3</th>
              </tr>
            </thead>
            <tbody>
              {session.leaderboard.map((row) => (
                <tr key={row.pos} className="border-b border-line hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 font-bold">{row.pos}</td>
                  <td className="px-5 py-3.5 font-body">
                    <div className="font-semibold">{row.name}</div>
                    <div className="text-xs text-text-dim">{row.team}</div>
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{row.gap}</td>
                  <td className="px-5 py-3.5">{row.lastLap}</td>
                  {row.sectors.map((s, i) => (
                    <td key={i} className={`px-5 py-3.5 ${SECTOR_COLOR[s]}`}>■</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
