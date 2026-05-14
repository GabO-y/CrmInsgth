import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { listarVendas, deletarVenda } from '../../api/vendas'
import DataTable from '../../components/ui/DataTable'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import type { Venda } from '../../types'

const statusColors: Record<string, string> = {
  CONCLUIDA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
  EM_ANALISE: 'bg-yellow-100 text-yellow-800',
}

export default function VendasListagem() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)

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
    } finally {
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: 'data',
      header: 'Data',
      render: (v: Venda) => new Date(v.data + 'T00:00:00').toLocaleDateString('pt-BR'),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (v: Venda) => `R$ ${v.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (v: Venda) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[v.status] ?? ''}`}>
          {v.status.replace('_', ' ')}
        </span>
      ),
    },
    { key: 'clienteNome', header: 'Cliente' },
    { key: 'vendedorNome', header: 'Vendedor' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendas</h1>
          <p className="text-slate-500 mt-1">{vendas?.length ?? 0} venda(s) registrada(s)</p>
        </div>
        <Link
          to="/vendas/novo"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Nova Venda
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={vendas ?? []}
        onDelete={isAdmin ? (v) => setDeleteId(v.id) : undefined}
        loading={isLoading}
        emptyMessage="Nenhuma venda registrada"
      />

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
