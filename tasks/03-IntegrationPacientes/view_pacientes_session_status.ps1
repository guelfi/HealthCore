# Script para visualizar status da sessão de integração de Pacientes
# Baseado no modelo de sucesso das integrações anteriores

param(
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

function Get-StatusColor {
    param([string]$Status)
    switch ($Status) {
        "COMPLETE" { return "Green" }
        "IN_PROGRESS" { return "Yellow" }
        "PENDING" { return "Gray" }
        "ERROR" { return "Red" }
        default { return "White" }
    }
}

function Get-StatusIcon {
    param([string]$Status)
    switch ($Status) {
        "COMPLETE" { return "✅" }
        "IN_PROGRESS" { return "🔄" }
        "PENDING" { return "⏳" }
        "ERROR" { return "❌" }
        default { return "📋" }
    }
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

# Header
Write-ColoredText "`n🚀 STATUS DA INTEGRAÇÃO DE PACIENTES" "Cyan"
Write-ColoredText "=" * 60 "Cyan"

# Informações da sessão
Write-ColoredText "`n📋 INFORMAÇÕES DA SESSÃO" "Yellow"
Write-ColoredText "ID da Sessão: $($sessionData.session_info.session_id)" "White"
Write-ColoredText "Etapa: $($sessionData.session_info.etapa)" "White"
Write-ColoredText "Complexidade: $($sessionData.session_info.complexity)" "White"
Write-ColoredText "Prioridade: $($sessionData.session_info.priority)" "White"
Write-ColoredText "Estimativa: $($sessionData.session_info.estimated_hours)" "White"
Write-ColoredText "Última Atualização: $($sessionData.session_info.last_updated)" "White"

# Resumo do progresso
$progress = $sessionData.progress_summary
Write-ColoredText "`n📊 RESUMO DO PROGRESSO" "Yellow"
Write-ColoredText "Progresso Geral: $($progress.completion_percentage)% ($($progress.completed)/$($progress.total_tasks) tarefas concluídas)" "Cyan"

# Barra de progresso
$barLength = 40
$completedBars = [math]::Floor($progress.completion_percentage * $barLength / 100)
$remainingBars = $barLength - $completedBars
$progressBar = "█" * $completedBars + "░" * $remainingBars
Write-ColoredText "[$progressBar] $($progress.completion_percentage)%" "Cyan"

# Estatísticas por status
Write-ColoredText "`n📈 DISTRIBUIÇÃO DE TAREFAS" "Yellow"
Write-ColoredText "✅ Concluídas: $($progress.completed)" "Green"
Write-ColoredText "🔄 Em Progresso: $($progress.in_progress)" "Yellow"
Write-ColoredText "⏳ Pendentes: $($progress.pending)" "Gray"

# Lista de tarefas por categoria
Write-ColoredText "`n📋 TAREFAS POR CATEGORIA" "Yellow"

$tasksByCategory = $sessionData.tasks | Group-Object category
foreach ($category in $tasksByCategory) {
    $categoryName = $category.Name
    $taskCount = $category.Count
    $completedInCategory = ($category.Group | Where-Object { $_.status -eq "COMPLETE" }).Count
    
    Write-ColoredText "`n📁 $categoryName ($completedInCategory/$taskCount concluídas)" "Magenta"
    
    foreach ($task in $category.Group) {
        $icon = Get-StatusIcon $task.status
        $color = Get-StatusColor $task.status
        $taskInfo = "$icon [$($task.status)] $($task.content)"
        
        if ($task.estimated_time) {
            $taskInfo += " ⏱️ $($task.estimated_time)"
        }
        
        Write-ColoredText "  $taskInfo" $color
        
        if ($task.notes -and $task.notes -ne "") {
            Write-ColoredText "    💡 $($task.notes)" "DarkGray"
        }
    }
}

# Próximas prioridades
Write-ColoredText "`n🎯 PRÓXIMAS PRIORIDADES" "Yellow"
foreach ($priority in $sessionData.next_session_priorities) {
    Write-ColoredText "• $priority" "White"
}

# Checklist de validação
Write-ColoredText "`n✅ CHECKLIST DE VALIDAÇÃO" "Yellow"
foreach ($item in $sessionData.validation_checklist) {
    Write-ColoredText "$item" "DarkGray"
}

# Critérios de sucesso
Write-ColoredText "`n🎯 CRITÉRIOS DE SUCESSO" "Yellow"

Write-ColoredText "`n🔧 Funcionais:" "Cyan"
foreach ($criteria in $sessionData.success_criteria.functional) {
    Write-ColoredText "  • $criteria" "White"
}

Write-ColoredText "`n⚙️ Técnicos:" "Cyan"
foreach ($criteria in $sessionData.success_criteria.technical) {
    Write-ColoredText "  • $criteria" "White"
}

Write-ColoredText "`n🎨 UX:" "Cyan"
foreach ($criteria in $sessionData.success_criteria.ux) {
    Write-ColoredText "  • $criteria" "White"
}

# Arquivos a serem modificados
Write-ColoredText "`n📁 ARQUIVOS A SEREM MODIFICADOS" "Yellow"
foreach ($file in $sessionData.files_to_modify) {
    Write-ColoredText "• $file" "DarkCyan"
}

# Status das dependências
Write-ColoredText "`n🔗 STATUS DAS DEPENDÊNCIAS" "Yellow"
foreach ($dep in $sessionData.dependencies.PSObject.Properties) {
    $status = if ($dep.Value -eq $true) { "✅" } elseif ($dep.Value -eq $false) { "❌" } else { "ℹ️" }
    Write-ColoredText "$status $($dep.Name): $($dep.Value)" "White"
}

# Comandos úteis
Write-ColoredText "`n🛠️ COMANDOS ÚTEIS" "Yellow"
Write-ColoredText "Atualizar status de tarefa:" "White"
Write-ColoredText "  powershell -ExecutionPolicy Bypass -File tasks\IntegrationPacientes\update_pacientes_task_status.ps1 -TaskId `"task_id`" -Status `"COMPLETE`" -Notes `"Descrição`"" "DarkGray"
Write-ColoredText "`nTestar conectividade:" "White"
Write-ColoredText "  scripts\test-connectivity.bat" "DarkGray"
Write-ColoredText "`nIniciar frontend:" "White"
Write-ColoredText "  scripts\front.bat" "DarkGray"

# Footer
Write-ColoredText "`n" "White"
Write-ColoredText "=" * 60 "Cyan"
Write-ColoredText "🚀 Pronto para começar a integração de Pacientes!" "Green"
Write-ColoredText "📊 Execute as tarefas na ordem e atualize o progresso regularmente." "White"
Write-ColoredText "=" * 60 "Cyan"