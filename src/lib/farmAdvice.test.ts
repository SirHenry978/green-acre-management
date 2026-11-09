import { describe, it, expect, vi, afterEach } from 'vitest';
import { canRequestAdvice, validProblem, requestFarmAdvice } from './farmAdvice';

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

describe('farm advice access', () => {
  it('allows a branch manager assigned to a branch', () => expect(canRequestAdvice('branch_manager', 'branch-1')).toBe(true));
  it('denies a manager without a branch', () => expect(canRequestAdvice('branch_manager', null)).toBe(false));
  it('allows super admin oversight', () => expect(canRequestAdvice('super_admin', null)).toBe(true));
  it.each(['field_staff', 'accountant', 'inventory_staff', undefined])('denies non-management role %s', role => expect(canRequestAdvice(role, 'branch-1')).toBe(false));
});

const problem = { kind: 'crop' as const, subject: 'Maize', description: 'Leaves have yellow edges and brown spots.', context: '' };
it('accepts a crop problem and rejects invalid categories', () => {
  expect(validProblem(problem)).toBe(true);
  expect(validProblem({ ...problem, kind: 'other' })).toBe(false);
});
it('requires enough observations', () => expect(validProblem({ ...problem, description: 'short' })).toBe(false));
it('rejects oversized input', () => expect(validProblem({ ...problem, description: 'a'.repeat(6001) })).toBe(false));
it('streams advice after validating the Django session', async () => {
  localStorage.setItem('farmiq.access', 'test-only-token');
  const fetcher = vi.fn().mockResolvedValueOnce(new Response('{}')).mockResolvedValueOnce(new Response('data: {"text":"Check soil moisture."}\n\ndata: {"done":true}\n\n'));
  vi.stubGlobal('fetch', fetcher);
  const update = vi.fn();
  await requestFarmAdvice(problem, update, new AbortController().signal);
  expect(fetcher.mock.calls[0][0]).toContain('/api/me/');
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual(problem);
  expect(update).toHaveBeenLastCalledWith('Check soil moisture.');
});
it('surfaces a blocked request without retrying', async () => {
  localStorage.setItem('farmiq.access', 'test-only-token');
  const fetcher = vi.fn().mockResolvedValueOnce(new Response('{}')).mockResolvedValueOnce(new Response('{"error":"AI credits are exhausted."}', { status: 402 }));
  vi.stubGlobal('fetch', fetcher);
  await expect(requestFarmAdvice(problem, vi.fn(), new AbortController().signal)).rejects.toThrow('AI credits are exhausted.');
  expect(fetcher).toHaveBeenCalledTimes(2);
});