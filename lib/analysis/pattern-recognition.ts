// Candlestick Pattern Recognition

import { Candle, CandlePattern } from '@/types/market'

export function detectCandlePatterns(
  candles: Candle[],
  lookback: number = 20
): CandlePattern[] {
  if (candles.length < 3) {
    return []
  }

  const patterns: CandlePattern[] = []
  const recentCandles = candles.slice(-lookback)

  for (let i = 2; i < recentCandles.length; i++) {
    const current = recentCandles[i]
    const prev = recentCandles[i - 1]
    const prev2 = recentCandles[i - 2]

    // Doji
    const dojiPattern = detectDoji(current)
    if (dojiPattern) {
      patterns.push({
        ...dojiPattern,
        timestamp: current.timestamp || Date.now(),
      })
    }

    // Hammer
    const hammerPattern = detectHammer(current)
    if (hammerPattern) {
      patterns.push({
        ...hammerPattern,
        timestamp: current.timestamp || Date.now(),
      })
    }

    // Shooting Star
    const shootingStarPattern = detectShootingStar(current)
    if (shootingStarPattern) {
      patterns.push({
        ...shootingStarPattern,
        timestamp: current.timestamp || Date.now(),
      })
    }

    // Bullish Engulfing
    const bullishEngulfing = detectBullishEngulfing(current, prev)
    if (bullishEngulfing) {
      patterns.push({
        ...bullishEngulfing,
        timestamp: current.timestamp || Date.now(),
      })
    }

    // Bearish Engulfing
    const bearishEngulfing = detectBearishEngulfing(current, prev)
    if (bearishEngulfing) {
      patterns.push({
        ...bearishEngulfing,
        timestamp: current.timestamp || Date.now(),
      })
    }

    // Morning Star
    const morningStar = detectMorningStar(current, prev, prev2)
    if (morningStar) {
      patterns.push({
        ...morningStar,
        timestamp: current.timestamp || Date.now(),
      })
    }

    // Evening Star
    const eveningStar = detectEveningStar(current, prev, prev2)
    if (eveningStar) {
      patterns.push({
        ...eveningStar,
        timestamp: current.timestamp || Date.now(),
      })
    }

    // Pin Bar
    const pinBar = detectPinBar(current)
    if (pinBar) {
      patterns.push({
        ...pinBar,
        timestamp: current.timestamp || Date.now(),
      })
    }
  }

  return patterns
}

function detectDoji(candle: Candle): Omit<CandlePattern, 'timestamp'> | null {
  const body = Math.abs(candle.close - candle.open)
  const range = candle.high - candle.low

  if (range === 0) return null

  const bodyRatio = body / range

  if (bodyRatio < 0.1) {
    return {
      name: 'Doji',
      type: 'neutral',
      strength: 'moderate',
    }
  }

  return null
}

function detectHammer(candle: Candle): Omit<CandlePattern, 'timestamp'> | null {
  const body = Math.abs(candle.close - candle.open)
  const lowerWick = Math.min(candle.open, candle.close) - candle.low
  const upperWick = candle.high - Math.max(candle.open, candle.close)
  const range = candle.high - candle.low

  if (range === 0) return null

  // Hammer: small body, long lower wick, small upper wick
  if (lowerWick > body * 2 && upperWick < body * 0.5 && body / range < 0.3) {
    return {
      name: 'Hammer',
      type: 'bullish',
      strength: 'moderate',
    }
  }

  return null
}

function detectShootingStar(candle: Candle): Omit<CandlePattern, 'timestamp'> | null {
  const body = Math.abs(candle.close - candle.open)
  const lowerWick = Math.min(candle.open, candle.close) - candle.low
  const upperWick = candle.high - Math.max(candle.open, candle.close)
  const range = candle.high - candle.low

  if (range === 0) return null

  // Shooting Star: small body, long upper wick, small lower wick
  if (upperWick > body * 2 && lowerWick < body * 0.5 && body / range < 0.3) {
    return {
      name: 'Shooting Star',
      type: 'bearish',
      strength: 'moderate',
    }
  }

  return null
}

