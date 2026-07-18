import { create } from 'zustand'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { ref, onValue } from 'firebase/database'
import { auth, rtdb } from '../lib/firebase'

interface AuthState {
  user: User | null
  otpGeverifieerd: boolean
  laden: boolean // true zolang we nog niet weten of iemand is ingelogd
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  otpGeverifieerd: false,
  laden: true,
}))

let otpUnsubscribe: (() => void) | null = null

// Wordt één keer bij app-opstart aangeroepen (zie main.tsx). Houdt zowel de
// Firebase-inlogstatus als de otpVerified-vlag in de Database live bij, dus
// de UI reageert automatisch overal in de app zodra iemand in- of uitlogt.
export function initAuthListener() {
  onAuthStateChanged(auth, (user) => {
    // Vorige listener (van een eventuele andere gebruiker) altijd eerst opruimen
    if (otpUnsubscribe) {
      otpUnsubscribe()
      otpUnsubscribe = null
    }

    if (!user) {
      useAuthStore.setState({ user: null, otpGeverifieerd: false, laden: false })
      return
    }

    useAuthStore.setState({ user, laden: false })

    const otpRef = ref(rtdb, `users/${user.uid}/otpVerified`)
    otpUnsubscribe = onValue(otpRef, (snap) => {
      useAuthStore.setState({ otpGeverifieerd: snap.exists() && snap.val() === true })
    })
  })
}
