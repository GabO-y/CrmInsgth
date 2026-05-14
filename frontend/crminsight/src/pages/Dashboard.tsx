import { useAuth } from '../context/AuthContext'
import { Users, UserCircle, ShoppingCart, Phone, BarChart3 } from 'lucide-react'

const adminCards = [
  { label: 'Clientes', value: '-', icon: Users, color: 'bg-blue-500' },
  { label: 'Vendedores', value: '-', icon: UserCircle, color: 'bg-emerald-500' },
  { label: 'Vendas', value: '-', icon: ShoppingCart, color: 'bg-violet-500' },
  { label: 'Interações', value: '-', icon: Phone, color: 'bg-amber-500' },
  { label: 'Analítico', value: '6 métricas', icon: BarChart3, color: 'bg-rose-500' },
]

export default function Dashboard() {
  const { usuario } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        Bem-vindo, {usuario?.username}
      </h1>
      <p className="text-slate-500 mb-8">
        {usuario?.role === 'ADMIN' ? 'Visão geral do sistema' : 'Seu painel de vendas'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Navegação Rápida</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuario?.role === 'ADMIN' ? (
            <>
              <QuickLink to="/clientes" label="Gerenciar Clientes" />
              <QuickLink to="/vendedores" label="Gerenciar Vendedores" />
              <QuickLink to="/vendas" label="Registrar Vendas" />
              <QuickLink to="/interacoes" label="Registrar Interações" />
              <QuickLink to="/analitico" label="Ver Analítico" />
              <QuickLink to="/usuarios" label="Gerenciar Usuários" />
            </>
          ) : (
            <>
              <QuickLink to="/clientes" label="Ver Clientes" />
              <QuickLink to="/vendas" label="Minhas Vendas" />
              <QuickLink to="/interacoes" label="Minhas Interações" />
              <QuickLink to="/analitico/meu" label="Meu Desempenho" />
            </>
          )}
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
