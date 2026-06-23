import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { listarVendas, deletarVenda } from '../../api/vendas'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import VendaDetalhes from './VendaDetalhes'

const ITENS_POR_PAGINA = 20

const statusColors: Record<string, string> = {
  CONCLUIDA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
  EM_ANALISE: 'bg-yellow-100 text-yellow-800',
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function VendasListagem() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)

  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [busca, setBusca] = useState('')

  const { data: vendas, isLoading } = useQuery({
    queryKey: ['vendas'],
    queryFn: listarVendas,
  })

  const deleteMutation = useMutation({
    mutationFn: deletarVenda,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendas'] }),
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

  const vendasFiltradas = useMemo(() => {
    return (vendas ?? []).filter(v => {
      if (filtroStatus && v.status !== filtroStatus) return false
      if (busca) {
        const q = busca.toLowerCase()
        if (!v.clienteNome.toLowerCase().includes(q) && !v.vendedorNome.toLowerCase().includes(q)) return false
      }
      if (dataInicio && v.data < dataInicio) return false
      if (dataFim && v.data > dataFim) return false
      return true
    })
  }, [vendas, dataInicio, dataFim, filtroStatus, busca])

  const totalPaginas = Math.max(1, Math.ceil(vendasFiltradas.length / ITENS_POR_PAGINA))
  const vendasPaginadas = vendasFiltradas.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const vendaSelecionada = useMemo(() => {
    if (!selectedId) return null
    return vendas?.find(v => v.id === selectedId) ?? null
  }, [selectedId, vendas])

  useEffect(() => {
    if (selectedId && !vendasFiltradas.some(v => v.id === selectedId)) {
      setSelectedId(null)
    }
  }, [vendasFiltradas, selectedId])

  useEffect(() => {
    setPagina(1)
  }, [dataInicio, dataFim, filtroStatus, busca])

  const temFiltro = dataInicio || dataFim || filtroStatus || busca

  function limparFiltros() {
    setDataInicio('')
    setDataFim('')
    setFiltroStatus('')
    setBusca('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendas</h1>
          <p className="text-slate-500 mt-1">{vendasFiltradas.length} de {(vendas ?? []).length} venda(s)</p>
        </div>
        <Link
          to="/vendas/novo"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Nova Venda
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
          className="w-36 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
        <span className="text-slate-400 text-xs">até</span>
        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
          className="w-36 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
          className="w-32 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent">
          <option value="">Todos</option>
          <option value="CONCLUIDA">Concluída</option>
          <option value="CANCELADA">Cancelada</option>
          <option value="EM_ANALISE">Em Análise</option>
        </select>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar cliente/vendedor..." value={busca} onChange={e => setBusca(e.target.value)}
            className="w-52 pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
        </div>
        {temFiltro && (
          <button onClick={limparFiltros} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5">
            <X size={14} />
            Limpar
          </button>
        )}
      </div>

      <div className="flex gap-6 items-start">
        <div className="w-2/5 shrink-0 sticky top-8 self-start">
          <VendaDetalhes venda={vendaSelecionada ?? null} vendas={vendas ?? []} />
        </div>

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
              Carregando...
            </div>
          ) : vendasFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
              {temFiltro ? 'Nenhuma venda encontrada com os filtros atuais' : 'Nenhuma venda registrada'}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {vendasPaginadas.map(v => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedId(v.id)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        selectedId === v.id
                          ? 'bg-slate-100 border-l-2 border-slate-900'
                          : 'hover:bg-slate-50 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex-1 grid grid-cols-[auto_1fr_auto] gap-4 items-center min-w-0">
                        <span className="text-sm text-slate-600 w-20 shrink-0">{formatDate(v.data)}</span>
                        <span className="text-sm font-medium text-slate-900 truncate">{formatCurrency(v.valor)}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[v.status] ?? ''}`}>
                          {v.status === 'CONCLUIDA' ? 'OK' : v.status === 'CANCELADA' ? 'CAN' : 'ANA'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 truncate max-w-[140px] shrink-0" title={v.nomeProduto}>{v.nomeProduto}</span>
                      <span className="text-xs text-slate-400 truncate max-w-[100px] shrink-0">{v.clienteNome}</span>
                      {isAdmin && (
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteId(v.id) }}
                          className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
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
                    <ChevronLeft size={16} />
                    Anterior
                  </button>
                  <span className="text-slate-500">
                    Página {pagina} de {totalPaginas}
                  </span>
                  <button
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    disabled={pagina >= totalPaginas}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Próximo
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir Venda"
        message="Tem certeza? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
