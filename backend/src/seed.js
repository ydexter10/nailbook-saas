const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    console.log('🌸 Populando banco de dados NailBook v2...')

    // ============================
    // 1. Criar usuário ADMIN
    // ============================
    const senhaAdminHash = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nailbook.com' },
        update: {},
        create: {
            nome: 'Super Admin',
            email: 'admin@nailbook.com',
            senha: senhaAdminHash,
            role: 'ADMIN',
            ativo: true,
        },
    })

    // ============================
    // 2. Criar usuário de teste (manicure)
    // ============================
    const senhaUserHash = await bcrypt.hash('manicure123', 10)
    const userTeste = await prisma.user.upsert({
        where: { email: 'ana@nailbook.com' },
        update: {},
        create: {
            nome: 'Ana Paula Salão',
            email: 'ana@nailbook.com',
            senha: senhaUserHash,
            role: 'USER',
            ativo: true,
        },
    })

    // ============================
    // 3. Criar profissionais para o usuário de teste
    // ============================
    let ana = await prisma.profissional.findFirst({ where: { nome: 'Ana Paula', usuarioId: userTeste.id } })
    if (!ana) {
        ana = await prisma.profissional.create({
            data: {
                nome: 'Ana Paula',
                especialidade: 'Manicure & Pedicure',
                usuarioId: userTeste.id,
                horariosTrabalho: JSON.stringify(['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']),
            },
        })
    }

    let jessica = await prisma.profissional.findFirst({ where: { nome: 'Jéssica Lima', usuarioId: userTeste.id } })
    if (!jessica) {
        jessica = await prisma.profissional.create({
            data: {
                nome: 'Jéssica Lima',
                especialidade: 'Nail Designer',
                usuarioId: userTeste.id,
                horariosTrabalho: JSON.stringify(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']),
            },
        })
    }

    // ============================
    // 4. Criar clientes para o usuário de teste
    // ============================
    const clientesData = [
        { nome: 'Maria Silva', whatsapp: '11999991111' },
        { nome: 'Joana Santos', whatsapp: '11988882222' },
        { nome: 'Carla Oliveira', whatsapp: '11977773333' },
    ]

    const clientes = []
    for (const c of clientesData) {
        let cliente = await prisma.cliente.findFirst({ where: { whatsapp: c.whatsapp, usuarioId: userTeste.id } })
        if (!cliente) {
            cliente = await prisma.cliente.create({ data: { ...c, usuarioId: userTeste.id } })
        }
        clientes.push(cliente)
    }
    const [maria, joana, carla] = clientes

    // ============================
    // 5. Criar agendamentos de hoje
    // ============================
    const hoje = new Date().toISOString().split('T')[0]
    const agendamentosHoje = await prisma.agendamento.findMany({ where: { data: hoje, usuarioId: userTeste.id } })
    if (agendamentosHoje.length === 0) {
        await prisma.agendamento.create({ data: { data: hoje, hora: '09:00', nomeServico: 'Manicure Gel', valorServico: 65.0, status: 'CONFIRMADO', clienteId: maria.id, profissionalId: ana.id, usuarioId: userTeste.id } })
        await prisma.agendamento.create({ data: { data: hoje, hora: '10:00', nomeServico: 'Pedicure Simples', valorServico: 45.0, status: 'CONFIRMADO', clienteId: joana.id, profissionalId: ana.id, usuarioId: userTeste.id } })
        await prisma.agendamento.create({ data: { data: hoje, hora: '14:00', nomeServico: 'Nail Art Completo', valorServico: 120.0, status: 'PENDENTE', clienteId: carla.id, profissionalId: jessica.id, usuarioId: userTeste.id } })
        await prisma.agendamento.create({ data: { data: hoje, hora: '16:00', nomeServico: 'Esmaltação em Gel', valorServico: 80.0, status: 'CONFIRMADO', clienteId: maria.id, profissionalId: jessica.id, usuarioId: userTeste.id } })
        console.log('   📅 4 agendamentos de hoje criados')
    } else {
        console.log('   📅 Agendamentos de hoje já existem, pulando...')
    }

    console.log('\n✅ Dados iniciais criados com sucesso!')
    console.log('\n🔑 CREDENCIAIS DE ACESSO:')
    console.log('   👑 Admin: admin@nailbook.com / admin123')
    console.log('   💅 Manicure: ana@nailbook.com / manicure123')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
