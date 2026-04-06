import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeaveType {
  id: string;
  name: string;
  default_days: number;
  is_paid: boolean;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useLeaveTypes = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaveTypes = useCallback(async () => {
    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .order('name');
    if (error) { toast.error('Failed to load leave types'); return; }
    setLeaveTypes((data as unknown as LeaveType[]) || []);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchLeaveTypes();
      setLoading(false);
    };
    load();
  }, [fetchLeaveTypes]);

  const createLeaveType = async (lt: Omit<LeaveType, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('leave_types').insert(lt as any);
    if (error) { toast.error('Failed to create leave type: ' + error.message); return false; }
    toast.success('Leave type created');
    await fetchLeaveTypes();
    return true;
  };

  const updateLeaveType = async (id: string, updates: Partial<LeaveType>) => {
    const { error } = await supabase.from('leave_types').update(updates as any).eq('id', id);
    if (error) { toast.error('Failed to update leave type'); return false; }
    toast.success('Leave type updated');
    await fetchLeaveTypes();
    return true;
  };

  const deleteLeaveType = async (id: string) => {
    const { error } = await supabase.from('leave_types').delete().eq('id', id);
    if (error) { toast.error('Failed to delete leave type'); return false; }
    toast.success('Leave type deleted');
    await fetchLeaveTypes();
    return true;
  };

  return { leaveTypes, loading, createLeaveType, updateLeaveType, deleteLeaveType };
};
