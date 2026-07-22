import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import NotificationSystem from '../presentation/components/common/NotificationSystem';
import { useUIStore } from '../application/stores/uiStore';
import { healthCoreTheme } from '../styles/healthcore-theme';

describe('NotificationSystem', () => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={healthCoreTheme}>{children}</ThemeProvider>
  );

  afterEach(() => {
    act(() => {
      useUIStore.getState().clearNotifications();
    });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders and automatically closes a notification', async () => {
    render(
      <Wrapper>
        <NotificationSystem />
      </Wrapper>
    );

    act(() => {
      useUIStore.getState().addNotification('Success', 'success', { duration: 1000 });
    });

    expect(await screen.findByText('Success')).toBeInTheDocument();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(screen.queryByText('Success')).not.toBeInTheDocument();
  });

  it('renders notifications in a mobile viewport', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('max-width'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );

    render(
      <Wrapper>
        <NotificationSystem />
      </Wrapper>
    );

    act(() => {
      useUIStore.getState().addNotification('Mobile notification', 'info');
    });

    expect(await screen.findByText('Mobile notification')).toBeInTheDocument();
  });

  it('renders an optional action and invokes its callback', async () => {
    render(
      <Wrapper>
        <NotificationSystem />
      </Wrapper>
    );

    const onClick = vi.fn();
    act(() => {
      useUIStore.getState().addNotification('Action error', 'error', {
        action: { label: 'Retry', onClick },
        duration: 2000,
      });
    });

    const button = await screen.findByRole('button', { name: 'Retry' });
    await act(async () => {
      button.click();
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies the requested aria-live mode to the matching alert', async () => {
    render(
      <Wrapper>
        <NotificationSystem />
      </Wrapper>
    );

    act(() => {
      useUIStore.getState().addNotification('Accessible warning', 'warning', {
        ariaLive: 'assertive',
      });
    });

    const message = await screen.findByText('Accessible warning');
    expect(message.closest('[role="alert"]')).toHaveAttribute('aria-live', 'assertive');
  });
});
