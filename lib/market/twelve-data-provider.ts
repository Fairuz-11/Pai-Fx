// Twelve Data API Provider
// https://twelvedata.com/docs

import { BaseMarketProvider } from './base-provider'
import { Candle, Quote, Timeframe } from '@/types/market'

export class TwelveDataProvider extends BaseMarketProvider {
  name = 'twelve_data'

  private timeframeMap: Record<Timeframe, string> = {
    '1m': '1min',
    '5m': '5min',
    '15m': '15min',
    '30m': '30min',
    '1h': '1h',
    '4h': '4h',
    '1D': '1day',
    '1W': '1week',
  }

  async getCandles(symbol: string, timeframe: Timeframe, limit: number = 100): Promise<Candle[]> {
    const normalizedSymbol = this.normalizeSymbol(symbol)
    const interval = this.timeframeMap[timeframe]

    const url = `${this.baseUrl}/time_series?symbol=${normalizedSymbol}&interval=${interval}&outputsize=${limit}&apikey=${this.apiKey}&format=JSON`

    try {
      const response = await this.fetchWithRetry(url)
      const data = await response.json()

      if (data.status === 'error') {
        throw new Error(data.message || 'API Error')
      }

      if (!data.values || !Array.isArray(data.values)) {
        throw new Error('Invalid data format from API')
      }

      return data.values.map((item: any) => ({
        timestamp: new Date(item.datetime).getTime(),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: item.volume ? parseFloat(item.volume) : undefined,
      })).reverse() // Reverse to get chronological order
    } catch (error) {
      console.error('Error fetching candles from Twelve Data:', error)
      throw error
    }
  }

  async getQuote(symbol: string): Promise<Quote> {
    const normalizedSymbol = this.normalizeSymbol(symbol)
    const url = `${this.baseUrl}/quote?symbol=${normalizedSymbol}&apikey=${this.apiKey}&format=JSON`

    try {
      const response = await this.fetchWithRetry(url)
      const data = await response.json()

      if (data.status === 'error') {
        throw new Error(data.message || 'API Error')
      }

      const price = parseFloat(data.close)
      const previousClose = parseFloat(data.previous_close)
      const change = price - previousClose
      const changePercent = (change / previousClose) * 100

      return {
        symbol: this.denormalizeSymbol(symbol),
        price,
        change,
        changePercent,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('Error fetching quote from Twelve Data:', error)
      throw error
    }
  }

  async searchSymbol(query: string): Promise<{ symbol: string; name: string }[]> {
    const url = `${this.baseUrl}/symbol_search?symbol=${query}&apikey=${this.apiKey}&format=JSON`

    try {
      const response = await this.fetchWithRetry(url)
      const data = await response.json()

      if (data.status === 'error') {
        throw new Error(data.message || 'API Error')
      }

      if (!data.data || !Array.isArray(data.data)) {
        return []
      }

      return data.data.map((item: any) => ({
        symbol: item.symbol,
        name: item.instrument_name || item.symbol,
      }))
    } catch (error) {
      console.error('Error searching symbol from Twelve Data:', error)
      return []
    }
  }
}
