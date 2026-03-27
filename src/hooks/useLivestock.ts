import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface LivestockCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface LivestockShelter {
  id: string;
  name: string;
  shelter_type: string;
  capacity: number;
  branch_id: string;
  location_description: string | null;
  status: string;
  created_at: string;
}

export interface Livestock {
  id: string;
  tag_number: string;
  name: string | null;
  category_id: string;
  breed: string;
  color: string | null;
  gender: string;
  date_of_birth: string | null;
  age_on_capture: string | null;
  weight: number | null;
  shelter_id: string | null;
  branch_id: string;
  status: string;
  health_status: string;
  notes: string | null;
  acquired_date: string | null;
  acquired_from: string | null;
  purchase_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface LivestockHealthRecord {
  id: string;
  livestock_id: string;
  record_type: string;
  description: string;
  vet_name: string | null;
  diagnosis: string | null;
  treatment: string | null;
  medication: string | null;
  cost: number | null;
  next_due_date: string | null;
  branch_id: string;
  record_date: string;
  created_at: string;
}

export interface LivestockTransfer {
  id: string;
  livestock_id: string | null;
  reference_number: string;
  transfer_type: string;
  from_branch_id: string | null;
  to_branch_id: string | null;
  customer_id: string | null;
  reason: string | null;
  transfer_date: string;
  quantity: number;
  unit_price: number | null;
  total_value: number | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface InventoryTransfer {
  id: string;
  inventory_item_name: string;
  category: string;
  quantity: number;
  unit: string;
  from_location: string;
  to_location: string;
  branch_id: string;
  livestock_id: string | null;
  purpose: string | null;
  transfer_date: string;
  transferred_by: string | null;
  status: string;
  created_at: string;
}

const useBranchFilterQuery = () => {
  const { user, branch } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  return { isSuperAdmin, branchId: isSuperAdmin ? branch?.id : user?.branchId };
};

// Categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['livestock-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('livestock_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as LivestockCategory[];
    },
  });
};

// Shelters
export const useShelters = () => {
  const { branchId, isSuperAdmin } = useBranchFilterQuery();
  return useQuery({
    queryKey: ['livestock-shelters', branchId],
    queryFn: async () => {
      let query = supabase.from('livestock_shelters').select('*').order('name');
      if (!isSuperAdmin && branchId) {
        query = query.eq('branch_id', branchId);
      } else if (isSuperAdmin && branchId) {
        query = query.eq('branch_id', branchId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as LivestockShelter[];
    },
  });
};

// Livestock
export const useLivestock = () => {
  const { branchId, isSuperAdmin } = useBranchFilterQuery();
  return useQuery({
    queryKey: ['livestock', branchId],
    queryFn: async () => {
      let query = supabase.from('livestock').select('*').order('created_at', { ascending: false });
      if (!isSuperAdmin && branchId) {
        query = query.eq('branch_id', branchId);
      } else if (isSuperAdmin && branchId) {
        query = query.eq('branch_id', branchId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Livestock[];
    },
  });
};

// Health Records
export const useHealthRecords = () => {
  const { branchId, isSuperAdmin } = useBranchFilterQuery();
  return useQuery({
    queryKey: ['livestock-health-records', branchId],
    queryFn: async () => {
      let query = supabase.from('livestock_health_records').select('*').order('record_date', { ascending: false });
      if (!isSuperAdmin && branchId) {
        query = query.eq('branch_id', branchId);
      } else if (isSuperAdmin && branchId) {
        query = query.eq('branch_id', branchId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as LivestockHealthRecord[];
    },
  });
};

// Transfers
export const useLivestockTransfers = () => {
  const { branchId, isSuperAdmin } = useBranchFilterQuery();
  return useQuery({
    queryKey: ['livestock-transfers', branchId],
    queryFn: async () => {
      let query = supabase.from('livestock_transfers').select('*').order('transfer_date', { ascending: false });
      if (!isSuperAdmin && branchId) {
        query = query.eq('from_branch_id', branchId);
      } else if (isSuperAdmin && branchId) {
        query = query.eq('from_branch_id', branchId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as LivestockTransfer[];
    },
  });
};

// Inventory Transfers
export const useInventoryTransfers = () => {
  const { branchId, isSuperAdmin } = useBranchFilterQuery();
  return useQuery({
    queryKey: ['inventory-transfers', branchId],
    queryFn: async () => {
      let query = supabase.from('inventory_transfers').select('*').order('transfer_date', { ascending: false });
      if (!isSuperAdmin && branchId) {
        query = query.eq('branch_id', branchId);
      } else if (isSuperAdmin && branchId) {
        query = query.eq('branch_id', branchId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as InventoryTransfer[];
    },
  });
};

// Mutations
export const useAddLivestock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase.from('livestock').insert([data]).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      toast.success('Livestock added successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateLivestock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('livestock').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      toast.success('Livestock updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteLivestock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('livestock').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      toast.success('Livestock removed');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useAddShelter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase.from('livestock_shelters').insert([data]).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock-shelters'] });
      toast.success('Shelter added');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useAddHealthRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase.from('livestock_health_records').insert([data]).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock-health-records'] });
      toast.success('Health record added');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useAddLivestockTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { data: result, error } = await supabase.from('livestock_transfers').insert([data]).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      toast.success('Transfer recorded');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useAddInventoryTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { data: result, error } = await supabase.from('inventory_transfers').insert([data]).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-transfers'] });
      toast.success('Inventory transfer recorded');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
