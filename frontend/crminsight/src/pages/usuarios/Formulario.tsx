import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { criarUsuario } from '../../api/usuarios'
import type { UsuarioFormData, RankVendedor } from '../../types'

const schema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['ADMIN', 'VENDEDOR'] as const),
  nome: z.string().optional(),
  matricula: z.string().optional(),
  dataAdmissao: z.string().optional(),
  metaMensal: z.number().optional(),
  comissaoBase: z.number().optional(),
  rank: z.string().optional(),
})

const ranks: RankVendedor[] = ['OURO', 'PRATA', 'BRONZE', 'TREINAMENTO']

export default function UsuarioFormulario() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'ADMIN',
    },
  })

  const role = watch('role')

  const mutation = useMutation({
    mutationFn: criarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      navigate('/usuarios')
    },
  })

  async function onSubmit(data: UsuarioFormData) {
    if (data.role === 'VENDEDOR') {
      let hasError = false
      if (!data.nome) { setError('nome', { message: 'Nome é obrigatório' }); hasError = true }
      if (!data.matricula) { setError('matricula', { message: 'Matrícula é obrigatória' }); hasError = true }
      if (!data.dataAdmissao) { setError('dataAdmissao', { message: 'Data é obrigatória' }); hasError = true }
      if (!data.metaMensal || data.metaMensal <= 0) { setError('metaMensal', { message: 'Deve ser positivo' }); hasError = true }
      if (data.comissaoBase === undefined || data.comissaoBase < 0) { setError('comissaoBase', { message: 'Deve ser >= 0' }); hasError = true }
      if (!data.rank) { setError('rank', { message: 'Rank é obrigatório' }); hasError = true }
      if (hasError) return
    }
    await mutation.mutateAsync(data)
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
          <select {...register('role')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white">
            <option value="ADMIN">Administrador</option>
            <option value="VENDEDOR">Vendedor</option>
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
        </div>

        {role === 'VENDEDOR' && (
          <>
            <hr className="border-slate-200" />
            <p className="text-sm font-medium text-slate-700">Dados do Vendedor</p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
              <input {...register('nome')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Matrícula</label>
              <input {...register('matricula')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
              {errors.matricula && <p className="text-red-500 text-xs mt-1">{errors.matricula.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de Admissão</label>
              <input type="date" {...register('dataAdmissao')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
              {errors.dataAdmissao && <p className="text-red-500 text-xs mt-1">{errors.dataAdmissao.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meta Mensal (R$)</label>
              <input type="number" step="0.01" {...register('metaMensal', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
              {errors.metaMensal && <p className="text-red-500 text-xs mt-1">{errors.metaMensal.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Comissão Base (R$)</label>
              <input type="number" step="0.01" {...register('comissaoBase', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
              {errors.comissaoBase && <p className="text-red-500 text-xs mt-1">{errors.comissaoBase.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rank</label>
              <select {...register('rank')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white">
                {ranks.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.rank && <p className="text-red-500 text-xs mt-1">{errors.rank.message}</p>}
            </div>
          </>
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
