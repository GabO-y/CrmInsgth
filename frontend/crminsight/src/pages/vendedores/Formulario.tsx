import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { criarVendedor, atualizarVendedor, buscarVendedor } from '../../api/vendedores'
import type { VendedorFormData, RankVendedor } from '../../types'

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  dataAdmissao: z.string().min(1, 'Data é obrigatória'),
  metaMensal: z.number().positive('Deve ser positivo'),
  comissaoBase: z.number().min(0, 'Deve ser >= 0'),
  rank: z.enum(['OURO', 'PRATA', 'BRONZE', 'TREINAMENTO'] as const),
})

const ranks: RankVendedor[] = ['OURO', 'PRATA', 'BRONZE', 'TREINAMENTO']

export default function VendedorFormulario() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: vendedor } = useQuery({
    queryKey: ['vendedor', id],
    queryFn: () => buscarVendedor(id!),
    enabled: isEditing,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VendedorFormData>({
    resolver: zodResolver(schema),
    values: isEditing && vendedor ? {
      nome: vendedor.nome,
      matricula: vendedor.matricula,
      dataAdmissao: vendedor.dataAdmissao,
      metaMensal: vendedor.metaMensal,
      comissaoBase: vendedor.comissaoBase,
      rank: vendedor.rank,
    } : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: VendedorFormData) =>
      isEditing ? atualizarVendedor(id!, data) : criarVendedor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores'] })
      navigate('/vendedores')
    },
  })

  async function onSubmit(data: VendedorFormData) {
    await mutation.mutateAsync(data)
  }

  return (
    <div className="max-w-lg">
      <button
        onClick={() => navigate('/vendedores')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {isEditing ? 'Editar Vendedor' : 'Novo Vendedor'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
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
            onClick={() => navigate('/vendedores')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
