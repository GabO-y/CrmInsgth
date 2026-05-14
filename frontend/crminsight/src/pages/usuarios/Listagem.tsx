import { useQuery } from '@tanstack/react-query'
import { listarUsuarios } from '../../api/usuarios'
import DataTable from '../../components/ui/DataTable'
import type { Usuario } from '../../types'

export default function UsuariosListagem() {
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
  })

  const columns = [
    { key: 'username', header: 'Username' },
    {
      key: 'role',
      header: 'Role',
      render: (u: Usuario) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {u.role}
        </span>
      ),
    },
    {
      key: 'vendedorId',
      header: 'Vínculo',
      render: (u: Usuario) => u.vendedorId ? 'Vinculado' : '-',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
          <p className="text-slate-500 mt-1">{usuarios?.length ?? 0} usuário(s) cadastrado(s)</p>
        </div>
        <a
          href="/usuarios/novo"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          Novo Usuário
        </a>
      </div>

      <DataTable
        columns={columns}
        data={usuarios ?? []}
        loading={isLoading}
        emptyMessage="Nenhum usuário cadastrado"
      />
    </div>
  )
}
