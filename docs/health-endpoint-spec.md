# 🏥 Especificação do Endpoint Health Check

## 📋 **REQUISITO PARA BACKEND**

Implementar endpoint `/health` para monitoramento e healthchecks, especialmente útil para deploy em cloud (OCI) e scripts de automação.

## 🎯 **ESPECIFICAÇÃO TÉCNICA**

### **Endpoint:**
```
GET /health
```

### **Resposta de Sucesso (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-27T15:30:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "database": {
    "status": "connected",
    "responseTime": "15ms"
  },
  "dependencies": {
    "entityFramework": "healthy",
    "sqlite": "healthy"
  },
  "uptime": "02:15:30"
}
```

### **Resposta de Falha (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-08-27T15:30:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "database": {
    "status": "disconnected",
    "error": "Connection timeout"
  },
  "dependencies": {
    "entityFramework": "unhealthy",
    "sqlite": "unhealthy"
  },
  "uptime": "02:15:30"
}
```

## 🔧 **IMPLEMENTAÇÃO SUGERIDA (ASP.NET Core)**

### **1. Adicionar ao Program.cs:**
```csharp
// Health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<MobileMedDbContext>("database")
    .AddCheck("api", () => HealthCheckResult.Healthy("API is running"));

// Configure health check endpoint
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = WriteHealthCheckResponse
});

static async Task WriteHealthCheckResponse(HttpContext context, HealthReport healthReport)
{
    context.Response.ContentType = "application/json; charset=utf-8";

    var response = new
    {
        status = healthReport.Status == HealthStatus.Healthy ? "healthy" : "unhealthy",
        timestamp = DateTime.UtcNow,
        version = "1.0.0",
        environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "unknown",
        database = new
        {
            status = healthReport.Entries.ContainsKey("database") && 
                     healthReport.Entries["database"].Status == HealthStatus.Healthy ? "connected" : "disconnected",
            responseTime = healthReport.Entries.ContainsKey("database") ? 
                          $"{healthReport.Entries["database"].Duration.TotalMilliseconds:F0}ms" : "N/A"
        },
        dependencies = healthReport.Entries.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Status == HealthStatus.Healthy ? "healthy" : "unhealthy"
        ),
        uptime = GetUptime()
    };

    await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    }));
}

private static string GetUptime()
{
    var uptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime();
    return $"{uptime.Days:D2}:{uptime.Hours:D2}:{uptime.Minutes:D2}:{uptime.Seconds:D2}";
}
```

### **2. Adicionar dependências no .csproj:**
```xml
<PackageReference Include="Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore" Version="8.0.0" />
```

## 🚀 **CASOS DE USO**

### **1. Scripts de Deploy (OCI):**
```bash
# Verificar se API está saudável antes do deploy
curl -f http://api.mobilemed.com/health || exit 1
```

### **2. Monitoramento:**
```bash
# Check contínuo da saúde da API
while true; do
  curl -s http://api.mobilemed.com/health | jq '.status'
  sleep 30
done
```

### **3. Load Balancer Health Check:**
```yaml
# OCI Load Balancer configuration
health_check:
  protocol: HTTP
  port: 5000
  url_path: /health
  return_code: 200
  interval_ms: 30000
  timeout_ms: 3000
```

### **4. Docker Health Check:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1
```

## 🎯 **BENEFÍCIOS**

1. **Deploy Automation:** Scripts podem verificar saúde antes de routing do tráfego
2. **Monitoring:** Ferramentas podem monitorar status da aplicação
3. **Load Balancing:** Load balancers podem rotear apenas para instâncias saudáveis
4. **Debugging:** Diagnóstico rápido de problemas de infraestrutura
5. **SLA/SLO:** Métricas de disponibilidade e performance

## 📊 **PRIORIDADE**

- **Urgência:** Média
- **Impacto:** Alto (essencial para produção)
- **Esforço:** Baixo (implementação simples)

---

**Criado por:** Marco Guelfi  
**Data:** 27/08/2025  
**Para:** Desenvolvedor Backend  
**Projeto:** MobileMed - DesafioTecnico