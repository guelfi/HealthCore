# 🌐 healthcore - Teste de Conectividade Distribuída (Windows PowerShell)
# Script para testar a conexão entre frontend e backend em máquinas diferentes

param(
    [string]$ApiIP = ""
)

# Cores para output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Blue = "Blue"
    Yellow = "Yellow"
    Cyan = "Cyan"
    White = "White"
    Magenta = "Magenta"
}

# Função para exibir header
function Show-Header {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║              🌐 healthcore - Teste de Conectividade           ║" -ForegroundColor Magenta
    Write-Host "║                   Desenvolvimento Distribuído                ║" -ForegroundColor Magenta
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

# Função para obter IP local
function Get-LocalIP {
    try {
        $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" -and $_.PrefixOrigin -eq "Dhcp" } | Select-Object -First 1).IPAddress
        if (-not $ip) {
            $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1).IPAddress
        }
        return $ip
    }
    catch {
        return "127.0.0.1"
    }
}

# Função para testar conectividade
function Test-ApiConnectivity {
    param(
        [string]$Url,
        [string]$TestName
    )
    
    Write-Host "🔍 Testando: " -ForegroundColor Yellow -NoNewline
    Write-Host $TestName -ForegroundColor White
    Write-Host "   URL: " -ForegroundColor Cyan -NoNewline
    Write-Host $Url -ForegroundColor White
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Head -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   ✅ Conectividade: OK" -ForegroundColor Green
        
        # Teste específico para diferentes endpoints
        if ($Url -like "*swagger*") {
            Write-Host "   ✅ Swagger: Acessível" -ForegroundColor Green
        }
        elseif ($Url -like "*pacientes*") {
            try {
                $apiResponse = Invoke-WebRequest -Uri "$Url?page=1&pageSize=10" -TimeoutSec 5 -ErrorAction Stop
                Write-Host "   ✅ Endpoint /pacientes: OK ($($apiResponse.StatusCode))" -ForegroundColor Green
            }
            catch {
                Write-Host "   ⚠️  Endpoint /pacientes: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    }
    catch {
        Write-Host "   ❌ Conectividade: FALHOU" -ForegroundColor Red
        Write-Host "   ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Função para testar porta
function Test-Port {
    param(
        [string]$IPAddress,
        [int]$Port
    )
    
    Write-Host "🔍 Testando porta $Port..." -ForegroundColor Yellow
    
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.ReceiveTimeout = 5000
        $tcpClient.SendTimeout = 5000
        $tcpClient.Connect($IPAddress, $Port)
        $tcpClient.Close()
        Write-Host "✅ Porta $Port está aberta em $IPAddress" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Porta $Port não está acessível em $IPAddress" -ForegroundColor Red
        Write-Host "⚠️  Verifique se:" -ForegroundColor Yellow
        Write-Host "   • A API está rodando" -ForegroundColor White
        Write-Host "   • O firewall permite conexões na porta $Port" -ForegroundColor White
        Write-Host "   • O IP está correto" -ForegroundColor White
        return $false
    }
}

# Função principal
function Main {
    Show-Header
    
    # Informações do sistema local
    $localIP = Get-LocalIP
    $computerName = $env:COMPUTERNAME
    $osVersion = (Get-WmiObject -Class Win32_OperatingSystem).Caption
    $currentTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "📊 Informações da Máquina Local:" -ForegroundColor Cyan
    Write-Host "   • IP Local: " -ForegroundColor White -NoNewline
    Write-Host $localIP -ForegroundColor Green
    Write-Host "   • Nome: " -ForegroundColor White -NoNewline
    Write-Host $computerName -ForegroundColor Green
    Write-Host "   • Sistema: " -ForegroundColor White -NoNewline
    Write-Host $osVersion -ForegroundColor Green
    Write-Host "   • Data/Hora: " -ForegroundColor White -NoNewline
    Write-Host $currentTime -ForegroundColor Green
    Write-Host ""
    
    # Solicitar IP da API se não fornecido
    if (-not $ApiIP) {
        Write-Host "🔧 Digite o IP da máquina que roda a API:" -ForegroundColor Yellow
        $ApiIP = Read-Host "IP da API (ex: 192.168.1.100)"
    }
    
    if (-not $ApiIP) {
        Write-Host "❌ IP da API é obrigatório!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "🎯 Testando conectividade com API em: " -ForegroundColor Cyan -NoNewline
    Write-Host $ApiIP -ForegroundColor White
    Write-Host ""
    
    # URLs para testar
    $apiBase = "http://$ApiIP:5000"
    
    # Teste de porta primeiro
    $portOpen = Test-Port -IPAddress $ApiIP -Port 5000
    Write-Host ""
    
    if ($portOpen) {
        # Bateria de testes de API
        Test-ApiConnectivity -Url $apiBase -TestName "API Base"
        Test-ApiConnectivity -Url "$apiBase/swagger" -TestName "Swagger Documentation"
        Test-ApiConnectivity -Url "$apiBase/pacientes" -TestName "Endpoint Pacientes"
        Test-ApiConnectivity -Url "$apiBase/exames" -TestName "Endpoint Exames"
    }
    
    Write-Host "📋 Configuração do Frontend:" -ForegroundColor Cyan
    Write-Host "   Arquivo: " -ForegroundColor White -NoNewline
    Write-Host "src\Web\.env" -ForegroundColor Yellow
    Write-Host "   Configurar: " -ForegroundColor White -NoNewline
    Write-Host "VITE_API_BASE_URL=http://$ApiIP:5000" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🌐 URLs para acessar:" -ForegroundColor Cyan
    Write-Host "   • API: " -ForegroundColor White -NoNewline
    Write-Host "http://$ApiIP:5000" -ForegroundColor Blue
    Write-Host "   • Swagger: " -ForegroundColor White -NoNewline
    Write-Host "http://$ApiIP:5000/swagger" -ForegroundColor Blue
    Write-Host "   • Frontend (sua máquina): " -ForegroundColor White -NoNewline
    Write-Host "http://$localIP:5005" -ForegroundColor Blue
    Write-Host ""
    
    # Comando para copiar configuração
    Write-Host "📋 Comando para configurar o .env:" -ForegroundColor Cyan
    Write-Host "   (Você pode copiar e colar este comando no PowerShell)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   cd src\Web" -ForegroundColor White
    Write-Host "   (Get-Content .env) -replace 'VITE_API_BASE_URL=.*', 'VITE_API_BASE_URL=http://$ApiIP:5000' | Set-Content .env" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🎯 Teste concluído!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Executar se chamado diretamente
if ($MyInvocation.InvocationName -ne '.') {
    Main
}