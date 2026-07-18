import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, firestore } from '../lib/firebase'
import { stuurWelkomstmail } from '../lib/emailjs'

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [bezig, setBezig] = useState(false)
  const [foutmelding, setFoutmelding] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFoutmelding(null)

    if (wachtwoord.length < 6) {
      setFoutmelding('Wachtwoord moet minimaal 6 tekens zijn.')
      return
    }

    setBezig(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, wachtwoord)
      await updateProfile(cred.user, { displayName: username })

      // Profielgegevens in Firestore — nooit het wachtwoord zelf, dat
      // beheert Firebase Authentication al veilig en apart.
      await setDoc(doc(firestore, 'users', cred.user.uid), {
        username,
        email,
        aangemaaktOp: serverTimestamp(),
      })

      // Welkomstmail versturen; als dit faalt, laten we de registratie zelf
      // gewoon doorgaan — een gemiste mail mag geen geblokkeerd account geven.
      stuurWelkomstmail({ username, email }).catch((err) => {
        console.warn('Welkomstmail kon niet verstuurd worden:', err)
      })

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
            Account aanmaken
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-text-secondary">
            Registreer voor toegang tot live timing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-panel p-6 space-y-5">
          <Veld label="Gebruikersnaam" value={username} onChange={setUsername} type="text" autoComplete="username" required />
          <Veld label="E-mailadres" value={email} onChange={setEmail} type="email" autoComplete="email" required />
          <Veld label="Wachtwoord" value={wachtwoord} onChange={setWachtwoord} type="password" autoComplete="new-password" required />

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
            {bezig ? 'Bezig...' : 'Account aanmaken'}
          </button>

          <p className="text-center font-mono text-xs text-text-secondary">
            Al een account?{' '}
            <Link to="/login" className="text-signal hover:underline">
              Log hier in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function Veld(props: {
  label: string
  value: string
  onChange: (v: string) => void
  type: string
  autoComplete: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-text-secondary">
        {props.label}
      </span>
      <input
        type={props.type}
        value={props.value}
        autoComplete={props.autoComplete}
        required={props.required}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-panel-raised px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-signal"
      />
    </label>
  )
}

function vertaalFirebaseFout(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Dit e-mailadres is al in gebruik.'
    case 'auth/invalid-email':
      return 'Dit is geen geldig e-mailadres.'
    case 'auth/weak-password':
      return 'Wachtwoord is te zwak — kies er minimaal 6 tekens.'
    default:
      return 'Er ging iets mis bij het aanmaken van je account. Probeer het opnieuw.'
  }
}
