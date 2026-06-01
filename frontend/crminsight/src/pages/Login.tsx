import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as apiLogin } from '../api/auth'
import { LogIn, BarChart3 } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await apiLogin(username, password)
      login(response.token, response.usuario)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-3/5 bg-slate-900 flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-12 left-12 w-40 h-40 border border-slate-700 rounded-full opacity-30" />
        <div className="absolute bottom-16 right-16 w-56 h-56 border border-slate-700 rounded-full opacity-20" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-slate-600 rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-slate-600 rounded-full" />

        <BarChart3 size={72} className="text-white mb-6" />
        <h1 className="text-4xl font-bold text-white mb-2">CRM Insight</h1>
        <p className="text-slate-400 text-lg max-w-md text-center">
          Sistema de Gestão de Relacionamento com o Cliente
        </p>
        <p className="text-slate-500 text-sm mt-8 max-w-sm text-center leading-relaxed">
          Gerencie clientes, vendedores, vendas e interações com análises inteligentes para impulsionar seus resultados.
        </p>
        <span className="absolute bottom-8 text-slate-600 text-xs">UERN — TEP</span>
      </div>

      <div className="w-full lg:w-2/5 flex items-center justify-center bg-slate-100 p-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-xl mb-4">
              <LogIn size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Acessar</h2>
            <p className="text-slate-500 mt-1">Faça login para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
