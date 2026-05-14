import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Pencil } from 'lucide-react'
import { listarVendedores, deletarVendedor } from '../../api/vendedores'
import DataTable from '../../components/ui/DataTable'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import type { Vendedor } from '../../types'

const rankColors: Record<string, string> = {
  OURO: 'bg-yellow-100 text-yellow-800',
  PRATA: 'bg-gray-100 text-gray-800',
  BRONZE: 'bg-amber-100 text-amber-800',
  TREINAMENTO: 'bg-blue-100 text-blue-800',
}

export default function VendedoresListagem() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: vendedores, isLoading } = useQuery({
    queryKey: ['vendedores'],
    queryFn: listarVendedores,
  })

  const deleteMutation = useMutation({
    mutationFn: deletarVendedor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendedores'] }),
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
    { key: 'matricula', header: 'Matrícula' },
    {
      key: 'dataAdmissao',
      header: 'Admissão',
      render: (v: Vendedor) => new Date(v.dataAdmissao + 'T00:00:00').toLocaleDateString('pt-BR'),
    },
    {
      key: 'metaMensal',
      header: 'Meta Mensal',
      render: (v: Vendedor) => `R$ ${v.metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'rank',
      header: 'Rank',
      render: (v: Vendedor) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rankColors[v.rank] ?? 'bg-gray-100 text-gray-800'}`}>
          {v.rank}
        </span>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendedores</h1>
          <p className="text-slate-500 mt-1">{vendedores?.length ?? 0} vendedor(es) cadastrado(s)</p>
        </div>
        <Link
          to="/vendedores/novo"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Novo Vendedor
        </Link>
      </div>

      <DataTable
        columns={[
          ...columns,
          {
            key: 'acoes' as const,
            header: '',
            render: (v: Vendedor) => (
              <Link
                to={`/vendedores/${v.id}/editar`}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Pencil size={16} />
              </Link>
            ),
          },
        ]}
        data={vendedores ?? []}
        onDelete={(v) => setDeleteId(v.id)}
        loading={isLoading}
        emptyMessage="Nenhum vendedor cadastrado"
      />

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
