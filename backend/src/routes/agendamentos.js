const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const auth = require('../middleware/auth')

const prisma = new PrismaClient()

// ⚡ Rota pública para serviço de lembrete (WhatsApp bot pode chamar sem auth)
// GET /api/agendamentos/pendentes-lembrete
router.get('/pendentes-lembrete', async (req, res) => {
    try {
        const agora = new Date()
        const em24h = new Date(agora.getTime() + 24 * 60 * 60 * 1000)
        const dataHoje = agora.toISOString().split('T')[0]
        const dataAmanha = em24h.toISOString().split('T')[0]

        // Hora atual e hora daqui a 24h (em HH:MM)
        const horaAgora = agora.toTimeString().slice(0, 5)
        const horaLimite = em24h.toTimeString().slice(0, 5)

        let whereClause
        if (dataHoje === dataAmanha) {
            // Mesmo dia
            whereClause = {
                status: 'CONFIRMADO',
                lembreteEnviado: false,
                data: dataHoje,
                hora: { gte: horaAgora, lte: horaLimite },
            }
        } else {
            // Atravessa meia-noite
            whereClause = {
                status: 'CONFIRMADO',
                lembreteEnviado: false,
                OR: [
                    { data: dataHoje, hora: { gte: horaAgora } },
                    { data: dataAmanha, hora: { lte: horaLimite } },
                ],
            }
        }

        const agendamentos = await prisma.agendamento.findMany({
            where: whereClause,
            include: { cliente: true, profissional: true },
            orderBy: [{ data: 'asc' }, { hora: 'asc' }],
        })
        res.json({ total: agendamentos.length, agendamentos })
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar pendentes de lembrete', details: err.message })
    }
})

// PATCH /api/agendamentos/:id/lembrete — marcar lembrete como enviado
router.patch('/:id/lembrete', async (req, res) => {
    try {
        const agendamento = await prisma.agendamento.update({
            where: { id: Number(req.params.id) },
            data: {
                lembreteEnviado: true,
                dataLembrete: new Date().toISOString(),
            },
        })
        res.json(agendamento)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao marcar lembrete', details: err.message })
    }
})

// ==== ROTAS AUTENTICADAS ====
router.use(auth)

// GET /api/agendamentos — com filtros opcionais
router.get('/', async (req, res) => {
    try {
        const { data, profissionalId, status } = req.query
        const where = { usuarioId: req.usuario.id }
        if (data) where.data = data
        if (profissionalId) where.profissionalId = Number(profissionalId)
        if (status) where.status = status

        const agendamentos = await prisma.agendamento.findMany({
            where,
            include: { cliente: true, profissional: true },
            orderBy: [{ data: 'asc' }, { hora: 'asc' }],
        })
        res.json(agendamentos)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar agendamentos', details: err.message })
    }
})

// GET /api/agendamentos/hoje
router.get('/hoje', async (req, res) => {
    try {
        const hoje = new Date().toISOString().split('T')[0]
        const agendamentos = await prisma.agendamento.findMany({
            where: { data: hoje, usuarioId: req.usuario.id },
            include: { cliente: true, profissional: true },
            orderBy: { hora: 'asc' },
        })
        res.json(agendamentos)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar agendamentos de hoje', details: err.message })
    }
})

// GET /api/agendamentos/:id
router.get('/:id', async (req, res) => {
    try {
        const agendamento = await prisma.agendamento.findFirst({
            where: { id: Number(req.params.id), usuarioId: req.usuario.id },
            include: { cliente: true, profissional: true },
        })
        if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' })
        res.json(agendamento)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar agendamento', details: err.message })
    }
})

// POST /api/agendamentos — criar com validação de conflito
router.post('/', async (req, res) => {
    try {
        const { data, hora, valorServico, nomeServico, clienteId, profissionalId } = req.body
        if (!data || !hora || !valorServico || !nomeServico || !clienteId || !profissionalId) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
        }

        // 🔒 Validação de conflito de horário (escopo do usuário)
        const conflito = await prisma.agendamento.findFirst({
            where: {
                usuarioId: req.usuario.id,
                profissionalId: Number(profissionalId),
                data,
                hora,
                status: 'CONFIRMADO',
            },
        })
        if (conflito) {
            return res.status(409).json({
                error: 'Conflito de horário',
                message: `Já existe um agendamento confirmado para esta profissional em ${data} às ${hora}. Escolha outro horário.`,
            })
        }

        // Verificar se cliente e profissional pertencem ao usuário
        const [cliente, profissional] = await Promise.all([
            prisma.cliente.findFirst({ where: { id: Number(clienteId), usuarioId: req.usuario.id } }),
            prisma.profissional.findFirst({ where: { id: Number(profissionalId), usuarioId: req.usuario.id } }),
        ])
        if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' })
        if (!profissional) return res.status(404).json({ error: 'Profissional não encontrada' })

        const agendamento = await prisma.agendamento.create({
            data: {
                data, hora,
                valorServico: Number(valorServico),
                nomeServico: nomeServico.trim(),
                clienteId: Number(clienteId),
                profissionalId: Number(profissionalId),
                usuarioId: req.usuario.id,
                status: 'CONFIRMADO',
            },
            include: { cliente: true, profissional: true },
        })
        res.status(201).json(agendamento)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar agendamento', details: err.message })
    }
})

// PATCH /api/agendamentos/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body
        const statusValidos = ['CONFIRMADO', 'CANCELADO', 'PENDENTE']
        if (!statusValidos.includes(status)) {
            return res.status(400).json({ error: 'Status inválido' })
        }
        const existente = await prisma.agendamento.findFirst({
            where: { id: Number(req.params.id), usuarioId: req.usuario.id },
        })
        if (!existente) return res.status(404).json({ error: 'Agendamento não encontrado' })

        const agendamento = await prisma.agendamento.update({
            where: { id: Number(req.params.id) },
            data: { status },
            include: { cliente: true, profissional: true },
        })
        res.json(agendamento)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar status', details: err.message })
    }
})

// DELETE /api/agendamentos/:id
router.delete('/:id', async (req, res) => {
    try {
        const existente = await prisma.agendamento.findFirst({
            where: { id: Number(req.params.id), usuarioId: req.usuario.id },
        })
        if (!existente) return res.status(404).json({ error: 'Agendamento não encontrado' })

        await prisma.agendamento.delete({ where: { id: Number(req.params.id) } })
        res.json({ message: 'Agendamento removido com sucesso' })
    } catch (err) {
        res.status(500).json({ error: 'Erro ao remover agendamento', details: err.message })
    }
})

module.exports = router
