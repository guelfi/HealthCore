# Script para visualizar o status da sessao de implementacao
# Usage: .\view_session_status.ps1

# [SUBSTITUIR] Caminho do arquivo de sessao - ajustar conforme o nome do arquivo JSON
$SessionFile = "template_session_001.json"

# Verificar se o arquivo existe
if (-not (Test-Path $SessionFile)) {
    Write-Error "Arquivo de sessao nao encontrado: $SessionFile"
    Write-Host "Certifique-se de que o arquivo JSON da sessao existe nesta pasta." -ForegroundColor Yellow
    exit 1
}

try {
    # Ler o arquivo JSON
    $sessionData = Get-Content $SessionFile -Raw | ConvertFrom-Json
    
    # Cabeçalho
    Write-Host "" 
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "📋 STATUS DA SESSÃO DE IMPLEMENTAÇÃO" -ForegroundColor Blue
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host ""
    
    # Informações da sessão
    Write-Host "🆔 ID da Sessão: $($sessionData.session_info.session_id)" -ForegroundColor Cyan
    Write-Host "📝 Descrição: $($sessionData.session_info.description)" -ForegroundColor Cyan
    Write-Host "🌐 API Endpoint: $($sessionData.session_info.api_endpoint)" -ForegroundColor Cyan
    Write-Host "🖥️  Frontend Port: $($sessionData.session_info.frontend_port)" -ForegroundColor Cyan
    Write-Host "📅 Criado em: $($sessionData.session_info.created_at)" -ForegroundColor Cyan
    Write-Host "🔄 Última atualização: $($sessionData.session_info.last_updated)" -ForegroundColor Cyan
    Write-Host ""
    
    # Resumo de progresso
    $progress = $sessionData.progress_summary
    Write-Host "📊 RESUMO DE PROGRESSO" -ForegroundColor Yellow
    Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Yellow
    Write-Host "📈 Progresso Geral: $($progress.completion_percentage)%" -ForegroundColor Green
    Write-Host "📋 Total de Tarefas: $($progress.total_tasks)" -ForegroundColor White
    Write-Host "✅ Concluídas: $($progress.completed)" -ForegroundColor Green
    Write-Host "🔄 Em Andamento: $($progress.in_progress)" -ForegroundColor Yellow
    Write-Host "⏳ Pendentes: $($progress.pending)" -ForegroundColor Red
    Write-Host ""
    
    # Barra de progresso visual
    $barLength = 50
    $completedBars = [math]::Floor(($progress.completion_percentage / 100) * $barLength)
    $remainingBars = $barLength - $completedBars
    
    $progressBar = "█" * $completedBars + "░" * $remainingBars
    Write-Host "📊 [$progressBar] $($progress.completion_percentage)%" -ForegroundColor Green
    Write-Host ""
    
    # Lista de tarefas
    Write-Host "📋 LISTA DE TAREFAS" -ForegroundColor Magenta
    Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Magenta
    
    foreach ($task in $sessionData.tasks) {
        $statusIcon = switch ($task.status) {
            "COMPLETE" { "✅" }
            "IN_PROGRESS" { "🔄" }
            "PENDING" { "⏳" }
            "ERROR" { "❌" }
            "CANCELLED" { "🚫" }
            default { "❓" }
        }
        
        $statusColor = switch ($task.status) {
            "COMPLETE" { "Green" }
            "IN_PROGRESS" { "Yellow" }
            "PENDING" { "Red" }
            "ERROR" { "DarkRed" }
            "CANCELLED" { "Gray" }
            default { "White" }
        }
        
        Write-Host "$statusIcon [$($task.status)]" -ForegroundColor $statusColor -NoNewline
        Write-Host " $($task.id): $($task.content)" -ForegroundColor White
        
        if ($task.notes -and $task.notes -ne "") {
            Write-Host "   📝 $($task.notes)" -ForegroundColor Gray
        }
        
        if ($task.started_at) {
            Write-Host "   🚀 Iniciado: $($task.started_at)" -ForegroundColor Gray
        }
        
        if ($task.completed_at) {
            Write-Host "   🏁 Concluído: $($task.completed_at)" -ForegroundColor Gray
        }
        
        Write-Host ""
    }
    
    # Arquivos modificados
    if ($sessionData.files_modified -and $sessionData.files_modified.Count -gt 0) {
        Write-Host "📁 ARQUIVOS MODIFICADOS" -ForegroundColor Blue
        Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Blue
        foreach ($file in $sessionData.files_modified) {
            Write-Host "📄 $file" -ForegroundColor Cyan
        }
        Write-Host ""
    }
    
    # Próximas prioridades
    if ($sessionData.next_session_priorities -and $sessionData.next_session_priorities.Count -gt 0) {
        Write-Host "🎯 PRÓXIMAS PRIORIDADES" -ForegroundColor Green
        Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Green
        for ($i = 0; $i -lt $sessionData.next_session_priorities.Count; $i++) {
            Write-Host "$($i + 1). $($sessionData.next_session_priorities[$i])" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    # Rodapé
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "💡 Use .\update_task_status.ps1 para atualizar o status das tarefas" -ForegroundColor Gray
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host ""
    
} catch {
    Write-Error "Erro ao ler arquivo de sessao: $($_.Exception.Message)"
    exit 1
}