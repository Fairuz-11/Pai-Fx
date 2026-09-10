import { NextResponse } from 'next/server'
import { ProviderFactory } from '@/lib/market/provider-factory'
import { MockProvider } from '@/lib/market/mock-provider'

const MAJOR_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
  'XAU/USD',
]

export async function GET() {
  try {
    const provider = ProviderFactory.getProvider()

    // Fetch quotes for all major pairs with per-symbol fallback
    const quotes = await Promise.all(
      MAJOR_PAIRS.map(async (symbol) => {
        try {
          return await provider.getQuote(symbol)
        } catch (error) {
          console.error(`[market] Failed to fetch ${symbol} from primary provider, using mock:`, error)
          try {
            const mockProvider = new MockProvider()
            return await mockProvider.getQuote(symbol)
          } catch {
            return null
          }
        }
      })
    )

    const validQuotes = quotes.filter((q) => q !== null)

    return NextResponse.json({
      pairs: validQuotes,
      provider: provider.name,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('[market] Unhandled error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}
