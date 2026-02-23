import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
    TrendingUp, TrendingDown, Wallet, Plus, Trash2, ArrowLeft,
    Receipt, ShoppingCart, Calendar, Filter, X, ChevronDown
} from 'lucide-react'
import api from '../../api'

const CATEGORIAS_RECEITA = ['Serviço', 'Gorjeta', 'Produto', 'Outros']
const CATEGORIAS_DESPESA = ['Produto/Insumo', 'Aluguel', 'Energia', 'Fornecedor', 'Marketing', 'Outros']

function formatBRL(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getMesAtual() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function ContaCorrente() {
    const [resumo, setResumo] = useState(null)
    const [transacoes, setTransacoes] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [filtroTipo, setFiltroTipo] = useState('')
    const [filtroMes, setFiltroMes] = useState(getMesAtual())
    const [salvando, setSalvando] = useState(false)
    const [form, setForm] = useState({
        tipo: 'RECEITA', descricao: '', valor: '', data: new Date().toISOString().split('T')[0], categoria: 'Serviço',
    })

    useEffect(() => { fetchTudo() }, [filtroTipo, filtroMes])

    const fetchTudo = async () => {
        setLoading(true)
        try {
            const [r, t] = await Promise.all([
                api.get('/financeiro/resumo'),
                api.get('/financeiro/transacoes', { params: { tipo: filtroTipo || undefined, mes: filtroMes || undefined } }),
            ])
            setResumo(r.data)
            setTransacoes(t.data)
        } catch (err) {
            if (err.response?.status === 403) {
                toast.error('Módulo Financeiro não ativo no seu plano.')
            } else {
                toast.error('Erro ao carregar dados financeiros')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'tipo' ? { categoria: value === 'RECEITA' ? 'Serviço' : 'Produto/Insumo' } : {}),
        }))
    }

    const handleSalvar = async (e) => {
        e.preventDefault()
        if (!form.descricao || !form.valor || !form.data) {
            toast.error('Preencha todos os campos')
            return
        }
        setSalvando(true)
        try {
            const { data } = await api.post('/financeiro/transacoes', {
                ...form,
                valor: parseFloat(form.valor.replace(',', '.')),
            })
            setTransacoes(prev => [data, ...prev])
            toast.success(`${form.tipo === 'RECEITA' ? 'Receita' : 'Despesa'} lançada!`)
            setShowForm(false)
            setForm({ tipo: 'RECEITA', descricao: '', valor: '', data: new Date().toISOString().split('T')[0], categoria: 'Serviço' })
            fetchTudo()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erro ao salvar')
        } finally {
            setSalvando(false)
        }
    }

    const handleLancarAgendamento = async (id) => {
        try {
            await api.post(`/financeiro/transacoes/agendamento/${id}`)
            toast.success('Agendamento lançado como receita!')
            fetchTudo()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erro ao lançar')
        }
    }

    const handleExcluir = async (id) => {
        if (!confirm('Remover esta transação?')) return
        try {
            await api.delete(`/financeiro/transacoes/${id}`)
            setTransacoes(prev => prev.filter(t => t.id !== id))
            toast.success('Transação removida')
            fetchTudo()
        } catch {
            toast.error('Erro ao remover')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Conta Corrente</h1>
                        <p className="text-sm text-gray-500">Receitas e despesas do seu salão</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 transition px-3 py-2">
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </Link>
                    <button onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-xl text-sm font-medium shadow-sm hover:from-amber-600 hover:to-orange-500 transition">
                        <Plus className="w-4 h-4" /> Novo Lançamento
                    </button>
                </div>
            </div>

            {/* Cards resumo */}
            {resumo && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-500">Total Receitas</p>
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">{formatBRL(resumo.totalReceitas)}</p>
                        <p className="text-xs text-gray-400 mt-1">Mês de {filtroMes}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-500">Total Despesas</p>
                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-red-500">{formatBRL(resumo.totalDespesas)}</p>
                        <p className="text-xs text-gray-400 mt-1">Mês de {filtroMes}</p>
                    </div>

                    <div className={`rounded-2xl p-5 shadow-sm border ${resumo.saldo >= 0 ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-500">Saldo do Mês</p>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${resumo.saldo >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                <Wallet className={`w-4 h-4 ${resumo.saldo >= 0 ? 'text-emerald-600' : 'text-red-500'}`} />
                            </div>
                        </div>
                        <p className={`text-2xl font-bold ${resumo.saldo >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                            {formatBRL(resumo.saldo)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{resumo.quantidadeTransacoes} lançamentos</p>
                    </div>
                </div>
            )}

            {/* Agendamentos sem lançamento */}
            {resumo?.agendamentosSemLancamento?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {resumo.agendamentosSemLancamento.length} agendamento(s) confirmado(s) aguardando lançamento
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {resumo.agendamentosSemLancamento.map(ag => (
                            <button key={ag.id} onClick={() => handleLancarAgendamento(ag.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-medium text-amber-800 hover:bg-amber-100 transition">
                                <Plus className="w-3 h-3" />
                                {ag.cliente} — {ag.nomeServico} ({formatBRL(ag.valorServico)})
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Formulário de novo lançamento */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-semibold text-gray-900">Novo Lançamento</h2>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSalvar} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Tipo */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Tipo</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['RECEITA', 'DESPESA'].map(t => (
                                    <button key={t} type="button" onClick={() => setForm(p => ({ ...p, tipo: t, categoria: t === 'RECEITA' ? 'Serviço' : 'Produto/Insumo' }))}
                                        className={`py-2 rounded-xl text-sm font-semibold transition ${form.tipo === t
                                            ? t === 'RECEITA' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                        {t === 'RECEITA' ? '💰 Receita' : '💸 Despesa'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Descrição</label>
                            <input name="descricao" value={form.descricao} onChange={handleFormChange}
                                placeholder="Ex: Manicure gel / Esmaltes comprados"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition" required />
                        </div>

                        {/* Valor */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Valor (R$)</label>
                            <input name="valor" value={form.valor} onChange={handleFormChange} type="number" min="0" step="0.01"
                                placeholder="0,00"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition" required />
                        </div>

                        {/* Data */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Data</label>
                            <input name="data" value={form.data} onChange={handleFormChange} type="date"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition" required />
                        </div>

                        {/* Categoria */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Categoria</label>
                            <select name="categoria" value={form.categoria} onChange={handleFormChange}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition bg-white">
                                {(form.tipo === 'RECEITA' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA).map(c => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Botão salvar */}
                        <div className="flex items-end">
                            <button type="submit" disabled={salvando}
                                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-500 transition disabled:opacity-60 flex items-center justify-center gap-2">
                                {salvando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                                Lançar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filtros e Lista */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filtros</span>
                    </div>
                    <input type="month" value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                        <option value="">Todos</option>
                        <option value="RECEITA">💰 Receitas</option>
                        <option value="DESPESA">💸 Despesas</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : transacoes.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                        <p className="text-sm">Nenhum lançamento encontrado</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {transacoes.map(t => (
                            <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.tipo === 'RECEITA' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                    {t.tipo === 'RECEITA' ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <ShoppingCart className="w-4 h-4 text-red-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{t.descricao}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-400">{new Date(t.data + 'T12:00').toLocaleDateString('pt-BR')}</span>
                                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{t.categoria}</span>
                                        {t.agendamento && <span className="text-xs text-amber-600 flex items-center gap-0.5"><Calendar className="w-3 h-3" /> Agendamento</span>}
                                    </div>
                                </div>
                                <p className={`font-bold text-sm whitespace-nowrap ${t.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {t.tipo === 'RECEITA' ? '+' : '-'} {formatBRL(t.valor)}
                                </p>
                                <button onClick={() => handleExcluir(t.id)}
                                    className="p-1.5 text-gray-300 hover:text-red-400 transition rounded-lg hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
