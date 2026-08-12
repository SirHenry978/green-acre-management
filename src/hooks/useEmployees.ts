import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/backend';
import { toast } from 'sonner';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';

export interface Employee {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  id_number: string | null;
  tax_number: string | null;
  email: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  employment_date: string | null;
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  tax_deduction_rate: number;
  pension_deduction_rate: number;
  medical_aid_deduction: number;
  bank_name: string | null;
  bank_account: string | null;
  branch_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  pay_type: string;
  daily_rate: number;
  hourly_rate: number;
  piece_rate: number;
  piece_unit: string | null;
  overtime_multiplier: number;
}

export interface PayrollRun {
  id: string;
  period_start: string;
  period_end: string;
  run_date: string;
  status: string;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  gl_account_id: string | null;
  gl_sub_account_id: string | null;
  branch_id: string | null;
  processed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollItem {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  gross_pay: number;
  tax_deduction: number;
  pension_deduction: number;
  medical_aid_deduction: number;
  total_deductions: number;
  net_pay: number;
  created_at: string;
  pay_type?: string;
  days_worked?: number;
  hours_worked?: number;
  overtime_hours?: number;
  quantity_produced?: number;
  overtime_pay?: number;
  harvest_bonus?: number;
  food_allowance?: number;
  other_earnings?: number;
  loan_deduction?: number;
  absence_penalty?: number;
  other_deductions?: number;
  payment_method?: string;
  payment_reference?: string | null;
  paid_at?: string | null;
  payslip_sent_at?: string | null;
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const branchId = useCurrentBranchId();

  const fetchEmployees = useCallback(async () => {
    let q = supabase.from('employees').select('*').order('first_name');
    if (branchId) q = q.eq('branch_id', branchId);
    const { data, error } = await q;
    if (error) { toast.error('Failed to load employees'); return; }
    setEmployees((data as unknown as Employee[]) || []);
  }, [branchId]);

  const fetchPayrollRuns = useCallback(async () => {
    let q = supabase.from('payroll_runs').select('*').order('run_date', { ascending: false });
    if (branchId) q = q.eq('branch_id', branchId);
    const { data, error } = await q;
    if (error) { toast.error('Failed to load payroll runs'); return; }
    setPayrollRuns((data as unknown as PayrollRun[]) || []);
  }, [branchId]);

  const fetchPayrollItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('payroll_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load payroll items'); return; }
    setPayrollItems((data as unknown as PayrollItem[]) || []);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchEmployees(), fetchPayrollRuns(), fetchPayrollItems()]);
      setLoading(false);
    };
    load();
  }, [fetchEmployees, fetchPayrollRuns, fetchPayrollItems]);

  const createEmployee = async (emp: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('employees').insert(emp as any);
    if (error) { toast.error('Failed to create employee: ' + error.message); return false; }
    toast.success('Employee created');
    await fetchEmployees();
    return true;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    const { error } = await supabase.from('employees').update(updates as any).eq('id', id);
    if (error) { toast.error('Failed to update employee'); return false; }
    toast.success('Employee updated');
    await fetchEmployees();
    return true;
  };

  const deleteEmployee = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) { toast.error('Failed to delete employee'); return false; }
    toast.success('Employee deleted');
    await fetchEmployees();
    return true;
  };

  const createPayrollRun = async (run: Omit<PayrollRun, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('payroll_runs').insert(run as any).select();
    if (error) { toast.error('Failed to create payroll run: ' + error.message); return null; }
    await fetchPayrollRuns();
    return (data as unknown as PayrollRun[])?.[0] || null;
  };

  const createPayrollItems = async (items: Omit<PayrollItem, 'id' | 'created_at'>[]) => {
    const { error } = await supabase.from('payroll_items').insert(items as any);
    if (error) { toast.error('Failed to create payroll items: ' + error.message); return false; }
    await fetchPayrollItems();
    return true;
  };

  const updatePayrollRun = async (id: string, updates: Partial<PayrollRun>) => {
    const { error } = await supabase.from('payroll_runs').update(updates as any).eq('id', id);
    if (error) { toast.error('Failed to update payroll run'); return false; }
    await fetchPayrollRuns();
    return true;
  };

  const getPayrollItemsForRun = (runId: string) => payrollItems.filter(i => i.payroll_run_id === runId);

  const getEmployeeById = (id: string) => employees.find(e => e.id === id);

  return {
    employees,
    payrollRuns,
    payrollItems,
    loading,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createPayrollRun,
    createPayrollItems,
    updatePayrollRun,
    getPayrollItemsForRun,
    getEmployeeById,
    refetch: () => Promise.all([fetchEmployees(), fetchPayrollRuns(), fetchPayrollItems()]),
  };
};
