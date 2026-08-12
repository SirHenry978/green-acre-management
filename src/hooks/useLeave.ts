import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/backend';
import { toast } from 'sonner';

export interface LeaveBalance {
  id: string;
  employee_id: string;
  year: number;
  annual_leave_total: number;
  annual_leave_used: number;
  sick_leave_total: number;
  sick_leave_used: number;
  family_leave_total: number;
  family_leave_used: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

export const useLeave = () => {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBalances = useCallback(async () => {
    const { data, error } = await supabase
      .from('leave_balances')
      .select('*')
      .order('year', { ascending: false });
    if (error) { toast.error('Failed to load leave balances'); return; }
    setBalances((data as unknown as LeaveBalance[]) || []);
  }, []);

  const fetchRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load leave requests'); return; }
    setRequests((data as unknown as LeaveRequest[]) || []);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchBalances(), fetchRequests()]);
      setLoading(false);
    };
    load();
  }, [fetchBalances, fetchRequests]);

  const ensureBalanceForYear = async (employeeId: string, year: number) => {
    const existing = balances.find(b => b.employee_id === employeeId && b.year === year);
    if (existing) return existing;
    
    const { data, error } = await supabase
      .from('leave_balances')
      .insert({ employee_id: employeeId, year } as any)
      .select();
    if (error) { toast.error('Failed to create leave balance'); return null; }
    await fetchBalances();
    return (data as unknown as LeaveBalance[])?.[0] || null;
  };

  const allocateAllEmployees = async (employeeIds: string[], year: number) => {
    const existing = balances.filter(b => b.year === year).map(b => b.employee_id);
    const toCreate = employeeIds.filter(id => !existing.includes(id));
    if (toCreate.length === 0) { toast.info('All employees already have allocations for this year'); return; }
    
    const rows = toCreate.map(id => ({ employee_id: id, year }));
    const { error } = await supabase.from('leave_balances').insert(rows as any);
    if (error) { toast.error('Failed to allocate leave: ' + error.message); return; }
    toast.success(`Allocated leave for ${toCreate.length} employee(s)`);
    await fetchBalances();
  };

  const createRequest = async (req: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at' | 'approved_by' | 'approved_at'>) => {
    const { error } = await supabase.from('leave_requests').insert(req as any);
    if (error) { toast.error('Failed to submit leave request: ' + error.message); return false; }
    toast.success('Leave request submitted');
    await fetchRequests();
    return true;
  };

  const approveRequest = async (id: string, approverName: string) => {
    const request = requests.find(r => r.id === id);
    if (!request) return false;

    // Update request status
    const { error } = await supabase.from('leave_requests')
      .update({ status: 'approved', approved_by: approverName, approved_at: new Date().toISOString() } as any)
      .eq('id', id);
    if (error) { toast.error('Failed to approve request'); return false; }

    // Update balance
    const year = new Date(request.start_date).getFullYear();
    const balance = balances.find(b => b.employee_id === request.employee_id && b.year === year);
    
    if (balance) {
      const updates: any = {};
      const leaveType = request.leave_type;
      
      if (leaveType === 'annual') {
        const newUsed = balance.annual_leave_used + request.days_count;
        updates.annual_leave_used = newUsed;
        // If exceeds allocation, mark as unpaid
        if (newUsed > balance.annual_leave_total) {
          await supabase.from('leave_requests').update({ is_paid: false } as any).eq('id', id);
        }
      } else if (leaveType === 'sick') {
        const newUsed = balance.sick_leave_used + request.days_count;
        updates.sick_leave_used = newUsed;
        if (newUsed > balance.sick_leave_total) {
          await supabase.from('leave_requests').update({ is_paid: false } as any).eq('id', id);
        }
      } else if (leaveType === 'family') {
        const newUsed = balance.family_leave_used + request.days_count;
        updates.family_leave_used = newUsed;
        if (newUsed > balance.family_leave_total) {
          await supabase.from('leave_requests').update({ is_paid: false } as any).eq('id', id);
        }
      }
      // unpaid type stays is_paid = false
      
      if (Object.keys(updates).length > 0) {
        await supabase.from('leave_balances').update(updates as any).eq('id', balance.id);
      }
    }

    toast.success('Leave request approved');
    await Promise.all([fetchRequests(), fetchBalances()]);
    return true;
  };

  const rejectRequest = async (id: string) => {
    const { error } = await supabase.from('leave_requests')
      .update({ status: 'rejected' } as any)
      .eq('id', id);
    if (error) { toast.error('Failed to reject request'); return false; }
    toast.success('Leave request rejected');
    await fetchRequests();
    return true;
  };

  const getUnpaidLeaveDays = (employeeId: string, periodStart: string, periodEnd: string) => {
    return requests.filter(r =>
      r.employee_id === employeeId &&
      r.status === 'approved' &&
      r.is_paid === false &&
      r.start_date >= periodStart &&
      r.end_date <= periodEnd
    ).reduce((sum, r) => sum + r.days_count, 0);
  };

  const getBalanceForEmployee = (employeeId: string, year: number) =>
    balances.find(b => b.employee_id === employeeId && b.year === year);

  return {
    balances, requests, loading,
    ensureBalanceForYear, allocateAllEmployees,
    createRequest, approveRequest, rejectRequest,
    getUnpaidLeaveDays, getBalanceForEmployee,
    refetch: () => Promise.all([fetchBalances(), fetchRequests()]),
  };
};
