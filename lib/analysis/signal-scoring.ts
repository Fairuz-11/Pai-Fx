// Signal Scoring Engine

import { Candle, SignalScore, SignalType, TrendStrength, RiskLevel } from '@/types/market'
import { analyzeTrend } from './trend-analysis'
import { getLatestRSI } from '@/lib/indicators/rsi'
import { getLatestMACD } from '@/lib/indicators/macd'
import { getLatestEMA } from '@/lib/indicators/ema'

export function calculateSignalScore(candles: Candle[]): SignalScore {
  if (candles.length < 200) {
    return {
      signal: 'NEUTRAL',
      bullishProbability: 50,
      bearishProbability: 50,
      setupStrength: 'weak',
      riskLevel: 'medium',
      confidence: 0,
      components: {
        emaTrend: 0,
        macd: 0,
        rsi: 0,
        marketStructure: 0,
        supportResistance: 0,
        candlePattern: 0,
        momentum: 0,
      },
    }
  }

  const components = {
    emaTrend: 0,
    macd: 0,
    rsi: 0,
    marketStructure: 0,
    supportResistance: 0,
    candlePattern: 0,
    momentum: 0,
  }

  // EMA Trend (20%)
  const trend = analyzeTrend(candles)
  if (trend.emaAlignment) {
    components.emaTrend = trend.direction === 'bullish' ? 20 : trend.direction === 'bearish' ? -20 : 0
  }

  // MACD (15%)
  const macd = getLatestMACD(candles)
  if (macd) {
    if (macd.histogram > 0 && macd.macd > macd.signal) {
      components.macd = 15
      if (macd.crossover === 'bullish') components.macd += 5
    } else if (macd.histogram < 0 && macd.macd < macd.signal) {
      components.macd = -15
      if (macd.crossover === 'bearish') components.macd -= 5
    }
  }

  // RSI (10%)
  const rsi = getLatestRSI(candles, 14)
  if (rsi) {
    if (rsi > 50 && rsi < 70) {
      components.rsi = 10
    } else if (rsi < 50 && rsi > 30) {
      components.rsi = -10
    } else if (rsi >= 70) {
      components.rsi = 5 // Overbought but still bullish
    } else if (rsi <= 30) {
      components.rsi = -5 // Oversold but still bearish
    }
  }

  // Market Structure (20%)
  if (trend.priceStructure === 'bullish') {
    components.marketStructure = 20
  } else if (trend.priceStructure === 'bearish') {
    components.marketStructure = -20
  }

  // Support/Resistance (15%)
  const currentPrice = candles[candles.length - 1].close
  const ema20 = getLatestEMA(candles, 20)
  const ema50 = getLatestEMA(candles, 50)

  if (ema20 && ema50) {
    // Near support (bullish)
    if (currentPrice > ema20 && currentPrice < ema20 * 1.002) {
      components.supportResistance = 15
    }
    // Near resistance (bearish)
    else if (currentPrice < ema20 && currentPrice > ema20 * 0.998) {
      components.supportResistance = -15
    }
  }

  // Candle Pattern (10%)
  const lastCandle = candles[candles.length - 1]
  const prevCandle = candles[candles.length - 2]
  
  // Bullish engulfing
  if (prevCandle.close < prevCandle.open && 
      lastCandle.close > lastCandle.open &&
      lastCandle.open < prevCandle.close &&
      lastCandle.close > prevCandle.open) {
    components.candlePattern = 10
  }
  // Bearish engulfing
  else if (prevCandle.close > prevCandle.open && 
           lastCandle.close < lastCandle.open &&
           lastCandle.open > prevCandle.close &&
           lastCandle.close < prevCandle.open) {
    components.candlePattern = -10
  }
  // Hammer (bullish)
  else if (lastCandle.close > lastCandle.open &&
           (lastCandle.open - lastCandle.low) > (lastCandle.high - lastCandle.close) * 2) {
    components.candlePattern = 8
  }
  // Shooting star (bearish)
  else if (lastCandle.close < lastCandle.open &&
           (lastCandle.high - lastCandle.open) > (lastCandle.close - lastCandle.low) * 2) {
    components.candlePattern = -8
  }

  // Momentum (10%)
  const recentCandles = candles.slice(-10)
  const bullishCount = recentCandles.filter(c => c.close > c.open).length
  const momentumRatio = bullishCount / recentCandles.length

  if (momentumRatio > 0.6) {
    components.momentum = 10
  } else if (momentumRatio < 0.4) {
    components.momentum = -10
  }

  // Calculate total score
  const totalScore = Object.values(components).reduce((sum, val) => sum + val, 0)

  // Normalize to 0-100
  const normalizedScore = Math.max(0, Math.min(100, totalScore + 50))

  // Calculate probabilities
  const bullishProbability = Math.round(normalizedScore)
  const bearishProbability = 100 - bullishProbability

  // Determine signal
  let signal: SignalType = 'NEUTRAL'
  if (bullishProbability >= 65) {
    signal = 'BUY'
  } else if (bearishProbability >= 65) {
    signal = 'SELL'
  } else if (bullishProbability >= 55) {
    signal = 'HOLD' // Weak buy bias
  } else if (bearishProbability >= 55) {
    signal = 'HOLD' // Weak sell bias
  }

  // Determine setup strength
  let setupStrength: TrendStrength = 'weak'
  const probability = Math.max(bullishProbability, bearishProbability)
  
  if (probability >= 80) {
    setupStrength = 'very_strong'
  } else if (probability >= 70) {
    setupStrength = 'strong'
  } else if (probability >= 60) {
    setupStrength = 'moderate'
  }

  // Determine risk level
  let riskLevel: RiskLevel = 'medium'
  
  if (rsi && (rsi > 70 || rsi < 30)) {
    riskLevel = 'high'
  } else if (setupStrength === 'very_strong' || setupStrength === 'strong') {
    riskLevel = 'low'
  }

  // Calculate confidence (how aligned are the components)
  const positiveComponents = Object.values(components).filter(v => v > 0).length
  const negativeComponents = Object.values(components).filter(v => v < 0).length
  const totalComponents = Object.values(components).filter(v => v !== 0).length
  
  const alignment = totalComponents > 0 
    ? Math.max(positiveComponents, negativeComponents) / totalComponents 
    : 0

  const confidence = Math.round(alignment * 100)

  return {
    signal,
    bullishProbability,
    bearishProbability,
    setupStrength,
    riskLevel,
    confidence,
    components,
  }
}

