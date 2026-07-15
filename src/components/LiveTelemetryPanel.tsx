import React, { useEffect, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import * as FirebaseModule from '../lib/firebase'
import { Gauge, Zap, Disc3, Activity, Wind, X, ShieldCheck } from 'lucide-react'
import { useTelemetryStore } from '../store/useTelemetryStore'
import { useTimingStore } from '../store/useTimingStore'
import { LiveTrackMap } from './LiveTrackMap'

interface LiveSensors {
  speed?: number
  throttle?: number
  brake?: number
  rpm?: number
  gear?: number
  drs?: number // 0 = Uit, 1 = Beschikbaar (in de zone), 2 = Open (actief)
}

const MAX_RPM = 15000 // typische F1-motor redline

/** Herbruikbare LED-segmentbalk — gebruikt voor RPM, gas én rem, elk met eigen kleur/label/max. */
function LedSegmentBar({
  icon: Icon,
  label,
  waarde,
  max,
  eenheid,
  segments = 12,
  kleurenSchema,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  waarde: number
  max: number
  eenheid?: string
  segments?: number
  kleurenSchema: (i: number, segments: number) => string
}) {
  const litCount = Math.round((Math.min(waarde, max) / max) * segments)

  return (
    <div className="rounded-lg border border-neutral-800 bg-black/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          <Icon className="h-3 w-3" /> {label}
        </span>
        <span className="font-mono text-xs font-bold tabular-nums text-neutral-300">
          {Math.round(waarde)}
          {eenheid ?? ''}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => {
          const lit = i < litCount
          const color = kleurenSchema(i, segments)
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

/** RPM: groen -> geel -> rood, zoals een echt shiftlight-systeem. */
const rpmKleuren = (i: number, segments: number) =>
  i < segments * 0.55 ? '#22c55e' : i < segments * 0.85 ? '#facc15' : '#ef4444'
/** Gas: vlak groen — hoe voller, hoe meer gas. */
const throttleKleuren = () => '#22c55e'
/** Rem: vlak rood. */
const brakeKleuren = () => '#ef4444'

/** DRS-status: 0 = Uit (grijs), 1 = Beschikbaar in de zone (geel, knipperend), 2 = Open/actief (groen). */
function DrsIndicator({ status }: { status: number }) {
  const isOpen = status === 2
  const isAvailable = status === 1

  const kleur = isOpen ? '#22c55e' : isAvailable ? '#facc15' : '#525252'
  const label = isOpen ? 'OPEN' : isAvailable ? 'BESCHIKBAAR' : 'UIT'

  return (
    <div
      className={`flex items-center justify-between rounded-lg border bg-black/40 px-3 py-2.5 transition-all ${isAvailable ? 'animate-pulse' : ''}`}
      style={{ borderColor: isOpen || isAvailable ? `${kleur}80` : 'rgb(38 38 38)' }}
    >
      <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
        <Wind className="h-3 w-3" /> DRS
      </span>
      <span
        className="font-mono text-xs font-black uppercase tracking-wide"
        style={{ color: kleur, textShadow: isOpen ? `0 0 8px ${kleur}` : 'none' }}
      >
        {label}
      </span>
    </div>
  )
}

/** Gecombineerde versnelling + snelheid, plat naast elkaar (geen boog). */
function SpeedAndGearBox({ speed, gear }: { speed: number; gear?: number }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-neutral-800 bg-black/40 p-4">
      <div className="flex flex-col items-center">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500">Gear</span>
        <span className="font-mono text-4xl font-black leading-none text-white">{gear === 0 ? 'N' : gear ?? '–'}</span>
      </div>
      <div className="h-10 w-px bg-neutral-800" />
      <div className="flex flex-1 items-baseline justify-end gap-1.5">
        <span className="font-mono text-4xl font-black tabular-nums leading-none text-white">{Math.round(speed)}</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500">km/h</span>
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
  const drs = sensors?.drs ?? 0

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

        {/* Rijder ID */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5">
            <span className="font-mono text-lg font-black tracking-wide text-red-500">
              #{selectedDriverId?.replace(/^#+/, '').toUpperCase()}
            </span>
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

        {/* GEAR + SNELHEID, direct onder de trackmap */}
        <div className="mb-4">
          <SpeedAndGearBox speed={speed} gear={gear} />
        </div>

        {/* DRS-STATUS */}
        <div className="mb-4">
          <DrsIndicator status={drs} />
        </div>

        {/* RPM SHIFTLIGHTS */}
        <div className="mb-4">
          <LedSegmentBar icon={Activity} label="RPM" waarde={rpm} max={MAX_RPM} kleurenSchema={rpmKleuren} />
        </div>

        {/* GAS + REM als LED-segmentbalken, zelfde stijl als RPM */}
        <div className="flex flex-col gap-3">
          <LedSegmentBar icon={Zap} label="Throttle" waarde={throttle} max={100} eenheid="%" kleurenSchema={throttleKleuren} />
          <LedSegmentBar icon={Disc3} label="Brake" waarde={brake} max={100} eenheid="%" kleurenSchema={brakeKleuren} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 border-t border-neutral-800/60 pt-3">
        <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500/70" />
        <p className="font-body text-[10px] leading-relaxed text-neutral-500">
          GRID24HQ Data Shield actief. Geen risico op pagina-crashes.
        </p>
      </div>
    </div>
  )
}
