import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { criarInteracao } from '../../api/interacoes'
import { listarClientes } from '../../api/clientes'
import { listarVendedores } from '../../api/vendedores'
import { useAuth } from '../../context/AuthContext'
import type { InteracaoFormData, CanalInteracao } from '../../types'

const schema = z.object({
  dataHora: z.string().min(1, 'Data/hora é obrigatória'),
  canal: z.enum(['TELEFONE', 'EMAIL', 'WHATSAPP', 'REUNIAO'] as const),
  duracao: z.number().min(0, 'Deve ser >= 0'),
  avaliacao: z.number().min(1, 'Mínimo 1').max(5, 'Máximo 5'),
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  vendedorId: z.string().min(1, 'Vendedor é obrigatório'),
})

const canais: CanalInteracao[] = ['TELEFONE', 'EMAIL', 'WHATSAPP', 'REUNIAO']

export default function InteracaoFormulario() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { usuario } = useAuth()
  const isVendedor = usuario?.role === 'VENDEDOR'

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
  })

  const { data: vendedores } = useQuery({
    queryKey: ['vendedores'],
    queryFn: listarVendedores,
    enabled: !isVendedor,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InteracaoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vendedorId: isVendedor ? usuario?.vendedorId ?? '' : '',
      avaliacao: 3,
    },
  })

  const mutation = useMutation({
    mutationFn: criarInteracao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interacoes'] })
      navigate('/interacoes')
    },
  })

  async function onSubmit(data: InteracaoFormData) {
    await mutation.mutateAsync(data)
  }

  return (
    <div className="max-w-lg">
      <button
        onClick={() => navigate('/interacoes')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nova Interação</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data/Hora</label>
          <input type="datetime-local" {...register('dataHora')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          {errors.dataHora && <p className="text-red-500 text-xs mt-1">{errors.dataHora.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Canal</label>
          <select {...register('canal')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white">
            {canais.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.canal && <p className="text-red-500 text-xs mt-1">{errors.canal.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Duração (minutos)</label>
          <input type="number" {...register('duracao', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          {errors.duracao && <p className="text-red-500 text-xs mt-1">{errors.duracao.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Avaliação (1-5)</label>
          <input type="number" min={1} max={5} {...register('avaliacao', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          {errors.avaliacao && <p className="text-red-500 text-xs mt-1">{errors.avaliacao.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
          <select {...register('clienteId')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white">
            <option value="">Selecione...</option>
            {clientes?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          {errors.clienteId && <p className="text-red-500 text-xs mt-1">{errors.clienteId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Vendedor</label>
          {isVendedor ? (
            <input
              type="text"
              value={usuario?.username ?? ''}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
            />
          ) : (
            <select {...register('vendedorId')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white">
              <option value="">Selecione...</option>
              {vendedores?.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
            </select>
          )}
          {errors.vendedorId && <p className="text-red-500 text-xs mt-1">{errors.vendedorId.message}</p>}
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
            onClick={() => navigate('/interacoes')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
