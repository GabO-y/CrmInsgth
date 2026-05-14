import { Trash2 } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onDelete?: (item: T) => void
  loading?: boolean
  emptyMessage?: string
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onDelete,
  loading,
  emptyMessage = 'Nenhum registro encontrado',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
        Carregando...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th key={String(col.key)} className="text-left px-4 py-3 text-sm font-semibold text-slate-600">
                  {col.header}
                </th>
              ))}
              {onDelete && <th className="px-4 py-3 w-16" />}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-sm text-slate-700">
                    {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                  </td>
                ))}
                {onDelete && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onDelete(item)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
