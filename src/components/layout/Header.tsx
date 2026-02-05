import { useAuth } from '@/contexts/AuthContext';
import { branches } from '@/data/dummyData';
import { Bell, Search, ChevronDown, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

export const Header = ({ sidebarCollapsed = false }: HeaderProps) => {
  const { user, branch, switchBranch, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const isSuperAdmin = user?.role === 'super_admin';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={`fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur transition-all duration-300 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      } px-6`}
    >
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="input-farm pl-10 w-64"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Branch Selector (for super admin) */}
        {isSuperAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
              <span className="text-muted-foreground">Branch:</span>
              <span>{branch?.name || 'All Branches'}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Select Branch</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {branches.map((b) => (
                <DropdownMenuItem
                  key={b.id}
                  onClick={() => switchBranch(b.id)}
                  className="flex items-center justify-between"
                >
                  <span>{b.name}</span>
                  <Badge variant={b.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {b.status}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-muted-foreground text-xs flex items-center gap-2"
            >
              <LogOut className="h-3 w-3" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
