require('dotenv').config()
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'nailbook_fallback_secret'
const JWT_EXPIRES = '7d'

const CAMPOS_USUARIO = {
    id: true, nome: true, nomeSalao: true, email: true, role: true,
    ativo: true, whatsappDono: true, corPrimaria: true, logoBase64: true,
    moduloAgendaAtivo: true, moduloFinanceiroAtivo: true, moduloWhatsappAtivo: true,
}

function gerarToken(user) {
    // ⚠️ logoBase64 NÃO entra no token — pode ter vários KB/MB e causa HTTP 431
    return jwt.sign({
        id: user.id, nome: user.nome, nomeSalao: user.nomeSalao,
        email: user.email, role: user.role,
        corPrimaria: user.corPrimaria,
        moduloAgendaAtivo: user.moduloAgendaAtivo,
        moduloFinanceiroAtivo: user.moduloFinanceiroAtivo,
        moduloWhatsappAtivo: user.moduloWhatsappAtivo,
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { nome, nomeSalao, email, senha } = req.body
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
        }
        if (senha.length < 6) {
            return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' })
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
                role: 'USER',
            },
            select: CAMPOS_USUARIO,
        })
        res.status(201).json({ token: gerarToken(user), usuario: user })
    } catch (err) {
        res.status(500).json({ error: 'Erro ao registrar', details: err.message })
    }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body
        if (!email || !senha) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' })

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
        if (!user) return res.status(401).json({ error: 'E-mail ou senha incorretos' })
        if (!user.ativo) return res.status(403).json({ error: 'Conta desativada. Entre em contato com o administrador.' })

        const senhaValida = await bcrypt.compare(senha, user.senha)
        if (!senhaValida) return res.status(401).json({ error: 'E-mail ou senha incorretos' })

        const usuario = await prisma.user.findUnique({ where: { id: user.id }, select: CAMPOS_USUARIO })
        res.json({ token: gerarToken(usuario), usuario })
    } catch (err) {
        res.status(500).json({ error: 'Erro ao fazer login', details: err.message })
    }
})

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.usuario.id },
            select: { ...CAMPOS_USUARIO, ativo: true, createdAt: true },
        })
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
        res.json(user)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar perfil' })
    }
})

module.exports = router
