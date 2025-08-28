# Script para visualizar status da sessão de integração de métricas
# PowerShell Script - view_metrics_session_status.ps1

$sessionFile = "integration_metrics_001.json"
$sessionPath = Join-Path $PSScriptRoot $sessionFile

Write-Host "📊 Status da Integração de Métricas - MobileMed" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

if (Test-Path $sessionPath) {
    $session = Get-Content $sessionPath | ConvertFrom-Json
    
    # Informações da Sessão
    Write-Host "`n📋 Informações da Sessão:" -ForegroundColor Yellow
    Write-Host "ID: $($session.session_info.session_id)" -ForegroundColor White
    Write-Host "Criado em: $($session.session_info.created_at)" -ForegroundColor White
    Write-Host "Última atualização: $($session.session_info.last_updated)" -ForegroundColor White
    Write-Host "Descrição: $($session.session_info.description)" -ForegroundColor White
    Write-Host "API Endpoint: $($session.session_info.api_endpoint)" -ForegroundColor White
    Write-Host "Frontend Port: $($session.session_info.frontend_port)" -ForegroundColor White
    
    # Resumo do Progresso
    Write-Host "`n📈 Resumo do Progresso:" -ForegroundColor Yellow
    $progress = $session.progress_summary
    Write-Host "Total de Tarefas: $($progress.total_tasks)" -ForegroundColor White
    Write-Host "Concluídas: $($progress.completed)" -ForegroundColor Green
    Write-Host "Em Progresso: $($progress.in_progress)" -ForegroundColor Yellow
    Write-Host "Pendentes: $($progress.pending)" -ForegroundColor Red
    Write-Host "Progresso: $($progress.completion_percentage)%" -ForegroundColor Cyan
    
    # Barra de Progresso
    $completed = [math]::Floor($progress.completion_percentage / 5)
    $remaining = 20 - $completed
    $progressBar = "█" * $completed + "░" * $remaining
    Write-Host "`n[$progressBar] $($progress.completion_percentage)%" -ForegroundColor Cyan
    
    # Status das Tarefas
    Write-Host "`n🚀 Status das Tarefas:" -ForegroundColor Yellow
    foreach ($task in $session.tasks) {
        $status = $task.status
        $color = switch ($status) {
            "COMPLETE" { "Green" }
            "IN_PROGRESS" { "Yellow" }
            "PENDING" { "Gray" }
            "ERROR" { "Red" }
            "CANCELLED" { "DarkGray" }
            default { "White" }
        }
        
        $icon = switch ($status) {
            "COMPLETE" { "✅" }
            "IN_PROGRESS" { "🔄" }
            "PENDING" { "⏳" }
            "ERROR" { "❌" }
            "CANCELLED" { "🚫" }
            default { "📋" }
        }
        
        Write-Host "$icon [$status] $($task.content)" -ForegroundColor $color
        if ($task.notes) {
            Write-Host "   📝 $($task.notes)" -ForegroundColor DarkGray
        }
    }
    
    # Arquivos Modificados
    if ($session.files_modified.Count -gt 0) {
        Write-Host "`n📁 Arquivos Modificados:" -ForegroundColor Yellow
        foreach ($file in $session.files_modified) {
            Write-Host "   📄 $file" -ForegroundColor Green
        }
    }
    
    # Próximas Prioridades
    if ($session.next_session_priorities.Count -gt 0) {
        Write-Host "`n🎯 Próximas Prioridades:" -ForegroundColor Yellow
        for ($i = 0; $i -lt $session.next_session_priorities.Count; $i++) {
            Write-Host "   $($i + 1). $($session.next_session_priorities[$i])" -ForegroundColor Cyan
        }
    }
    
    # Notas Técnicas
    if ($session.technical_notes) {
        Write-Host "`n🔧 Notas Técnicas:" -ForegroundColor Yellow
        
        if ($session.technical_notes.backend_endpoints) {
            Write-Host "   📡 Endpoints:" -ForegroundColor White
            foreach ($endpoint in $session.technical_notes.backend_endpoints) {
                Write-Host "     • $endpoint" -ForegroundColor Gray
            }
        }
        
        if ($session.technical_notes.integration_points) {
            Write-Host "   🔗 Pontos de Integração:" -ForegroundColor White
            foreach ($point in $session.technical_notes.integration_points) {
                Write-Host "     • $point" -ForegroundColor Gray
            }
        }
    }
    
} else {
    Write-Host "❌ Arquivo de sessão não encontrado: $sessionPath" -ForegroundColor Red
}

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "🔄 Para atualizar status: .\update_metrics_task_status.ps1" -ForegroundColor Cyan
Write-Host "📊 Integração de Métricas - MobileMed Dashboard" -ForegroundColor Cyan