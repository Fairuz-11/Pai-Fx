// Base Market Data Provider Interface

import { Candle, Quote, Timeframe } from '@/types/market'

export interface MarketDataProvider {
  name: string
  getCandles(symbol: string, timeframe: Timeframe, limit?: number): Promise<Candle[]>
  getQuote(symbol: string): Promise<Quote>
  searchSymbol(query: string): Promise<{ symbol: string; name: string }[]>
}

export abstract class BaseMarketProvider implements MarketDataProvider {
  abstract name: string
  protected apiKey: string
  protected baseUrl: string

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  abstract getCandles(symbol: string, timeframe: Timeframe, limit?: number): Promise<Candle[]>
  abstract getQuote(symbol: string): Promise<Quote>
  abstract searchSymbol(query: string): Promise<{ symbol: string; name: string }[]>

  protected async fetchWithRetry(url: string, options?: RequestInit, retries: number = 3): Promise<Response> {
    let lastError: Error | null = null

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        })

        if (response.ok) {
          return response
        }

        // If rate limited, wait and retry
        if (response.status === 429) {
          const waitTime = Math.pow(2, i) * 1000 // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      } catch (error) {
        lastError = error as Error
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
      }
    }

    throw lastError || new Error('Failed to fetch data')
  }

  protected normalizeSymbol(symbol: string): string {
    // Convert EUR/USD to EURUSD format
    return symbol.replace('/', '')
  }

  protected denormalizeSymbol(symbol: string): string {
    // Convert EURUSD to EUR/USD format
    if (symbol.length === 6 && !symbol.includes('/')) {
      return `${symbol.substring(0, 3)}/${symbol.substring(3)}`
    }
    return symbol
  }
}
