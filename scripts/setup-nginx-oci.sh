#!/bin/bash

# Script para configurar Nginx no servidor OCI para MobileMed
# Execute este script no servidor OCI como usuário ubuntu

set -e

echo "🚀 Configurando Nginx para MobileMed na OCI..."

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

# Criar diretório para logs do MobileMed
echo "📁 Criando diretórios de logs..."
mkdir -p /var/log/nginx
touch /var/log/nginx/mobilemed_access.log
touch /var/log/nginx/mobilemed_error.log
chown www-data:www-data /var/log/nginx/mobilemed_*.log

# Copiar configuração do MobileMed
echo "📝 Copiando configuração do MobileMed..."
if [ -f "/home/ubuntu/mobilemed.conf" ]; then
    cp /home/ubuntu/mobilemed.conf /etc/nginx/sites-available/
    echo "✅ Configuração copiada para /etc/nginx/sites-available/mobilemed.conf"
else
    echo "❌ Arquivo mobilemed.conf não encontrado em /home/ubuntu/"
    echo "Por favor, copie o arquivo nginx/mobilemed.conf para /home/ubuntu/ primeiro"
    exit 1
fi

# Habilitar site do MobileMed
echo "🔗 Habilitando site do MobileMed..."
if [ ! -L "/etc/nginx/sites-enabled/mobilemed.conf" ]; then
    ln -s /etc/nginx/sites-available/mobilemed.conf /etc/nginx/sites-enabled/
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
echo "1. Configure o DNS para apontar mobilemed.batuara.net para este servidor"
echo "2. Execute: sudo certbot --nginx -d mobilemed.batuara.net"
echo "3. Abra as portas 5000 e 5005 no painel da OCI"
echo "4. Execute o deploy do MobileMed via GitHub Actions"
echo ""
echo "🔗 URLs de acesso:"
echo "   - Batuara.net: http://$(curl -s ifconfig.me):3000 (existente)"
echo "   - MobileMed Frontend: http://$(curl -s ifconfig.me):5005"
echo "   - MobileMed API: http://$(curl -s ifconfig.me):5000"
echo "   - MobileMed via Nginx: https://mobilemed.batuara.net (após SSL)"
echo ""
echo "⚠️  Lembre-se de configurar as portas no painel da OCI!"