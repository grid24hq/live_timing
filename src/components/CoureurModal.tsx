import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import {
  Calendar, MapPin, Ruler, Flag, Trophy, Cog, Wrench, Car, Disc,
  Medal, Zap, Timer as TimerIcon, BarChart3, X,
} from 'lucide-react'
import type { Coureur } from '../types/coureur'
import { SERIES_CONFIG } from '../lib/seriesConfig'
import { flagEmoji } from '../lib/flag'

type IconType = ComponentType<{ className?: string; style?: React.CSSProperties }>

const toCalendarSeries = (s: Coureur['series']) => (s === 'sbk' ? 'worldsbk' : s) as 'f1' | 'motogp' | 'worldsbk'

// ─── Kleuren: net als de oude site — per F1-team, per motor-merk voor motogp/sbk ──
const F1_TEAM_KLEUREN: { match: string; kleur: string }[] = [
  { match: 'Red Bull Racing', kleur: '#3671c6' },
  { match: 'Racing Bulls', kleur: '#6692ff' },
  { match: 'Ferrari', kleur: '#e8002d' },
  { match: 'Mercedes', kleur: '#27f4d2' },
  { match: 'McLaren', kleur: '#ff8000' },
  { match: 'Aston Martin', kleur: '#229971' },
  { match: 'Alpine', kleur: '#0093cc' },
  { match: 'Williams', kleur: '#64c4ff' },
  { match: 'Audi', kleur: '#bb0a14' },
  { match: 'Haas', kleur: '#b6babd' },
  { match: 'Cadillac', kleur: '#cc0000' },
]

const MERK_KLEUREN: Record<string, string> = {
  Ducati: '#cc0000', Aprilia: '#1a1aff', KTM: '#ff6600', Yamaha: '#0033cc',
  Honda: '#cc0000', BMW: '#1c69d4', Kawasaki: '#2d8a00', Triumph: '#003399',
}

function getKleur(coureur: Coureur): string {
  if (coureur.series === 'f1') {
    const hit = F1_TEAM_KLEUREN.find((t) => coureur.team.includes(t.match))
    return hit?.kleur ?? SERIES_CONFIG.f1.hex
  }
  const merk = coureur.engine?.split(' ')[0] ?? ''
  return MERK_KLEUREN[merk] ?? SERIES_CONFIG[coureur.series === 'sbk' ? 'worldsbk' : 'motogp'].hex
}

type Tab = 'overzicht' | 'voertuig' | 'stats'

interface Standing {
  pos: number
  naam: string
  team: string
  punten: number
}

interface F1Stats {
  races: number
  wins: number
  podiums: number
  poles: number
  punten: number
}

// Jolpica (opvolger van de Ergast API) is gratis en heeft geen key nodig.
// Er is geen vergelijkbare gratis live-API voor MotoGP/WorldSBK, dus daar
// tonen we een nette placeholder i.p.v. verzonnen cijfers.
async function fetchF1Standings(): Promise<Standing[]> {
  try {
    const r = await fetch('https://api.jolpi.ca/ergast/f1/current/driverstandings.json')
    const d = await r.json()
    const lijst = d?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []
    return lijst.slice(0, 5).map((s: any) => ({
      pos: parseInt(s.position),
      naam: s.Driver.familyName,
      team: s.Constructors?.[0]?.name ?? '',
      punten: parseFloat(s.points),
    }))
  } catch {
    return []
  }
}

// Jolpica coureur-ids wijken soms af van onze eigen "id" (bv. Verstappen).
const JOLPICA_ID: Record<string, string> = {
  verstappen: 'max_verstappen', norris: 'norris', piastri: 'piastri', leclerc: 'leclerc',
  hamilton: 'hamilton', russell: 'russell', alonso: 'alonso', sainz: 'sainz', gasly: 'gasly',
  albon: 'albon', ocon: 'ocon', hulkenberg: 'hulkenberg', bottas: 'bottas', stroll: 'stroll',
  lawson: 'lawson', perez: 'perez', hadjar: 'hadjar', antonelli: 'antonelli', bearman: 'bearman',
  bortoleto: 'bortoleto', colapinto: 'colapinto',
}

