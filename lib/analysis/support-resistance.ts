// Support & Resistance Detection

import { Candle, SupportResistance } from '@/types/market'

export function detectSupportResistance(
  candles: Candle[],
  lookback: number = 50,
  touchThreshold: number = 0.0015
): SupportResistance[] {
  if (candles.length < lookback) {
    return []
  }

  const recentCandles = candles.slice(-lookback)
  const levels: SupportResistance[] = []

  // Find swing highs (potential resistance)
  const resistanceLevels = findSwingHighs(recentCandles)
  
  // Find swing lows (potential support)
  const supportLevels = findSwingLows(recentCandles)

  // Process resistance levels
  for (const price of resistanceLevels) {
    const touches = countTouches(recentCandles, price, touchThreshold, 'high')
    const strength = getStrength(touches)
    
    if (touches >= 2) {
      levels.push({
        type: 'resistance',
        level: price,
        zone: {
          lower: price * (1 - touchThreshold),
          upper: price * (1 + touchThreshold),
        },
        strength,
        touches,
      })
    }
  }

  // Process support levels
  for (const price of supportLevels) {
    const touches = countTouches(recentCandles, price, touchThreshold, 'low')
    const strength = getStrength(touches)
    
    if (touches >= 2) {
      levels.push({
        type: 'support',
        level: price,
        zone: {
          lower: price * (1 - touchThreshold),
          upper: price * (1 + touchThreshold),
        },
        strength,
        touches,
      })
    }
  }

  // Sort by relevance (closer to current price = more relevant)
  const currentPrice = candles[candles.length - 1].close
  levels.sort((a, b) => {
    const distA = Math.abs(a.level - currentPrice)
    const distB = Math.abs(b.level - currentPrice)
    return distA - distB
  })

  // Return top 10 most relevant levels
  return levels.slice(0, 10)
}

function findSwingHighs(candles: Candle[], windowSize: number = 5): number[] {
  const highs: number[] = []
  
  for (let i = windowSize; i < candles.length - windowSize; i++) {
    const currentHigh = candles[i].high
    let isSwingHigh = true

    // Check if current high is greater than surrounding highs
    for (let j = i - windowSize; j <= i + windowSize; j++) {
      if (j !== i && candles[j].high >= currentHigh) {
        isSwingHigh = false
        break
      }
    }

    if (isSwingHigh) {
      highs.push(currentHigh)
    }
  }

  return clusterLevels(highs)
}

function findSwingLows(candles: Candle[], windowSize: number = 5): number[] {
  const lows: number[] = []
  
  for (let i = windowSize; i < candles.length - windowSize; i++) {
    const currentLow = candles[i].low
    let isSwingLow = true

    // Check if current low is less than surrounding lows
    for (let j = i - windowSize; j <= i + windowSize; j++) {
      if (j !== i && candles[j].low <= currentLow) {
        isSwingLow = false
        break
      }
    }

    if (isSwingLow) {
      lows.push(currentLow)
    }
  }

  return clusterLevels(lows)
}

function clusterLevels(levels: number[], threshold: number = 0.002): number[] {
  if (levels.length === 0) return []

  const clusters: number[][] = []
  const sorted = [...levels].sort((a, b) => a - b)

  let currentCluster: number[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const prevPrice = sorted[i - 1]
    const currPrice = sorted[i]
    const diff = Math.abs(currPrice - prevPrice) / prevPrice

    if (diff <= threshold) {
      currentCluster.push(currPrice)
    } else {
      clusters.push(currentCluster)
      currentCluster = [currPrice]
    }
  }
  clusters.push(currentCluster)

  // Return average of each cluster
  return clusters.map(cluster => {
    const sum = cluster.reduce((acc, val) => acc + val, 0)
    return sum / cluster.length
  })
}

function countTouches(
  candles: Candle[],
  level: number,
  threshold: number,
  type: 'high' | 'low'
): number {
  let touches = 0

  for (const candle of candles) {
    const price = type === 'high' ? candle.high : candle.low
    const diff = Math.abs(price - level) / level

    if (diff <= threshold) {
      touches++
    }
  }

  return touches
}

function getStrength(touches: number): 'weak' | 'moderate' | 'strong' {
  if (touches >= 4) return 'strong'
  if (touches >= 3) return 'moderate'
  return 'weak'
}

export function findNearestSupport(
  candles: Candle[],
  levels: SupportResistance[]
): SupportResistance | null {
  const currentPrice = candles[candles.length - 1].close
  const supportLevels = levels
    .filter(l => l.type === 'support' && l.level < currentPrice)
    .sort((a, b) => b.level - a.level) // Sort descending

  return supportLevels[0] || null
}

export function findNearestResistance(
  candles: Candle[],
  levels: SupportResistance[]
): SupportResistance | null {
  const currentPrice = candles[candles.length - 1].close
  const resistanceLevels = levels
    .filter(l => l.type === 'resistance' && l.level > currentPrice)
    .sort((a, b) => a.level - b.level) // Sort ascending

  return resistanceLevels[0] || null
}

export function isPriceAtLevel(
  candles: Candle[],
  level: SupportResistance,
  threshold: number = 0.002
): boolean {
  const currentPrice = candles[candles.length - 1].close
  const diff = Math.abs(currentPrice - level.level) / level.level
  return diff <= threshold
}
