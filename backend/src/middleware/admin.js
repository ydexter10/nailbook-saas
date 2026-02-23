module.exports = (req, res, next) => {
    if (!req.usuario || req.usuario.role !== 'ADMIN') {
        return res.status(403).json({
            error: 'Acesso negado. Esta rota é exclusiva para administradores.',
        })
    }
    next()
}
