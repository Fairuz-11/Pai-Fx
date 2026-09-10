import { NextRequest, NextResponse } from 'next/server'
import { ProviderFactory } from '@/lib/market/provider-factory'
import { MockProvider } from '@/lib/market/mock-provider'
import { Timeframe } from '@/types/market'
import { calculateAllIndicators } from '@/lib/indicators'
import { analyzeTrend, getTrendSummary } from '@/lib/analysis/trend-analysis'
import { calculateSignalScore, getSignalSummary } from '@/lib/analysis/signal-scoring'
import { detectSupportResistance, findNearestSupport, findNearestResistance } from '@/lib/analysis/support-resistance'
import { analyzeMarketStructure, getStructureSummary } from '@/lib/analysis/market-structure'
import { detectCandlePatterns, getPatternSummary } from '@/lib/analysis/pattern-recognition'
import { z } from 'zod'

const querySchema = z.object({
  symbol: z.string().min(1),
  timeframe: z.enum(['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W']).default('1h'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const validation = querySchema.safeParse({
      symbol: searchParams.get('symbol'),
      timeframe: searchParams.get('timeframe'),
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { symbol, timeframe } = validation.data

    // Fetch candles — fallback to mock if primary provider fails
    let candles
    try {
      const provider = ProviderFactory.getProvider()
      candles = await provider.getCandles(symbol, timeframe as Timeframe, 200)
    } catch (err) {
      console.warn('[analysis] Primary provider failed, using mock:', err)
      const mock = new MockProvider()
      candles = await mock.getCandles(symbol, timeframe as Timeframe, 200)
    }

    if (!candles || candles.length === 0) {
      return NextResponse.json(
        { error: 'No data available for analysis' },
        { status: 404 }
      )
    }

    // Current price
    const currentPrice = candles[candles.length - 1].close
    const previousPrice = candles[candles.length - 2]?.close || currentPrice
    const change = currentPrice - previousPrice
    const changePercent = (change / previousPrice) * 100

    // Calculate all analysis
    const indicators      = calculateAllIndicators(candles)
    const trendAnalysis   = analyzeTrend(candles)
    const trendSummary    = getTrendSummary(trendAnalysis)
    const signalScore     = calculateSignalScore(candles)
    const signalSummary   = getSignalSummary(signalScore)
    const srLevels        = detectSupportResistance(candles)
    const nearestSupport  = findNearestSupport(candles, srLevels)
    const nearestResistance = findNearestResistance(candles, srLevels)
    const marketStructure = analyzeMarketStructure(candles)
    const structureSummary = getStructureSummary(marketStructure)
    const patterns        = detectCandlePatterns(candles)
    const patternSummary  = getPatternSummary(patterns)

    return NextResponse.json({
      symbol,
      timeframe,
      timestamp: Date.now(),

      currentPrice,
      change,
      changePercent,

      indicators: {
        ema20: indicators.ema20,
        ema50: indicators.ema50,
        ema200: indicators.ema200,
        rsi: indicators.rsi,
        macd: indicators.macd,
        bollingerBands: indicators.bollingerBands,
        atr: indicators.atr,
      },

      trend: {
        ...trendAnalysis,
        summary: trendSummary,
      },

      signal: {
        ...signalScore,
        summary: signalSummary,
      },

      supportResistance: {
        levels: srLevels,
        nearestSupport,
        nearestResistance,
      },

      marketStructure: {
        structures: marketStructure,
        summary: structureSummary,
      },

      patterns: {
        detected: patterns,
        summary: patternSummary,
      },
    })
  } catch (error) {
    console.error('[analysis] Unhandled error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze market' },
      { status: 500 }
    )
  }
}
