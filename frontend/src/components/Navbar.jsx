import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
    LayoutDashboard, Users, Calendar, PlusCircle, Menu, X,
    Sparkles, ShieldCheck, LogOut, ChevronDown, Wallet,
    Settings, Building2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { usuario, logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    const isActive = (path) => location.pathname.startsWith(path) && path !== '/dashboard'
        ? true
        : location.pathname === path

    const handleLogout = () => {
        logout()
        toast.success('Até logo! 👋')
        navigate('/login')
    }

    const getInitials = (nome = '') => nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    const cor = usuario?.corPrimaria || '#f43f5e'

    const baseLinkClass = (to) => `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(to) ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
        }`

    const baseLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/agendamentos', label: 'Agendamentos', icon: Calendar },
        { to: '/agendamentos/novo', label: 'Novo Agend.', icon: PlusCircle },
        { to: '/clientes', label: 'Clientes', icon: Users },
        { to: '/clientes/novo', label: 'Novo Cliente', icon: PlusCircle },
    ]

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
                        {usuario?.logoBase64 ? (
                            <img src={usuario.logoBase64} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md" style={{ background: cor }}>
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <span className="text-xl font-bold" style={{ color: cor }}>
                            {usuario?.nomeSalao || 'NailBook'}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-0.5">
                        {baseLinks.map(({ to, label, icon: Icon }) => (
                            <Link key={to} to={to}
                                className={baseLinkClass(to)}
                                style={isActive(to) ? { background: cor } : {}}>
                                <Icon className="w-4 h-4" /> {label}
                            </Link>
                        ))}

                        {/* Financeiro */}
                        {usuario?.moduloFinanceiroAtivo && (
                            <Link to="/financeiro"
                                className={baseLinkClass('/financeiro')}
                                style={isActive('/financeiro') ? { background: '#f59e0b' } : { color: '#d97706' }}>
                                <Wallet className="w-4 h-4" /> Financeiro
                            </Link>
                        )}

                        {/* Configurações */}
                        <Link to="/configuracoes"
                            className={baseLinkClass('/configuracoes')}
                            style={isActive('/configuracoes') ? { background: cor } : {}}>
                            <Settings className="w-4 h-4" /> Config.
                        </Link>

                        {/* Admin links */}
                        {usuario?.role === 'ADMIN' && (
                            <>
                                <Link to="/admin/licencas"
                                    className={baseLinkClass('/admin/licencas')}
                                    style={isActive('/admin/licencas') ? { background: '#8b5cf6' } : { color: '#8b5cf6' }}>
                                    <Building2 className="w-4 h-4" /> Licenças
                                </Link>
                                <Link to="/admin"
                                    className={baseLinkClass('/admin')}
                                    style={isActive('/admin') ? { background: '#8b5cf6' } : { color: '#8b5cf6' }}>
                                    <ShieldCheck className="w-4 h-4" /> Admin
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Usuário desktop */}
                    <div className="hidden lg:flex items-center gap-2 relative">
                        <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: cor }}>
                                {usuario?.logoBase64 ? (
                                    <img src={usuario.logoBase64} className="w-8 h-8 rounded-full object-cover" alt="" />
                                ) : (
                                    <span className="text-white text-xs font-semibold">{getInitials(usuario?.nome)}</span>
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{usuario?.nome}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                    <div className="px-3 py-2 border-b border-gray-100">
                                        <p className="text-xs font-semibold text-gray-900 truncate">{usuario?.nomeSalao || usuario?.nome}</p>
                                        <p className="text-xs text-gray-400 truncate">{usuario?.email}</p>
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${cor}20`, color: cor }}>
                                                {usuario?.role === 'ADMIN' ? '👑 Admin' : '💅 Manicure'}
                                            </span>
                                            {usuario?.moduloFinanceiroAtivo && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">💰 Financeiro</span>}
                                            {usuario?.moduloWhatsappAtivo && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">📲 WhatsApp</span>}
                                        </div>
                                    </div>
                                    <Link to="/configuracoes" onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                                        <Settings className="w-4 h-4" /> Configurações
                                    </Link>
                                    <button onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                                        <LogOut className="w-4 h-4" /> Sair
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={() => setMenuOpen(!menuOpen)}
                        className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="lg:hidden border-t border-gray-100 bg-white pb-3">
                    <div className="px-4 pt-3 flex flex-col gap-1">
                        {baseLinks.map(({ to, label, icon: Icon }) => (
                            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition`}
                                style={isActive(to) ? { background: `${cor}15`, color: cor } : { color: '#4b5563' }}>
                                <Icon className="w-5 h-5" /> {label}
                            </Link>
                        ))}
                        {usuario?.moduloFinanceiroAtivo && (
                            <Link to="/financeiro" onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-50 transition">
                                <Wallet className="w-5 h-5" /> Financeiro
                            </Link>
                        )}
                        <Link to="/configuracoes" onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                            <Settings className="w-5 h-5" /> Configurações
                        </Link>
                        {usuario?.role === 'ADMIN' && (
                            <>
                                <Link to="/admin/licencas" onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-violet-600 hover:bg-violet-50 transition">
                                    <Building2 className="w-5 h-5" /> Gestão de Licenças
                                </Link>
                                <Link to="/admin" onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-violet-600 hover:bg-violet-50 transition">
                                    <ShieldCheck className="w-5 h-5" /> Painel Admin
                                </Link>
                            </>
                        )}
                        <div className="border-t border-gray-100 mt-2 pt-3">
                            <button onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition w-full">
                                <LogOut className="w-5 h-5" /> Sair da Conta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
