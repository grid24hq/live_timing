import { ref, get, set, remove, serverTimestamp } from 'firebase/database'
import { rtdb } from './firebase'

const CODE_GELDIGHEID_MS = 10 * 60 * 1000 // 10 minuten

/**
 * Genereert een willekeurige 6-cijferige code, slaat 'm (samen met een
 * vervaltijdstip) op onder users/{uid}/pendingCode, en geeft de code terug
 * zodat de aanroeper 'm meteen kan mailen via EmailJS.
 *
 * Let op — belangrijke beperking, bewust geaccepteerd voor dit project:
 * omdat we geen eigen server hebben (alles loopt via de Firebase SDK
 * rechtstreeks vanuit de browser), controleert de Database-regel alleen of
 * een ingelogde gebruiker zijn EIGEN otpVerified-vlag op "true" mag zetten —
 * niet of hij daadwerkelijk de juiste code heeft ingevoerd. Voor een leuke
 * fan-site-gate is dat prima; voor iets met echte gevoelige data zou je dit
 * via een server-functie moeten laten verifiëren.
 */
export async function genereerEnBewaarCode(uid: string): Promise<string> {
  const code = String(Math.floor(100000 + Math.random() * 900000)) // altijd 6 cijfers
  await set(ref(rtdb, `users/${uid}/pendingCode`), {
    code,
    verlooptOp: Date.now() + CODE_GELDIGHEID_MS,
    aangemaaktOp: serverTimestamp(),
  })
  return code
}

export type CodeCheckResultaat = 'ok' | 'onjuist' | 'verlopen' | 'geen-code-aangevraagd'

export async function controleerCode(uid: string, ingevoerdeCode: string): Promise<CodeCheckResultaat> {
  const snap = await get(ref(rtdb, `users/${uid}/pendingCode`))
  if (!snap.exists()) return 'geen-code-aangevraagd'

  const { code, verlooptOp } = snap.val() as { code: string; verlooptOp: number }

  if (Date.now() > verlooptOp) {
    await remove(ref(rtdb, `users/${uid}/pendingCode`))
    return 'verlopen'
  }

  if (ingevoerdeCode.trim() !== code) return 'onjuist'

  // Juiste code: markeer account als geverifieerd (eenmalig, blijvend — zo
  // hoeft de gebruiker dit maar één keer te doen) en ruim de code op.
  await set(ref(rtdb, `users/${uid}/otpVerified`), true)
  await remove(ref(rtdb, `users/${uid}/pendingCode`))
  return 'ok'
}

export async function isAlGeverifieerd(uid: string): Promise<boolean> {
  const snap = await get(ref(rtdb, `users/${uid}/otpVerified`))
  return snap.exists() && snap.val() === true
}
