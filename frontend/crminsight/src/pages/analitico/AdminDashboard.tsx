import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { listarVendedores } from '../../api/vendedores'
import { listarClientes } from '../../api/clientes'
import { taxaConversao, eficienciaVendedor, performanceMeta, especializacao, ticketMedio30d, churnProbabilidade } from '../../api/analitico'
import type { Analitico } from '../../types'

function formatMetric(m: Analitico | undefined): string {
  if (!m || m.valor === 0) return 'Sem dados'
  if (m.unidade === '%') return `${m.valor.toFixed(1)}%`
  if (m.unidade === 'R$') return `R$ ${m.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  return `${m.valor.toFixed(1)} ${m.unidade}`
}

export default function AdminDashboard() {
  const [selectedVendedor, setSelectedVendedor] = useState<string>('')
  const [selectedCliente, setSelectedCliente] = useState<string>('')

  const { data: vendedores } = useQuery({
    queryKey: ['vendedores'],
    queryFn: listarVendedores,
  })

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
  })

  const { data: txConversao } = useQuery({
    queryKey: ['analitico', 'taxa-conversao', selectedVendedor],
    queryFn: () => taxaConversao(selectedVendedor),
    enabled: !!selectedVendedor,
  })

  const { data: eficiencia } = useQuery({
    queryKey: ['analitico', 'eficiencia', selectedVendedor],
    queryFn: () => eficienciaVendedor(selectedVendedor),
    enabled: !!selectedVendedor,
  })

  const { data: perfMeta } = useQuery({
    queryKey: ['analitico', 'performance-meta', selectedVendedor],
    queryFn: () => performanceMeta(selectedVendedor),
    enabled: !!selectedVendedor,
  })

  const { data: espec } = useQuery({
    queryKey: ['analitico', 'especializacao', selectedVendedor],
    queryFn: () => especializacao(selectedVendedor),
    enabled: !!selectedVendedor,
  })

  const { data: ticket } = useQuery({
    queryKey: ['analitico', 'ticket-medio', selectedCliente],
    queryFn: () => ticketMedio30d(selectedCliente),
    enabled: !!selectedCliente,
  })

  const { data: churn } = useQuery({
    queryKey: ['analitico', 'churn', selectedCliente],
    queryFn: () => churnProbabilidade(selectedCliente),
    enabled: !!selectedCliente,
  })

  const chartData = [
    { name: 'Conversão', valor: txConversao?.valor ?? 0 },
    { name: 'Eficiência', valor: eficiencia?.valor ?? 0 },
    { name: 'Meta (%)', valor: perfMeta?.valor ?? 0 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Analítico</h1>
      <p className="text-slate-500 mb-8">Métricas e indicadores do sistema</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seção Vendedor */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Métricas por Vendedor</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Selecione um vendedor</label>
            <select
              value={selectedVendedor}
              onChange={(e) => setSelectedVendedor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
            >
              <option value="">Selecione...</option>
              {vendedores?.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
            </select>
          </div>

          {selectedVendedor && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <MetricCard label="Taxa Conversão" value={formatMetric(txConversao)} />
                <MetricCard label="Eficiência" value={formatMetric(eficiencia)} />
                <MetricCard label="Performance / Meta" value={formatMetric(perfMeta)} />
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 'auto']} />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Bar dataKey="valor" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {espec && espec.valor > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-700 mb-2">Especialização</p>
                  <p className="text-sm text-slate-500">
                    Segmento predominante: <strong>{espec.unidade}</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Seção Cliente */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Métricas por Cliente</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Selecione um cliente</label>
            <select
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
            >
              <option value="">Selecione...</option>
              {clientes?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          {selectedCliente && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Ticket Médio (30d)" value={formatMetric(ticket)} />
                <MetricCard label="Risco de Churn" value={formatMetric(churn)} />
              </div>

              {churn && churn.valor > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Nível de risco</span>
                    <span className={`text-sm font-bold ${
                      churn.valor >= 60 ? 'text-red-600' : churn.valor >= 30 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {churn.valor >= 60 ? 'Alto' : churn.valor >= 30 ? 'Médio' : 'Baixo'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        churn.valor >= 60 ? 'bg-red-500' : churn.valor >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(churn.valor, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {ticket && ticket.valor > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">Ticket Médio (últimos 30 dias)</p>
                  <p className="text-2xl font-bold text-slate-900">{formatMetric(ticket)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${value === 'Sem dados' ? 'text-slate-300' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  )
}
