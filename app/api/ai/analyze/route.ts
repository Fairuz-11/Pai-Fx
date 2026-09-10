import { NextRequest, NextResponse } from 'next/server'
import { AIFactory } from '@/lib/ai/ai-factory'
import { AIAnalysisInput } from '@/lib/ai/base-ai-provider'
import { z } from 'zod'

const requestSchema = z.object({
  symbol: z.string(),
  timeframe: z.string(),
  currentPrice: z.number(),
  changePercent: z.number(),
  trend: z.object({
    direction: z.string(),
    strength: z.string(),
    score: z.number(),
    emaAlignment: z.boolean(),
  }),
  signal: z.object({
    signal: z.string(),
    bullishProbability: z.number(),
    bearishProbability: z.number(),
    confidence: z.number(),
    setupStrength: z.string(),
    riskLevel: z.string(),
  }),
  indicators: z.object({
    rsi: z.number().optional(),
    macd: z.object({
      macd: z.number(),
      signal: z.number(),
      histogram: z.number(),
    }).optional(),
    ema20: z.number().optional(),
    ema50: z.number().optional(),
    ema200: z.number().optional(),
  }),
  supportResistance: z.object({
    nearestSupport: z.object({
      level: z.number(),
      strength: z.string(),
    }).optional(),
    nearestResistance: z.object({
      level: z.number(),
      strength: z.string(),
    }).optional(),
  }),
  patterns: z.array(z.string()),
  marketStructure: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    // Check if AI is enabled
    if (!AIFactory.isAIEnabled()) {
      return NextResponse.json(
        { 
          error: 'AI analysis not configured',
          message: 'Please configure AI_API_KEY in environment variables to enable AI analysis.'
        },
        { status: 503 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = requestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const input: AIAnalysisInput = validation.data

    // Get AI provider
    const aiProvider = AIFactory.createProvider()
    
    if (!aiProvider) {
      return NextResponse.json(
        { error: 'AI provider not available' },
        { status: 503 }
      )
    }

    // Generate AI analysis
    const analysis = await aiProvider.analyze(input)

    return NextResponse.json({
      provider: aiProvider.name,
      analysis,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Error in /api/ai/analyze:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate AI analysis',
        fallback: true,
        analysis: {
          overview: 'AI analysis temporarily unavailable. Please refer to technical indicators for market assessment.',
          trendAnalysis: 'Technical analysis shows current market conditions based on price action and indicators.',
          momentum: 'Momentum can be assessed through RSI, MACD, and price structure.',
          supportResistance: 'Key support and resistance levels are identified in the main analysis.',
          bullishScenario: 'Bullish continuation possible above key resistance levels.',
          bearishScenario: 'Bearish reversal possible below key support levels.',
          riskFactors: [
            'Market volatility',
            'Economic data releases',
            'Geopolitical events',
            'Technical indicator divergence'
          ],
          tradingConsiderations: 'Always use proper risk management, set stop losses, and trade with capital you can afford to lose.',
        }
      },
      { status: 500 }
    )
  }
}
