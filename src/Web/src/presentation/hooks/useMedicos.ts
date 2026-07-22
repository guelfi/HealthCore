import { useState, useCallback } from 'react';
import {
  MedicoService,
  type MedicoQueryParams,
} from '../../application/services/MedicoService';
import type {
  Medico,
  MedicoListResponse,
  CreateMedicoDto,
  UpdateMedicoDto,
} from '../../domain/entities/Medico';
import { getErrorMessage } from '../../infrastructure/utils/errorMessage';

// Debug discreto para hooks
const debug = {
  log: (..._args: unknown[]) => undefined,
  info: (..._args: unknown[]) => undefined,
  error: (..._args: unknown[]) => undefined,
};

interface UseMedicosState {
  medicos: Medico[];
  total: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

interface UseMedicosActions {
  fetchMedicos: (params?: MedicoQueryParams) => Promise<void>;
  createMedico: (data: CreateMedicoDto) => Promise<Medico>;
  updateMedico: (id: string, data: UpdateMedicoDto) => Promise<Medico>;
  deleteMedico: (id: string) => Promise<void>;
  activateMedico: (id: string) => Promise<Medico>;
  getMedicoById: (id: string) => Promise<Medico>;
  searchMedicos: (nome: string) => Promise<Medico[]>;
  searchMedicosByCRM: (crm: string) => Promise<Medico[]>;
  searchMedicosByEspecialidade: (especialidade: string) => Promise<Medico[]>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useMedicos = (): UseMedicosState & UseMedicosActions => {
  const [state, setState] = useState<UseMedicosState>({
    medicos: [],
    total: 0,
    currentPage: 1,
    totalPages: 0,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const fetchMedicos = useCallback(
    async (params: MedicoQueryParams = {}) => {
      debug.log('Iniciando fetchMedicos com:', params);
      setLoading(true);
      clearError();

      try {
        debug.log('Chamando MedicoService.list...');
        const response: MedicoListResponse =
          await MedicoService.list(params);
        debug.log('Resposta recebida:', response);

        // Garantir que medicos seja sempre um array
        const medicosArray = Array.isArray(response.data) ? response.data : [];
        
        setState(prev => ({
          ...prev,
          medicos: medicosArray,
          total: response.total || 0,
          currentPage: response.page || 1,
          totalPages: response.totalPages || 0,
          loading: false,
        }));
        
        debug.log("Estado final - médicos:", medicosArray.length, "isArray:", Array.isArray(medicosArray));

        debug.log('Estado atualizado com sucesso');
      } catch (error: unknown) {
        debug.error('Erro ao buscar médicos:', error);
        setError(getErrorMessage(error, ''));
        setLoading(false);
      }
    },
    [setLoading, clearError, setError]
  );

  const createMedico = useCallback(
    async (data: CreateMedicoDto): Promise<Medico> => {
      debug.log('Criando médico:', data);
      setLoading(true);
      clearError();

      try {
        const novoMedico = await MedicoService.create(data);
        debug.log('Médico criado:', novoMedico);

        // Atualizar a lista local
        setState(prev => ({
          ...prev,
          medicos: [novoMedico, ...prev.medicos],
          total: prev.total + 1,
          loading: false,
        }));

        debug.log('Estado atualizado após criação');
        return novoMedico;
      } catch (error: unknown) {
        debug.error('Erro ao criar médico:', error);
        setError(getErrorMessage(error, ''));
        setLoading(false);
        throw error;
      }
    },
    [setLoading, clearError, setError]
  );

  const updateMedico = useCallback(
    async (id: string, data: UpdateMedicoDto): Promise<Medico> => {
      debug.log('Atualizando médico:', { id, data });
      setLoading(true);
      clearError();

      try {
        const medicoAtualizado = await MedicoService.update(id, data);
        debug.log('Médico atualizado:', medicoAtualizado);

        // Atualizar a lista local
        setState(prev => ({
          ...prev,
          medicos: prev.medicos.map(medico =>
            medico.id === id ? medicoAtualizado : medico
          ),
          loading: false,
        }));

        debug.log('Estado atualizado após edição');
        return medicoAtualizado;
      } catch (error: unknown) {
        debug.error('Erro ao atualizar médico:', error);
        setError(getErrorMessage(error, ''));
        setLoading(false);
        throw error;
      }
    },
    [setLoading, clearError, setError]
  );

  const deleteMedico = useCallback(
    async (id: string): Promise<void> => {
      debug.log('Removendo médico:', id);
      setLoading(true);
      clearError();

      try {
        await MedicoService.delete(id);
        debug.log('Médico removido com sucesso');

        // Remover da lista local
        setState(prev => ({
          ...prev,
          medicos: prev.medicos.filter(medico => medico.id !== id),
          total: prev.total - 1,
          loading: false,
        }));

        debug.log('Estado atualizado após remoção');
      } catch (error: unknown) {
        debug.error('Erro ao remover médico:', error);
        setError(getErrorMessage(error, ''));
        setLoading(false);
        throw error;
      }
    },
    [setLoading, clearError, setError]
  );

  const activateMedico = useCallback(
    async (id: string): Promise<Medico> => {
      debug.log('Ativando médico:', id);
      setLoading(true);
      clearError();

      try {
        const medicoAtivado = await MedicoService.activate(id);
        debug.log('Médico ativado:', medicoAtivado);

        // Atualizar a lista local
        setState(prev => ({
          ...prev,
          medicos: prev.medicos.map(medico =>
            medico.id === id ? medicoAtivado : medico
          ),
          loading: false,
        }));

        debug.log('Estado atualizado após ativação');
        return medicoAtivado;
      } catch (error: unknown) {
        debug.error('Erro ao ativar médico:', error);
        setError(getErrorMessage(error, ''));
        setLoading(false);
        throw error;
      }
    },
    [setLoading, clearError, setError]
  );

  const getMedicoById = useCallback(
    async (id: string): Promise<Medico> => {
      debug.log('Buscando médico por ID:', id);
      setLoading(true);
      clearError();

      try {
        const medico = await MedicoService.getById(id);
        debug.log('Médico encontrado:', medico);
        setLoading(false);
        return medico;
      } catch (error: unknown) {
        debug.error('Erro ao buscar médico:', error);
        setError(getErrorMessage(error, ''));
        setLoading(false);
        throw error;
      }
    },
    [setLoading, clearError, setError]
  );

  const searchMedicos = useCallback(
    async (nome: string): Promise<Medico[]> => {
      debug.log('Buscando médicos por nome:', nome);
      try {
        const medicos = await MedicoService.searchByName(nome);
        debug.log('Médicos encontrados:', medicos);
        return medicos;
      } catch (error: unknown) {
        debug.error('Erro ao buscar médicos por nome:', error);
        setError(getErrorMessage(error, ''));
        throw error;
      }
    },
    [setError]
  );

  const searchMedicosByCRM = useCallback(
    async (crm: string): Promise<Medico[]> => {
      debug.log('Buscando médicos por CRM:', crm);
      try {
        const medicos = await MedicoService.searchByCRM(crm);
        debug.log('Médicos encontrados por CRM:', medicos);
        return medicos;
      } catch (error: unknown) {
        debug.error('Erro ao buscar médicos por CRM:', error);
        setError(getErrorMessage(error, ''));
        throw error;
      }
    },
    [setError]
  );

  const searchMedicosByEspecialidade = useCallback(
    async (especialidade: string): Promise<Medico[]> => {
      debug.log('Buscando médicos por especialidade:', especialidade);
      try {
        const medicos = await MedicoService.searchByEspecialidade(especialidade);
        debug.log('Médicos encontrados por especialidade:', medicos);
        return medicos;
      } catch (error: unknown) {
        debug.error('Erro ao buscar médicos por especialidade:', error);
        setError(getErrorMessage(error, ''));
        throw error;
      }
    },
    [setError]
  );

  return {
    // State
    medicos: state.medicos,
    total: state.total,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    loading: state.loading,
    error: state.error,
    // Actions
    fetchMedicos,
    createMedico,
    updateMedico,
    deleteMedico,
    activateMedico,
    getMedicoById,
    searchMedicos,
    searchMedicosByCRM,
    searchMedicosByEspecialidade,
    clearError,
    setLoading,
  };
};

export default useMedicos;