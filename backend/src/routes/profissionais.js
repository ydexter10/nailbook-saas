const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const auth = require('../middleware/auth')

const prisma = new PrismaClient()

router.use(auth)

// GET /api/profissionais
router.get('/', async (req, res) => {
    try {
        const profissionais = await prisma.profissional.findMany({
            where: { usuarioId: req.usuario.id },
            orderBy: { nome: 'asc' },
        })
        res.json(profissionais)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar profissionais', details: err.message })
    }
})

// GET /api/profissionais/:id
router.get('/:id', async (req, res) => {
    try {
        const profissional = await prisma.profissional.findFirst({
            where: { id: Number(req.params.id), usuarioId: req.usuario.id },
            include: { agendamentos: true },
        })
        if (!profissional) return res.status(404).json({ error: 'Profissional não encontrada' })
        res.json(profissional)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar profissional', details: err.message })
    }
})

// POST /api/profissionais
router.post('/', async (req, res) => {
    try {
        const { nome, especialidade, horariosTrabalho } = req.body
        if (!nome || !especialidade) {
            return res.status(400).json({ error: 'Nome e especialidade são obrigatórios' })
        }

        const profissional = await prisma.profissional.create({
            data: {
                nome: nome.trim(),
                especialidade: especialidade.trim(),
                usuarioId: req.usuario.id,
                horariosTrabalho: horariosTrabalho
                    ? JSON.stringify(horariosTrabalho)
                    : JSON.stringify(['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']),
            },
        })
        res.status(201).json(profissional)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao cadastrar profissional', details: err.message })
    }
})

// PUT /api/profissionais/:id
router.put('/:id', async (req, res) => {
    try {
        const profissional = await prisma.profissional.findFirst({
            where: { id: Number(req.params.id), usuarioId: req.usuario.id },
        })
        if (!profissional) return res.status(404).json({ error: 'Profissional não encontrada' })

        const { nome, especialidade, horariosTrabalho } = req.body
        const atualizado = await prisma.profissional.update({
            where: { id: Number(req.params.id) },
            data: {
                nome,
                especialidade,
                horariosTrabalho: horariosTrabalho ? JSON.stringify(horariosTrabalho) : undefined,
            },
        })
        res.json(atualizado)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar profissional', details: err.message })
    }
})

module.exports = router
