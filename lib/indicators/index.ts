// Technical Indicators Index

export * from './ema'
export * from './sma'
export * from './rsi'
export * from './macd'
export * from './bollinger'
export * from './atr'

import { Candle } from '@/types/market'
import { calculateEMA, getLatestEMA } from './ema'
import { calculateSMA, getLatestSMA } from './sma'
import { calculateRSI, getLatestRSI } from './rsi'
import { calculateMACD, getLatestMACD } from './macd'
import { calculateBollingerBands, getLatestBollingerBands } from './bollinger'
import { calculateATR, getLatestATR } from './atr'

export interface AllIndicators {
  ema20: number | null
  ema50: number | null
  ema200: number | null
  sma20: number | null
  sma50: number | null
  sma200: number | null
  rsi: number | null
  macd: {
    macd: number
    signal: number
    histogram: number
    crossover: 'bullish' | 'bearish' | null
  } | null
  bollingerBands: {
    upper: number
    middle: number
    lower: number
  } | null
  atr: number | null
}

export function calculateAllIndicators(candles: Candle[]): AllIndicators {
  return {
    ema20: getLatestEMA(candles, 20),
    ema50: getLatestEMA(candles, 50),
    ema200: getLatestEMA(candles, 200),
    sma20: getLatestSMA(candles, 20),
    sma50: getLatestSMA(candles, 50),
    sma200: getLatestSMA(candles, 200),
    rsi: getLatestRSI(candles, 14),
    macd: getLatestMACD(candles),
    bollingerBands: getLatestBollingerBands(candles, 20, 2),
    atr: getLatestATR(candles, 14),
  }
}
