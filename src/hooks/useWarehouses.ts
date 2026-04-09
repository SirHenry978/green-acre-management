import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';

export const useWarehouses = () => {
  const branchId = useCurrentBranchId();
  const queryClient = useQueryClient();

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ['warehouses', branchId],
    queryFn: async () => {
      let query = supabase.from('warehouses').select('*').order('name');
      if (branchId) query = query.eq('branch_id', branchId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createWarehouse = useMutation({
    mutationFn: async (warehouse: { name: string; branch_id: string; location_description?: string; warehouse_type: string; capacity?: number }) => {
      const { error } = await supabase.from('warehouses').insert(warehouse);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateWarehouse = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from('warehouses').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteWarehouse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('warehouses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { warehouses, isLoading, createWarehouse, updateWarehouse, deleteWarehouse };
};
