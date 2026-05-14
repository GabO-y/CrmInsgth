import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { listarInteracoes, deletarInteracao } from '../../api/interacoes'
import DataTable from '../../components/ui/DataTable'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import type { Interacao } from '../../types'

const canalColors: Record<string, string> = {
  TELEFONE: 'bg-blue-100 text-blue-800',
  EMAIL: 'bg-purple-100 text-purple-800',
  WHATSAPP: 'bg-green-100 text-green-800',
  REUNIAO: 'bg-orange-100 text-orange-800',
}

export default function InteracoesListagem() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)

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
    } finally {
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: 'dataHora',
      header: 'Data/Hora',
      render: (i: Interacao) => new Date(i.dataHora).toLocaleString('pt-BR'),
    },
    {
      key: 'canal',
      header: 'Canal',
      render: (i: Interacao) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${canalColors[i.canal] ?? ''}`}>
          {i.canal}
        </span>
      ),
    },
    {
      key: 'duracao',
      header: 'Duração',
      render: (i: Interacao) => `${i.duracao} min`,
    },
    {
      key: 'avaliacao',
      header: 'Avaliação',
      render: (i: Interacao) => (
        <span className={`font-medium ${
          i.avaliacao >= 4 ? 'text-green-600' : i.avaliacao >= 2 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {i.avaliacao}/5
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
          <h1 className="text-2xl font-bold text-slate-900">Interações</h1>
          <p className="text-slate-500 mt-1">{interacoes?.length ?? 0} interação(ões) registrada(s)</p>
        </div>
        <Link
          to="/interacoes/novo"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Nova Interação
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={interacoes ?? []}
        onDelete={isAdmin ? (i) => setDeleteId(i.id) : undefined}
        loading={isLoading}
        emptyMessage="Nenhuma interação registrada"
      />

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
