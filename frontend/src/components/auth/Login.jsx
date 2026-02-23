import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, Sparkles, Eye, EyeOff } from 'lucide-react'

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({ email: '', senha: '' })
    const [loading, setLoading] = useState(false)
    const [showSenha, setShowSenha] = useState(false)

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.email || !form.senha) { toast.error('Preencha todos os campos'); return }
        setLoading(true)
        try {
            const usuario = await login(form.email, form.senha)
            toast.success(`Bem-vinda, ${usuario.nome}! 🌸`)
            navigate('/dashboard')
        } catch (err) {
            const msg = err.response?.data?.error || 'Erro ao fazer login'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-400 rounded-2xl shadow-lg mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">
                        NailBook
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Sistema de Agendamento para Manicures</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-rose-100 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Entrar na sua conta</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email" name="email" value={form.email} onChange={handleChange}
                                    placeholder="seu@email.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                                    required autoFocus
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showSenha ? 'text' : 'password'} name="senha" value={form.senha} onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                                    required
                                />
                                <button type="button" onClick={() => setShowSenha(!showSenha)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold text-sm shadow-sm hover:from-rose-600 hover:to-pink-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Entrando...</> : 'Entrar'}
                        </button>
                    </form>

                    {/* Dica de acesso a usuário de teste */}
                    <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100">
                        <p className="text-xs text-gray-500 font-medium mb-1">Acesso de demonstração:</p>
                        <p className="text-xs text-gray-600">💅 <span className="font-mono">ana@nailbook.com</span> / <span className="font-mono">manicure123</span></p>
                        <p className="text-xs text-gray-600">👑 <span className="font-mono">admin@nailbook.com</span> / <span className="font-mono">admin123</span></p>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Não tem conta?{' '}
                        <Link to="/cadastro" className="text-rose-600 font-medium hover:text-rose-700 transition">
                            Cadastre-se grátis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
