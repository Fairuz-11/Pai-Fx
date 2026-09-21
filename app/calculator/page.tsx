'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Calculator, TrendingUp, TrendingDown, DollarSign,
  AlertTriangle, RefreshCw, ChevronDown
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────
type TradeType = 'BUY' | 'SELL'

interface CalcResult {
  pips: number
  pipValue: number
  riskAmount: number
  rewardAmount: number
  riskReward: number
  riskPercent: number
  lotSize: number
  marginRequired: number
  breakEven: number
}

// ─── Pip sizes per symbol ────────────────────────────────
const PIP_SIZE: Record<string, number> = {
  'EUR/USD': 0.0001,
  'GBP/USD': 0.0001,
  'AUD/USD': 0.0001,
  'NZD/USD': 0.0001,
  'USD/CAD': 0.0001,
  'USD/CHF': 0.0001,
  'USD/JPY': 0.01,
  'GBP/JPY': 0.01,
  'EUR/JPY': 0.01,
  'XAU/USD': 0.01,
  'XAG/USD': 0.001,
}

const CONTRACT_SIZE: Record<string, number> = {
  'XAU/USD': 100,   // 1 lot gold = 100 oz
  'XAG/USD': 5000,  // 1 lot silver = 5000 oz
  'DEFAULT': 100000, // standard forex lot
}

const PAIRS = Object.keys(PIP_SIZE)

// ─── Helper ──────────────────────────────────────────────
function getPipSize(symbol: string) {
  return PIP_SIZE[symbol] ?? 0.0001
}

function getContractSize(symbol: string) {
  return CONTRACT_SIZE[symbol] ?? CONTRACT_SIZE['DEFAULT']
}

function calcPips(from: number, to: number, symbol: string) {
  return Math.abs(to - from) / getPipSize(symbol)
}

