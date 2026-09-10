'use client'

import { Signal, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignalCardProps {
  signal: {
    signal: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL'
    bullishProbability: number
    bearishProbability: number
    setupStrength: string
    riskLevel: string
    confidence: number
    summary?: string
  }
}

export function SignalCard({ signal }: SignalCardProps) {
  const getSignalColor = () => {
    switch (signal.signal) {
      case 'BUY':
        return 'text-green-500 bg-green-500/10 border-green-500/30'
      case 'SELL':
        return 'text-red-500 bg-red-500/10 border-red-500/30'
      case 'HOLD':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30'
    }
  }

  const getSignalIcon = () => {
    switch (signal.signal) {
      case 'BUY':
        return <TrendingUp size={24} />
      case 'SELL':
        return <TrendingDown size={24} />
      default:
        return <Signal size={24} />
    }
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <Signal size={20} className="text-[var(--primary)]" />
        Trading Signal
      </h3>

      {/* Main Signal */}
      <div
        className={cn(
          'rounded-lg border-2 p-6 mb-4 flex items-center justify-between',
          getSignalColor()
        )}
      >
        <div>
          <div className="text-3xl font-bold mb-1">{signal.signal}</div>
          <div className="text-sm opacity-80">Setup Strength: {signal.setupStrength}</div>
        </div>
        <div>{getSignalIcon()}</div>
      </div>

      {/* Probabilities */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-[var(--background)] rounded-lg p-4">
          <div className="text-xs text-[var(--muted-foreground)] mb-1">Bullish Probability</div>
          <div className="text-2xl font-bold text-green-500">
            {signal.bullishProbability}%
          </div>
          <div className="w-full h-2 bg-[var(--muted)] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${signal.bullishProbability}%` }}
            />
          </div>
        </div>

        <div className="bg-[var(--background)] rounded-lg p-4">
          <div className="text-xs text-[var(--muted-foreground)] mb-1">Bearish Probability</div>
          <div className="text-2xl font-bold text-red-500">
            {signal.bearishProbability}%
          </div>
          <div className="w-full h-2 bg-[var(--muted)] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-red-500"
              style={{ width: `${signal.bearishProbability}%` }}
            />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 bg-[var(--background)] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--muted-foreground)]">Confidence</span>
          <span className="text-sm font-medium text-[var(--foreground)]">
            {signal.confidence}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--muted-foreground)]">Risk Level</span>
          <span
            className={cn(
              'text-sm font-medium',
              signal.riskLevel === 'high'
                ? 'text-red-500'
                : signal.riskLevel === 'low'
                ? 'text-green-500'
                : 'text-yellow-500'
            )}
          >
            {signal.riskLevel.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Summary */}
      {signal.summary && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            {signal.summary}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          This analysis is for educational purposes only and not financial advice. Always do your
          own research and never trade with money you cannot afford to lose.
        </p>
      </div>
    </div>
  )
}
