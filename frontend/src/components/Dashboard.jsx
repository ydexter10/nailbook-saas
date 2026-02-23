import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
    Calendar, Clock, CheckCircle, XCircle, AlertCircle,
    DollarSign, PlusCircle, RefreshCw, Check
} from 'lucide-react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useWhatsApp } from '../hooks/useWhatsApp'

const STATUS_CONFIG = {
    CONFIRMADO: { label: 'Confirmado', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle },
    CANCELADO: { label: 'Cancelado', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
    PENDENTE: { label: 'Pendente', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertCircle },
}

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDENTE
    const Icon = cfg.icon
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <Icon className="w-3 h-3" />{cfg.label}
        </span>
    )
}


export default function Dashboard() {
    const { usuario } = useAuth()
    const { enviarLembrete, enviados } = useWhatsApp()
    const [agendamentos, setAgendamentos] = useState([])
    const [loading, setLoading] = useState(true)
    const [atualizando, setAtualizando] = useState(null)

    const hoje = new Date()
    const dataFormatada = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    const nomeSalao = usuario?.nomeSalao || usuario?.nome || 'Meu Salão'

    const fetchHoje = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/agendamentos/hoje')
            setAgendamentos(data)
        } catch { toast.error('Erro ao carregar agendamentos') }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchHoje() }, [])

    const handleStatus = async (id, novoStatus) => {
        setAtualizando(id)
        try {
            const { data } = await api.patch(`/agendamentos/${id}/status`, { status: novoStatus })
            setAgendamentos(prev => prev.map(a => a.id === id ? data : a))
            toast.success(`Agendamento ${novoStatus === 'CONFIRMADO' ? 'confirmado' : 'cancelado'}!`)
        } catch { toast.error('Erro ao atualizar status') }
        finally { setAtualizando(null) }
    }

    const confirmados = agendamentos.filter(a => a.status === 'CONFIRMADO').length
    const pendentes = agendamentos.filter(a => a.status === 'PENDENTE').length
    const faturamento = agendamentos.filter(a => a.status === 'CONFIRMADO').reduce((s, a) => s + a.valorServico, 0)

    return (
        <div className="space-y-6">
            {/* Header com nome do salão e logo */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    {usuario?.logoBase64 && (
                        <img src={usuario.logoBase64} alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-100" />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Painel de Gestão — <span style={{ color: usuario?.corPrimaria || '#f43f5e' }}>{nomeSalao}</span>
                        </h1>
                        <p className="text-sm text-gray-500 capitalize">{dataFormatada}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchHoje}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-medium">
                        <RefreshCw className="w-4 h-4" /> Atualizar
                    </button>
                    <Link to="/agendamentos/novo"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl shadow-sm hover:from-rose-600 hover:to-pink-600 transition text-sm font-medium">
                        <PlusCircle className="w-4 h-4" /> Novo Agendamento
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Hoje', value: agendamentos.length, color: 'from-rose-500 to-pink-400', icon: Calendar },
                    { label: 'Confirmados', value: confirmados, color: 'from-emerald-500 to-green-400', icon: CheckCircle },
                    { label: 'Pendentes', value: pendentes, color: 'from-amber-500 to-yellow-400', icon: AlertCircle },
                    { label: 'Faturamento Est.', value: `R$ ${faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'from-violet-500 to-purple-400', icon: DollarSign },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <s.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                            <p className="text-sm font-medium text-gray-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lista de agendamentos de hoje */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-rose-500" /> Agendamentos de Hoje
                    </h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{agendamentos.length}</span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : agendamentos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Calendar className="w-12 h-12 text-gray-200 mb-3" />
                        <p className="text-gray-500 font-medium">Nenhum agendamento para hoje</p>
                        <Link to="/agendamentos/novo" className="mt-3 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition">
                            Novo Agendamento
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {agendamentos.map((ag) => (
                            <div key={ag.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50 transition">
                                <div className="flex-shrink-0 w-16 text-center">
                                    <p className="text-lg font-bold text-gray-900">{ag.hora}</p>
                                </div>
                                <div className="hidden sm:block w-px h-10 bg-gray-200" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <p className="font-semibold text-gray-900 truncate">{ag.cliente?.nome}</p>
                                        <StatusBadge status={ag.status} />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {ag.nomeServico} · <span className="font-medium text-gray-700">
                                            R$ {ag.valorServico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">Prof.: {ag.profissional?.nome}</p>
                                </div>
                                {/* Botões de ação */}
                                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                    {/* Botão WhatsApp com feedback visual */}
                                    {ag.cliente?.whatsapp && ag.status !== 'CANCELADO' && (
                                        <button
                                            onClick={() => enviarLembrete(ag)}
                                            title={enviados.has(ag.id) ? 'Lembrete já enviado' : 'Enviar lembrete via WhatsApp'}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${enviados.has(ag.id)
                                                    ? 'bg-green-600 text-white shadow-sm scale-95'
                                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                }`}
                                        >
                                            {enviados.has(ag.id) ? (
                                                <><Check className="w-3 h-3" /> Enviado</>
                                            ) : (
                                                <><span className="text-base leading-none">📲</span> Lembrete</>
                                            )}
                                        </button>
                                    )}
                                    {ag.status === 'PENDENTE' && (
                                        <button onClick={() => handleStatus(ag.id, 'CONFIRMADO')} disabled={atualizando === ag.id}
                                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition disabled:opacity-50">
                                            Confirmar
                                        </button>
                                    )}
                                    {ag.status !== 'CANCELADO' && (
                                        <button onClick={() => handleStatus(ag.id, 'CANCELADO')} disabled={atualizando === ag.id}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition disabled:opacity-50">
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
