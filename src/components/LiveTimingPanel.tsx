import { useState, useEffect, useRef, useCallback } from 'react'
import { getLiveTiming, getAlgemeenSessie } from '../lib/raceApi'
import type { TimingRow } from '../types/timing'
import { Thermometer, Flag, Droplet, Wind, CloudRain, Sun, Radio } from 'lucide-react'
import { useTelemetryStore } from '../store/useTelemetryStore'

const POLL_MS = 5_000

// ── Serie config ──────────────────────────────────────────────────────────────
const SERIE: Record<string, { k: string; bg: string }> = {
  F1: { k: '#e10600', bg: 'rgba(225,6,0,0.03)' },
  MotoGP: { k: '#f97316', bg: 'rgba(249,115,22,0.03)' },
  Moto2: { k: '#f97316', bg: 'rgba(249,115,22,0.03)' },
  Moto3: { k: '#f97316', bg: 'rgba(249,115,22,0.03)' },
  WorldSBK: { k: '#a855f7', bg: 'rgba(168,85,247,0.03)' },
}
const DEF = { k: '#e10600', bg: 'rgba(225,6,0,0.03)' }

// ── Tyre kleuren ──────────────────────────────────────────────────────────────
const TYRE: Record<string, [string, string]> = {
  soft: ['#e10600', 'S'], s: ['#e10600', 'S'],
  medium: ['#facc15', 'M'], m: ['#facc15', 'M'],
  hard: ['#f3f4f6', 'H'], h: ['#f3f4f6', 'H'],
  inter: ['#22c55e', 'I'], i: ['#22c55e', 'I'],
  wet: ['#3b82f6', 'W'], w: ['#3b82f6', 'W'],
}

function cfg(klasse: string) {
  return SERIE[klasse] ?? DEF
}

function TyreBadge({ tyre }: { tyre?: string }) {
  if (!tyre || tyre === '-') return <span className="text-xs text-gray-700 font-mono">—</span>
  const key = tyre.trim().toLowerCase()
  const [kleur, label] = TYRE[key] ?? TYRE[key.charAt(0)] ?? ['#6b7280', tyre.charAt(0).toUpperCase()]
  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black tracking-tighter"
      style={{ background: kleur + '15', color: kleur, border: `1px solid ${kleur}40` }}
    >
      {label}
    </span>
  )
}

function PosChange({ v }: { v: number }) {
  if (!v) return <span className="inline-block w-4 text-[9px] text-gray-700 font-mono text-center">—</span>
  return v > 0 ? (
    <span className="inline-block w-4 text-[9px] text-green-500 font-mono text-center">▲{v}</span>
  ) : (
    <span className="inline-block w-4 text-[9px] text-red-500 font-mono text-center">▼{Math.abs(v)}</span>
  )
}

function StatusBadge({ status }: { status?: string }) {
  if (!status || status === 'racing') return null
  const map: Record<string, [string, string]> = {
    pit: ['rgba(234,179,8,0.1)', '#eab308'],
    out: ['rgba(239,68,68,0.1)', '#ef4444'],
    dnf: ['rgba(239,68,68,0.1)', '#ef4444'],
    slow: ['rgba(59,130,246,0.1)', '#3b82f6'],
  }
  const [bg, col] = map[status.toLowerCase()] ?? ['rgba(156,163,175,0.1)', '#9ca3af']
  const labels: Record<string, string> = { pit: 'PIT', out: 'OUT', dnf: 'DNF', slow: 'SLOW' }
  return (
    <span
      className="ml-1.5 rounded px-1 py-0.5 text-[8px] font-black font-mono tracking-wider"
      style={{ background: bg, color: col, border: `1px solid ${col}30` }}
    >
      {labels[status.toLowerCase()] ?? status.toUpperCase()}
    </span>
  )
}

function Sector({ t, kleur }: { t?: string; kleur: string }) {
  if (!t || t === '-')
    return <span className="inline-block h-4 w-12 rounded bg-gray-900/40 border border-gray-950/50" />
  return (
    <span
      className="inline-flex h-4 min-w-[3rem] items-center justify-center rounded border font-mono text-[10px] font-bold tabular-nums"
      style={{ background: kleur + '08', color: kleur, borderColor: kleur + '20' }}
    >
      {t}
    </span>
  )
}

// ── Weer balk ─────────────────────────────────────────────────────────────────
interface Weer {
  lucht_temp?: string | number
  baan_temp?: string | number
  luchtvochtigheid?: string | number
  wind_speed?: string | number
  droog_nat?: string
  conditie?: string
  lucht?: string
  baan?: string
}

