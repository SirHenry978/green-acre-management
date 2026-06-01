import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';
import { toast } from 'sonner';

export type AssetRow = any;

const branchFilter = (q: any, branchId?: string) =>
  branchId ? q.eq('branch_id', branchId) : q;

export const useAssetCategories = () =>
  useQuery({
    queryKey: ['asset_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_categories' as any)
        .select('*')
        .order('name');
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

export const useAssetVendors = () => {
  const branchId = useCurrentBranchId();
  return useQuery({
    queryKey: ['asset_vendors', branchId],
    queryFn: async () => {
      const { data, error } = await branchFilter(
        supabase.from('asset_vendors' as any).select('*').order('name'),
        branchId,
      );
      if (error) throw error;
      return (data as any[]) || [];
    },
  });
};

export const useAssets = () => {
  const branchId = useCurrentBranchId();
  return useQuery({
    queryKey: ['assets', branchId],
    queryFn: async () => {
      const { data, error } = await branchFilter(
        supabase.from('assets' as any).select('*').order('created_at', { ascending: false }),
        branchId,
      );
      if (error) throw error;
      return (data as any[]) || [];
    },
  });
};

export const useAssignments = () =>
  useQuery({
    queryKey: ['asset_assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_assignments' as any)
        .select('*')
        .order('assigned_date', { ascending: false });
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

export const useMaintenance = () =>
  useQuery({
    queryKey: ['asset_maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_maintenance' as any)
        .select('*')
        .order('scheduled_date', { ascending: false });
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

export const useDepreciationEntries = () =>
  useQuery({
    queryKey: ['asset_depreciation_entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_depreciation_entries' as any)
        .select('*')
        .order('period_end', { ascending: false });
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

export const useDisposals = () =>
  useQuery({
    queryKey: ['asset_disposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_disposals' as any)
        .select('*')
        .order('disposal_date', { ascending: false });
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

export const useAssetNotifications = () =>
  useQuery({
    queryKey: ['asset_notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_notifications' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

export const useAssetAuditLogs = () =>
  useQuery({
    queryKey: ['asset_audit_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_audit_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

const writeAudit = async (entity_type: string, action: string, entity_id?: string, diff?: any) => {
  await supabase.from('asset_audit_logs' as any).insert({ entity_type, action, entity_id, diff });
};

export const useAssetMutations = () => {
  const qc = useQueryClient();
  const branchId = useCurrentBranchId();

  const createCategory = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from('asset_categories' as any).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset_categories'] });
      toast.success('Category added');
    },
  });

  const createVendor = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from('asset_vendors' as any).insert({ ...payload, branch_id: branchId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset_vendors'] });
      toast.success('Vendor added');
    },
  });

  const createAsset = useMutation({
    mutationFn: async (payload: any) => {
      const insert = { ...payload, branch_id: branchId, current_value: payload.purchase_cost ?? 0 };
      const { data, error } = await supabase.from('assets' as any).insert(insert).select().single();
      if (error) throw error;
      await writeAudit('asset', 'create', (data as any)?.id, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset created');
    },
  });

  const updateAsset = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { error } = await supabase.from('assets' as any).update(patch).eq('id', id);
      if (error) throw error;
      await writeAudit('asset', 'update', id, patch);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset updated');
    },
  });

  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assets' as any).delete().eq('id', id);
      if (error) throw error;
      await writeAudit('asset', 'delete', id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset deleted');
    },
  });

  const assignAsset = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase
        .from('asset_assignments' as any)
        .insert({ ...payload, branch_id: branchId });
      if (error) throw error;
      await supabase.from('assets' as any).update({ status: 'operational', location: payload.assignee_name }).eq('id', payload.asset_id);
      await writeAudit('assignment', 'create', payload.asset_id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset_assignments'] });
      qc.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset assigned');
    },
  });

  const returnAssignment = useMutation({
    mutationFn: async ({ id, condition_in }: { id: string; condition_in: string }) => {
      const { error } = await supabase
        .from('asset_assignments' as any)
        .update({ status: 'returned', returned_date: new Date().toISOString().slice(0, 10), condition_in })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset_assignments'] });
      toast.success('Asset returned');
    },
  });

  const createMaintenance = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase
        .from('asset_maintenance' as any)
        .insert({ ...payload, branch_id: branchId });
      if (error) throw error;
      await supabase.from('asset_notifications' as any).insert({
        kind: 'maintenance_due',
        title: 'Maintenance scheduled',
        body: payload.description ?? 'New maintenance scheduled',
        ref_id: payload.asset_id,
        branch_id: branchId,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset_maintenance'] });
      qc.invalidateQueries({ queryKey: ['asset_notifications'] });
      toast.success('Maintenance recorded');
    },
  });

  const completeMaintenance = useMutation({
    mutationFn: async ({ id, asset_id, cost }: { id: string; asset_id: string; cost: number }) => {
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase
        .from('asset_maintenance' as any)
        .update({ status: 'completed', performed_date: today })
        .eq('id', id);
      if (error) throw error;
      // Post expense to finance (GL)
      if (cost > 0) {
        const { data: expAcc } = await supabase
          .from('gl_accounts')
          .select('id')
          .eq('account_type', 'expense')
          .limit(1)
          .maybeSingle();
        if (expAcc?.id) {
          await supabase.from('gl_entries').insert({
            gl_account_id: expAcc.id,
            entry_date: today,
            debit: cost,
            credit: 0,
            description: 'Asset maintenance cost',
            reference_type: 'asset_maintenance',
            reference_id: id,
          });
        }
      }
      await supabase.from('assets' as any).update({ status: 'operational' }).eq('id', asset_id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset_maintenance'] });
      qc.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Maintenance completed & posted');
    },
  });

  // Compute & post a depreciation period (straight-line by default)
  const runDepreciation = useMutation({
    mutationFn: async ({ asset, periodMonths }: { asset: any; periodMonths: number }) => {
      const method = asset.depreciation_method || 'straight_line';
      const life = Math.max(asset.useful_life_years || 1, 1);
      const salvage = asset.salvage_value || 0;
      const opening = asset.current_value || asset.purchase_cost || 0;
      let dep = 0;
      if (method === 'declining_balance') {
        // Double-declining rate
        const rate = (2 / life) * (periodMonths / 12);
        dep = Math.max(opening * rate, 0);
      } else if (method === 'none') {
        dep = 0;
      } else {
        const annual = Math.max(((asset.purchase_cost || 0) - salvage) / life, 0);
        dep = (annual * periodMonths) / 12;
      }
      const closing = Math.max(opening - dep, salvage);
      const today = new Date();
      const periodStart = new Date(today.getFullYear(), today.getMonth() - periodMonths + 1, 1)
        .toISOString().slice(0, 10);
      const periodEnd = today.toISOString().slice(0, 10);

      const { data: entry, error } = await supabase
        .from('asset_depreciation_entries' as any)
        .insert({
          asset_id: asset.id,
          period_start: periodStart,
          period_end: periodEnd,
          opening_value: opening,
          depreciation_amount: dep,
          closing_value: closing,
          branch_id: branchId,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('assets' as any).update({
        current_value: closing,
        accumulated_depreciation: (asset.accumulated_depreciation || 0) + dep,
        last_depreciated_at: periodEnd,
      }).eq('id', asset.id);

      // Post to finance
      const { data: depAcc } = await supabase
        .from('gl_accounts')
        .select('id')
        .ilike('account_name', '%depreciation%')
        .limit(1)
        .maybeSingle();
      if (depAcc?.id && dep > 0) {
        await supabase.from('gl_entries').insert({
          gl_account_id: depAcc.id,
          entry_date: periodEnd,
          debit: dep,
          credit: 0,
          description: `Depreciation - ${asset.name}`,
          reference_type: 'asset_depreciation',
          reference_id: (entry as any)?.id,
        });
        await supabase
          .from('asset_depreciation_entries' as any)
          .update({ posted_to_finance: true })
          .eq('id', (entry as any)?.id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset_depreciation_entries'] });
      qc.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Depreciation posted');
    },
  });

  const createDisposal = useMutation({
    mutationFn: async ({ asset, payload }: { asset: any; payload: any }) => {
      const book = asset.current_value || 0;
      const gain = (payload.sale_price || 0) - book;
      const { data, error } = await supabase
        .from('asset_disposals' as any)
        .insert({
          ...payload,
          asset_id: asset.id,
          book_value: book,
          gain_loss: gain,
          branch_id: branchId,
        }).select().single();
      if (error) throw error;
      await supabase.from('assets' as any).update({ status: 'disposed' }).eq('id', asset.id);
      // Post gain/loss to GL
      const { data: acc } = await supabase
        .from('gl_accounts')
        .select('id')
        .ilike('account_name', gain >= 0 ? '%gain%' : '%loss%')
        .limit(1)
        .maybeSingle();
      if (acc?.id) {
        await supabase.from('gl_entries').insert({
          gl_account_id: acc.id,
          entry_date: payload.disposal_date,
          debit: gain < 0 ? Math.abs(gain) : 0,
          credit: gain > 0 ? gain : 0,
          description: `Asset disposal - ${asset.name}`,
          reference_type: 'asset_disposal',
          reference_id: (data as any)?.id,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset_disposals'] });
      qc.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset disposed');
    },
  });

  const markNotificationRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('asset_notifications' as any).update({ is_read: true }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['asset_notifications'] }),
  });

  // Sync livestock entries as assets (one-shot)
  const syncLivestock = useMutation({
    mutationFn: async () => {
      const { data: animals } = await supabase.from('livestock').select('*');
      if (!animals?.length) return 0;
      const { data: existing } = await supabase
        .from('assets' as any)
        .select('livestock_id')
        .not('livestock_id', 'is', null);
      const existingIds = new Set((existing as any[] | null)?.map((a) => a.livestock_id) || []);
      const toInsert = animals
        .filter((a) => !existingIds.has(a.id))
        .map((a) => ({
          name: `${a.breed || 'Livestock'} #${a.tag_number}`,
          asset_type: 'livestock',
          status: a.status === 'active' ? 'operational' : 'retired',
          condition: a.health_status || 'good',
          branch_id: a.branch_id,
          purchase_date: a.acquired_date,
          purchase_cost: a.purchase_price || 0,
          current_value: a.purchase_price || 0,
          livestock_id: a.id,
          location: 'Livestock shelter',
          useful_life_years: 5,
          depreciation_method: 'none',
        }));
      if (toInsert.length) {
        const { error } = await supabase.from('assets' as any).insert(toInsert);
        if (error) throw error;
      }
      return toInsert.length;
    },
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      toast.success(`Synced ${n} livestock asset(s)`);
    },
  });

  return {
    createCategory, createVendor, createAsset, updateAsset, deleteAsset,
    assignAsset, returnAssignment, createMaintenance, completeMaintenance,
    runDepreciation, createDisposal, markNotificationRead, syncLivestock,
  };
};