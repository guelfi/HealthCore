# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["src/Api/HealthCore.Api.csproj", "Api/"]
RUN dotnet restore "Api/HealthCore.Api.csproj"

# Copy everything else and build
COPY src/Api/ Api/
WORKDIR "/src/Api"
RUN dotnet build "HealthCore.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "HealthCore.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Criar diretórios necessários
RUN mkdir -p /app/database /app/log /app/seed

# Copiar aplicação publicada
COPY --from=publish /app/publish .

# Copiar o banco de dados de SEED para um local separado
COPY src/Api/database/healthcore.db /app/seed/

# Copiar e preparar o entrypoint script
COPY src/Api/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Instalar curl para health checks
RUN apt-get update && apt-get install -y curl --no-install-recommends && apt-get clean && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root e definir permissões
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Health check (corrigido para a porta 5005 e caminho correto)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5005/healthcore-api/health || exit 1

# Expor a porta correta
EXPOSE 5005

# Definir variáveis de ambiente (corrigido para a porta 5005)
ENV ASPNETCORE_URLS=http://+:5005
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ConnectionStrings__DefaultConnection="Data Source=/app/database/healthcore.db"

# Iniciar a aplicação usando o entrypoint
ENTRYPOINT ["/app/entrypoint.sh", "dotnet", "HealthCore.Api.dll"]