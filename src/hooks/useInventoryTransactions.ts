import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/backend';
import { toast } from 'sonner';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';

export const useInventoryIssues = () => {
  const branchId = useCurrentBranchId();
  const queryClient = useQueryClient();

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['inventory_issues', branchId],
    queryFn: async () => {
      let query = supabase.from('inventory_issues').select('*').order('created_at', { ascending: false });
      if (branchId) query = query.eq('branch_id', branchId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createIssue = useMutation({
    mutationFn: async (issue: any) => {
      const { error } = await supabase.from('inventory_issues').insert(issue);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_issues'] });
      toast.success('Issue record created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateIssueStatus = useMutation({
    mutationFn: async ({ id, status, approved_by }: { id: string; status: string; approved_by?: string }) => {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (approved_by) {
        updates.approved_by = approved_by;
        updates.approved_at = new Date().toISOString();
      }
      const { error } = await supabase.from('inventory_issues').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_issues'] });
      toast.success('Issue status updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { issues, isLoading, createIssue, updateIssueStatus };
};

export const useInventoryReceipts = () => {
  const branchId = useCurrentBranchId();
  const queryClient = useQueryClient();

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ['inventory_receipts', branchId],
    queryFn: async () => {
      let query = supabase.from('inventory_receipts').select('*').order('created_at', { ascending: false });
      if (branchId) query = query.eq('branch_id', branchId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createReceipt = useMutation({
    mutationFn: async (receipt: any) => {
      const { error } = await supabase.from('inventory_receipts').insert(receipt);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_receipts'] });
      toast.success('Receipt record created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateReceiptStatus = useMutation({
    mutationFn: async ({ id, status, approved_by }: { id: string; status: string; approved_by?: string }) => {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (approved_by) {
        updates.approved_by = approved_by;
        updates.approved_at = new Date().toISOString();
      }
      const { error } = await supabase.from('inventory_receipts').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_receipts'] });
      toast.success('Receipt status updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { receipts, isLoading, createReceipt, updateReceiptStatus };
};

export const useDeliveryNotes = () => {
  const branchId = useCurrentBranchId();
  const queryClient = useQueryClient();

  const { data: deliveryNotes = [], isLoading } = useQuery({
    queryKey: ['delivery_notes', branchId],
    queryFn: async () => {
      let query = supabase.from('delivery_notes').select('*').order('created_at', { ascending: false });
      if (branchId) query = query.eq('branch_id', branchId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createDeliveryNote = useMutation({
    mutationFn: async (note: any) => {
      const { error } = await supabase.from('delivery_notes').insert(note);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery_notes'] });
      toast.success('Delivery note created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateDeliveryNoteStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('delivery_notes').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery_notes'] });
      toast.success('Delivery note updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { deliveryNotes, isLoading, createDeliveryNote, updateDeliveryNoteStatus };
};

export const useCreditNotes = () => {
  const branchId = useCurrentBranchId();
  const queryClient = useQueryClient();

  const { data: creditNotes = [], isLoading } = useQuery({
    queryKey: ['credit_notes', branchId],
    queryFn: async () => {
      let query = supabase.from('credit_notes').select('*').order('created_at', { ascending: false });
      if (branchId) query = query.eq('branch_id', branchId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createCreditNote = useMutation({
    mutationFn: async (note: any) => {
      const { error } = await supabase.from('credit_notes').insert(note);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_notes'] });
      toast.success('Credit note created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateCreditNoteStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('credit_notes').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_notes'] });
      toast.success('Credit note updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { creditNotes, isLoading, createCreditNote, updateCreditNoteStatus };
};
