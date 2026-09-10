import { NextRequest, NextResponse } from 'next/server'
import { ProviderFactory } from '@/lib/market/provider-factory'
import { marketCache } from '@/lib/market/cache'
import { Timeframe } from '@/types/market'
import { z } from 'zod'

const querySchema = z.object({
  symbol: z.string().min(1),
  timeframe: z.enum(['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W']),
  limit: z.coerce.number().min(1).max(500).optional().default(100),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const validation = querySchema.safeParse({
      symbol: searchParams.get('symbol'),
      timeframe: searchParams.get('timeframe'),
      limit: searchParams.get('limit'),
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { symbol, timeframe, limit } = validation.data

    // Check cache first
    const cacheKey = `candles:${symbol}:${timeframe}:${limit}`
    const cached = marketCache.get(cacheKey)
    
    if (cached) {
      return NextResponse.json({
        symbol,
        timeframe,
        candles: cached,
        cached: true,
      })
    }

    // Fetch from provider
    const provider = ProviderFactory.getProvider()
    const candles = await provider.getCandles(symbol, timeframe as Timeframe, limit)

    // Cache for 1 minute for 1m timeframe, longer for higher timeframes
    const cacheTtl = timeframe === '1m' ? 60 : timeframe === '5m' ? 120 : 300
    marketCache.set(cacheKey, candles, cacheTtl)

    return NextResponse.json({
      symbol,
      timeframe,
      candles,
      cached: false,
    })
  } catch (error) {
    console.error('Error in /api/market/candles:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch candles' },
      { status: 500 }
    )
  }
}
