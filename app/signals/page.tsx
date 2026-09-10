import { MainLayout } from '@/components/layout/main-layout'

export default function SignalsPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
          Signals
        </h1>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 text-center">
          <p className="text-[var(--muted-foreground)]">
            Trading signals page - Coming soon
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
