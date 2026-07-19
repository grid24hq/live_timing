import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string
const ONTVANGER = 'grid24hq@gmail.com'

type Status = 'idle' | 'bezig' | 'gelukt' | 'mislukt'

export default function Contact() {
  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [onderwerp, setOnderwerp] = useState('')
  const [bericht, setBericht] = useState('')
  const [honeypot, setHoneypot] = useState('') // moet altijd leeg blijven bij echte bezoekers
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    // Honeypot ingevuld = vrijwel zeker een bot. Doe alsof het gelukt is
    // (zodat de bot niet leert dat 'ie ontdekt is), maar verstuur niks.
    if (honeypot.trim() !== '') {
      setStatus('gelukt')
      return
    }

    setStatus('bezig')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          to: ONTVANGER,
          subject: `[GRID24HQ Contact] ${onderwerp}`,
          from_name: naam,
          name: naam,
          email,
          Onderwerp: onderwerp,
          message: bericht,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('gelukt')
        setNaam('')
        setEmail('')
        setOnderwerp('')
        setBericht('')
      } else {
        setStatus('mislukt')
      }
    } catch {
      setStatus('mislukt')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-void px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-signal/40 bg-panel">
            <Mail className="h-5 w-5 text-signal" />
          </div>
          <h1 className="font-display text-3xl font-black uppercase tracking-wide text-text-primary">
            Contact
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-text-secondary">
            Vraag, tip of iets anders? Laat het weten.
          </p>
        </div>

        {status === 'gelukt' ? (
          <div className="rounded-xl border border-line bg-panel p-8 text-center">
            <p className="font-display text-xl font-black uppercase text-text-primary">
              Bericht verstuurd
            </p>
            <p className="mt-2 font-mono text-xs text-text-secondary">
              Bedankt — we reageren zo snel mogelijk.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-panel p-6 space-y-5">
            {/* Honeypot — onzichtbaar voor mensen, bots vullen dit blindelings in */}
            <input
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <Veld label="Naam" value={naam} onChange={setNaam} type="text" required />
            <Veld label="E-mailadres" value={email} onChange={setEmail} type="email" required />
            <Veld label="Onderwerp" value={onderwerp} onChange={setOnderwerp} type="text" required />

            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-text-secondary">
                Bericht
              </span>
              <textarea
                value={bericht}
                onChange={(e) => setBericht(e.target.value)}
                required
                rows={5}
                className="w-full resize-none rounded-lg border border-line bg-panel-raised px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-signal"
              />
            </label>

            {status === 'mislukt' && (
              <p className="rounded-lg border border-signal/30 bg-signal/10 px-3 py-2 font-mono text-xs text-signal">
                Versturen is niet gelukt. Probeer het opnieuw, of mail rechtstreeks naar{' '}
                <a href={`mailto:${ONTVANGER}`} className="underline">
                  {ONTVANGER}
                </a>
                .
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'bezig'}
              className="w-full rounded-lg bg-signal px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === 'bezig' ? 'Bezig met versturen...' : 'Versturen'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Veld(props: { label: string; value: string; onChange: (v: string) => void; type: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-text-secondary">
        {props.label}
      </span>
      <input
        type={props.type}
        value={props.value}
        required={props.required}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-panel-raised px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-signal"
      />
    </label>
  )
}
