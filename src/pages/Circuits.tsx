import { F1_CIRCUITS } from '../data/f1Circuits'
import CircuitCard from '../components/CircuitCard'

export default function Circuits() {
  return (
    <div className="min-h-screen bg-[#060709] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/10 via-[#060709] to-[#040507] text-gray-250 select-none">
      {/* HERO */}
      <div className="relative overflow-hidden border-b border-gray-900/60">
        <div
          className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none font-mono text-[160px] font-black leading-none text-white/[0.06]"
          aria-hidden="true"
        >
          F1
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-12 md:px-12">
          <div className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-gray-500">
            2026 Seizoen · Circuit Database
          </div>
          <h1 className="mb-3 font-mono text-4xl font-black uppercase leading-none tracking-wide text-white md:text-5xl">
            Formula 1 <span className="text-red-500">Circuits</span>
          </h1>
          <p className="max-w-xl font-body text-sm text-gray-400 md:text-base">
            Alle banen van het Formule 1-kalenderjaar op een rij — lengte, aantal bochten, geschiedenis en het
            actuele ronderecord van elk circuit.
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12">
        {F1_CIRCUITS.length === 0 ? (
          <div className="rounded-2xl border border-gray-900 py-24 text-center font-mono text-sm text-gray-600">
            Nog geen circuits toegevoegd.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {F1_CIRCUITS.map((circuit) => (
              <CircuitCard key={circuit.id} circuit={circuit} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
