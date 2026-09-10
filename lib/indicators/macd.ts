// Moving Average Convergence Divergence (MACD) Calculation

import { Candle, MACD } from '@/types/market'
import { calculateEMA } from './ema'

export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACD {
  if (candles.length < slowPeriod + signalPeriod) {
    return {
      macd: [],
      signal: [],
      histogram: [],
      crossover: null,
    }
  }

  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA(candles, fastPeriod)
  const slowEMA = calculateEMA(candles, slowPeriod)

  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine: number[] = []
  const offset = slowPeriod - fastPeriod

  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push(fastEMA[i + offset] - slowEMA[i])
  }

  // Calculate signal line (EMA of MACD line)
  const signalLine: number[] = []
  const multiplier = 2 / (signalPeriod + 1)

  // Initial SMA for signal line
  let sum = 0
  for (let i = 0; i < signalPeriod && i < macdLine.length; i++) {
    sum += macdLine[i]
  }
  const initialSignal = sum / signalPeriod
  signalLine.push(initialSignal)

  // Calculate remaining signal line values
  for (let i = signalPeriod; i < macdLine.length; i++) {
    const signal = (macdLine[i] - signalLine[signalLine.length - 1]) * multiplier + signalLine[signalLine.length - 1]
    signalLine.push(signal)
  }

  // Calculate histogram (MACD - Signal)
  const histogram: number[] = []
  const startIdx = signalPeriod - 1

  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + startIdx] - signalLine[i])
  }

  // Detect crossover
  let crossover: 'bullish' | 'bearish' | null = null
  if (histogram.length >= 2) {
    const prev = histogram[histogram.length - 2]
    const curr = histogram[histogram.length - 1]

    if (prev <= 0 && curr > 0) {
      crossover = 'bullish'
    } else if (prev >= 0 && curr < 0) {
      crossover = 'bearish'
    }
  }

  return {
    macd: macdLine,
    signal: signalLine,
    histogram,
    crossover,
  }
}

export function getLatestMACD(candles: Candle[]): {
  macd: number
  signal: number
  histogram: number
  crossover: 'bullish' | 'bearish' | null
} | null {
  const result = calculateMACD(candles)
  
  if (result.macd.length === 0) {
    return null
  }

  const signalIdx = result.signal.length - 1
  const macdIdx = result.macd.length - result.signal.length + signalIdx

  return {
    macd: result.macd[macdIdx],
    signal: result.signal[signalIdx],
    histogram: result.histogram[result.histogram.length - 1],
    crossover: result.crossover,
  }
}
