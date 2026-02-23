const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const auth = require('../middleware/auth')

const prisma = new PrismaClient()

router.use(auth) // Todas as rotas protegidas

// GET /api/clientes
router.get('/', async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany({
            where: { usuarioId: req.usuario.id },
            orderBy: { nome: 'asc' },
            include: {
                agendamentos: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        })
        res.json(clientes)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar clientes', details: err.message })
    }
})

// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
    try {
        const cliente = await prisma.cliente.findFirst({
            where: { id: Number(req.params.id), usuarioId: req.usuario.id },
            include: {
                agendamentos: {
                    include: { profissional: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })
        if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' })
        res.json(cliente)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar cliente', details: err.message })
    }
})

// POST /api/clientes
router.post('/', async (req, res) => {
    try {
        const { nome, whatsapp } = req.body
        if (!nome || !whatsapp) {
            return res.status(400).json({ error: 'Nome e WhatsApp são obrigatórios' })
        }
        const wSoDigitos = whatsapp.replace(/\D/g, '')
        if (wSoDigitos.length < 10 || wSoDigitos.length > 11) {
            return res.status(400).json({ error: 'WhatsApp inválido. Use o formato com DDD (ex: 11999990000)' })
        }

        const existente = await prisma.cliente.findFirst({
            where: { whatsapp: wSoDigitos, usuarioId: req.usuario.id },
        })
        if (existente) {
            return res.status(409).json({ error: 'Já existe uma cliente com esse WhatsApp na sua conta' })
        }

        const cliente = await prisma.cliente.create({
            data: { nome: nome.trim(), whatsapp: wSoDigitos, usuarioId: req.usuario.id },
        })
        res.status(201).json(cliente)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao cadastrar cliente', details: err.message })
    }
})

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
    try {
        const { nome, whatsapp } = req.body
        const cliente = await prisma.cliente.findFirst({
            where: { id: Number(req.params.id), usuarioId: req.usuario.id },
        })
        if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' })

        const atualizado = await prisma.cliente.update({
            where: { id: Number(req.params.id) },
            data: { nome, whatsapp: whatsapp?.replace(/\D/g, '') },
        })
        res.json(atualizado)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar cliente', details: err.message })
    }
})

module.exports = router
