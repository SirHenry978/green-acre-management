import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/backend';
import { toast } from 'sonner';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';
import { useAuth } from '@/contexts/AuthContext';

export interface CanteenMeal {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  day_of_week: string | null;
  meal_time: string | null;
  price: number;
  calories: number | null;
  ingredients: string | null;
  image_url: string | null;
  is_active: boolean;
  branch_id: string | null;
  created_at: string;
}

export interface CanteenStaff {
  id: string;
  employee_id: string;
  role: string;
  shift: string | null;
  is_active: boolean;
  notes: string | null;
  branch_id: string | null;
  created_at: string;
}

export interface CanteenInventoryRequest {
  id: string;
  item_name: string;
  quantity: number;
  unit: string | null;
  warehouse_id: string | null;
  status: string;
  requested_by: string | null;
  fulfilled_by: string | null;
  fulfilled_at: string | null;
  notes: string | null;
  branch_id: string | null;
  created_at: string;
}

export interface CanteenReview {
  id: string;
  meal_id: string | null;
  meal_name: string | null;
  reviewer_id: string | null;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  branch_id: string | null;
  created_at: string;
}

export interface CanteenAuditLog {
  id: string;
  entity: string;
  entity_id: string | null;
  action: string;
  performed_by: string | null;
  performed_by_name: string | null;
  details: any;
  branch_id: string | null;
  created_at: string;
}

export const useCanteen = () => {
  const branchId = useCurrentBranchId();
  const { user } = useAuth();
  const [meals, setMeals] = useState<CanteenMeal[]>([]);
  const [staff, setStaff] = useState<CanteenStaff[]>([]);
  const [requests, setRequests] = useState<CanteenInventoryRequest[]>([]);
  const [reviews, setReviews] = useState<CanteenReview[]>([]);
  const [logs, setLogs] = useState<CanteenAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const audit = async (entity: string, action: string, entity_id?: string, details?: any) => {
    await supabase.from('canteen_audit_logs').insert({
      entity, action, entity_id: entity_id ?? null,
      performed_by: user?.id ?? null,
      performed_by_name: user?.name ?? null,
      details: details ?? null,
      branch_id: branchId ?? null,
    } as any);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const filt = (q: any) => branchId ? q.eq('branch_id', branchId) : q;
    const [m, s, r, rv, lg] = await Promise.all([
      filt(supabase.from('canteen_meals').select('*').order('day_of_week')),
      filt(supabase.from('canteen_staff').select('*').order('created_at', { ascending: false })),
      filt(supabase.from('canteen_inventory_requests').select('*').order('created_at', { ascending: false })),
      filt(supabase.from('canteen_reviews').select('*').order('created_at', { ascending: false })),
      filt(supabase.from('canteen_audit_logs').select('*').order('created_at', { ascending: false }).limit(200)),
    ]);
    setMeals((m.data as any) || []);
    setStaff((s.data as any) || []);
    setRequests((r.data as any) || []);
    setReviews((rv.data as any) || []);
    setLogs((lg.data as any) || []);
    setLoading(false);
  }, [branchId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveMeal = async (meal: Partial<CanteenMeal> & { id?: string }) => {
    const payload: any = { ...meal, branch_id: branchId };
    if (meal.id) {
      const { error } = await supabase.from('canteen_meals').update(payload).eq('id', meal.id);
      if (error) return toast.error(error.message);
      await audit('meal', 'update', meal.id, payload);
      toast.success('Meal updated');
    } else {
      const { data, error } = await supabase.from('canteen_meals').insert(payload).select().single();
      if (error) return toast.error(error.message);
      await audit('meal', 'create', data?.id, payload);
      toast.success('Meal added');
    }
    fetchAll();
  };

  const deleteMeal = async (id: string) => {
    const { error } = await supabase.from('canteen_meals').delete().eq('id', id);
    if (error) return toast.error(error.message);
    await audit('meal', 'delete', id);
    toast.success('Meal removed');
    fetchAll();
  };

  const saveStaff = async (s: Partial<CanteenStaff> & { id?: string }) => {
    const payload: any = { ...s, branch_id: branchId };
    if (s.id) {
      const { error } = await supabase.from('canteen_staff').update(payload).eq('id', s.id);
      if (error) return toast.error(error.message);
      await audit('staff', 'update', s.id, payload);
    } else {
      const { data, error } = await supabase.from('canteen_staff').insert(payload).select().single();
      if (error) return toast.error(error.message);
      await audit('staff', 'assign', data?.id, payload);
    }
    toast.success('Saved');
    fetchAll();
  };

  const removeStaff = async (id: string) => {
    const { error } = await supabase.from('canteen_staff').delete().eq('id', id);
    if (error) return toast.error(error.message);
    await audit('staff', 'remove', id);
    fetchAll();
  };

  const createRequest = async (r: Partial<CanteenInventoryRequest>) => {
    const payload: any = { ...r, branch_id: branchId, requested_by: user?.id ?? null, status: 'pending' };
    const { data, error } = await supabase.from('canteen_inventory_requests').insert(payload).select().single();
    if (error) return toast.error(error.message);
    await audit('inventory_request', 'create', data?.id, payload);
    toast.success('Request submitted');
    fetchAll();
  };

  const updateRequestStatus = async (id: string, status: string) => {
    const payload: any = { status };
    if (status === 'fulfilled') {
      payload.fulfilled_by = user?.id ?? null;
      payload.fulfilled_at = new Date().toISOString();
    }
    const { error } = await supabase.from('canteen_inventory_requests').update(payload).eq('id', id);
    if (error) return toast.error(error.message);
    await audit('inventory_request', status, id, payload);
    toast.success('Updated');
    fetchAll();
  };

  const addReview = async (r: Partial<CanteenReview>) => {
    const payload: any = {
      ...r, branch_id: branchId,
      reviewer_id: user?.id ?? null,
      reviewer_name: user?.name ?? null,
    };
    const { data, error } = await supabase.from('canteen_reviews').insert(payload).select().single();
    if (error) return toast.error(error.message);
    await audit('review', 'create', data?.id, payload);
    toast.success('Review posted');
    fetchAll();
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from('canteen_reviews').delete().eq('id', id);
    if (error) return toast.error(error.message);
    await audit('review', 'delete', id);
    fetchAll();
  };

  return {
    meals, staff, requests, reviews, logs, loading,
    saveMeal, deleteMeal,
    saveStaff, removeStaff,
    createRequest, updateRequestStatus,
    addReview, deleteReview,
    refetch: fetchAll,
  };
};