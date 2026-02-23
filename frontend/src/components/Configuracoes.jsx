import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Settings, Camera, Palette, Save, ArrowLeft, Phone } from 'lucide-react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const PALETAS = [
    { nome: 'Rosa', hex: '#f43f5e' },
    { nome: 'Roxo', hex: '#8b5cf6' },
    { nome: 'Dourado', hex: '#f59e0b' },
    { nome: 'Teal', hex: '#14b8a6' },
    { nome: 'Azul', hex: '#3b82f6' },
    { nome: 'Verde', hex: '#10b981' },
]

export default function Configuracoes() {
    const { usuario, atualizarPerfil } = useAuth()
    const [form, setForm] = useState({
        nomeSalao: '', whatsappDono: '', corPrimaria: '#f43f5e', logoBase64: '',
    })
    const [salvando, setSalvando] = useState(false)
    const [corHex, setCorHex] = useState('#f43f5e')
    const fileRef = useRef()

    useEffect(() => {
        if (usuario) {
            setForm({
                nomeSalao: usuario.nomeSalao || '',
                whatsappDono: usuario.whatsappDono || '',
                corPrimaria: usuario.corPrimaria || '#f43f5e',
                logoBase64: usuario.logoBase64 || '',
            })
            setCorHex(usuario.corPrimaria || '#f43f5e')
        }
    }, [usuario])

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) { toast.error('Logo muito grande. Máximo: 2MB'); return }
        const reader = new FileReader()
        reader.onload = () => setForm(p => ({ ...p, logoBase64: reader.result }))
        reader.readAsDataURL(file)
    }

    const handleCorPaleta = (hex) => {
        setForm(p => ({ ...p, corPrimaria: hex }))
        setCorHex(hex)
        document.documentElement.style.setProperty('--color-primary', hex)
    }

    const handleCorHex = (e) => {
        const v = e.target.value
        setCorHex(v)
        if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
            setForm(p => ({ ...p, corPrimaria: v }))
            document.documentElement.style.setProperty('--color-primary', v)
        }
    }

    const handleSalvar = async (e) => {
        e.preventDefault()
        setSalvando(true)
        try {
            const { data } = await api.patch('/configuracoes', form)
            atualizarPerfil(data)
            toast.success('✅ Configurações salvas!')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erro ao salvar')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: form.corPrimaria }}>
                        <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                        <p className="text-sm text-gray-500">Personalize seu salão no NailBook</p>
                    </div>
                </div>
                <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-600 transition">
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </Link>
            </div>

            <form onSubmit={handleSalvar} className="space-y-5">
                {/* Card: Perfil do Salão */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                    <h2 className="font-semibold text-gray-900">🏠 Perfil do Salão</h2>

                    {/* Logo */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Logo do Salão</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 flex-shrink-0">
                                {form.logoBase64 ? (
                                    <img src={form.logoBase64} className="w-full h-full object-cover" alt="Logo" />
                                ) : (
                                    <Camera className="w-7 h-7 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <button type="button" onClick={() => fileRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                                    <Camera className="w-4 h-4" /> Selecionar imagem
                                </button>
                                {form.logoBase64 && (
                                    <button type="button" onClick={() => setForm(p => ({ ...p, logoBase64: '' }))}
                                        className="text-xs text-red-500 hover:text-red-600 transition">Remover logo</button>
                                )}
                                <p className="text-xs text-gray-400">PNG, JPG ou SVG. Máximo 2MB.</p>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                            </div>
                        </div>
                    </div>

                    {/* Nome do salão */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nome do Salão</label>
                        <input value={form.nomeSalao} onChange={e => setForm(p => ({ ...p, nomeSalao: e.target.value }))}
                            placeholder="Ex: Studio Ana Paula"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition" />
                        <p className="text-xs text-gray-400 mt-1">Aparece no topo do Dashboard</p>
                    </div>

                    {/* WhatsApp do dono */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            <Phone className="w-3.5 h-3.5 inline mr-1" />WhatsApp do Proprietário
                        </label>
                        <input value={form.whatsappDono} onChange={e => setForm(p => ({ ...p, whatsappDono: e.target.value }))}
                            placeholder="(11) 99999-9999"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition" />
                    </div>
                </div>

                {/* Card: Cor do Tema */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Palette className="w-5 h-5" /> Cor Principal do Sistema
                    </h2>

                    {/* Paletas pré-definidas */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Paletas Rápidas</label>
                        <div className="flex flex-wrap gap-3">
                            {PALETAS.map(p => (
                                <button key={p.hex} type="button" onClick={() => handleCorPaleta(p.hex)}
                                    className="flex flex-col items-center gap-1.5 group">
                                    <div className="w-10 h-10 rounded-xl shadow-sm ring-offset-2 transition group-hover:ring-2"
                                        style={{ background: p.hex, boxShadow: form.corPrimaria === p.hex ? `0 0 0 3px ${p.hex}44` : '' }}>
                                        {form.corPrimaria === p.hex && (
                                            <svg className="w-10 h-10 flex p-2" viewBox="0 0 24 24" fill="white"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-500">{p.nome}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cor personalizada */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cor Personalizada (HEX)</label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={form.corPrimaria}
                                onChange={e => handleCorPaleta(e.target.value)}
                                className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                            <input value={corHex} onChange={handleCorHex}
                                placeholder="#f43f5e" maxLength={7}
                                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-300 transition uppercase" />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="rounded-xl p-4 border border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-500 mb-3 font-medium">Pré-visualização</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: form.corPrimaria }}>
                                <span className="text-white text-sm">✨</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm" style={{ color: form.corPrimaria }}>{form.nomeSalao || 'Nome do Salão'}</p>
                                <p className="text-xs text-gray-400">Painel de Gestão</p>
                            </div>
                            <button type="button" className="ml-auto px-3 py-1.5 text-white text-xs rounded-lg font-medium" style={{ background: form.corPrimaria }}>
                                Botão
                            </button>
                        </div>
                    </div>
                </div>

                {/* Salvar */}
                <button type="submit" disabled={salvando}
                    className="w-full py-3 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: form.corPrimaria }}>
                    {salvando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    Salvar Configurações
                </button>
            </form>
        </div>
    )
}
