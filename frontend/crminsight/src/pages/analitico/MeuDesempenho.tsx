import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { meuTaxaConversao, meuEficienciaVendedor, meuPerformanceMeta, meuEspecializacao } from '../../api/analitico'
import { useAuth } from '../../context/AuthContext'
import type { Analitico } from '../../types'

function formatMetric(m: Analitico | undefined): string {
  if (!m || m.valor === 0) return 'Sem dados'
  if (m.unidade === '%') return `${m.valor.toFixed(1)}%`
  return `${m.valor.toFixed(1)} ${m.unidade}`
}

export default function MeuDesempenho() {
  const { usuario } = useAuth()

  const { data: txConversao, isLoading: loading1 } = useQuery({
    queryKey: ['meu-analitico', 'taxa-conversao'],
    queryFn: meuTaxaConversao,
  })

  const { data: eficiencia, isLoading: loading2 } = useQuery({
    queryKey: ['meu-analitico', 'eficiencia'],
    queryFn: meuEficienciaVendedor,
  })

  const { data: perfMeta, isLoading: loading3 } = useQuery({
    queryKey: ['meu-analitico', 'performance-meta'],
    queryFn: meuPerformanceMeta,
  })

  const { data: espec, isLoading: loading4 } = useQuery({
    queryKey: ['meu-analitico', 'especializacao'],
    queryFn: meuEspecializacao,
  })

  const loading = loading1 || loading2 || loading3 || loading4

  const chartData = [
    { name: 'Conversão', valor: txConversao?.valor ?? 0 },
    { name: 'Eficiência', valor: eficiencia?.valor ?? 0 },
    { name: 'Meta (%)', valor: perfMeta?.valor ?? 0 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Carregando métricas...
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Meu Desempenho</h1>
      <p className="text-slate-500 mb-8">{usuario?.username}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Indicadores</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard label="Taxa Conversão" value={formatMetric(txConversao)} />
            <MetricCard label="Eficiência" value={formatMetric(eficiencia)} />
            <MetricCard label="Performance / Meta" value={formatMetric(perfMeta)} />
          </div>

          <div className="h-72">
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
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Especialização</h2>
          {espec && espec.valor > 0 ? (
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500 mb-1">Segmento predominante</p>
              <p className="text-2xl font-bold text-slate-900">{espec.unidade}</p>
            </div>
          ) : (
            <p className="text-slate-400">Nenhum dado disponível</p>
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
      <p className={`text-xl font-bold ${value === 'Sem dados' ? 'text-slate-300' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  )
}