function detectBullishEngulfing(
  current: Candle,
  prev: Candle
): Omit<CandlePattern, 'timestamp'> | null {
  const prevBearish = prev.close < prev.open
  const currentBullish = current.close > current.open

  if (prevBearish && currentBullish) {
    // Current candle engulfs previous candle
    if (current.open < prev.close && current.close > prev.open) {
      const strength = current.close > prev.open * 1.005 ? 'strong' : 'moderate'
      return {
        name: 'Bullish Engulfing',
        type: 'bullish',
        strength,
      }
    }
  }

  return null
}

function detectBearishEngulfing(
  current: Candle,
  prev: Candle
): Omit<CandlePattern, 'timestamp'> | null {
  const prevBullish = prev.close > prev.open
  const currentBearish = current.close < current.open

  if (prevBullish && currentBearish) {
    // Current candle engulfs previous candle
    if (current.open > prev.close && current.close < prev.open) {
      const strength = current.close < prev.open * 0.995 ? 'strong' : 'moderate'
      return {
        name: 'Bearish Engulfing',
        type: 'bearish',
        strength,
      }
    }
  }

  return null
}

function detectMorningStar(
  current: Candle,
  prev: Candle,
  prev2: Candle
): Omit<CandlePattern, 'timestamp'> | null {
  const firstBearish = prev2.close < prev2.open
  const middleSmall = Math.abs(prev.close - prev.open) < Math.abs(prev2.close - prev2.open) * 0.3
  const lastBullish = current.close > current.open

  if (firstBearish && middleSmall && lastBullish) {
    // Last candle closes above midpoint of first candle
    const midpoint = (prev2.open + prev2.close) / 2
    if (current.close > midpoint) {
      return {
        name: 'Morning Star',
        type: 'bullish',
        strength: 'strong',
      }
    }
  }

  return null
}

function detectEveningStar(
  current: Candle,
  prev: Candle,
  prev2: Candle
): Omit<CandlePattern, 'timestamp'> | null {
  const firstBullish = prev2.close > prev2.open
  const middleSmall = Math.abs(prev.close - prev.open) < Math.abs(prev2.close - prev2.open) * 0.3
  const lastBearish = current.close < current.open

  if (firstBullish && middleSmall && lastBearish) {
    // Last candle closes below midpoint of first candle
    const midpoint = (prev2.open + prev2.close) / 2
    if (current.close < midpoint) {
      return {
        name: 'Evening Star',
        type: 'bearish',
        strength: 'strong',
      }
    }
  }

  return null
}

function detectPinBar(candle: Candle): Omit<CandlePattern, 'timestamp'> | null {
  const body = Math.abs(candle.close - candle.open)
  const lowerWick = Math.min(candle.open, candle.close) - candle.low
  const upperWick = candle.high - Math.max(candle.open, candle.close)
  const range = candle.high - candle.low

  if (range === 0) return null

  // Bullish Pin Bar: long lower wick
  if (lowerWick > body * 2.5 && lowerWick > range * 0.6) {
    return {
      name: 'Pin Bar',
      type: 'bullish',
      strength: 'moderate',
    }
  }

  // Bearish Pin Bar: long upper wick
  if (upperWick > body * 2.5 && upperWick > range * 0.6) {
    return {
      name: 'Pin Bar',
      type: 'bearish',
      strength: 'moderate',
    }
  }

  return null
}

export function getPatternSummary(patterns: CandlePattern[]): string {
  if (patterns.length === 0) {
    return 'No significant candlestick patterns detected.'
  }

  const bullishPatterns = patterns.filter(p => p.type === 'bullish')
  const bearishPatterns = patterns.filter(p => p.type === 'bearish')
  const neutralPatterns = patterns.filter(p => p.type === 'neutral')

  const summary: string[] = []

  if (bullishPatterns.length > 0) {
    const names = bullishPatterns.map(p => p.name).join(', ')
    summary.push(`Bullish patterns: ${names}`)
  }

  if (bearishPatterns.length > 0) {
    const names = bearishPatterns.map(p => p.name).join(', ')
    summary.push(`Bearish patterns: ${names}`)
  }

  if (neutralPatterns.length > 0) {
    const names = neutralPatterns.map(p => p.name).join(', ')
    summary.push(`Neutral patterns: ${names}`)
  }

  return summary.join('. ')
}

export function getMostRecentPattern(patterns: CandlePattern[]): CandlePattern | null {
  if (patterns.length === 0) return null
  
  return patterns.reduce((latest, current) => {
    return current.timestamp > latest.timestamp ? current : latest
  })
}
