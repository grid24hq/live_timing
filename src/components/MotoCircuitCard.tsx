import { Ruler, CornerDownRight, CalendarDays, Flag as FlagIcon, Timer, Zap, Users } from 'lucide-react'
import type { MotoCircuit } from '../types/motoCircuit'
import { flagSrc } from '../lib/flag'

interface Props {
  circuit: MotoCircuit
  accentKleur: string // per serie: MotoGP #FF5F1F, Moto2 #CCFF00, Moto3 #39FF14
}

export default function MotoCircuitCard({ circuit, accentKleur }: Props) {
  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border bg-[#0b0d13]/70 shadow-2xl transition-all duration-300 hover:-translate-y-1"
      style={{ borderColor: `${accentKleur}30` }}
    >
      {/* CIRCUIT-TEKENING — donkere achtergrond, want de tekeningen zelf zijn gekleurde lijnen */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#050608]">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at center, ${accentKleur}, transparent 70%)` }}
        />
        <img
          src={circuit.afbeelding}
          alt={circuit.naam}
          className="relative h-full w-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => { e.currentTarget.style.opacity = '0' }}
        />

        <div className="absolute right-3 top-3 h-6 w-9 overflow-hidden rounded-md border border-white/15 shadow">
          <img
            src={flagSrc(circuit.countryCode)}
            alt={circuit.countryCode}
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
          />
        </div>
      </div>

      {/* Naam + locatie — onder de tekening, niet er overheen */}
      <div className="border-b border-gray-900 bg-[#0b0d13] px-4 pb-3 pt-3" style={{ borderBottomColor: `${accentKleur}20` }}>
        <h3 className="font-display text-lg font-black uppercase leading-tight text-white">
          {circuit.naam}
        </h3>
        <p className="font-mono text-xs font-medium text-gray-400">{circuit.land}</p>
      </div>

      {/* INHOUD */}
      <div className="flex flex-1 flex-col p-4">
        {/* STATS GRID */}
        <div className="mb-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-gray-900 bg-black/20 p-2.5">
            <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-gray-500">
              <Ruler className="h-3 w-3" /> Length
            </span>
            <span className="font-mono text-base font-black text-white">{circuit.lengte_km.toFixed(3)} km</span>
          </div>
          <div className="rounded-lg border border-gray-900 bg-black/20 p-2.5">
            <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-gray-500">
              <CornerDownRight className="h-3 w-3" /> Corners
            </span>
            <span className="font-mono text-base font-black text-white">{circuit.bochten}</span>
          </div>
          <div className="rounded-lg border border-gray-900 bg-black/20 p-2.5">
            <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-gray-500">
              <CalendarDays className="h-3 w-3" /> First GP
            </span>
            <span className="font-mono text-base font-black text-white">{circuit.eerste_gp}</span>
          </div>
          <div className="rounded-lg border border-gray-900 bg-black/20 p-2.5">
            <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-gray-500">
              <FlagIcon className="h-3 w-3" /> Races
            </span>
            <span className="font-mono text-base font-black text-white">{circuit.aantal_races ?? '—'}</span>
          </div>
          {circuit.capaciteit !== undefined && (
            <div className="col-span-2 rounded-lg border border-gray-900 bg-black/20 p-2.5">
              <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-gray-500">
                <Users className="h-3 w-3" /> Capacity
              </span>
              <span className="font-mono text-base font-black text-white">
                {circuit.capaciteit.toLocaleString('nl-NL')} toeschouwers
              </span>
            </div>
          )}
        </div>

        {circuit.opmerking && (
          <p className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-2 font-mono text-[10px] leading-relaxed text-amber-400/90">
            {circuit.opmerking}
          </p>
        )}

        {/* RECORDS */}
        <div className="mt-auto space-y-2 border-t border-gray-900 pt-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 flex-shrink-0" style={{ color: accentKleur }} />
            <div>
              <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-gray-500">
                Lap Record <span className="text-gray-600">(Race)</span>
              </span>
              {circuit.record_tijd ? (
                <>
                  <span className="font-mono text-sm font-black tabular-nums text-white">{circuit.record_tijd}</span>
                  <span className="ml-2 font-mono text-[11px] text-gray-500">
                    {circuit.record_rijder} {circuit.record_jaar ? `(${circuit.record_jaar})` : ''}
                  </span>
                </>
              ) : (
                <span className="font-mono text-sm font-black tracking-wide text-gray-500">N.T.B.</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 flex-shrink-0 text-amber-500" />
            <div>
              <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-gray-500">
                All-Time Track Record <span className="text-gray-600">(Quali)</span>
              </span>
              {circuit.track_record_tijd ? (
                <>
                  <span className="font-mono text-sm font-black tabular-nums text-white">{circuit.track_record_tijd}</span>
                  <span className="ml-2 font-mono text-[11px] text-gray-500">
                    {circuit.track_record_rijder} {circuit.track_record_jaar ? `(${circuit.track_record_jaar})` : ''}
                  </span>
                </>
              ) : (
                <span className="font-mono text-sm font-black tracking-wide text-gray-500">N.T.B.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
