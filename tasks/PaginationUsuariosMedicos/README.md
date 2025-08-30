# Correção de Paginação para Usuários e Médicos - Guia de Implementação

## Visão Geral
Este documento fornece instruções para corrigir problemas de paginação nos endpoints de Usuários e futuros endpoints de Médicos. Assim como no caso dos Exames, os endpoints retornam listas simples em vez de respostas paginadas com metadados.

## Problemas Identificados

### Usuários
- O método `GetUsersAsync` no `AdminService.cs` retorna `List<UserResponseDto>` em vez de `PagedResponseDto<UserResponseDto>`
- O endpoint `/admin/usuarios` não retorna metadados de paginação

### Médicos
- A entidade Médico ainda não foi implementada conforme documentação
- Futuros endpoints de médicos devem seguir o padrão de paginação

## Solução
Atualizar os serviços para retornar estruturas de resposta paginadas consistentes com o padrão estabelecido.

## Arquivos Necessários
Veja os arquivos individuais nesta pasta para detalhes de implementação específicos.