import { create } from 'zustand';

interface TelemetryUIState {
  selectedDriverId: string | null;
  isTelemetryOpen: boolean;
  openTelemetry: (driverId: string) => void;
  closeTelemetry: () => void;
}

export const useTelemetryStore = create<TelemetryUIState>((set) => ({
  selectedDriverId: null,
  isTelemetryOpen: false,
  openTelemetry: (driverId) => set({ selectedDriverId: driverId, isTelemetryOpen: true }),
  closeTelemetry: () => set({ selectedDriverId: null, isTelemetryOpen: false }),
}));
