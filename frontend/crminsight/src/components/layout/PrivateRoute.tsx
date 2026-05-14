import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { RoleUsuario } from '../../types'

interface PrivateRouteProps {
  children: React.ReactNode
  roles?: RoleUsuario[]
}

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { isAuthenticated, usuario } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && usuario && !roles.includes(usuario.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
