# Script para atualizar status de tarefas da sessao de integracao
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

# Caminho do arquivo de sessao
$SessionFile = "log\tasks\integration_session_001.json"

# Verificar se o arquivo existe
if (-not (Test-Path $SessionFile)) {
    Write-Error "Arquivo de sessao nao encontrado: $SessionFile"
    exit 1
}

try {
    # Ler o arquivo JSON
    $sessionData = Get-Content $SessionFile -Raw | ConvertFrom-Json
    
    # Encontrar a tarefa
    $task = $sessionData.tasks | Where-Object { $_.id -eq $TaskId }
    
    if (-not $task) {
        Write-Error "Tarefa nao encontrada: $TaskId"
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
    
    # Atualizar notes se fornecido
    if ($Notes) {
        $task.notes = $Notes
    }
    
    # Atualizar session info
    $sessionData.session_info.last_updated = $currentTime
    
    # Recalcular progress summary
    $totalTasks = $sessionData.tasks.Count
    $completedTasks = ($sessionData.tasks | Where-Object { $_.status -eq "COMPLETE" }).Count
    $inProgressTasks = ($sessionData.tasks | Where-Object { $_.status -eq "IN_PROGRESS" }).Count
    $pendingTasks = ($sessionData.tasks | Where-Object { $_.status -eq "PENDING" }).Count
    
    $sessionData.progress_summary.total_tasks = $totalTasks
    $sessionData.progress_summary.completed = $completedTasks
    $sessionData.progress_summary.in_progress = $inProgressTasks
    $sessionData.progress_summary.pending = $pendingTasks
    $sessionData.progress_summary.completion_percentage = [math]::Round(($completedTasks / $totalTasks) * 100, 0)
    
    # Salvar o arquivo atualizado
    $sessionData | ConvertTo-Json -Depth 10 | Set-Content $SessionFile -Encoding UTF8
    
    Write-Host "Tarefa atualizada com sucesso!" -ForegroundColor Green
    Write-Host "Tarefa: $TaskId" -ForegroundColor Cyan
    Write-Host "Status: $oldStatus -> $Status" -ForegroundColor Yellow
    Write-Host "Progresso: $completedTasks/$totalTasks tarefas ($($sessionData.progress_summary.completion_percentage)%)" -ForegroundColor Magenta
    
    if ($Notes) {
        Write-Host "Notas: $Notes" -ForegroundColor Gray
    }
    
} catch {
    Write-Error "Erro ao atualizar tarefa: $_"
    exit 1
}