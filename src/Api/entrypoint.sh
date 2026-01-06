#!/bin/sh
set -e

# Define a origem do seed e o destino do banco de dados
SEED_DB_PATH="/app/seed/healthcore.db"
LIVE_DB_PATH="/app/database/healthcore.db"

# Se o banco de dados principal não existir no volume, copie o seed para lá.
if [ ! -f "$LIVE_DB_PATH" ]; then
    echo "Banco de dados não encontrado em $LIVE_DB_PATH. Restaurando do seed..."
    # Garante que o diretório de destino existe
    mkdir -p /app/database
    cp "$SEED_DB_PATH" "$LIVE_DB_PATH"
    echo "Banco de dados restaurado."
else
    echo "Banco de dados existente encontrado em $LIVE_DB_PATH."
fi

# Entrega a execução para o comando original do contêiner (dotnet HealthCore.Api.dll)
# O "$@" permite passar quaisquer argumentos extras para o comando.
echo "Iniciando a aplicação..."
exec "$@"
