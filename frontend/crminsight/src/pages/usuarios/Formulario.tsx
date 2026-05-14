import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { criarUsuario } from '../../api/usuarios'
import { listarVendedores } from '../../api/vendedores'
import type { UsuarioFormData, RoleUsuario } from '../../types'

const schema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['ADMIN', 'VENDEDOR'] as const),
  vendedorId: z.string().nullable(),
})

const roles: RoleUsuario[] = ['ADMIN', 'VENDEDOR']

export default function UsuarioFormulario() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: vendedores } = useQuery({
    queryKey: ['vendedores'],
    queryFn: listarVendedores,
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'VENDEDOR',
      vendedorId: null,
    },
  })

  const roleWatcher = watch('role')

  const mutation = useMutation({
    mutationFn: criarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      navigate('/usuarios')
    },
  })

  async function onSubmit(data: UsuarioFormData) {
    await mutation.mutateAsync({
      ...data,
      vendedorId: data.role === 'VENDEDOR' ? data.vendedorId : null,
    })
  }

  return (
    <div className="max-w-lg">
      <button
        onClick={() => navigate('/usuarios')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Novo Usuário</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input {...register('username')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
          <input type="password" {...register('password')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <select {...register('role')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white">
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
        </div>

        {roleWatcher === 'VENDEDOR' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vendedor Vinculado</label>
            <select
              {...register('vendedorId')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
            >
              <option value="">Selecione...</option>
              {vendedores?.map((v) => <option key={v.id} value={v.id}>{v.nome} - {v.matricula}</option>)}
            </select>
            {errors.vendedorId && <p className="text-red-500 text-xs mt-1">{errors.vendedorId.message}</p>}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Save size={16} />
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
