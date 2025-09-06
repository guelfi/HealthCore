# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["src/Api/MobileMed.Api.csproj", "Api/"]
RUN dotnet restore "Api/MobileMed.Api.csproj"

# Copy everything else and build
COPY src/Api/ Api/
WORKDIR "/src/Api"
RUN dotnet build "MobileMed.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "MobileMed.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Create directories for database and logs
RUN mkdir -p /app/database /app/log

# Copy published app
COPY --from=publish /app/publish .

# Copy database directory if exists
COPY src/Api/database/ ./database/

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Expose port
EXPOSE 5000

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ConnectionStrings__DefaultConnection="Data Source=database/mobilemed.db"

# Start the application
ENTRYPOINT ["dotnet", "MobileMed.Api.dll"]