import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

interface BranchFilterable {
  branchId: string;
}

export const useBranchFilter = <T extends BranchFilterable>(data: T[]): T[] => {
  const { user, branch } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  return useMemo(() => {
    if (isSuperAdmin) {
      // Super admin can see all data, but if they selected a specific branch, filter by it
      if (branch) {
        return data.filter(item => item.branchId === branch.id);
      }
      return data;
    }
    
    // Non-super admin users only see their branch data
    if (user?.branchId) {
      return data.filter(item => item.branchId === user.branchId);
    }
    
    return [];
  }, [data, isSuperAdmin, branch, user?.branchId]);
};

export const useCurrentBranchId = (): string | undefined => {
  const { user, branch } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  if (isSuperAdmin && branch) {
    return branch.id;
  }
  
  return user?.branchId;
};
