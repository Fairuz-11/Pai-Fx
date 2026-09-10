import { NextRequest, NextResponse } from 'next/server'
import { ProviderFactory } from '@/lib/market/provider-factory'
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

    // Check cache first (cache quotes for 10 seconds)
    const cacheKey = `quote:${symbol}`
    const cached = marketCache.get(cacheKey)
    
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
      })
    }

    // Fetch from provider
    const provider = ProviderFactory.getProvider()
    const quote = await provider.getQuote(symbol)

    // Cache for 10 seconds
    marketCache.set(cacheKey, quote, 10)

    return NextResponse.json({
      ...quote,
      cached: false,
    })
  } catch (error) {
    console.error('Error in /api/market/quote:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch quote' },
      { status: 500 }
    )
  }
}