// ─── Page ─────────────────────────────────────────────────
export default function CalculatorPage() {
  const [symbol, setSymbol] = useState('EUR/USD')
  const [tradeType, setTradeType] = useState<TradeType>('BUY')
  const [accountBalance, setAccountBalance] = useState('10000')
  const [riskPercent, setRiskPercent] = useState('1')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [lotSize, setLotSize] = useState('1')
  const [leverage, setLeverage] = useState('100')
  const [mode, setMode] = useState<'risk' | 'lot'>('risk') // risk = calc lot from risk%, lot = calc result from lot
  const [result, setResult] = useState<CalcResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Auto-calculate when inputs change
  useEffect(() => {
    calculate()
  }, [symbol, tradeType, accountBalance, riskPercent, entryPrice, stopLoss, takeProfit, lotSize, leverage, mode])

  const calculate = () => {
    setError(null)
    setResult(null)

    const balance = parseFloat(accountBalance)
    const entry = parseFloat(entryPrice)
    const sl = parseFloat(stopLoss)
    const tp = parseFloat(takeProfit)
    const lot = parseFloat(lotSize)
    const lev = parseFloat(leverage)
    const riskPct = parseFloat(riskPercent)

    if (!balance || !entry || !sl || isNaN(balance) || isNaN(entry) || isNaN(sl)) return
    if (balance <= 0 || entry <= 0 || sl <= 0) return

    // Validate SL direction
    if (tradeType === 'BUY' && sl >= entry) {
      setError('Stop Loss must be below Entry for a BUY trade')
      return
    }
    if (tradeType === 'SELL' && sl <= entry) {
      setError('Stop Loss must be above Entry for a SELL trade')
      return
    }

    const pipSize = getPipSize(symbol)
    const contractSize = getContractSize(symbol)

    // SL pips
    const slPips = calcPips(entry, sl, symbol)
    if (slPips <= 0) return

    // TP pips (optional)
    const tpPips = tp ? calcPips(entry, tp, symbol) : 0

    // Pip value (per 1 lot, USD-quoted pairs)
    // For JPY pairs: pip value = (pip size / price) * contract size
    // For USD pairs: pip value = pip size * contract size
    const pipValue = symbol.includes('JPY') || symbol.includes('XAU') || symbol.includes('XAG')
      ? (pipSize / entry) * contractSize
      : pipSize * contractSize

    let calcLot = lot

    if (mode === 'risk') {
      // Calculate lot size from risk %
      const riskAmount = (balance * riskPct) / 100
      calcLot = riskAmount / (slPips * pipValue)
      calcLot = Math.max(0.01, Math.round(calcLot * 100) / 100)
    }

    const riskAmount = slPips * pipValue * calcLot
    const rewardAmount = tpPips > 0 ? tpPips * pipValue * calcLot : 0
    const rr = rewardAmount > 0 ? rewardAmount / riskAmount : 0
    const riskPctResult = (riskAmount / balance) * 100
    const marginRequired = (entry * contractSize * calcLot) / lev

    // Break even price (to cover spread/commission — simplified)
    const breakEven = entry

    setResult({
      pips: Math.round(slPips * 10) / 10,
      pipValue: Math.round(pipValue * 10000) / 10000,
      riskAmount: Math.round(riskAmount * 100) / 100,
      rewardAmount: Math.round(rewardAmount * 100) / 100,
      riskReward: Math.round(rr * 100) / 100,
      riskPercent: Math.round(riskPctResult * 100) / 100,
      lotSize: calcLot,
      marginRequired: Math.round(marginRequired * 100) / 100,
      breakEven,
    })
  }

  const handleReset = () => {
    setEntryPrice('')
    setStopLoss('')
    setTakeProfit('')
    setLotSize('1')
    setResult(null)
    setError(null)
  }

  const riskColor = result
    ? result.riskPercent <= 1 ? 'text-green-500'
    : result.riskPercent <= 2 ? 'text-yellow-500'
    : 'text-red-500'
    : 'text-[var(--foreground)]'

  return (
    <MainLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Trade Calculator</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Calculate risk, lot size, and position metrics before entering a trade
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg hover:bg-[var(--border)] transition-colors text-sm"
          >
            <RefreshCw size={15} />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Input Panel ── */}
          <div className="space-y-4">

            {/* Account Settings */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5">
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Account</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Balance ($)</label>
                  <input
                    type="number"
                    value={accountBalance}
                    onChange={e => setAccountBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Leverage</label>
                  <select
                    value={leverage}
                    onChange={e => setLeverage(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    {['10','20','50','100','200','500'].map(l => (
                      <option key={l} value={l}>1:{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Trade Settings */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5">
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Trade</h2>
              <div className="space-y-4">

                {/* Symbol + Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Symbol</label>
                    <div className="relative">
                      <select
                        value={symbol}
                        onChange={e => setSymbol(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] appearance-none"
                      >
                        {PAIRS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Direction</label>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--background)] border border-[var(--border)] rounded-lg">
                      <button
                        onClick={() => setTradeType('BUY')}
                        className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          tradeType === 'BUY'
                            ? 'bg-green-500 text-white'
                            : 'text-[var(--muted-foreground)] hover:text-green-500'
                        }`}
                      >
                        BUY
                      </button>
                      <button
                        onClick={() => setTradeType('SELL')}
                        className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          tradeType === 'SELL'
                            ? 'bg-red-500 text-white'
                            : 'text-[var(--muted-foreground)] hover:text-red-500'
                        }`}
                      >
                        SELL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Entry Price</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={entryPrice}
                      onChange={e => setEntryPrice(e.target.value)}
                      placeholder="1.08500"
                      className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Stop Loss</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={stopLoss}
                      onChange={e => setStopLoss(e.target.value)}
                      placeholder="1.08200"
                      className="w-full px-3 py-2 bg-[var(--background)] border border-red-500/50 rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Take Profit</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={takeProfit}
                      onChange={e => setTakeProfit(e.target.value)}
                      placeholder="1.09100"
                      className="w-full px-3 py-2 bg-[var(--background)] border border-green-500/50 rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Mode toggle */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-[var(--muted-foreground)]">Calculate by:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMode('risk')}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        mode === 'risk'
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      Risk %
                    </button>
                    <button
                      onClick={() => setMode('lot')}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        mode === 'lot'
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      Lot Size
                    </button>
                  </div>
                </div>

                {/* Risk % or Lot size input */}
                {mode === 'risk' ? (
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">
                      Risk per trade (%)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        value={riskPercent}
                        onChange={e => setRiskPercent(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                      {/* Quick risk buttons */}
                      {['0.5', '1', '2', '3'].map(r => (
                        <button
                          key={r}
                          onClick={() => setRiskPercent(r)}
                          className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                            riskPercent === r
                              ? 'bg-[var(--primary)] text-white'
                              : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                          }`}
                        >
                          {r}%
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Lot Size</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={lotSize}
                        onChange={e => setLotSize(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                      {['0.01', '0.1', '0.5', '1'].map(l => (
                        <button
                          key={l}
                          onClick={() => setLotSize(l)}
                          className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                            lotSize === l
                              ? 'bg-[var(--primary)] text-white'
                              : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Result Panel ── */}
          <div className="space-y-4">

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {/* Empty state */}
            {!result && !error && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-12 flex flex-col items-center justify-center text-center">
                <Calculator size={40} className="text-[var(--muted-foreground)] mb-3" />
                <p className="text-sm text-[var(--muted-foreground)]">Fill in Entry and Stop Loss to see results</p>
              </div>
            )}

            {/* Results */}
            {result && (
              <>
                {/* Main metrics */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5">
                  <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Position Summary</h2>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Lot Size */}
                    <div className="p-3 bg-[var(--muted)] rounded-lg">
                      <p className="text-xs text-[var(--muted-foreground)] mb-1">Lot Size</p>
                      <p className="text-2xl font-bold text-[var(--primary)]">{result.lotSize}</p>
                    </div>

                    {/* Risk % */}
                    <div className="p-3 bg-[var(--muted)] rounded-lg">
                      <p className="text-xs text-[var(--muted-foreground)] mb-1">Risk</p>
                      <p className={`text-2xl font-bold ${riskColor}`}>{result.riskPercent}%</p>
                    </div>

                    {/* Risk $ */}
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingDown size={12} className="text-red-500" />
                        <p className="text-xs text-[var(--muted-foreground)]">Risk Amount</p>
                      </div>
                      <p className="text-xl font-bold text-red-500">-${result.riskAmount}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{result.pips} pips</p>
                    </div>

                    {/* Reward $ */}
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp size={12} className="text-green-500" />
                        <p className="text-xs text-[var(--muted-foreground)]">Reward Amount</p>
                      </div>
                      {result.rewardAmount > 0 ? (
                        <>
                          <p className="text-xl font-bold text-green-500">+${result.rewardAmount}</p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            {takeProfit ? calcPips(parseFloat(entryPrice), parseFloat(takeProfit), symbol).toFixed(1) : 0} pips
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">Set Take Profit</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* R:R + details */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5">
                  <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Details</h2>
                  <div className="space-y-3">
                    {[
                      {
                        label: 'Risk/Reward Ratio',
                        value: result.rewardAmount > 0 ? `1 : ${result.riskReward}` : '— (no TP set)',
                        highlight: result.riskReward >= 2,
                      },
                      { label: 'Pip Value (1 lot)', value: `$${result.pipValue}` },
                      { label: 'Margin Required', value: `$${result.marginRequired}` },
                      { label: 'SL Distance', value: `${result.pips} pips` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                        <span className="text-sm text-[var(--muted-foreground)]">{item.label}</span>
                        <span className={`text-sm font-medium ${
                          item.highlight ? 'text-green-500' : 'text-[var(--foreground)]'
                        }`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk warning */}
                {result.riskPercent > 2 && (
                  <div className="flex items-start gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-500">
                      Risk di atas 2% per trade. Kebanyakan professional trader risiko max 1-2% per trade.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-[var(--muted-foreground)] text-center">
          Calculator ini untuk estimasi. Hasil aktual bisa berbeda tergantung spread, slippage, dan kondisi market.
        </p>
      </div>
    </MainLayout>
  )
}
