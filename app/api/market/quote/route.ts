import { NextRequest, NextResponse } from 'next/server'
import { ProviderFactory } from '@/lib/market/provider-factory'
import { MockProvider } from '@/lib/market/mock-provider'
import { marketCache } from '@/lib/market/cache'
import { z } from 'zod'

const querySchema = z.object({
  symbol: z.string().min(1),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const validation = querySchema.safeParse({
      symbol: searchParams.get('symbol'),
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { symbol } = validation.data

    // Check cache first
    const cacheKey = `quote:${symbol}`
    const cached = marketCache.get(cacheKey)

    if (cached) {
      return NextResponse.json({ quote: cached, cached: true })
    }

    // Try primary provider, fallback to mock on error
    let quote
    let usedFallback = false

    try {
      const provider = ProviderFactory.getProvider()
      quote = await provider.getQuote(symbol)
    } catch (providerError) {
      console.error('[quote] Primary provider failed, falling back to mock:', providerError)
      const mockProvider = new MockProvider()
      quote = await mockProvider.getQuote(symbol)
      usedFallback = true
    }

    // Cache for 15 seconds for real data, 10 for mock
    marketCache.set(cacheKey, quote, usedFallback ? 10 : 15)

    return NextResponse.json({ quote, cached: false, fallback: usedFallback })
  } catch (error) {
    console.error('[quote] Unhandled error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch quote' },
      { status: 500 }
    )
  }
}
