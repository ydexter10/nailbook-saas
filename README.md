# NailBook — Guia de Deploy

## Arquitetura de Produção

```
[Navegador] → Vercel (React/Vite) → Railway (Express/Prisma) → PostgreSQL (Railway)
```

---

## 1. Backend → Railway

### Pré-requisitos
- Conta em [railway.app](https://railway.app) (plano Hobby — $5/mês com créditos iniciais gratuitos)
- Código no GitHub

### Passo a Passo

#### 1.1 — Criar Projeto no Railway
1. Acesse [railway.app/new](https://railway.app/new)
2. Clique em **Deploy from GitHub repo**
3. Selecione o repositório e aponte para a pasta `backend` (ou o root se for um repositório só do backend)
4. O Railway detecta Node.js automaticamente

#### 1.2 — Adicionar PostgreSQL
1. No projeto Railway, clique em **+ New Service → Database → Add PostgreSQL**
2. Após criar, clique no serviço PostgreSQL → aba **Variables**
3. Copie o valor de `DATABASE_URL`

#### 1.3 — Configurar Variáveis de Ambiente
No serviço do backend, aba **Variables**, adicione:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | (colado do passo 1.2) |
| `JWT_SECRET` | string aleatória longa |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://SEU-APP.vercel.app` |

#### 1.4 — Criar Banco e Admin Padrão
No Railway, acesse o serviço → **Deploy** → clique em **Shell** e execute:
```bash
npx prisma migrate deploy
node setup.js
```

#### 1.5 — Copiar a URL pública do backend
No Railway, aba **Settings → Domains** → copie a URL gerada (ex: `https://nailbook-backend.railway.app`)

---

## 2. Frontend → Vercel

### Passo a Passo

#### 2.1 — Criar Projeto na Vercel
1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository**
3. Selecione o repositório e aponte para a pasta `frontend`
4. Framework Preset: **Vite** (detectado automaticamente)

#### 2.2 — Configurar Variável de Ambiente
Na tela de configuração (ou depois em Settings → Environment Variables):

| Variável | Valor |
|---|---|
| `VITE_API_URL` | `https://SEU-BACKEND.railway.app/api` |

#### 2.3 — Deploy
Clique em **Deploy**. A Vercel executa `vite build` automaticamente.

---

## 3. Credenciais Padrão

Após rodar `node setup.js` no Railway:

| Conta | E-mail | Senha |
|---|---|---|
| 👑 Super Admin | `admin@nailbook.com` | `admin123` |

> ⚠️ **Troque a senha do admin imediatamente após o primeiro acesso!**

---

## 4. Desenvolvimento Local

```bash
# Backend
cd backend
cp .env.example .env      # edite com seus valores locais
npm install
node setup.js             # cria banco SQLite + admin
npm run dev               # http://localhost:3001

# Frontend (outro terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

> Para development local, o `DATABASE_URL` deve ser `file:./dev.db` (SQLite).
> O schema Prisma em produção usa PostgreSQL — se quiser usar SQLite localmente,
> crie um `.env` separado e lembre de **não commitar**.

---

## 5. Estrutura do Projeto

```
programacao/
├── backend/          → Railway (Node.js + Express + Prisma)
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── server.js
│   │   └── routes/
│   ├── setup.js
│   ├── .env.example
│   └── package.json
│
└── frontend/         → Vercel (React + Vite + TailwindCSS)
    ├── src/
    ├── vercel.json   ← roteamento SPA
    ├── .env.example
    └── package.json
```
