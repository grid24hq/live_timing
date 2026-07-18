import type { ReactNode } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import MockLiveTiming from './MockLiveTiming'
import AccessCodeGate from './AccessCodeGate'

export default function RequireLiveTimingAccess({ children }: { children: ReactNode }) {
  const { user, otpGeverifieerd, laden } = useAuthStore()

  // Nog aan het uitzoeken of iemand is ingelogd (heel even, bij het laden
  // van de app) — niks tonen om een flits van de verkeerde staat te voorkomen.
  if (laden) return null

  if (!user) return <MockLiveTiming />
  if (!otpGeverifieerd) return <AccessCodeGate />

  return <>{children}</>
}
