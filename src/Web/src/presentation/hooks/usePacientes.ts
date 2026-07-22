import { useState, useCallback } from 'react';
import {
  PacienteService,
  type PacienteQueryParams,
} from '../../application/services/PacienteService';
import type {
  Paciente,
  PacienteListResponse,
  CreatePacienteDto,
  UpdatePacienteDto,
} from '../../domain/entities/Paciente';
import { getApiErrorResponse, getErrorMessage } from '../../infrastructure/utils/errorMessage';

// Debug discreto para hooks
const debug = {
  log: (..._args: unknown[]) => undefined,
  info: (..._args: unknown[]) => undefined,
  error: (..._args: unknown[]) => undefined,
};

interface UsePacientesState {
  pacientes: Paciente[];
  total: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

interface UsePacientesActions {
  fetchPacientes: (params?: PacienteQueryParams) => Promise<void>;
  createPaciente: (data: CreatePacienteDto) => Promise<Paciente>;
  updatePaciente: (id: string, data: UpdatePacienteDto) => Promise<Paciente>;
  deletePaciente: (id: string) => Promise<void>;
  getPacienteById: (id: string) => Promise<Paciente>;
  searchPacientes: (nome: string) => Promise<Paciente[]>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const usePacientes = (): UsePacientesState & UsePacientesActions => {
  const [state, setState] = useState<UsePacientesState>({
    pacientes: [],
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

  const fetchPacientes = useCallback(
    async (params: PacienteQueryParams = {}) => {
      debug.log('Iniciando fetchPacientes com:', params);
      setLoading(true);
      clearError();

      try {
        debug.log('Chamando PacienteService.list...');
        const response: PacienteListResponse =
          await PacienteService.list(params);
        debug.log('Resposta recebida:', response);

        // Garantir que pacientes seja sempre um array
        const pacientesArray = Array.isArray(response.data) ? response.data : [];
        
        setState(prev => ({
          ...prev,
          pacientes: pacientesArray,
          total: response.total || 0,
          currentPage: response.page || 1,
          totalPages: response.totalPages || 0,
          loading: false,
        }));
        
        debug.log('Estado final atualizado:', {
          pacientes: pacientesArray.length,
          total: response.total,
          isArray: Array.isArray(pacientesArray)
        });

        debug.log('Estado atualizado - pacientes:', response.data.length);
      } catch (error: unknown) {
        debug.log('Erro ao buscar pacientes:', {
          message: getErrorMessage(error, 'Erro desconhecido'),
          status: getApiErrorResponse(error)?.status,
          data: getApiErrorResponse(error)?.data,
        });
        const errorMessage = getErrorMessage(error, '');

        setError(errorMessage);
        setLoading(false);
      }
    },
    [setLoading, clearError, setError]
  );

  const createPaciente = useCallback(
    async (data: CreatePacienteDto): Promise<Paciente> => {
      setLoading(true);
      clearError();

      try {
        const newPaciente = await PacienteService.create(data);

        setState(prev => ({
          ...prev,
          pacientes: [newPaciente, ...prev.pacientes],
          total: prev.total + 1,
          loading: false,
        }));

        return newPaciente;
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, '');

        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    },
    [setLoading, clearError, setError]
  );

  const updatePaciente = useCallback(
    async (id: string, data: UpdatePacienteDto): Promise<Paciente> => {
      setLoading(true);
      clearError();

      try {
        const updatedPaciente = await PacienteService.update(id, data);

        setState(prev => ({
          ...prev,
          pacientes: prev.pacientes.map(p =>
            p.id === id ? updatedPaciente : p
          ),
          loading: false,
        }));

        return updatedPaciente;
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, '');

        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    },
    [setLoading, clearError, setError]
  );

  const deletePaciente = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      clearError();

      try {
        await PacienteService.delete(id);

        setState(prev => ({
          ...prev,
          pacientes: prev.pacientes.filter(p => p.id !== id),
          total: prev.total - 1,
          loading: false,
        }));
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, '');

        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    },
    [setLoading, clearError, setError]
  );

  const getPacienteById = useCallback(
    async (id: string): Promise<Paciente> => {
      setLoading(true);
      clearError();

      try {
        const paciente = await PacienteService.getById(id);
        setLoading(false);
        return paciente;
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, '');

        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    },
    [setLoading, clearError, setError]
  );

  const searchPacientes = useCallback(
    async (nome: string): Promise<Paciente[]> => {
      try {
        return await PacienteService.searchByName(nome);
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, '');

        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [setError]
  );

  return {
    ...state,
    fetchPacientes,
    createPaciente,
    updatePaciente,
    deletePaciente,
    getPacienteById,
    searchPacientes,
    clearError,
    setLoading,
  };
};

export default usePacientes;
