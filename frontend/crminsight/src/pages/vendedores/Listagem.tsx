import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Pencil, Search, X, ChevronLeft, ChevronRight, UserCircle, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { listarVendedores, deletarVendedor } from '../../api/vendedores'
import { taxaConversao, eficienciaVendedor, performanceMeta, especializacao } from '../../api/analitico'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import type { Analitico, Vendedor } from '../../types'

const ITENS_POR_PAGINA = 20

const rankColors: Record<string, string> = {
  OURO: 'bg-yellow-100 text-yellow-800',
  PRATA: 'bg-slate-100 text-slate-600',
  BRONZE: 'bg-orange-100 text-orange-800',
  TREINAMENTO: 'bg-blue-100 text-blue-800',
}

function formatMetric(m: Analitico | undefined): string {
  if (!m || m.valor === 0) return 'Sem dados'
  if (m.unidade === '%') return `${m.valor.toFixed(1)}%`
  return `${m.valor.toFixed(1)} ${m.unidade}`
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function VendedoresListagem() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: vendedores } = useQuery({
    queryKey: ['vendedores'],
    queryFn: listarVendedores,
  })

  const { data: txConversao } = useQuery({
    queryKey: ['analitico', 'taxa-conversao', selectedId],
    queryFn: () => taxaConversao(selectedId!),
    enabled: !!selectedId,
  })

  const { data: eficiencia } = useQuery({
    queryKey: ['analitico', 'eficiencia', selectedId],
    queryFn: () => eficienciaVendedor(selectedId!),
    enabled: !!selectedId,
  })

  const { data: perfMeta } = useQuery({
    queryKey: ['analitico', 'performance-meta', selectedId],
    queryFn: () => performanceMeta(selectedId!),
    enabled: !!selectedId,
  })

  const { data: espec } = useQuery({
    queryKey: ['analitico', 'especializacao', selectedId],
    queryFn: () => especializacao(selectedId!),
    enabled: !!selectedId,
  })

  const deleteMutation = useMutation({
    mutationFn: deletarVendedor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendedores'] }),
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

  const vendedoresFiltrados = useMemo(() => {
    return (vendedores ?? []).filter(v => {
      if (busca) {
        const q = busca.toLowerCase()
        return v.nome.toLowerCase().includes(q) || v.matricula.toLowerCase().includes(q)
      }
      return true
    })
  }, [vendedores, busca])

  const totalPaginas = Math.max(1, Math.ceil(vendedoresFiltrados.length / ITENS_POR_PAGINA))
  const vendedoresPaginados = vendedoresFiltrados.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const selectedVendedor = useMemo(() => {
    if (!selectedId) return null
    return (vendedores as Vendedor[] | undefined)?.find(v => v.id === selectedId) ?? null
  }, [selectedId, vendedores])

  useEffect(() => { setPagina(1) }, [busca])

  const chartData = [
    { name: 'Conversão', valor: txConversao?.valor ?? 0 },
    { name: 'Eficiência', valor: eficiencia?.valor ?? 0 },
    { name: 'Meta (%)', valor: perfMeta?.valor ?? 0 },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendedores</h1>
          <p className="text-slate-500 mt-1">{vendedores?.length ?? 0} vendedor(es) cadastrado(s)</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Buscar vendedor..." value={busca} onChange={e => setBusca(e.target.value)}
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
          {selectedVendedor ? (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Vendedor</span>
                  <UserCircle size={20} className="text-slate-400" />
                </div>
                <p className="text-xl font-bold text-slate-900">{selectedVendedor.nome}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">{selectedVendedor.matricula}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${rankColors[selectedVendedor.rank] ?? ''}`}>
                    {selectedVendedor.rank}
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <p>Meta mensal: <span className="text-slate-700 font-medium">{formatCurrency(selectedVendedor.metaMensal)}</span></p>
                  <p>Comissão base: <span className="text-slate-700 font-medium">{formatCurrency(selectedVendedor.comissaoBase)}</span></p>
                  <p>Admissão: <span className="text-slate-700 font-medium">{new Date(selectedVendedor.dataAdmissao + 'T00:00:00').toLocaleDateString('pt-BR')}</span></p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/vendedores/${selectedVendedor.id}/editar`}
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-700 px-2 py-1 border border-slate-200 rounded-lg"
                  >
                    <Pencil size={12} /> Editar
                  </Link>
                  <button
                    onClick={() => setDeleteId(selectedVendedor.id)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 border border-red-200 rounded-lg"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <MetricCard label="Conversão" value={formatMetric(txConversao)} />
                <MetricCard label="Eficiência" value={formatMetric(eficiencia)} />
                <MetricCard label="Meta" value={formatMetric(perfMeta)} />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Indicadores</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 'auto']} />
                      {/* @ts-expect-error recharts Tooltip formatter type mismatch */}
                      <Tooltip formatter={(value: number) => `${Number(value).toFixed(1)}%`} />
                      <Bar dataKey="valor" fill="#0f172a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {espec && espec.valor > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <p className="text-xs text-slate-500 mb-1">Especialização</p>
                  <p className="text-sm font-medium text-slate-900">Segmento: {espec.unidade}</p>
                  <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-slate-900" style={{ width: `${Math.min(espec.valor, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
              <BarChart3 size={48} className="mb-4" />
              <p className="text-sm">Selecione um vendedor ao lado</p>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {vendedoresFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
              {busca ? 'Nenhum vendedor encontrado' : 'Nenhum vendedor cadastrado'}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {vendedoresPaginados.map(v => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedId(v.id)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        selectedId === v.id
                          ? 'bg-slate-100 border-l-2 border-slate-900'
                          : 'hover:bg-slate-50 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex-1 grid grid-cols-[1fr_auto] gap-4 items-center min-w-0">
                        <span className="text-sm font-medium text-slate-900 truncate">{v.nome}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${rankColors[v.rank] ?? ''}`}>
                          {v.rank}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{v.matricula}</span>
                      <Link
                        to={`/vendedores/${v.id}/editar`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                      >
                        <Pencil size={14} />
                      </Link>
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
        title="Excluir Vendedor"
        message="Tem certeza? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${value === 'Sem dados' ? 'text-slate-300' : 'text-slate-900'}`}>{value}</p>
    </div>
  )
}
