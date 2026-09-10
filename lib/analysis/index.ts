// Analysis Engine Index

export * from './trend-analysis'
export * from './signal-scoring'
export * from './support-resistance'
export * from './market-structure'
export * from './pattern-recognition'

import { Candle, MarketAnalysis, Timeframe } from '@/types/market'
import { calculateAllIndicators } from '@/lib/indicators'
import { analyzeTrend } from './trend-analysis'
import { calculateSignalScore } from './signal-scoring'
import { detectSupportResistance } from './support-resistance'
import { analyzeMarketStructure } from './market-structure'
import { detectCandlePatterns } from './pattern-recognition'

export async function analyzeMarket(
  symbol: string,
  timeframe: Timeframe,
  candles: Candle[]
): Promise<MarketAnalysis> {
  const currentPrice = candles[candles.length - 1].close
  const previousPrice = candles[candles.length - 2]?.close || currentPrice
  const change = currentPrice - previousPrice
  const changePercent = (change / previousPrice) * 100

  // Calculate indicators
  const indicators = calculateAllIndicators(candles)

  // Analyze trend
  const trend = analyzeTrend(candles)

  // Calculate signal
  const signal = calculateSignalScore(candles)

  // Detect support & resistance
  const supportResistance = detectSupportResistance(candles)

  // Analyze market structure
  const marketStructure = analyzeMarketStructure(candles)

  // Detect patterns
  const patterns = detectCandlePatterns(candles)

  return {
    symbol,
    timeframe,
    timestamp: Date.now(),
    currentPrice,
    change,
    changePercent,
    indicators: {
      ema20: indicators.ema20 || undefined,
      ema50: indicators.ema50 || undefined,
      ema200: indicators.ema200 || undefined,
      rsi: {
        period: 14,
        values: [],
        current: indicators.rsi || 50,
        condition: indicators.rsi && indicators.rsi > 70 ? 'overbought' 
                  : indicators.rsi && indicators.rsi < 30 ? 'oversold' 
                  : 'neutral',
      },
      macd: {
        macd: indicators.macd?.macd ? [indicators.macd.macd] : [],
        signal: indicators.macd?.signal ? [indicators.macd.signal] : [],
        histogram: indicators.macd?.histogram ? [indicators.macd.histogram] : [],
        crossover: indicators.macd?.crossover || null,
      },
      bollingerBands: {
        period: 20,
        stdDev: 2,
        upper: indicators.bollingerBands?.upper ? [indicators.bollingerBands.upper] : [],
        middle: indicators.bollingerBands?.middle ? [indicators.bollingerBands.middle] : [],
        lower: indicators.bollingerBands?.lower ? [indicators.bollingerBands.lower] : [],
      },
      atr: {
        period: 14,
        values: [],
        current: indicators.atr || 0,
      },
    },
    trend,
    supportResistance,
    patterns,
    marketStructure,
    signal,
  }
}
