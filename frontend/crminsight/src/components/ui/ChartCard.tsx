import { BarChart3 } from 'lucide-react'

interface ChartCardProps {
  title: string
  empty?: boolean
  emptyMessage?: string
  children: React.ReactNode
}

export default function ChartCard({ title, empty, emptyMessage, children }: ChartCardProps) {
  if (empty) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
          <BarChart3 size={32} className="mb-2" />
          <p className="text-sm">{emptyMessage ?? 'Sem dados'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      {children}
    </div>
  )
}
