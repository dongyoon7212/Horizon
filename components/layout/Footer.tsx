import HorizonDivider from '@/components/ui/HorizonDivider'

export default function Footer() {
  return (
    <footer className="mt-20">
      <HorizonDivider />
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-display text-sm text-muted">
          <span className="gradient-text-rise font-semibold">Horizon</span>
          {' '}— AI trends rise and set on the Horizon
        </p>
        <p className="text-xs text-muted font-body">
          Data refreshed every 6 hours · Built with Next.js
        </p>
      </div>
    </footer>
  )
}
