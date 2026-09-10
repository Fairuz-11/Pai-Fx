// Market Data Types

export type ForexPair = 
  | 'EUR/USD' 
  | 'GBP/USD' 
  | 'USD/JPY' 
  | 'USD/CHF' 
  | 'AUD/USD' 
  | 'USD/CAD' 
  | 'NZD/USD' 
  | 'XAU/USD';

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D' | '1W';

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface MarketData {
  symbol: string;
  timeframe: Timeframe;
  candles: Candle[];
  lastUpdate: number;
}

// Technical Indicators Types

export interface EMA {
  period: number;
  values: number[];
}

export interface SMA {
  period: number;
  values: number[];
}

export interface RSI {
  period: number;
  values: number[];
  current: number;
  condition: 'overbought' | 'oversold' | 'neutral';
}

export interface MACD {
  macd: number[];
  signal: number[];
  histogram: number[];
  crossover?: 'bullish' | 'bearish' | null;
}

export interface BollingerBands {
  period: number;
  stdDev: number;
  upper: number[];
  middle: number[];
  lower: number[];
}

export interface ATR {
  period: number;
  values: number[];
  current: number;
}

// Analysis Types

export type TrendDirection = 'bullish' | 'bearish' | 'neutral';
export type TrendStrength = 'weak' | 'moderate' | 'strong' | 'very_strong';
export type SignalType = 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface SupportResistance {
  type: 'support' | 'resistance';
  level: number;
  zone: {
    lower: number;
    upper: number;
  };
  strength: 'weak' | 'moderate' | 'strong';
  touches: number;
}

export interface CandlePattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  timestamp: number;
  strength: 'weak' | 'moderate' | 'strong';
  location?: 'support' | 'resistance' | 'middle';
}

export interface MarketStructure {
  type: 'HH' | 'HL' | 'LH' | 'LL';
  trend: TrendDirection;
  timestamp: number;
}

export interface TrendAnalysis {
  direction: TrendDirection;
  strength: TrendStrength;
  score: number;
  emaAlignment: boolean;
  priceStructure: TrendDirection;
  momentum: 'strong' | 'weak';
}

export interface MultiTimeframeAnalysis {
  '1D': TrendDirection;
  '4h': TrendDirection;
  '1h': TrendDirection;
  '15m': TrendDirection;
  '5m': TrendDirection;
  overall: TrendDirection;
  summary: string;
}

export interface SignalScore {
  signal: SignalType;
  bullishProbability: number;
  bearishProbability: number;
  setupStrength: TrendStrength;
  riskLevel: RiskLevel;
  confidence: number;
  components: {
    emaTrend: number;
    macd: number;
    rsi: number;
    marketStructure: number;
    supportResistance: number;
    candlePattern: number;
    momentum: number;
  };
}

export interface TradingSetup {
  type: SignalType;
  entryZone: {
    lower: number;
    upper: number;
  };
  stopLoss: number;
  takeProfits: {
    tp1: number;
    tp2: number;
    tp3?: number;
  };
  riskReward: number;
  confidence: number;
  invalidation?: number;
}

export interface MarketAnalysis {
  symbol: string;
  timeframe: Timeframe;
  timestamp: number;
  
  // Price Data
  currentPrice: number;
  change: number;
  changePercent: number;
  
  // Indicators
  indicators: {
    ema20?: number;
    ema50?: number;
    ema200?: number;
    rsi: RSI;
    macd: MACD;
    bollingerBands: BollingerBands;
    atr: ATR;
  };
  
  // Analysis
  trend: TrendAnalysis;
  supportResistance: SupportResistance[];
  patterns: CandlePattern[];
  marketStructure: MarketStructure[];
  multiTimeframe?: MultiTimeframeAnalysis;
  
  // Signals
  signal: SignalScore;
  setup?: TradingSetup;
  
  // AI Analysis
  aiAnalysis?: {
    overview: string;
    trendAnalysis: string;
    momentum: string;
    bullishScenario: string;
    bearishScenario: string;
    riskFactors: string[];
  };
}

// Market Session Types

export type MarketSession = 'sydney' | 'tokyo' | 'london' | 'newyork';

export interface SessionInfo {
  name: string;
  timezone: string;
  open: string;
  close: string;
  active: boolean;
}

export interface MarketStatus {
  isOpen: boolean;
  currentSession: MarketSession | null;
  nextSession: MarketSession | null;
  sessions: Record<MarketSession, SessionInfo>;
}

// API Provider Types

export interface MarketDataProvider {
  name: string;
  getCandles(symbol: string, timeframe: Timeframe, limit?: number): Promise<Candle[]>;
  getQuote(symbol: string): Promise<Quote>;
  searchSymbol(query: string): Promise<{ symbol: string; name: string }[]>;
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  rateLimit?: number;
}