function WeerBalk({ w }: { w: Weer | null | undefined }) {
  if (!w) return null
  const lucht = w.lucht_temp ?? w.lucht ?? '—'
  const baan = w.baan_temp ?? w.baan ?? '—'
  const vocht = w.luchtvochtigheid ?? '—'
  const wind = w.wind_speed ?? '—'
  const cond = w.droog_nat ?? w.conditie ?? ''

  const items = [
    { icon: <Thermometer className="w-3 h-3 text-gray-500" />, lbl: 'AIR', val: lucht !== '—' ? `${lucht}°C` : '—' },
    { icon: <Flag className="w-3 h-3 text-gray-500" />, lbl: 'TRACK', val: baan !== '—' ? `${baan}°C` : '—' },
    { icon: <Droplet className="w-3 h-3 text-gray-500" />, lbl: 'HUM', val: vocht !== '—' ? `${vocht}%` : '—' },
    { icon: <Wind className="w-3 h-3 text-gray-500" />, lbl: 'WIND', val: wind !== '—' ? `${wind} m/s` : '—' },
    ...(cond ? [{ 
      icon: cond.toLowerCase().includes('wet') || cond.toLowerCase().includes('nat') 
        ? <CloudRain className="w-3 h-3 text-blue-400" /> 
        : <Sun className="w-3 h-3 text-yellow-400" />, 
      lbl: 'COND', 
      val: cond 
    }] : []),
  ]

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-gray-900 bg-black/30 px-5 py-2">
      {items.map(({ icon, lbl, val }) => (
        <div key={lbl} className="flex items-center gap-1.5">
          {icon}
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-gray-500">{lbl}</span>
          <span className="font-mono text-xs font-bold text-gray-300 tabular-nums">{val}</span>
        </div>
      ))}
    </div>
  )
}

interface AlgemeenSessie {
  status?: string
  sessie_naam?: string
  circuit?: string
  event?: string
  ronden_totaal?: number | string
  weer?: Weer
}

interface Props {
  sessionId: string
  klasse: string
  compact?: boolean
}

