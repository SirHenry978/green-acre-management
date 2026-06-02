import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProject = (id?: string) =>
  useQuery({
    queryKey: ['farm-project', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('farm_projects').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

const list = (table: string) => (projectId?: string) =>
  useQuery({
    queryKey: [table, projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase.from(table as any).select('*').eq('project_id', projectId!).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

export const useProjectPhases = list('project_phases');
export const useProjectMilestones = list('project_milestones');
export const useProjectTeam = list('project_team_members');
export const useProjectResources = list('project_resources');
export const useProjectRisks = list('project_risks');
export const useProjectObservations = list('project_observations');
export const useProjectWeather = list('project_weather_events');
export const useProjectDocuments = list('project_documents');
export const useProjectComments = list('project_comments');
export const useProjectActivity = list('project_activity_log');
export const useProjectNotifications = list('project_notifications');
export const useProjectExpenses = list('project_expenses');
export const useProjectTasks = list('farm_tasks');

export const useProjectClosure = (projectId?: string) =>
  useQuery({
    queryKey: ['project_closure', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase.from('project_closures').select('*').eq('project_id', projectId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const useLogActivity = () => {
  return async (project_id: string, action: string, meta: any = {}, actor = 'System') => {
    await supabase.from('project_activity_log').insert({ project_id, action, actor, meta });
  };
};

export const useGenericInsert = <T,>(table: string, invalidateKeys: string[] = []) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: T) => {
      const { data, error } = await supabase.from(table as any).insert(payload as any).select().maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateKeys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
      toast.success('Saved');
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to save'),
  });
};

export const useGenericUpdate = (table: string, invalidateKeys: string[] = []) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { error } = await supabase.from(table as any).update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateKeys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
      toast.success('Updated');
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to update'),
  });
};

export const useGenericDelete = (table: string, invalidateKeys: string[] = []) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateKeys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
      toast.success('Deleted');
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to delete'),
  });
};

// Post a project expense + create matching GL entry (best effort).
export const usePostExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: { project_id: string; category: string; description: string; amount: number; expense_date?: string; branch_id?: string | null; created_by?: string }) => {
      // Try to find a default expense GL account
      const { data: glAcc } = await supabase
        .from('gl_accounts')
        .select('id, account_code, account_name')
        .eq('account_type', 'expense')
        .eq('is_active', true)
        .order('account_code')
        .limit(1)
        .maybeSingle();

      const { data: expense, error } = await supabase
        .from('project_expenses')
        .insert({
          project_id: e.project_id,
          category: e.category,
          description: e.description,
          amount: e.amount,
          expense_date: e.expense_date || new Date().toISOString().slice(0, 10),
          branch_id: e.branch_id || null,
          created_by: e.created_by || null,
          posted_to_finance: !!glAcc,
          gl_entry_ref: glAcc ? `PRJ-EXP-${Date.now()}` : null,
        })
        .select()
        .maybeSingle();
      if (error) throw error;

      if (glAcc && expense) {
        await supabase.from('gl_entries').insert({
          gl_account_id: glAcc.id,
          entry_date: expense.expense_date,
          description: `Project Expense: ${e.description}`,
          debit: e.amount,
          credit: 0,
          reference_type: 'project',
          reference_id: e.project_id,
          reference_number: expense.gl_entry_ref,
          branch_id: e.branch_id || null,
        });
      }

      // Update project's spent
      const { data: proj } = await supabase.from('farm_projects').select('spent').eq('id', e.project_id).maybeSingle();
      const newSpent = Number(proj?.spent || 0) + Number(e.amount);
      await supabase.from('farm_projects').update({ spent: newSpent }).eq('id', e.project_id);

      return expense;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['project_expenses', vars.project_id] });
      qc.invalidateQueries({ queryKey: ['farm-project', vars.project_id] });
      qc.invalidateQueries({ queryKey: ['farm-projects'] });
      toast.success('Expense posted to finance');
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to post expense'),
  });
};

export const useUploadProjectDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, file, uploadedBy, branchId }: { projectId: string; file: File; uploadedBy?: string; branchId?: string | null }) => {
      const path = `${projectId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('project-documents').upload(path, file);
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage.from('project-documents').createSignedUrl(path, 60 * 60 * 24 * 365);
      const { error } = await supabase.from('project_documents').insert({
        project_id: projectId,
        file_name: file.name,
        file_url: signed?.signedUrl || path,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: uploadedBy || null,
        branch_id: branchId || null,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['project_documents', vars.projectId] });
      toast.success('Document uploaded');
    },
    onError: (e: any) => toast.error(e?.message || 'Upload failed'),
  });
};
