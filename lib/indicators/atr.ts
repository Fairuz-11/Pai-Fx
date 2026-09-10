// Average True Range (ATR) Calculation

import { Candle, ATR } from '@/types/market'

export function calculateATR(candles: Candle[], period: number = 14): ATR {
  if (candles.length < period + 1) {
    return {
      period,
      values: [],
      current: 0,
    }
  }

  const trueRanges: number[] = []

  // Calculate True Range for each candle
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high
    const low = candles[i].low
    const prevClose = candles[i - 1].close

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    )

    trueRanges.push(tr)
  }

  const atrValues: number[] = []

  // Calculate initial ATR (SMA of first period true ranges)
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += trueRanges[i]
  }
  const initialATR = sum / period
  atrValues.push(initialATR)

  // Calculate remaining ATR values (smoothed)
  for (let i = period; i < trueRanges.length; i++) {
    const atr = (atrValues[atrValues.length - 1] * (period - 1) + trueRanges[i]) / period
    atrValues.push(atr)
  }

  return {
    period,
    values: atrValues,
    current: atrValues[atrValues.length - 1],
  }
}

export function getLatestATR(candles: Candle[], period: number = 14): number | null {
  const atr = calculateATR(candles, period)
  return atr.current || null
}

export function getVolatilityLevel(candles: Candle[], period: number = 14): 'low' | 'medium' | 'high' {
  const atr = calculateATR(candles, period)
  
  if (atr.values.length === 0) {
    return 'medium'
  }

  const currentPrice = candles[candles.length - 1].close
  const atrPercent = (atr.current / currentPrice) * 100

  if (atrPercent < 0.5) {
    return 'low'
  } else if (atrPercent > 1.5) {
    return 'high'
  }

  return 'medium'
}

export function getATRBasedStopLoss(
  candles: Candle[],
  direction: 'long' | 'short',
  multiplier: number = 2,
  period: number = 14
): number {
  const atr = calculateATR(candles, period)
  const currentPrice = candles[candles.length - 1].close

  if (direction === 'long') {
    return currentPrice - (atr.current * multiplier)
  } else {
    return currentPrice + (atr.current * multiplier)
  }
}