export default function LiveTimingPanel({ sessionId, klasse, compact = false }: Props) {
  const c = cfg(klasse)
  const isF1 = klasse === 'F1' // Telemetrie (speed/throttle/brake/rpm) is alleen beschikbaar voor F1 —
                                // MotoGP/Moto2/Moto3/WorldSBK-bronnen leveren geen sensordata.
  
  const openTelemetry = useTelemetryStore((state) => state.openTelemetry) 
  const [entries, setEntries] = useState<(TimingRow & { posChange: number; interval?: string })[]>([])
  const [sessie, setSessie] = useState<AlgemeenSessie | null>(null)
  const [loading, setLoading] = useState(true)
  const [updated, setUpdated] = useState<Date | null>(null)
  const [tab, setTab] = useState<'timing' | 'stints'>('timing')
  const [flash, setFlash] = useState<Set<string>>(new Set())

  const prevPos = useRef<Record<string, number>>({})
  const prevBest = useRef<Record<string, string>>({})

  const fetchSessie = useCallback(async () => {
    const s = await getAlgemeenSessie(sessionId)
    if (s) setSessie(s)
  }, [sessionId])

  const fetchTiming = useCallback(async () => {
    const data = await getLiveTiming(sessionId)
    const nieuweFlash = new Set<string>()

    const withMeta = data.map((e) => {
      const key = e.carNumber || e.name
      const prev = prevPos.current[key]
      const change = prev !== undefined ? prev - e.pos : 0
      if (prevBest.current[key] && prevBest.current[key] !== e.bestLap) nieuweFlash.add(key)
      return { ...e, posChange: change, interval: e.gap }
    })

    data.forEach((e) => {
      const key = e.carNumber || e.name
      prevPos.current[key] = e.pos
      prevBest.current[key] = e.bestLap
    })

    const gesorteerd = [...withMeta].sort((a, b) => a.pos - b.pos)

    if (nieuweFlash.size) {
      setFlash(nieuweFlash)
      setTimeout(() => setFlash(new Set()), 900)
    }

    setEntries(gesorteerd)
    setUpdated(new Date())
    setLoading(false)
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    const init = async () => {
      await fetchSessie()
      if (!cancelled) await fetchTiming()
    }
    init()
    const iv = setInterval(() => {
      if (!cancelled) {
        fetchTiming()
        fetchSessie()
      }
    }, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(iv)
    }
  }, [sessionId, fetchTiming, fetchSessie])

  const isLive = sessie?.status?.toLowerCase() === 'live'
  const leader = entries[0]
  const sessieNm = sessie?.sessie_naam ?? ''
  const gpNaam = sessie?.event ?? sessie?.circuit ?? sessionId.split('/').pop()?.replace(/_/g, ' ') ?? ''
  const ronden = sessie?.ronden_totaal
  const leaderLap = leader?.laps ?? 0

  return (
    <div className="overflow-hidden rounded-xl border border-gray-900 bg-[#07080a]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-900/60" style={{ background: c.bg }}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-mono text-sm font-black uppercase tracking-wider text-white">{gpNaam}</span>
          {sessieNm && (
            <>
              <div className="h-3 w-px flex-shrink-0 bg-gray-800" />
              <span className="flex-shrink-0 font-mono text-xs font-bold uppercase text-gray-400 tracking-wide">{sessieNm}</span>
            </>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          {ronden && leaderLap > 0 && (
            <div className="flex items-center gap-1 rounded-xl border border-gray-900 bg-black/40 px-3 py-1">
              <span className="font-mono text-[9px] font-bold uppercase text-gray-500">LAP</span>
              <span className="font-mono text-xs font-black text-white tabular-nums">{leaderLap}</span>
              <span className="font-mono text-[9px] font-bold text-gray-500">/{ronden}</span>
            </div>
          )}
          
          <div
            className="flex items-center gap-1.5 rounded-xl px-3 py-1"
            style={{
              background: isLive ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isLive ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}`,
            }}
          >
            {isLive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
            <span className="font-mono text-[9px] font-black uppercase tracking-widest" style={{ color: isLive ? '#ef4444' : '#6b7280' }}>
              {isLive ? 'LIVE' : (sessie?.status ?? 'OFFLINE')}
            </span>
          </div>

          {updated && (
            <span className="hidden font-mono text-[9px] font-bold text-gray-600 sm:block uppercase tracking-wider">
              SYS_UPD: {updated.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* ── Weer Balk ── */}
      {sessie?.weer && <WeerBalk w={sessie.weer} />}

      {/* ── Tabs + best lap ── */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-black/10 border-b border-gray-900">
        <div className="flex gap-1.5">
          {(['timing', 'stints'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-lg px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all"
              style={
                tab === t
                  ? { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }
                  : { background: 'transparent', color: '#4b5563', border: '1px solid transparent' }
              }
            >
              {t === 'timing' ? 'Timing' : 'Stints'}
            </button>
          ))}
        </div>
        {leader?.bestLap && leader.bestLap !== '-' && (
          <div className="flex items-center gap-2 bg-black/20 border border-gray-900 rounded-lg px-3 py-1">
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-gray-500">LAP RECORD</span>
            <span className="font-mono text-xs font-black tabular-nums" style={{ color: c.k }}>{leader.bestLap}</span>
            <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wide">{leader.name.split(' ').pop()}</span>
          </div>
        )}
      </div>

      {/* ── Laden State ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-800" style={{ borderTopColor: c.k }} />
          <span className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider">Acquiring Telemetry Stream...</span>
        </div>
      )}

      {/* ── Geen Data State ── */}
      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-4 p-3 bg-gray-950/40 border border-gray-900 rounded-full text-gray-600 shadow-xl">
            <Radio className="w-8 h-8 animate-pulse text-gray-500" />
          </div>
          <h4 className="font-mono text-xs font-bold text-gray-400 uppercase tracking-wider">No Telemetry Stream Detected</h4>
          <p className="mt-1 font-body text-xs text-gray-600 max-w-xs">Start het Command Center op om live rijdersdata naar deze sessie te sturen.</p>
        </div>
      )}

      {/* ── Timing Tabel (Geoptimaliseerd & Trillingsvrij) ── */}
      {!loading && entries.length > 0 && tab === 'timing' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-gray-900">
                {['POS', 'Coureur', ...(compact ? [] : ['Laps', 'PIT', 'Tyre']), 'Best Lap', 'Gap', ...(compact ? [] : ['INT.', 'S1', 'S2', 'S3']), 'Last Lap'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900/30 text-xs font-medium">
              {entries.map((e, idx) => {
                const isValidPos = e.pos !== 900 && e.pos !== 999;
                const isFirst = e.pos === 1 && isValidPos;
                const key = e.carNumber || e.name
                const isFlash = flash.has(key)
                const inPit = e.status === 'pit'
                
                const rowBg = isFlash 
                  ? `${c.k}15` 
                  : isFirst 
                    ? `${c.k}05` 
                    : idx % 2 
                      ? 'rgba(255,255,255,0.01)' 
                      : 'transparent'

                return (
    <tr
      key={key}
      onClick={isF1 ? () => openTelemetry(key) : undefined}
      className={`group transition-colors duration-150 select-none ${isF1 ? 'cursor-pointer hover:bg-white/[0.025]' : ''}`}
      style={{ background: rowBg }}
    >
      {/* POS */}
      <td className="w-14 px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span
            className="w-5 text-right font-mono text-xs font-black tabular-nums"
            style={{ color: e.pos === 1 && isValidPos ? '#facc15' : e.pos === 2 ? '#d1d5db' : e.pos === 3 ? '#b45309' : '#4b5563' }}
          >
            {!isValidPos ? 'NC' : e.pos}
          </span>
          <PosChange v={e.posChange ?? 0} />
        </div>
      </td>

      {/* Coureur */}
      <td className="px-2 py-2" style={{ minWidth: compact ? 110 : 160 }}>
        <div className="flex items-center gap-2">
          {/* Teamkleur-indicator strip aan het begin van de naam */}
          <div className="h-3.5 w-[3px] flex-shrink-0 rounded-full" style={{ background: c.k }} />
          <span className="font-mono text-xs font-bold uppercase tracking-wide text-gray-200 group-hover:text-white transition-colors">
            {e.name.includes(' ') ? e.name.split(' ').filter(Boolean).pop()?.toUpperCase() : e.name.toUpperCase()}
          </span>
          {(inPit || (e.status && e.status !== 'racing')) && <StatusBadge status={inPit ? 'pit' : e.status} />}
        </div>
        {!compact && e.team && (
          <div className="mt-0.5 max-w-[140px] truncate pl-3 font-mono text-[9px] tracking-wide text-gray-600 group-hover:text-gray-500 transition-colors">
            {e.team}
          </div>
        )}
      </td>

                    {!compact && (
                      <>
                        {/* Laps */}
                        <td className="px-4 py-2 font-mono text-xs text-gray-400 tabular-nums">{e.laps || '—'}</td>
                        {/* PIT */}
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 text-center tabular-nums">{e.pits > 0 ? e.pits : '—'}</td>
                        {/* Tyre */}
                        <td className="px-4 py-2 text-center"><TyreBadge tyre={e.tyre} /></td>
                      </>
                    )}

                    {/* Best Lap */}
                    <td className="px-4 py-2 font-mono text-xs font-bold tabular-nums">
                      <span style={{ color: isFirst ? '#c084fc' : e.bestLap !== '-' ? '#ccc' : '#444' }}>
                        {e.bestLap !== '-' ? e.bestLap : '—'}
                      </span>
                    </td>

                    {/* Gap */}
                    <td className="px-4 py-2 font-mono text-xs tabular-nums">
                      <span style={{ color: isFirst ? c.k : '#6b7280' }}>
                        {isFirst ? 'LEADER' : (e.gap ?? '—')}
                      </span>
                    </td>

                    {!compact && (
                      <>
                        {/* Interval */}
                        <td className="px-4 py-2 font-mono text-xs text-gray-600 tabular-nums">{e.interval ?? '—'}</td>
                        {/* Sectors */}
                        <td className="px-2 py-2 text-center"><Sector t={e.sectors[0]} kleur="#facc15" /></td>
                        <td className="px-2 py-2 text-center"><Sector t={e.sectors[1]} kleur="#22c55e" /></td>
                        <td className="px-2 py-2 text-center"><Sector t={e.sectors[2]} kleur="#3b82f6" /></td>
                      </>
                    )}

                    {/* Last Lap */}
                    <td className="px-4 py-2 font-mono text-xs tabular-nums">
                      <span style={{ color: isFlash ? c.k : e.lastLap !== '-' ? '#9ca3af' : '#444', fontWeight: isFlash ? 900 : 500 }}>
                        {e.lastLap !== '-' ? e.lastLap : '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Stints Tab State ── */}
      {!loading && tab === 'stints' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider">Stint telemetry matrix</p>
          <p className="mt-1 font-body text-xs text-gray-600">Binnenkort live beschikbaar via het Command Center.</p>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-5 py-2 bg-black/40 border-t border-gray-900/60">
        <span className="font-mono text-[9px] font-black tracking-widest text-gray-600 uppercase">
          GRID<span style={{ color: c.k }}>24</span>HQ // {klasse} // MONITOR_PANEL
        </span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: isLive ? c.k : '#4b5563' }} />
          <span className="font-mono text-[9px] font-bold text-gray-600 uppercase tracking-wider">Stream Rate: {POLL_MS / 1000}s</span>
        </div>
      </div>
    </div>
  )
}