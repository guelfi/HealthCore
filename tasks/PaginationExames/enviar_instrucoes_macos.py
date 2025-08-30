#!/usr/bin/env python3
"""
Script para preparar e enviar instruções de correção de paginação para o time do macOS
"""

import os
import shutil
import json
from pathlib import Path

def main():
    # Diretório atual
    current_dir = Path("c:/Users/SP-MGUELFI/Projetos/DesafioTecnico/tasks/PaginationExames")
    
    print("=== Preparando arquivos para envio ao time do macOS ===")
    
    # Verificar se todos os arquivos necessários existem
    arquivos_necessarios = [
        "ExameService_GetExamesAsync_FIX.cs",
        "INSTRUCOES_MACOS.md",
        "API_RESPONSE_EXAMPLE.json",
        "README.md",
        "RESUMO_CORRECAO.md"
    ]
    
    print("\nVerificando arquivos necessários:")
    for arquivo in arquivos_necessarios:
        caminho = current_dir / arquivo
        if caminho.exists():
            print(f"✓ {arquivo}")
        else:
            print(f"✗ {arquivo} - ARQUIVO NÃO ENCONTRADO")
    
    print("\n=== Instruções para o time do macOS ===")
    print("1. Copiar todos os arquivos desta pasta para o ambiente macOS")
    print("2. Seguir as instruções em INSTRUCOES_MACOS.md")
    print("3. Implementar a correção no arquivo ExameService.cs")
    print("4. Testar a API localmente")
    print("5. Fazer commit e push das mudanças")
    print("6. Notificar a equipe frontend para continuar a integração")
    
    print("\n=== Estrutura de resposta esperada ===")
    with open(current_dir / "API_RESPONSE_EXAMPLE.json", "r", encoding="utf-8") as f:
        exemplo = json.load(f)
        print(json.dumps(exemplo, indent=2, ensure_ascii=False))
    
    print("\n=== Pronto para envio ===")
    print("Os arquivos estão prontos para serem enviados ao time do macOS.")

if __name__ == "__main__":
    main()