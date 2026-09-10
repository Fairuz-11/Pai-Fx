import { MainLayout } from '@/components/layout/main-layout'
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            Dashboard
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Market overview and trading insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Major Pairs"
            value="8"
            change="+2.4%"
            trend="up"
            icon={<Activity size={20} />}
          />
          <StatCard
            title="Bullish Setups"
            value="12"
            change="+5.2%"
            trend="up"
            icon={<TrendingUp size={20} />}
          />
          <StatCard
            title="Bearish Setups"
            value="7"
            change="-1.8%"
            trend="down"
            icon={<TrendingDown size={20} />}
          />
          <StatCard
            title="Strong Signals"
            value="5"
            change="+3.1%"
            trend="up"
            icon={<DollarSign size={20} />}
          />
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Status Card */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Market Overview
            </h2>
            <div className="space-y-3">
              <MarketPairRow
                pair="EUR/USD"
                price="1.17342"
                change="+0.42%"
                trend="bullish"
                confidence={78}
              />
              <MarketPairRow
                pair="GBP/USD"
                price="1.38245"
                change="-0.21%"
                trend="bearish"
                confidence={65}
              />
              <MarketPairRow
                pair="USD/JPY"
                price="149.823"
                change="+0.68%"
                trend="bullish"
                confidence={82}
              />
              <MarketPairRow
                pair="XAU/USD"
                price="2048.50"
                change="+1.25%"
                trend="bullish"
                confidence={91}
              />
            </div>
          </div>

          {/* Top Signals Card */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Top Signals
            </h2>
            <div className="space-y-3">
              <SignalRow
                pair="EUR/USD"
                signal="BUY"
                strength="Strong"
                probability={78}
                timeframe="1H"
              />
              <SignalRow
                pair="XAU/USD"
                signal="BUY"
                strength="Very Strong"
                probability={91}
                timeframe="4H"
              />
              <SignalRow
                pair="GBP/USD"
                signal="SELL"
                strength="Moderate"
                probability={65}
                timeframe="1H"
              />
              <SignalRow
                pair="USD/JPY"
                signal="BUY"
                strength="Strong"
                probability={82}
                timeframe="1D"
              />
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 text-center">
          <p className="text-[var(--muted-foreground)]">
            🚧 <strong>Development in Progress</strong> - Real market data integration coming soon. 
            Configure your <code className="px-2 py-1 bg-[var(--muted)] rounded text-sm">MARKET_DATA_API_KEY</code> in .env file.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}

interface StatCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ReactNode
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-[var(--muted-foreground)]">{title}</span>
        <div className="text-[var(--muted-foreground)]">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-[var(--foreground)] mb-1">
        {value}
      </div>
      <div className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {change}
      </div>
    </div>
  )
}

interface MarketPairRowProps {
  pair: string
  price: string
  change: string
  trend: 'bullish' | 'bearish'
  confidence: number
}

function MarketPairRow({ pair, price, change, trend, confidence }: MarketPairRowProps) {
  const isPositive = change.startsWith('+')

  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <div>
        <div className="font-medium text-[var(--foreground)]">{pair}</div>
        <div className="text-sm text-[var(--muted-foreground)]">{price}</div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </div>
        <div className="text-xs text-[var(--muted-foreground)]">
          {trend} • {confidence}%
        </div>
      </div>
    </div>
  )
}

interface SignalRowProps {
  pair: string
  signal: 'BUY' | 'SELL'
  strength: string
  probability: number
  timeframe: string
}

function SignalRow({ pair, signal, strength, probability, timeframe }: SignalRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <div>
        <div className="font-medium text-[var(--foreground)]">{pair}</div>
        <div className="text-xs text-[var(--muted-foreground)]">{timeframe} • {strength}</div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-bold ${signal === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
          {signal}
        </div>
        <div className="text-xs text-[var(--muted-foreground)]">
          {probability}%
        </div>
      </div>
    </div>
  )
}
