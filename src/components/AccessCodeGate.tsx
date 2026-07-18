import { useState, type FormEvent } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { genereerEnBewaarCode, controleerCode } from '../lib/authCode'
import { stuurToegangscode } from '../lib/emailjs'

export default function AccessCodeGate() {
  const user = useAuthStore((s) => s.user)
  const [codeVerstuurd, setCodeVerstuurd] = useState(false)
  const [ingevoerdeCode, setIngevoerdeCode] = useState('')
  const [bezig, setBezig] = useState(false)
  const [melding, setMelding] = useState<string | null>(null)

  if (!user) return null

  async function verstuurCode() {
    setBezig(true)
    setMelding(null)
    try {
      const code = await genereerEnBewaarCode(user!.uid)
      await stuurToegangscode({ email: user!.email!, code })
      setCodeVerstuurd(true)
    } catch {
      setMelding('Kon de code niet versturen. Probeer het opnieuw.')
    } finally {
      setBezig(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBezig(true)
    setMelding(null)
    try {
      const resultaat = await controleerCode(user!.uid, ingevoerdeCode)
      if (resultaat === 'onjuist') setMelding('Onjuiste code, probeer opnieuw.')
      else if (resultaat === 'verlopen') setMelding('Deze code is verlopen — vraag een nieuwe aan.')
      else if (resultaat === 'geen-code-aangevraagd') setMelding('Vraag eerst een code aan.')
      // Bij 'ok' hoeft hier niks: useAuthStore's live listener op otpVerified
      // pikt de wijziging vanzelf op en de AuthGate rendert dan automatisch
      // de echte live timing-pagina.
    } catch {
      setMelding('Er ging iets mis bij het controleren van de code.')
    } finally {
      setBezig(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-void px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-line bg-panel p-6">
        <h1 className="font-display text-2xl font-black uppercase tracking-wide text-text-primary">
          Toegangscode
        </h1>
        <p className="mt-2 font-mono text-xs leading-relaxed text-text-secondary">
          Eenmalige verificatie — dit hoef je maar één keer te doen per account.
        </p>

        {!codeVerstuurd ? (
          <button
            onClick={verstuurCode}
            disabled={bezig}
            className="mt-6 w-full rounded-lg bg-signal px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {bezig ? 'Bezig...' : `Stuur code naar ${user.email}`}
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-text-secondary">
                6-cijferige code
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={ingevoerdeCode}
                onChange={(e) => setIngevoerdeCode(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-lg border border-line bg-panel-raised px-3 py-3 text-center font-mono text-2xl font-bold tracking-[0.5em] text-text-primary outline-none transition-colors focus:border-signal"
                placeholder="000000"
              />
            </label>

            <button
              type="submit"
              disabled={bezig || ingevoerdeCode.length !== 6}
              className="w-full rounded-lg bg-signal px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {bezig ? 'Controleren...' : 'Bevestigen'}
            </button>

            <button
              type="button"
              onClick={verstuurCode}
              disabled={bezig}
              className="w-full font-mono text-xs text-text-secondary hover:text-signal"
            >
              Geen mail ontvangen? Opnieuw versturen
            </button>
          </form>
        )}

        {melding && (
          <p className="mt-4 rounded-lg border border-signal/30 bg-signal/10 px-3 py-2 font-mono text-xs text-signal">
            {melding}
          </p>
        )}
      </div>
    </div>
  )
}
