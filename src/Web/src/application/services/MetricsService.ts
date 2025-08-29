import { apiClient } from '../../infrastructure/api/client';
import type { DashboardMetrics } from '../../domain/entities/Metrics';
import { UserProfile } from '../../domain/enums/UserProfile';

// Interfaces dos DTOs do Backend
interface AdminMetricsDto {
  totalUsuarios: number;
  totalMedicos: number;
  totalAdministradores: number;
  totalPacientes: number;
  totalExames: number;
  pacientesPorMedico: PacientesPorMedicoDto[];
  crescimentoBaseDados: CrescimentoDto[];
  examesPorPeriodo: ExamesPorPeriodoDto[];
}

interface MedicoMetricsDto {
  numeroPacientes: number;
  totalExames: number;
  examesPorPaciente: ExamesPorPacienteDto[];
  modalidadesMaisUtilizadas: ModalidadeDto[];
}

interface PacientesPorMedicoDto {
  medico: string;
  pacientes: number;
}

interface CrescimentoDto {
  periodo: string;
  novosUsuarios: number;
  novosPacientes: number;
  novosExames: number;
}

interface ExamesPorPeriodoDto {
  periodo: string;
  quantidade: number;
}

interface ExamesPorPacienteDto {
  paciente: string;
  exames: number;
}

interface ModalidadeDto {
  modalidade: string;
  quantidade: number;
}

