import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { users, branches, getRoleLabel } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const roleColors: Record<string, string> = {
  super_admin: 'bg-primary/10 text-primary',
  branch_manager: 'bg-success/10 text-success',
  field_staff: 'bg-accent/20 text-accent-foreground',
  accountant: 'bg-warning/10 text-warning',
  inventory_staff: 'bg-muted text-muted-foreground',
};

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBranchName = (branchId?: string) => {
    if (!branchId) return 'All Branches';
    return branches.find(b => b.id === branchId)?.name || 'Unknown';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Users</h1>
            <p className="text-muted-foreground mt-1">
              Manage system users and their permissions
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input type="text" className="input-farm" placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" className="input-farm" placeholder="user@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select className="input-farm">
                    <option value="field_staff">Field Staff</option>
                    <option value="inventory_staff">Inventory Staff</option>
                    <option value="accountant">Accountant</option>
                    <option value="branch_manager">Branch Manager</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Assign to Branch</label>
                  <select className="input-farm">
                    <option value="">All Branches (Super Admin only)</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Temporary Password</label>
                  <input type="password" className="input-farm" placeholder="Create a password" />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add User
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-farm pl-10"
          />
        </div>

        {/* Users Table */}
        <div className="card-farm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-farm">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Branch</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <Badge className={cn("gap-1", roleColors[user.role])}>
                        <Shield className="h-3 w-3" />
                        {getRoleLabel(user.role)}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground">{getBranchName(user.branchId)}</td>
                    <td className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-muted">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Shield className="h-4 w-4" /> Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Legend */}
        <div className="card-farm p-5">
          <h3 className="font-display font-semibold text-lg mb-4">Role Permissions</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border border-border rounded-lg">
              <Badge className={roleColors.super_admin}>Super Admin</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Full access to all branches, users, and system settings.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className={roleColors.branch_manager}>Branch Manager</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Manages assigned branch including staff, inventory, and finances.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className={roleColors.accountant}>Accountant</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Access to financial reports, transactions, and supplier/customer data.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className={roleColors.inventory_staff}>Inventory Staff</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Manages inventory, assets, and supplier relationships.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className={roleColors.field_staff}>Field Staff</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Basic access to attendance and farm activities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Users;
