import React, { useEffect, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import * as FirebaseModule from '../lib/firebase'
import { Gauge, Zap, Disc3, Activity, X, ShieldCheck } from 'lucide-react'
import { useTelemetryStore } from '../store/useTelemetryStore'
import { useTimingStore } from '../store/useTimingStore'
import { LiveTrackMap } from './LiveTrackMap'

interface LiveSensors {
  speed?: number
  throttle?: number
  brake?: number
  rpm?: number
  gear?: number
}

const MAX_SPEED = 360 // km/h, past bij F1-topsnelheden
const MAX_RPM = 15000 // typische F1-motor redline

/** Analoge snelheidsmeter: een halve-cirkel-boog die meegroeit met de live snelheid. */
function SpeedGauge({ speed }: { speed: number }) {
  const pct = Math.min(Math.max(speed / MAX_SPEED, 0), 1)
  const radius = 70
  const circumference = Math.PI * radius // halve cirkel
  const offset = circumference * (1 - pct)

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <svg viewBox="0 0 180 100" className="w-full max-w-[220px]">
        {/* Achtergrond-boog */}
        <path
          d="M 15 95 A 70 70 0 0 1 165 95"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Actieve boog */}
        <path
          d="M 15 95 A 70 70 0 0 1 165 95"
          fill="none"
          stroke="url(#speedGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 120ms linear' }}
        />
        <defs>
          <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute top-[48%] flex flex-col items-center">
        <span className="font-mono text-4xl font-black tabular-nums text-white">{Math.round(speed)}</span>
        <span className="font-mono text-[10px] font-bold tracking-widest text-neutral-500">KM/H</span>
      </div>
    </div>
  )
}

/** Rijstuur-shiftlights: segmenten die van groen via geel naar rood oplichten met de RPM. */
function RpmShiftLights({ rpm }: { rpm: number }) {
  const segments = 12
  const litCount = Math.round((Math.min(rpm, MAX_RPM) / MAX_RPM) * segments)

  return (
    <div className="rounded-lg border border-neutral-800 bg-black/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          <Activity className="h-3 w-3" /> RPM
        </span>
        <span className="font-mono text-xs font-bold tabular-nums text-neutral-300">{Math.round(rpm)}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => {
          const lit = i < litCount
          const color = i < segments * 0.55 ? '#22c55e' : i < segments * 0.85 ? '#facc15' : '#ef4444'
          return (
            <div
              key={i}
              className="h-3 flex-1 rounded-sm transition-all duration-100"
              style={{
                backgroundColor: lit ? color : 'rgba(255,255,255,0.06)',
                boxShadow: lit ? `0 0 6px ${color}` : 'none',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

interface LiveTelemetryPanelProps {
  circuitSlug?: string
}

export const LiveTelemetryPanel: React.FC<LiveTelemetryPanelProps> = ({ circuitSlug }) => {
  const { selectedDriverId, closeTelemetry } = useTelemetryStore()
  const { selectedSeries } = useTimingStore()
  const [sensors, setSensors] = useState<LiveSensors | null>({ speed: 0, throttle: 0, brake: 0, rpm: 0, gear: 0 })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedDriverId) return
    setErrorMsg(null)

    const databaseInstance = FirebaseModule.rtdb || (FirebaseModule as any).default?.rtdb

    if (!databaseInstance) {
      setErrorMsg('Firebase RTDB koppeling niet gevonden in src/lib/firebase.ts')
      return
    }

    let telemetryRef: any = null

    try {
      const cleanDriverId = selectedDriverId
        ? selectedDriverId.replace(/[.#$[\]]/g, '').trim()
        : 'unknown'

      telemetryRef = ref(databaseInstance, `live_telemetry/${selectedSeries}/${cleanDriverId}`)

      onValue(telemetryRef, (snapshot) => {
        if (snapshot.exists()) {
          setSensors(snapshot.val() as LiveSensors)
        } else {
          setSensors({ speed: 0, throttle: 0, brake: 0, rpm: 0, gear: 0 })
        }
      }, (error) => {
        console.error(error)
        setErrorMsg(`Firebase leesfout: ${error.message}`)
      })

    } catch (err: any) {
      console.error(err)
      setErrorMsg(`Fout bij initialiseren listener: ${err.message || err}`)
    }

    return () => {
      if (telemetryRef && databaseInstance) {
        try {
          off(telemetryRef)
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [selectedDriverId, selectedSeries])

  const speed = sensors?.speed ?? 0
  const throttle = Math.min(Math.max(sensors?.throttle ?? 0, 0), 100)
  const brake = Math.min(Math.max(sensors?.brake ?? 0, 0), 100)
  const rpm = sensors?.rpm ?? 0
  const gear = sensors?.gear

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 text-white shadow-2xl">
      <div>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-neutral-400">
            <Gauge className="h-3.5 w-3.5 text-red-500" />
            Machine Telemetry Spec
          </h2>
          <button
            onClick={closeTelemetry}
            aria-label="Sluiten"
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-red-500/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Rijder ID + versnelling naast elkaar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5">
            <span className="font-mono text-lg font-black tracking-wide text-red-500">
              #{selectedDriverId?.replace(/^#+/, '').toUpperCase()}
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-700 bg-black/50">
            <span className="font-mono text-xl font-black text-white">{gear === 0 ? 'N' : gear ?? '–'}</span>
          </div>
        </div>

        {/* FOUTMELDING CRASH PROTECTION */}
        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/20 p-3 font-mono text-xs text-red-400">
            <p className="mb-1 font-bold">⚠️ Connection Error</p>
            <p>{errorMsg}</p>
          </div>
        )}

        {/* LIVE DRIVER TRACKER CARD */}
        <div className="mb-4">
          <LiveTrackMap circuitSlug={circuitSlug || 'british_gp'} />
        </div>

        {/* SNELHEIDSMETER */}
        <div className="mb-4 rounded-lg border border-neutral-800 bg-black/40">
          <SpeedGauge speed={speed} />
        </div>

        {/* THROTTLE + BRAKE naast elkaar, zoals de F1-tv-graphic */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-neutral-800 bg-black/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <Zap className="h-3 w-3" /> Throttle
              </span>
              <span className="font-mono text-xs font-bold tabular-nums text-emerald-400">{Math.round(throttle)}%</span>
            </div>
            <div className="flex h-24 items-end overflow-hidden rounded-md bg-neutral-900">
              <div
                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-100 ease-linear"
                style={{ height: `${throttle}%`, boxShadow: throttle > 5 ? '0 0 10px rgba(16,185,129,0.6)' : 'none' }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-black/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <Disc3 className="h-3 w-3" /> Brake
              </span>
              <span className="font-mono text-xs font-bold tabular-nums text-red-400">{Math.round(brake)}%</span>
            </div>
            <div className="flex h-24 items-end overflow-hidden rounded-md bg-neutral-900">
              <div
                className="w-full bg-gradient-to-t from-red-700 to-red-400 transition-all duration-100 ease-linear"
                style={{ height: `${brake}%`, boxShadow: brake > 5 ? '0 0 10px rgba(239,68,68,0.6)' : 'none' }}
              />
            </div>
          </div>
        </div>

        {/* RPM SHIFTLIGHTS */}
        <RpmShiftLights rpm={rpm} />
      </div>

      <div className="mt-4 flex items-center gap-1.5 border-t border-neutral-800/60 pt-3">
        <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500/70" />
        <p className="font-body text-[10px] leading-relaxed text-neutral-500">
          GRID24HQ Data Shield actief.
        </p>
      </div>
    </div>
  )
}
