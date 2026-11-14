import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canSchedule, validEvent, resourceMatchesBranch, calendarPath, saveEvent, type EventDraft } from './farmCalendar';
const api = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ api }));
const draft: EventDraft = { branch_id: 'north', title: 'Plant maize', kind: 'planting', scheduled_date: '2026-11-20', status: 'scheduled', notes: '', asset: null, inventory_item: null };
describe('farm scheduling rules', () => {
  beforeEach(() => api.mockReset());
  it('allows assigned branch managers', () => expect(canSchedule('branch_manager', 'north')).toBe(true));
  it('denies managers without a branch', () => expect(canSchedule('branch_manager')).toBe(false));
  it('denies staff', () => expect(canSchedule('field_staff', 'north')).toBe(false));
  it('allows administrator oversight', () => expect(canSchedule('super_admin')).toBe(true));
  it('accepts planting, harvesting and maintenance dates', () => {
    for (const kind of ['planting', 'harvesting', 'maintenance'] as const) expect(validEvent({ ...draft, kind })).toBe(true);
    expect(validEvent({ ...draft, kind: 'other' as EventDraft['kind'] })).toBe(false);
  });
  it('rejects resources from another branch', () => expect(resourceMatchesBranch({ id: 'tractor', name: 'Tractor', branch_id: 'south' }, 'north')).toBe(false));
  it('sends explicit branch scope on reads', () => expect(calendarPath('north')).toBe('/api/farm-calendar/?branch=north'));
  it('sends linked assets and inventory when saving', async () => {
    api.mockResolvedValue({ id: 'event-1' });
    await saveEvent({ ...draft, asset: 'tractor', inventory_item: 'seed' });
    expect(api).toHaveBeenCalledWith('/api/farm-calendar/?branch=north', expect.objectContaining({ method: 'POST', body: JSON.stringify({ ...draft, asset: 'tractor', inventory_item: 'seed' }) }));
  });
});