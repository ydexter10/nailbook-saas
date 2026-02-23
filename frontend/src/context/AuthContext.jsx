import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

// Aplica a cor primária do usuário como CSS variable global
function aplicarTema(usuario) {
    if (usuario?.corPrimaria) {
        document.documentElement.style.setProperty('--color-primary', usuario.corPrimaria)
    } else {
        document.documentElement.style.setProperty('--color-primary', '#f43f5e')
    }
}

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem('nailbook_token'))
    const [loading, setLoading] = useState(true)

    // Ao montar: verificar token salvo
    useEffect(() => {
        const init = async () => {
            const savedToken = localStorage.getItem('nailbook_token')
            if (savedToken) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
                    const { data } = await api.get('/auth/me')
                    setUsuario(data)
                    aplicarTema(data)
                    setToken(savedToken)
                } catch {
                    localStorage.removeItem('nailbook_token')
                    delete api.defaults.headers.common['Authorization']
                    setToken(null)
                    setUsuario(null)
                }
            }
            setLoading(false)
        }
        init()
    }, [])

    const login = async (email, senha) => {
        const { data } = await api.post('/auth/login', { email, senha })
        const { token: novoToken, usuario: novoUsuario } = data
        localStorage.setItem('nailbook_token', novoToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${novoToken}`
        setToken(novoToken)
        setUsuario(novoUsuario)
        aplicarTema(novoUsuario)
        return novoUsuario
    }

    const register = async (nome, nomeSalao, email, senha) => {
        const { data } = await api.post('/auth/register', { nome, nomeSalao, email, senha })
        const { token: novoToken, usuario: novoUsuario } = data
        localStorage.setItem('nailbook_token', novoToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${novoToken}`
        setToken(novoToken)
        setUsuario(novoUsuario)
        aplicarTema(novoUsuario)
        return novoUsuario
    }

    const logout = () => {
        localStorage.removeItem('nailbook_token')
        delete api.defaults.headers.common['Authorization']
        setToken(null)
        setUsuario(null)
        document.documentElement.style.setProperty('--color-primary', '#f43f5e')
    }

    // Atualiza perfil localmente depois de salvar configurações
    const atualizarPerfil = (novosDados) => {
        setUsuario(prev => {
            const atualizado = { ...prev, ...novosDados }
            aplicarTema(atualizado)
            return atualizado
        })
    }

    return (
        <AuthContext.Provider value={{ usuario, token, loading, login, logout, register, atualizarPerfil }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
    return ctx
}
