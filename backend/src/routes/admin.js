require('dotenv').config()
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

const prisma = new PrismaClient()

const CAMPOS_USUARIO = {
    id: true, nome: true, nomeSalao: true, email: true, role: true,
    ativo: true, whatsappDono: true, corPrimaria: true,
    moduloAgendaAtivo: true, moduloFinanceiroAtivo: true, moduloWhatsappAtivo: true,
    createdAt: true,
    _count: { select: { clientes: true, agendamentos: true } },
}

router.use(auth, admin)

// GET /api/admin/usuarios
router.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await prisma.user.findMany({
            select: CAMPOS_USUARIO,
            orderBy: { createdAt: 'desc' },
        })
        res.json(usuarios)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar usuários', details: err.message })
    }
})

// POST /api/admin/usuarios — cadastrar novo salão/cliente
router.post('/usuarios', async (req, res) => {
    try {
        const { nome, nomeSalao, email, senha, whatsappDono } = req.body
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' })
        }
        const existente = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
        if (existente) {
            return res.status(409).json({ error: 'Já existe uma conta com este e-mail' })
        }
        const user = await prisma.user.create({
            data: {
                nome: nome.trim(),
                nomeSalao: (nomeSalao || nome).trim(),
                email: email.toLowerCase().trim(),
                senha: await bcrypt.hash(senha, 10),
                whatsappDono: whatsappDono?.replace(/\D/g, '') || '',
                role: 'USER',
                ativo: true,
                moduloAgendaAtivo: true,
            },
            select: CAMPOS_USUARIO,
        })
        res.status(201).json(user)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao cadastrar usuário', details: err.message })
    }
})

// PATCH /api/admin/usuarios/:id/toggle-ativo
router.patch('/usuarios/:id/toggle-ativo', async (req, res) => {
    try {
        const id = Number(req.params.id)
        if (id === req.usuario.id) {
            return res.status(400).json({ error: 'Você não pode desativar sua própria conta' })
        }
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

        const atualizado = await prisma.user.update({
            where: { id },
            data: { ativo: !user.ativo },
            select: CAMPOS_USUARIO,
        })
        res.json(atualizado)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar', details: err.message })
    }
})

// PATCH /api/admin/usuarios/:id/modulos
router.patch('/usuarios/:id/modulos', async (req, res) => {
    try {
        const id = Number(req.params.id)
        const { moduloAgendaAtivo, moduloFinanceiroAtivo, moduloWhatsappAtivo } = req.body
        const updateData = {}
        if (typeof moduloAgendaAtivo === 'boolean') updateData.moduloAgendaAtivo = moduloAgendaAtivo
        if (typeof moduloFinanceiroAtivo === 'boolean') updateData.moduloFinanceiroAtivo = moduloFinanceiroAtivo
        if (typeof moduloWhatsappAtivo === 'boolean') updateData.moduloWhatsappAtivo = moduloWhatsappAtivo

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Nenhum módulo especificado' })
        }
        const atualizado = await prisma.user.update({
            where: { id },
            data: updateData,
            select: CAMPOS_USUARIO,
        })
        res.json(atualizado)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar módulos', details: err.message })
    }
})

// PATCH /api/admin/usuarios/:id/role
router.patch('/usuarios/:id/role', async (req, res) => {
    try {
        const { role } = req.body
        if (!['USER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Role inválida' })
        }
        const atualizado = await prisma.user.update({
            where: { id: Number(req.params.id) },
            data: { role },
            select: CAMPOS_USUARIO,
        })
        res.json(atualizado)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar role', details: err.message })
    }
})

module.exports = router
