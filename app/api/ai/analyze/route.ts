import { NextRequest, NextResponse } from 'next/server'
import { AIFactory } from '@/lib/ai/ai-factory'
import { AIAnalysisInput } from '@/lib/ai/base-ai-provider'

export async function POST(request: NextRequest) {
  try {
    // Check if AI is enabled
    if (!AIFactory.isAIEnabled()) {
      return NextResponse.json(
        {
          error: 'AI analysis not configured',
          message: 'Please configure GROQ_API_KEY or OPENAI_API_KEY in environment variables.',
        },
        { status: 503 }
      )
    }

    // Parse request body - be lenient, normalize manually
    const body = await request.json()

    // Normalize RSI - might be an object {current, values} or a number
    const rsiRaw = body.indicators?.rsi
    const rsiValue =
      typeof rsiRaw === 'number'
        ? rsiRaw
        : typeof rsiRaw?.current === 'number'
        ? rsiRaw.current
        : undefined

    // Normalize MACD - might have extra fields
    const macdRaw = body.indicators?.macd
    const macdValue =
      macdRaw && typeof macdRaw.macd?.[macdRaw.macd.length - 1] !== 'undefined'
        ? {
            macd: macdRaw.macd[macdRaw.macd.length - 1] ?? 0,
            signal: macdRaw.signal[macdRaw.signal.length - 1] ?? 0,
            histogram: macdRaw.histogram[macdRaw.histogram.length - 1] ?? 0,
          }
        : macdRaw?.macd !== undefined && typeof macdRaw.macd === 'number'
        ? { macd: macdRaw.macd, signal: macdRaw.signal ?? 0, histogram: macdRaw.histogram ?? 0 }
        : undefined

    // Normalize EMA - might be an object {values, period} or a number
    const getEma = (val: any): number | undefined => {
      if (typeof val === 'number') return val
      if (Array.isArray(val?.values)) return val.values[val.values.length - 1]
      if (typeof val?.current === 'number') return val.current
      return undefined
    }

    const input: AIAnalysisInput = {
      symbol: String(body.symbol || 'Unknown'),
      timeframe: String(body.timeframe || '1h'),
      currentPrice: Number(body.currentPrice || 0),
      changePercent: Number(body.changePercent ?? body.change ?? 0),
      trend: {
        direction: String(body.trend?.direction || 'neutral'),
        strength: String(body.trend?.strength || 'weak'),
        score: Number(body.trend?.score || 50),
        emaAlignment: Boolean(body.trend?.emaAlignment ?? false),
      },
      signal: {
        signal: String(body.signal?.signal || 'NEUTRAL'),
        bullishProbability: Number(body.signal?.bullishProbability || 50),
        bearishProbability: Number(body.signal?.bearishProbability || 50),
        confidence: Number(body.signal?.confidence || 50),
        setupStrength: String(body.signal?.setupStrength || 'weak'),
        riskLevel: String(body.signal?.riskLevel || 'medium'),
      },
      indicators: {
        rsi: rsiValue,
        macd: macdValue,
        ema20: getEma(body.indicators?.ema20),
        ema50: getEma(body.indicators?.ema50),
        ema200: getEma(body.indicators?.ema200),
      },
      supportResistance: {
        nearestSupport: body.supportResistance?.nearestSupport
          ? {
              level: Number(body.supportResistance.nearestSupport.level),
              strength: String(body.supportResistance.nearestSupport.strength || 'moderate'),
            }
          : undefined,
        nearestResistance: body.supportResistance?.nearestResistance
          ? {
              level: Number(body.supportResistance.nearestResistance.level),
              strength: String(body.supportResistance.nearestResistance.strength || 'moderate'),
            }
          : undefined,
      },
      patterns: Array.isArray(body.patterns)
        ? body.patterns.map((p: any) => (typeof p === 'string' ? p : p?.name || '')).filter(Boolean)
        : [],
      marketStructure: String(body.marketStructure || 'No clear structure'),
    }

    // Get AI provider and analyze
    const aiProvider = AIFactory.createProvider()
    if (!aiProvider) {
      return NextResponse.json({ error: 'AI provider not available' }, { status: 503 })
    }

    const analysis = await aiProvider.analyze(input)

    return NextResponse.json({
      provider: aiProvider.name,
      analysis,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('[AI analyze] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate AI analysis',
      },
      { status: 500 }
    )
  }
}
