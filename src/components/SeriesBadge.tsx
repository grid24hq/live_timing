import type { Series } from '../types/calendar'
import { SERIES_CONFIG } from '../lib/seriesConfig'

interface Props {
  series: Series
  size?: 'sm' | 'md'
}

export default function SeriesBadge({ series, size = 'sm' }: Props) {
  const config = SERIES_CONFIG[series]
  if (!config) return null

  return (
    <span
      className={`badge ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
      style={{
        backgroundColor: `${config.hex}20`,
        color: config.hex,
        borderColor: `${config.hex}40`,
        border: '1px solid',
      }}
    >
      {config.label}
    </span>
  )
}
