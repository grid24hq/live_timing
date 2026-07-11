import { Ruler, CornerDownRight, CalendarDays, Flag as FlagIcon, Timer, Zap, Users } from 'lucide-react'
import type { F1Circuit } from '../types/circuit'
import { flagEmoji } from '../lib/flag'

interface Props {
  circuit: F1Circuit
}

export default function CircuitCard({ circuit }: Props) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-red-500/25 bg-[#0b0d13]/70 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-red-500/60 hover:shadow-red-950/40">
      {/* CIRCUIT-TEKENING */}
      <div className="relative aspect-video w-full overflow-hidden bg-white">
        <img
          src={circuit.afbeelding}
          alt={circuit.naam}
          className="h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => { e.currentTarget.style.opacity = '0' }}
        />

        {/* Vlag rechtsboven — donker chipje zodat het altijd contrasteert, ook tegen lichte tekeningen */}
        <div className="absolute right-3 top-3 flex h-7 min-w-[2.5rem] items-center justify-center gap-1 rounded-md border border-white/15 bg-black/70 px-2 text-sm font-bold text-white shadow backdrop-blur-sm">
          <span>{flagEmoji(circuit.countryCode)}</span>
        </div>

        {/* Naam + locatie overlay onderin, over de tekening */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-3 pt-10"
          style={{ background: 'linear-gradient(to top, rgba(5,6,8,0.92) 10%, transparent 100%)' }}
        >
          <h3 className="font-display text-lg font-black uppercase leading-tight text-white drop-shadow">
            {circuit.kortenaam}
          </h3>
          <p className="font-mono text-xs font-medium text-gray-300">
            {circuit.stad}, {circuit.land}
          </p>
        </div>
      </div>

      {/* INHOUD */}
      <div className="flex flex-1 flex-col p-4">
        <h4 className="mb-3 font-mono text-sm font-bold uppercase tracking-wide text-gray-200">
          {circuit.naam}
        </h4>

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

        {/* TAGS */}
        {circuit.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {circuit.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-red-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* BESCHRIJVING */}
        <p className="mb-3 line-clamp-3 font-body text-xs leading-relaxed text-gray-400">
          {circuit.beschrijving}
        </p>

        {/* RECORDS — Lap Record (zondag-race) en All-Time Track Record (kwalificatie) zijn
            officieel twee verschillende dingen en worden dus nooit door elkaar getoond.
            Ontbreekt een tijd nog (bv. Madrid, nieuw circuit)? Dan tonen we 'N.T.B.'
            i.p.v. het blok stil te verbergen. */}
        <div className="mt-auto space-y-2 border-t border-gray-900 pt-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 flex-shrink-0 text-red-500" />
            <div>
              <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-gray-500">
                Lap Record <span className="text-gray-600">(Race)</span>
              </span>
              {circuit.record_tijd ? (
                <>
                  <span className="font-mono text-sm font-black tabular-nums text-white">{circuit.record_tijd}</span>
                  {circuit.record_rijder && (
                    <span className="ml-2 font-mono text-[11px] text-gray-500">
                      {circuit.record_rijder} {circuit.record_jaar ? `(${circuit.record_jaar})` : ''}
                    </span>
                  )}
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
                  {circuit.track_record_rijder && (
                    <span className="ml-2 font-mono text-[11px] text-gray-500">
                      {circuit.track_record_rijder} {circuit.track_record_jaar ? `(${circuit.track_record_jaar})` : ''}
                    </span>
                  )}
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
