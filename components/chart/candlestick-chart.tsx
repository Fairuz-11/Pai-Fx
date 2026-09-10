'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts'
import { Candle, Timeframe } from '@/types/market'
import { Loader2 } from 'lucide-react'

interface CandlestickChartProps {
  symbol: string
  timeframe: Timeframe
  height?: number
  showVolume?: boolean
}

export function CandlestickChart({
  symbol,
  timeframe,
  height = 500,
  showVolume = true,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0f1419' },
        textColor: '#adbac7',
      },
      grid: {
        vertLines: { color: '#1c2128' },
        horzLines: { color: '#1c2128' },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      rightPriceScale: {
        borderColor: '#2B2B43',
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#758390',
          width: 1,
          style: 3,
          labelBackgroundColor: '#363c4e',
        },
        horzLine: {
          color: '#758390',
          width: 1,
          style: 3,
          labelBackgroundColor: '#363c4e',
        },
      },
    })

    chartRef.current = chart

    // Add candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    candleSeriesRef.current = candleSeries

    // Add volume series if enabled
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      })

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      })

      volumeSeriesRef.current = volumeSeries
    }

    // Fetch data
    fetchChartData()

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
      }
    }
  }, [symbol, timeframe, height, showVolume])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/market/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&limit=200`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch chart data')
      }

      const data = await response.json()
      
      if (!data.candles || data.candles.length === 0) {
        throw new Error('No data available')
      }

      updateChart(data.candles)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching chart data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chart')
      setLoading(false)
    }
  }

  const updateChart = (candles: Candle[]) => {
    if (!candleSeriesRef.current) return

    // Convert candles to lightweight-charts format
    const candleData: CandlestickData[] = candles.map(candle => ({
      time: Math.floor(candle.timestamp / 1000) as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }))

    candleSeriesRef.current.setData(candleData)

    // Update volume if enabled
    if (showVolume && volumeSeriesRef.current) {
      const volumeData = candles
        .filter(c => c.volume !== undefined)
        .map(candle => ({
          time: Math.floor(candle.timestamp / 1000) as Time,
          value: candle.volume!,
          color: candle.close >= candle.open ? '#22c55e80' : '#ef444480',
        }))

      volumeSeriesRef.current.setData(volumeData)
    }

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }
  }

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--card)] z-10">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Loader2 size={20} className="animate-spin" />
            <span>Loading chart...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--card)] z-10">
          <div className="text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <button
              onClick={fetchChartData}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div ref={chartContainerRef} className="w-full" />
    </div>
  )
}
