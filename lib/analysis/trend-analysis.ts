// Trend Analysis Engine

import { Candle, TrendDirection, TrendStrength, TrendAnalysis } from '@/types/market'
import { calculateEMA, getLatestEMA } from '@/lib/indicators/ema'
import { getLatestRSI } from '@/lib/indicators/rsi'
import { getLatestMACD } from '@/lib/indicators/macd'

export function analyzeTrend(candles: Candle[]): TrendAnalysis {
  if (candles.length < 200) {
    return {
      direction: 'neutral',
      strength: 'weak',
      score: 50,
      emaAlignment: false,
      priceStructure: 'neutral',
      momentum: 'weak',
    }
  }

  const currentPrice = candles[candles.length - 1].close
  const ema20 = getLatestEMA(candles, 20)
  const ema50 = getLatestEMA(candles, 50)
  const ema200 = getLatestEMA(candles, 200)
  const rsi = getLatestRSI(candles, 14)
  const macd = getLatestMACD(candles)

  let score = 0
  let direction: TrendDirection = 'neutral'
  let emaAlignment = false
  let momentum: 'strong' | 'weak' = 'weak'

  // EMA Alignment Check (25 points)
  if (ema20 && ema50 && ema200) {
    if (currentPrice > ema20 && ema20 > ema50 && ema50 > ema200) {
      score += 25
      emaAlignment = true
    } else if (currentPrice < ema20 && ema20 < ema50 && ema50 < ema200) {
      score -= 25
      emaAlignment = true
    }
  }

  // Price Structure (20 points)
  const priceStructure = analyzeMarketStructure(candles)
  if (priceStructure === 'bullish') {
    score += 20
  } else if (priceStructure === 'bearish') {
    score -= 20
  }

  // MACD (15 points)
  if (macd) {
    if (macd.histogram > 0 && macd.macd > macd.signal) {
      score += 15
      if (macd.crossover === 'bullish') score += 5
    } else if (macd.histogram < 0 && macd.macd < macd.signal) {
      score -= 15
      if (macd.crossover === 'bearish') score -= 5
    }
  }

  // RSI (10 points)
  if (rsi) {
    if (rsi > 50 && rsi < 70) {
      score += 10
    } else if (rsi < 50 && rsi > 30) {
      score -= 10
    }
  }

  // Momentum (15 points)
  const recentCandles = candles.slice(-10)
  const bullishCandles = recentCandles.filter(c => c.close > c.open).length
  const momentumRatio = bullishCandles / recentCandles.length

  if (momentumRatio > 0.6) {
    score += 15
    momentum = 'strong'
  } else if (momentumRatio < 0.4) {
    score -= 15
    momentum = 'strong'
  }

  // Support/Resistance (15 points)
  const nearSupport = isNearSupport(candles)
  const nearResistance = isNearResistance(candles)

  if (nearSupport) {
    score += 15
  } else if (nearResistance) {
    score -= 15
  }

  // Normalize score to 0-100
  const normalizedScore = Math.max(0, Math.min(100, score + 50))

  // Determine direction
  if (normalizedScore > 60) {
    direction = 'bullish'
  } else if (normalizedScore < 40) {
    direction = 'bearish'
  } else {
    direction = 'neutral'
  }

  // Determine strength
  let strength: TrendStrength = 'weak'
  const distanceFromNeutral = Math.abs(normalizedScore - 50)

  if (distanceFromNeutral > 35) {
    strength = 'very_strong'
  } else if (distanceFromNeutral > 20) {
    strength = 'strong'
  } else if (distanceFromNeutral > 10) {
    strength = 'moderate'
  }

  return {
    direction,
    strength,
    score: normalizedScore,
    emaAlignment,
    priceStructure,
    momentum,
  }
}

