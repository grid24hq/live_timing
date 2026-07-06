import { create } from 'zustand'

export type Series = 'f1' | 'motogp' | 'moto2' | 'moto3'

interface TimingState {
  selectedSeries: Series
  setSelectedSeries: (series: Series) => void
}

// Deze store bewaart alleen lokale UI-state (welke serie is gekozen).
// De live timing data zelf komt straks via een Firebase RTDB-listener
// (bv. een hook zoals useLiveTiming) — niet via Zustand direct.
export const useTimingStore = create<TimingState>((set) => ({
  selectedSeries: 'f1',
  setSelectedSeries: (series) => set({ selectedSeries: series }),
}))
