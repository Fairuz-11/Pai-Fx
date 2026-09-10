'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Loader2,
  DollarSign,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Calendar,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface JournalEntry {
  id: string
  symbol: string
  entryType: 'BUY' | 'SELL'
  entryPrice: number
  exitPrice: number | null
  quantity: number
  entryDate: string
  exitDate: string | null
  notes: string | null
  strategy: string | null
  profit: number | null
  profitPct: number | null
  status: 'OPEN' | 'CLOSED'
}

interface Statistics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalProfit: number
  profitFactor: number
  avgProfit: number
  bestTrade: number
  worstTrade: number
}

export default function JournalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCloseForm, setShowCloseForm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'CLOSED'>('all')

  // Form states
  const [formData, setFormData] = useState({
    symbol: '',
    entryType: 'BUY' as 'BUY' | 'SELL',
    entryPrice: '',
    quantity: '',
    entryDate: new Date().toISOString().slice(0, 16),
    notes: '',
    strategy: '',
  })

  const [closeFormData, setCloseFormData] = useState({
    exitPrice: '',
    exitDate: new Date().toISOString().slice(0, 16),
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch journal entries
  const fetchEntries = async () => {
    try {
      setLoading(true)
      const url = filter === 'all' ? '/api/journal' : `/api/journal?status=${filter}`
      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setEntries(data.entries)
        setStatistics(data.statistics)
      } else {
        setError(data.error || 'Failed to fetch journal entries')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Add new entry
  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: formData.symbol.toUpperCase().trim(),
          entryType: formData.entryType,
          entryPrice: parseFloat(formData.entryPrice),
          quantity: parseFloat(formData.quantity),
          entryDate: new Date(formData.entryDate).toISOString(),
          notes: formData.notes.trim() || undefined,
          strategy: formData.strategy.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowAddForm(false)
        setFormData({
          symbol: '',
          entryType: 'BUY',
          entryPrice: '',
          quantity: '',
          entryDate: new Date().toISOString().slice(0, 16),
          notes: '',
          strategy: '',
        })
        fetchEntries()
      } else {
        setError(data.error || 'Failed to add entry')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  // Close trade
  const handleCloseTrade = async (id: string) => {
    setError(null)

    try {
      const response = await fetch('/api/journal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          exitPrice: parseFloat(closeFormData.exitPrice),
          exitDate: new Date(closeFormData.exitDate).toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowCloseForm(null)
        setCloseFormData({
          exitPrice: '',
          exitDate: new Date().toISOString().slice(0, 16),
        })
        fetchEntries()
      } else {
        setError(data.error || 'Failed to close trade')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  // Delete entry
  const handleDelete = async (id: string, symbol: string) => {
    if (!confirm(`Delete ${symbol} trade from journal?`)) return

    try {
      const response = await fetch(`/api/journal?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchEntries()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete entry')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEntries()
    }
  }, [status, filter])

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
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Trading Journal</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Track your trades and analyze performance
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={18} />
            New Trade
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        {statistics && statistics.totalTrades > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Profit */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted-foreground)]">Total P&L</span>
                <DollarSign
                  size={18}
                  className={statistics.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}
                />
              </div>
              <div
                className={`text-2xl font-bold ${
                  statistics.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {statistics.totalProfit >= 0 ? '+' : ''}${statistics.totalProfit.toFixed(2)}
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted-foreground)]">Win Rate</span>
                <Target size={18} className="text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-[var(--foreground)]">
                {statistics.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">
                {statistics.winningTrades}W / {statistics.losingTrades}L
              </div>
            </div>

            {/* Profit Factor */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted-foreground)]">Profit Factor</span>
                <Award size={18} className="text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-[var(--foreground)]">
                {statistics.profitFactor.toFixed(2)}
              </div>
            </div>

            {/* Best Trade */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted-foreground)]">Best Trade</span>
                <TrendingUp size={18} className="text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-500">
                +${statistics.bestTrade.toFixed(2)}
              </div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">
                Worst: ${statistics.worstTrade.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Add Trade Form */}
        {showAddForm && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">New Trade</h3>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Symbol
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder="EUR/USD"
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Type
                  </label>
                  <select
                    required
                    value={formData.entryType}
                    onChange={(e) =>
                      setFormData({ ...formData, entryType: e.target.value as 'BUY' | 'SELL' })
                    }
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Entry Price
                  </label>
                  <input
                    type="number"
                    required
                    step="0.00001"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                    placeholder="1.08500"
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Quantity (Lots)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="1.00"
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Entry Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Strategy (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.strategy}
                    onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                    placeholder="Breakout, Trend following..."
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Trade setup, reasons, etc..."
                  rows={3}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Trade
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)]/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-[var(--border)]">
          {(['all', 'OPEN', 'CLOSED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === tab
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {tab === 'all' ? 'All Trades' : tab === 'OPEN' ? 'Open Trades' : 'Closed Trades'}
            </button>
          ))}
        </div>

        {/* Entries List */}
        {entries.length === 0 ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-12 text-center">
            <Calendar size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              No trades recorded
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Start tracking your trades to analyze your performance
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={18} />
              Add Your First Trade
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const isProfit = (entry.profit ?? 0) > 0
              const isOpen = entry.status === 'OPEN'

              return (
                <div
                  key={entry.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--primary)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-[var(--foreground)]">
                          {entry.symbol}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            entry.entryType === 'BUY'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {entry.entryType}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            isOpen
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-gray-500/10 text-gray-500'
                          }`}
                        >
                          {entry.status}
                        </span>
                        {entry.strategy && (
                          <span className="text-xs text-[var(--muted-foreground)]">
                            • {entry.strategy}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-[var(--muted-foreground)]">Entry:</span>
                          <span className="ml-2 font-medium text-[var(--foreground)]">
                            {entry.entryPrice.toFixed(5)}
                          </span>
                        </div>
                        {entry.exitPrice && (
                          <div>
                            <span className="text-[var(--muted-foreground)]">Exit:</span>
                            <span className="ml-2 font-medium text-[var(--foreground)]">
                              {entry.exitPrice.toFixed(5)}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-[var(--muted-foreground)]">Quantity:</span>
                          <span className="ml-2 font-medium text-[var(--foreground)]">
                            {entry.quantity}
                          </span>
                        </div>
                        {entry.profit !== null && (
                          <div>
                            <span className="text-[var(--muted-foreground)]">P&L:</span>
                            <span
                              className={`ml-2 font-bold ${
                                isProfit ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {isProfit ? '+' : ''}${entry.profit.toFixed(2)} (
                              {entry.profitPct?.toFixed(2)}%)
                            </span>
                          </div>
                        )}
                      </div>

                      {entry.notes && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-2">
                          {entry.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {isOpen && (
                        <button
                          onClick={() => setShowCloseForm(entry.id)}
                          className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                          title="Close trade"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(entry.id, entry.symbol)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                        title="Delete trade"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Close Trade Form */}
                  {showCloseForm === entry.id && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                      <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                        Close Trade
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                            Exit Price
                          </label>
                          <input
                            type="number"
                            step="0.00001"
                            value={closeFormData.exitPrice}
                            onChange={(e) =>
                              setCloseFormData({ ...closeFormData, exitPrice: e.target.value })
                            }
                            placeholder="1.08700"
                            className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                            Exit Date
                          </label>
                          <input
                            type="datetime-local"
                            value={closeFormData.exitDate}
                            onChange={(e) =>
                              setCloseFormData({ ...closeFormData, exitDate: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleCloseTrade(entry.id)}
                          className="flex-1 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Close Trade
                        </button>
                        <button
                          onClick={() => setShowCloseForm(null)}
                          className="flex-1 px-3 py-2 text-sm bg-[var(--muted)] text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)]/80 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
