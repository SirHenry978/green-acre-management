import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole, branches, Branch } from '@/data/dummyData';
import { loginWithPassword, fetchMe, logoutTokens, tokens } from '@/lib/api';
import { hydrateAppData } from '@/data/liveData';

interface AuthContextType {
  user: User | null;
  branch: Branch | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  switchBranch: (branchId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['dashboard', 'branches', 'users', 'inventory', 'livestock', 'finance', 'attendance', 'suppliers', 'customers', 'assets', 'reports', 'settings', 'hr', 'requisitions'],
  branch_manager: ['dashboard', 'users', 'inventory', 'livestock', 'finance', 'attendance', 'suppliers', 'customers', 'assets', 'reports', 'hr', 'requisitions'],
  field_staff: ['dashboard', 'attendance', 'livestock', 'activities', 'requisitions'],
  accountant: ['dashboard', 'finance', 'reports', 'suppliers', 'customers', 'requisitions'],
  inventory_staff: ['dashboard', 'inventory', 'livestock', 'suppliers', 'assets', 'requisitions'],
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);

  const applyMe = (me: any) => {
    const role = (me?.role || 'super_admin') as UserRole;
    const resolved: User = {
      id: String(me?.id ?? 'me'),
      name: me?.first_name || me?.username || me?.email || 'User',
      email: me?.email || '',
      role,
      branchId: me?.branch_id || undefined,
      phone: me?.phone || undefined,
    };
    setUser(resolved);
    if (resolved.branchId) {
      setBranch(branches.find(b => b.id === resolved.branchId) || null);
    }
  };

  useEffect(() => {
    if (tokens.access) {
      fetchMe().then(applyMe).catch(() => logoutTokens());
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginWithPassword(email, password);
      const me = await fetchMe();
      await hydrateAppData().catch(() => undefined);
      applyMe(me);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    logoutTokens();
    setUser(null);
    setBranch(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(permission) || false;
  };

  const switchBranch = (branchId: string) => {
    const newBranch = branches.find(b => b.id === branchId);
    if (newBranch) {
      setBranch(newBranch);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      branch,
      login,
      logout,
      isAuthenticated: !!user,
      hasPermission,
      switchBranch,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
