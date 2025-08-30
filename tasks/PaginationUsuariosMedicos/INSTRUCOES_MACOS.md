# Instruções para Correção de Paginação em Usuários e Médicos no macOS

## Problemas Identificados
1. **Usuários**: O endpoint `/admin/usuarios` retorna uma lista simples em vez de uma resposta paginada
2. **Médicos**: A implementação ainda será feita, mas deve seguir o padrão de paginação

## Solução para Usuários

### Arquivo a ser modificado
- Caminho: `src/Api/Core/Application/Services/AdminService.cs`
- Método: `GetUsersAsync` (linha ~74)

### Alterações Necessárias
1. **Atualizar assinatura do método**:
   - De: `Task<List<UserResponseDto>> GetUsersAsync(int page = 1, int pageSize = 10)`
   - Para: `Task<PagedResponseDto<UserResponseDto>> GetUsersAsync(int page = 1, int pageSize = 10)`

2. **Atualizar implementação**:
   - Copiar o conteúdo de `AdminService_GetUsersAsync_FIX.cs`
   - Substituir o método existente
   - Calcular metadados de paginação (total, totalPages, etc.)

3. **Atualizar endpoint**:
   - O endpoint `/admin/usuarios` já está correto, apenas o serviço precisa ser atualizado

## Estrutura de Resposta Esperada para Usuários
Após a correção, o endpoint deve retornar:
```json
{
  "data": [...],
  "total": 15,
  "page": 1,
  "pageSize": 10,
  "totalPages": 2
}
```

## Considerações para Médicos
Quando for implementar a entidade Médicos:
1. Criar DTOs seguindo o padrão paginado
2. Implementar serviços com paginação
3. Manter consistência com os outros serviços

## Verificação
1. O frontend de usuários deve mostrar paginação correta
2. O total de usuários deve ser exibido corretamente
3. A navegação entre páginas deve funcionar

## Após Implementação
1. Commit e push das mudanças
2. Notificar a equipe frontend para testar a integração