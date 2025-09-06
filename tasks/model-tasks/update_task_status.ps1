# Script para atualizar status de tarefas da sessao de implementacao
# Usage: .\update_task_status.ps1 -TaskId "task_id" -Status "COMPLETE" -Notes "Optional notes"

param(
    [Parameter(Mandatory=$true)]
    [string]$TaskId,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("PENDING", "IN_PROGRESS", "COMPLETE", "ERROR", "CANCELLED")]
    [string]$Status,
    
    [Parameter(Mandatory=$false)]
    [string]$Notes = ""
)

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
    
    # Encontrar a tarefa
    $task = $sessionData.tasks | Where-Object { $_.id -eq $TaskId }
    
    if (-not $task) {
        Write-Error "Tarefa nao encontrada: $TaskId"
        Write-Host "Tarefas disponiveis:" -ForegroundColor Yellow
        $sessionData.tasks | ForEach-Object { Write-Host "  - $($_.id): $($_.content)" -ForegroundColor Cyan }
        exit 1
    }
    
    # Atualizar status
    $oldStatus = $task.status
    $task.status = $Status
    
    # Atualizar timestamps
    $currentTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    
    if ($Status -eq "IN_PROGRESS" -and $task.started_at -eq $null) {
        $task.started_at = $currentTime
    }
    
    if ($Status -eq "COMPLETE") {
        $task.completed_at = $currentTime
        if ($task.started_at -eq $null) {
            $task.started_at = $currentTime
        }
    }
    
    # Adicionar notas se fornecidas
    if ($Notes -ne "") {
        $task.notes = $Notes
    }
    
    # Atualizar timestamp da sessao
    $sessionData.session_info.last_updated = $currentTime
    
    # Recalcular resumo de progresso
    $totalTasks = $sessionData.tasks.Count
    $completedTasks = ($sessionData.tasks | Where-Object { $_.status -eq "COMPLETE" }).Count
    $inProgressTasks = ($sessionData.tasks | Where-Object { $_.status -eq "IN_PROGRESS" }).Count
    $pendingTasks = ($sessionData.tasks | Where-Object { $_.status -eq "PENDING" }).Count
    $completionPercentage = if ($totalTasks -gt 0) { [math]::Round(($completedTasks / $totalTasks) * 100, 2) } else { 0 }
    
    $sessionData.progress_summary.total_tasks = $totalTasks
    $sessionData.progress_summary.completed = $completedTasks
    $sessionData.progress_summary.in_progress = $inProgressTasks
    $sessionData.progress_summary.pending = $pendingTasks
    $sessionData.progress_summary.completion_percentage = $completionPercentage
    
    # Salvar o arquivo atualizado
    $sessionData | ConvertTo-Json -Depth 10 | Set-Content $SessionFile -Encoding UTF8
    
    # Exibir resultado
    Write-Host "✅ Tarefa atualizada com sucesso!" -ForegroundColor Green
    Write-Host "📋 Tarefa: $($task.content)" -ForegroundColor Cyan
    Write-Host "🔄 Status: $oldStatus → $Status" -ForegroundColor Yellow
    if ($Notes -ne "") {
        Write-Host "📝 Notas: $Notes" -ForegroundColor Magenta
    }
    Write-Host "📊 Progresso geral: $completionPercentage% ($completedTasks/$totalTasks tarefas concluídas)" -ForegroundColor Blue
    
} catch {
    Write-Error "Erro ao atualizar tarefa: $($_.Exception.Message)"
    exit 1
}