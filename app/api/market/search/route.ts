import { NextRequest, NextResponse } from 'next/server'
import { ProviderFactory } from '@/lib/market/provider-factory'
import { z } from 'zod'

const querySchema = z.object({
  q: z.string().min(1),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const validation = querySchema.safeParse({
      q: searchParams.get('q'),
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { q } = validation.data

    // Fetch from provider
    const provider = ProviderFactory.getProvider()
    const results = await provider.searchSymbol(q)

    return NextResponse.json({
      query: q,
      results,
    })
  } catch (error) {
    console.error('Error in /api/market/search:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search symbols' },
      { status: 500 }
    )
  }
}
