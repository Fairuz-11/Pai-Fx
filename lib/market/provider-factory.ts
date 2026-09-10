// Market Data Provider Factory

import { MarketDataProvider } from './base-provider'
import { TwelveDataProvider } from './twelve-data-provider'
import { AlphaVantageProvider } from './alpha-vantage-provider'
import { MockProvider } from './mock-provider'

export type ProviderType = 'twelvedata' | 'alphavantage' | 'mock'

export class ProviderFactory {
  static createProvider(type: ProviderType): MarketDataProvider {
    switch (type) {
      case 'twelvedata': {
        const apiKey = process.env.TWELVE_DATA_API_KEY || ''
        if (!apiKey) {
          console.warn('TWELVE_DATA_API_KEY not set, falling back to Mock provider')
          return new MockProvider()
        }
        return new TwelveDataProvider(apiKey, 'https://api.twelvedata.com')
      }

      case 'alphavantage': {
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY || ''
        if (!apiKey) {
          console.warn('ALPHA_VANTAGE_API_KEY not set, falling back to Mock provider')
          return new MockProvider()
        }
        return new AlphaVantageProvider(apiKey, 'https://www.alphavantage.co')
      }

      case 'mock':
        return new MockProvider()

      default:
        console.warn(`Unknown provider type: ${type}, using Mock provider`)
        return new MockProvider()
    }
  }

  static getProvider(): MarketDataProvider {
    const providerType = (process.env.MARKET_DATA_PROVIDER || 'mock') as ProviderType
    return this.createProvider(providerType)
  }
}
