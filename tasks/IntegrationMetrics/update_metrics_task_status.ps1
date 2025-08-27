# Script para atualizar status das tarefas de integração de métricas
# PowerShell Script - update_metrics_task_status.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$TaskId,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("PENDING", "IN_PROGRESS", "COMPLETE", "ERROR", "CANCELLED")]
    [string]$Status,
    
    [string]$Notes = ""
)

$sessionFile = "integration_metrics_001.json"
$sessionPath = Join-Path $PSScriptRoot $sessionFile

Write-Host "🔄 Atualizando Status da Tarefa - Integração de Métricas" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

if (Test-Path $sessionPath) {
    try {
        # Carregar dados da sessão
        $session = Get-Content $sessionPath | ConvertFrom-Json
        
        # Encontrar e atualizar a tarefa
        $taskFound = $false
        $currentTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        
        foreach ($task in $session.tasks) {
            if ($task.id -eq $TaskId) {
                $taskFound = $true
                $oldStatus = $task.status
                $task.status = $Status
                $session.session_info.last_updated = $currentTime
                
                # Atualizar timestamps baseado no status
                switch ($Status) {
                    "IN_PROGRESS" {
                        if (-not $task.started_at) {
                            $task.started_at = $currentTime
                        }
                        $task.completed_at = $null
                    }
                    "COMPLETE" {
                        if (-not $task.started_at) {
                            $task.started_at = $currentTime
                        }
                        $task.completed_at = $currentTime
                    }
                    "ERROR" {
                        if (-not $task.started_at) {
                            $task.started_at = $currentTime
                        }
                        $task.completed_at = $null
                    }
                    "CANCELLED" {
                        $task.completed_at = $currentTime
                    }
                    "PENDING" {
                        $task.started_at = $null
                        $task.completed_at = $null
                    }
                }
                
                # Atualizar notes se fornecido
                if ($Notes) {
                    $task.notes = $Notes
                }
                
                Write-Host "✅ Tarefa atualizada:" -ForegroundColor Green
                Write-Host "   ID: $TaskId" -ForegroundColor White
                Write-Host "   Status: $oldStatus → $Status" -ForegroundColor Yellow
                Write-Host "   Conteúdo: $($task.content)" -ForegroundColor Gray
                if ($Notes) {
                    Write-Host "   Notas: $Notes" -ForegroundColor Gray
                }
                break
            }
        }
        
        if (-not $taskFound) {
            Write-Host "❌ Tarefa não encontrada: $TaskId" -ForegroundColor Red
            Write-Host "📋 Tarefas disponíveis:" -ForegroundColor Yellow
            foreach ($task in $session.tasks) {
                Write-Host "   • $($task.id): $($task.content)" -ForegroundColor Gray
            }
            exit 1
        }
        
        # Recalcular resumo do progresso
        $totalTasks = $session.tasks.Count
        $completed = ($session.tasks | Where-Object { $_.status -eq "COMPLETE" }).Count
        $inProgress = ($session.tasks | Where-Object { $_.status -eq "IN_PROGRESS" }).Count
        $pending = ($session.tasks | Where-Object { $_.status -eq "PENDING" }).Count
        $percentage = if ($totalTasks -gt 0) { [math]::Round(($completed / $totalTasks) * 100, 1) } else { 0 }
        
        $session.progress_summary.total_tasks = $totalTasks
        $session.progress_summary.completed = $completed
        $session.progress_summary.in_progress = $inProgress
        $session.progress_summary.pending = $pending
        $session.progress_summary.completion_percentage = $percentage
        
        # Salvar arquivo atualizado
        $session | ConvertTo-Json -Depth 10 | Set-Content $sessionPath -Encoding UTF8
        
        Write-Host "`n📊 Resumo Atualizado:" -ForegroundColor Yellow
        Write-Host "   Concluídas: $completed/$totalTasks ($percentage%)" -ForegroundColor Green
        Write-Host "   Em Progresso: $inProgress" -ForegroundColor Yellow
        Write-Host "   Pendentes: $pending" -ForegroundColor Red
        
        # Barra de progresso
        $progressCompleted = [math]::Floor($percentage / 5)
        $progressRemaining = 20 - $progressCompleted
        $progressBar = "█" * $progressCompleted + "░" * $progressRemaining
        Write-Host "`n   [$progressBar] $percentage%" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Erro ao atualizar arquivo de sessão: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Arquivo de sessão não encontrado: $sessionPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔄 Para ver status completo: .\view_metrics_session_status.ps1" -ForegroundColor Cyan

# Exemplos de uso
Write-Host "`n💡 Exemplos de uso:" -ForegroundColor Yellow
Write-Host "   .\update_metrics_task_status.ps1 -TaskId 'create_metrics_service' -Status 'IN_PROGRESS'" -ForegroundColor Gray
Write-Host "   .\update_metrics_task_status.ps1 -TaskId 'create_metrics_hook' -Status 'COMPLETE' -Notes 'Hook implementado com sucesso'" -ForegroundColor Gray