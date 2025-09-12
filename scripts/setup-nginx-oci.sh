#!/bin/bash

# Script para configurar Nginx no servidor OCI para HealthCore
# Execute este script no servidor OCI como usuário ubuntu

set -e

echo "🚀 Configurando Nginx para HealthCore na OCI..."

# Verificar se está rodando como root ou com sudo
if [[ $EUID -ne 0 ]]; then
   echo "❌ Este script precisa ser executado como root ou com sudo"
   echo "Execute: sudo $0"
   exit 1
fi

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt update

# Instalar Nginx se não estiver instalado
if ! command -v nginx &> /dev/null; then
    echo "📦 Instalando Nginx..."
    apt install -y nginx
else
    echo "✅ Nginx já está instalado"
fi

# Instalar Certbot para SSL
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando Certbot..."
    apt install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot já está instalado"
fi

# Criar diretório para logs do HealthCore
echo "📁 Criando diretórios de logs..."
mkdir -p /var/log/nginx
touch /var/log/nginx/healthcore_access.log
touch /var/log/nginx/healthcore_error.log
chown www-data:www-data /var/log/nginx/healthcore_*.log

# Copiar configuração do HealthCore
echo "📝 Copiando configuração do HealthCore..."
if [ -f "/home/ubuntu/healthcore.conf" ]; then
    cp /home/ubuntu/healthcore.conf /etc/nginx/sites-available/
    echo "✅ Configuração copiada para /etc/nginx/sites-available/healthcore.conf"
else
    echo "❌ Arquivo healthcore.conf não encontrado em /home/ubuntu/"
    echo "Por favor, copie o arquivo nginx/healthcore.conf para /home/ubuntu/ primeiro"
    exit 1
fi

# Habilitar site do HealthCore
echo "🔗 Habilitando site do HealthCore..."
if [ ! -L "/etc/nginx/sites-enabled/healthcore.conf" ]; then
    ln -s /etc/nginx/sites-available/healthcore.conf /etc/nginx/sites-enabled/
    echo "✅ Site habilitado"
else
    echo "✅ Site já está habilitado"
fi

# Testar configuração do Nginx
echo "🧪 Testando configuração do Nginx..."
if nginx -t; then
    echo "✅ Configuração do Nginx está válida"
else
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi

# Recarregar Nginx
echo "🔄 Recarregando Nginx..."
systemctl reload nginx

# Verificar status do Nginx
echo "📊 Status do Nginx:"
systemctl status nginx --no-pager -l

# Verificar portas abertas
echo "🔍 Verificando portas abertas:"
netstat -tlnp | grep -E ':(80|443|3000|5000|5005)'

echo ""
echo "🎉 Configuração do Nginx concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o DNS para apontar healthcore.batuara.net para este servidor"
echo "2. Execute: sudo certbot --nginx -d healthcore.batuara.net"
echo "3. Abra as portas 5000 e 5005 no painel da OCI"
echo "4. Execute o deploy do HealthCore via GitHub Actions"
echo ""
echo "🔗 URLs de acesso:"
echo "   - Batuara.net: http://$(curl -s ifconfig.me):3000 (existente)"
echo "   - HealthCore Frontend: http://$(curl -s ifconfig.me):5005"
echo "   - HealthCore API: http://$(curl -s ifconfig.me):5000"
echo "   - HealthCore via Nginx: https://healthcore.batuara.net (após SSL)"
echo ""
echo "⚠️  Lembre-se de configurar as portas no painel da OCI!"