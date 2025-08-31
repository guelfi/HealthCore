import { useState, useCallback } from 'react';
import {
  ExameService,
  type ExameQueryParams,
} from '../../application/services/ExameService';
import type {
  Exame as ExameEntity,
  CreateExameDto,
  UpdateExameDto,
  ExameListResponse,
} from '../../domain/entities/Exame';

// Re-export Exame type for hook consumers
export type { Exame } from '../../domain/entities/Exame';
import { ModalidadeDicom } from '../../domain/enums/ModalidadeDicom';

interface UseExamesState {
  exames: ExameEntity[];
  total: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

interface UseExamesActions {
  fetchExames: (params?: ExameQueryParams) => Promise<void>;
  createExame: (data: CreateExameDto) => Promise<ExameEntity>;
  updateExame: (id: string, data: UpdateExameDto) => Promise<ExameEntity>;
  deleteExame: (id: string) => Promise<void>;
  getExameById: (id: string) => Promise<ExameEntity>;
  getExamesByPaciente: (
    pacienteId: string,
    params?: Omit<ExameQueryParams, 'pacienteId'>
  ) => Promise<void>;
  getExamesByModalidade: (
    modalidade: ModalidadeDicom,
    params?: Omit<ExameQueryParams, 'modalidade'>
  ) => Promise<void>;
  getExamesByPeriodo: (
    dataInicio: Date,
    dataFim: Date,
    params?: Omit<ExameQueryParams, 'dataInicio' | 'dataFim'>
  ) => Promise<void>;
  checkIdempotency: (idempotencyKey: string) => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useExames = (): UseExamesState & UseExamesActions => {
  const [state, setState] = useState<UseExamesState>({
    exames: [],
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

  const updateExamesState = useCallback((response: ExameListResponse) => {
    setState(prev => ({
      ...prev,
      exames: response.data,
      total: response.total,
      currentPage: response.page,
      totalPages: response.totalPages,
      loading: false,
    }));
  }, []);

  const fetchExames = useCallback(
    async (params: ExameQueryParams = {}) => {
      setLoading(true);
      clearError();

      try {
        const response = await ExameService.list(params);
        updateExamesState(response);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Erro ao carregar exames';

        setError(errorMessage);
        setLoading(false);
      }
    },
    [setLoading, clearError, updateExamesState]
  );

  const createExame = useCallback(
    async (data: CreateExameDto): Promise<ExameEntity> => {
      setLoading(true);
      clearError();

      try {
        const newExame = await ExameService.create(data);

        setState(prev => ({
          ...prev,
          exames: [newExame, ...prev.exames],
          total: prev.total + 1,
          loading: false,
        }));

        return newExame;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Erro ao criar exame';

        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    },
    [setLoading, clearError]
  );

  const updateExame = useCallback(
    async (id: string, data: UpdateExameDto): Promise<ExameEntity> => {
      setLoading(true);
      clearError();

      try {
        const updatedExame = await ExameService.update(id, data);

        setState(prev => ({
          ...prev,
          exames: prev.exames.map(e => (e.id === id ? updatedExame : e)),
          loading: false,
        }));

        return updatedExame;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Erro ao atualizar exame';

        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    },
    [setLoading, clearError]
  );

  const deleteExame = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      clearError();

      try {
        await ExameService.delete(id);

        setState(prev => ({
          ...prev,
          exames: prev.exames.filter(e => e.id !== id),
          total: prev.total - 1,
          loading: false,
        }));
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Erro ao deletar exame';

        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    },
    [setLoading, clearError]
  );

  const getExameById = useCallback(
    async (id: string): Promise<ExameEntity> => {
      setLoading(true);
      clearError();

      try {
        const exame = await ExameService.getById(id);
        setLoading(false);
        return exame;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Erro ao buscar exame';

        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    },
    [setLoading, clearError]
  );

  const getExamesByPaciente = useCallback(
    async (
      pacienteId: string,
      params: Omit<ExameQueryParams, 'pacienteId'> = {}
    ) => {
      setLoading(true);
      clearError();

      try {
        const response = await ExameService.getByPacienteId(pacienteId, params);
        updateExamesState(response);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Erro ao carregar exames do paciente';

        setError(errorMessage);
        setLoading(false);
      }
    },
    [setLoading, clearError, updateExamesState]
  );

  const getExamesByModalidade = useCallback(
    async (
      modalidade: ModalidadeDicom,
      params: Omit<ExameQueryParams, 'modalidade'> = {}
    ) => {
      setLoading(true);
      clearError();

      try {
        const response = await ExameService.getByModalidade(modalidade, params);
        updateExamesState(response);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Erro ao carregar exames por modalidade';

        setError(errorMessage);
        setLoading(false);
      }
    },
    [setLoading, clearError, updateExamesState]
  );

  const getExamesByPeriodo = useCallback(
    async (
      dataInicio: Date,
      dataFim: Date,
      params: Omit<ExameQueryParams, 'dataInicio' | 'dataFim'> = {}
    ) => {
      setLoading(true);
      clearError();

      try {
        const response = await ExameService.getByPeriodo(
          dataInicio,
          dataFim,
          params
        );
        updateExamesState(response);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Erro ao carregar exames por período';

        setError(errorMessage);
        setLoading(false);
      }
    },
    [setLoading, clearError, updateExamesState]
  );

  const checkIdempotency = useCallback(
    async (idempotencyKey: string): Promise<boolean> => {
      try {
        return await ExameService.checkIdempotency(idempotencyKey);
      } catch (error: any) {
        console.warn('Erro ao verificar idempotência:', error);
        return false;
      }
    },
    []
  );

  return {
    ...state,
    fetchExames,
    createExame,
    updateExame,
    deleteExame,
    getExameById,
    getExamesByPaciente,
    getExamesByModalidade,
    getExamesByPeriodo,
    checkIdempotency,
    clearError,
    setLoading,
  };
};

export default useExames;
