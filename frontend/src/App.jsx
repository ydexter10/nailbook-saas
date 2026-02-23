import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { RotaProtegida, RotaPublica } from './components/RotaProtegida'
import RotaModulo from './components/RotaModulo'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import CadastroCliente from './components/CadastroCliente'
import NovoAgendamento from './components/NovoAgendamento'
import ListaAgendamentos from './components/ListaAgendamentos'
import ListaClientes from './components/ListaClientes'
import Login from './components/auth/Login'
import Cadastro from './components/auth/Cadastro'
import PainelAdmin from './components/admin/PainelAdmin'
import GestaoLicencas from './components/admin/GestaoLicencas'
import ContaCorrente from './components/financeiro/ContaCorrente'
import Configuracoes from './components/Configuracoes'
import Upgrade from './components/Upgrade'

function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Router>
                <Routes>
                    {/* Rotas públicas */}
                    <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />
                    <Route path="/cadastro" element={<RotaPublica><Cadastro /></RotaPublica>} />

                    {/* Rotas privadas */}
                    <Route path="/dashboard" element={<RotaProtegida><Layout><Dashboard /></Layout></RotaProtegida>} />
                    <Route path="/clientes" element={<RotaProtegida><Layout><ListaClientes /></Layout></RotaProtegida>} />
                    <Route path="/clientes/novo" element={<RotaProtegida><Layout><CadastroCliente /></Layout></RotaProtegida>} />
                    <Route path="/agendamentos" element={<RotaProtegida><Layout><ListaAgendamentos /></Layout></RotaProtegida>} />
                    <Route path="/agendamentos/novo" element={<RotaProtegida><Layout><NovoAgendamento /></Layout></RotaProtegida>} />
                    <Route path="/configuracoes" element={<RotaProtegida><Layout><Configuracoes /></Layout></RotaProtegida>} />
                    <Route path="/upgrade" element={<RotaProtegida><Layout><Upgrade /></Layout></RotaProtegida>} />

                    {/* Módulo Financeiro */}
                    <Route path="/financeiro" element={
                        <RotaProtegida>
                            <RotaModulo modulo="financeiro">
                                <Layout><ContaCorrente /></Layout>
                            </RotaModulo>
                        </RotaProtegida>
                    } />

                    {/* Admin */}
                    <Route path="/admin" element={<RotaProtegida apenasAdmin><Layout><PainelAdmin /></Layout></RotaProtegida>} />
                    <Route path="/admin/licencas" element={<RotaProtegida apenasAdmin><Layout><GestaoLicencas /></Layout></RotaProtegida>} />

                    {/* Fallback */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
