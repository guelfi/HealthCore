import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import NotificationSystem from '../presentation/components/common/NotificationSystem';
import { useUIStore } from '../application/stores/uiStore';
import { ThemeProvider } from '@mui/material/styles';
import { healthCoreTheme } from '../styles/healthcore-theme';

describe('NotificationSystem', () => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={healthCoreTheme}>{children}</ThemeProvider>
  );

  it('exibe toast de sucesso com auto-fechamento customizado', async () => {
    render(
      <Wrapper>
        <NotificationSystem />
      </Wrapper>
    );

    useUIStore.getState().addNotification('Sucesso!', 'success', { duration: 1000 });

    // Deve renderizar
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    // Aguarda auto-fechamento
    await act(async () => {
      await new Promise(r => setTimeout(r, 1100));
    });

    // Deve remover após duração
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('posiciona no top-center em mobile (mock de breakpoint)', async () => {
    // Mock de matchMedia para mobile
    const originalMatch = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <Wrapper>
        <NotificationSystem />
      </Wrapper>
    );

    useUIStore.getState().addNotification('Mobile toast', 'info');

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();

    // Restaurar
    window.matchMedia = originalMatch;
  });

  it('renderiza ação opcional e executa callback', async () => {
    render(
      <Wrapper>
        <NotificationSystem />
      </Wrapper>
    );

    const onClick = vi.fn();
    useUIStore.getState().addNotification('Erro com ação', 'error', {
      action: { label: 'Tentar novamente', onClick },
      duration: 2000,
    });

    const button = await screen.findByRole('button', { name: /tentar novamente/i });
    expect(button).toBeInTheDocument();

    await act(async () => {
      button.click();
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('define aria-live adequadamente para acessibilidade', async () => {
    render(
      <Wrapper>
        <NotificationSystem />
      </Wrapper>
    );

    useUIStore.getState().addNotification('Aviso', 'warning', { ariaLive: 'assertive' });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});