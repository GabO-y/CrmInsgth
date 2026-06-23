import { useMemo } from 'react'
import { DollarSign, User, ShoppingCart, Percent, Package } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import type { Venda } from '../../types'
import ChartCard from '../../components/ui/ChartCard'

const statusColors: Record<string, string> = {
  CONCLUIDA: '#22c55e',
  CANCELADA: '#ef4444',
  EM_ANALISE: '#eab308',
}

const statusLabel: Record<string, string> = {
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  EM_ANALISE: 'Em Análise',
}

const statusBg: Record<string, string> = {
  CONCLUIDA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
  EM_ANALISE: 'bg-yellow-100 text-yellow-800',
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface Props {
  venda: Venda | null
  vendas: Venda[]
}

export default function VendaDetalhes({ venda, vendas }: Props) {
  const statusVendedorData = useMemo(() => {
    if (!venda) return []
    const vendasVendedor = vendas.filter(v => v.vendedorId === venda.vendedorId)
    const counts: Record<string, number> = {}
    for (const v of vendasVendedor) {
      counts[v.status] = (counts[v.status] || 0) + 1
    }
    return Object.entries(counts).map(([key, value]) => ({
      name: statusLabel[key] ?? key,
      value,
      color: statusColors[key] ?? '#94a3b8',
    }))
  }, [venda, vendas])

  const vendasClienteData = useMemo(() => {
    if (!venda) return []
    const vendasCliente = vendas.filter(v => v.clienteId === venda.clienteId)
    const byMonth: Record<string, number> = {}
    for (const v of vendasCliente) {
      const mes = v.data.substring(0, 7)
      byMonth[mes] = (byMonth[mes] || 0) + v.valor
    }
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, valor]) => {
        const [, m] = mes.split('-')
        return { name: monthNames[parseInt(m) - 1], valor }
      })
  }, [venda, vendas])

  if (!venda) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
        <ShoppingCart size={48} className="mb-4" />
        <p className="text-sm">Selecione uma venda ao lado</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500">Valor da Venda</span>
          <DollarSign size={20} className="text-slate-400" />
        </div>
        <p className="text-3xl font-bold text-slate-900">{formatCurrency(venda.valor)}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBg[venda.status] ?? ''}`}>
            {venda.status.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-400">
            Comissão: {formatCurrency(venda.comissaoPaga)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Package size={16} className="text-slate-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Produto</p>
            <p className="text-sm font-medium text-slate-900 truncate">{venda.nomeProduto}</p>
            {venda.descricao && <p className="text-xs text-slate-500 mt-0.5">{venda.descricao}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User size={16} className="text-slate-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Cliente</p>
            <p className="text-sm font-medium text-slate-900 truncate">{venda.clienteNome}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Percent size={16} className="text-slate-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Vendedor</p>
            <p className="text-sm font-medium text-slate-900 truncate">{venda.vendedorNome}</p>
          </div>
        </div>
      </div>

      <ChartCard title="Status das Vendas do Vendedor" empty={statusVendedorData.length === 0} emptyMessage="Nenhuma venda do vendedor">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusVendedorData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusVendedorData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Vendas do Cliente por Mês" empty={vendasClienteData.length === 0} emptyMessage="Nenhuma venda do cliente">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vendasClienteData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={50} />
              {/* @ts-expect-error recharts Tooltip formatter type mismatch */}
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Faturamento']} />
              <Bar dataKey="valor" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  )
}
