'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Indicator {
  id: string
  name: string
  enabled: boolean
  color?: string
}

interface IndicatorPanelProps {
  indicators: Indicator[]
  onToggleIndicator: (id: string) => void
}

export function IndicatorPanel({ indicators, onToggleIndicator }: IndicatorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--muted)] transition-colors"
      >
        <span className="font-medium text-[var(--foreground)]">Technical Indicators</span>
        {isExpanded ? (
          <ChevronUp size={20} className="text-[var(--muted-foreground)]" />
        ) : (
          <ChevronDown size={20} className="text-[var(--muted-foreground)]" />
        )}
      </button>

      {/* Indicators List */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-2">
          {indicators.map((indicator) => (
            <label
              key={indicator.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--muted)] cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={indicator.enabled}
                onChange={() => onToggleIndicator(indicator.id)}
                className="w-4 h-4 rounded border-[var(--border)] bg-[var(--background)] checked:bg-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
              />
              <div className="flex items-center gap-2 flex-1">
                {indicator.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: indicator.color }}
                  />
                )}
                <span className="text-sm text-[var(--foreground)]">{indicator.name}</span>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="p-4 pt-0">
        <div className="text-xs text-[var(--muted-foreground)]">
          {indicators.filter(i => i.enabled).length} of {indicators.length} indicators enabled
        </div>
      </div>
    </div>
  )
}
