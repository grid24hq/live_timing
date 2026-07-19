import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { ref, set } from 'firebase/database'
import { auth, firestore, rtdb } from './firebase'
import { stuurWelkomstmail } from './emailjs'

const googleProvider = new GoogleAuthProvider()

/**
 * Logt in met Google (werkt voor zowel nieuwe als bestaande accounts — Google
 * regelt zelf of het een registratie of een login is).
 *
 * Bij een EERSTE keer inloggen:
 *  - profiel aanmaken in Firestore (net als bij het gewone registratieformulier)
 *  - welkomstmail versturen
 *  - otpVerified meteen op true zetten — Google heeft het e-mailadres al
 *    bewezen via de eigen OAuth-inlog, dus de losse 6-cijferige code is hier
 *    overbodig (zelfde bewijskracht, ander kanaal).
 *
 * Bij een TERUGKERENDE gebruiker gebeurt geen van deze stappen opnieuw.
 */
export async function loginMetGoogle() {
  const cred = await signInWithPopup(auth, googleProvider)
  const user = cred.user

  const profielRef = doc(firestore, 'users', user.uid)
  const profielSnap = await getDoc(profielRef)

  if (!profielSnap.exists()) {
    const username = user.displayName ?? user.email?.split('@')[0] ?? 'Racer'

    await setDoc(profielRef, {
      username,
      email: user.email,
      aangemaaktOp: serverTimestamp(),
      via: 'google',
    })

    await set(ref(rtdb, `users/${user.uid}/otpVerified`), true)

    stuurWelkomstmail({ username, email: user.email ?? '' }).catch((err) => {
      console.warn('Welkomstmail kon niet verstuurd worden:', err)
    })
  }

  return user
}
