import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Calendar, CheckCircle, XCircle, AlertCircle, Filter, PlusCircle, Check } from 'lucide-react'
import api from '../api'
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
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    )
}

export default function ListaAgendamentos() {
    const { enviarLembrete, enviados } = useWhatsApp()
    const [agendamentos, setAgendamentos] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtroData, setFiltroData] = useState('')
    const [filtroStatus, setFiltroStatus] = useState('')
    const [atualizando, setAtualizando] = useState(null)

    const fetchAgendamentos = useCallback(async () => {
        setLoading(true)
        try {
            const params = {}
            if (filtroData) params.data = filtroData
            if (filtroStatus) params.status = filtroStatus
            const { data } = await api.get('/agendamentos', { params })
            setAgendamentos(data)
        } catch {
            toast.error('Erro ao carregar agendamentos')
        } finally {
            setLoading(false)
        }
    }, [filtroData, filtroStatus])

    useEffect(() => { fetchAgendamentos() }, [fetchAgendamentos])

    const handleStatus = async (id, novoStatus) => {
        setAtualizando(id)
        try {
            const { data } = await api.patch(`/agendamentos/${id}/status`, { status: novoStatus })
            setAgendamentos(prev => prev.map(a => a.id === id ? data : a))
            toast.success('Status atualizado!')
        } catch {
            toast.error('Erro ao atualizar status')
        } finally {
            setAtualizando(null)
        }
    }

    const formatarData = (dataStr) => {
        const [ano, mes, dia] = dataStr.split('-')
        return `${dia}/${mes}/${ano}`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Todos os Agendamentos</h1>
                    <p className="text-sm text-gray-500">{agendamentos.length} agendamento(s) encontrado(s)</p>
                </div>
                <Link
                    to="/agendamentos/novo"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl shadow-sm hover:from-rose-600 hover:to-pink-600 transition text-sm font-medium w-fit"
                >
                    <PlusCircle className="w-4 h-4" />
                    Novo Agendamento
                </Link>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="date"
                        value={filtroData}
                        onChange={(e) => setFiltroData(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                    />
                </div>
                <div className="relative flex-1">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition appearance-none"
                    >
                        <option value="">Todos os status</option>
                        <option value="CONFIRMADO">Confirmado</option>
                        <option value="PENDENTE">Pendente</option>
                        <option value="CANCELADO">Cancelado</option>
                    </select>
                </div>
                {(filtroData || filtroStatus) && (
                    <button
                        onClick={() => { setFiltroData(''); setFiltroStatus('') }}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition"
                    >
                        Limpar
                    </button>
                )}
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : agendamentos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-rose-300" />
                        </div>
                        <p className="font-medium text-gray-500">Nenhum agendamento encontrado</p>
                        <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros acima</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {['Data', 'Horário', 'Cliente', 'Profissional', 'Serviço', 'Valor', 'Status', 'Ações', ''].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {agendamentos.map((ag) => (
                                    <tr key={ag.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-4 py-3 font-medium text-gray-900">{formatarData(ag.data)}</td>
                                        <td className="px-4 py-3 text-gray-600">{ag.hora}</td>
                                        <td className="px-4 py-3 text-gray-900">{ag.cliente?.nome}</td>
                                        <td className="px-4 py-3 text-gray-600">{ag.profissional?.nome}</td>
                                        <td className="px-4 py-3 text-gray-700">{ag.nomeServico}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            R$ {ag.valorServico.toFixed(2).replace('.', ',')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={ag.status} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                {ag.status === 'PENDENTE' && (
                                                    <button onClick={() => handleStatus(ag.id, 'CONFIRMADO')} disabled={atualizando === ag.id}
                                                        className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs hover:bg-emerald-100 transition disabled:opacity-50">
                                                        Confirmar
                                                    </button>
                                                )}
                                                {ag.status !== 'CANCELADO' && (
                                                    <button onClick={() => handleStatus(ag.id, 'CANCELADO')} disabled={atualizando === ag.id}
                                                        className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 transition disabled:opacity-50">
                                                        Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {ag.status !== 'CANCELADO' && ag.cliente?.whatsapp && (
                                                <button
                                                    onClick={() => enviarLembrete(ag)}
                                                    title={enviados.has(ag.id) ? 'Lembrete já enviado' : 'Enviar lembrete via WhatsApp'}
                                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${enviados.has(ag.id)
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
