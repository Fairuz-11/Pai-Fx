// Simple Moving Average (SMA) Calculation

import { Candle } from '@/types/market'

export function calculateSMA(candles: Candle[], period: number): number[] {
  if (candles.length < period) {
    return []
  }

  const prices = candles.map(c => c.close)
  const sma: number[] = []

  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += prices[i - j]
    }
    sma.push(sum / period)
  }

  return sma
}

export function getLatestSMA(candles: Candle[], period: number): number | null {
  const sma = calculateSMA(candles, period)
  return sma.length > 0 ? sma[sma.length - 1] : null
}

export function getSMACrossover(
  candles: Candle[],
  fastPeriod: number,
  slowPeriod: number
): 'bullish' | 'bearish' | null {
  const fastSMA = calculateSMA(candles, fastPeriod)
  const slowSMA = calculateSMA(candles, slowPeriod)

  if (fastSMA.length < 2 || slowSMA.length < 2) {
    return null
  }

  const prevFast = fastSMA[fastSMA.length - 2]
  const prevSlow = slowSMA[slowSMA.length - 2]
  const currFast = fastSMA[fastSMA.length - 1]
  const currSlow = slowSMA[slowSMA.length - 1]

  // Bullish crossover
  if (prevFast <= prevSlow && currFast > currSlow) {
    return 'bullish'
  }

  // Bearish crossover
  if (prevFast >= prevSlow && currFast < currSlow) {
    return 'bearish'
  }

  return null
}
