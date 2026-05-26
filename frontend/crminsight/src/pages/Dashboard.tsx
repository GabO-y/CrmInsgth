import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import {
  Users, UserCircle, ShoppingCart, Phone, BarChart3,
  DollarSign, TrendingUp, Award, Target, CheckCircle,
} from 'lucide-react'
import { listarVendas } from '../api/vendas'
import { meuPerformanceMeta } from '../api/analitico'
import { resumoGeral } from '../api/resumo'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { Venda, ResumoGeral } from '../types'

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

function formatDateTime(dt: string): string {
  return new Date(dt).toLocaleString('pt-BR')
}

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function getLast6Months(): { key: string; label: string }[] {
  const result = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    result.push({ key, label: `${monthNames[d.getMonth()]}/${d.getFullYear()}` })
  }
  return result
}

const statusColors: Record<string, string> = {
  CONCLUIDA: '#22c55e',
  CANCELADA: '#ef4444',
  EM_ANALISE: '#eab308',
}

const statusLabel: Record<string, string> = {
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  EM_ANALISE: 'Em Análise',
}

export default function Dashboard() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'ADMIN'

  if (isAdmin) {
    return <AdminDashboard usuario={usuario} />
  }

  return <VendedorDashboard usuario={usuario} />
}

function AdminDashboard({ usuario }: { usuario: { username: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ['resumo-geral'],
    queryFn: resumoGeral,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Carregando dashboard...
      </div>
    )
  }

  if (!data) return null

  const chartData = (data.vendasPorMes ?? []).map((v) => ({
    name: (() => {
      const [ano, mes] = v.mes.split('-')
      return `${monthNames[parseInt(mes) - 1]}/${ano}`
    })(),
    valor: v.valor,
  }))

  const vendasStatusData = Object.entries(data.vendasPorStatus ?? {}).map(([key, value]) => ({
    name: statusLabel[key] ?? key,
    value,
    color: statusColors[key] ?? '#94a3b8',
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
      <p className="text-slate-500 mb-8">Visão geral do sistema</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <DashboardCard icon={Users} color="bg-blue-500" label="Clientes" value={data.totalClientes} />
        <DashboardCard icon={UserCircle} color="bg-emerald-500" label="Vendedores" value={data.totalVendedores} />
        <DashboardCard icon={BarChart3} color="bg-violet-500" label="Faturamento Total" value={formatCurrency(data.faturamentoTotal)} />
        <DashboardCard icon={DollarSign} color="bg-amber-500" label="Faturamento do Mês" value={formatCurrency(data.faturamentoMes)} />
        <DashboardCard icon={ShoppingCart} color="bg-cyan-500" label="Vendas" value={data.totalVendas} />
        <DashboardCard icon={Phone} color="bg-rose-500" label="Interações" value={data.totalInteracoes} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Vendas por Mês</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Faturamento']} />
                <Bar dataKey="valor" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Vendas por Vendedor</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topVendedores ?? []} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="nome" tick={{ fontSize: 12 }} width={90} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Total']} />
                <Bar dataKey="total" fill="#0f172a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Últimas Vendas</h2>
          <div className="space-y-3">
            {data.ultimasVendas?.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{v.clienteNome}</p>
                  <p className="text-xs text-slate-500">{formatDate(v.data)} &middot; {v.vendedorNome}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(v.valor)}</p>
                  <span className={`inline-block text-xs font-medium ${
                    v.status === 'CONCLUIDA' ? 'text-green-600' :
                    v.status === 'CANCELADA' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {statusLabel[v.status] ?? v.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Status das Vendas</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vendasStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {vendasStatusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Últimas Interações</h2>
          <div className="space-y-3">
            {data.ultimasInteracoes?.map((i) => (
              <div key={i.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{i.clienteNome}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(i.dataHora)}</p>
                </div>
                <div className="text-right ml-4">
                  <span className="inline-block text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {i.canal}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">{i.duracao} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardCard({ icon: Icon, color, label, value }: { icon: React.ComponentType<{ size?: number }>; color: string; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`${color} p-2.5 rounded-lg shrink-0`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 truncate">{label}</p>
          <p className="text-lg font-bold text-slate-900 truncate">{value}</p>
        </div>
      </div>
    </div>
  )
}

function VendedorDashboard({ usuario }: { usuario: { username: string } }) {
  const { data: vendas, isLoading } = useQuery({
    queryKey: ['vendas'],
    queryFn: listarVendas,
  })

  const { data: perfMeta } = useQuery({
    queryKey: ['meu-analitico', 'performance-meta'],
    queryFn: meuPerformanceMeta,
  })

  const hoje = new Date()
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

  const vendasConcluidas = (vendas ?? []).filter((v: Venda) => v.status === 'CONCLUIDA')
  const totalVendido = vendasConcluidas.reduce((s, v) => s + v.valor, 0)
  const totalVendasConcluidas = vendasConcluidas.length
  const faturamentoMes = vendasConcluidas
    .filter((v: Venda) => v.data.startsWith(mesAtual))
    .reduce((s, v) => s + v.valor, 0)
  const comissaoTotal = vendasConcluidas.reduce((s, v) => s + v.comissaoPaga, 0)
  const ticketMedio = totalVendasConcluidas > 0 ? totalVendido / totalVendasConcluidas : 0

  const meses = getLast6Months()
  const chartData = meses.map(({ key, label }) => ({
    name: label,
    valor: vendasConcluidas
      .filter((v: Venda) => v.data.startsWith(key))
      .reduce((s, v) => s + v.valor, 0),
  }))

  const perfValue = perfMeta && perfMeta.valor > 0 ? perfMeta.valor : null
  const perfLabel = perfValue !== null ? `${perfValue.toFixed(1)}%` : 'Sem dados'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Carregando dados financeiros...
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Meu Painel Financeiro</h1>
      <p className="text-slate-500 mb-8">{usuario?.username}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <VendedorCard icon={DollarSign} color="bg-emerald-500" label="Faturamento do Mês" value={formatCurrency(faturamentoMes)} />
        <VendedorCard icon={TrendingUp} color="bg-blue-500" label="Total Vendido" value={formatCurrency(totalVendido)} />
        <VendedorCard icon={Award} color="bg-violet-500" label="Comissão Recebida" value={formatCurrency(comissaoTotal)} />
        <VendedorCard icon={Target} color="bg-amber-500" label="Ticket Médio" value={formatCurrency(ticketMedio)} />
        <VendedorCard icon={CheckCircle} color="bg-cyan-500" label="Vendas Concluídas" value={totalVendasConcluidas} />
        <VendedorCard icon={BarChart3} color="bg-rose-500" label="Performance / Meta" value={perfLabel} highlight={perfValue !== null && perfValue >= 100} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Vendas por Mês</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Faturamento']} />
              <Bar dataKey="valor" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Navegação Rápida</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink to="/vendas" label="Minhas Vendas" />
          <QuickLink to="/interacoes" label="Minhas Interações" />
          <QuickLink to="/analitico/meu" label="Meu Desempenho" />
        </div>
      </div>
    </div>
  )
}

function VendedorCard({ icon: Icon, color, label, value, highlight }: { icon: React.ComponentType<{ size?: number }>; color: string; label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={`text-2xl font-bold ${highlight ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <a
      href={to}
      className="block px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 font-medium transition-colors border border-slate-200"
    >
      {label}
    </a>
  )
}
