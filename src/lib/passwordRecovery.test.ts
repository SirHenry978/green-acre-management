import { afterEach, expect, it, vi } from 'vitest';
import { confirmPasswordReset, requestPasswordReset } from './api';

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

it('requests recovery without sending stale credentials or refreshing tokens', async () => {
  localStorage.setItem('farmiq.access', 'stale-test-token');
  const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
  vi.stubGlobal('fetch', fetcher);
  await requestPasswordReset(' worker@example.com ');
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0][0]).toContain('/api/auth/password-reset/');
  expect(fetcher.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ email: 'worker@example.com' });
});

it('sends the reset token and new password to the confirmation endpoint', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
  vi.stubGlobal('fetch', fetcher);
  await confirmPasswordReset('encoded-user', 'reset-token', 'New-test-pass!98');
  expect(fetcher.mock.calls[0][0]).toContain('/api/auth/password-reset/confirm/');
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ uid: 'encoded-user', token: 'reset-token', password: 'New-test-pass!98' });
  expect(localStorage.getItem('farmiq.access')).toBeNull();
});

it('reports an invalid or expired reset instead of claiming success', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Invalid or expired link.' }), { status: 400 })));
  await expect(confirmPasswordReset('u', 't', 'New-test-pass!98')).rejects.toThrow('Invalid or expired link.');
});