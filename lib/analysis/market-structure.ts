// Market Structure Analysis (Higher Highs, Higher Lows, etc.)

import { Candle, MarketStructure, TrendDirection } from '@/types/market'

export function analyzeMarketStructure(
  candles: Candle[],
  lookback: number = 50
): MarketStructure[] {
  if (candles.length < lookback) {
    return []
  }

  const recentCandles = candles.slice(-lookback)
  const structures: MarketStructure[] = []

  // Find swing points
  const swingPoints = findSwingPoints(recentCandles)

  // Analyze structure from swing points
  for (let i = 1; i < swingPoints.length; i++) {
    const current = swingPoints[i]
    const previous = swingPoints[i - 1]

    let type: 'HH' | 'HL' | 'LH' | 'LL'
    let trend: TrendDirection

    if (current.type === 'high' && previous.type === 'high') {
      if (current.price > previous.price) {
        type = 'HH'
        trend = 'bullish'
      } else {
        type = 'LH'
        trend = 'bearish'
      }

      structures.push({
        type,
        trend,
        timestamp: current.timestamp,
      })
    } else if (current.type === 'low' && previous.type === 'low') {
      if (current.price > previous.price) {
        type = 'HL'
        trend = 'bullish'
      } else {
        type = 'LL'
        trend = 'bearish'
      }

      structures.push({
        type,
        trend,
        timestamp: current.timestamp,
      })
    }
  }

  return structures
}

interface SwingPoint {
  type: 'high' | 'low'
  price: number
  timestamp: number
  index: number
}

function findSwingPoints(candles: Candle[], windowSize: number = 5): SwingPoint[] {
  const swingPoints: SwingPoint[] = []

  for (let i = windowSize; i < candles.length - windowSize; i++) {
    const candle = candles[i]

    // Check for swing high
    let isSwingHigh = true
    for (let j = i - windowSize; j <= i + windowSize; j++) {
      if (j !== i && candles[j].high >= candle.high) {
        isSwingHigh = false
        break
      }
    }

    if (isSwingHigh) {
      swingPoints.push({
        type: 'high',
        price: candle.high,
        timestamp: candle.timestamp || Date.now(),
        index: i,
      })
      continue
    }

    // Check for swing low
    let isSwingLow = true
    for (let j = i - windowSize; j <= i + windowSize; j++) {
      if (j !== i && candles[j].low <= candle.low) {
        isSwingLow = false
        break
      }
    }

    if (isSwingLow) {
      swingPoints.push({
        type: 'low',
        price: candle.low,
        timestamp: candle.timestamp || Date.now(),
        index: i,
      })
    }
  }

  return swingPoints
}

export function getMarketStructureTrend(structures: MarketStructure[]): TrendDirection {
  if (structures.length === 0) {
    return 'neutral'
  }

  const recent = structures.slice(-5)
  const bullishCount = recent.filter(s => s.trend === 'bullish').length
  const bearishCount = recent.filter(s => s.trend === 'bearish').length

  if (bullishCount > bearishCount * 1.5) {
    return 'bullish'
  } else if (bearishCount > bullishCount * 1.5) {
    return 'bearish'
  }

  return 'neutral'
}

export function isBreakOfStructure(
  candles: Candle[],
  structures: MarketStructure[]
): { bos: boolean; direction: 'bullish' | 'bearish' | null } {
  if (structures.length < 2 || candles.length < 2) {
    return { bos: false, direction: null }
  }

  const currentPrice = candles[candles.length - 1].close
  const previousStructure = structures[structures.length - 1]

  // Find the last significant swing point
  const swingPoints = findSwingPoints(candles.slice(-50))
  if (swingPoints.length < 2) {
    return { bos: false, direction: null }
  }

  const lastSwing = swingPoints[swingPoints.length - 1]
  const prevSwing = swingPoints[swingPoints.length - 2]

  // Bullish BOS: price breaks above previous high in a bearish structure
  if (previousStructure.trend === 'bearish' && lastSwing.type === 'high') {
    if (currentPrice > lastSwing.price) {
      return { bos: true, direction: 'bullish' }
    }
  }

  // Bearish BOS: price breaks below previous low in a bullish structure
  if (previousStructure.trend === 'bullish' && lastSwing.type === 'low') {
    if (currentPrice < lastSwing.price) {
      return { bos: true, direction: 'bearish' }
    }
  }

  return { bos: false, direction: null }
}

export function getStructureSummary(structures: MarketStructure[]): string {
  if (structures.length === 0) {
    return 'Insufficient data for market structure analysis.'
  }

  const recent = structures.slice(-5)
  const types = recent.map(s => s.type).join(' → ')
  const trend = getMarketStructureTrend(structures)

  return `Market Structure: ${types}. Overall trend: ${trend.toUpperCase()}`
}
