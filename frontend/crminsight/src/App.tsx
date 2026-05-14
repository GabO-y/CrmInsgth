import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/layout/PrivateRoute'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ClientesListagem from './pages/clientes/Listagem'
import ClienteFormulario from './pages/clientes/Formulario'
import VendedoresListagem from './pages/vendedores/Listagem'
import VendedorFormulario from './pages/vendedores/Formulario'
import VendasListagem from './pages/vendas/Listagem'
import VendaFormulario from './pages/vendas/Formulario'
import InteracoesListagem from './pages/interacoes/Listagem'
import InteracaoFormulario from './pages/interacoes/Formulario'
import AdminDashboard from './pages/analitico/AdminDashboard'
import MeuDesempenho from './pages/analitico/MeuDesempenho'
import UsuariosListagem from './pages/usuarios/Listagem'
import UsuarioFormulario from './pages/usuarios/Formulario'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clientes" element={<ClientesListagem />} />
              <Route path="/clientes/novo" element={<ClienteFormulario />} />
              <Route path="/clientes/:id/editar" element={<ClienteFormulario />} />
              <Route path="/vendedores" element={<VendedoresListagem />} />
              <Route path="/vendedores/novo" element={<VendedorFormulario />} />
              <Route path="/vendedores/:id/editar" element={<VendedorFormulario />} />
              <Route path="/vendas" element={<VendasListagem />} />
              <Route path="/vendas/novo" element={<VendaFormulario />} />
              <Route path="/interacoes" element={<InteracoesListagem />} />
              <Route path="/interacoes/novo" element={<InteracaoFormulario />} />

              <Route
                path="/analitico"
                element={
                  <PrivateRoute roles={['ADMIN']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/analitico/meu"
                element={
                  <PrivateRoute roles={['VENDEDOR']}>
                    <MeuDesempenho />
                  </PrivateRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <PrivateRoute roles={['ADMIN']}>
                    <UsuariosListagem />
                  </PrivateRoute>
                }
              />
              <Route
                path="/usuarios/novo"
                element={
                  <PrivateRoute roles={['ADMIN']}>
                    <UsuarioFormulario />
                  </PrivateRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
