require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()

// CORS — em produção, definir CORS_ORIGIN com a URL da Vercel
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174']

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json({ limit: '5mb' }))

// Rotas
app.use('/api/auth', require('./routes/auth'))
app.use('/api/clientes', require('./routes/clientes'))
app.use('/api/profissionais', require('./routes/profissionais'))
app.use('/api/agendamentos', require('./routes/agendamentos'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/financeiro', require('./routes/financeiro'))
app.use('/api/configuracoes', require('./routes/configuracoes'))

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', versao: '4.0', ambiente: process.env.NODE_ENV })
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message })
})

module.exports = app
