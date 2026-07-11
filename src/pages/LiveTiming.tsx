import { useEffect, useState } from 'react'
import { useTimingStore, type Series } from '../store/useTimingStore'
import { useTelemetryStore } from '../store/useTelemetryStore' // <── STAP 1: ONZE NIEUWE STORE IMPORT
import { getLiveSessies, type LiveSessie } from '../lib/raceApi'
import { SERIES_CONFIG } from '../lib/seriesConfig'
import LiveTimingPanel from '../components/LiveTimingPanel'
import { LiveTelemetryPanel } from '../components/LiveTelemetryPanel' // <── STAP 2: PANEEL IMPORT

const SERIES_LABEL: Record<Series, string> = {
  f1: 'FORMULA 1',
  motogp: 'MOTOGP',
  moto2: 'MOTO2',
  moto3: 'MOTO3',
  sbk: 'WORLDSBK',
}

const KLASSE: Record<Series, string> = {
  f1: 'F1',
  motogp: 'MotoGP',
  moto2: 'Moto2',
  moto3: 'Moto3',
  sbk: 'WorldSBK',
}

const SERIES_HEX: Record<Series, string> = {
  f1: SERIES_CONFIG.f1.hex,
  motogp: SERIES_CONFIG.motogp.hex,
  moto2: SERIES_CONFIG.moto2.hex,
  moto3: SERIES_CONFIG.moto3.hex,
  sbk: SERIES_CONFIG.worldsbk.hex,
}

export default function LiveTiming() {
  const { selectedSeries, setSelectedSeries } = useTimingStore()
  const [liveSessies, setLiveSessies] = useState<LiveSessie[]>([])
  
  // STAP 3: LEES DE STATUS VAN DE TELEMETRIE UI UIT
  const isTelemetryOpen = useTelemetryStore((state) => state.isTelemetryOpen)

  useEffect(() => {
    let gestopt = false
    const poll = () => getLiveSessies().then((s) => !gestopt && setLiveSessies(s))
    poll()
    const iv = setInterval(poll, 10_000)
    return () => {
      gestopt = true
      clearInterval(iv)
    }
  }, [])

  const actieveSessie = liveSessies.find((s) => s.klasse === KLASSE[selectedSeries])
  const sessionId = actieveSessie ? `${actieveSessie.klasse}/${actieveSessie.jaar}/${actieveSessie.gp}` : null

  return (
    <div className="min-h-screen bg-void font-body text-text-primary">
      {/* LIVE TIMING */}
      <section className="mx-auto max-w-[1360px] px-8 py-12">
        <div className="overflow-hidden rounded-xl border border-line bg-panel">
          <div className="flex border-b border-line bg-panel-raised">
            {(Object.keys(SERIES_LABEL) as Series[]).map((series) => (
              <button
                key={series}
                onClick={() => setSelectedSeries(series)}
                className="border-b-2 px-6 py-4 font-display text-sm font-semibold tracking-wide transition-colors"
                style={
                  selectedSeries === series
                    ? { borderColor: SERIES_HEX[series], color: SERIES_HEX[series] }
                    : { borderColor: 'transparent', color: 'var(--color-text-secondary)' }
                }
              >
                {SERIES_LABEL[series]}
              </button>
            ))}
          </div>

          <div className="p-4">
            {sessionId ? (
              /* STAP 4: HIER SPLITSEN WE DE LAYOUT COMPONENTEN */
              <div className="flex w-full gap-4 transition-all duration-300">
                
                {/* DE LIVE TIMING TABEL: Krimpt naar 65% breedte als telemetrie openklapt */}
                <div className={`transition-all duration-300 ${isTelemetryOpen ? 'w-2/3' : 'w-full'}`}>
                  <LiveTimingPanel sessionId={sessionId} klasse={KLASSE[selectedSeries]} />
                </div>

                {/* HET SCHUIPANEEL: Wordt hiernaast geladen zodra openklapt */}
                {isTelemetryOpen && (
                  <div className="w-1/3 min-w-[420px] animate-fade-in">
                    <LiveTelemetryPanel circuitSlug={actieveSessie?.circuit_slug} />
                  </div>
                )}

              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="mb-3 text-3xl">📡</div>
                <p className="font-body text-sm text-text-dim">
                  Er loopt nu geen {SERIES_LABEL[selectedSeries]}-sessie.
                </p>
                <p className="mt-1 font-body text-xs text-text-dim">
                  Zodra het Command Center een sessie start, verschijnt de tabel hier automatisch.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
