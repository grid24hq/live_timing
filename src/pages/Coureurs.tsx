import { useState } from 'react'
import { Link } from 'react-router-dom'
import { F1_COUREURS } from '../data/f1Coureurs'
import { MOTOGP_COUREURS } from '../data/motogpCoureurs'
import { SBK_COUREURS } from '../data/sbkCoureurs'
import type { Coureur, CoureurSeries } from '../types/coureur'
import { SERIES_CONFIG } from '../lib/seriesConfig'
import CoureurCard from '../components/CoureurCard'
import CoureurModal from '../components/CoureurModal'

const ALLE_COUREURS: Coureur[] = [...F1_COUREURS, ...MOTOGP_COUREURS, ...SBK_COUREURS]

const FILTERS: { key: CoureurSeries | 'alle'; label: string; kleur: string }[] = [
  { key: 'alle', label: 'Alle series', kleur: '#FFB020' },
  { key: 'f1', label: 'F1', kleur: SERIES_CONFIG.f1.hex },
  { key: 'motogp', label: 'MotoGP', kleur: SERIES_CONFIG.motogp.hex },
  { key: 'sbk', label: 'WorldSBK', kleur: SERIES_CONFIG.worldsbk.hex },
]

export default function Coureurs() {
  const [filter, setFilter] = useState<CoureurSeries | 'alle'>('alle')
  const [geselecteerd, setGeselecteerd] = useState<Coureur | null>(null)

  const gefilterd = filter === 'alle' ? ALLE_COUREURS : ALLE_COUREURS.filter((d) => d.series === filter)

  const aantal = (key: CoureurSeries | 'alle') =>
    key === 'alle' ? ALLE_COUREURS.length : ALLE_COUREURS.filter((d) => d.series === key).length

  return (
    <div className="min-h-screen bg-void text-text-primary">
      <nav className="sticky top-0 z-50 border-b border-line bg-void/85 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-8">
          <Link to="/" className="font-display text-xl font-bold tracking-wide">
            GRID24<span className="text-signal">HQ</span>
          </Link>
          <Link to="/" className="font-display text-base font-semibold text-text-secondary hover:text-text-primary">
            ← Terug naar home
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(255,45,45,0.10), transparent)' }}
        />
        <div
          className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none font-display text-[160px] font-black leading-none text-white/[0.06]"
          aria-hidden="true"
        >
          2026
        </div>
        <div className="relative mx-auto max-w-7xl px-8 py-14">
          <div className="section-label mb-4">2026 Seizoen · Grid Overzicht</div>
          <h1 className="mb-3 font-display text-5xl font-black uppercase leading-none tracking-wide">
            De Coureurs
          </h1>
          <p className="max-w-lg font-body text-base text-text-secondary">
            Elke rijder van F1, MotoGP en WorldSBK op een rij. Klik op een coureur voor het volledige
            profiel inclusief auto/motor-specs en actuele kampioenschapsstand.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex items-center gap-2 rounded-full px-4 py-2 font-body text-sm font-semibold uppercase tracking-wider transition-all duration-200"
              style={
                filter === f.key
                  ? { background: f.kleur, color: '#fff', border: `1px solid ${f.kleur}` }
                  : { background: 'rgba(255,255,255,0.03)', color: '#888', border: '1px solid #222' }
              }
            >
              {f.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-[12px] font-bold"
                style={{ background: filter === f.key ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.06)' }}
              >
                {aantal(f.key)}
              </span>
            </button>
          ))}
        </div>

        {gefilterd.length === 0 ? (
          <div className="rounded-2xl border border-line py-24 text-center font-body text-base text-text-dim">
            Nog geen coureurs beschikbaar voor deze serie.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {gefilterd.map((coureur) => (
              <CoureurCard key={`${coureur.series}-${coureur.id}`} coureur={coureur} onClick={() => setGeselecteerd(coureur)} />
            ))}
          </div>
        )}
      </div>

      {geselecteerd && <CoureurModal coureur={geselecteerd} onClose={() => setGeselecteerd(null)} />}
    </div>
  )
}
