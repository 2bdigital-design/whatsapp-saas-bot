#!/bin/bash
# ================================================================
# Deploy script para Hetzner VPS
# Copia código, instala Docker e sobe os serviços
# ================================================================

set -e

VPS_IP="78.47.203.116"
VPS_USER="root"
APP_DIR="/opt/whatsapp-saas-bot"

echo "==> Conectando ao VPS $VPS_IP..."

# Instalar Docker e Docker Compose no VPS
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP bash <<'ENDSSH'
set -e
echo "==> Atualizando sistema..."
apt-get update -qq

echo "==> Instalando Docker..."
curl -fsSL https://get.docker.com | sh

echo "==> Instalando Docker Compose plugin..."
apt-get install -y docker-compose-plugin

echo "==> Docker instalado:"
docker --version
docker compose version

echo "==> Criando diretório da aplicação..."
mkdir -p /opt/whatsapp-saas-bot/backend
ENDSSH

echo "==> Copiando ficheiros para o VPS..."
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='dist' \
  -e "ssh -o StrictHostKeyChecking=no" \
  . $VPS_USER@$VPS_IP:$APP_DIR/

echo "==> Iniciando serviços no VPS..."
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP bash <<ENDSSH
cd $APP_DIR
export VPS_IP="$VPS_IP"
export EVOLUTION_API_KEY="whatsapp-saas-secret-key-2024"

echo "==> Building e iniciando containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Status dos containers:"
docker compose -f docker-compose.prod.yml ps

echo "==> Deploy concluído!"
ENDSSH

echo ""
echo "✅ Deploy completo!"
echo "   Evolution API: http://$VPS_IP:8080"
echo "   Backend API:   http://$VPS_IP:3000"
