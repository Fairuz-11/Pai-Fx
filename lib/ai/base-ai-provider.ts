// Base AI Provider Interface

export interface AIAnalysisInput {
  symbol: string
  timeframe: string
  currentPrice: number
  changePercent: number
  trend: {
    direction: string
    strength: string
    score: number
    emaAlignment: boolean
  }
  signal: {
    signal: string
    bullishProbability: number
    bearishProbability: number
    confidence: number
    setupStrength: string
    riskLevel: string
  }
  indicators: {
    rsi?: number
    macd?: {
      macd: number
      signal: number
      histogram: number
    }
    ema20?: number
    ema50?: number
    ema200?: number
  }
  supportResistance: {
    nearestSupport?: { level: number; strength: string }
    nearestResistance?: { level: number; strength: string }
  }
  patterns: string[]
  marketStructure: string
}

export interface AIAnalysisOutput {
  overview: string
  trendAnalysis: string
  momentum: string
  supportResistance: string
  bullishScenario: string
  bearishScenario: string
  riskFactors: string[]
  tradingConsiderations: string
}

export interface AIProvider {
  name: string
  analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput>
}

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string
  protected apiKey: string
  protected baseUrl: string
  protected model: string

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.model = model
  }

  abstract analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput>

  protected buildPrompt(input: AIAnalysisInput): string {
    return `You are a professional Forex market analyst. Analyze the following market data and provide insights in a structured format.

**Market Data:**
- Symbol: ${input.symbol}
- Timeframe: ${input.timeframe}
- Current Price: ${input.currentPrice}
- Change: ${input.changePercent >= 0 ? '+' : ''}${input.changePercent.toFixed(2)}%

**Trend Analysis:**
- Direction: ${input.trend.direction.toUpperCase()}
- Strength: ${input.trend.strength}
- Score: ${input.trend.score}/100
- EMA Alignment: ${input.trend.emaAlignment ? 'Yes' : 'No'}

**Technical Signal:**
- Signal: ${input.signal.signal}
- Bullish Probability: ${input.signal.bullishProbability}%
- Bearish Probability: ${input.signal.bearishProbability}%
- Confidence: ${input.signal.confidence}%
- Setup Strength: ${input.signal.setupStrength}
- Risk Level: ${input.signal.riskLevel}

**Technical Indicators:**
${input.indicators.rsi ? `- RSI(14): ${input.indicators.rsi.toFixed(2)}` : ''}
${input.indicators.macd ? `- MACD: ${input.indicators.macd.macd.toFixed(5)} (Signal: ${input.indicators.macd.signal.toFixed(5)})` : ''}
${input.indicators.ema20 ? `- EMA 20: ${input.indicators.ema20.toFixed(5)}` : ''}
${input.indicators.ema50 ? `- EMA 50: ${input.indicators.ema50.toFixed(5)}` : ''}
${input.indicators.ema200 ? `- EMA 200: ${input.indicators.ema200.toFixed(5)}` : ''}

**Support & Resistance:**
${input.supportResistance.nearestSupport ? `- Nearest Support: ${input.supportResistance.nearestSupport.level.toFixed(5)} (${input.supportResistance.nearestSupport.strength})` : '- No support detected'}
${input.supportResistance.nearestResistance ? `- Nearest Resistance: ${input.supportResistance.nearestResistance.level.toFixed(5)} (${input.supportResistance.nearestResistance.strength})` : '- No resistance detected'}

**Candlestick Patterns:** ${input.patterns.length > 0 ? input.patterns.join(', ') : 'None detected'}

**Market Structure:** ${input.marketStructure}

Please provide analysis in JSON format with these fields:
1. overview - Brief market overview (2-3 sentences)
2. trendAnalysis - Detailed trend analysis (3-4 sentences)
3. momentum - Momentum assessment (2-3 sentences)
4. supportResistance - Support/resistance context (2-3 sentences)
5. bullishScenario - Possible bullish scenario (2-3 sentences)
6. bearishScenario - Possible bearish scenario (2-3 sentences)
7. riskFactors - Array of 2-4 key risk factors
8. tradingConsiderations - Final considerations (2-3 sentences)

IMPORTANT: 
- Be objective and balanced
- Mention probabilities, not certainties
- Include risk warnings
- Use professional trading terminology
- This is educational analysis, not financial advice
- Respond ONLY with valid JSON, no additional text`
  }

  protected parseAIResponse(response: string, input: AIAnalysisInput): AIAnalysisOutput {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')

      const parsed = JSON.parse(jsonMatch[0])

      return {
        overview: parsed.overview || 'Analysis not available.',
        trendAnalysis: parsed.trendAnalysis || 'Trend analysis not available.',
        momentum: parsed.momentum || 'Momentum analysis not available.',
        supportResistance: parsed.supportResistance || 'Support/resistance analysis not available.',
        bullishScenario: parsed.bullishScenario || 'Bullish scenario not available.',
        bearishScenario: parsed.bearishScenario || 'Bearish scenario not available.',
        riskFactors: parsed.riskFactors || ['Market volatility', 'Economic events'],
        tradingConsiderations: parsed.tradingConsiderations || 'Exercise caution and proper risk management.',
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return {
        overview: 'AI analysis temporarily unavailable. Using technical data only.',
        trendAnalysis: `Market shows ${input.trend.direction} trend with ${input.trend.strength} strength.`,
        momentum: `Current momentum is ${input.signal.signal === 'BUY' ? 'positive' : input.signal.signal === 'SELL' ? 'negative' : 'neutral'}.`,
        supportResistance: 'Support and resistance levels detected in the data.',
        bullishScenario: 'Bullish scenario possible if price breaks above resistance.',
        bearishScenario: 'Bearish scenario possible if price breaks below support.',
        riskFactors: ['Market volatility', 'Economic data releases', 'Geopolitical events'],
        tradingConsiderations: 'Always use proper risk management and stop losses.',
      }
    }
  }
}
