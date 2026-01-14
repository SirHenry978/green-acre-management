import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BranchCard } from '@/components/dashboard/BranchCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { FarmTypeChart } from '@/components/dashboard/FarmTypeChart';
import { 
  branches, 
  users, 
  inventory, 
  transactions 
} from '@/data/dummyData';
import { 
  Building2, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'super_admin';
  const isBranchManager = user?.role === 'branch_manager';

  // Calculate stats
  const activeBranches = branches.filter(b => b.status === 'active').length;
  const totalStaff = branches.reduce((sum, b) => sum + b.totalStaff, 0);
  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const lowStockItems = inventory.filter(i => i.quantity <= i.minStock).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">
              {getGreeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening across your farms today.
            </p>
          </div>
          {lowStockItems > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 text-warning rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">{lowStockItems} items low on stock</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isSuperAdmin && (
            <StatCard
              title="Active Branches"
              value={activeBranches}
              change={`${branches.length} total`}
              changeType="neutral"
              icon={Building2}
              iconColor="bg-primary"
            />
          )}
          <StatCard
            title="Total Staff"
            value={isSuperAdmin ? totalStaff : user?.branchId ? branches.find(b => b.id === user.branchId)?.totalStaff || 0 : 0}
            change="+5 this month"
            changeType="positive"
            icon={Users}
            iconColor="bg-success"
          />
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            change="+12.5% from last month"
            changeType="positive"
            icon={DollarSign}
            iconColor="bg-accent"
          />
          <StatCard
            title="Total Expenses"
            value={`$${totalExpenses.toLocaleString()}`}
            change="-3.2% from last month"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-destructive"
          />
          <StatCard
            title="Inventory Items"
            value={inventory.length}
            change={`${lowStockItems} need restocking`}
            changeType={lowStockItems > 0 ? 'negative' : 'neutral'}
            icon={Package}
            iconColor="bg-secondary"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <FarmTypeChart />
          </div>
        </div>

        {/* Branches and Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {(isSuperAdmin || isBranchManager) && (
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold">
                  {isSuperAdmin ? 'All Branches' : 'Your Branches'}
                </h2>
                <button 
                  onClick={() => navigate('/branches')}
                  className="text-sm text-primary hover:underline"
                >
                  View all →
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {branches
                  .filter(b => isSuperAdmin || b.managerId === user?.id)
                  .slice(0, 4)
                  .map((branch) => (
                    <BranchCard 
                      key={branch.id} 
                      branch={branch}
                      onClick={() => navigate(`/branches/${branch.id}`)}
                    />
                  ))}
              </div>
            </div>
          )}
          <div>
            <ActivityFeed branchId={isSuperAdmin ? undefined : user?.branchId} limit={6} />
          </div>
        </div>

        {/* Quick Stats for Staff */}
        {!isSuperAdmin && !isBranchManager && (
          <div className="card-farm p-6">
            <h2 className="text-xl font-display font-semibold mb-4">Your Work Summary</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-primary">15</p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-success">98%</p>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-accent">4.8</p>
                <p className="text-sm text-muted-foreground">Performance Score</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
