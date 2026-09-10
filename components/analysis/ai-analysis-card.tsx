'use client'

import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIAnalysisCardProps {
  analysisData: any
  onGenerateAI: () => Promise<void>
}

interface AIAnalysis {
  overview: string
  trendAnalysis: string
  momentum: string
  supportResistance: string
  bullishScenario: string
  bearishScenario: string
  riskFactors: string[]
  tradingConsiderations: string
}

export function AIAnalysisCard({ analysisData, onGenerateAI }: AIAnalysisCardProps) {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  const generateAIAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      // Prepare input data
      const input = {
        symbol: analysisData.symbol,
        timeframe: analysisData.timeframe,
        currentPrice: analysisData.currentPrice,
        changePercent: analysisData.changePercent,
        trend: analysisData.trend,
        signal: analysisData.signal,
        indicators: {
          rsi: analysisData.indicators?.rsi,
          macd: analysisData.indicators?.macd,
          ema20: analysisData.indicators?.ema20,
          ema50: analysisData.indicators?.ema50,
          ema200: analysisData.indicators?.ema200,
        },
        supportResistance: {
          nearestSupport: analysisData.supportResistance?.nearestSupport,
          nearestResistance: analysisData.supportResistance?.nearestResistance,
        },
        patterns: analysisData.patterns?.detected?.map((p: any) => p.name) || [],
        marketStructure: analysisData.marketStructure?.summary || 'No clear structure',
      }

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI analysis')
      }

      setAiAnalysis(data.analysis)
      await onGenerateAI()
    } catch (err) {
      console.error('Error generating AI analysis:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate AI analysis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[var(--primary)]" />
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              AI Market Analysis
            </h3>
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-500 rounded">
              Beta
            </span>
          </div>

          {aiAnalysis && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-[var(--muted)] rounded transition-colors"
            >
              {expanded ? (
                <ChevronUp size={20} className="text-[var(--muted-foreground)]" />
              ) : (
                <ChevronDown size={20} className="text-[var(--muted-foreground)]" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!aiAnalysis ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Sparkles size={32} className="text-[var(--primary)]" />
            </div>
            <h4 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Get AI-Powered Insights
            </h4>
            <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
              Generate natural language analysis of current market conditions using AI. Get
              bullish/bearish scenarios, risk factors, and trading considerations.
            </p>

            {error ? (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
                {error.includes('not configured') && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">
                    Configure AI_API_KEY in environment variables to enable this feature.
                  </p>
                )}
              </div>
            ) : null}

            <button
              onClick={generateAIAnalysis}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating Analysis...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate AI Analysis
                </>
              )}
            </button>
          </div>
        ) : expanded ? (
          <div className="space-y-6">
            {/* Overview */}
            <Section title="Market Overview" content={aiAnalysis.overview} />

            {/* Trend Analysis */}
            <Section title="Trend Analysis" content={aiAnalysis.trendAnalysis} />

            {/* Momentum */}
            <Section title="Momentum Assessment" content={aiAnalysis.momentum} />

            {/* Support & Resistance */}
            <Section
              title="Support & Resistance Context"
              content={aiAnalysis.supportResistance}
            />

            {/* Scenarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h5 className="text-sm font-semibold text-green-500 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Bullish Scenario
                </h5>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {aiAnalysis.bullishScenario}
                </p>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h5 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Bearish Scenario
                </h5>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {aiAnalysis.bearishScenario}
                </p>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h5 className="text-sm font-semibold text-yellow-500 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} />
                Key Risk Factors
              </h5>
              <ul className="space-y-2">
                {aiAnalysis.riskFactors.map((risk, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-[var(--foreground)] flex items-start gap-2"
                  >
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trading Considerations */}
            <Section
              title="Trading Considerations"
              content={aiAnalysis.tradingConsiderations}
            />

            {/* Regenerate Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={generateAIAnalysis}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] font-medium rounded-lg hover:bg-[var(--primary)] hover:text-white transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Regenerate Analysis
                  </>
                )}
              </button>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-4 bg-[var(--muted)] rounded-lg">
              <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                <strong>AI Analysis Disclaimer:</strong> This analysis is generated by artificial
                intelligence based on technical data. It is for educational purposes only and
                should not be considered as financial advice. AI may produce inaccurate or biased
                information. Always do your own research and consult with a licensed financial
                advisor before making trading decisions.
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <button
              onClick={() => setExpanded(true)}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Click to expand AI analysis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  content: string
}

function Section({ title, content }: SectionProps) {
  return (
    <div>
      <h5 className="text-sm font-semibold text-[var(--foreground)] mb-2">{title}</h5>
      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{content}</p>
    </div>
  )
}
