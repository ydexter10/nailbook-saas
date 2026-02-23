import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
    ShieldCheck, Users, ArrowLeft, CheckCircle, XCircle,
    Crown, UserCheck, UserX, DollarSign, MessageSquare
} from 'lucide-react'
import api from '../../api'

// Toggle switch component
function Toggle({ checked, onChange, disabled, color = 'emerald' }) {
    const colors = {
        emerald: checked ? 'bg-emerald-500' : 'bg-gray-200',
        amber: checked ? 'bg-amber-500' : 'bg-gray-200',
        blue: checked ? 'bg-blue-500' : 'bg-gray-200',
    }
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onChange}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${colors[color]}`}
        >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
    )
}

export default function PainelAdmin() {
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [atualizando, setAtualizando] = useState({}) // { [id]: field }

    useEffect(() => { fetchUsuarios() }, [])

    const fetchUsuarios = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/admin/usuarios')
            setUsuarios(data)
        } catch { toast.error('Erro ao carregar usuários') }
        finally { setLoading(false) }
    }

    const handleToggleAtivo = async (id) => {
        setAtualizando(p => ({ ...p, [id]: 'ativo' }))
        try {
            const { data } = await api.patch(`/admin/usuarios/${id}/toggle-ativo`)
            setUsuarios(prev => prev.map(u => u.id === id ? data : u))
            toast.success(`${data.nome} foi ${data.ativo ? 'ativado' : 'desativado'}!`)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erro ao atualizar')
        } finally { setAtualizando(p => { const n = { ...p }; delete n[id]; return n }) }
    }

    const handleToggleModulo = async (id, campo, valorAtual) => {
        setAtualizando(p => ({ ...p, [`${id}_${campo}`]: true }))
        try {
            const { data } = await api.patch(`/admin/usuarios/${id}/modulos`, { [campo]: !valorAtual })
            setUsuarios(prev => prev.map(u => u.id === id ? data : u))
            const nomeModulo = campo === 'moduloFinanceiroAtivo' ? '💰 Financeiro' : '📲 WhatsApp'
            toast.success(`${nomeModulo} ${!valorAtual ? 'ativado' : 'desativado'} para ${data.nome}`)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erro ao atualizar módulo')
        } finally { setAtualizando(p => { const n = { ...p }; delete n[`${id}_${campo}`]; return n }) }
    }

    const admins = usuarios.filter(u => u.role === 'ADMIN').length
    const ativos = usuarios.filter(u => u.ativo).length
    const comFinanceiro = usuarios.filter(u => u.moduloFinanceiroAtivo).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-400 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
                        <p className="text-sm text-gray-500">Gerenciamento de usuários, acessos e módulos</p>
                    </div>
                </div>
                <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-600 transition">
                    <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total de Usuários', value: usuarios.length, color: 'text-gray-900' },
                    { label: 'Contas Ativas', value: ativos, color: 'text-emerald-600' },
                    { label: 'Admins', value: admins, color: 'text-violet-600' },
                    { label: 'Módulo Financeiro', value: comFinanceiro, color: 'text-amber-600' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-500" />
                    <h2 className="font-semibold text-gray-900">Usuários Cadastrados</h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {['Usuário', 'E-mail', 'Plano', 'Agend.', 'Clientes',
                                        '💰 Financeiro', '📲 WhatsApp', 'Status', 'Acesso'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {usuarios.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {u.role === 'ADMIN' && <Crown className="w-4 h-4 text-violet-500 flex-shrink-0" />}
                                                <span className="font-medium text-gray-900 whitespace-nowrap">{u.nome}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${u.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>
                                                {u.role === 'ADMIN' ? '👑 Admin' : '💅 Manicure'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-center">{u._count?.agendamentos ?? 0}</td>
                                        <td className="px-4 py-3 text-gray-600 text-center">{u._count?.clientes ?? 0}</td>

                                        {/* Toggle Financeiro */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Toggle
                                                    checked={u.moduloFinanceiroAtivo}
                                                    disabled={!!atualizando[`${u.id}_moduloFinanceiroAtivo`]}
                                                    onChange={() => handleToggleModulo(u.id, 'moduloFinanceiroAtivo', u.moduloFinanceiroAtivo)}
                                                    color="amber"
                                                />
                                                <span className={`text-xs font-medium ${u.moduloFinanceiroAtivo ? 'text-amber-600' : 'text-gray-400'}`}>
                                                    {u.moduloFinanceiroAtivo ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Toggle WhatsApp */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Toggle
                                                    checked={u.moduloWhatsappAtivo}
                                                    disabled={!!atualizando[`${u.id}_moduloWhatsappAtivo`]}
                                                    onChange={() => handleToggleModulo(u.id, 'moduloWhatsappAtivo', u.moduloWhatsappAtivo)}
                                                    color="blue"
                                                />
                                                <span className={`text-xs font-medium ${u.moduloWhatsappAtivo ? 'text-blue-600' : 'text-gray-400'}`}>
                                                    {u.moduloWhatsappAtivo ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            {u.ativo ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                                    <CheckCircle className="w-3 h-3" /> Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
                                                    <XCircle className="w-3 h-3" /> Inativo
                                                </span>
                                            )}
                                        </td>

                                        {/* Ação de ativar/desativar conta */}
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleToggleAtivo(u.id)}
                                                disabled={!!atualizando[u.id]}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 whitespace-nowrap ${u.ativo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                            >
                                                {atualizando[u.id] ? (
                                                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                                ) : u.ativo ? <><UserX className="w-3 h-3" /> Desativar</> : <><UserCheck className="w-3 h-3" /> Ativar</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
