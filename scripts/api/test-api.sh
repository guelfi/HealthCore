#!/bin/bash

# O banco de dados mobilemed.db não é usado pelos testes unitários, que utilizam um banco de dados em memória.
# Portanto, a remoção do arquivo mobilemed.db antes dos testes não é necessária.
# DB_PATH="./src/Api/database/mobilemed.db"
# if [ -f "$DB_PATH" ]; then
#     echo "Removendo banco de dados existente: $DB_PATH" >&2
#     rm "$DB_PATH"
# else
#     echo "Banco de dados não encontrado em $DB_PATH. Criando um novo." >&2
# fi
# echo "" >&2 # Adiciona uma linha em branco para melhor legibilidade

# Script para executar testes unitários da API MobileMed e gerar relatório

# Variáveis para o relatório
REPORT_DIR="reports"
REPORT_FILE="" # Será definido com data e hora

# Função para inicializar o relatório
init_report() {
    mkdir -p "$REPORT_DIR"
    REPORT_FILE="$REPORT_DIR/UNITEST_$(date +%d%m%y_%H%M).md"
    echo "# Relatório de Testes Unitários da API MobileMed" > "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "Data da Execução: $(date +'%Y-%m-%d %H:%M:%S')" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "## Sumário dos Testes" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
}

# Função para adicionar um resultado de teste ao relatório
add_test_summary() {
    local total="$1"
    local passed="$2"
    local failed="$3"
    local skipped="$4"

    echo "### Resultados:" >> "$REPORT_FILE"
    echo "- ✅ Aprovados: $passed" >> "$REPORT_FILE"
    echo "- ❌ Falhas: $failed" >> "$REPORT_FILE"
    echo "- ⚠️ Ignorados: $skipped" >> "$REPORT_FILE"
    echo "- Total: $total" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
}

# Função para adicionar resultados detalhados de testes ao relatório
add_detailed_test_results() {
    local test_output="$1"
    echo "## Detalhes dos Testes" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # Processa cada linha da saída do teste
    echo "$test_output" | while IFS= read -r line; do
        if [[ "$line" =~ ^[[:space:]]*Aprovado[[:space:]]+(.+)[[:space:]]+\[([0-9]+)[[:space:]]*ms\]$ ]]; then
            local test_name="${BASH_REMATCH[1]}"
            local duration="${BASH_REMATCH[2]}"
            echo "- ✅ **Aprovado**: $test_name ($duration ms)" >> "$REPORT_FILE"
        elif [[ "$line" =~ ^[[:space:]]*Com[[:space:]]+falha:[[:space:]]+(.+)$ ]]; then
            local test_name="${BASH_REMATCH[1]}"
            echo "- ❌ **Falha**: $test_name" >> "$REPORT_FILE"
        elif [[ "$line" =~ ^[[:space:]]*Ignorado[[:space:]]+(.+)$ ]]; then
            local test_name="${BASH_REMATCH[1]}"
            echo "- ⚠️ **Ignorado**: $test_name" >> "$REPORT_FILE"
        fi
    done
    echo "" >> "$REPORT_FILE"
}

echo "Testando a API MobileMed (Testes Unitários)..."

# Inicializa o relatório
init_report

# Executa os testes unitários e captura a saída
TEST_OUTPUT=$(dotnet test /Users/guelfi/Projetos/HealthCore/tests/Api.Tests/HealthCore.Api.Tests.csproj --logger "trx;LogFileName=test_results.trx" --no-build --verbosity normal 2>&1 | grep -v "Compilação" | grep -v "Execução" | grep -v "Copyright" | grep -v "Iniciando")
TEST_EXIT_CODE=$?



# Extrai os resultados usando grep e awk
TOTAL_TESTS=$(echo "$TEST_OUTPUT" | grep "Total de testes:" | awk '{print $3}')
PASSED_TESTS=$(echo "$TEST_OUTPUT" | grep "Aprovados:" | awk '{print $2}')
FAILED_TESTS=$(echo "$TEST_OUTPUT" | grep "Com falha:" | awk '{print $2}')
SKIPPED_TESTS=$(echo "$TEST_OUTPUT" | grep "Ignorados:" | awk '{print $2}')

# Adiciona o sumário ao relatório
add_detailed_test_results "$TEST_OUTPUT"

add_test_summary "${TOTAL_TESTS:-0}" "${PASSED_TESTS:-0}" "${FAILED_TESTS:-0}" "${SKIPPED_TESTS:-0}"

echo "Detalhes completos da execução do teste:" >> "$REPORT_FILE"
cat << EOF >> "$REPORT_FILE"
```
$TEST_OUTPUT
```
EOF


if [ "$TEST_EXIT_CODE" -eq 0 ]; then
    echo "✅ Testes unitários concluídos com sucesso. Relatório gerado em $REPORT_FILE."
else
    echo "❌ Testes unitários concluídos com falhas. Relatório gerado em $REPORT_FILE."
    exit 1
fi