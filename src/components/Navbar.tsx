import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Timer, Calendar, Users, Trophy, MapPin, Menu, X, LogOut, User as UserIcon } from 'lucide-react'
import { getLiveSessies, getLiveTiming } from '../lib/raceApi'
import { useAuthStore } from '../store/useAuthStore'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

type SessieStatus = 'idle' | 'no_data' | 'live'

export default function Navbar() {
  const location = useLocation()
  const [mobielMenuOpen, setMobielMenuOpen] = useState(false)

  // Sluit het uitklapmenu automatisch zodra er van pagina wordt gewisseld
  useEffect(() => {
    setMobielMenuOpen(false)
  }, [location.pathname])

  // Echte status uit Firebase i.p.v. de oude hardcoded 'false':
  // idle     = geen enkele sessie op LIVE gezet in het Command Center (grijs)
  // no_data  = sessie staat op LIVE, maar er komen nog geen rijen binnen (rood)
  // live     = sessie staat op LIVE én er is daadwerkelijk timing-data (groen)
  const [sessieStatus, setSessieStatus] = useState<SessieStatus>('idle')

  useEffect(() => {
    let cancelled = false

    async function checkStatus() {
      try {
        const sessies = await getLiveSessies()
        if (cancelled) return

        if (sessies.length === 0) {
          setSessieStatus('idle')
          return
        }

        // Check of er bij de eerste actieve sessie ook echt timing-rijen binnenkomen
        const eerste = sessies[0]
        const sessionId = `${eerste.klasse}/${eerste.jaar}/${eerste.gp}`
        const entries = await getLiveTiming(sessionId)
        if (cancelled) return

        setSessieStatus(entries.length > 0 ? 'live' : 'no_data')
      } catch {
        if (!cancelled) setSessieStatus('idle')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 8000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const STATUS_CONFIG: Record<SessieStatus, { dot: string; label: string }> = {
    idle: { dot: 'bg-gray-600', label: 'GEEN SESSIE LIVE' },
    no_data: { dot: 'bg-red-500', label: 'GEEN DATA' },
    live: { dot: 'bg-emerald-500', label: 'SESSIE LIVE' },
  }
  const status = STATUS_CONFIG[sessieStatus]
  const user = useAuthStore((s) => s.user)

  // Handige functie om te kijken welke pagina nu actief is voor de oplichtende rode tekst
  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/live-timing', label: 'Live Timing', icon: <Timer className="w-5 h-5" /> },
    { path: '/calendar', label: 'Kalender', icon: <Calendar className="w-5 h-5" /> },
    { path: '/standen', label: 'Standen', icon: <Trophy className="w-5 h-5" /> },
    { path: '/coureurs', label: 'Coureurs', icon: <Users className="w-5 h-5" /> },
    { path: '/circuits', label: 'Circuits', icon: <MapPin className="w-5 h-5" /> },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-900 bg-[#060709]/80 backdrop-blur-md w-full select-none">
      <div className="w-full mx-auto flex h-[76px] items-center justify-between px-6 md:px-12">
        
        {/* LOGO LINKS */}
        <Link to="/" className="font-mono text-2xl font-black tracking-wider text-white hover:opacity-90 transition-opacity">
          GRID24<span className="text-red-500">HQ</span>
        </Link>

        {/* NAVIGATIE LINKS IN HET MIDDEN (Groter en beter leesbaar) */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 text-base font-bold tracking-wide uppercase font-mono transition-all duration-200 relative py-2
                ${isActive(item.path) 
                  ? 'text-white' 
                  : 'text-gray-450 hover:text-white'
                }
              `}
            >
              {item.icon}
              {item.label}
              
              {/* Flinterdun rood oplichtend streepje onder de actieve pagina */}
              {isActive(item.path) && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" />
              )}
            </Link>
          ))}
        </div>

        {/* ACCOUNT — desktop */}
        <div className="hidden md:flex items-center gap-3 mr-4">
          {user ? (
            <>
              <span className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
                <UserIcon className="h-4 w-4" />
                {user.displayName ?? user.email}
              </span>
              <button
                onClick={() => signOut(auth)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-800 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide text-gray-400 transition-colors hover:border-red-500 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Uitloggen
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-mono text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-white"
              >
                Inloggen
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-red-500 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
              >
                Registreren
              </Link>
            </>
          )}
        </div>

        {/* LIVE BADGE RECHTS */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/40 px-3 py-2.5 font-mono text-xs font-bold tracking-wider shadow-lg sm:px-5">
          <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${status.dot}`} />
          <span className="hidden text-gray-400 uppercase sm:inline">
            {status.label}
          </span>
        </div>

        {/* HAMBURGER-KNOP — alleen zichtbaar onder de md-breakpoint, waar het middelste menu verborgen is */}
        <button
          type="button"
          onClick={() => setMobielMenuOpen((open) => !open)}
          aria-label={mobielMenuOpen ? 'Menu sluiten' : 'Menu openen'}
          aria-expanded={mobielMenuOpen}
          className="ml-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-800 bg-gray-950/40 text-white md:hidden"
        >
          {mobielMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

      </div>

      {/* UITKLAPMENU OP MOBIEL */}
      {mobielMenuOpen && (
        <div className="border-t border-gray-900 bg-[#060709] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base font-bold tracking-wide uppercase font-mono transition-colors
                  ${isActive(item.path) ? 'bg-white/5 text-white' : 'text-gray-450 hover:text-white'}
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* ACCOUNT — mobiel */}
          <div className="mt-4 border-t border-gray-900 pt-4">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
                  <UserIcon className="h-4 w-4" />
                  {user.displayName ?? user.email}
                </span>
                <button
                  onClick={() => signOut(auth)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-800 px-3 py-2 font-mono text-xs font-bold uppercase tracking-wide text-gray-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Uitloggen
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 rounded-lg border border-gray-800 px-3 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-wide text-gray-400"
                >
                  Inloggen
                </Link>
                <Link
                  to="/register"
                  className="flex-1 rounded-lg bg-red-500 px-3 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-wide text-white"
                >
                  Registreren
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
