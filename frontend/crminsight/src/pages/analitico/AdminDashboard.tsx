import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowLeft } from 'lucide-react'
import { listarVendedores } from '../../api/vendedores'
import { listarClientes } from '../../api/clientes'
import { taxaConversao, eficienciaVendedor, performanceMeta, especializacao, ticketMedio30d, churnProbabilidade } from '../../api/analitico'
import type { Analitico, Vendedor, Cliente } from '../../types'

type Tab = 'vendedor' | 'cliente'

function formatMetric(m: Analitico | undefined): string {
  if (!m || m.valor === 0) return 'Sem dados'
  if (m.unidade === '%') return `${m.valor.toFixed(1)}%`
  if (m.unidade === 'R$') return `R$ ${m.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  return `${m.valor.toFixed(1)} ${m.unidade}`
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('vendedor')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: vendedores } = useQuery({
    queryKey: ['vendedores'],
    queryFn: listarVendedores,
  })

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
  })

  const { data: txConversao } = useQuery({
    queryKey: ['analitico', 'taxa-conversao', selectedId],
    queryFn: () => taxaConversao(selectedId!),
    enabled: tab === 'vendedor' && !!selectedId,
  })

  const { data: eficiencia } = useQuery({
    queryKey: ['analitico', 'eficiencia', selectedId],
    queryFn: () => eficienciaVendedor(selectedId!),
    enabled: tab === 'vendedor' && !!selectedId,
  })

  const { data: perfMeta } = useQuery({
    queryKey: ['analitico', 'performance-meta', selectedId],
    queryFn: () => performanceMeta(selectedId!),
    enabled: tab === 'vendedor' && !!selectedId,
  })

  const { data: espec } = useQuery({
    queryKey: ['analitico', 'especializacao', selectedId],
    queryFn: () => especializacao(selectedId!),
    enabled: tab === 'vendedor' && !!selectedId,
  })

  const { data: ticket } = useQuery({
    queryKey: ['analitico', 'ticket-medio', selectedId],
    queryFn: () => ticketMedio30d(selectedId!),
    enabled: tab === 'cliente' && !!selectedId,
  })

  const { data: churn } = useQuery({
    queryKey: ['analitico', 'churn', selectedId],
    queryFn: () => churnProbabilidade(selectedId!),
    enabled: tab === 'cliente' && !!selectedId,
  })

  const items = tab === 'vendedor' ? vendedores : clientes
  const selectedNome = tab === 'vendedor'
    ? (vendedores as Vendedor[] | undefined)?.find(v => v.id === selectedId)?.nome
    : (clientes as Cliente[] | undefined)?.find(c => c.id === selectedId)?.nome

  function handleTabChange(newTab: Tab) {
    setTab(newTab)
    setSelectedId(null)
  }

  const chartData = [
    { name: 'Conversão', valor: txConversao?.valor ?? 0 },
    { name: 'Eficiência', valor: eficiencia?.valor ?? 0 },
    { name: 'Meta (%)', valor: perfMeta?.valor ?? 0 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Analítico</h1>
      <p className="text-slate-500 mb-6">Métricas e indicadores do sistema</p>

      {!selectedId && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleTabChange('vendedor')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'vendedor'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Vendedor
          </button>
          <button
            onClick={() => handleTabChange('cliente')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'cliente'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Cliente
          </button>
        </div>
      )}

      {!selectedId ? (
        <div className="grid grid-cols-2 gap-4">
          {items?.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
            >
              <p className="font-medium text-slate-900">{item.nome}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <h2 className="text-xl font-bold text-slate-900 mb-6">{selectedNome}</h2>

          {tab === 'vendedor' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
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
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 mb-1">Especialização</p>
                  <p className="text-sm text-slate-500">
                    Segmento predominante: <strong>{espec.unidade}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'cliente' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
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
      )}
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
