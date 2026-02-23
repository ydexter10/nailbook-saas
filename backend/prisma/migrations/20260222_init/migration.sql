-- NailBook — Migration Inicial para PostgreSQL
-- Gerada manualmente para deploy no Railway

CREATE TABLE "User" (
    "id"                    SERIAL PRIMARY KEY,
    "nome"                  TEXT NOT NULL,
    "email"                 TEXT NOT NULL UNIQUE,
    "senha"                 TEXT NOT NULL,
    "role"                  TEXT NOT NULL DEFAULT 'USER',
    "ativo"                 BOOLEAN NOT NULL DEFAULT true,
    "nomeSalao"             TEXT NOT NULL DEFAULT '',
    "whatsappDono"          TEXT NOT NULL DEFAULT '',
    "corPrimaria"           TEXT NOT NULL DEFAULT '#f43f5e',
    "logoBase64"            TEXT NOT NULL DEFAULT '',
    "moduloAgendaAtivo"     BOOLEAN NOT NULL DEFAULT true,
    "moduloFinanceiroAtivo" BOOLEAN NOT NULL DEFAULT false,
    "moduloWhatsappAtivo"   BOOLEAN NOT NULL DEFAULT false,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Cliente" (
    "id"        SERIAL PRIMARY KEY,
    "nome"      TEXT NOT NULL,
    "whatsapp"  TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT,
    CONSTRAINT "Cliente_whatsapp_usuarioId_key" UNIQUE ("whatsapp", "usuarioId")
);

CREATE TABLE "Profissional" (
    "id"               SERIAL PRIMARY KEY,
    "nome"             TEXT NOT NULL,
    "especialidade"    TEXT NOT NULL,
    "horariosTrabalho" TEXT NOT NULL DEFAULT '["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"]',
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId"        INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Profissional_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT
);

CREATE TABLE "Agendamento" (
    "id"              SERIAL PRIMARY KEY,
    "data"            TEXT NOT NULL,
    "hora"            TEXT NOT NULL,
    "status"          TEXT NOT NULL DEFAULT 'CONFIRMADO',
    "valorServico"    DOUBLE PRECISION NOT NULL,
    "nomeServico"     TEXT NOT NULL,
    "lembreteEnviado" BOOLEAN NOT NULL DEFAULT false,
    "dataLembrete"    TEXT,
    "clienteId"       INTEGER NOT NULL,
    "profissionalId"  INTEGER NOT NULL,
    "usuarioId"       INTEGER NOT NULL DEFAULT 1,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Agendamento_clienteId_fkey"      FOREIGN KEY ("clienteId")      REFERENCES "Cliente"("id") ON DELETE RESTRICT,
    CONSTRAINT "Agendamento_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT,
    CONSTRAINT "Agendamento_usuarioId_fkey"      FOREIGN KEY ("usuarioId")      REFERENCES "User"("id") ON DELETE RESTRICT
);

CREATE TABLE "Transacao" (
    "id"            SERIAL PRIMARY KEY,
    "tipo"          TEXT NOT NULL,
    "descricao"     TEXT NOT NULL,
    "valor"         DOUBLE PRECISION NOT NULL,
    "data"          TEXT NOT NULL,
    "categoria"     TEXT NOT NULL DEFAULT 'Geral',
    "usuarioId"     INTEGER NOT NULL,
    "agendamentoId" INTEGER UNIQUE,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transacao_usuarioId_fkey"     FOREIGN KEY ("usuarioId")     REFERENCES "User"("id") ON DELETE RESTRICT,
    CONSTRAINT "Transacao_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE SET NULL
);
