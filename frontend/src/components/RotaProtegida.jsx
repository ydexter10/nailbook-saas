import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Proteção de rotas: redireciona para /login se não autenticado
export function RotaProtegida({ children, apenasAdmin = false }) {
    const { usuario, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rose-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!usuario) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (apenasAdmin && usuario.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

// Redireciona para dashboard se já estiver logado (para /login e /cadastro)
export function RotaPublica({ children }) {
    const { usuario, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rose-50">
                <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (usuario) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}
