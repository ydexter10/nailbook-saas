const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const auth = require('../middleware/auth')

const prisma = new PrismaClient()

// Middleware: verificar autenticação + módulo financeiro ativo
const verificarModuloFinanceiro = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.usuario.id },
            select: { moduloFinanceiroAtivo: true },
        })
        if (!user?.moduloFinanceiroAtivo) {
            return res.status(403).json({
                error: 'Módulo não ativo',
                code: 'MODULE_FINANCEIRO_INATIVO',
                message: 'O Módulo Financeiro não está incluso no seu plano atual.',
            })
        }
        next()
    } catch (err) {
        res.status(500).json({ error: 'Erro ao verificar permissão de módulo' })
    }
}

router.use(auth, verificarModuloFinanceiro)

// GET /api/financeiro/resumo — totais do mês atual
router.get('/resumo', async (req, res) => {
    try {
        const agora = new Date()
        const anoMes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`

        const transacoes = await prisma.transacao.findMany({
            where: {
                usuarioId: req.usuario.id,
                data: { startsWith: anoMes },
            },
        })

        const totalReceitas = transacoes
            .filter(t => t.tipo === 'RECEITA')
            .reduce((s, t) => s + t.valor, 0)

        const totalDespesas = transacoes
            .filter(t => t.tipo === 'DESPESA')
            .reduce((s, t) => s + t.valor, 0)

        // Agendamentos confirmados do mês como receitas potenciais
        const agendamentos = await prisma.agendamento.findMany({
            where: {
                usuarioId: req.usuario.id,
                status: 'CONFIRMADO',
                data: { startsWith: anoMes },
                transacao: null, // sem lançamento ainda
            },
            include: { cliente: true },
        })

        res.json({
            anoMes,
            totalReceitas,
            totalDespesas,
            saldo: totalReceitas - totalDespesas,
            quantidadeTransacoes: transacoes.length,
            agendamentosSemLancamento: agendamentos.map(a => ({
                id: a.id,
                cliente: a.cliente.nome,
                nomeServico: a.nomeServico,
                valorServico: a.valorServico,
                data: a.data,
                hora: a.hora,
            })),
        })
    } catch (err) {
        res.status(500).json({ error: 'Erro ao calcular resumo', details: err.message })
    }
})

// GET /api/financeiro/transacoes — listar com filtros
router.get('/transacoes', async (req, res) => {
    try {
        const { tipo, mes, categoria } = req.query
        const where = { usuarioId: req.usuario.id }
        if (tipo) where.tipo = tipo
        if (mes) where.data = { startsWith: mes } // YYYY-MM
        if (categoria) where.categoria = categoria

        const transacoes = await prisma.transacao.findMany({
            where,
            include: { agendamento: { include: { cliente: true } } },
            orderBy: [{ data: 'desc' }, { createdAt: 'desc' }],
        })
        res.json(transacoes)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar transações', details: err.message })
    }
})

// POST /api/financeiro/transacoes — criar transação manual
router.post('/transacoes', async (req, res) => {
    try {
        const { tipo, descricao, valor, data, categoria, agendamentoId } = req.body
        if (!tipo || !descricao || !valor || !data) {
            return res.status(400).json({ error: 'Tipo, descrição, valor e data são obrigatórios' })
        }
        if (!['RECEITA', 'DESPESA'].includes(tipo)) {
            return res.status(400).json({ error: 'Tipo deve ser RECEITA ou DESPESA' })
        }

        // Se vincular a agendamento, verificar que pertence ao usuário
        if (agendamentoId) {
            const ag = await prisma.agendamento.findFirst({
                where: { id: Number(agendamentoId), usuarioId: req.usuario.id },
            })
            if (!ag) return res.status(404).json({ error: 'Agendamento não encontrado' })
        }

        const transacao = await prisma.transacao.create({
            data: {
                tipo,
                descricao: descricao.trim(),
                valor: Number(valor),
                data,
                categoria: categoria?.trim() || 'Geral',
                usuarioId: req.usuario.id,
                agendamentoId: agendamentoId ? Number(agendamentoId) : undefined,
            },
            include: { agendamento: { include: { cliente: true } } },
        })
        res.status(201).json(transacao)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar transação', details: err.message })
    }
})

// POST /api/financeiro/transacoes/agendamento/:id — lançar agendamento como receita
router.post('/transacoes/agendamento/:id', async (req, res) => {
    try {
        const agId = Number(req.params.id)
        const agendamento = await prisma.agendamento.findFirst({
            where: { id: agId, usuarioId: req.usuario.id },
            include: { cliente: true },
        })
        if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' })

        const jaLancado = await prisma.transacao.findUnique({ where: { agendamentoId: agId } })
        if (jaLancado) return res.status(409).json({ error: 'Este agendamento já foi lançado no financeiro' })

        const transacao = await prisma.transacao.create({
            data: {
                tipo: 'RECEITA',
                descricao: `${agendamento.nomeServico} — ${agendamento.cliente.nome}`,
                valor: agendamento.valorServico,
                data: agendamento.data,
                categoria: 'Serviço',
                usuarioId: req.usuario.id,
                agendamentoId: agId,
            },
            include: { agendamento: { include: { cliente: true } } },
        })
        res.status(201).json(transacao)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao lançar agendamento', details: err.message })
    }
})

// DELETE /api/financeiro/transacoes/:id
router.delete('/transacoes/:id', async (req, res) => {
    try {
        const existente = await prisma.transacao.findFirst({
            where: { id: Number(req.params.id), usuarioId: req.usuario.id },
        })
        if (!existente) return res.status(404).json({ error: 'Transação não encontrada' })

        await prisma.transacao.delete({ where: { id: Number(req.params.id) } })
        res.json({ message: 'Transação removida com sucesso' })
    } catch (err) {
        res.status(500).json({ error: 'Erro ao remover transação', details: err.message })
    }
})

module.exports = router