class MetricsService {
  /**
   * Busca métricas administrativas da API
   */
  async getAdminMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await apiClient.get<AdminMetricsDto>('/admin/metrics');
      return this.adaptAdminMetrics(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar métricas administrativas:', error);
      throw new Error(
        error.response?.data?.message || 
        'Falha ao carregar métricas administrativas'
      );
    }
  }

  /**
   * Busca métricas específicas do médico da API
   */
  async getMedicoMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await apiClient.get<MedicoMetricsDto>('/medico/metrics');
      return this.adaptMedicoMetrics(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar métricas do médico:', error);
      throw new Error(
        error.response?.data?.message || 
        'Falha ao carregar métricas do médico'
      );
    }
  }

  /**
   * Busca métricas baseadas no perfil do usuário
   */
  async getMetricsByUserRole(userRole: UserProfile): Promise<DashboardMetrics> {
    if (userRole === UserProfile.ADMINISTRADOR) {
      return this.getAdminMetrics();
    } else if (userRole === UserProfile.MEDICO) {
      return this.getMedicoMetrics();
    } else {
      throw new Error('Perfil de usuário não suportado para métricas');
    }
  }

  /**
   * Adapta dados do backend (AdminMetricsDto) para o formato frontend (DashboardMetrics)
   */
  private adaptAdminMetrics(data: AdminMetricsDto): DashboardMetrics {
    // Calcular últimos 30 dias baseado nos dados de crescimento
    const ultimoMes = data.crescimentoBaseDados[data.crescimentoBaseDados.length - 1];
    
    return {
      usuarios: {
        totalUsuarios: data.totalUsuarios,
        usuariosPorPerfil: {
          administradores: data.totalAdministradores,
          medicos: data.totalMedicos,
        },
        usuariosAtivos: data.totalMedicos + data.totalAdministradores, // Aproximação
        usuariosInativos: data.totalUsuarios - (data.totalMedicos + data.totalAdministradores),
      },
      pacientes: {
        totalPacientes: data.totalPacientes,
        pacientesPorMedico: data.pacientesPorMedico.map(item => ({
          medicoId: this.generateMedicoId(item.medico), // Gerar ID baseado no nome
          medicoUsername: item.medico,
          totalPacientes: item.pacientes,
        })),
        novosUltimos30Dias: ultimoMes?.novosPacientes || 0,
      },
      exames: {
        totalExames: data.totalExames,
        examesPorModalidade: this.adaptExamesPorModalidade(data.examesPorPeriodo),
        examesPorPeriodo: data.examesPorPeriodo.map(item => ({
          periodo: this.formatPeriodo(item.periodo),
          total: item.quantidade,
        })),
        examesUltimos30Dias: ultimoMes?.novosExames || 0,
      },
      crescimento: {
        usuarios: data.crescimentoBaseDados.map(item => ({
          mes: this.formatPeriodo(item.periodo),
          total: item.novosUsuarios,
        })),
        pacientes: data.crescimentoBaseDados.map(item => ({
          mes: this.formatPeriodo(item.periodo),
          total: item.novosPacientes,
        })),
        exames: data.crescimentoBaseDados.map(item => ({
          mes: this.formatPeriodo(item.periodo),
          total: item.novosExames,
        })),
      },
    };
  }

  /**
   * Adapta dados do backend (MedicoMetricsDto) para o formato frontend (DashboardMetrics)
   */
  private adaptMedicoMetrics(data: MedicoMetricsDto): DashboardMetrics {
    // const agora = new Date(); // Removido: não utilizado
    const examesEsteMes = this.calcularExamesEsteMes(data.examesPorPaciente);
    
    return {
      usuarios: {
        totalUsuarios: 0, // Não aplicável para médicos
        usuariosPorPerfil: {
          administradores: 0,
          medicos: 1, // O médico logado
        },
        usuariosAtivos: 1,
        usuariosInativos: 0,
      },
      pacientes: {
        totalPacientes: data.numeroPacientes,
        pacientesPorMedico: [{
          medicoId: 'current-medico',
          medicoUsername: 'Você',
          totalPacientes: data.numeroPacientes,
        }],
        novosUltimos30Dias: Math.floor(data.numeroPacientes * 0.3), // Aproximação
      },
      exames: {
        totalExames: data.totalExames,
        examesPorModalidade: data.modalidadesMaisUtilizadas.map(item => ({
          modalidade: item.modalidade,
          total: item.quantidade,
        })),
        examesPorPeriodo: this.gerarPeriodosMedico(data.totalExames),
        examesUltimos30Dias: examesEsteMes,
      },
      crescimento: {
        usuarios: this.gerarCrescimentoBasico('usuarios', 1),
        pacientes: this.gerarCrescimentoBasico('pacientes', data.numeroPacientes),
        exames: this.gerarCrescimentoBasico('exames', data.totalExames),
      },
    };
  }

  /**
   * Gera ID único para médico baseado no nome
   */
  private generateMedicoId(medicoNome: string): string {
    return `medico-${medicoNome.toLowerCase().replace(/\s+/g, '-')}`;
  }

  /**
   * Formata período de YYYY-MM para formato legível
   */
  private formatPeriodo(periodo: string): string {
    if (periodo.includes('-')) {
      const [, mes] = periodo.split('-'); // ano não utilizado
      const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return meses[parseInt(mes) - 1] || periodo;
    }
    return periodo;
  }

  /**
   * Adapta dados de exames por período para modalidades (aproximação)
   */
  private adaptExamesPorModalidade(examesPorPeriodo: ExamesPorPeriodoDto[]): Array<{modalidade: string; total: number}> {
    const totalExames = examesPorPeriodo.reduce((sum, item) => sum + item.quantidade, 0);
    
    // Distribuição aproximada das modalidades DICOM
    const modalidades = ['CT', 'MR', 'DX', 'US', 'MG'];
    return modalidades.map((modalidade, index) => ({
      modalidade,
      total: Math.floor(totalExames * (0.3 - index * 0.05)), // Distribuição decrescente
    })).filter(item => item.total > 0);
  }

  /**
   * Calcula exames realizados no mês atual (aproximação)
   */
  private calcularExamesEsteMes(examesPorPaciente: ExamesPorPacienteDto[]): number {
    const totalExames = examesPorPaciente.reduce((sum, item) => sum + item.exames, 0);
    return Math.floor(totalExames * 0.4); // Aproximação: 40% dos exames no mês atual
  }

  /**
   * Gera períodos simulados para médicos
   */
  private gerarPeriodosMedico(totalExames: number): Array<{periodo: string; total: number}> {
    const meses = ['Janeiro', 'Fevereiro', 'Março'];
    const distribuicao = [0.2, 0.3, 0.5]; // Distribuição crescente
    
    return meses.map((mes, index) => ({
      periodo: mes,
      total: Math.floor(totalExames * distribuicao[index]),
    }));
  }

  /**
   * Gera dados básicos de crescimento para médicos
   */
  private gerarCrescimentoBasico(tipo: string, total: number): Array<{mes: string; total: number}> {
    const meses = ['Janeiro', 'Fevereiro', 'Março'];
    const bases = tipo === 'usuarios' ? [1, 1, 1] : [0.6, 0.8, 1.0];
    
    return meses.map((mes, index) => ({
      mes,
      total: Math.floor(total * bases[index]),
    }));
  }
}

// Exportar instância singleton
export const metricsService = new MetricsService();
export default metricsService;