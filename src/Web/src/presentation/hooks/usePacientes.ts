import { useState, useCallback } from 'react';
import { PacienteService, type PacienteQueryParams } from '../../application/services/PacienteService';
import type { 
  Paciente, 
  CreatePacienteDto, 
  UpdatePacienteDto, 
  PacienteListResponse 
} from '../../domain/entities/Paciente';

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

  const fetchPacientes = useCallback(async (params: PacienteQueryParams = {}) => {
    setLoading(true);
    clearError();
    
    try {
      const response: PacienteListResponse = await PacienteService.list(params);
      
      setState(prev => ({
        ...prev,
        pacientes: response.data,
        total: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Erro ao carregar pacientes';
      
      setError(errorMessage);
      setLoading(false);
    }
  }, [setLoading, clearError]);

  const createPaciente = useCallback(async (data: CreatePacienteDto): Promise<Paciente> => {
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Erro ao criar paciente';
      
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [setLoading, clearError]);

  const updatePaciente = useCallback(async (id: string, data: UpdatePacienteDto): Promise<Paciente> => {
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Erro ao atualizar paciente';
      
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [setLoading, clearError]);

  const deletePaciente = useCallback(async (id: string): Promise<void> => {
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Erro ao deletar paciente';
      
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [setLoading, clearError]);

  const getPacienteById = useCallback(async (id: string): Promise<Paciente> => {
    setLoading(true);
    clearError();
    
    try {
      const paciente = await PacienteService.getById(id);
      setLoading(false);
      return paciente;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Erro ao buscar paciente';
      
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [setLoading, clearError]);

  const searchPacientes = useCallback(async (nome: string): Promise<Paciente[]> => {
    try {
      return await PacienteService.searchByName(nome);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Erro na pesquisa de pacientes';
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setError]);

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