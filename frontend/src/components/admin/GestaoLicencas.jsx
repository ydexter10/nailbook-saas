import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
    Building2, UserPlus, X, CheckCircle, XCircle, Crown, Eye, EyeOff
} from 'lucide-react'
import api from '../../api'

// Reutiliza o Toggle do PainelAdmin
function Toggle({ checked, onChange, disabled, color = 'emerald' }) {
    const colors = { emerald: checked ? 'bg-emerald-500' : 'bg-gray-200', amber: checked ? 'bg-amber-500' : 'bg-gray-200', blue: checked ? 'bg-blue-500' : 'bg-gray-200' }
    return (
        <button type="button" disabled={disabled} onClick={onChange}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${colors[color]}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
    )
}

const MODULOS = [
    { campo: 'moduloAgendaAtivo', label: 'Agenda', color: 'emerald', emoji: '📅' },
    { campo: 'moduloFinanceiroAtivo', label: 'Financeiro', color: 'amber', emoji: '💰' },
    { campo: 'moduloWhatsappAtivo', label: 'WhatsApp', color: 'blue', emoji: '📲' },
]

const CAMPOS_USUARIO = {
    id: true, nome: true, nomeSalao: true, email: true, role: true,
    ativo: true, whatsappDono: true,
    moduloAgendaAtivo: true, moduloFinanceiroAtivo: true, moduloWhatsappAtivo: true,
    _count: { select: { clientes: true, agendamentos: true } },
}

