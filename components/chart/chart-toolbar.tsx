'use client'

import { Timeframe } from '@/types/market'
import { cn } from '@/lib/utils'
import { Maximize2, RefreshCw } from 'lucide-react'

interface ChartToolbarProps {
  symbol: string
  timeframe: Timeframe
  onTimeframeChange: (timeframe: Timeframe) => void
  onRefresh?: () => void
  onFullscreen?: () => void
}

const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W']

export function ChartToolbar({
  symbol,
  timeframe,
  onTimeframeChange,
  onRefresh,
  onFullscreen,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-[var(--card)] border-b border-[var(--border)]">
      {/* Symbol */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{symbol}</h2>
        <p className="text-xs text-[var(--muted-foreground)]">Candlestick Chart</p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center gap-1 bg-[var(--background)] rounded-lg p-1">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              timeframe === tf
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
            )}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className="text-[var(--muted-foreground)]" />
          </button>
        )}
        {onFullscreen && (
          <button
            onClick={onFullscreen}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            title="Fullscreen"
          >
            <Maximize2 size={18} className="text-[var(--muted-foreground)]" />
          </button>
        )}
      </div>
    </div>
  )
}
