// Exponential Moving Average (EMA) Calculation

import { Candle } from '@/types/market'

export function calculateEMA(candles: Candle[], period: number): number[] {
  if (candles.length < period) {
    return []
  }

  const prices = candles.map(c => c.close)
  const ema: number[] = []
  const multiplier = 2 / (period + 1)

  // Calculate initial SMA for first EMA value
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += prices[i]
  }
  const initialEMA = sum / period
  ema.push(initialEMA)

  // Calculate EMA for remaining values
  for (let i = period; i < prices.length; i++) {
    const currentEMA = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]
    ema.push(currentEMA)
  }

  return ema
}

export function getLatestEMA(candles: Candle[], period: number): number | null {
  const ema = calculateEMA(candles, period)
  return ema.length > 0 ? ema[ema.length - 1] : null
}

export function getEMACrossover(
  candles: Candle[],
  fastPeriod: number,
  slowPeriod: number
): 'bullish' | 'bearish' | null {
  const fastEMA = calculateEMA(candles, fastPeriod)
  const slowEMA = calculateEMA(candles, slowPeriod)

  if (fastEMA.length < 2 || slowEMA.length < 2) {
    return null
  }

  const prevFast = fastEMA[fastEMA.length - 2]
  const prevSlow = slowEMA[slowEMA.length - 2]
  const currFast = fastEMA[fastEMA.length - 1]
  const currSlow = slowEMA[slowEMA.length - 1]

  // Bullish crossover: fast crosses above slow
  if (prevFast <= prevSlow && currFast > currSlow) {
    return 'bullish'
  }

  // Bearish crossover: fast crosses below slow
  if (prevFast >= prevSlow && currFast < currSlow) {
    return 'bearish'
  }

  return null
}
