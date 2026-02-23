// Dev local apenas — a Vercel usa api/index.js
require('dotenv').config()
const app = require('./app')

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`\n🌸 NailBook Backend v4 — http://localhost:${PORT}`)
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`)
  console.log(`👑 Admin: http://localhost:${PORT}/api/admin`)
  console.log(`⚙️  Config: http://localhost:${PORT}/api/configuracoes\n`)
})
