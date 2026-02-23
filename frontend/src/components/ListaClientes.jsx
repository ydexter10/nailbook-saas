import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Users, Phone, PlusCircle, Calendar, ChevronRight } from 'lucide-react'
import api from '../api'

export default function ListaClientes() {
    const [clientes, setClientes] = useState([])
    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState('')

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const { data } = await api.get('/clientes')
                setClientes(data)
            } catch {
                toast.error('Erro ao carregar clientes')
            } finally {
                setLoading(false)
            }
        }
        fetchClientes()
    }, [])

    const formatarWhatsApp = (num) => {
        const d = num.replace(/\D/g, '')
        if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
        if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
        return num
    }

    const clientesFiltrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.whatsapp.includes(busca.replace(/\D/g, ''))
    )

    const getInitials = (nome) => nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

    const CORES = ['bg-rose-500', 'bg-pink-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500']
    const getCor = (id) => CORES[id % CORES.length]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                    <p className="text-sm text-gray-500">{clientes.length} cliente(s) cadastrado(s)</p>
                </div>
                <Link
                    to="/clientes/novo"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl shadow-sm hover:from-rose-600 hover:to-pink-600 transition text-sm font-medium w-fit"
                >
                    <PlusCircle className="w-4 h-4" />
                    Nova Cliente
                </Link>
            </div>

            {/* Busca */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar por nome ou WhatsApp..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                    />
                </div>
            </div>

            {/* Lista */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : clientesFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-rose-300" />
                        </div>
                        <p className="font-medium text-gray-500">Nenhuma cliente encontrada</p>
                        {busca ? (
                            <p className="text-sm text-gray-400 mt-1">Tente buscar com outro termo</p>
                        ) : (
                            <Link to="/clientes/novo" className="mt-4 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition">
                                Cadastrar primeira cliente
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {clientesFiltrados.map((c) => (
                            <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition">
                                {/* Avatar */}
                                <div className={`w-10 h-10 ${getCor(c.id)} rounded-full flex items-center justify-center flex-shrink-0`}>
                                    <span className="text-white text-sm font-semibold">{getInitials(c.nome)}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{c.nome}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {formatarWhatsApp(c.whatsapp)}
                                        </span>
                                        {c.agendamentos && (
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {c.agendamentos.length} agend.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Histórico recente */}
                                {c.agendamentos?.[0] && (
                                    <div className="hidden md:block text-right flex-shrink-0">
                                        <p className="text-xs text-gray-400">Último serviço</p>
                                        <p className="text-sm font-medium text-gray-700">{c.agendamentos[0].nomeServico}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
