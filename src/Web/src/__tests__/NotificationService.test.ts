import { describe, it, expect, vi } from 'vitest';
import NotificationService from '@/application/services/NotificationService';
import { useUIStore } from '@/stores/uiStore';

describe('NotificationService', () => {
  it('exibe toast top-right com duração padrão (7s) para erro genérico', () => {
    const spy = vi.spyOn(useUIStore.getState(), 'addNotification');
    NotificationService.error('Erro qualquer');
    expect(spy).toHaveBeenCalled();
    const args = spy.mock.calls[0];
    expect(args[0]).toBe('Erro qualquer');
    expect(args[1]).toBe('error');
    const options = args[2];
    expect(options?.duration).toBe(7000);
    expect(options?.position).toEqual({ vertical: 'top', horizontal: 'right' });
  });

  it('mapeia 409 para mensagem amigável de médico com FK vinculada', () => {
    const spy = vi.spyOn(useUIStore.getState(), 'addNotification');
    const error = { response: { status: 409, data: { message: 'FK constraint' } } } as any;
    NotificationService.handleApiError(error, { entity: 'medico' });
    const calledMessage = spy.mock.calls[0][0];
    expect(calledMessage).toMatch(/Não é possível excluir este médico/);
  });

  it('usa ação de retry quando fornecida', () => {
    const spy = vi.spyOn(useUIStore.getState(), 'addNotification');
    const retry = vi.fn();
    NotificationService.handleApiError(new Error('Falha'), { entity: 'medico', retry });
    const options = spy.mock.calls[0][2];
    expect(options?.action?.label).toMatch(/Tentar novamente/i);
    expect(typeof options?.action?.onClick).toBe('function');
  });
});