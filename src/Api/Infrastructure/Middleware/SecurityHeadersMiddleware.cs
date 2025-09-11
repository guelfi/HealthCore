namespace HealthCore.Api.Infrastructure.Middleware
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SecurityHeadersMiddleware> _logger;

        public SecurityHeadersMiddleware(RequestDelegate next, ILogger<SecurityHeadersMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Adicionar headers de segurança
            var response = context.Response;
            var headers = response.Headers;

            // Previne ataques de MIME-type sniffing
            headers["X-Content-Type-Options"] = "nosniff";

            // Proteção contra ataques de clickjacking
            headers["X-Frame-Options"] = "DENY";

            // Habilita o filtro XSS do navegador
            headers["X-XSS-Protection"] = "1; mode=block";

            // Define política de referrer
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

            // Content Security Policy básico
            headers["Content-Security-Policy"] = 
                "default-src 'self'; " +
                "script-src 'self'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self'; " +
                "connect-src 'self'; " +
                "frame-ancestors 'none';";

            // Remove header de servidor para não expor informações
            headers.Remove("Server");

            // Strict Transport Security (HSTS) para HTTPS
            if (context.Request.IsHttps)
            {
                headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
            }

            // Permissions Policy (substituto do Feature-Policy)
            headers["Permissions-Policy"] = 
                "camera=(), " +
                "microphone=(), " +
                "geolocation=(), " +
                "payment=()";

            _logger.LogDebug("Security headers applied to response");

            await _next(context);
        }
    }

    public static class SecurityHeadersMiddlewareExtensions
    {
        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SecurityHeadersMiddleware>();
        }
    }
}
