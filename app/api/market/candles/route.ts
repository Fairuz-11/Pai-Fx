import { NextRequest, NextResponse } from 'next/server'
import { ProviderFactory } from '@/lib/market/provider-factory'
import { MockProvider } from '@/lib/market/mock-provider'
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

    // Try primary provider, fallback to mock on error
    let candles
    let usedFallback = false

    try {
      const provider = ProviderFactory.getProvider()
      candles = await provider.getCandles(symbol, timeframe as Timeframe, limit)
    } catch (providerError) {
      console.error('[candles] Primary provider failed, falling back to mock:', providerError)
      const mockProvider = new MockProvider()
      candles = await mockProvider.getCandles(symbol, timeframe as Timeframe, limit)
      usedFallback = true
    }

    // Cache: shorter TTL for real data, longer for mock
    const cacheTtl = usedFallback ? 60 : (timeframe === '1m' ? 30 : timeframe === '5m' ? 60 : 180)
    marketCache.set(cacheKey, candles, cacheTtl)

    return NextResponse.json({
      symbol,
      timeframe,
      candles,
      cached: false,
      fallback: usedFallback,
    })
  } catch (error) {
    console.error('[candles] Unhandled error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch candles' },
      { status: 500 }
    )
  }
}
