#!/bin/bash
# ================================================================
# Deploy script para Hetzner VPS
# Copia código e sobe os serviços via docker-compose.prod.yml
# ================================================================

set -e

VPS_IP="78.47.203.116"
VPS_USER="root"
APP_DIR="/opt/whatsapp-saas-bot"

echo "==> Conectando ao VPS $VPS_IP..."

# Instalar Docker e Docker Compose no VPS (se necessário)
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP bash <<'ENDSSH'
set -e
if ! command -v docker &>/dev/null; then
  echo "==> Instalando Docker..."
  apt-get update -qq
  curl -fsSL https://get.docker.com | sh
  apt-get install -y docker-compose-plugin
fi

echo "==> Docker: $(docker --version)"
echo "==> Docker Compose: $(docker compose version)"
mkdir -p /opt/whatsapp-saas-bot/backend
ENDSSH

echo "==> Copiando ficheiros para o VPS..."
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='dist' \
  -e "ssh -o StrictHostKeyChecking=no" \
  . $VPS_USER@$VPS_IP:$APP_DIR/

echo "==> Iniciando serviços no VPS..."
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP bash <<ENDSSH
cd $APP_DIR

echo "==> Building e iniciando containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Status dos containers:"
docker compose -f docker-compose.prod.yml ps

echo "==> Deploy concluído!"
ENDSSH

echo ""
echo "✅ Deploy completo!"
echo "   Backend API: https://api.atende-bem.online"
echo "   Painel:      https://app.atende-bem.online"
echo ""
echo "📋 Próximo passo: Configure o Webhook no Meta Developer Console"
echo "   URL: https://api.atende-bem.online/webhook/meta"
echo "   Verify Token: (valor de WEBHOOK_VERIFY_TOKEN no backend/.env)"
