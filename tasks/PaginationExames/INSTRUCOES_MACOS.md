# Instruções para Correção de Paginação no macOS

## Problema
O componente ExamesPageTable não está paginando corretamente porque o endpoint da API `/exames` retorna uma lista simples em vez de uma resposta paginada com metadados.

## Solução Necessária
Atualizar o método `GetExamesAsync` no serviço de exames para retornar a estrutura de resposta paginada.

## Arquivos Disponíveis
1. `ExameService_GetExamesAsync_FIX.cs` - Implementação corrigida do método
2. `API_RESPONSE_EXAMPLE.json` - Exemplo da estrutura de resposta esperada

## Passos para Implementação

1. **Localizar o arquivo a ser modificado**:
   - Caminho: `src/Api/Core/Application/Services/ExameService.cs`
   - Método: `GetExamesAsync` (linha ~69)

2. **Substituir o método existente**:
   - Copiar o conteúdo de `ExameService_GetExamesAsync_FIX.cs`
   - Substituir o método `GetExamesAsync` existente

3. **Verificar a assinatura do método**:
   - Alterar o tipo de retorno de `Task<List<ExameDto>>` para `Task<PagedResponseDto<ExameDto>>`

4. **Testar a implementação**:
   - Fazer build do projeto
   - Executar a API
   - Testar o endpoint `/exames?page=1&pageSize=10`

## Estrutura de Resposta Esperada
Após a correção, o endpoint deve retornar:
```json
{
  "data": [...],
  "total": 83,
  "page": 1,
  "pageSize": 10,
  "totalPages": 9
}
```

## Verificação
1. O frontend deve mostrar 9 páginas para 83 exames (10 por página)
2. A paginação deve funcionar corretamente
3. O total de exames deve ser exibido corretamente

## Após Implementação
1. Commit e push das mudanças
2. Notificar a equipe frontend para testar a integração