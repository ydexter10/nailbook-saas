import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

/**
 * useWhatsApp — hook centralizado para envio de lembretes via WhatsApp
 *
 * Retorna:
 *   enviarLembrete(ag) — abre wa.me com mensagem personalizada
 *   enviados          — Set<id> com IDs dos agendamentos já lembrados
 */
export function useWhatsApp() {
    const { usuario } = useAuth()
    const [enviados, setEnviados] = useState(new Set())

    const enviarLembrete = useCallback((ag) => {
        const num = ag.cliente?.whatsapp?.replace(/\D/g, '')

        if (!num) {
            toast.error('Esta cliente não tem WhatsApp cadastrado.')
            return
        }

        const nomeSalao = usuario?.nomeSalao || usuario?.nome || 'nosso salão'
        const nomeProfissional = ag.profissional?.nome || 'nossa profissional'
        const dataFormatada = ag.data.split('-').reverse().join('/')

        const mensagem =
            `Olá ${ag.cliente.nome}! 😊 Lembrando do seu *${ag.nomeServico}* ` +
            `no *${nomeSalao}* para o dia *${dataFormatada}* às *${ag.hora}* ` +
            `com ${nomeProfissional}. Podemos confirmar? 💅✨`

        window.open(`https://wa.me/55${num}?text=${encodeURIComponent(mensagem)}`, '_blank')

        setEnviados(prev => new Set([...prev, ag.id]))
        toast.success(`Lembrete aberto para ${ag.cliente.nome}!`)
    }, [usuario])

    return { enviarLembrete, enviados }
}
