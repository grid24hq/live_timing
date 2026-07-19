import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { loginMetGoogle } from '../lib/googleAuth'
import GoogleIcon from '../components/GoogleIcon'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [bezig, setBezig] = useState(false)
  const [foutmelding, setFoutmelding] = useState<string | null>(null)

  async function handleGoogleLogin() {
    setFoutmelding(null)
    setBezig(true)
    try {
      await loginMetGoogle()
      navigate('/live-timing')
    } catch (err: unknown) {
      // Gebruiker die zelf de popup sluit is geen echte fout — stil negeren
      const code = (err as { code?: string })?.code ?? ''
      if (code !== 'auth/popup-closed-by-user') {
        setFoutmelding('Inloggen met Google is niet gelukt. Probeer het opnieuw.')
      }
    } finally {
      setBezig(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFoutmelding(null)
    setBezig(true)
    try {
      await signInWithEmailAndPassword(auth, email, wachtwoord)
      // De AuthGate op /live-timing regelt zelf of er nog een toegangscode
      // ingevoerd moet worden — hier hoeven we alleen door te sturen.
      navigate('/live-timing')
    } catch (err: unknown) {
      setFoutmelding(vertaalFirebaseFout(err))
    } finally {
      setBezig(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-void px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-black uppercase tracking-wide text-text-primary">
            Inloggen
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-text-secondary">
            Welkom terug bij GRID24HQ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-panel p-6 space-y-5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={bezig}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-panel-raised px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest text-text-primary transition-colors hover:border-line-bright disabled:opacity-50"
          >
            <GoogleIcon />
            Inloggen met Google
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">of</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-text-secondary">
              E-mailadres
            </span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-panel-raised px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-signal"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-text-secondary">
              Wachtwoord
            </span>
            <input
              type="password"
              value={wachtwoord}
              autoComplete="current-password"
              required
              onChange={(e) => setWachtwoord(e.target.value)}
              className="w-full rounded-lg border border-line bg-panel-raised px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-signal"
            />
          </label>

          {foutmelding && (
            <p className="rounded-lg border border-signal/30 bg-signal/10 px-3 py-2 font-mono text-xs text-signal">
              {foutmelding}
            </p>
          )}

          <button
            type="submit"
            disabled={bezig}
            className="w-full rounded-lg bg-signal px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {bezig ? 'Bezig...' : 'Inloggen'}
          </button>

          <p className="text-center font-mono text-xs text-text-secondary">
            Nog geen account?{' '}
            <Link to="/register" className="text-signal hover:underline">
              Registreer hier
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function vertaalFirebaseFout(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mailadres of wachtwoord is onjuist.'
    case 'auth/too-many-requests':
      return 'Te veel pogingen — probeer het later opnieuw.'
    default:
      return 'Er ging iets mis bij het inloggen. Probeer het opnieuw.'
  }
}