export default function GestaoLicencas() {
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [atualizando, setAtualizando] = useState({})
    const [showSenha, setShowSenha] = useState(false)
    const [form, setForm] = useState({ nome: '', nomeSalao: '', email: '', whatsappDono: '', senha: '' })

    useEffect(() => { fetchUsuarios() }, [])

    const fetchUsuarios = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/admin/usuarios')
            // Mostrar apenas clientes USER, admins no painel separado
            setUsuarios(data)
        } catch { toast.error('Erro ao carregar clientes') }
        finally { setLoading(false) }
    }

    const handleCadastrar = async (e) => {
        e.preventDefault()
        if (!form.nome || !form.email || !form.senha) {
            toast.error('Nome, e-mail e senha são obrigatórios'); return
        }
        setSalvando(true)
        try {
            const { data } = await api.post('/admin/usuarios', form)
            setUsuarios(prev => [data, ...prev])
            toast.success(`✅ ${data.nomeSalao || data.nome} cadastrado com sucesso!`)
            setShowForm(false)
            setForm({ nome: '', nomeSalao: '', email: '', whatsappDono: '', senha: '' })
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erro ao cadastrar')
        } finally { setSalvando(false) }
    }

    const handleToggleAtivo = async (id) => {
        setAtualizando(p => ({ ...p, [`${id}_ativo`]: true }))
        try {
            const { data } = await api.patch(`/admin/usuarios/${id}/toggle-ativo`)
            setUsuarios(prev => prev.map(u => u.id === id ? data : u))
            toast.success(`${data.nome} ${data.ativo ? 'ativado' : 'desativado'}`)
        } catch (err) { toast.error(err.response?.data?.error || 'Erro') }
        finally { setAtualizando(p => { const n = { ...p }; delete n[`${id}_ativo`]; return n }) }
    }

    const handleToggleModulo = async (id, campo, valorAtual) => {
        const key = `${id}_${campo}`
        setAtualizando(p => ({ ...p, [key]: true }))
        try {
            const { data } = await api.patch(`/admin/usuarios/${id}/modulos`, { [campo]: !valorAtual })
            setUsuarios(prev => prev.map(u => u.id === id ? data : u))
            const m = MODULOS.find(m => m.campo === campo)
            toast.success(`${m?.emoji} ${m?.label} ${!valorAtual ? 'ativado' : 'desativado'} para ${data.nome}`)
        } catch (err) { toast.error(err.response?.data?.error || 'Erro') }
        finally { setAtualizando(p => { const n = { ...p }; delete n[key]; return n }) }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestão de Licenças</h1>
                        <p className="text-sm text-gray-500">Cadastro e controle de módulos por cliente</p>
                    </div>
                </div>
                <button onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl text-sm font-medium shadow-sm hover:from-violet-600 hover:to-purple-600 transition">
                    {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {showForm ? 'Cancelar' : 'Novo Cliente'}
                </button>
            </div>

            {/* Formulário de cadastro */}
            {showForm && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-900 mb-5">Cadastrar Novo Salão</h2>
                    <form onSubmit={handleCadastrar} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { name: 'nome', label: 'Nome do Proprietário', placeholder: 'Ana Paula Silva', required: true },
                            { name: 'nomeSalao', label: 'Nome do Salão', placeholder: 'Studio Ana Paula', required: false },
                            { name: 'email', label: 'E-mail de Acesso', placeholder: 'ana@salao.com', required: true, type: 'email' },
                            { name: 'whatsappDono', label: 'WhatsApp', placeholder: '(11) 99999-9999', required: false },
                        ].map(f => (
                            <div key={f.name}>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                                <input name={f.name} type={f.type || 'text'} value={form[f.name]}
                                    onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                    placeholder={f.placeholder} required={f.required}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition" />
                            </div>
                        ))}

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Senha Inicial</label>
                            <div className="relative">
                                <input name="senha" type={showSenha ? 'text' : 'password'} value={form.senha}
                                    onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
                                    placeholder="Mínimo 6 caracteres" required
                                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition" />
                                <button type="button" onClick={() => setShowSenha(!showSenha)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <button type="submit" disabled={salvando}
                                className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:from-violet-600 hover:to-purple-600 transition disabled:opacity-60 flex items-center justify-center gap-2">
                                {salvando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                Cadastrar Cliente
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Clientes', value: usuarios.filter(u => u.role === 'USER').length, color: 'text-gray-900' },
                    { label: 'Contas Ativas', value: usuarios.filter(u => u.ativo).length, color: 'text-emerald-600' },
                    { label: '💰 Financeiro', value: usuarios.filter(u => u.moduloFinanceiroAtivo).length, color: 'text-amber-600' },
                    { label: '📲 WhatsApp', value: usuarios.filter(u => u.moduloWhatsappAtivo).length, color: 'text-blue-600' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabela de clientes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Clientes Cadastrados</h2>
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
                                    {['Proprietário', 'Salão / E-mail', 'Agend.', 'Clientes',
                                        ...MODULOS.map(m => `${m.emoji} ${m.label}`),
                                        'Status', 'Acesso'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {usuarios.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                {u.role === 'ADMIN' && <Crown className="w-3.5 h-3.5 text-violet-500" />}
                                                <span className="font-medium text-gray-900 whitespace-nowrap">{u.nome}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-900 font-medium text-xs">{u.nomeSalao || '—'}</p>
                                            <p className="text-gray-400 text-xs">{u.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-center">{u._count?.agendamentos ?? 0}</td>
                                        <td className="px-4 py-3 text-gray-600 text-center">{u._count?.clientes ?? 0}</td>

                                        {/* Toggles de módulos */}
                                        {MODULOS.map(m => (
                                            <td key={m.campo} className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Toggle
                                                        checked={!!u[m.campo]}
                                                        disabled={!!atualizando[`${u.id}_${m.campo}`]}
                                                        onChange={() => handleToggleModulo(u.id, m.campo, u[m.campo])}
                                                        color={m.color}
                                                    />
                                                    <span className={`text-xs font-medium ${u[m.campo] ? 'text-gray-600' : 'text-gray-300'}`}>
                                                        {u[m.campo] ? 'On' : 'Off'}
                                                    </span>
                                                </div>
                                            </td>
                                        ))}

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            {u.ativo ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                                    <CheckCircle className="w-3 h-3" /> Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                                                    <XCircle className="w-3 h-3" /> Inativo
                                                </span>
                                            )}
                                        </td>

                                        {/* Toggle ativo/inativo */}
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleToggleAtivo(u.id)}
                                                disabled={!!atualizando[`${u.id}_ativo`]}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium transition disabled:opacity-50 ${u.ativo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                                                {u.ativo ? 'Desativar' : 'Ativar'}
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
