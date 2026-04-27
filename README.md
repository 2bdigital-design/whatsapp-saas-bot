# WhatsApp SaaS Bot

Bot WhatsApp multi-tenant 100% treinável — Node.js + Fastify + OpenAI + Supabase + Next.js.

## Stack

| Camada | Tecnologia |
|---|---|
| WhatsApp | Evolution API |
| Backend | Node.js + Fastify + TypeScript |
| IA | OpenAI Assistants API (gpt-4o-mini) |
| Banco | Supabase (PostgreSQL + RLS) |
| Fila | BullMQ + Redis (Upstash) |
| Painel | Next.js 14 + Tailwind CSS |

## Deploy Gratuito

| Serviço | Plataforma | Custo |
|---|---|---|
| Backend + Evolution API | Railway | $5 crédito/mês grátis |
| Redis | Upstash | 10K cmd/dia grátis |
| Banco de dados | Supabase | 500 MB grátis |
| Painel Admin | Vercel | Grátis |

---

## Passo 1 — Supabase (Banco de Dados)

1. Acesse [supabase.com](https://supabase.com) → crie um projeto
2. Vá em **SQL Editor** → cole e execute o conteúdo de `supabase/schema.sql`
3. Anote:
   - **Project URL** (Settings → API → Project URL)
   - **Service Role Key** (Settings → API → service_role)
   - **Anon Key** (Settings → API → anon/public)

---

## Passo 2 — Upstash Redis (Fila)

1. Acesse [upstash.com](https://upstash.com) → crie uma conta → **Create Database**
2. Escolha **Global** e clique em criar
3. Na aba **Details**, copie a **Redis URL** (formato `rediss://default:xxxx@xxx.upstash.io:6379`)

---

## Passo 3 — Railway (Backend + Evolution API)

### 3.1 Conta e projeto
1. Acesse [railway.app](https://railway.app) → crie uma conta (GitHub)
2. Clique em **New Project** → **Empty Project**

### 3.2 Evolution API
1. Dentro do projeto, clique em **+ New Service** → **Docker Image**
2. Imagem: `atendai/evolution-api:latest`
3. Configure as variáveis de ambiente:

```
SERVER_URL=https://evolution-XXXXX.up.railway.app
AUTHENTICATION_API_KEY=SUA_CHAVE_EVOLUTION_AQUI
DATABASE_ENABLED=false
REDIS_ENABLED=true
REDIS_URI=rediss://default:SENHA@HOST.upstash.io:6379
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=https://backend-XXXXX.up.railway.app/webhook/evolution
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false
CONFIG_SESSION_PHONE_VERSION=2.3000.1023204200
```

### 3.3 Backend Node.js
1. Clique em **+ New Service** → **GitHub Repo** (faça fork/push deste projeto)
2. Configure o **Root Directory** como `backend/`
3. Configure as variáveis de ambiente:

```
PORT=3000
NODE_ENV=production
EVOLUTION_API_URL=https://evolution-XXXXX.up.railway.app
EVOLUTION_API_KEY=SUA_CHAVE_EVOLUTION_AQUI
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxxx...
OPENAI_API_KEY=sk-proj-xxxx
REDIS_URL=rediss://default:SENHA@HOST.upstash.io:6379
WEBHOOK_SECRET=gere_uma_chave_aleatoria
INTERNAL_SECRET=gere_outra_chave_aleatoria
PANEL_URL=https://seu-painel.vercel.app
```

4. Anote a URL do backend gerada pelo Railway.

---

## Passo 4 — Vercel (Painel Admin)

1. Acesse [vercel.com](https://vercel.com) → faça login com GitHub
2. Importe o repositório → defina o **Root Directory** como `painel/`
3. Configure as variáveis de ambiente:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
BACKEND_URL=https://backend-XXXXX.up.railway.app
INTERNAL_SECRET=mesma_chave_do_backend
NEXT_PUBLIC_BACKEND_URL=https://backend-XXXXX.up.railway.app
```

4. Clique em **Deploy**.

---

## Passo 5 — Testar o sistema

```bash
# 1. Verifique o backend
curl https://backend-XXXXX.up.railway.app/health

# 2. Verifique a Evolution API
curl https://evolution-XXXXX.up.railway.app

# 3. Acesse o painel, cadastre-se e escaneie o QR Code
```

---

## Desenvolvimento Local

```bash
# 1. Clone e instale dependências
cd backend && npm install
cd ../painel && npm install

# 2. Configure as variáveis
cp backend/.env.example backend/.env
cp painel/.env.example painel/.env.local
# Edite os dois arquivos com suas chaves

# 3. Suba Evolution API + Redis localmente
docker compose up -d evolution-api redis

# 4. Rode o backend
cd backend && npm run dev

# 5. Rode o painel (outra aba)
cd painel && npm run dev
# Acesse: http://localhost:3001
```

---

## Estrutura do Projeto

```
whatsapp-saas-bot/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Servidor Fastify
│   │   ├── routes/
│   │   │   ├── webhook.ts        # Recebe eventos Evolution API
│   │   │   ├── tenants.ts        # Onboarding + gestão de clientes
│   │   │   └── training.ts       # Upload de documentos
│   │   ├── services/
│   │   │   ├── openai.ts         # Assistants API
│   │   │   ├── evolution.ts      # Envio de mensagens WhatsApp
│   │   │   └── supabase.ts       # Queries de banco
│   │   └── queues/
│   │       ├── messageQueue.ts   # Fila BullMQ
│   │       └── worker.ts         # Processador de mensagens
│   └── Dockerfile
├── painel/
│   └── src/app/
│       ├── (auth)/               # Login e cadastro
│       ├── dashboard/            # Painel do cliente
│       └── master/               # Painel master (você)
├── supabase/
│   └── schema.sql                # Tabelas + RLS
└── docker-compose.yml            # Ambiente local
```

---

## Fluxo de uma mensagem

```
WhatsApp → Evolution API → POST /webhook/evolution
→ BullMQ (enfileira)
→ Worker: busca tenant no Supabase
→ OpenAI Assistants API (resposta contextualizada)
→ Evolution API → envia resposta no WhatsApp
→ Salva histórico no Supabase
```

---

## Monitoramento

- **Bull Board**: `https://backend-XXXXX.up.railway.app/admin/queues` — monitor de filas
- **UptimeRobot**: monitore `/health` gratuitamente em [uptimerobot.com](https://uptimerobot.com)
- **Supabase Logs**: app.supabase.com → seu projeto → Logs

---

## Custo Estimado por Cliente

| Serviço | 1.000 conversas/mês |
|---|---|
| OpenAI (gpt-4o-mini) | ~R$ 0,50–2,00 |
| Supabase | Grátis (free tier) |
| Railway | Grátis ($5 crédito) |
| Upstash | Grátis (free tier) |
| **Total** | **~R$ 1–2/mês** |

Repasse no plano e tenha margem de ~95%.
