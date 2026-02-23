const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const auth = require('../middleware/auth')

const prisma = new PrismaClient()

router.use(auth)

// GET /api/configuracoes — retorna configurações do usuário logado
router.get('/', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.usuario.id },
            select: {
                id: true, nome: true, nomeSalao: true, email: true,
                whatsappDono: true, corPrimaria: true, logoBase64: true,
                moduloAgendaAtivo: true, moduloFinanceiroAtivo: true, moduloWhatsappAtivo: true,
            },
        })
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
        res.json(user)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar configurações', details: err.message })
    }
})

// PATCH /api/configuracoes — atualizar perfil/white label
router.patch('/', async (req, res) => {
    try {
        const { nomeSalao, whatsappDono, corPrimaria, logoBase64 } = req.body
        const updateData = {}

        if (nomeSalao !== undefined) updateData.nomeSalao = nomeSalao.trim()
        if (whatsappDono !== undefined) updateData.whatsappDono = whatsappDono.replace(/\D/g, '')
        if (corPrimaria !== undefined) {
            // Validar que é uma cor hex válida
            if (!/^#[0-9A-Fa-f]{6}$/.test(corPrimaria)) {
                return res.status(400).json({ error: 'Cor inválida. Use formato hex (#RRGGBB)' })
            }
            updateData.corPrimaria = corPrimaria
        }
        if (logoBase64 !== undefined) {
            // Aceitar string vazia (remover logo) ou string base64 válida
            if (logoBase64 !== '' && !logoBase64.startsWith('data:image/')) {
                return res.status(400).json({ error: 'Logo inválida. Envie uma imagem em base64.' })
            }
            updateData.logoBase64 = logoBase64
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar' })
        }

        const atualizado = await prisma.user.update({
            where: { id: req.usuario.id },
            data: updateData,
            select: {
                id: true, nome: true, nomeSalao: true, whatsappDono: true,
                corPrimaria: true, logoBase64: true,
                moduloAgendaAtivo: true, moduloFinanceiroAtivo: true, moduloWhatsappAtivo: true,
            },
        })
        res.json(atualizado)
    } catch (err) {
        res.status(500).json({ error: 'Erro ao salvar configurações', details: err.message })
    }
})

module.exports = router
