import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCircle,
  ShoppingCart,
  Phone,
  BarChart3,
  Shield,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/vendedores', label: 'Vendedores', icon: UserCircle },
  { to: '/vendas', label: 'Vendas', icon: ShoppingCart },
  { to: '/interacoes', label: 'Interações', icon: Phone },
  { to: '/analitico', label: 'Analítico', icon: BarChart3 },
  { to: '/usuarios', label: 'Usuários', icon: Shield },
]

const vendedorLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/vendas', label: 'Vendas', icon: ShoppingCart },
  { to: '/interacoes', label: 'Interações', icon: Phone },
  { to: '/analitico/meu', label: 'Meu Desempenho', icon: BarChart3 },
]

export default function Sidebar() {
  const { usuario, logout } = useAuth()
  const location = useLocation()
  const links = usuario?.role === 'ADMIN' ? adminLinks : vendedorLinks

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-tight">CRM Insight</h1>
        <p className="text-sm text-slate-400 mt-1 capitalize">{usuario?.role.toLowerCase()}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/')
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white w-full transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
