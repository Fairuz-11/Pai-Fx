'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, TrendingUp, TrendingDown, ArrowUpDown, RefreshCw, Loader2 } from 'lucide-react'
import { cn, formatPrice, formatPercent } from '@/lib/utils'

interface MarketPair {
  symbol: string
  price: number
  change: number
  changePercent: number
  trend?: string
  rsi?: number
  signal?: string
  confidence?: number
}

type SortField = 'symbol' | 'price' | 'change' | 'changePercent' | 'confidence'
type SortDirection = 'asc' | 'desc'
type FilterType = 'all' | 'bullish' | 'bearish' | 'neutral'

export function MarketTable() {
  const [pairs, setPairs] = useState<MarketPair[]>([])
  const [filteredPairs, setFilteredPairs] = useState<MarketPair[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('symbol')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filter, setFilter] = useState<FilterType>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    fetchMarketData()
    
    // Auto refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(fetchMarketData, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  useEffect(() => {
    applyFilters()
  }, [pairs, searchQuery, sortField, sortDirection, filter])

  const fetchMarketData = async () => {
    try {
      setError(null)
      
      const response = await fetch('/api/market')
      if (!response.ok) {
        throw new Error('Failed to fetch market data')
      }

      const data = await response.json()
      setPairs(data.pairs || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching market data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load market data')
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...pairs]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(pair =>
        pair.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Trend filter
    if (filter !== 'all') {
      filtered = filtered.filter(pair => {
        if (filter === 'bullish') return pair.changePercent > 0
        if (filter === 'bearish') return pair.changePercent < 0
        return pair.changePercent === 0
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]

      // Handle undefined values
      if (aVal === undefined) aVal = 0
      if (bVal === undefined) bVal = 0

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredPairs(filtered)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-[var(--muted-foreground)]" />
    }
    return sortDirection === 'asc' ? (
      <TrendingUp size={14} className="text-[var(--primary)]" />
    ) : (
      <TrendingDown size={14} className="text-[var(--primary)]" />
    )
  }

  if (loading) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
          <p className="text-[var(--muted-foreground)]">Loading market data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchMarketData}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search pairs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                filter === 'all'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('bullish')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                filter === 'bullish'
                  ? 'bg-green-500 text-white'
                  : 'text-[var(--muted-foreground)] hover:text-green-500 hover:bg-[var(--muted)]'
              )}
            >
              Bullish
            </button>
            <button
              onClick={() => setFilter('bearish')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                filter === 'bearish'
                  ? 'bg-red-500 text-white'
                  : 'text-[var(--muted-foreground)] hover:text-red-500 hover:bg-[var(--muted)]'
              )}
            >
              Bearish
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchMarketData}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className="text-[var(--muted-foreground)]" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th
                  className="text-left p-4 text-sm font-medium text-[var(--foreground)] cursor-pointer hover:bg-[var(--background)] transition-colors"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-2">
                    Pair
                    <SortIcon field="symbol" />
                  </div>
                </th>
                <th
                  className="text-right p-4 text-sm font-medium text-[var(--foreground)] cursor-pointer hover:bg-[var(--background)] transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Price
                    <SortIcon field="price" />
                  </div>
                </th>
                <th
                  className="text-right p-4 text-sm font-medium text-[var(--foreground)] cursor-pointer hover:bg-[var(--background)] transition-colors"
                  onClick={() => handleSort('changePercent')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Change
                    <SortIcon field="changePercent" />
                  </div>
                </th>
                <th className="text-center p-4 text-sm font-medium text-[var(--foreground)]">
                  Trend
                </th>
                <th className="text-right p-4 text-sm font-medium text-[var(--foreground)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPairs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-[var(--muted-foreground)]">
                    No pairs found
                  </td>
                </tr>
              ) : (
                filteredPairs.map((pair) => (
                  <tr
                    key={pair.symbol}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)] transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-[var(--foreground)]">{pair.symbol}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-medium text-[var(--foreground)]">
                        {formatPrice(pair.price)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div
                        className={cn(
                          'font-medium',
                          pair.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                        )}
                      >
                        {formatPercent(pair.changePercent)}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        {pair.changePercent > 0 ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <TrendingUp size={16} />
                            <span className="text-xs font-medium">Bullish</span>
                          </div>
                        ) : pair.changePercent < 0 ? (
                          <div className="flex items-center gap-1 text-red-500">
                            <TrendingDown size={16} />
                            <span className="text-xs font-medium">Bearish</span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-[var(--muted-foreground)]">
                            Neutral
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/chart/${pair.symbol.replace('/', '-')}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Chart
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <span>
            Showing {filteredPairs.length} of {pairs.length} pairs
          </span>
          <span>
            Bullish: {pairs.filter(p => p.changePercent > 0).length} • 
            Bearish: {pairs.filter(p => p.changePercent < 0).length}
          </span>
        </div>
      </div>
    </div>
  )
}
