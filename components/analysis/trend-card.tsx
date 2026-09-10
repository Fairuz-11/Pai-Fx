'use client'

import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendCardProps {
  trend: {
    direction: 'bullish' | 'bearish' | 'neutral'
    strength: string
    score: number
    emaAlignment: boolean
    priceStructure: string
    momentum: string
    summary?: string
  }
}

export function TrendCard({ trend }: TrendCardProps) {
  const getTrendColor = () => {
    switch (trend.direction) {
      case 'bullish':
        return 'text-green-500'
      case 'bearish':
        return 'text-red-500'
      default:
        return 'text-yellow-500'
    }
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-[var(--primary)]" />
        Trend Analysis
      </h3>

      {/* Trend Direction */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--muted-foreground)]">Direction</span>
          <span className={cn('text-xl font-bold uppercase', getTrendColor())}>
            {trend.direction}
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all',
              trend.direction === 'bullish'
                ? 'bg-green-500'
                : trend.direction === 'bearish'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            )}
            style={{ width: `${trend.score}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-[var(--muted-foreground)]">0</span>
          <span className="text-xs text-[var(--muted-foreground)]">Score: {trend.score}</span>
          <span className="text-xs text-[var(--muted-foreground)]">100</span>
        </div>
      </div>

      {/* Trend Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-[var(--background)] rounded-lg p-3">
          <div className="text-xs text-[var(--muted-foreground)] mb-1">Strength</div>
          <div className="text-sm font-medium text-[var(--foreground)] capitalize">
            {trend.strength.replace('_', ' ')}
          </div>
        </div>

        <div className="bg-[var(--background)] rounded-lg p-3">
          <div className="text-xs text-[var(--muted-foreground)] mb-1">Momentum</div>
          <div className="text-sm font-medium text-[var(--foreground)] capitalize">
            {trend.momentum}
          </div>
        </div>

        <div className="bg-[var(--background)] rounded-lg p-3">
          <div className="text-xs text-[var(--muted-foreground)] mb-1">EMA Alignment</div>
          <div
            className={cn(
              'text-sm font-medium',
              trend.emaAlignment ? 'text-green-500' : 'text-red-500'
            )}
          >
            {trend.emaAlignment ? 'Yes' : 'No'}
          </div>
        </div>

        <div className="bg-[var(--background)] rounded-lg p-3">
          <div className="text-xs text-[var(--muted-foreground)] mb-1">Price Structure</div>
          <div className="text-sm font-medium text-[var(--foreground)] capitalize">
            {trend.priceStructure}
          </div>
        </div>
      </div>

      {/* Summary */}
      {trend.summary && (
        <div className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg">
          <p className="text-sm text-[var(--foreground)] leading-relaxed">{trend.summary}</p>
        </div>
      )}
    </div>
  )
}
