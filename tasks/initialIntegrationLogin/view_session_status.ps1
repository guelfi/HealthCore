# Script para visualizar status das tarefas da sessao de integracao
# Usage: .\view_session_status.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$SessionFile = "log\tasks\integration_session_001.json"
)

# Verificar se o arquivo existe
if (-not (Test-Path $SessionFile)) {
    Write-Error "Arquivo de sessao nao encontrado: $SessionFile"
    exit 1
}

try {
    # Ler o arquivo JSON
    $sessionData = Get-Content $SessionFile -Raw | ConvertFrom-Json
    
    # Cabecalho da sessao
    Write-Host "SESSAO DE INTEGRACAO - MobileMed" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host ""
    
    # Informacoes da sessao
    Write-Host "Informacoes da Sessao:" -ForegroundColor Cyan
    Write-Host "   ID: $($sessionData.session_info.session_id)" -ForegroundColor Gray
    Write-Host "   Descricao: $($sessionData.session_info.description)" -ForegroundColor Gray
    Write-Host "   API: $($sessionData.session_info.api_endpoint)" -ForegroundColor Gray
    Write-Host "   Frontend: http://localhost:$($sessionData.session_info.frontend_port)" -ForegroundColor Gray
    Write-Host "   Ultima atualizacao: $($sessionData.session_info.last_updated)" -ForegroundColor Gray
    Write-Host ""
    
    # Resumo do progresso
    $progress = $sessionData.progress_summary
    Write-Host "Resumo do Progresso:" -ForegroundColor Cyan
    Write-Host "   Total de tarefas: $($progress.total_tasks)" -ForegroundColor Gray
    Write-Host "   Concluidas: $($progress.completed)" -ForegroundColor Green
    Write-Host "   Em progresso: $($progress.in_progress)" -ForegroundColor Yellow
    Write-Host "   Pendentes: $($progress.pending)" -ForegroundColor Red
    Write-Host "   Conclusao: $($progress.completion_percentage)%" -ForegroundColor Magenta
    Write-Host ""
    
    # Barra de progresso visual
    $barLength = 50
    $completedBars = [math]::Round(($progress.completion_percentage / 100) * $barLength)
    $progressBar = "#" * $completedBars + "-" * ($barLength - $completedBars)
    Write-Host "   [$progressBar] $($progress.completion_percentage)%" -ForegroundColor Green
    Write-Host ""
    
    # Lista de tarefas
    Write-Host "Lista de Tarefas:" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($task in $sessionData.tasks) {
        # Status color
        $statusColor = switch ($task.status) {
            "COMPLETE" { "Green" }
            "IN_PROGRESS" { "Yellow" }
            "PENDING" { "Red" }
            "ERROR" { "Magenta" }
            "CANCELLED" { "Gray" }
            default { "White" }
        }
        
        Write-Host "[$($task.status)] " -NoNewline -ForegroundColor $statusColor
        Write-Host "$($task.content)" -ForegroundColor White
        Write-Host "      ID: $($task.id)" -ForegroundColor Gray
        
        if ($task.notes) {
            Write-Host "      Notas: $($task.notes)" -ForegroundColor DarkGray
        }
        
        Write-Host ""
    }
    
    # Proximas prioridades
    if ($sessionData.next_session_priorities -and $sessionData.next_session_priorities.Count -gt 0) {
        Write-Host "Proximas Prioridades:" -ForegroundColor Cyan
        foreach ($priority in $sessionData.next_session_priorities) {
            Write-Host "   - $priority" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
} catch {
    Write-Error "Erro ao ler arquivo de sessao: $_"
    exit 1
}