import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmployeeLoan {
  id: string;
  employee_id: string;
  loan_date: string;
  principal_amount: number;
  monthly_installment: number;
  balance: number;
  reason: string | null;
  status: string;
  branch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeBonus {
  id: string;
  employee_id: string;
  bonus_type: string;
  amount: number;
  bonus_date: string;
  description: string | null;
  applied_to_payroll_id: string | null;
  branch_id: string | null;
  created_at: string;
}

export const usePayrollExtras = () => {
  const [loans, setLoans] = useState<EmployeeLoan[]>([]);
  const [bonuses, setBonuses] = useState<EmployeeBonus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = useCallback(async () => {
    const { data, error } = await (supabase as any).from('employee_loans').select('*').order('loan_date', { ascending: false });
    if (error) { toast.error('Failed to load loans'); return; }
    setLoans((data as EmployeeLoan[]) || []);
  }, []);

  const fetchBonuses = useCallback(async () => {
    const { data, error } = await (supabase as any).from('employee_bonuses').select('*').order('bonus_date', { ascending: false });
    if (error) { toast.error('Failed to load bonuses'); return; }
    setBonuses((data as EmployeeBonus[]) || []);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchLoans(), fetchBonuses()]);
      setLoading(false);
    })();
  }, [fetchLoans, fetchBonuses]);

  const createLoan = async (loan: Omit<EmployeeLoan, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await (supabase as any).from('employee_loans').insert(loan);
    if (error) { toast.error('Failed: ' + error.message); return false; }
    toast.success('Loan recorded');
    await fetchLoans();
    return true;
  };

  const updateLoan = async (id: string, updates: Partial<EmployeeLoan>) => {
    const { error } = await (supabase as any).from('employee_loans').update(updates).eq('id', id);
    if (error) { toast.error('Failed to update loan'); return false; }
    await fetchLoans();
    return true;
  };

  const deleteLoan = async (id: string) => {
    const { error } = await (supabase as any).from('employee_loans').delete().eq('id', id);
    if (error) { toast.error('Failed to delete loan'); return false; }
    toast.success('Loan removed');
    await fetchLoans();
    return true;
  };

  const createBonus = async (bonus: Omit<EmployeeBonus, 'id' | 'created_at'>) => {
    const { error } = await (supabase as any).from('employee_bonuses').insert(bonus);
    if (error) { toast.error('Failed: ' + error.message); return false; }
    toast.success('Bonus recorded');
    await fetchBonuses();
    return true;
  };

  const deleteBonus = async (id: string) => {
    const { error } = await (supabase as any).from('employee_bonuses').delete().eq('id', id);
    if (error) { toast.error('Failed to delete bonus'); return false; }
    await fetchBonuses();
    return true;
  };

  const getActiveLoanForEmployee = (employeeId: string) =>
    loans.find(l => l.employee_id === employeeId && l.status === 'active' && l.balance > 0);

  const getUnappliedBonusesForEmployee = (employeeId: string) =>
    bonuses.filter(b => b.employee_id === employeeId && !b.applied_to_payroll_id);

  return {
    loans, bonuses, loading,
    createLoan, updateLoan, deleteLoan,
    createBonus, deleteBonus,
    getActiveLoanForEmployee, getUnappliedBonusesForEmployee,
    refetch: () => Promise.all([fetchLoans(), fetchBonuses()]),
  };
};
