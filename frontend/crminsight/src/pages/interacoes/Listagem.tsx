import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { listarInteracoes, deletarInteracao } from '../../api/interacoes'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import InteracaoDetalhes from './InteracaoDetalhes'

const ITENS_POR_PAGINA = 20

const canalBg: Record<string, string> = {
  TELEFONE: 'bg-blue-100 text-blue-800',
  EMAIL: 'bg-purple-100 text-purple-800',
  WHATSAPP: 'bg-green-100 text-green-800',
  REUNIAO: 'bg-orange-100 text-orange-800',
}

function formatDataHoraCompacta(dt: string): string {
  const d = new Date(dt)
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const hora = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dia}/${mes} ${hora}:${min}`
}

export default function InteracoesListagem() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)

  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtroCanal, setFiltroCanal] = useState('')
  const [busca, setBusca] = useState('')

  const { data: interacoes, isLoading } = useQuery({
    queryKey: ['interacoes'],
    queryFn: listarInteracoes,
  })

  const deleteMutation = useMutation({
    mutationFn: deletarInteracao,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interacoes'] }),
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

  const interacoesFiltradas = useMemo(() => {
    return (interacoes ?? []).filter(i => {
      if (filtroCanal && i.canal !== filtroCanal) return false
      if (busca) {
        const q = busca.toLowerCase()
        if (!i.clienteNome.toLowerCase().includes(q) && !i.vendedorNome.toLowerCase().includes(q)) return false
      }
      if (dataInicio || dataFim) {
        const dataHora = i.dataHora.substring(0, 10)
        if (dataInicio && dataHora < dataInicio) return false
        if (dataFim && dataHora > dataFim) return false
      }
      return true
    })
  }, [interacoes, dataInicio, dataFim, filtroCanal, busca])

  const totalPaginas = Math.max(1, Math.ceil(interacoesFiltradas.length / ITENS_POR_PAGINA))
  const interacoesPaginadas = interacoesFiltradas.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const interacaoSelecionada = useMemo(() => {
    if (!selectedId) return null
    return interacoes?.find(i => i.id === selectedId) ?? null
  }, [selectedId, interacoes])

  useEffect(() => {
    if (selectedId && !interacoesFiltradas.some(i => i.id === selectedId)) {
      setSelectedId(null)
    }
  }, [interacoesFiltradas, selectedId])

  useEffect(() => {
    setPagina(1)
  }, [dataInicio, dataFim, filtroCanal, busca])

  const temFiltro = dataInicio || dataFim || filtroCanal || busca

  function limparFiltros() {
    setDataInicio('')
    setDataFim('')
    setFiltroCanal('')
    setBusca('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interações</h1>
          <p className="text-slate-500 mt-1">{interacoesFiltradas.length} de {(interacoes ?? []).length} interação(ões)</p>
        </div>
        <Link
          to="/interacoes/novo"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Nova Interação
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
          className="w-36 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
        <span className="text-slate-400 text-xs">até</span>
        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
          className="w-36 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
        <select value={filtroCanal} onChange={e => setFiltroCanal(e.target.value)}
          className="w-32 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent">
          <option value="">Todos</option>
          <option value="TELEFONE">Telefone</option>
          <option value="EMAIL">E-mail</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="REUNIAO">Reunião</option>
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
          <InteracaoDetalhes interacao={interacaoSelecionada ?? null} interacoes={interacoes ?? []} />
        </div>

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
              Carregando...
            </div>
          ) : interacoesFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
              {temFiltro ? 'Nenhuma interação encontrada com os filtros atuais' : 'Nenhuma interação registrada'}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {interacoesPaginadas.map(i => (
                    <div
                      key={i.id}
                      onClick={() => setSelectedId(i.id)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        selectedId === i.id
                          ? 'bg-slate-100 border-l-2 border-slate-900'
                          : 'hover:bg-slate-50 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex-1 grid grid-cols-[auto_auto_auto] gap-3 items-center min-w-0">
                        <span className="text-sm text-slate-600 w-24 shrink-0">{formatDataHoraCompacta(i.dataHora)}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${canalBg[i.canal] ?? ''}`}>
                          {i.canal}
                        </span>
                        <span className={`text-sm font-medium ${
                          i.avaliacao >= 4 ? 'text-green-600' :
                          i.avaliacao >= 2 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {i.avaliacao}/5
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 truncate max-w-[140px] shrink-0">{i.clienteNome}</span>
                      {isAdmin && (
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteId(i.id) }}
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
        title="Excluir Interação"
        message="Tem certeza? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
