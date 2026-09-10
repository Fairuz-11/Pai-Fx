'use client'

import { useState } from 'react'
import { Timeframe } from '@/types/market'
import { CandlestickChart } from './candlestick-chart'
import { ChartToolbar } from './chart-toolbar'
import { IndicatorPanel } from './indicator-panel'

interface ChartContainerProps {
  symbol: string
  defaultTimeframe?: Timeframe
}

export function ChartContainer({ symbol, defaultTimeframe = '1h' }: ChartContainerProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>(defaultTimeframe)
  const [chartKey, setChartKey] = useState(0)
  const [indicators, setIndicators] = useState([
    { id: 'ema20', name: 'EMA 20', enabled: true, color: '#3b82f6' },
    { id: 'ema50', name: 'EMA 50', enabled: true, color: '#f59e0b' },
    { id: 'ema200', name: 'EMA 200', enabled: false, color: '#ef4444' },
    { id: 'sma20', name: 'SMA 20', enabled: false, color: '#8b5cf6' },
    { id: 'sma50', name: 'SMA 50', enabled: false, color: '#ec4899' },
    { id: 'bollinger', name: 'Bollinger Bands', enabled: false, color: '#6366f1' },
  ])

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe)
  }

  const handleRefresh = () => {
    // Force chart remount by changing key
    setChartKey(prev => prev + 1)
  }

  const handleFullscreen = () => {
    // TODO: Implement fullscreen mode
    console.log('Fullscreen not implemented yet')
  }

  const handleToggleIndicator = (id: string) => {
    setIndicators(prev =>
      prev.map(ind => (ind.id === id ? { ...ind, enabled: !ind.enabled } : ind))
    )
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
        <ChartToolbar
          symbol={symbol}
          timeframe={timeframe}
          onTimeframeChange={handleTimeframeChange}
          onRefresh={handleRefresh}
          onFullscreen={handleFullscreen}
        />
        <div className="p-4">
          <CandlestickChart
            key={chartKey}
            symbol={symbol}
            timeframe={timeframe}
            height={500}
            showVolume={true}
          />
        </div>
      </div>

      {/* Indicators Panel */}
      <IndicatorPanel indicators={indicators} onToggleIndicator={handleToggleIndicator} />

      {/* Chart Info */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">Pair</p>
            <p className="font-medium text-[var(--foreground)]">{symbol}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">Timeframe</p>
            <p className="font-medium text-[var(--foreground)]">{timeframe}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">Chart Type</p>
            <p className="font-medium text-[var(--foreground)]">Candlestick</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">Status</p>
            <p className="font-medium text-green-500">Real-time</p>
          </div>
        </div>
      </div>
    </div>
  )
}
