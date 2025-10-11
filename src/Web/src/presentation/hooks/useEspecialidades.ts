import { useState, useEffect, useCallback } from 'react';
import { EspecialidadeService } from '../../application/services/especialidadeService';
import type { 
  Especialidade, 
  CreateEspecialidadeDto, 
  UpdateEspecialidadeDto, 
  EspecialidadeFilter 
} from '../../domain/entities';

interface UseEspecialidadesReturn {
  // Estado
  especialidades: Especialidade[];
  loading: boolean;
  error: string | null;
  
  // Paginação
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  
  // Filtros
  filter: EspecialidadeFilter;
  setFilter: (filter: EspecialidadeFilter) => void;
  
  // Ações CRUD
  createEspecialidade: (dto: CreateEspecialidadeDto) => Promise<Especialidade>;
  updateEspecialidade: (id: string, dto: UpdateEspecialidadeDto) => Promise<Especialidade>;
  deleteEspecialidade: (id: string) => Promise<void>;
  getEspecialidadeById: (id: string) => Promise<Especialidade>;
  
  // Utilitários
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useEspecialidades = (initialFilter: EspecialidadeFilter = {}): UseEspecialidadesReturn => {
  // Estado
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<EspecialidadeFilter>({
    page: 1,
    pageSize: 10,
    ...initialFilter
  });
  
  // Estado de paginação
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Carregar especialidades
  const loadEspecialidades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await EspecialidadeService.getEspecialidades(filter);
      
      setEspecialidades(response.items);
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar especialidades';
      setError(errorMessage);
      console.error('Erro ao carregar especialidades:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Efeito para carregar dados quando o filtro muda
  useEffect(() => {
    loadEspecialidades();
  }, [loadEspecialidades]);

  // Criar especialidade
  const createEspecialidade = async (dto: CreateEspecialidadeDto): Promise<Especialidade> => {
    try {
      setLoading(true);
      setError(null);
      
      const novaEspecialidade = await EspecialidadeService.createEspecialidade(dto);
      
      // Recarregar lista
      await loadEspecialidades();
      
      return novaEspecialidade;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar especialidade';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar especialidade
  const updateEspecialidade = async (id: string, dto: UpdateEspecialidadeDto): Promise<Especialidade> => {
    try {
      setLoading(true);
      setError(null);
      
      const especialidadeAtualizada = await EspecialidadeService.updateEspecialidade(id, dto);
      
      // Atualizar lista local
      setEspecialidades(prev => 
        prev.map(esp => esp.id === id ? especialidadeAtualizada : esp)
      );
      
      return especialidadeAtualizada;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar especialidade';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Excluir especialidade
  const deleteEspecialidade = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await EspecialidadeService.deleteEspecialidade(id);
      
      // Recarregar lista
      await loadEspecialidades();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir especialidade';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar especialidade por ID
  const getEspecialidadeById = async (id: string): Promise<Especialidade> => {
    try {
      setError(null);
      return await EspecialidadeService.getEspecialidadeById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar especialidade';
      setError(errorMessage);
      throw err;
    }
  };

  // Refresh manual
  const refresh = async (): Promise<void> => {
    await loadEspecialidades();
  };

  // Limpar erro
  const clearError = (): void => {
    setError(null);
  };

  return {
    // Estado
    especialidades,
    loading,
    error,
    
    // Paginação
    totalItems,
    totalPages,
    currentPage,
    pageSize: filter.pageSize || 10,
    
    // Filtros
    filter,
    setFilter,
    
    // Ações CRUD
    createEspecialidade,
    updateEspecialidade,
    deleteEspecialidade,
    getEspecialidadeById,
    
    // Utilitários
    refresh,
    clearError
  };
};

export default useEspecialidades;
