import { NextResponse } from 'next/server'
import { ProviderFactory } from '@/lib/market/provider-factory'

export async function GET() {
  try {
    const provider = ProviderFactory.getProvider()
    
    // Default major Forex pairs
    const majorPairs = [
      'EUR/USD',
      'GBP/USD',
      'USD/JPY',
      'USD/CHF',
      'AUD/USD',
      'USD/CAD',
      'NZD/USD',
      'XAU/USD',
    ]

    // Fetch quotes for all major pairs
    const quotes = await Promise.all(
      majorPairs.map(async (symbol) => {
        try {
          return await provider.getQuote(symbol)
        } catch (error) {
          console.error(`Error fetching quote for ${symbol}:`, error)
          return null
        }
      })
    )

    // Filter out null values
    const validQuotes = quotes.filter(q => q !== null)

    return NextResponse.json({
      pairs: validQuotes,
      provider: provider.name,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Error in /api/market:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}