async function fetchF1DriverStats(jolpicaId: string): Promise<F1Stats | null> {
  try {
    const r = await fetch(`https://api.jolpi.ca/ergast/f1/current/drivers/${jolpicaId}/results.json?limit=100`)
    const d = await r.json()
    const races = d?.MRData?.RaceTable?.Races ?? []
    let wins = 0
    let podiums = 0
    let punten = 0
    races.forEach((race: any) => {
      const res = race.Results?.[0]
      if (!res) return
      const pos = parseInt(res.position)
      if (pos === 1) wins++
      if (pos <= 3) podiums++
      punten += parseFloat(res.points ?? '0')
    })
    return { races: races.length, wins, podiums, poles: 0, punten }
  } catch {
    return null
  }
}

interface Props {
  coureur: Coureur
  onClose: () => void
}

export default function CoureurModal({ coureur, onClose }: Props) {
  const kleur = getKleur(coureur)
  const seriesLabel = SERIES_CONFIG[toCalendarSeries(coureur.series)].label
  const voertuigLabel = coureur.series === 'f1' ? 'Auto' : 'Motor'

  // Badge: bij F1 het eerste woord van de teamnaam (zoals de oude site),
  // bij motogp/sbk gewoon het serielabel.
  const badgeTekst = coureur.series === 'f1' ? coureur.team.split(' ')[0] : seriesLabel

  const [voornaam, ...restNaam] = coureur.name.split(' ')
  const achternaam = restNaam.join(' ').toUpperCase()

  const [tab, setTab] = useState<Tab>('overzicht')
  const [standings, setStandings] = useState<Standing[]>([])
  const [stats, setStats] = useState<F1Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (coureur.series !== 'f1') return
    fetchF1Standings().then(setStandings)
  }, [coureur.series])

  useEffect(() => {
    if (coureur.series !== 'f1' || tab !== 'stats') return
    const jid = JOLPICA_ID[coureur.id]
    if (!jid) return
    setStatsLoading(true)
    fetchF1DriverStats(jid).then((s) => {
      setStats(s)
      setStatsLoading(false)
    })
  }, [tab, coureur.series, coureur.id])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overzicht', label: 'Overzicht' },
    { id: 'voertuig', label: voertuigLabel },
    { id: 'stats', label: 'Statistieken' },
  ]

  const debuutLabel = coureur.series === 'f1' ? 'Debuut' : `Debuut ${seriesLabel}`
  const infoRows = [
    { icon: Calendar, label: 'Geboortedatum', val: coureur.birthDate ? `${coureur.birthDate}${coureur.age ? ` (${coureur.age})` : ''}` : undefined },
    { icon: MapPin, label: 'Geboorteplaats', val: coureur.birthPlace },
    { icon: Ruler, label: 'Lengte', val: coureur.height },
    { icon: Flag, label: debuutLabel, val: coureur.debut },
    { icon: Trophy, label: 'Wereldtitels', val: coureur.worldTitles !== undefined ? String(coureur.worldTitles) : undefined },
  ].filter((r) => Boolean(r.val)) as { icon: IconType; label: string; val: string }[]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm animate-[modalBackdropIn_0.18s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border md:flex-row animate-[modalPanelIn_0.25s_cubic-bezier(0.16,1,0.3,1)]"
        style={{ borderColor: `${kleur}50`, background: '#0f0f0f', maxHeight: '90vh', minHeight: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Linker paneel: foto + persoonlijke info ── */}
        <div
          className="flex flex-shrink-0 flex-col overflow-y-auto no-scrollbar md:w-[240px]"
          style={{ background: `linear-gradient(180deg, ${kleur}22 0%, #0a0a0a 60%)`, maxHeight: '90vh' }}
        >
          <div className="flex-shrink-0 px-5 pb-1 pt-4">
            <span className="font-body text-[12px] font-bold uppercase tracking-[2px]" style={{ color: kleur }}>
              {coureur.team || 'Team nog niet ingevuld'}
            </span>
          </div>

          <div className="flex-shrink-0 px-5 pb-2">
            <div className="font-body text-base text-text-secondary">{voornaam}</div>
            <div className="font-display text-3xl font-black uppercase leading-tight text-text-primary">{achternaam}</div>
            <div className="mt-1 flex items-center gap-2">
              <FlagIcon countryCode={coureur.countryCode} />
              {coureur.countryCode && (
                <span className="font-body text-sm uppercase text-text-secondary">{coureur.countryCode}</span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="rounded px-2 py-1 font-body text-[12px] font-bold uppercase"
                style={{ background: `${kleur}22`, color: kleur, border: `1px solid ${kleur}44` }}
              >
                {badgeTekst}
              </span>
              {coureur.series === 'sbk' && (
                <div
                  className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full"
                  style={{ background: '#1a1a1a', border: `1px solid ${kleur}33` }}
                >
                  <img src={coureur.helmet} alt="Helm" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Grote coureurfoto */}
          <div className="relative mx-3 flex-shrink-0 overflow-hidden rounded-xl" style={{ height: 260 }}>
            <img
              src={coureur.photo}
              alt={coureur.name}
              className="h-full w-full object-cover object-top"
              onError={(e) => (e.currentTarget.style.opacity = '0')}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
              style={{ background: 'linear-gradient(transparent, #0a0a0a)' }}
            />
            {coureur.number !== undefined && (
              <div
                className="absolute bottom-2 right-3 font-display text-5xl font-black leading-none"
                style={{ color: kleur, opacity: 0.4 }}
              >
                {coureur.number}
              </div>
            )}
          </div>

          {infoRows.length > 0 && (
            <div className="flex-shrink-0 space-y-3 px-4 py-4">
              {infoRows.map((r) => (
                <div key={r.label} className="flex items-start gap-2.5">
                  <r.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-dim" />
                  <div>
                    <div className="font-body text-[11px] uppercase tracking-wider text-text-dim">{r.label}</div>
                    <div className="font-body text-sm text-text-secondary">{r.val}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Rechter paneel: tabs + inhoud ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-shrink-0 items-center justify-between px-6 pt-5" style={{ borderBottom: `1px solid ${kleur}25` }}>
            <div className="flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="rounded-t px-4 py-2.5 font-body text-sm font-bold uppercase tracking-wider outline-none transition-all focus-visible:ring-2"
                  style={
                    tab === t.id
                      ? ({ color: kleur, borderBottom: `2px solid ${kleur}`, '--tw-ring-color': `${kleur}60` } as React.CSSProperties)
                      : ({ color: 'var(--color-text-dim)', borderBottom: '2px solid transparent', '--tw-ring-color': `${kleur}60` } as React.CSSProperties)
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
              aria-label="Sluiten"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {tab === 'overzicht' && <OverzichtTab coureur={coureur} kleur={kleur} standings={standings} />}
            {tab === 'voertuig' && <VoertuigTab coureur={coureur} kleur={kleur} label={voertuigLabel} />}
            {tab === 'stats' && (
              <StatsTab coureur={coureur} kleur={kleur} standings={standings} stats={stats} loading={statsLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Kleine bouwstenen ─────────────────────────────────────────────────────

function FlagIcon({ countryCode }: { countryCode?: string }) {
  const [error, setError] = useState(false)
  if (!countryCode) return null
  if (error) {
    const emoji = flagEmoji(countryCode)
    return emoji ? <span className="text-base leading-none">{emoji}</span> : null
  }
  return (
    <img
      src={`/vlaggen/${countryCode}.webp`}
      alt={countryCode}
      className="h-4 w-6 rounded-sm object-cover shadow-sm"
      onError={() => setError(true)}
    />
  )
}

function SectionLabel({ kleur, children }: { kleur: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="h-0.5 w-4 rounded-full" style={{ background: kleur }} />
      <span className="font-body text-[12px] uppercase tracking-[2px] text-text-dim">{children}</span>
    </div>
  )
}

function InfoTile({ icon: Icon, label, val, flag }: { icon?: IconType; label: string; val: string; flag?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
      {Icon && <Icon className="h-5 w-5 flex-shrink-0 text-text-dim" />}
      {flag && <FlagIcon countryCode={flag} />}
      <div className="min-w-0">
        <div className="font-body text-[11px] uppercase tracking-wider text-text-dim">{label}</div>
        <div className="truncate font-body text-base font-semibold text-text-primary">{val}</div>
      </div>
    </div>
  )
}

function StandingsTable({ standings, kleur }: { standings: Standing[]; kleur: string }) {
  if (standings.length === 0) return null
  return (
    <div>
      <SectionLabel kleur={kleur}>Kampioenschapsstand 2026</SectionLabel>
      <div className="overflow-hidden rounded-xl border border-white/10">
        {standings.map((s, i) => (
          <div
            key={s.pos}
            className="flex items-center gap-3 px-4 py-2.5"
            style={{
              background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
              borderBottom: i < standings.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <span
              className="w-5 text-center font-display text-base font-black"
              style={{ color: i === 0 ? '#fbbf24' : 'var(--color-text-dim)' }}
            >
              {s.pos}
            </span>
            <span className="flex-1 truncate font-body text-sm text-text-secondary">{s.naam}</span>
            <span className="truncate font-body text-[12px] text-text-dim">{s.team}</span>
            <span className="font-display text-base font-black" style={{ color: kleur }}>
              {s.punten}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function OmschrijvingBlok({ tekst }: { tekst?: string }) {
  if (!tekst) return null
  return (
    <div className="max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="whitespace-pre-line font-body text-base leading-relaxed text-text-secondary">{tekst}</p>
    </div>
  )
}

// ─── Tab: Overzicht ─────────────────────────────────────────────────────────

function OverzichtTab({ coureur, kleur, standings }: { coureur: Coureur; kleur: string; standings: Standing[] }) {
  const vehicleLabel = coureur.series === 'f1' ? (coureur.carModel ?? 'Auto') : (coureur.bikeModel ?? 'Motor')
  const omschrijving = coureur.series === 'f1' ? coureur.carDescription : coureur.bikeDescription

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <InfoTile label="Team" val={coureur.team || 'Nog niet ingevuld'} />
        <InfoTile label="Racenummer" val={coureur.number !== undefined ? `#${coureur.number}` : '—'} />
        <InfoTile label="Nationaliteit" val={coureur.countryCode ? coureur.countryCode.toUpperCase() : '—'} flag={coureur.countryCode} />
      </div>

      <div>
        <SectionLabel kleur={kleur}>
          {vehicleLabel} · 2026 {coureur.series === 'f1' ? 'Car' : 'Motor'}
        </SectionLabel>

        {coureur.series === 'f1' ? (
          <div
            className="flex items-center justify-center rounded-xl p-4"
            style={{ background: `linear-gradient(135deg, ${kleur}12, rgba(255,255,255,0.02))`, border: `1px solid ${kleur}25`, height: 120 }}
          >
            <img src={coureur.carImage} alt={vehicleLabel} className="h-full w-full object-contain" style={{ filter: `drop-shadow(0 4px 16px ${kleur}50)` }} />
          </div>
        ) : (
          <div
            className="flex items-center justify-center gap-2 overflow-hidden rounded-xl p-4"
            style={{ background: `linear-gradient(135deg, ${kleur}12, rgba(255,255,255,0.02))`, border: `1px solid ${kleur}25`, minHeight: 200 }}
          >
            <div style={{ width: '38%', height: 180 }}>
              <img src={coureur.bikeFront} alt="Motor vooraanzicht" className="h-full w-full object-contain" style={{ filter: `drop-shadow(0 4px 12px ${kleur}50)` }} />
            </div>
            <div style={{ width: '58%', height: 180 }}>
              <img src={coureur.bikeSide} alt="Motor zijaanzicht" className="h-full w-full object-contain" style={{ filter: `drop-shadow(0 4px 12px ${kleur}50)` }} />
            </div>
          </div>
        )}
      </div>

      <OmschrijvingBlok tekst={omschrijving} />

      <StandingsTable standings={standings} kleur={kleur} />
    </div>
  )
}

// ─── Tab: Auto / Motor ──────────────────────────────────────────────────────

function VoertuigTab({ coureur, kleur, label }: { coureur: Coureur; kleur: string; label: string }) {
  if (coureur.series === 'f1') {
    const specs = [
      { icon: Cog, label: 'Motor', val: coureur.engine ?? '—' },
      { icon: Wrench, label: 'Chassis', val: coureur.chassis ?? '—' },
      { icon: Car, label: 'Aandrijving', val: 'Achterwielaandrijving' },
      { icon: Disc, label: 'Banden', val: coureur.tires ?? '—' },
    ]
    return (
      <div className="space-y-4">
        <div>
          <div className="mb-0.5 font-display text-2xl font-black text-text-primary">{coureur.carModel ?? label}</div>
          <div className="font-body text-sm uppercase tracking-wider text-text-dim">2026 Seizoen</div>
        </div>
        <div
          className="flex items-center justify-center rounded-2xl p-6"
          style={{ background: `linear-gradient(135deg, ${kleur}15, rgba(255,255,255,0.02))`, border: `1px solid ${kleur}30`, height: 160 }}
        >
          <img src={coureur.carImage} alt={coureur.carModel ?? 'Auto'} className="h-full w-full object-contain" style={{ filter: `drop-shadow(0 6px 20px ${kleur}60)` }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {specs.map((s) => (
            <InfoTile key={s.label} icon={s.icon} label={s.label} val={s.val} />
          ))}
        </div>
        <OmschrijvingBlok tekst={coureur.carDescription} />
      </div>
    )
  }

  if (coureur.series === 'motogp') {
    const specs = [
      { icon: Cog, label: 'Motor', val: coureur.engine ?? '—' },
      { icon: Wrench, label: 'Klasse', val: 'MotoGP' },
      { icon: Disc, label: 'Banden', val: 'Michelin' },
      { icon: Flag, label: 'Team', val: coureur.team || '—' },
    ]
    return (
      <div className="space-y-4">
        <div>
          <div className="mb-0.5 font-display text-2xl font-black text-text-primary">{coureur.bikeModel ?? label}</div>
          <div className="font-body text-sm uppercase tracking-wider text-text-dim">2026 · MotoGP</div>
        </div>
        <div
          className="flex items-center justify-center rounded-2xl p-5"
          style={{ background: `linear-gradient(135deg, ${kleur}15, rgba(255,255,255,0.02))`, border: `1px solid ${kleur}30`, height: 210 }}
        >
          <img src={coureur.bikeSide} alt={coureur.bikeModel ?? 'Motor'} className="h-full w-full object-contain" style={{ filter: `drop-shadow(0 8px 24px ${kleur}60)` }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {specs.map((s) => (
            <InfoTile key={s.label} icon={s.icon} label={s.label} val={s.val} />
          ))}
        </div>
        <OmschrijvingBlok tekst={coureur.bikeDescription} />
      </div>
    )
  }

  // sbk
  const specs = [
    { icon: Cog, label: 'Motor', val: coureur.engine ?? '—' },
    { icon: Wrench, label: 'Klasse', val: 'WorldSBK' },
    { icon: Disc, label: 'Banden', val: 'Pirelli' },
    { icon: Flag, label: 'Team', val: coureur.team || '—' },
  ]
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-0.5 font-display text-2xl font-black text-text-primary">{coureur.bikeModel ?? label}</div>
        <div className="font-body text-sm uppercase tracking-wider text-text-dim">2026 · WorldSBK</div>
      </div>
      <div className="flex gap-3">
        <div
          className="flex flex-1 items-center justify-center rounded-2xl p-5"
          style={{ background: `linear-gradient(135deg, ${kleur}15, rgba(255,255,255,0.02))`, border: `1px solid ${kleur}30`, height: 210 }}
        >
          <img src={coureur.bike45} alt="Motor 45 graden" className="h-full w-full object-contain" style={{ filter: `drop-shadow(0 8px 24px ${kleur}60)` }} />
        </div>
        <div
          className="flex flex-shrink-0 items-center justify-center rounded-2xl p-3"
          style={{ width: 130, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', height: 210 }}
        >
          <img src={coureur.helmet} alt="Helm" className="h-full w-full object-contain" style={{ filter: `drop-shadow(0 4px 12px ${kleur}40)` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {specs.map((s) => (
          <InfoTile key={s.label} icon={s.icon} label={s.label} val={s.val} />
        ))}
      </div>
      <OmschrijvingBlok tekst={coureur.bikeDescription} />
    </div>
  )
}

// ─── Tab: Statistieken ──────────────────────────────────────────────────────

function StatsTab({
  coureur,
  kleur,
  standings,
  stats,
  loading,
}: {
  coureur: Coureur
  kleur: string
  standings: Standing[]
  stats: F1Stats | null
  loading: boolean
}) {
  if (coureur.series !== 'f1') {
    return (
      <div className="space-y-4">
        <SectionLabel kleur={kleur}>Seizoenstatistieken 2026</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flag, label: 'Races' },
            { icon: Trophy, label: 'Overwinningen' },
            { icon: Medal, label: 'Podiums' },
            { icon: Zap, label: 'Poles' },
            { icon: TimerIcon, label: 'Snelste ronde' },
            { icon: BarChart3, label: 'Punten' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <s.icon className="mx-auto mb-1 h-5 w-5 text-text-dim" />
              <div className="font-display text-2xl font-black" style={{ color: kleur }}>
                —
              </div>
              <div className="mt-1 font-body text-[11px] uppercase tracking-wider text-text-dim">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
          <TimerIcon className="h-4 w-4 flex-shrink-0 text-text-dim" />
          <p className="font-body text-sm text-text-dim">
            Live statistieken worden beschikbaar via het Command Center zodra het seizoen loopt.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SectionLabel kleur={kleur}>Seizoenstatistieken 2026</SectionLabel>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10" style={{ borderTopColor: kleur }} />
          <span className="font-body text-base text-text-dim">Statistieken laden...</span>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flag, label: 'Races', val: stats.races },
            { icon: Trophy, label: 'Overwinningen', val: stats.wins },
            { icon: Medal, label: 'Podiums', val: stats.podiums },
            { icon: Zap, label: 'Poles', val: stats.poles },
            { icon: TimerIcon, label: 'Snelste rondes', val: '—' },
            { icon: BarChart3, label: 'Punten', val: stats.punten },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <s.icon className="mx-auto mb-1 h-5 w-5 text-text-dim" />
              <div className="font-display text-2xl font-black" style={{ color: kleur }}>
                {s.val}
              </div>
              <div className="mt-1 font-body text-[11px] uppercase tracking-wider text-text-dim">{s.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 py-8 text-center">
          <p className="font-body text-base text-text-dim">Nog geen statistieken beschikbaar voor dit seizoen.</p>
        </div>
      )}

      <StandingsTable standings={standings} kleur={kleur} />
    </div>
  )
}
