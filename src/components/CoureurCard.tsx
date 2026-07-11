import { ArrowUpRight } from 'lucide-react'
import type { Coureur } from '../types/coureur'
import { SERIES_CONFIG } from '../lib/seriesConfig'

// De Coureur-pagina gebruikt 'sbk' als sleutel, terwijl de kalender 'worldsbk' gebruikt.
const toCalendarSeries = (s: Coureur['series']) => (s === 'sbk' ? 'worldsbk' : s) as 'f1' | 'motogp' | 'worldsbk'

interface Props {
  coureur: Coureur
  onClick: () => void
}

export default function CoureurCard({ coureur, onClick }: Props) {
  const kleur = SERIES_CONFIG[toCalendarSeries(coureur.series)].hex

  // Alle series hebben nu een rechtopstaande (portret) foto beschikbaar:
  // f1/sbk gebruiken 'photo', motogp heeft daarnaast een liggende 'photo'
  // (voor oude layouts) én een staande 'photoStanding' — die laatste
  // gebruiken we hier zodat elke kaart dezelfde, natuurlijke framing krijgt
  // zonder kunstmatig in/uit te hoeven zoomen per serie.
  const foto = coureur.series === 'motogp' ? (coureur.photoStanding ?? coureur.photo) : coureur.photo

  return (
    <button
      onClick={onClick}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 hover:-translate-y-1"
      style={{ borderColor: `${kleur}25`, background: '#0c0d10' }}
    >
      {/* Foto vult de hele kaart */}
      <img
        src={foto}
        alt={coureur.name}
        className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        onError={(e) => { e.currentTarget.style.opacity = '0' }}
      />

      {/* Leesbaarheids-gradient onderin */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{ background: 'linear-gradient(to top, #05060850 0%, #05060890 45%, transparent 100%)' }}
      />
      {/* Vage teamkleur-gloed, iets sterker on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1.5px ${kleur}90, inset 0 -80px 60px -30px ${kleur}40` }}
      />

      {/* Racenummer watermerk */}
      {coureur.number !== undefined && (
        <div
          className="absolute right-2 top-2 select-none font-display text-4xl font-black leading-none opacity-30 transition-opacity duration-300 group-hover:opacity-60"
          style={{ color: kleur, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          {coureur.number}
        </div>
      )}

      {/* Serie-badge linksboven */}
      <div
        className="absolute left-2 top-2 rounded px-1.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm"
        style={{ background: `${kleur}30`, color: kleur, border: `1px solid ${kleur}50` }}
      >
        {SERIES_CONFIG[toCalendarSeries(coureur.series)].label}
      </div>

      {/* Naam + team, over de foto */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <div className="min-w-0">
          <div className="truncate font-display text-base font-black uppercase leading-tight text-white drop-shadow">
            {coureur.name}
          </div>
          <div className="truncate font-body text-[12px] font-medium text-white/70">
            {coureur.team || 'Team TBC'}
          </div>
        </div>
        <ArrowUpRight
          className="h-4 w-4 flex-shrink-0 translate-x-1 text-white/40 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-white group-hover:opacity-100"
        />
      </div>
    </button>
  )
}
