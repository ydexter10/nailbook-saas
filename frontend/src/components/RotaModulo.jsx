import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Guarda de rota por módulo.
 * Se o usuário não tiver o módulo ativo, redireciona para /upgrade.
 * modulo: 'financeiro' | 'whatsapp'
 */
export default function RotaModulo({ children, modulo }) {
    const { usuario, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const temAcesso =
        modulo === 'financeiro' ? usuario?.moduloFinanceiroAtivo :
            modulo === 'whatsapp' ? usuario?.moduloWhatsappAtivo : false

    if (!temAcesso) {
        return <Navigate to="/upgrade" state={{ modulo }} replace />
    }

    return children
}
