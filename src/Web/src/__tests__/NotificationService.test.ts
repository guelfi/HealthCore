import { afterEach, describe, expect, it } from 'vitest';
import NotificationService from '@/application/services/NotificationService';
import { useUIStore } from '@/application/stores/uiStore';

describe('NotificationService', () => {
  afterEach(() => {
    useUIStore.getState().clearNotifications();
  });

  it('uses the default duration and desktop position for errors', () => {
    NotificationService.error('Generic error');

    const notification = useUIStore.getState().notifications[0];
    expect(notification.duration).toBe(7000);
    expect(notification.position).toEqual({ vertical: 'top', horizontal: 'right' });
    expect(notification.ariaLive).toBe('assertive');
  });

  it('maps linked-record conflicts to a friendly message', () => {
    const error = { response: { status: 409, data: { message: 'FK constraint' } } };

    NotificationService.handleApiError(error, { entity: 'medico' });

    expect(useUIStore.getState().notifications[0].message).toContain('registros vinculados');
  });

  it('includes a retry action when one is provided', () => {
    const retry = () => undefined;

    NotificationService.handleApiError(new Error('Failure'), { entity: 'medico', retry });

    const action = useUIStore.getState().notifications[0].action;
    expect(action?.label).toMatch(/Tentar novamente/i);
    expect(action?.onClick).toBe(retry);
  });
});