export function getSignalSummary(signalScore: SignalScore): string {
  const { signal, setupStrength, confidence, bullishProbability } = signalScore

  if (signal === 'BUY') {
    return `BUY signal with ${bullishProbability}% bullish probability. Setup strength is ${setupStrength} with ${confidence}% confidence.`
  } else if (signal === 'SELL') {
    return `SELL signal with ${signalScore.bearishProbability}% bearish probability. Setup strength is ${setupStrength} with ${confidence}% confidence.`
  } else if (signal === 'HOLD') {
    return `HOLD - Market shows ${bullishProbability > 50 ? 'slight bullish' : 'slight bearish'} bias but not strong enough for clear entry.`
  } else {
    return `NEUTRAL - Market is in consolidation. Wait for clearer directional bias.`
  }
}

export function shouldTakeSignal(signalScore: SignalScore): boolean {
  const { signal, setupStrength, confidence, riskLevel } = signalScore

  // Don't take NEUTRAL or HOLD signals
  if (signal === 'NEUTRAL' || signal === 'HOLD') {
    return false
  }

  // Don't take high risk signals with weak setup
  if (riskLevel === 'high' && setupStrength === 'weak') {
    return false
  }

  // Take strong or very strong setups with good confidence
  if ((setupStrength === 'strong' || setupStrength === 'very_strong') && confidence >= 60) {
    return true
  }

  // Take moderate setups with high confidence
  if (setupStrength === 'moderate' && confidence >= 70) {
    return true
  }

  return false
}
