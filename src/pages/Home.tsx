import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import Clock from '../components/Clock'
import { Timer, Calendar, Users, ArrowUpRight } from 'lucide-react'
import { getKalender, getRaceStatus } from '../lib/kalenderApi'
import type { KalenderRace } from '../types/calendar'
import RaceCard from '../components/RaceCard'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isSessionLive = false

  const [volgendeRaces, setVolgendeRaces] = useState<KalenderRace[]>([])

  useEffect(() => {
    let cancelled = false
    getKalender()
      .then((maanden) => {
        if (cancelled) return
        const alleRaces = maanden.flatMap((m) => m.races)
        const upcoming = alleRaces.filter((r) => getRaceStatus(r.datum) !== 'finished')
        setVolgendeRaces(upcoming.slice(0, 3))
      })
      .catch(() => {
        if (!cancelled) setVolgendeRaces([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:flex lg:flex-col bg-[#060709] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/10 via-[#060709] to-[#040507] text-gray-250 px-6 py-5 md:px-12 select-none w-full overflow-y-auto">
      
      {/* 1. Top Header - compacter */}
      <header className="w-full mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-900/60 pb-3">
        <div>
          <h1 className="text-xl md:text-3xl font-black font-mono tracking-wider text-white">
            GRID<span className="text-red-500">24</span>HQ
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-1 font-medium">
            {t('home.subtitle', 'Live motorsport timing center — every sector, every gap, every lap.')}
          </p>
        </div>
        
         {/* Status & Klok */}
        <div className="flex items-center gap-5 bg-[#0b0d13]/60 backdrop-blur-md border border-gray-900 px-4 py-2.5 rounded-2xl flex-shrink-0">
          <div className="flex items-center gap-3 border-r border-gray-800 pr-6">
            <span className={`w-3 h-3 rounded-full ${isSessionLive ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">
              {isSessionLive ? 'LIVE' : 'STANDBY'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="block text-[10px] font-bold font-mono tracking-widest text-gray-500 uppercase mb-0.5">TRACK TIME</span>
              <span className="text-xl font-black font-mono tracking-wider text-white block tabular-nums">
                {new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="w-9 h-9 flex items-center justify-center overflow-hidden bg-black/20 rounded-full border border-gray-950 p-1">
              <Clock size="sm" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Het Dashboard Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
        
       {/* LINKER BLOK (Live Timing Center) */}
        <section className="lg:col-span-2 bg-[#0b0d13]/50 backdrop-blur-md border border-gray-950 rounded-2xl p-5 shadow-2xl flex flex-col justify-between min-h-[250px] relative overflow-hidden group">
          <div className="absolute -right-24 -top-24 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center mb-3">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                <Timer className="w-6 h-6" />
              </div>
            </div>
            
            <h2 className="text-lg md:text-2xl font-bold text-white tracking-wide uppercase mb-2">Live Timing Center</h2>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-3xl">
              Open het hoofdtelemetriescherm om racesessies van de Formule 1, MotoGP en WorldSBK live te volgen met real-time sector- en tussentijden rechtstreeks vanaf de circuits.
            </p>
          </div>

          <Link 
            to="/live-timing"
            className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-base font-bold text-white rounded-xl transition-all shadow-lg shadow-red-950/50 active:scale-98"
          >
            Launch Live Timing
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </section>

        {/* RECHTER KOLOM (Snelkoppelingen) */}
        <section className="flex flex-col gap-4">
          
          {/* Kalender Module */}
          <Link 
            to="/calendar"
            className="bg-[#0b0d13]/50 backdrop-blur-md border border-gray-950 hover:border-orange-500/20 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-1/2 group transition-all duration-300 min-h-[115px]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/10 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                <Calendar className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-1">Race Kalender</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Bekijk volledige tijdschema's, circuits en sessietijden van het 2026 seizoen.</p>
            </div>
          </Link>

          {/* Coureurs Module */}
          <Link 
            to="/standen"
            className="bg-[#0b0d13]/50 backdrop-blur-md border border-gray-950 hover:border-purple-500/20 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-1/2 group transition-all duration-300 min-h-[115px]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/10 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                <Users className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-1">Coureurs & Standen</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Analyseer coureurspaspoorten, biografieën en kampioenschapsstatistieken.</p>
            </div>
          </Link>

        </section>

      </div>

      {/* 3. Eerstvolgende races */}
      {volgendeRaces.length > 0 && (
        <div className="w-full mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base md:text-lg font-bold text-white uppercase tracking-wide">Eerstvolgende Races</h2>
            <Link
              to="/calendar"
              className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors flex items-center gap-1"
            >
              Volledige kalender
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {volgendeRaces.map((race) => (
              <RaceCard key={`${race.serie}-${race.id}`} race={race} onClick={() => navigate('/calendar')} />
            ))}
          </div>
        </div>
      )}

      {/* 4. Footer */}
      <footer className="w-full mt-4 pt-3 border-t border-gray-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-mono text-xs tracking-wider text-gray-600">
          GRID<span className="text-red-500">24</span>HQ &copy; {new Date().getFullYear()} — Live motorsport timing center
        </span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-gray-700">
          F1 · MotoGP · WorldSBK — Seizoen 2026
        </span>
      </footer>
    </main>
  )
}
