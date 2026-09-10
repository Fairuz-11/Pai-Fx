// Market Data Provider Factory

import { MarketDataProvider } from './base-provider'
import { TwelveDataProvider } from './twelve-data-provider'
import { AlphaVantageProvider } from './alpha-vantage-provider'
import { MockProvider } from './mock-provider'

export type ProviderType = 'twelve_data' | 'alpha_vantage' | 'finnhub' | 'mock'

export class ProviderFactory {
  static createProvider(type: ProviderType): MarketDataProvider {
    const apiKey = process.env.MARKET_DATA_API_KEY || ''
    const baseUrl = process.env.MARKET_DATA_BASE_URL || ''

    switch (type) {
      case 'twelve_data':
        if (!apiKey) {
          console.warn('MARKET_DATA_API_KEY not set, using Mock provider')
          return new MockProvider()
        }
        return new TwelveDataProvider(apiKey, baseUrl || 'https://api.twelvedata.com')

      case 'alpha_vantage':
        if (!apiKey) {
          console.warn('MARKET_DATA_API_KEY not set, using Mock provider')
          return new MockProvider()
        }
        return new AlphaVantageProvider(apiKey, baseUrl || 'https://www.alphavantage.co')

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
