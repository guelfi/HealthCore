import { useState, useEffect } from 'react';
import { EspecialidadeService } from '../../application/services/especialidadeService';
import type { Especialidade } from '../../domain/entities';

interface UseEspecialidadesForDropdownReturn {
  especialidades: Especialidade[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useEspecialidadesForDropdown = (): UseEspecialidadesForDropdownReturn => {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEspecialidades = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const especialidadesAtivas = await EspecialidadeService.getEspecialidadesAtivas();
      setEspecialidades(especialidadesAtivas);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar especialidades';
      setError(errorMessage);
      console.error('Erro ao carregar especialidades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEspecialidades();
  }, []);

  const refresh = async () => {
    await loadEspecialidades();
  };

  return {
    especialidades,
    loading,
    error,
    refresh,
  };
};

export default useEspecialidadesForDropdown;
