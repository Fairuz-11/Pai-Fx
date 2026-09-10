// Twelve Data API Provider
// https://twelvedata.com/docs

import { BaseMarketProvider } from './base-provider'
import { Candle, Quote, Timeframe } from '@/types/market'

export class TwelveDataProvider extends BaseMarketProvider {
  name = 'twelvedata'

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

  // TwelveData uses EURUSD format (no slash)
  protected normalizeSymbol(symbol: string): string {
    return symbol.replace('/', '')
  }

  async getCandles(symbol: string, timeframe: Timeframe, limit: number = 100): Promise<Candle[]> {
    const normalizedSymbol = this.normalizeSymbol(symbol)
    const interval = this.timeframeMap[timeframe]

    const url = `${this.baseUrl}/time_series?symbol=${normalizedSymbol}&interval=${interval}&outputsize=${limit}&apikey=${this.apiKey}&format=JSON`

    console.log(`[TwelveData] Fetching candles: ${normalizedSymbol} ${interval}`)

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'error') {
        throw new Error(`TwelveData error: ${data.message || 'Unknown error'}`)
      }

      if (!data.values || !Array.isArray(data.values)) {
        console.error('[TwelveData] Unexpected response format:', JSON.stringify(data).slice(0, 200))
        throw new Error('Invalid data format from TwelveData API')
      }

      const candles: Candle[] = data.values.map((item: any) => ({
        timestamp: new Date(item.datetime).getTime(),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: item.volume ? parseFloat(item.volume) : undefined,
      })).reverse() // chronological order

      console.log(`[TwelveData] Got ${candles.length} candles for ${symbol}`)
      return candles
    } catch (error) {
      console.error('[TwelveData] Error fetching candles:', error)
      throw error
    }
  }

  async getQuote(symbol: string): Promise<Quote> {
    const normalizedSymbol = this.normalizeSymbol(symbol)
    const url = `${this.baseUrl}/quote?symbol=${normalizedSymbol}&apikey=${this.apiKey}&format=JSON`

    console.log(`[TwelveData] Fetching quote: ${normalizedSymbol}`)

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'error') {
        throw new Error(`TwelveData error: ${data.message || 'Unknown error'}`)
      }

      const price = parseFloat(data.close)
      const previousClose = parseFloat(data.previous_close)
      const change = price - previousClose
      const changePct = (change / previousClose) * 100

      return {
        symbol,
        price,
        change,
        changePercent: changePct,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('[TwelveData] Error fetching quote:', error)
      throw error
    }
  }

  async searchSymbol(query: string): Promise<{ symbol: string; name: string }[]> {
    const url = `${this.baseUrl}/symbol_search?symbol=${query}&apikey=${this.apiKey}&format=JSON`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'error') {
        return []
      }

      if (!data.data || !Array.isArray(data.data)) {
        return []
      }

      return data.data.map((item: any) => ({
        symbol: item.symbol,
        name: item.instrument_name || item.symbol,
      }))
    } catch (error) {
      console.error('[TwelveData] Error searching symbol:', error)
      return []
    }
  }
}
