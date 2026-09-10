import { MainLayout } from '@/components/layout/main-layout'
import { MarketTable } from '@/components/market/market-table'

export default function MarketPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            Forex Market
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Real-time prices, signals, and analysis for major currency pairs
          </p>
        </div>
        
        <MarketTable />
      </div>
    </MainLayout>
  )
}
