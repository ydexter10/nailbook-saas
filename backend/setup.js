/**
 * setup.js — Script de inicialização idempotente do NailBook
 * 
 * Executa:
 *   1. Sincroniza o schema Prisma com o banco (db push)
 *   2. Cria o usuário Admin padrão se não existir
 * 
 * Pode ser rodado quantas vezes quiser com segurança.
 * 
 * Uso: node setup.js
 */

require('dotenv').config()
const { execSync } = require('child_process')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setup() {
    console.log('\n🌸 NailBook — Setup de Inicialização\n')

    // 1. Sincronizar banco de dados
    console.log('📦 Sincronizando banco de dados...')
    try {
        execSync('npx prisma db push --skip-generate', { stdio: 'inherit', cwd: __dirname })
        execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname })
        console.log('✅ Banco sincronizado!\n')
    } catch (err) {
        console.error('❌ Erro ao sincronizar banco:', err.message)
        process.exit(1)
    }

    // 2. Criar Admin padrão se não existir
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nailbook.com'
    const adminSenha = process.env.ADMIN_SENHA || 'admin123'

    const adminExistente = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (adminExistente) {
        console.log(`ℹ️  Admin já existe: ${adminEmail}`)
    } else {
        const senhaHash = await bcrypt.hash(adminSenha, 10)
        await prisma.user.create({
            data: {
                nome: 'Super Admin',
                nomeSalao: 'NailBook Admin',
                email: adminEmail,
                senha: senhaHash,
                role: 'ADMIN',
                ativo: true,
                moduloAgendaAtivo: true,
                moduloFinanceiroAtivo: true,
                moduloWhatsappAtivo: true,
            },
        })
        console.log(`✅ Admin criado: ${adminEmail} / ${adminSenha}`)
    }

    // 3. Resumo do banco
    const [users, clientes, agendamentos] = await Promise.all([
        prisma.user.count(),
        prisma.cliente.count(),
        prisma.agendamento.count(),
    ])

    console.log('\n📊 Estado atual do banco:')
    console.log(`   👤 Usuários:       ${users}`)
    console.log(`   💅 Clientes:       ${clientes}`)
    console.log(`   📅 Agendamentos:   ${agendamentos}`)
    console.log('\n🚀 Setup completo! Inicie o servidor com: npm run dev\n')

    await prisma.$disconnect()
}

setup().catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})
