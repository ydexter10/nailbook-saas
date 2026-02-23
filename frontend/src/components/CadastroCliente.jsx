import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { User, Phone, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../api'

export default function CadastroCliente() {
    const navigate = useNavigate()
    const nomeRef = useRef(null)
    const whatsappRef = useRef(null)

    const [form, setForm] = useState({ nome: '', whatsapp: '' })
    const [erros, setErros] = useState({ nome: '', whatsapp: '' })
    const [loading, setLoading] = useState(false)
    const [sucesso, setSucesso] = useState(false)

    const formatarWhatsApp = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 11)
        if (digits.length <= 2) return digits
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    }

    const handleNomeChange = (e) => {
        const val = e.target.value
        setForm(prev => ({ ...prev, nome: val }))
        if (val.trim()) setErros(prev => ({ ...prev, nome: '' }))
    }

    const handleWhatsAppChange = (e) => {
        const formatted = formatarWhatsApp(e.target.value)
        setForm(prev => ({ ...prev, whatsapp: formatted }))
        const digits = formatted.replace(/\D/g, '')
        if (digits.length >= 10) setErros(prev => ({ ...prev, whatsapp: '' }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Lê do state e também do DOM como fallback (para auto-complete do browser)
        const nomeVal = (form.nome || nomeRef.current?.value || '').trim()
        const whatsappRaw = form.whatsapp || whatsappRef.current?.value || ''
        const whatsappDigitos = whatsappRaw.replace(/\D/g, '')

        // Validações com feedback por campo
        const novosErros = { nome: '', whatsapp: '' }
        let valido = true

        if (!nomeVal) {
            novosErros.nome = 'Nome é obrigatório'
            valido = false
        }
        if (whatsappDigitos.length < 10) {
            novosErros.whatsapp = 'WhatsApp inválido. Digite com DDD (ex: 11 99999-0000)'
            valido = false
        }

        setErros(novosErros)
        if (!valido) {
            toast.error('Verifique os campos destacados')
            return
        }

        setLoading(true)
        try {
            await api.post('/clientes', { nome: nomeVal, whatsapp: whatsappDigitos })
            setSucesso(true)
            toast.success('Cliente cadastrada com sucesso! 🎉')
            setTimeout(() => navigate('/clientes'), 2000)
        } catch (err) {
            const msg = err.response?.data?.error || 'Erro ao cadastrar cliente'
            toast.error(msg)
            // Se for duplicata, marca o campo WhatsApp
            if (err.response?.status === 409) {
                setErros(prev => ({ ...prev, whatsapp: 'Este WhatsApp já está cadastrado' }))
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-lg mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link to="/clientes" className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-600 transition mb-3">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Clientes
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Cadastrar Nova Cliente</h1>
                <p className="text-gray-500 text-sm mt-1">Preencha os dados para cadastrar uma nova cliente</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {sucesso ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Cliente cadastrada!</h3>
                        <p className="text-gray-500 text-sm mt-1">Redirecionando para a lista...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome Completo *
                            </label>
                            <div className="relative">
                                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${erros.nome ? 'text-red-400' : 'text-gray-400'}`} />
                                <input
                                    ref={nomeRef}
                                    type="text"
                                    name="nome"
                                    value={form.nome}
                                    onChange={handleNomeChange}
                                    placeholder="Ex: Maria da Silva"
                                    autoComplete="off"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${erros.nome
                                            ? 'border-red-300 focus:ring-red-400 bg-red-50'
                                            : 'border-gray-200 focus:ring-rose-400 focus:border-transparent'
                                        }`}
                                />
                            </div>
                            {erros.nome && (
                                <p className="flex items-center gap-1 text-xs text-red-600 mt-1.5">
                                    <AlertCircle className="w-3 h-3" /> {erros.nome}
                                </p>
                            )}
                        </div>

                        {/* WhatsApp */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                WhatsApp *
                            </label>
                            <div className="relative">
                                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${erros.whatsapp ? 'text-red-400' : 'text-gray-400'}`} />
                                <input
                                    ref={whatsappRef}
                                    type="tel"
                                    name="whatsapp"
                                    value={form.whatsapp}
                                    onChange={handleWhatsAppChange}
                                    placeholder="(11) 99999-0000"
                                    autoComplete="off"
                                    inputMode="numeric"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${erros.whatsapp
                                            ? 'border-red-300 focus:ring-red-400 bg-red-50'
                                            : 'border-gray-200 focus:ring-rose-400 focus:border-transparent'
                                        }`}
                                />
                            </div>
                            {erros.whatsapp ? (
                                <p className="flex items-center gap-1 text-xs text-red-600 mt-1.5">
                                    <AlertCircle className="w-3 h-3" /> {erros.whatsapp}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400 mt-1.5">Com DDD — Ex: (11) 99999-0000</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold text-sm shadow-sm hover:from-rose-600 hover:to-pink-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Cadastrando...
                                </>
                            ) : (
                                'Cadastrar Cliente'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
