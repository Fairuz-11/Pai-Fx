import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, decimals: number = 5): string {
  return price.toFixed(decimals)
}

export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}

export function formatDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export function getSignalColor(signal: string): string {
  switch (signal.toUpperCase()) {
    case 'BUY':
      return 'text-green-500'
    case 'SELL':
      return 'text-red-500'
    case 'HOLD':
    case 'NEUTRAL':
      return 'text-yellow-500'
    default:
      return 'text-gray-500'
  }
}

export function getTrendColor(trend: string): string {
  switch (trend.toLowerCase()) {
    case 'bullish':
      return 'text-green-500'
    case 'bearish':
      return 'text-red-500'
    case 'neutral':
    case 'sideways':
      return 'text-yellow-500'
    default:
      return 'text-gray-500'
  }
}
