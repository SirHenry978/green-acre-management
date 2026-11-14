import { api } from '@/lib/api';

export const eventKinds = ['planting', 'harvesting', 'maintenance'] as const;
export type EventKind = typeof eventKinds[number];
export interface FarmEvent {
  id: string; branch_id: string; title: string; kind: EventKind; scheduled_date: string;
  status: 'scheduled' | 'completed' | 'cancelled'; notes: string;
  asset: string | null; inventory_item: string | null;
  asset_name?: string; inventory_name?: string; branch_name?: string;
}
export type EventDraft = Omit<FarmEvent, 'id' | 'asset_name' | 'inventory_name' | 'branch_name'>;
export interface CalendarResource { id: string; name: string; branch_id: string }
export const canSchedule = (role?: string, branchId?: string) => role === 'super_admin' || (role === 'branch_manager' && Boolean(branchId));
export function validEvent(event: EventDraft) {
  return Boolean(event.branch_id && event.title.trim() && event.title.length <= 160 && eventKinds.includes(event.kind) && /^\d{4}-\d{2}-\d{2}$/.test(event.scheduled_date));
}
export const resourceMatchesBranch = (resource: CalendarResource, branchId: string) => resource.branch_id === branchId;
export function calendarPath(branchId?: string, id?: string) {
  return `/api/farm-calendar/${id ? `${encodeURIComponent(id)}/` : ''}${branchId ? `?branch=${encodeURIComponent(branchId)}` : ''}`;
}
export async function listEvents(branchId?: string) { return api<FarmEvent[]>(calendarPath(branchId)); }
export async function saveEvent(event: EventDraft, id?: string) {
  if (!validEvent(event)) throw new Error('Enter a title, branch and valid date.');
  return api<FarmEvent>(calendarPath(event.branch_id, id), { method: id ? 'PATCH' : 'POST', body: JSON.stringify({ ...event, title: event.title.trim() }) });
}
export async function deleteEvent(event: FarmEvent) {
  const { apiFetch } = await import('@/lib/api');
  const response = await apiFetch(calendarPath(event.branch_id, event.id), { method: 'DELETE' });
  if (!response.ok) throw new Error('Could not delete this event.');
}
export async function calendarResources(table: 'assets' | 'inventory_items', branchId: string) {
  return api<CalendarResource[]>(`/api/db/${table}/?branch=${encodeURIComponent(branchId)}&branch_id=eq.${encodeURIComponent(branchId)}&order=name.asc`);
}