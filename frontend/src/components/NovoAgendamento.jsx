import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Calendar, Clock, User, Briefcase, DollarSign, Scissors, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'
import api from '../api'

const SERVICOS_COMUNS = [
    'Manicure Simples', 'Manicure em Gel', 'Pedicure Simples', 'Pedicure Completa',
    'Nail Art', 'Esmaltação em Gel', 'Cutilagem', 'Banho de Gel', 'Polygel', 'Acrigel',
]

export default function NovoAgendamento() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        data: new Date().toISOString().split('T')[0],
        hora: '',
        nomeServico: '',
        valorServico: '',
        clienteId: '',
        profissionalId: '',
    })
    const [clientes, setClientes] = useState([])
    const [profissionais, setProfissionais] = useState([])
    const [horariosDisponiveis, setHorariosDisponiveis] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingHorarios, setLoadingHorarios] = useState(false)
    const [sucesso, setSucesso] = useState(false)

    useEffect(() => {
        const fetchDados = async () => {
            try {
                const [resClientes, resProfissionais] = await Promise.all([
                    api.get('/clientes'),
                    api.get('/profissionais'),
                ])
                setClientes(resClientes.data)
                setProfissionais(resProfissionais.data)
            } catch {
                toast.error('Erro ao carregar dados')
            }
        }
        fetchDados()
    }, [])

    // Carregar horários disponíveis quando profissional e data mudam
    useEffect(() => {
        const fetchHorarios = async () => {
            if (!form.profissionalId || !form.data) { setHorariosDisponiveis([]); return }
            setLoadingHorarios(true)
            setForm(f => ({ ...f, hora: '' })) // Reset hora ao mudar profissional/data
            try {
                const profissional = profissionais.find(p => p.id === Number(form.profissionalId))
                if (!profissional) return
                const horariosTrabalho = JSON.parse(profissional.horariosTrabalho || '[]')

                // Buscar agendamentos já existentes neste dia/profissional
                const { data: agendamentos } = await api.get('/agendamentos', {
                    params: { data: form.data, profissionalId: form.profissionalId },
                })
                const horariosOcupados = agendamentos
                    .filter(a => a.status === 'CONFIRMADO')
                    .map(a => a.hora)

                const disponiveis = horariosTrabalho.map(hora => ({
                    hora,
                    ocupado: horariosOcupados.includes(hora),
                }))
                setHorariosDisponiveis(disponiveis)
            } catch {
                toast.error('Erro ao buscar horários')
            } finally {
                setLoadingHorarios(false)
            }
        }
        fetchHorarios()
    }, [form.profissionalId, form.data, profissionais])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { data, hora, nomeServico, valorServico, clienteId, profissionalId } = form
        if (!data || !hora || !nomeServico || !valorServico || !clienteId || !profissionalId) {
            toast.error('Preencha todos os campos obrigatórios')
            return
        }
        setLoading(true)
        try {
            await api.post('/agendamentos', {
                data, hora, nomeServico, valorServico: Number(valorServico),
                clienteId: Number(clienteId), profissionalId: Number(profissionalId),
            })
            setSucesso(true)
            toast.success('Agendamento criado com sucesso!')
            setTimeout(() => navigate('/dashboard'), 2000)
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Erro ao criar agendamento'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-600 transition mb-3">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Novo Agendamento</h1>
                <p className="text-gray-500 text-sm mt-1">Selecione o profissional e data para ver os horários disponíveis</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {sucesso ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Agendamento confirmado!</h3>
                        <p className="text-gray-500 text-sm mt-1">Redirecionando ao Dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Linha: Profissional e Data */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profissional *</label>
                                <div className="relative">
                                    <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select name="profissionalId" value={form.profissionalId} onChange={handleChange}
                                        className={inputClass} required>
                                        <option value="">Selecione...</option>
                                        {profissionais.map(p => (
                                            <option key={p.id} value={p.id}>{p.nome} — {p.especialidade}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="date" name="data" value={form.data} onChange={handleChange}
                                        className={inputClass} required />
                                </div>
                            </div>
                        </div>

                        {/* Horários disponíveis */}
                        {form.profissionalId && form.data && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-rose-500" />
                                    Horário Disponível *
                                </label>
                                {loadingHorarios ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                        Verificando horários...
                                    </div>
                                ) : horariosDisponiveis.length === 0 ? (
                                    <p className="text-sm text-gray-500">Nenhum horário cadastrado para esta profissional</p>
                                ) : (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {horariosDisponiveis.map(({ hora, ocupado }) => (
                                            <button
                                                key={hora}
                                                type="button"
                                                disabled={ocupado}
                                                onClick={() => !ocupado && setForm(f => ({ ...f, hora }))}
                                                title={ocupado ? 'Horário ocupado' : 'Disponível'}
                                                className={`py-2 rounded-xl text-sm font-medium transition border flex flex-col items-center gap-0.5 ${form.hora === hora
                                                        ? 'bg-rose-500 text-white border-rose-500 shadow'
                                                        : ocupado
                                                            ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed line-through'
                                                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600'
                                                    }`}
                                            >
                                                {hora}
                                                {ocupado && <span className="text-[10px]">ocupado</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {!form.hora && horariosDisponiveis.length > 0 && (
                                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Selecione um horário disponível
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Serviço */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Serviço *</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="nomeServico"
                                    value={form.nomeServico}
                                    onChange={handleChange}
                                    list="servicos-list"
                                    placeholder="Ex: Manicure em Gel"
                                    className={inputClass}
                                    required
                                />
                                <datalist id="servicos-list">
                                    {SERVICOS_COMUNS.map(s => <option key={s} value={s} />)}
                                </datalist>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Digite ou escolha da lista de sugestões</p>
                        </div>

                        {/* Linha: Cliente e Valor */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select name="clienteId" value={form.clienteId} onChange={handleChange}
                                        className={inputClass} required>
                                        <option value="">Selecione...</option>
                                        {clientes.map(c => (
                                            <option key={c.id} value={c.id}>{c.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$) *</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        name="valorServico"
                                        value={form.valorServico}
                                        onChange={handleChange}
                                        placeholder="0,00"
                                        min="0"
                                        step="0.01"
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !form.hora}
                            className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold text-sm shadow-sm hover:from-rose-600 hover:to-pink-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Criando agendamento...
                                </>
                            ) : (
                                'Confirmar Agendamento'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
