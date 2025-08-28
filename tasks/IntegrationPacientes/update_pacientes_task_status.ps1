# Script para atualizar status de tarefas na integração de Pacientes
# Baseado no modelo de sucesso das integrações anteriores

param(
    [Parameter(Mandatory=$true)]
    [string]$TaskId,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("PENDING", "IN_PROGRESS", "COMPLETE", "ERROR")]
    [string]$Status,
    
    [string]$Notes = "",
    
    [string]$JsonFile = "tasks\IntegrationPacientes\integration_pacientes_001.json"
)

# Cores para output
$Host.UI.RawUI.ForegroundColor = "White"

function Write-ColoredText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    $originalColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Text
    $Host.UI.RawUI.ForegroundColor = $originalColor
}

# Verificar se o arquivo existe
if (-not (Test-Path $JsonFile)) {
    Write-ColoredText "❌ Arquivo não encontrado: $JsonFile" "Red"
    exit 1
}

# Carregar dados JSON
try {
    $sessionData = Get-Content $JsonFile -Raw | ConvertFrom-Json
} catch {
    Write-ColoredText "❌ Erro ao ler arquivo JSON: $_" "Red"
    exit 1
}

# Encontrar a tarefa
$task = $sessionData.tasks | Where-Object { $_.id -eq $TaskId }

if (-not $task) {
    Write-ColoredText "❌ Tarefa não encontrada: $TaskId" "Red"
    Write-ColoredText "`nTarefas disponíveis:" "Yellow"
    foreach ($t in $sessionData.tasks) {
        Write-ColoredText "• $($t.id) - $($t.content)" "Gray"
    }
    exit 1
}

# Backup do estado anterior
$previousStatus = $task.status
$previousNotes = $task.notes

# Atualizar a tarefa
$currentTime = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"

# Atualizar timestamps baseado no status
switch ($Status) {
    "IN_PROGRESS" {
        if ($task.started_at -eq $null) {
            $task.started_at = $currentTime
        }
        $task.completed_at = $null
    }
    "COMPLETE" {
        if ($task.started_at -eq $null) {
            $task.started_at = $currentTime
        }
        $task.completed_at = $currentTime
    }
    "PENDING" {
        $task.started_at = $null
        $task.completed_at = $null
    }
    "ERROR" {
        if ($task.started_at -eq $null) {
            $task.started_at = $currentTime
        }
        $task.completed_at = $null
    }
}

# Atualizar status e notas
$task.status = $Status
if ($Notes -ne "") {
    $task.notes = $Notes
}

# Recalcular resumo do progresso
$totalTasks = $sessionData.tasks.Count
$completedTasks = ($sessionData.tasks | Where-Object { $_.status -eq "COMPLETE" }).Count
$inProgressTasks = ($sessionData.tasks | Where-Object { $_.status -eq "IN_PROGRESS" }).Count
$pendingTasks = ($sessionData.tasks | Where-Object { $_.status -eq "PENDING" }).Count
$errorTasks = ($sessionData.tasks | Where-Object { $_.status -eq "ERROR" }).Count

$completionPercentage = if ($totalTasks -gt 0) { [math]::Round(($completedTasks / $totalTasks) * 100) } else { 0 }

$sessionData.progress_summary.total_tasks = $totalTasks
$sessionData.progress_summary.completed = $completedTasks
$sessionData.progress_summary.in_progress = $inProgressTasks
$sessionData.progress_summary.pending = $pendingTasks
$sessionData.progress_summary.completion_percentage = $completionPercentage

# Atualizar timestamp da sessão
$sessionData.session_info.last_updated = $currentTime

# Salvar o arquivo atualizado
try {
    $sessionData | ConvertTo-Json -Depth 10 | Set-Content $JsonFile -Encoding UTF8
} catch {
    Write-ColoredText "❌ Erro ao salvar arquivo: $_" "Red"
    exit 1
}

# Exibir resultado
Write-ColoredText "`n🔄 TAREFA ATUALIZADA COM SUCESSO" "Green"
Write-ColoredText "=" * 50 "Green"

Write-ColoredText "`n📋 Detalhes da Tarefa:" "Yellow"
Write-ColoredText "ID: $($task.id)" "White"
Write-ColoredText "Descrição: $($task.content)" "White"
Write-ColoredText "Status Anterior: $previousStatus" "Gray"
Write-ColoredText "Status Atual: $($task.status)" "Cyan"

if ($Notes -ne "") {
    Write-ColoredText "Notas: $($task.notes)" "White"
}

Write-ColoredText "`n⏱️ Timestamps:" "Yellow"
if ($task.started_at) {
    Write-ColoredText "Iniciado em: $($task.started_at)" "White"
}
if ($task.completed_at) {
    Write-ColoredText "Concluído em: $($task.completed_at)" "White"
}

Write-ColoredText "`n📊 Progresso Atualizado:" "Yellow"
Write-ColoredText "Total de Tarefas: $totalTasks" "White"
Write-ColoredText "Concluídas: $completedTasks" "Green"
Write-ColoredText "Em Progresso: $inProgressTasks" "Yellow"
Write-ColoredText "Pendentes: $pendingTasks" "Gray"

if ($errorTasks -gt 0) {
    Write-ColoredText "Com Erro: $errorTasks" "Red"
}

Write-ColoredText "Progresso Geral: $completionPercentage%" "Cyan"

# Barra de progresso visual
$barLength = 30
$completedBars = [math]::Floor($completionPercentage * $barLength / 100)
$remainingBars = $barLength - $completedBars
$progressBar = "█" * $completedBars + "░" * $remainingBars
Write-ColoredText "[$progressBar] $completionPercentage%" "Cyan"

# Próxima tarefa sugerida
$nextTask = $sessionData.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
if ($nextTask) {
    Write-ColoredText "`n🎯 Próxima Tarefa Sugerida:" "Yellow"
    Write-ColoredText "• $($nextTask.id) - $($nextTask.content)" "White"
    if ($nextTask.estimated_time) {
        Write-ColoredText "  ⏱️ Tempo estimado: $($nextTask.estimated_time)" "Gray"
    }
}

# Comandos úteis
Write-ColoredText "`n🛠️ Comandos Úteis:" "Yellow"
Write-ColoredText "Visualizar status completo:" "White"
Write-ColoredText "  powershell -ExecutionPolicy Bypass -File tasks\IntegrationPacientes\view_pacientes_session_status.ps1" "DarkGray"

if ($nextTask) {
    Write-ColoredText "`nIniciar próxima tarefa:" "White"
    Write-ColoredText "  powershell -ExecutionPolicy Bypass -File tasks\IntegrationPacientes\update_pacientes_task_status.ps1 -TaskId `"$($nextTask.id)`" -Status `"IN_PROGRESS`" -Notes `"Iniciando desenvolvimento`"" "DarkGray"
}

# Verificar se a etapa está completa
if ($completionPercentage -eq 100) {
    Write-ColoredText "`n🎉 PARABÉNS! INTEGRAÇÃO DE PACIENTES 100% CONCLUÍDA!" "Green"
    Write-ColoredText "🚀 Pronto para próxima etapa: IntegrationExames" "Green"
}

Write-ColoredText "`n" "White"