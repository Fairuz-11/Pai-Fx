// Mock Provider for Development/Demo
// Generates realistic-looking market data for testing

import { BaseMarketProvider } from './base-provider'
import { Candle, Quote, Timeframe } from '@/types/market'

export class MockProvider extends BaseMarketProvider {
  name = 'mock'

  constructor() {
    super('mock-key', 'mock-url')
  }

  async getCandles(symbol: string, timeframe: Timeframe, limit: number = 100): Promise<Candle[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const candles: Candle[] = []
    const now = Date.now()
    const timeframeMs = this.getTimeframeInMs(timeframe)

    // Base price varies by symbol
    let basePrice = 1.17 // EUR/USD
    if (symbol.includes('GBP')) basePrice = 1.38
    if (symbol.includes('JPY')) basePrice = 149.5
    if (symbol.includes('XAU')) basePrice = 2048

    let currentPrice = basePrice

    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = now - (i * timeframeMs)
      
      // Random walk
      const change = (Math.random() - 0.5) * 0.002 * basePrice
      currentPrice += change

      const open = currentPrice
      const high = open + Math.random() * 0.001 * basePrice
      const low = open - Math.random() * 0.001 * basePrice
      const close = low + Math.random() * (high - low)

      candles.push({
        timestamp,
        open: parseFloat(open.toFixed(5)),
        high: parseFloat(high.toFixed(5)),
        low: parseFloat(low.toFixed(5)),
        close: parseFloat(close.toFixed(5)),
        volume: Math.floor(Math.random() * 10000) + 1000,
      })

      currentPrice = close
    }

    return candles
  }

  async getQuote(symbol: string): Promise<Quote> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))

    let basePrice = 1.17 // EUR/USD
    if (symbol.includes('GBP')) basePrice = 1.38
    if (symbol.includes('JPY')) basePrice = 149.5
    if (symbol.includes('CHF')) basePrice = 0.88
    if (symbol.includes('AUD')) basePrice = 0.65
    if (symbol.includes('CAD')) basePrice = 1.36
    if (symbol.includes('NZD')) basePrice = 0.60
    if (symbol.includes('XAU')) basePrice = 2048

    const price = basePrice + (Math.random() - 0.5) * 0.01 * basePrice
    const change = (Math.random() - 0.5) * 0.005 * basePrice
    const changePercent = (change / price) * 100

    return {
      symbol,
      price: parseFloat(price.toFixed(5)),
      change: parseFloat(change.toFixed(5)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      timestamp: Date.now(),
    }
  }

  async searchSymbol(query: string): Promise<{ symbol: string; name: string }[]> {
    const pairs = [
      { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
      { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
      { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen' },
      { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc' },
      { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar' },
      { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar' },
      { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar' },
      { symbol: 'XAU/USD', name: 'Gold / US Dollar' },
    ]

    return pairs.filter(pair => 
      pair.symbol.toLowerCase().includes(query.toLowerCase()) ||
      pair.name.toLowerCase().includes(query.toLowerCase())
    )
  }

  private getTimeframeInMs(timeframe: Timeframe): number {
    const map: Record<Timeframe, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1D': 24 * 60 * 60 * 1000,
      '1W': 7 * 24 * 60 * 60 * 1000,
    }
    return map[timeframe]
  }
}
