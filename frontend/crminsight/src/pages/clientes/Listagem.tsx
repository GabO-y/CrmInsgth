import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Pencil } from 'lucide-react'
import { listarClientes, deletarCliente } from '../../api/clientes'
import DataTable from '../../components/ui/DataTable'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import type { Cliente } from '../../types'

export default function ClientesListagem() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
  })

  const deleteMutation = useMutation({
    mutationFn: deletarCliente,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
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
    { key: 'nome', header: 'Nome' },
    { key: 'segmento', header: 'Segmento' },
    {
      key: 'dataEntrada',
      header: 'Data Entrada',
      render: (c: Cliente) => new Date(c.dataEntrada + 'T00:00:00').toLocaleDateString('pt-BR'),
    },
    {
      key: 'score',
      header: 'Score',
      render: (c: Cliente) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          c.score >= 70 ? 'bg-green-100 text-green-800' :
          c.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {c.score}
        </span>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 mt-1">{clientes?.length ?? 0} cliente(s) cadastrado(s)</p>
        </div>
        {isAdmin && (
          <Link
            to="/clientes/novo"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Novo Cliente
          </Link>
        )}
      </div>

      <DataTable
        columns={[
          ...columns,
          ...(isAdmin ? [{
            key: 'acoes' as const,
            header: '',
            render: (c: Cliente) => (
              <Link
                to={`/clientes/${c.id}/editar`}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Pencil size={16} />
              </Link>
            ),
          }] : []),
        ]}
        data={clientes ?? []}
        onDelete={isAdmin ? (c) => setDeleteId(c.id) : undefined}
        loading={isLoading}
        emptyMessage="Nenhum cliente cadastrado"
      />

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
