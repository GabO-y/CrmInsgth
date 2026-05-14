import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { criarCliente, atualizarCliente, buscarCliente } from '../../api/clientes'
import type { ClienteFormData } from '../../types'

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  segmento: z.string().min(1, 'Segmento é obrigatório'),
})

export default function ClienteFormulario() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: cliente } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => buscarCliente(id!),
    enabled: isEditing,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(schema),
    values: isEditing && cliente ? { nome: cliente.nome, segmento: cliente.segmento } : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: ClienteFormData) =>
      isEditing ? atualizarCliente(id!, data) : criarCliente(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      navigate('/clientes')
    },
  })

  async function onSubmit(data: ClienteFormData) {
    await mutation.mutateAsync(data)
  }

  return (
    <div className="max-w-lg">
      <button
        onClick={() => navigate('/clientes')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
          <input
            {...register('nome')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Segmento</label>
          <input
            {...register('segmento')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          {errors.segmento && <p className="text-red-500 text-xs mt-1">{errors.segmento.message}</p>}
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
            onClick={() => navigate('/clientes')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
