#!/bin/bash
# =============================================================
# deploy.sh — Deploy no VPS via Docker Compose
# Backend (Node.js + BullMQ) + Painel (Next.js) + Nginx + Postgres
# =============================================================
set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   WhatsApp SaaS Bot — Deploy VPS         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# --------------- Pré-requisitos ---------------
command -v docker >/dev/null 2>&1 || { echo "❌ Docker não encontrado. Instale em docker.com"; exit 1; }

# --------------- Build e Deploy ---------------
echo "🔨 Building imagens Docker..."
docker compose -f docker-compose.prod.yml build

echo ""
echo "🚀 Subindo serviços..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "📊 Status dos containers:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 Variáveis obrigatórias em backend/.env:"
echo "   SUPABASE_URL, SUPABASE_SERVICE_KEY"
echo "   OPENAI_API_KEY"
echo "   REDIS_URL"
echo "   WEBHOOK_VERIFY_TOKEN"
echo "   WA_APP_SECRET (opcional — verifica assinaturas Meta)"
echo ""
echo "📋 Próximos passos:"
echo "   1. Execute o supabase/schema.sql no SQL Editor do Supabase"
echo "   2. Configure o Webhook no Meta Developer Console:"
echo "      URL: https://api.atende-bem.online/webhook/meta"
echo "      Evento: messages"
echo "   3. Acesse o painel, cadastre-se e adicione as credenciais WhatsApp"
