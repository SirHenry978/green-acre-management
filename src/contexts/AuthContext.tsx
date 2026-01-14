import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, users, branches, Branch } from '@/data/dummyData';

interface AuthContextType {
  user: User | null;
  branch: Branch | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  switchBranch: (branchId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['dashboard', 'branches', 'users', 'inventory', 'finance', 'attendance', 'suppliers', 'customers', 'assets', 'reports', 'settings'],
  branch_manager: ['dashboard', 'users', 'inventory', 'finance', 'attendance', 'suppliers', 'customers', 'assets', 'reports'],
  field_staff: ['dashboard', 'attendance', 'activities'],
  accountant: ['dashboard', 'finance', 'reports', 'suppliers', 'customers'],
  inventory_staff: ['dashboard', 'inventory', 'suppliers', 'assets'],
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);

  const login = (email: string, _password: string): boolean => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      if (foundUser.branchId) {
        const userBranch = branches.find(b => b.id === foundUser.branchId);
        setBranch(userBranch || null);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
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
