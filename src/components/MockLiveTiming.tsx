import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'

// Statische nepdata, puur voor de sfeer — geen echte coureurs/tijden.
const NEP_RIJEN = [
  { pos: 1, naam: 'A. DRIVER', team: 'Team Alpha', tijd: '1:XX.XXX', gap: 'LEADER' },
  { pos: 2, naam: 'B. DRIVER', team: 'Team Beta', tijd: '1:XX.XXX', gap: '+0.XXX' },
  { pos: 3, naam: 'C. DRIVER', team: 'Team Gamma', tijd: '1:XX.XXX', gap: '+0.XXX' },
  { pos: 4, naam: 'D. DRIVER', team: 'Team Delta', tijd: '1:XX.XXX', gap: '+0.XXX' },
  { pos: 5, naam: 'E. DRIVER', team: 'Team Epsilon', tijd: '1:XX.XXX', gap: '+0.XXX' },
]

export default function MockLiveTiming() {
  return (
    <div className="relative mx-auto max-w-[1360px] px-3 py-6 sm:px-8 sm:py-12">
      <div className="relative overflow-hidden rounded-xl border border-line bg-panel">
        {/* NEPDATA-TABEL, ONSCHERP OP DE ACHTERGROND */}
        <div className="pointer-events-none select-none blur-[3px] opacity-60">
          <div className="border-b border-line bg-panel-raised px-6 py-4">
            <span className="font-display text-lg font-black uppercase text-text-primary">
              Live Timing Preview
            </span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">
                <th className="px-6 py-3">Pos</th>
                <th className="px-6 py-3">Coureur</th>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3">Beste ronde</th>
                <th className="px-6 py-3">Gap</th>
              </tr>
            </thead>
            <tbody>
              {NEP_RIJEN.map((r) => (
                <tr key={r.pos} className="border-t border-line font-mono text-sm text-text-primary">
                  <td className="px-6 py-4 font-bold">{r.pos}</td>
                  <td className="px-6 py-4">{r.naam}</td>
                  <td className="px-6 py-4 text-text-secondary">{r.team}</td>
                  <td className="px-6 py-4">{r.tijd}</td>
                  <td className="px-6 py-4 text-signal">{r.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* OVERLAY MET CALL-TO-ACTION */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-void/70 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-signal/40 bg-panel">
            <Lock className="h-6 w-6 text-signal" />
          </div>
          <h2 className="font-display text-2xl font-black uppercase tracking-wide text-text-primary sm:text-3xl">
            Live timing is voor leden
          </h2>
          <p className="max-w-md font-mono text-xs text-text-secondary sm:text-sm">
            Maak gratis een account aan om echte, live rondetijden, gaps en
            sectortijden te bekijken voor F1, MotoGP, Moto2, Moto3 en WorldSBK.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="rounded-lg bg-signal px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
            >
              Registreer om live tijden te bekijken
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-line px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-text-secondary transition-colors hover:border-signal hover:text-text-primary"
            >
              Ik heb al een account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
