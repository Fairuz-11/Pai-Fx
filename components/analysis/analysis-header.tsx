'use client'

import { useState } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { Timeframe } from '@/types/market'
import { cn } from '@/lib/utils'

interface AnalysisHeaderProps {
  symbol: string
  timeframe: Timeframe
  onSymbolChange: (symbol: string) => void
  onTimeframeChange: (timeframe: Timeframe) => void
  onRefresh: () => void
}

const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W']

const majorPairs = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
  'XAU/USD',
]

export function AnalysisHeader({
  symbol,
  timeframe,
  onSymbolChange,
  onTimeframeChange,
  onRefresh,
}: AnalysisHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Symbol Selector */}
        <div className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            <Search size={18} className="text-[var(--muted-foreground)]" />
            <span className="font-medium text-[var(--foreground)]">{symbol}</span>
          </button>

          {searchOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSearchOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-20 overflow-hidden">
                {majorPairs.map((pair) => (
                  <button
                    key={pair}
                    onClick={() => {
                      onSymbolChange(pair)
                      setSearchOpen(false)
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 hover:bg-[var(--muted)] transition-colors',
                      pair === symbol && 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]'
                    )}
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </>
          )}
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

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          title="Refresh analysis"
        >
          <RefreshCw size={18} className="text-[var(--muted-foreground)]" />
        </button>
      </div>
    </div>
  )
}
