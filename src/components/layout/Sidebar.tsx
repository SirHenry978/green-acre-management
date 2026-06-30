import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  DollarSign,
  Calendar,
  Truck,
  ShoppingCart,
  Warehouse,
  Settings,
  FileText,
  LogOut,
  Sprout,
  ChevronLeft,
  ChevronRight,
  X,
  Bug,
  CloudSun,
  Newspaper,
  FolderKanban,
  UserCog,
  CalendarDays,
  Building,
  ChevronDown,
  LayoutDashboard as DashIcon,
  Home as HomeIcon,
  BedDouble,
  ClipboardList,
  Users as UsersIcon,
  BarChart3,
  MessageSquareWarning,
  UserCircle,
  ClipboardCheck,
  ClipboardSignature,
} from 'lucide-react';
import { UtensilsCrossed } from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  permission: string;
  children?: { name: string; path: string; icon: React.ElementType }[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'dashboard' },
  { name: 'Branches', path: '/branches', icon: Building2, permission: 'branches' },
  { name: 'Users', path: '/users', icon: Users, permission: 'users' },
  { name: 'Inventory', path: '/inventory', icon: Package, permission: 'inventory' },
  { name: 'Livestock', path: '/livestock', icon: Bug, permission: 'livestock' },
  { name: 'Finance', path: '/finance', icon: DollarSign, permission: 'finance' },
  { name: 'Attendance', path: '/attendance', icon: Calendar, permission: 'attendance' },
  { name: 'Suppliers', path: '/suppliers', icon: Truck, permission: 'suppliers' },
  { name: 'Customers', path: '/customers', icon: ShoppingCart, permission: 'customers' },
  { name: 'Assets', path: '/assets', icon: Warehouse, permission: 'assets' },
  { name: 'Farm Projects', path: '/farm-projects', icon: FolderKanban, permission: 'dashboard' },
  { name: 'Weather', path: '/weather', icon: CloudSun, permission: 'dashboard' },
  { name: 'Agri News', path: '/agri-news', icon: Newspaper, permission: 'dashboard' },
  { name: 'HR & Payroll', path: '/hr', icon: UserCog, permission: 'hr' },
  { name: 'Leave', path: '/leave', icon: CalendarDays, permission: 'dashboard' },
  { name: 'Requisitions', path: '/requisitions', icon: ClipboardSignature, permission: 'requisitions' },
  { name: 'Canteen', path: '/canteen', icon: UtensilsCrossed, permission: 'dashboard' },
  {
    name: 'Accommodation',
    path: '/accommodation',
    icon: Building,
    permission: 'dashboard',
    children: [
      { name: 'My Housing', path: '/accommodation?tab=my-housing', icon: UserCircle },
      { name: 'Dashboard', path: '/accommodation?tab=dashboard', icon: DashIcon },
      { name: 'Houses', path: '/accommodation?tab=houses', icon: HomeIcon },
      { name: 'Rooms', path: '/accommodation?tab=rooms', icon: BedDouble },
      { name: 'Applications', path: '/accommodation?tab=applications', icon: ClipboardList },
      { name: 'Allocations', path: '/accommodation?tab=allocations', icon: UsersIcon },
      { name: 'Requests', path: '/accommodation?tab=requests', icon: MessageSquareWarning },
      { name: 'Reports', path: '/accommodation?tab=reports', icon: BarChart3 },
    ],
  },
  { name: 'Reports', path: '/reports', icon: FileText, permission: 'reports' },
  { name: 'Settings', path: '/settings', icon: Settings, permission: 'settings' },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Accommodation: location.pathname.startsWith('/accommodation'),
  });

  const filteredNavItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar transition-all duration-300 ease-in-out",
          // Desktop
          "hidden md:block",
          collapsed ? "md:w-16" : "md:w-64",
          // Mobile
          mobileOpen && "!block w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
                <Sprout className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              {(!collapsed || mobileOpen) && (
                <span className="font-display text-lg font-bold text-sidebar-foreground">
                  FarmIQ
                </span>
              )}
            </Link>
            {/* Close button on mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
            {/* Collapse toggle on desktop */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:block rounded-lg p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="sidebar-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const Icon = item.icon;
              const hasChildren = !!item.children?.length;
              const showLabels = !collapsed || mobileOpen;
              const isOpen = openGroups[item.name] ?? false;

              if (hasChildren && showLabels) {
                return (
                  <div key={item.path}>
                    <button
                      onClick={() =>
                        setOpenGroups((g) => ({ ...g, [item.name]: !isOpen }))
                      }
                      className={cn(
                        'sidebar-item w-full justify-between',
                        isActive && 'sidebar-item-active',
                      )}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isOpen && 'rotate-180',
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="mt-1 ml-4 space-y-1 border-l border-sidebar-border pl-2">
                        {item.children!.map((child) => {
                          const ChildIcon = child.icon;
                          const childActive =
                            location.pathname + location.search === child.path;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                'sidebar-item text-sm',
                                childActive && 'sidebar-item-active',
                              )}
                            >
                              <ChildIcon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "sidebar-item",
                    isActive && "sidebar-item-active"
                  )}
                  title={collapsed && !mobileOpen ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {(!collapsed || mobileOpen) && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-sidebar-border p-3">
            {(!collapsed || mobileOpen) && user && (
              <div className="mb-3 rounded-lg bg-sidebar-accent p-3">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            )}
            <button
              onClick={logout}
              className="sidebar-item w-full justify-center text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
              title={collapsed && !mobileOpen ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5" />
              {(!collapsed || mobileOpen) && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
