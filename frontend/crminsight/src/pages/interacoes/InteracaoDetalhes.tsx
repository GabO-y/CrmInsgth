import { useMemo } from 'react'
import { Phone, Clock, Star, User, BarChart3 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { Interacao } from '../../types'
import ChartCard from '../../components/ui/ChartCard'

const canalColors: Record<string, string> = {
  TELEFONE: '#3b82f6',
  EMAIL: '#a855f7',
  WHATSAPP: '#22c55e',
  REUNIAO: '#f97316',
}

const canalBg: Record<string, string> = {
  TELEFONE: 'bg-blue-100 text-blue-800',
  EMAIL: 'bg-purple-100 text-purple-800',
  WHATSAPP: 'bg-green-100 text-green-800',
  REUNIAO: 'bg-orange-100 text-orange-800',
}

const canalIcon: Record<string, React.ReactNode> = {
  TELEFONE: <Phone size={16} />,
  WHATSAPP: <Phone size={16} />,
  EMAIL: <span className="text-xs">@</span>,
  REUNIAO: <Clock size={16} />,
}

interface Props {
  interacao: Interacao | null
  interacoes: Interacao[]
}

export default function InteracaoDetalhes({ interacao, interacoes }: Props) {
  const canaisVendedorData = useMemo(() => {
    if (!interacao) return []
    const doVendedor = interacoes.filter(i => i.vendedorId === interacao.vendedorId)
    const counts: Record<string, number> = {}
    for (const i of doVendedor) {
      counts[i.canal] = (counts[i.canal] || 0) + 1
    }
    return Object.entries(counts).map(([canal, quantidade]) => ({
      name: canal,
      quantidade,
      color: canalColors[canal] ?? '#94a3b8',
    }))
  }, [interacao, interacoes])

  const statsVendedor = useMemo(() => {
    if (!interacao) return { avaliacaoMedia: '-', tempoMedio: '-' }
    const doVendedor = interacoes.filter(i => i.vendedorId === interacao.vendedorId)
    if (doVendedor.length === 0) return { avaliacaoMedia: '-', tempoMedio: '-' }
    const somaAvaliacao = doVendedor.reduce((s, i) => s + i.avaliacao, 0)
    const somaDuracao = doVendedor.reduce((s, i) => s + i.duracao, 0)
    return {
      avaliacaoMedia: (somaAvaliacao / doVendedor.length).toFixed(1),
      tempoMedio: Math.round(somaDuracao / doVendedor.length) + ' min',
    }
  }, [interacao, interacoes])

  if (!interacao) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
        <BarChart3 size={48} className="mb-4" />
        <p className="text-sm">Selecione uma interação ao lado</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500">Canal</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${canalBg[interacao.canal] ?? ''}`}>
            {canalIcon[interacao.canal]}
            {interacao.canal}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Clock size={14} />
              <span className="text-xs">Duração</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{interacao.duracao} <span className="text-sm font-normal text-slate-500">min</span></p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Star size={14} />
              <span className="text-xs">Avaliação</span>
            </div>
            <p className={`text-2xl font-bold ${
              interacao.avaliacao >= 4 ? 'text-green-600' :
              interacao.avaliacao >= 2 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {interacao.avaliacao}/5
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <User size={16} className="text-slate-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Cliente</p>
            <p className="text-sm font-medium text-slate-900 truncate">{interacao.clienteNome}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <BarChart3 size={16} className="text-slate-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Vendedor</p>
            <p className="text-sm font-medium text-slate-900 truncate">{interacao.vendedorNome}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Avaliação Média</p>
          <p className="text-xl font-bold text-slate-900">{statsVendedor.avaliacaoMedia}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Tempo Médio</p>
          <p className="text-xl font-bold text-slate-900">{statsVendedor.tempoMedio}</p>
        </div>
      </div>

      <ChartCard title="Canais do Vendedor" empty={canaisVendedorData.length === 0} emptyMessage="Nenhuma interação do vendedor">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={canaisVendedorData} layout="vertical" margin={{ left: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={65} />
              <Tooltip />
              <Bar dataKey="quantidade" radius={[0, 4, 4, 0]}>
                {canaisVendedorData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  )
}
