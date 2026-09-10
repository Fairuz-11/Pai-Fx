// Alpha Vantage API Provider
// https://www.alphavantage.co/documentation/

import { BaseMarketProvider } from './base-provider'
import { Candle, Quote, Timeframe } from '@/types/market'

export class AlphaVantageProvider extends BaseMarketProvider {
  name = 'alpha_vantage'

  private timeframeMap: Record<Timeframe, string> = {
    '1m': '1min',
    '5m': '5min',
    '15m': '15min',
    '30m': '30min',
    '1h': '60min',
    '4h': 'daily', // Alpha Vantage doesn't have 4h, use daily
    '1D': 'daily',
    '1W': 'weekly',
  }

  async getCandles(symbol: string, timeframe: Timeframe, limit: number = 100): Promise<Candle[]> {
    const normalizedSymbol = this.normalizeSymbol(symbol)
    const interval = this.timeframeMap[timeframe]
    
    let functionName = 'FX_INTRADAY'
    if (interval === 'daily') functionName = 'FX_DAILY'
    if (interval === 'weekly') functionName = 'FX_WEEKLY'

    const fromCurrency = normalizedSymbol.substring(0, 3)
    const toCurrency = normalizedSymbol.substring(3)

    let url = `${this.baseUrl}/query?function=${functionName}&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&apikey=${this.apiKey}`
    
    if (functionName === 'FX_INTRADAY') {
      url += `&interval=${interval}&outputsize=compact`
    }

    try {
      const response = await this.fetchWithRetry(url)
      const data = await response.json()

      if (data['Error Message']) {
        throw new Error(data['Error Message'])
      }

      if (data['Note']) {
        throw new Error('API rate limit reached')
      }

      // Find the time series key
      const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'))
      if (!timeSeriesKey || !data[timeSeriesKey]) {
        throw new Error('Invalid data format from API')
      }

      const timeSeries = data[timeSeriesKey]
      const candles: Candle[] = []

      for (const [datetime, values] of Object.entries(timeSeries)) {
        candles.push({
          timestamp: new Date(datetime).getTime(),
          open: parseFloat((values as any)['1. open']),
          high: parseFloat((values as any)['2. high']),
          low: parseFloat((values as any)['3. low']),
          close: parseFloat((values as any)['4. close']),
        })

        if (candles.length >= limit) break
      }

      return candles.reverse() // Reverse to get chronological order
    } catch (error) {
      console.error('Error fetching candles from Alpha Vantage:', error)
      throw error
    }
  }

  async getQuote(symbol: string): Promise<Quote> {
    const normalizedSymbol = this.normalizeSymbol(symbol)
    const fromCurrency = normalizedSymbol.substring(0, 3)
    const toCurrency = normalizedSymbol.substring(3)

    const url = `${this.baseUrl}/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${this.apiKey}`

    try {
      const response = await this.fetchWithRetry(url)
      const data = await response.json()

      if (data['Error Message']) {
        throw new Error(data['Error Message'])
      }

      const exchangeRate = data['Realtime Currency Exchange Rate']
      if (!exchangeRate) {
        throw new Error('Invalid data format from API')
      }

      const price = parseFloat(exchangeRate['5. Exchange Rate'])

      return {
        symbol: this.denormalizeSymbol(symbol),
        price,
        change: 0, // Alpha Vantage doesn't provide change in real-time quote
        changePercent: 0,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('Error fetching quote from Alpha Vantage:', error)
      throw error
    }
  }

  async searchSymbol(query: string): Promise<{ symbol: string; name: string }[]> {
    // Alpha Vantage doesn't have a good search endpoint for Forex
    // Return common Forex pairs
    const commonPairs = [
      { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
      { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
      { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen' },
      { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc' },
      { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar' },
      { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar' },
      { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar' },
    ]

    return commonPairs.filter(pair => 
      pair.symbol.toLowerCase().includes(query.toLowerCase()) ||
      pair.name.toLowerCase().includes(query.toLowerCase())
    )
  }
}
