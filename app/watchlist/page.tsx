'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Star,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Loader2,
  Search,
  StickyNote,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface WatchlistItem {
  id: string
  symbol: string
  name: string | null
  notes: string | null
  addedAt: string
}

interface QuoteData {
  symbol: string
  price: number
  change: number
  changePct: number
}

export default function WatchlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({})
  const [loading, setLoading] = useState(true)
  const [addingSymbol, setAddingSymbol] = useState(false)
  const [newSymbol, setNewSymbol] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch watchlist
  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/watchlist')
      const data = await response.json()

      if (response.ok) {
        setWatchlist(data.watchlist)
        // Fetch quotes for all symbols
        if (data.watchlist.length > 0) {
          fetchQuotes(data.watchlist.map((item: WatchlistItem) => item.symbol))
        }
      } else {
        setError(data.error || 'Failed to fetch watchlist')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Fetch quotes for symbols
  const fetchQuotes = async (symbols: string[]) => {
    try {
      const quotesData: Record<string, QuoteData> = {}

      for (const symbol of symbols) {
        try {
          const response = await fetch(`/api/market/quote?symbol=${symbol}`)
          const data = await response.json()

          if (response.ok && data.quote) {
            quotesData[symbol] = {
              symbol,
              price: data.quote.price,
              change: data.quote.change,
              changePct: data.quote.changePct,
            }
          }
        } catch (err) {
          console.error(`Failed to fetch quote for ${symbol}:`, err)
        }
      }

      setQuotes(quotesData)
    } catch (err) {
      console.error('Failed to fetch quotes:', err)
    }
  }

  // Add to watchlist
  const handleAddSymbol = async () => {
    if (!newSymbol.trim()) return

    try {
      setError(null)
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: newSymbol.toUpperCase().trim(),
          name: newSymbol.toUpperCase().trim(),
          notes: newNotes.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setNewSymbol('')
        setNewNotes('')
        setAddingSymbol(false)
        fetchWatchlist()
      } else {
        setError(data.error || 'Failed to add to watchlist')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  // Remove from watchlist
  const handleRemove = async (symbol: string) => {
    if (!confirm(`Remove ${symbol} from watchlist?`)) return

    try {
      const response = await fetch(`/api/watchlist?symbol=${symbol}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchWatchlist()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to remove from watchlist')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWatchlist()
    }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Watchlist</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Track your favorite currency pairs
            </p>
          </div>
          <button
            onClick={() => setAddingSymbol(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={18} />
            Add Pair
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Add Symbol Form */}
        {addingSymbol && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Add to Watchlist
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Symbol
                </label>
                <input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  placeholder="EUR/USD"
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Add notes about this pair..."
                  rows={3}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddSymbol}
                  className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setAddingSymbol(false)
                    setNewSymbol('')
                    setNewNotes('')
                  }}
                  className="flex-1 px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)]/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Watchlist Items */}
        {watchlist.length === 0 ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-12 text-center">
            <Star size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              No pairs in watchlist
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Add currency pairs to track their performance
            </p>
            <button
              onClick={() => setAddingSymbol(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={18} />
              Add Your First Pair
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((item) => {
              const quote = quotes[item.symbol]
              const isPositive = quote ? quote.change >= 0 : false

              return (
                <div
                  key={item.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--primary)] transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--foreground)]">
                        {item.symbol}
                      </h3>
                      {item.name && item.name !== item.symbol && (
                        <p className="text-xs text-[var(--muted-foreground)]">{item.name}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.symbol)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Quote Data */}
                  {quote ? (
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-[var(--foreground)] mb-1">
                        {quote.price.toFixed(5)}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-sm font-medium ${
                          isPositive ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                        {quote.change >= 0 ? '+' : ''}
                        {quote.change.toFixed(5)} ({quote.changePct >= 0 ? '+' : ''}
                        {quote.changePct.toFixed(2)}%)
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <div className="h-8 bg-[var(--muted)] rounded animate-pulse mb-2" />
                      <div className="h-5 w-24 bg-[var(--muted)] rounded animate-pulse" />
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <div className="mb-3 p-2 bg-[var(--muted)] rounded-lg">
                      <div className="flex items-start gap-2">
                        <StickyNote size={14} className="text-[var(--muted-foreground)] mt-0.5" />
                        <p className="text-xs text-[var(--muted-foreground)]">{item.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/chart/${item.symbol}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--primary)] text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <BarChart3 size={16} />
                      Chart
                    </Link>
                    <Link
                      href={`/analysis?symbol=${item.symbol}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--muted)] text-[var(--foreground)] text-sm rounded-lg hover:bg-[var(--muted)]/80 transition-colors"
                    >
                      <TrendingUp size={16} />
                      Analyze
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
