// Relative Strength Index (RSI) Calculation

import { Candle, RSI } from '@/types/market'

export function calculateRSI(candles: Candle[], period: number = 14): RSI {
  if (candles.length < period + 1) {
    return {
      period,
      values: [],
      current: 50,
      condition: 'neutral',
    }
  }

  const prices = candles.map(c => c.close)
  const rsiValues: number[] = []

  // Calculate price changes
  const changes: number[] = []
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1])
  }

  // Calculate initial average gain and loss
  let avgGain = 0
  let avgLoss = 0

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i]
    } else {
      avgLoss += Math.abs(changes[i])
    }
  }

  avgGain /= period
  avgLoss /= period

  // Calculate first RSI
  let rs = avgGain / (avgLoss || 1)
  let rsi = 100 - (100 / (1 + rs))
  rsiValues.push(rsi)

  // Calculate remaining RSI values using smoothed averages
  for (let i = period; i < changes.length; i++) {
    const change = changes[i]
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? Math.abs(change) : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    rs = avgGain / (avgLoss || 1)
    rsi = 100 - (100 / (1 + rs))
    rsiValues.push(rsi)
  }

  const currentRSI = rsiValues[rsiValues.length - 1]

  let condition: 'overbought' | 'oversold' | 'neutral' = 'neutral'
  if (currentRSI > 70) {
    condition = 'overbought'
  } else if (currentRSI < 30) {
    condition = 'oversold'
  }

  return {
    period,
    values: rsiValues,
    current: currentRSI,
    condition,
  }
}

export function getLatestRSI(candles: Candle[], period: number = 14): number | null {
  const rsi = calculateRSI(candles, period)
  return rsi.current
}

export function isRSIDivergence(
  candles: Candle[],
  rsiValues: number[],
  lookback: number = 14
): 'bullish' | 'bearish' | null {
  if (candles.length < lookback || rsiValues.length < lookback) {
    return null
  }

  const recentCandles = candles.slice(-lookback)
  const recentRSI = rsiValues.slice(-lookback)

  const priceLows = recentCandles.map(c => c.low)
  const priceHighs = recentCandles.map(c => c.high)

  // Bullish divergence: price makes lower low, RSI makes higher low
  const priceLowestIdx = priceLows.indexOf(Math.min(...priceLows))
  const rsiLowestIdx = recentRSI.indexOf(Math.min(...recentRSI))
  
  if (priceLowestIdx > rsiLowestIdx) {
    const priceIsLower = priceLows[priceLowestIdx] < priceLows[rsiLowestIdx]
    const rsiIsHigher = recentRSI[priceLowestIdx] > recentRSI[rsiLowestIdx]
    if (priceIsLower && rsiIsHigher) {
      return 'bullish'
    }
  }

  // Bearish divergence: price makes higher high, RSI makes lower high
  const priceHighestIdx = priceHighs.indexOf(Math.max(...priceHighs))
  const rsiHighestIdx = recentRSI.indexOf(Math.max(...recentRSI))
  
  if (priceHighestIdx > rsiHighestIdx) {
    const priceIsHigher = priceHighs[priceHighestIdx] > priceHighs[rsiHighestIdx]
    const rsiIsLower = recentRSI[priceHighestIdx] < recentRSI[rsiHighestIdx]
    if (priceIsHigher && rsiIsLower) {
      return 'bearish'
    }
  }

  return null
}
