'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { AnalysisHeader } from '@/components/analysis/analysis-header'
import { SignalCard } from '@/components/analysis/signal-card'
import { TrendCard } from '@/components/analysis/trend-card'
import { IndicatorsCard } from '@/components/analysis/indicators-card'
import { AIAnalysisCard } from '@/components/analysis/ai-analysis-card'
import { Timeframe } from '@/types/market'
import { Loader2, TrendingUp, Target, Layers } from 'lucide-react'
import { formatPrice, formatPercent } from '@/lib/utils'

export default function AnalysisPage() {
  const [symbol, setSymbol] = useState('EUR/USD')
  const [timeframe, setTimeframe] = useState<Timeframe>('1h')
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalysis()
  }, [symbol, timeframe])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/analysis?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch analysis')
      }

      const data = await response.json()
      setAnalysis(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching analysis:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analysis')
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            Market Analysis
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Comprehensive technical analysis with signals and indicators
          </p>
        </div>

        {/* Analysis Header */}
        <AnalysisHeader
          symbol={symbol}
          timeframe={timeframe}
          onSymbolChange={setSymbol}
          onTimeframeChange={setTimeframe}
          onRefresh={fetchAnalysis}
        />

        {loading ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
              <p className="text-[var(--muted-foreground)]">Analyzing market data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchAnalysis}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : analysis ? (
          <>
            {/* Price Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Current Price</div>
                <div className="text-2xl font-bold text-[var(--foreground)]">
                  {formatPrice(analysis.currentPrice)}
                </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Change</div>
                <div
                  className={`text-2xl font-bold ${
                    analysis.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {formatPercent(analysis.changePercent)}
                </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Timeframe</div>
                <div className="text-2xl font-bold text-[var(--foreground)]">{timeframe}</div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Provider</div>
                <div className="text-sm font-medium text-[var(--foreground)] capitalize">
                  {process.env.NEXT_PUBLIC_PROVIDER || 'Mock'}
                </div>
              </div>
            </div>

            {/* Main Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Signal */}
              {analysis.signal && <SignalCard signal={analysis.signal} />}

              {/* Trend */}
              {analysis.trend && <TrendCard trend={analysis.trend} />}
            </div>

            {/* Indicators */}
            {analysis.indicators && <IndicatorsCard indicators={analysis.indicators} />}

            {/* AI Analysis */}
            <AIAnalysisCard 
              analysisData={analysis} 
              onGenerateAI={async () => {
                // Optionally refresh analysis after AI generation
                console.log('AI analysis generated')
              }}
            />

            {/* Support & Resistance */}
            {analysis.supportResistance && analysis.supportResistance.levels && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Target size={20} className="text-[var(--primary)]" />
                  Support & Resistance Levels
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nearest Support */}
                  {analysis.supportResistance.nearestSupport && (
                    <div className="bg-[var(--background)] rounded-lg p-4">
                      <div className="text-xs text-[var(--muted-foreground)] mb-2">
                        Nearest Support
                      </div>
                      <div className="text-xl font-bold text-green-500 mb-2">
                        {formatPrice(analysis.supportResistance.nearestSupport.level)}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        Zone: {formatPrice(analysis.supportResistance.nearestSupport.zone.lower)} -{' '}
                        {formatPrice(analysis.supportResistance.nearestSupport.zone.upper)}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-[var(--muted-foreground)]">Strength:</span>
                        <span className="text-xs font-medium text-[var(--foreground)] capitalize">
                          {analysis.supportResistance.nearestSupport.strength}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Nearest Resistance */}
                  {analysis.supportResistance.nearestResistance && (
                    <div className="bg-[var(--background)] rounded-lg p-4">
                      <div className="text-xs text-[var(--muted-foreground)] mb-2">
                        Nearest Resistance
                      </div>
                      <div className="text-xl font-bold text-red-500 mb-2">
                        {formatPrice(analysis.supportResistance.nearestResistance.level)}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        Zone:{' '}
                        {formatPrice(analysis.supportResistance.nearestResistance.zone.lower)} -{' '}
                        {formatPrice(analysis.supportResistance.nearestResistance.zone.upper)}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-[var(--muted-foreground)]">Strength:</span>
                        <span className="text-xs font-medium text-[var(--foreground)] capitalize">
                          {analysis.supportResistance.nearestResistance.strength}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* All Levels */}
                {analysis.supportResistance.levels.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
                      All Detected Levels ({analysis.supportResistance.levels.length})
                    </div>
                    <div className="space-y-2">
                      {analysis.supportResistance.levels.slice(0, 5).map((level: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-[var(--background)] rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                level.type === 'support'
                                  ? 'bg-green-500/20 text-green-500'
                                  : 'bg-red-500/20 text-red-500'
                              }`}
                            >
                              {level.type.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-[var(--foreground)]">
                              {formatPrice(level.level)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {level.touches} touches
                            </span>
                            <span className="text-xs font-medium text-[var(--foreground)] capitalize">
                              {level.strength}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Market Structure & Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Structure */}
              {analysis.marketStructure && analysis.marketStructure.structures && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <Layers size={20} className="text-[var(--primary)]" />
                    Market Structure
                  </h3>

                  {analysis.marketStructure.summary && (
                    <div className="mb-4 p-4 bg-[var(--background)] rounded-lg">
                      <p className="text-sm text-[var(--foreground)]">
                        {analysis.marketStructure.summary}
                      </p>
                    </div>
                  )}

                  {analysis.marketStructure.structures.length > 0 ? (
                    <div className="space-y-2">
                      {analysis.marketStructure.structures.slice(-5).reverse().map((struct: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
                        >
                          <span
                            className={`text-sm font-bold ${
                              struct.trend === 'bullish' ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {struct.type}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)] capitalize">
                            {struct.trend}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                      No structure patterns detected
                    </p>
                  )}
                </div>
              )}

              {/* Candle Patterns */}
              {analysis.patterns && analysis.patterns.detected && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-[var(--primary)]" />
                    Candlestick Patterns
                  </h3>

                  {analysis.patterns.summary && (
                    <div className="mb-4 p-4 bg-[var(--background)] rounded-lg">
                      <p className="text-sm text-[var(--foreground)]">{analysis.patterns.summary}</p>
                    </div>
                  )}

                  {analysis.patterns.detected.length > 0 ? (
                    <div className="space-y-2">
                      {analysis.patterns.detected.slice(-5).reverse().map((pattern: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
                        >
                          <div>
                            <div className="text-sm font-medium text-[var(--foreground)]">
                              {pattern.name}
                            </div>
                            {pattern.location && (
                              <div className="text-xs text-[var(--muted-foreground)] capitalize">
                                at {pattern.location}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                pattern.type === 'bullish'
                                  ? 'bg-green-500/20 text-green-500'
                                  : pattern.type === 'bearish'
                                  ? 'bg-red-500/20 text-red-500'
                                  : 'bg-gray-500/20 text-gray-500'
                              }`}
                            >
                              {pattern.type}
                            </span>
                            <span className="text-xs text-[var(--muted-foreground)] capitalize">
                              {pattern.strength}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                      No patterns detected
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </MainLayout>
  )
}
