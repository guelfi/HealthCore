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
        error.response?.data?.message || 'Falha ao carregar métricas do médico'
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
    const ultimoMes =
      data.crescimentoBaseDados[data.crescimentoBaseDados.length - 1];

    return {
      usuarios: {
        totalUsuarios: data.totalUsuarios,
        usuariosPorPerfil: {
          administradores: data.totalAdministradores,
          medicos: data.totalMedicos,
        },
        usuariosAtivos: data.totalMedicos + data.totalAdministradores, // Aproximação
        usuariosInativos:
          data.totalUsuarios - (data.totalMedicos + data.totalAdministradores),
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
        examesPorModalidade: this.adaptExamesPorModalidade(
          data.examesPorPeriodo
        ),
        examesPorPeriodo: data.examesPorPeriodo.map(item => ({
          periodo: this.formatPeriodo(item.periodo),
          total: item.quantidade,
        })),
        examesUltimos30Dias: ultimoMes?.novosExames || 0,
      },
      crescimento: {
        usuarios: this.garantir6MesesDados(
          data.crescimentoBaseDados,
          'usuarios'
        ),
        pacientes: this.garantir6MesesDados(
          data.crescimentoBaseDados,
          'pacientes'
        ),
        exames: this.garantir6MesesDados(data.crescimentoBaseDados, 'exames'),
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
        pacientesPorMedico: [
          {
            medicoId: 'current-medico',
            medicoUsername: 'Você',
            totalPacientes: data.numeroPacientes,
          },
        ],
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
        pacientes: this.gerarCrescimentoBasico(
          'pacientes',
          data.numeroPacientes
        ),
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
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ];
      return meses[parseInt(mes) - 1] || periodo;
    }
    return periodo;
  }

  /**
   * Adapta dados de exames por período para modalidades (aproximação)
   */
  private adaptExamesPorModalidade(
    examesPorPeriodo: ExamesPorPeriodoDto[]
  ): Array<{ modalidade: string; total: number }> {
    const totalExames = examesPorPeriodo.reduce(
      (sum, item) => sum + item.quantidade,
      0
    );

    // Distribuição aproximada das modalidades DICOM
    const modalidades = ['CT', 'MR', 'DX', 'US', 'MG'];
    return modalidades
      .map((modalidade, index) => ({
        modalidade,
        total: Math.floor(totalExames * (0.3 - index * 0.05)), // Distribuição decrescente
      }))
      .filter(item => item.total > 0);
  }

  /**
   * Calcula exames realizados no mês atual (aproximação)
   */
  private calcularExamesEsteMes(
    examesPorPaciente: ExamesPorPacienteDto[]
  ): number {
    const totalExames = examesPorPaciente.reduce(
      (sum, item) => sum + item.exames,
      0
    );
    return Math.floor(totalExames * 0.4); // Aproximação: 40% dos exames no mês atual
  }

  /**
   * Gera períodos simulados para médicos (últimos 6 meses, mês atual primeiro)
   */
  private gerarPeriodosMedico(
    totalExames: number
  ): Array<{ periodo: string; total: number }> {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const agora = new Date();
    const resultado = [];

    // Gerar últimos 6 meses, começando pelo atual
    for (let i = 0; i < 6; i++) {
      const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const mesIndex = data.getMonth();
      const distribuicao = 0.05 + Math.random() * 0.15; // Distribuição aleatória entre 5% e 20%

      resultado.push({
        periodo: meses[mesIndex],
        total: Math.floor(totalExames * distribuicao),
      });
    }

    return resultado;
  }

  /**
   * Garante que sempre tenhamos 6 meses de dados, preenchendo meses faltantes
   */
  private garantir6MesesDados(
    crescimentoBaseDados: CrescimentoDto[],
    tipo: 'usuarios' | 'pacientes' | 'exames'
  ): Array<{ mes: string; total: number | string }> {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const agora = new Date();
    const resultado = [];

    // Mapear dados do backend por período
    const dadosBackend = new Map<string, number>();
    crescimentoBaseDados.forEach(item => {
      const mesFormatado = this.formatPeriodo(item.periodo);
      let valor: number;
      switch (tipo) {
        case 'usuarios':
          valor = item.novosUsuarios;
          break;
        case 'pacientes':
          valor = item.novosPacientes;
          break;
        case 'exames':
          valor = item.novosExames;
          break;
      }
      dadosBackend.set(mesFormatado, valor);
    });

    // Gerar últimos 6 meses, começando pelo atual
    for (let i = 0; i < 6; i++) {
      const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const mesIndex = data.getMonth();
      const mesNome = meses[mesIndex];

      // Verificar se temos dados para este mês
      const valorBackend = dadosBackend.get(mesNome);

      resultado.push({
        mes: mesNome,
        total:
          valorBackend !== undefined
            ? valorBackend
            : 'Sem informações do período',
      });
    }

    return resultado;
  }

  /**
   * Gera dados básicos de crescimento para médicos (últimos 6 meses, mês atual primeiro)
   */
  private gerarCrescimentoBasico(
    tipo: string,
    total: number
  ): Array<{ mes: string; total: number }> {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const agora = new Date();
    const resultado = [];

    // Gerar últimos 6 meses, começando pelo atual
    for (let i = 0; i < 6; i++) {
      const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const mesIndex = data.getMonth();

      let distribuicao;
      if (tipo === 'usuarios') {
        distribuicao = 0.08 + Math.random() * 0.04; // Entre 8% e 12% para usuários
      } else {
        distribuicao = 0.05 + Math.random() * 0.1; // Entre 5% e 15% para pacientes/exames
      }

      resultado.push({
        mes: meses[mesIndex],
        total: Math.floor(total * distribuicao),
      });
    }

    return resultado;
  }
}

// Exportar instância singleton
export const metricsService = new MetricsService();
export default metricsService;
