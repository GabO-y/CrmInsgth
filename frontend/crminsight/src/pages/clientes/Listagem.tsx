import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Pencil, Search, X, ChevronLeft, ChevronRight, Building2, ShoppingCart, DollarSign, Phone, TrendingUp, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { listarClientes, deletarCliente } from '../../api/clientes'
import { listarVendas } from '../../api/vendas'
import { listarInteracoes } from '../../api/interacoes'
import { ticketMedio30d, churnProbabilidade } from '../../api/analitico'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import type { Cliente, Venda, Analitico } from '../../types'

const ITENS_POR_PAGINA = 20

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

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getLast6Months(): { key: string; label: string }[] {
  const result = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    result.push({ key, label: `${monthNames[d.getMonth()]}/${d.getFullYear()}` })
  }
  return result
}

function formatMetric(m: Analitico | undefined): string {
  if (!m || m.valor === 0) return 'Sem dados'
  if (m.unidade === '%') return `${m.valor.toFixed(1)}%`
  return `${m.valor.toFixed(1)} ${m.unidade}`
}

export default function ClientesListagem() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
  })

  const { data: vendas } = useQuery({
    queryKey: ['vendas'],
    queryFn: listarVendas,
  })

  const { data: interacoes } = useQuery({
    queryKey: ['interacoes'],
    queryFn: listarInteracoes,
  })

  const { data: ticketMedio } = useQuery({
    queryKey: ['analitico', 'ticket-medio-30d', selectedId],
    queryFn: () => ticketMedio30d(selectedId!),
    enabled: !!selectedId,
  })

  const { data: churn } = useQuery({
    queryKey: ['analitico', 'churn', selectedId],
    queryFn: () => churnProbabilidade(selectedId!),
    enabled: !!selectedId,
  })

  const deleteMutation = useMutation({
    mutationFn: deletarCliente,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
  })

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      if (selectedId === deleteId) setSelectedId(null)
    } finally {
      setDeleteId(null)
    }
  }

  const clientesFiltrados = useMemo(() => {
    return (clientes ?? []).filter(c => {
      if (busca) {
        const q = busca.toLowerCase()
        return c.nome.toLowerCase().includes(q) || c.segmento.toLowerCase().includes(q)
      }
      return true
    })
  }, [clientes, busca])

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / ITENS_POR_PAGINA))
  const clientesPaginados = clientesFiltrados.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const selectedCliente = useMemo(() => {
    if (!selectedId) return null
    return (clientes as Cliente[] | undefined)?.find(c => c.id === selectedId) ?? null
  }, [selectedId, clientes])

  useEffect(() => { setPagina(1) }, [busca])

  const clientVendas = useMemo(() => {
    return (vendas ?? []).filter((v: Venda) => v.clienteId === selectedId)
  }, [vendas, selectedId])

  const clientInteracoes = useMemo(() => {
    return (interacoes ?? []).filter((i: { clienteId: string }) => i.clienteId === selectedId)
  }, [interacoes, selectedId])

  const totalGasto = clientVendas.reduce((s: number, v: Venda) => s + v.valor, 0)
  const totalInteracoesCount = clientInteracoes.length

  const meses = getLast6Months()
  const vendasChartData = meses.map(({ key, label }) => ({
    name: label,
    valor: clientVendas
      .filter((v: Venda) => v.data.startsWith(key))
      .reduce((s: number, v: Venda) => s + v.valor, 0),
  }))

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { CONCLUIDA: 0, CANCELADA: 0, EM_ANALISE: 0 }
    for (const v of clientVendas) {
      counts[v.status] = (counts[v.status] ?? 0) + 1
    }
    return counts
  }, [clientVendas])

  const pieData = Object.entries(statusCounts)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: statusLabel[key] ?? key,
      value,
      color: statusColors[key] ?? '#94a3b8',
    }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 mt-1">{clientes?.length ?? 0} cliente(s) cadastrado(s)</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Buscar cliente..." value={busca} onChange={e => setBusca(e.target.value)}
            className="w-60 pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
        {busca && (
          <button onClick={() => setBusca('')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5">
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      <div className="flex gap-6 items-start">
        <div className="w-2/5 shrink-0 sticky top-8 self-start">
          {selectedCliente ? (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Cliente</span>
                  <Building2 size={20} className="text-slate-400" />
                </div>
                <p className="text-xl font-bold text-slate-900">{selectedCliente.nome}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">{selectedCliente.segmento}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedCliente.score >= 70 ? 'bg-green-100 text-green-800' :
                    selectedCliente.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Score: {selectedCliente.score}
                  </span>
                </div>
                {isAdmin && (
                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/clientes/${selectedCliente.id}/editar`}
                      className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-700 px-2 py-1 border border-slate-200 rounded-lg"
                    >
                      <Pencil size={12} /> Editar
                    </Link>
                    <button
                      onClick={() => setDeleteId(selectedCliente.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 border border-red-200 rounded-lg"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatsCard icon={ShoppingCart} label="Compras" value={clientVendas.length} />
                <StatsCard icon={DollarSign} label="Total Gasto" value={formatCurrency(totalGasto)} />
                <StatsCard icon={TrendingUp} label="Ticket 30d" value={formatMetric(ticketMedio)} />
                <StatsCard icon={Phone} label="Interações" value={totalInteracoesCount} />
              </div>

              {churn && churn.valor > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    <span className="text-xs text-slate-500">Risco de Churn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${churn.valor >= 70 ? 'bg-red-500' : churn.valor >= 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(churn.valor, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{churn.valor.toFixed(0)}%</span>
                  </div>
                </div>
              )}

              {clientVendas.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Vendas por Mês</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vendasChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                        {/* @ts-expect-error recharts formatter type mismatch */}
                        <Tooltip formatter={(value: number) => [formatCurrency(value), 'Faturamento']} />
                        <Bar dataKey="valor" fill="#0f172a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {pieData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Status das Vendas</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%" cy="50%"
                          innerRadius={40} outerRadius={70}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
              <Building2 size={48} className="mb-4" />
              <p className="text-sm">Selecione um cliente ao lado</p>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {clientesFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
              {busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {clientesPaginados.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        selectedId === c.id
                          ? 'bg-slate-100 border-l-2 border-slate-900'
                          : 'hover:bg-slate-50 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex-1 grid grid-cols-[1fr_auto_auto] gap-4 items-center min-w-0">
                        <span className="text-sm font-medium text-slate-900 truncate">{c.nome}</span>
                        <span className="text-xs text-slate-500 shrink-0">{c.segmento}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                          c.score >= 70 ? 'bg-green-100 text-green-800' :
                          c.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {c.score}
                        </span>
                      </div>
                      {isAdmin && (
                        <Link
                          to={`/clientes/${c.id}/editar`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                        >
                          <Pencil size={14} />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {totalPaginas > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                  <button
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={pagina <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <span className="text-slate-500">Página {pagina} de {totalPaginas}</span>
                  <button
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    disabled={pagina >= totalPaginas}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Próximo <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir Cliente"
        message="Tem certeza? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

function StatsCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
          <Icon size={16} />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-sm font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
