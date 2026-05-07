import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AccHouse {
  id: string;
  house_code: string;
  name: string;
  branch_id: string;
  location: string | null;
  house_type: string;
  total_rooms: number;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AccRoom {
  id: string;
  house_id: string;
  room_number: string;
  capacity: number;
  room_type: string;
  monthly_charge: number;
  condition_status: string;
  status: string;
  notes: string | null;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export interface AccRoomAsset {
  id: string;
  room_id: string;
  asset_name: string;
  asset_type: string;
  quantity: number;
  condition: string;
  inventory_item_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccApplication {
  id: string;
  employee_id: string;
  room_id: string;
  application_date: string;
  desired_start_date: string | null;
  reason: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  branch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccAllocation {
  id: string;
  employee_id: string;
  room_id: string;
  application_id: string | null;
  start_date: string;
  end_date: string | null;
  monthly_charge: number;
  status: string;
  branch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccCheckin {
  id: string;
  allocation_id: string;
  room_id: string;
  employee_id: string;
  event_type: string;
  event_date: string;
  inspected_by: string | null;
  condition_status: string | null;
  damages_noted: string | null;
  damage_charge: number;
  notes: string | null;
  branch_id: string | null;
  created_at: string;
}

export interface AccRequest {
  id: string;
  employee_id: string;
  room_id: string | null;
  allocation_id: string | null;
  request_type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  admin_response: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  branch_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useAccommodation = () => {
  const [houses, setHouses] = useState<AccHouse[]>([]);
  const [rooms, setRooms] = useState<AccRoom[]>([]);
  const [assets, setAssets] = useState<AccRoomAsset[]>([]);
  const [applications, setApplications] = useState<AccApplication[]>([]);
  const [allocations, setAllocations] = useState<AccAllocation[]>([]);
  const [checkins, setCheckins] = useState<AccCheckin[]>([]);
  const [requests, setRequests] = useState<AccRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [h, r, a, ap, al, ci, rq] = await Promise.all([
      (supabase as any).from('accommodation_houses').select('*').order('created_at', { ascending: false }),
      (supabase as any).from('accommodation_rooms').select('*').order('room_number'),
      (supabase as any).from('accommodation_room_assets').select('*'),
      (supabase as any).from('accommodation_applications').select('*').order('application_date', { ascending: false }),
      (supabase as any).from('accommodation_allocations').select('*').order('start_date', { ascending: false }),
      (supabase as any).from('accommodation_checkins').select('*').order('event_date', { ascending: false }),
      (supabase as any).from('accommodation_requests').select('*').order('created_at', { ascending: false }),
    ]);
    if (h.data) setHouses(h.data);
    if (r.data) setRooms(r.data);
    if (a.data) setAssets(a.data);
    if (ap.data) setApplications(ap.data);
    if (al.data) setAllocations(al.data);
    if (ci.data) setCheckins(ci.data);
    if (rq.data) setRequests(rq.data);
  }, []);

  useEffect(() => { (async () => { setLoading(true); await fetchAll(); setLoading(false); })(); }, [fetchAll]);

  // Houses
  const createHouse = async (h: Omit<AccHouse, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await (supabase as any).from('accommodation_houses').insert(h);
    if (error) { toast.error('Failed: ' + error.message); return false; }
    toast.success('House added'); await fetchAll(); return true;
  };
  const updateHouse = async (id: string, u: Partial<AccHouse>) => {
    const { error } = await (supabase as any).from('accommodation_houses').update(u).eq('id', id);
    if (error) { toast.error('Failed'); return false; } await fetchAll(); return true;
  };
  const deleteHouse = async (id: string) => {
    const { error } = await (supabase as any).from('accommodation_houses').delete().eq('id', id);
    if (error) { toast.error('Failed'); return false; }
    toast.success('House deleted'); await fetchAll(); return true;
  };

  // Rooms
  const createRoom = async (r: Omit<AccRoom, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await (supabase as any).from('accommodation_rooms').insert(r);
    if (error) { toast.error('Failed: ' + error.message); return false; }
    toast.success('Room added'); await fetchAll(); return true;
  };
  const updateRoom = async (id: string, u: Partial<AccRoom>) => {
    const { error } = await (supabase as any).from('accommodation_rooms').update(u).eq('id', id);
    if (error) { toast.error('Failed'); return false; } await fetchAll(); return true;
  };
  const deleteRoom = async (id: string) => {
    const { error } = await (supabase as any).from('accommodation_rooms').delete().eq('id', id);
    if (error) { toast.error('Failed'); return false; }
    toast.success('Room deleted'); await fetchAll(); return true;
  };

  // Assets
  const createAsset = async (a: Omit<AccRoomAsset, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await (supabase as any).from('accommodation_room_assets').insert(a);
    if (error) { toast.error('Failed: ' + error.message); return false; }
    toast.success('Asset linked'); await fetchAll(); return true;
  };
  const updateAsset = async (id: string, u: Partial<AccRoomAsset>) => {
    const { error } = await (supabase as any).from('accommodation_room_assets').update(u).eq('id', id);
    if (error) { toast.error('Failed'); return false; } await fetchAll(); return true;
  };
  const deleteAsset = async (id: string) => {
    const { error } = await (supabase as any).from('accommodation_room_assets').delete().eq('id', id);
    if (error) { toast.error('Failed'); return false; } await fetchAll(); return true;
  };

  // Applications
  const createApplication = async (a: Omit<AccApplication, 'id' | 'created_at' | 'updated_at' | 'reviewed_by' | 'reviewed_at' | 'review_notes' | 'status'> & { status?: string }) => {
    const { error } = await (supabase as any).from('accommodation_applications').insert({ ...a, status: a.status || 'pending' });
    if (error) { toast.error('Failed: ' + error.message); return false; }
    toast.success('Application submitted'); await fetchAll(); return true;
  };

  const approveApplication = async (app: AccApplication, reviewer: string, monthlyCharge: number) => {
    const updates = {
      status: 'approved',
      reviewed_by: reviewer,
      reviewed_at: new Date().toISOString(),
    };
    const { error: e1 } = await (supabase as any).from('accommodation_applications').update(updates).eq('id', app.id);
    if (e1) { toast.error('Failed to approve'); return false; }
    // Create allocation
    const { error: e2 } = await (supabase as any).from('accommodation_allocations').insert({
      employee_id: app.employee_id,
      room_id: app.room_id,
      application_id: app.id,
      start_date: app.desired_start_date || new Date().toISOString().split('T')[0],
      monthly_charge: monthlyCharge,
      status: 'reserved',
      branch_id: app.branch_id,
    });
    if (e2) { toast.error('Allocation failed'); return false; }
    // Update room status
    await (supabase as any).from('accommodation_rooms').update({ status: 'reserved' }).eq('id', app.room_id);
    toast.success('Application approved & room reserved');
    await fetchAll();
    return true;
  };

  const rejectApplication = async (id: string, reviewer: string, notes: string) => {
    const { error } = await (supabase as any).from('accommodation_applications').update({
      status: 'rejected', reviewed_by: reviewer, reviewed_at: new Date().toISOString(), review_notes: notes,
    }).eq('id', id);
    if (error) { toast.error('Failed'); return false; }
    toast.success('Application rejected'); await fetchAll(); return true;
  };

  // Check-in / Check-out
  const checkIn = async (alloc: AccAllocation, inspector: string, condition: string, notes: string) => {
    const { error: e1 } = await (supabase as any).from('accommodation_checkins').insert({
      allocation_id: alloc.id, room_id: alloc.room_id, employee_id: alloc.employee_id,
      event_type: 'check_in', event_date: new Date().toISOString().split('T')[0],
      inspected_by: inspector, condition_status: condition, notes, branch_id: alloc.branch_id,
    });
    if (e1) { toast.error('Failed'); return false; }
    await (supabase as any).from('accommodation_allocations').update({ status: 'occupied' }).eq('id', alloc.id);
    await (supabase as any).from('accommodation_rooms').update({ status: 'occupied' }).eq('id', alloc.room_id);
    toast.success('Checked in'); await fetchAll(); return true;
  };

  const checkOut = async (alloc: AccAllocation, inspector: string, condition: string, damages: string, damageCharge: number) => {
    const { error: e1 } = await (supabase as any).from('accommodation_checkins').insert({
      allocation_id: alloc.id, room_id: alloc.room_id, employee_id: alloc.employee_id,
      event_type: 'check_out', event_date: new Date().toISOString().split('T')[0],
      inspected_by: inspector, condition_status: condition, damages_noted: damages, damage_charge: damageCharge,
      branch_id: alloc.branch_id,
    });
    if (e1) { toast.error('Failed'); return false; }
    await (supabase as any).from('accommodation_allocations').update({
      status: 'vacated', end_date: new Date().toISOString().split('T')[0],
    }).eq('id', alloc.id);
    await (supabase as any).from('accommodation_rooms').update({
      status: 'available', condition_status: condition || 'good',
    }).eq('id', alloc.room_id);
    toast.success('Checked out'); await fetchAll(); return true;
  };

  // Undo last check-in: revert allocation -> reserved, room -> reserved, delete latest check_in event
  const undoCheckIn = async (allocId: string, roomId: string) => {
    const { data: ev } = await (supabase as any)
      .from('accommodation_checkins')
      .select('id')
      .eq('allocation_id', allocId)
      .eq('event_type', 'check_in')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (ev?.id) {
      await (supabase as any).from('accommodation_checkins').delete().eq('id', ev.id);
    }
    await (supabase as any).from('accommodation_allocations').update({ status: 'reserved' }).eq('id', allocId);
    await (supabase as any).from('accommodation_rooms').update({ status: 'reserved' }).eq('id', roomId);
    toast.success('Check-in reverted'); await fetchAll(); return true;
  };

  // Undo last check-out: restore allocation -> occupied, clear end_date, room -> occupied, delete latest check_out event
  const undoCheckOut = async (allocId: string, roomId: string) => {
    const { data: ev } = await (supabase as any)
      .from('accommodation_checkins')
      .select('id')
      .eq('allocation_id', allocId)
      .eq('event_type', 'check_out')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (ev?.id) {
      await (supabase as any).from('accommodation_checkins').delete().eq('id', ev.id);
    }
    await (supabase as any).from('accommodation_allocations').update({ status: 'occupied', end_date: null }).eq('id', allocId);
    await (supabase as any).from('accommodation_rooms').update({ status: 'occupied' }).eq('id', roomId);
    toast.success('Check-out reverted'); await fetchAll(); return true;
  };

  const getActiveAllocationForEmployee = (employeeId: string) =>
    allocations.find(a => a.employee_id === employeeId && (a.status === 'reserved' || a.status === 'occupied'));

  const getAssetsForRoom = (roomId: string) => assets.filter(a => a.room_id === roomId);
  const getRoomsForHouse = (houseId: string) => rooms.filter(r => r.house_id === houseId);

  // Requests / Complaints
  const createRequest = async (
    r: Omit<AccRequest, 'id' | 'created_at' | 'updated_at' | 'admin_response' | 'resolved_by' | 'resolved_at' | 'status'> & { status?: string }
  ) => {
    const { error } = await (supabase as any)
      .from('accommodation_requests')
      .insert({ ...r, status: r.status || 'open' });
    if (error) { toast.error('Failed: ' + error.message); return false; }
    toast.success('Request submitted'); await fetchAll(); return true;
  };

  const updateRequest = async (id: string, u: Partial<AccRequest>) => {
    const { error } = await (supabase as any).from('accommodation_requests').update(u).eq('id', id);
    if (error) { toast.error('Failed'); return false; }
    await fetchAll(); return true;
  };

  const respondRequest = async (id: string, response: string, status: string, responder: string) => {
    const updates: Partial<AccRequest> = {
      admin_response: response,
      status,
      ...(status === 'resolved' || status === 'rejected'
        ? { resolved_by: responder, resolved_at: new Date().toISOString() }
        : {}),
    };
    return updateRequest(id, updates);
  };

  const deleteRequest = async (id: string) => {
    const { error } = await (supabase as any).from('accommodation_requests').delete().eq('id', id);
    if (error) { toast.error('Failed'); return false; }
    toast.success('Request deleted'); await fetchAll(); return true;
  };

  return {
    houses, rooms, assets, applications, allocations, checkins, requests, loading,
    createHouse, updateHouse, deleteHouse,
    createRoom, updateRoom, deleteRoom,
    createAsset, updateAsset, deleteAsset,
    createApplication, approveApplication, rejectApplication,
    checkIn, checkOut,
    undoCheckIn, undoCheckOut,
    createRequest, updateRequest, respondRequest, deleteRequest,
    getActiveAllocationForEmployee, getAssetsForRoom, getRoomsForHouse,
    refetch: fetchAll,
  };
};
