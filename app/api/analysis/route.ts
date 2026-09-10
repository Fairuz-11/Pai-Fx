import { NextRequest, NextResponse } from 'next/server'
import { ProviderFactory } from '@/lib/market/provider-factory'
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

    // Fetch candles
    const provider = ProviderFactory.getProvider()
    const candles = await provider.getCandles(symbol, timeframe as Timeframe, 200)

    if (candles.length === 0) {
      return NextResponse.json(
        { error: 'No data available for analysis' },
        { status: 404 }
      )
    }

    // Get current price
    const currentPrice = candles[candles.length - 1].close
    const previousPrice = candles[candles.length - 2]?.close || currentPrice
    const change = currentPrice - previousPrice
    const changePercent = (change / previousPrice) * 100

    // Calculate indicators
    const indicators = calculateAllIndicators(candles)

    // Analyze trend
    const trendAnalysis = analyzeTrend(candles)
    const trendSummary = getTrendSummary(trendAnalysis)

    // Calculate signal score
    const signalScore = calculateSignalScore(candles)
    const signalSummary = getSignalSummary(signalScore)

    // Detect support & resistance
    const supportResistance = detectSupportResistance(candles)
    const nearestSupport = findNearestSupport(candles, supportResistance)
    const nearestResistance = findNearestResistance(candles, supportResistance)

    // Analyze market structure
    const marketStructure = analyzeMarketStructure(candles)
    const structureSummary = getStructureSummary(marketStructure)

    // Detect candle patterns
    const patterns = detectCandlePatterns(candles)
    const patternSummary = getPatternSummary(patterns)

    return NextResponse.json({
      symbol,
      timeframe,
      timestamp: Date.now(),
      
      // Price data
      currentPrice,
      change,
      changePercent,
      
      // Indicators
      indicators: {
        ema20: indicators.ema20,
        ema50: indicators.ema50,
        ema200: indicators.ema200,
        rsi: indicators.rsi,
        macd: indicators.macd,
        bollingerBands: indicators.bollingerBands,
        atr: indicators.atr,
      },
      
      // Trend analysis
      trend: {
        ...trendAnalysis,
        summary: trendSummary,
      },
      
      // Signal
      signal: {
        ...signalScore,
        summary: signalSummary,
      },

      // Support & Resistance
      supportResistance: {
        levels: supportResistance,
        nearestSupport,
        nearestResistance,
      },

      // Market Structure
      marketStructure: {
        structures: marketStructure,
        summary: structureSummary,
      },

      // Patterns
      patterns: {
        detected: patterns,
        summary: patternSummary,
      },
    })
  } catch (error) {
    console.error('Error in /api/analysis:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze market' },
      { status: 500 }
    )
  }
}
