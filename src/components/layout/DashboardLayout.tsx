import { ReactNode, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <Header sidebarCollapsed={sidebarCollapsed} onMenuToggle={() => setMobileOpen(!mobileOpen)} />
      <main
        className={`transition-all duration-300 pt-16 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
