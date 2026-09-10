import Link from 'next/link'
import { TrendingUp, LineChart, Brain, BarChart3, Signal, BookOpen, ArrowRight, AlertTriangle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)]">PAI-FX</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6">
              Understand the Market.<br />
              <span className="text-[var(--primary)]">Trade With Data.</span>
            </h2>
            <p className="text-lg sm:text-xl text-[var(--muted-foreground)] mb-10">
              Real-time market analysis for Forex traders. Get technical insights, AI-powered analysis, and smart trading signals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Open Dashboard
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/market"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                Explore Market
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-[var(--foreground)] mb-4">
            Powerful Market Analysis Tools
          </h3>
          <p className="text-lg text-[var(--muted-foreground)]">
            Everything you need to analyze Forex market conditions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Cards */}
          <FeatureCard
            icon={<LineChart size={24} />}
            title="Real-Time Market Data"
            description="Professional candlestick charts with live price updates from major Forex pairs."
          />
          <FeatureCard
            icon={<BarChart3 size={24} />}
            title="Technical Analysis"
            description="EMA, SMA, RSI, MACD, Bollinger Bands, and more technical indicators."
          />
          <FeatureCard
            icon={<Brain size={24} />}
            title="AI Market Analysis"
            description="Natural language insights powered by AI to understand market conditions."
          />
          <FeatureCard
            icon={<Signal size={24} />}
            title="Smart Signals"
            description="BUY/SELL signals with probability scoring and setup strength analysis."
          />
          <FeatureCard
            icon={<TrendingUp size={24} />}
            title="Multi-Timeframe Analysis"
            description="Analyze trends across multiple timeframes from 1 day to 5 minutes."
          />
          <FeatureCard
            icon={<BookOpen size={24} />}
            title="Trading Journal"
            description="Track your trades, analyze performance, and improve your strategy."
          />
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle size={24} className="text-yellow-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                Important Disclaimer
              </h4>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                PAI-FX is an <strong>analytical tool</strong> and does not provide financial advice. 
                We are not a broker and do not execute trades. All analysis, signals, and probabilities 
                are for <strong>educational purposes only</strong>. Trading Forex involves substantial 
                risk of loss. Past performance does not guarantee future results. Always do your own 
                research and never trade with money you cannot afford to lose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <span className="text-sm text-[var(--muted-foreground)]">
                © 2026 PAI-FX. Market Analysis Platform.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/about" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                About
              </Link>
              <Link href="/terms" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 hover:border-[var(--primary)] transition-colors">
      <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-4">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-[var(--foreground)] mb-2">
        {title}
      </h4>
      <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
}
