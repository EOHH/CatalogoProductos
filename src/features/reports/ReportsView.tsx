import { Card } from '@/components/ui/card'
import { Package } from 'lucide-react' // Using a generic icon for now

export function ReportsView() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Reports
          </h1>
          <p className="text-[15px] text-zinc-500 mt-1">
            Gestión de reports
          </p>
        </div>
      </div>

      <Card className="rounded-[1.5rem] border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">Módulo en construcción</h3>
        <p className="text-zinc-500 max-w-sm">
          Este módulo está siendo preparado arquitectónicamente para su integración con Supabase.
        </p>
      </Card>
    </div>
  )
}
