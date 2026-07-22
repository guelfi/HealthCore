FROM mcr.microsoft.com/dotnet/sdk:8.0.422 AS build
WORKDIR /src

COPY ["src/Api/HealthCore.Api.csproj", "Api/"]
RUN dotnet restore "Api/HealthCore.Api.csproj"

COPY src/Api/ Api/
WORKDIR /src/Api
RUN dotnet publish "HealthCore.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0.28 AS final
WORKDIR /app

RUN mkdir -p /app/database /app/log &&     adduser --disabled-password --gecos '' appuser &&     chown -R appuser:appuser /app

COPY --from=build /app/publish .

RUN apt-get update &&     apt-get install -y --no-install-recommends curl &&     apt-get clean &&     rm -rf /var/lib/apt/lists/*

USER appuser
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ConnectionStrings__DefaultConnection="Data Source=/app/database/healthcore.db"

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3   CMD curl -f http://localhost:5000/health || exit 1

EXPOSE 5000
ENTRYPOINT ["dotnet", "HealthCore.Api.dll"]