import type { Series } from '../types/calendar'

export const SERIES_ACCENT_BORDER: Record<Series, string> = {
  f1: 'border-t-f1',
  motogp: 'border-t-moto2', // amber/oranje accent, zoals in het CS6-ontwerp
  moto2: 'border-t-moto2',
  moto3: 'border-t-moto3',
  worldsbk: 'border-t-purple',
}

export const SERIES_BADGE: Record<Series, string> = {
  f1: 'bg-f1/15 text-f1 border-f1/40',
  motogp: 'bg-moto2/15 text-moto2 border-moto2/40',
  moto2: 'bg-moto2/15 text-moto2 border-moto2/40',
  moto3: 'bg-moto3/15 text-moto3 border-moto3/40',
  worldsbk: 'bg-purple/15 text-purple border-purple/40',
}

export const SERIES_TEXT: Record<Series, string> = {
  f1: 'text-f1',
  motogp: 'text-moto2',
  moto2: 'text-moto2',
  moto3: 'text-moto3',
  worldsbk: 'text-purple',
}

export const SERIES_STROKE: Record<Series, string> = {
  f1: 'stroke-f1',
  motogp: 'stroke-moto2',
  moto2: 'stroke-moto2',
  moto3: 'stroke-moto3',
  worldsbk: 'stroke-purple',
}
