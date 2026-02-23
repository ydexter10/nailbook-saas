const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'nailbook_secret_2026_muito_seguro'

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' })
    }

    const token = authHeader.split(' ')[1]
    try {
        const payload = jwt.verify(token, JWT_SECRET)
        req.usuario = payload // { id, nome, email, role }
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' })
    }
}
