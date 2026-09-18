'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, Activity, DollarSign,
  Star, BookOpen, BarChart3, RefreshCw, ArrowRight,
  Loader2, Target, Award, ChevronRight
} from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'

// ─── Types ───────────────────────────────────────────────
interface Quote {
  symbol: string
  price: number
  change: number
  changePercent: number
}

interface SignalData {
  symbol: string
  signal: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL'
  confidence: number
  bullishProbability: number
  bearishProbability: number
  setupStrength: string
  timeframe: string
}

interface JournalStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalProfit: number
  profitFactor: number
}

interface WatchlistItem {
  id: string
  symbol: string
  name: string | null
}

// ─── Constants ───────────────────────────────────────────
const MAJOR_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'AUD/USD', 'USD/CHF']

// ─── Page ─────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [quotes, setQuotes] = useState<Quote[]>([])
  const [signals, setSignals] = useState<SignalData[]>([])
  const [journalStats, setJournalStats] = useState<JournalStats | null>(null)
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loadingQuotes, setLoadingQuotes] = useState(true)
  const [loadingSignals, setLoadingSignals] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Redirect if not authed
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  // Fetch market quotes
  const fetchQuotes = async () => {
    try {
      setLoadingQuotes(true)
      const res = await fetch('/api/market')
      const data = await res.json()
      if (res.ok && data.pairs) setQuotes(data.pairs.slice(0, 6))
    } catch (e) {
      console.error('Failed to fetch quotes:', e)
    } finally {
      setLoadingQuotes(false)
    }
  }

  // Fetch signals for top pairs
  const fetchSignals = async () => {
    try {
      setLoadingSignals(true)
      const pairs = ['EUR/USD', 'XAU/USD', 'GBP/USD', 'USD/JPY']
      const results = await Promise.all(
        pairs.map(async (symbol) => {
          try {
            const res = await fetch(`/api/analysis?symbol=${encodeURIComponent(symbol)}&timeframe=1h`)
            const data = await res.json()
            if (!res.ok) return null
            return {
              symbol,
              signal: data.signal?.signal || 'NEUTRAL',
              confidence: data.signal?.confidence || 0,
              bullishProbability: data.signal?.bullishProbability || 50,
              bearishProbability: data.signal?.bearishProbability || 50,
              setupStrength: data.signal?.setupStrength || 'weak',
              timeframe: '1H',
            } as SignalData
          } catch {
            return null
          }
        })
      )
      setSignals(results.filter((r): r is SignalData => r !== null))
    } catch (e) {
      console.error('Failed to fetch signals:', e)
    } finally {
      setLoadingSignals(false)
    }
  }

  // Fetch journal stats & watchlist (only if logged in)
  const fetchUserData = async () => {
    if (!session) return
    try {
      const [journalRes, watchlistRes] = await Promise.all([
        fetch('/api/journal'),
        fetch('/api/watchlist'),
      ])
      const journalData = await journalRes.json()
      const watchlistData = await watchlistRes.json()
      if (journalRes.ok) setJournalStats(journalData.statistics)
      if (watchlistRes.ok) setWatchlist(watchlistData.watchlist.slice(0, 5))
    } catch (e) {
      console.error('Failed to fetch user data:', e)
    }
  }

  const refreshAll = async () => {
    await Promise.all([fetchQuotes(), fetchSignals(), fetchUserData()])
    setLastUpdated(new Date())
  }

  useEffect(() => {
    if (status === 'authenticated') {
      refreshAll()
      // Auto-refresh every 60 seconds
      const interval = setInterval(refreshAll, 60_000)
      return () => clearInterval(interval)
    }
  }, [status])

  if (status === 'loading') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      </MainLayout>
    )
  }

  const bullishCount = signals.filter(s => s.signal === 'BUY').length
  const bearishCount = signals.filter(s => s.signal === 'SELL').length
  const strongSignals = signals.filter(s => s.setupStrength === 'strong' || s.setupStrength === 'very_strong').length

  return (
    <MainLayout>
      <div className="p-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Welcome back, {session?.user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {lastUpdated
                ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                : 'Loading market data...'}
            </p>
          </div>
          <button
            onClick={refreshAll}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg hover:bg-[var(--border)] transition-colors text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Watchlist"
            value={watchlist.length.toString()}
            sub="pairs tracked"
            icon={<Star size={18} />}
            color="text-yellow-500"
            href="/watchlist"
          />
          <StatCard
            title="Bullish Signals"
            value={loadingSignals ? '...' : bullishCount.toString()}
            sub="of 4 pairs"
            icon={<TrendingUp size={18} />}
            color="text-green-500"
            href="/analysis"
          />
          <StatCard
            title="Bearish Signals"
            value={loadingSignals ? '...' : bearishCount.toString()}
            sub="of 4 pairs"
            icon={<TrendingDown size={18} />}
            color="text-red-500"
            href="/analysis"
          />
          <StatCard
            title="Journal Trades"
            value={journalStats ? journalStats.totalTrades.toString() : '0'}
            sub={journalStats ? `${journalStats.winRate.toFixed(0)}% win rate` : 'no trades yet'}
            icon={<BookOpen size={18} />}
            color="text-blue-500"
            href="/journal"
          />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Market Overview — 2 cols */}
          <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)]">Market Overview</h2>
              <Link href="/market" className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {loadingQuotes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
                </div>
              ) : quotes.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">No market data</div>
              ) : (
                quotes.map((q) => (
                  <Link
                    key={q.symbol}
                    href={`/chart/${q.symbol.replace('/', '-')}`}
                    className="flex items-center justify-between px-6 py-3 hover:bg-[var(--muted)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-[var(--primary)]">
                          {q.symbol.split('/')[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{q.symbol}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Forex</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {q.price.toFixed(q.symbol.includes('JPY') ? 3 : 5)}
                      </p>
                      <p className={`text-xs font-medium ${q.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {q.changePercent >= 0 ? '+' : ''}{q.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Right col — Top Signals + Watchlist */}
          <div className="space-y-6">

            {/* Top Signals */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg">
              <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
                <h2 className="text-base font-semibold text-[var(--foreground)]">Top Signals</h2>
                <Link href="/analysis" className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                  Analyze <ChevronRight size={14} />
                </Link>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {loadingSignals ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--muted-foreground)]" />
                  </div>
                ) : signals.length === 0 ? (
                  <div className="py-6 text-center text-sm text-[var(--muted-foreground)]">No signals</div>
                ) : (
                  signals.map((s) => (
                    <Link
                      key={s.symbol}
                      href={`/analysis?symbol=${encodeURIComponent(s.symbol)}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-[var(--muted)] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{s.symbol}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{s.timeframe} • {s.setupStrength}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          s.signal === 'BUY' ? 'bg-green-500/10 text-green-500' :
                          s.signal === 'SELL' ? 'bg-red-500/10 text-red-500' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {s.signal}
                        </span>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.confidence}% conf.</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Watchlist Quick View */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg">
              <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
                <h2 className="text-base font-semibold text-[var(--foreground)]">Watchlist</h2>
                <Link href="/watchlist" className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                  Manage <ChevronRight size={14} />
                </Link>
              </div>
              {watchlist.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <Star size={28} className="mx-auto text-[var(--muted-foreground)] mb-2" />
                  <p className="text-sm text-[var(--muted-foreground)] mb-3">No pairs added yet</p>
                  <Link
                    href="/watchlist"
                    className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                  >
                    Add pairs <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {watchlist.map((item) => (
                    <Link
                      key={item.id}
                      href={`/chart/${item.symbol.replace('/', '-')}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-[var(--muted)] transition-colors"
                    >
                      <span className="text-sm font-medium text-[var(--foreground)]">{item.symbol}</span>
                      <BarChart3 size={14} className="text-[var(--muted-foreground)]" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Journal Stats ── */}
        {journalStats && journalStats.totalTrades > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)]">Journal Performance</h2>
              <Link href="/journal" className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                View journal <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-[var(--border)]">
              <JournalStat
                label="Total Trades"
                value={journalStats.totalTrades.toString()}
                icon={<Activity size={16} />}
              />
              <JournalStat
                label="Win Rate"
                value={`${journalStats.winRate.toFixed(1)}%`}
                icon={<Target size={16} />}
                valueColor={journalStats.winRate >= 50 ? 'text-green-500' : 'text-red-500'}
              />
              <JournalStat
                label="Total P&L"
                value={`${journalStats.totalProfit >= 0 ? '+' : ''}$${journalStats.totalProfit.toFixed(2)}`}
                icon={<DollarSign size={16} />}
                valueColor={journalStats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}
              />
              <JournalStat
                label="Profit Factor"
                value={journalStats.profitFactor.toFixed(2)}
                icon={<Award size={16} />}
                valueColor={journalStats.profitFactor >= 1 ? 'text-green-500' : 'text-red-500'}
              />
            </div>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Open Chart', href: '/chart/EUR-USD', icon: <BarChart3 size={20} />, color: 'from-blue-500 to-blue-600' },
            { label: 'Analyze Market', href: '/analysis', icon: <Activity size={20} />, color: 'from-purple-500 to-purple-600' },
            { label: 'My Watchlist', href: '/watchlist', icon: <Star size={20} />, color: 'from-yellow-500 to-yellow-600' },
            { label: 'Add Trade', href: '/journal', icon: <BookOpen size={20} />, color: 'from-green-500 to-green-600' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors group"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-[var(--foreground)]">{action.label}</span>
            </Link>
          ))}
        </div>

      </div>
    </MainLayout>
  )
}

// ─── Sub-components ───────────────────────────────────────

function StatCard({
  title, value, sub, icon, color, href,
}: {
  title: string; value: string; sub: string; icon: React.ReactNode; color: string; href: string
}) {
  return (
    <Link href={href} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--primary)] transition-colors block">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[var(--muted-foreground)]">{title}</span>
        <span className={color}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
      <p className="text-xs text-[var(--muted-foreground)] mt-1">{sub}</p>
    </Link>
  )
}

function JournalStat({
  label, value, icon, valueColor = 'text-[var(--foreground)]',
}: {
  label: string; value: string; icon: React.ReactNode; valueColor?: string
}) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-2 mb-2 text-[var(--muted-foreground)]">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
    </div>
  )
}
