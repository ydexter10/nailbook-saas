import { Link, useLocation } from 'react-router-dom'
import { Lock, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react'

const MODULO_INFO = {
    financeiro: {
        nome: 'Módulo Financeiro',
        emoji: '💰',
        desc: 'Conta Corrente, Relatórios e Controle de Despesas',
        recursos: [
            'Lançamento de receitas e despesas',
            'Saldo em tempo real',
            'Relatórios mensais',
            'Vinculação de agendamentos ao financeiro',
        ],
    },
    whatsapp: {
        nome: 'Módulo WhatsApp',
        emoji: '📲',
        desc: 'Lembretes automáticos e comunicação com clientes via WhatsApp',
        recursos: [
            'Lembretes automáticos 24h antes',
            'Mensagens de confirmação',
            'Notificações de cancelamento',
            'Configuração de templates',
        ],
    },
}

export default function Upgrade() {
    const location = useLocation()
    const moduloKey = location.state?.modulo || 'financeiro'
    const info = MODULO_INFO[moduloKey] || MODULO_INFO.financeiro

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* Ícone de bloqueio */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl shadow-lg mb-6">
                    <Lock className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {info.emoji} {info.nome}
                </h1>
                <p className="text-gray-500 mb-6">
                    Este módulo <strong>não está incluso no seu plano atual</strong>.
                    Entre em contato com o administrador para ativar o acesso.
                </p>

                {/* Card com recursos */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-6 text-left mb-6">
                    <p className="text-sm font-semibold text-rose-700 mb-3">{info.desc}</p>
                    <ul className="space-y-2">
                        {info.recursos.map((r) => (
                            <li key={r} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Aviso de contato */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-700">
                            Para ativar este módulo, peça ao administrador para acessar o{' '}
                            <strong>Painel Admin</strong> e ativar sua permissão na tabela de usuários.
                        </p>
                    </div>
                </div>

                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:from-rose-600 hover:to-pink-600 transition shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Dashboard
                </Link>
            </div>
        </div>
    )
}
