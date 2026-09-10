'use client'

import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface IndicatorsCardProps {
  indicators: {
    ema20?: number
    ema50?: number
    ema200?: number
    rsi?: number
    macd?: {
      macd: number
      signal: number
      histogram: number
      crossover: 'bullish' | 'bearish' | null
    }
    bollingerBands?: {
      upper: number
      middle: number
      lower: number
    }
    atr?: number
  }
}

export function IndicatorsCard({ indicators }: IndicatorsCardProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <Activity size={20} className="text-[var(--primary)]" />
        Technical Indicators
      </h3>

      <div className="space-y-4">
        {/* EMAs */}
        <div>
          <h4 className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
            Exponential Moving Averages
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--background)] rounded-lg p-3">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">EMA 20</div>
              <div className="text-sm font-medium text-[var(--foreground)]">
                {indicators.ema20 ? formatPrice(indicators.ema20) : 'N/A'}
              </div>
            </div>
            <div className="bg-[var(--background)] rounded-lg p-3">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">EMA 50</div>
              <div className="text-sm font-medium text-[var(--foreground)]">
                {indicators.ema50 ? formatPrice(indicators.ema50) : 'N/A'}
              </div>
            </div>
            <div className="bg-[var(--background)] rounded-lg p-3">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">EMA 200</div>
              <div className="text-sm font-medium text-[var(--foreground)]">
                {indicators.ema200 ? formatPrice(indicators.ema200) : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* RSI */}
        <div>
          <h4 className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
            RSI (14)
          </h4>
          <div className="bg-[var(--background)] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-[var(--foreground)]">
                {indicators.rsi?.toFixed(2) || 'N/A'}
              </span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  indicators.rsi && indicators.rsi > 70
                    ? 'bg-red-500/20 text-red-500'
                    : indicators.rsi && indicators.rsi < 30
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-blue-500/20 text-blue-500'
                }`}
              >
                {indicators.rsi && indicators.rsi > 70
                  ? 'Overbought'
                  : indicators.rsi && indicators.rsi < 30
                  ? 'Oversold'
                  : 'Neutral'}
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                style={{ width: `${indicators.rsi || 50}%` }}
              />
            </div>
          </div>
        </div>

        {/* MACD */}
        {indicators.macd && (
          <div>
            <h4 className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
              MACD (12, 26, 9)
            </h4>
            <div className="bg-[var(--background)] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">MACD</span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {indicators.macd.macd.toFixed(5)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">Signal</span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {indicators.macd.signal.toFixed(5)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">Histogram</span>
                <span
                  className={`text-sm font-medium ${
                    indicators.macd.histogram > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {indicators.macd.histogram.toFixed(5)}
                </span>
              </div>
              {indicators.macd.crossover && (
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                  {indicators.macd.crossover === 'bullish' ? (
                    <TrendingUp size={16} className="text-green-500" />
                  ) : (
                    <TrendingDown size={16} className="text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      indicators.macd.crossover === 'bullish'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {indicators.macd.crossover === 'bullish' ? 'Bullish' : 'Bearish'} Crossover
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bollinger Bands */}
        {indicators.bollingerBands && (
          <div>
            <h4 className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
              Bollinger Bands (20, 2)
            </h4>
            <div className="bg-[var(--background)] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">Upper</span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {formatPrice(indicators.bollingerBands.upper)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">Middle</span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {formatPrice(indicators.bollingerBands.middle)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">Lower</span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {formatPrice(indicators.bollingerBands.lower)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ATR */}
        {indicators.atr && (
          <div>
            <h4 className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
              ATR (14) - Volatility
            </h4>
            <div className="bg-[var(--background)] rounded-lg p-3">
              <div className="text-lg font-bold text-[var(--foreground)]">
                {indicators.atr.toFixed(5)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
