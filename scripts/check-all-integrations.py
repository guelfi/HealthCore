#!/usr/bin/env python3
"""
📊 Script para Verificar Status de Todas as Integrações
Execução: python scripts/check-all-integrations.py
"""

import subprocess
import sys
import os

def run_script(script_path, description):
    """Executa um script Python e retorna o resultado"""
    try:
        print(f"\n{'='*60}")
        print(f"🔍 Verificando {description}")
        print(f"{'='*60}")
        
        # Mudar para o diretório do projeto
        original_cwd = os.getcwd()
        project_root = os.path.dirname(os.path.dirname(script_path))
        os.chdir(project_root)
        
        # Executar o script
        result = subprocess.run([sys.executable, script_path], 
                              capture_output=True, text=True, timeout=30)
        
        # Restaurar diretório original
        os.chdir(original_cwd)
        
        if result.returncode == 0:
            print(result.stdout)
            return True
        else:
            print(f"❌ Erro ao executar {script_path}")
            print(result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print(f"⏰ Timeout ao executar {script_path}")
        return False
    except Exception as e:
        print(f"❌ Erro ao executar {script_path}: {str(e)}")
        return False

def main():
    print("🚀 VERIFICAÇÃO COMPLETA DE STATUS DAS INTEGRAÇÕES")
    print("=" * 60)
    
    # Scripts para verificar
    scripts = [
        ("tasks/03-IntegrationPacientes/view_pacientes_session_status.py", "Integração de Pacientes"),
        ("tasks/04-IntegrationExames/view_exames_session_status.py", "Integração de Exames"),
        ("tasks/05-IntegrationUsuarios/view_usuarios_session_status.py", "Integração de Usuários"),
        ("tasks/06-IntegrationMedicos/view_medicos_session_status.py", "Integração de Médicos"),
        ("tasks/07-FinalValidation/view_final_validation_status.py", "Validação Final")
    ]
    
    results = []
    
    for script_path, description in scripts:
        full_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), script_path)
        if os.path.exists(full_path):
            success = run_script(full_path, description)
            results.append((description, success))
        else:
            print(f"\n⚠️  Script não encontrado: {full_path}")
            results.append((description, False))
    
    # Resumo final
    print("\n" + "=" * 60)
    print("📊 RESUMO FINAL")
    print("=" * 60)
    
    successful = sum(1 for _, success in results if success)
    total = len(results)
    
    print(f"✅ Integrações verificadas com sucesso: {successful}/{total}")
    
    for description, success in results:
        status = "✅" if success else "❌"
        print(f"{status} {description}")
    
    if successful == total:
        print("\n🎉 Todas as integrações foram verificadas com sucesso!")
    else:
        print(f"\n⚠️  {total - successful} integração(ões) com problemas.")
        print("Verifique os logs acima para mais detalhes.")

if __name__ == "__main__":
    main()