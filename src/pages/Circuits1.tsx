import { useState } from 'react'
import { F1_CIRCUITS } from '../data/f1Circuits'
import { MOTOGP_CIRCUITS } from '../data/motogpCircuits'
import { MOTO2_CIRCUITS } from '../data/moto2Circuits'
import { MOTO3_CIRCUITS } from '../data/moto3Circuits'
import CircuitCard from '../components/CircuitCard'
import MotoCircuitCard from '../components/MotoCircuitCard'

type SerieTab = 'f1' | 'motogp' | 'moto2' | 'moto3'

const TABS: { key: SerieTab; label: string; accent: string }[] = [
  { key: 'f1', label: 'Formula 1', accent: '#ef4444' },
  { key: 'motogp', label: 'MotoGP', accent: '#FF5F1F' },
  { key: 'moto2', label: 'Moto2', accent: '#CCFF00' },
  { key: 'moto3', label: 'Moto3', accent: '#39FF14' },
]

export default function Circuits() {
  const [tab, setTab] = useState<SerieTab>('f1')
  const actief = TABS.find((t) => t.key === tab)!

  return (
    <div className="min-h-screen bg-[#060709] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/10 via-[#060709] to-[#040507] text-gray-250 select-none">
      {/* HERO */}
      <div className="relative overflow-hidden border-b border-gray-900/60">
        <div
          className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none font-mono text-[160px] font-black leading-none text-white/[0.06]"
          aria-hidden="true"
        >
          {tab.toUpperCase()}
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-12 md:px-12">
          <div className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-gray-500">
            2026 Seizoen · Circuit Database
          </div>
          <h1 className="mb-3 font-mono text-4xl font-black uppercase leading-none tracking-wide text-white md:text-5xl">
            {actief.label} <span style={{ color: actief.accent }}>Circuits</span>
          </h1>
          <p className="max-w-xl font-body text-sm text-gray-400 md:text-base">
            Alle banen van het {actief.label}-kalenderjaar op een rij — lengte, aantal bochten, geschiedenis en het
            actuele ronderecord van elk circuit.
          </p>
        </div>
      </div>

      {/* SERIETABS */}
      <div className="border-b border-gray-900/60 bg-black/20">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 md:px-12">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="relative px-5 py-4 font-mono text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors"
              style={{ color: tab === t.key ? t.accent : '#6b7280' }}
            >
              {t.label}
              {tab === t.key && (
                <span
                  className="absolute inset-x-0 bottom-0 h-[2px]"
                  style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}` }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12">
        {tab === 'f1' && (
          F1_CIRCUITS.length === 0 ? (
            <LegeState />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {F1_CIRCUITS.map((circuit) => (
                <CircuitCard key={circuit.id} circuit={circuit} />
              ))}
            </div>
          )
        )}

        {tab === 'motogp' && (
          MOTOGP_CIRCUITS.length === 0 ? (
            <LegeState />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {MOTOGP_CIRCUITS.map((circuit) => (
                <MotoCircuitCard key={circuit.id} circuit={circuit} accentKleur="#FF5F1F" />
              ))}
            </div>
          )
        )}

        {tab === 'moto2' && (
          MOTO2_CIRCUITS.length === 0 ? (
            <LegeState />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {MOTO2_CIRCUITS.map((circuit) => (
                <MotoCircuitCard key={circuit.id} circuit={circuit} accentKleur="#CCFF00" />
              ))}
            </div>
          )
        )}

        {tab === 'moto3' && (
          MOTO3_CIRCUITS.length === 0 ? (
            <LegeState />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {MOTO3_CIRCUITS.map((circuit) => (
                <MotoCircuitCard key={circuit.id} circuit={circuit} accentKleur="#39FF14" />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function LegeState() {
  return (
    <div className="rounded-2xl border border-gray-900 py-24 text-center font-mono text-sm text-gray-600">
      Nog geen circuits toegevoegd.
    </div>
  )
}
