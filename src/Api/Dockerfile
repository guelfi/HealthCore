# Build stage
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["src/Api/MobileMed.Api.csproj", "src/Api/"]
COPY ["src/Core/MobileMed.Core.csproj", "src/Core/"]
COPY ["src/Infrastructure/MobileMed.Infrastructure.csproj", "src/Infrastructure/"]
RUN dotnet restore "src/Api/MobileMed.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/src/Api"
RUN dotnet build "MobileMed.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "MobileMed.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS final
WORKDIR /app

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Copy published app
COPY --from=publish /app/publish .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Expose port
EXPOSE 5000

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Start the application
ENTRYPOINT ["dotnet", "MobileMed.Api.dll"]