function analyzeMarketStructure(candles: Candle[], lookback: number = 20): TrendDirection {
  if (candles.length < lookback) {
    return 'neutral'
  }

  const recentCandles = candles.slice(-lookback)
  const highs = recentCandles.map(c => c.high)
  const lows = recentCandles.map(c => c.low)

  let higherHighs = 0
  let lowerLows = 0
  let higherLows = 0
  let lowerHighs = 0

  for (let i = 5; i < recentCandles.length; i += 5) {
    const prevHigh = Math.max(...highs.slice(i - 5, i))
    const currHigh = Math.max(...highs.slice(i, i + 5))
    const prevLow = Math.min(...lows.slice(i - 5, i))
    const currLow = Math.min(...lows.slice(i, i + 5))

    if (currHigh > prevHigh) higherHighs++
    if (currHigh < prevHigh) lowerHighs++
    if (currLow > prevLow) higherLows++
    if (currLow < prevLow) lowerLows++
  }

  // Bullish: HH + HL
  if (higherHighs > lowerHighs && higherLows > lowerLows) {
    return 'bullish'
  }

  // Bearish: LH + LL
  if (lowerHighs > higherHighs && lowerLows > higherLows) {
    return 'bearish'
  }

  return 'neutral'
}

function isNearSupport(candles: Candle[], threshold: number = 0.002): boolean {
  if (candles.length < 50) return false

  const currentPrice = candles[candles.length - 1].close
  const recentLows = candles.slice(-50).map(c => c.low)
  const significantLows = findSignificantLevels(recentLows)

  for (const low of significantLows) {
    const distance = Math.abs(currentPrice - low) / currentPrice
    if (distance < threshold && currentPrice > low) {
      return true
    }
  }

  return false
}

function isNearResistance(candles: Candle[], threshold: number = 0.002): boolean {
  if (candles.length < 50) return false

  const currentPrice = candles[candles.length - 1].close
  const recentHighs = candles.slice(-50).map(c => c.high)
  const significantHighs = findSignificantLevels(recentHighs)

  for (const high of significantHighs) {
    const distance = Math.abs(currentPrice - high) / currentPrice
    if (distance < threshold && currentPrice < high) {
      return true
    }
  }

  return false
}

function findSignificantLevels(prices: number[]): number[] {
  const levels: number[] = []
  const tolerance = 0.0015 // 0.15% tolerance for grouping levels

  for (let i = 2; i < prices.length - 2; i++) {
    const price = prices[i]
    const prev1 = prices[i - 1]
    const prev2 = prices[i - 2]
    const next1 = prices[i + 1]
    const next2 = prices[i + 2]

    // Check if it's a local extremum
    if ((price < prev1 && price < prev2 && price < next1 && price < next2) ||
        (price > prev1 && price > prev2 && price > next1 && price > next2)) {
      
      // Check if similar level already exists
      const exists = levels.some(level => {
        const diff = Math.abs(level - price) / price
        return diff < tolerance
      })

      if (!exists) {
        levels.push(price)
      }
    }
  }

  return levels.sort((a, b) => b - a)
}

export function getTrendSummary(trend: TrendAnalysis): string {
  const { direction, strength, score } = trend

  if (direction === 'bullish') {
    if (strength === 'very_strong') {
      return 'Strong bullish trend with excellent upside momentum'
    } else if (strength === 'strong') {
      return 'Solid bullish trend with good upward momentum'
    } else if (strength === 'moderate') {
      return 'Moderate bullish bias with room for continuation'
    } else {
      return 'Weak bullish bias, trend not fully established'
    }
  } else if (direction === 'bearish') {
    if (strength === 'very_strong') {
      return 'Strong bearish trend with significant downside pressure'
    } else if (strength === 'strong') {
      return 'Solid bearish trend with consistent downward momentum'
    } else if (strength === 'moderate') {
      return 'Moderate bearish bias with potential for further decline'
    } else {
      return 'Weak bearish bias, trend not fully established'
    }
  } else {
    return 'Market is in consolidation, no clear directional bias'
  }
}
