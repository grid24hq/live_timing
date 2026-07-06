import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Alle waarden komen uit .env (nooit hardcoden / nooit committen)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)

// Realtime Database — voor de live timing feed (hoogfrequente updates)
// Dit is het pad dat je command center al gebruikt: MotoGP/2026/asse_gp/Live_Timing/...
export const rtdb = getDatabase(app)

// Firestore — voor "trage" data: coureursprofielen, teams, kalender, standen
export const firestore = getFirestore(app)

export const auth = getAuth(app)
