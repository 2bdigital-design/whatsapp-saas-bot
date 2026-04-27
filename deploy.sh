#!/bin/bash
# =============================================================
# deploy.sh — Deploy gratuito: Railway (Backend + Evolution API)
#                              Vercel  (Painel Next.js)
# =============================================================
set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   WhatsApp SaaS Bot — Deploy Gratuito    ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# --------------- Pré-requisitos ---------------
command -v node  >/dev/null 2>&1 || { echo "❌ Node.js não encontrado. Instale em nodejs.org"; exit 1; }
command -v npm   >/dev/null 2>&1 || { echo "❌ npm não encontrado."; exit 1; }

# Instalar Railway CLI se não existir
if ! command -v railway &>/dev/null; then
  echo "📦 Instalando Railway CLI..."
  npm install -g @railway/cli
fi

# Instalar Vercel CLI se não existir
if ! command -v vercel &>/dev/null; then
  echo "📦 Instalando Vercel CLI..."
  npm install -g vercel
fi

# --------------- Build do backend ---------------
echo ""
echo "🔨 Compilando backend TypeScript..."
cd backend
npm install
npm run build
cd ..

# --------------- Deploy Railway — Backend ---------------
echo ""
echo "🚂 Fazendo login no Railway..."
railway login

echo ""
echo "🚂 Deploy do backend no Railway..."
cd backend
railway up --service backend
BACKEND_URL=$(railway variables get RAILWAY_STATIC_URL 2>/dev/null || echo "")
cd ..

echo ""
echo "📋 Configure as variáveis de ambiente no Railway:"
echo "   SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY"
echo "   EVOLUTION_API_URL, EVOLUTION_API_KEY"
echo "   REDIS_URL (Upstash), WEBHOOK_SECRET, INTERNAL_SECRET, PANEL_URL"

# --------------- Deploy Vercel — Painel ---------------
echo ""
echo "▲ Deploy do painel no Vercel..."
cd painel
npm install
vercel --prod
cd ..

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 Configure as variáveis no Vercel:"
echo "   NEXT_PUBLIC_SUPABASE_URL"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   BACKEND_URL  (URL do Railway backend)"
echo "   INTERNAL_SECRET"
echo ""
echo "📖 Próximos passos:"
echo "   1. Execute o supabase/schema.sql no SQL Editor do Supabase"
echo "   2. No Railway, crie também um serviço para a Evolution API"
echo "      (veja instruções no README.md)"
echo "   3. Acesse o painel, cadastre-se e conecte o WhatsApp"
