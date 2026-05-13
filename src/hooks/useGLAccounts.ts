import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';

export interface GLAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  description: string | null;
  is_active: boolean;
  branch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GLSubAccount {
  id: string;
  parent_account_id: string;
  sub_account_code: string;
  sub_account_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GLEntry {
  id: string;
  entry_date: string;
  gl_account_id: string;
  gl_sub_account_id: string | null;
  description: string;
  debit: number;
  credit: number;
  reference_type: string | null;
  reference_id: string | null;
  reference_number: string | null;
  branch_id: string | null;
  created_at: string;
}

export const useGLAccounts = () => {
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [subAccounts, setSubAccounts] = useState<GLSubAccount[]>([]);
  const [entries, setEntries] = useState<GLEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const branchId = useCurrentBranchId();

  const fetchAccounts = useCallback(async () => {
    let q = supabase.from('gl_accounts').select('*').order('account_code');
    if (branchId) q = q.eq('branch_id', branchId);
    const { data, error } = await q;
    if (error) {
      toast.error('Failed to load GL accounts');
      return;
    }
    setAccounts((data as unknown as GLAccount[]) || []);
  }, [branchId]);

  const fetchSubAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from('gl_sub_accounts')
      .select('*')
      .order('sub_account_code');
    if (error) {
      toast.error('Failed to load GL sub-accounts');
      return;
    }
    setSubAccounts((data as unknown as GLSubAccount[]) || []);
  }, []);

  const fetchEntries = useCallback(async () => {
    let q = supabase.from('gl_entries').select('*').order('entry_date', { ascending: false });
    if (branchId) q = q.eq('branch_id', branchId);
    const { data, error } = await q;
    if (error) {
      toast.error('Failed to load GL entries');
      return;
    }
    setEntries((data as unknown as GLEntry[]) || []);
  }, [branchId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchAccounts(), fetchSubAccounts(), fetchEntries()]);
      setLoading(false);
    };
    load();
  }, [fetchAccounts, fetchSubAccounts, fetchEntries]);

  const createAccount = async (account: Omit<GLAccount, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('gl_accounts').insert(account as any);
    if (error) {
      toast.error('Failed to create account: ' + error.message);
      return false;
    }
    toast.success('GL Account created');
    await fetchAccounts();
    return true;
  };

  const updateAccount = async (id: string, updates: Partial<GLAccount>) => {
    const { error } = await supabase.from('gl_accounts').update(updates as any).eq('id', id);
    if (error) {
      toast.error('Failed to update account');
      return false;
    }
    toast.success('GL Account updated');
    await fetchAccounts();
    return true;
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from('gl_accounts').delete().eq('id', id);
    if (error) {
      toast.error('Cannot delete: account may have sub-accounts or entries');
      return false;
    }
    toast.success('GL Account deleted');
    await fetchAccounts();
    return true;
  };

  const createSubAccount = async (sub: Omit<GLSubAccount, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('gl_sub_accounts').insert(sub as any);
    if (error) {
      toast.error('Failed to create sub-account: ' + error.message);
      return false;
    }
    toast.success('Sub-account created');
    await fetchSubAccounts();
    return true;
  };

  const updateSubAccount = async (id: string, updates: Partial<GLSubAccount>) => {
    const { error } = await supabase.from('gl_sub_accounts').update(updates as any).eq('id', id);
    if (error) {
      toast.error('Failed to update sub-account');
      return false;
    }
    toast.success('Sub-account updated');
    await fetchSubAccounts();
    return true;
  };

  const deleteSubAccount = async (id: string) => {
    const { error } = await supabase.from('gl_sub_accounts').delete().eq('id', id);
    if (error) {
      toast.error('Cannot delete: sub-account may have entries');
      return false;
    }
    toast.success('Sub-account deleted');
    await fetchSubAccounts();
    return true;
  };

  const createEntry = async (entry: Omit<GLEntry, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('gl_entries').insert(entry as any);
    if (error) {
      toast.error('Failed to create GL entry: ' + error.message);
      return false;
    }
    await fetchEntries();
    return true;
  };

  const getSubAccountsForAccount = (accountId: string) => {
    return subAccounts.filter(s => s.parent_account_id === accountId);
  };

  const getAccountById = (id: string) => accounts.find(a => a.id === id);
  const getSubAccountById = (id: string) => subAccounts.find(s => s.id === id);

  return {
    accounts,
    subAccounts,
    entries,
    loading,
    createAccount,
    updateAccount,
    deleteAccount,
    createSubAccount,
    updateSubAccount,
    deleteSubAccount,
    createEntry,
    getSubAccountsForAccount,
    getAccountById,
    getSubAccountById,
    refetch: () => Promise.all([fetchAccounts(), fetchSubAccounts(), fetchEntries()]),
  };
};
