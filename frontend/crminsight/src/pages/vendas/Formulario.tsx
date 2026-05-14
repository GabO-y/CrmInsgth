import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { criarVenda } from '../../api/vendas'
import { listarClientes } from '../../api/clientes'
import { listarVendedores } from '../../api/vendedores'
import { useAuth } from '../../context/AuthContext'
import type { VendaFormData, StatusVenda } from '../../types'

const schema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  valor: z.number().positive('Deve ser positivo'),
  status: z.enum(['CONCLUIDA', 'CANCELADA', 'EM_ANALISE'] as const),
  comissaoPaga: z.number().min(0, 'Deve ser >= 0'),
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  vendedorId: z.string().min(1, 'Vendedor é obrigatório'),
})

const statusList: StatusVenda[] = ['CONCLUIDA', 'CANCELADA', 'EM_ANALISE']

export default function VendaFormulario() {
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
  } = useForm<VendaFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vendedorId: isVendedor ? usuario?.vendedorId ?? '' : '',
    },
  })

  const mutation = useMutation({
    mutationFn: criarVenda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] })
      navigate('/vendas')
    },
  })

  async function onSubmit(data: VendaFormData) {
    await mutation.mutateAsync(data)
  }

  return (
    <div className="max-w-lg">
      <button
        onClick={() => navigate('/vendas')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nova Venda</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
          <input type="date" {...register('data')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          {errors.data && <p className="text-red-500 text-xs mt-1">{errors.data.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
          <input type="number" step="0.01" {...register('valor', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          {errors.valor && <p className="text-red-500 text-xs mt-1">{errors.valor.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select {...register('status')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white">
            {statusList.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Comissão Paga (R$)</label>
          <input type="number" step="0.01" {...register('comissaoPaga', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          {errors.comissaoPaga && <p className="text-red-500 text-xs mt-1">{errors.comissaoPaga.message}</p>}
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
            onClick={() => navigate('/vendas')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
