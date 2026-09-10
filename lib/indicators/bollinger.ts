// Bollinger Bands Calculation

import { Candle, BollingerBands } from '@/types/market'
import { calculateSMA } from './sma'

export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  stdDev: number = 2
): BollingerBands {
  if (candles.length < period) {
    return {
      period,
      stdDev,
      upper: [],
      middle: [],
      lower: [],
    }
  }

  const prices = candles.map(c => c.close)
  const middle = calculateSMA(candles, period)
  const upper: number[] = []
  const lower: number[] = []

  for (let i = period - 1; i < prices.length; i++) {
    // Calculate standard deviation for the period
    const slice = prices.slice(i - period + 1, i + 1)
    const mean = middle[i - period + 1]
    
    const variance = slice.reduce((sum, price) => {
      return sum + Math.pow(price - mean, 2)
    }, 0) / period
    
    const standardDeviation = Math.sqrt(variance)

    upper.push(mean + (stdDev * standardDeviation))
    lower.push(mean - (stdDev * standardDeviation))
  }

  return {
    period,
    stdDev,
    upper,
    middle,
    lower,
  }
}

export function getLatestBollingerBands(
  candles: Candle[],
  period: number = 20,
  stdDev: number = 2
): { upper: number; middle: number; lower: number } | null {
  const bands = calculateBollingerBands(candles, period, stdDev)
  
  if (bands.upper.length === 0) {
    return null
  }

  return {
    upper: bands.upper[bands.upper.length - 1],
    middle: bands.middle[bands.middle.length - 1],
    lower: bands.lower[bands.lower.length - 1],
  }
}

export function getBollingerPosition(
  candles: Candle[],
  period: number = 20,
  stdDev: number = 2
): 'upper' | 'middle' | 'lower' | null {
  const bands = getLatestBollingerBands(candles, period, stdDev)
  
  if (!bands) {
    return null
  }

  const currentPrice = candles[candles.length - 1].close
  const bandwidth = bands.upper - bands.lower
  const upperThreshold = bands.upper - (bandwidth * 0.1)
  const lowerThreshold = bands.lower + (bandwidth * 0.1)

  if (currentPrice >= upperThreshold) {
    return 'upper'
  } else if (currentPrice <= lowerThreshold) {
    return 'lower'
  }

  return 'middle'
}

export function getBollingerSqueeze(
  candles: Candle[],
  period: number = 20,
  stdDev: number = 2,
  threshold: number = 0.05
): boolean {
  const bands = getLatestBollingerBands(candles, period, stdDev)
  
  if (!bands) {
    return false
  }

  const bandwidth = (bands.upper - bands.lower) / bands.middle
  return bandwidth < threshold
}
