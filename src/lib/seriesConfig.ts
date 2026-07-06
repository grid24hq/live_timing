import type { Series } from '../types/calendar'

export interface SeriesConfigEntry {
  name: string
  label: string
  hex: string
}

export const SERIES_CONFIG: Record<Series, SeriesConfigEntry> = {
  f1:        { name: 'Formula 1 World Championship',    label: 'F1',       hex: '#E10600' },
  motogp:    { name: 'MotoGP World Championship',       label: 'MotoGP',   hex: '#FF6B00' },
  moto2:     { name: 'Moto2 World Championship',        label: 'Moto2',    hex: '#FFB020' },
  moto3:     { name: 'Moto3 World Championship',        label: 'Moto3',    hex: '#00A651' },
  worldsbk:  { name: 'WorldSBK Championship',           label: 'WorldSBK', hex: '#B026FF' },
}

// Bepaalt volgorde van races binnen dezelfde dag/maand en de serie-filterknoppen
export const SERIES_VOLGORDE: Series[] = ['f1', 'motogp', 'moto2', 'moto3', 'worldsbk']

// Mapt de serie naar de submap in public/circuits/, zoals afgesproken
export const SERIES_CIRCUIT_FOLDER: Record<Series, string> = {
  f1: 'f1',
  motogp: 'motogp',
  moto2: 'motogp', // Moto2 rijdt hetzelfde circuit als het MotoGP-weekend
  moto3: 'motogp', // idem
  worldsbk: 'sbk',
}

export function getSeriesColor(series: Series): string {
  return SERIES_CONFIG[series]?.hex ?? '#888'
}
