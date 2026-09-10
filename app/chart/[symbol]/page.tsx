import { MainLayout } from '@/components/layout/main-layout'
import { ChartContainer } from '@/components/chart/chart-container'

// Next.js 15+ requires params to be awaited
export default async function ChartPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol: rawSymbol } = await params
  // Convert symbol from URL format (EUR-USD) to display format (EUR/USD)
  const symbol = rawSymbol.replace('-', '/')

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            {symbol}
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Real-time candlestick chart with technical indicators
          </p>
        </div>

        <ChartContainer symbol={symbol} defaultTimeframe="1h" />
      </div>
    </MainLayout>
  )
}
