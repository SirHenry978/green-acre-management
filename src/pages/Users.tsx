import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { users as initialUsers, branches, getRoleLabel, UserRole } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Shield,
  Calendar,
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const roleColors: Record<string, string> = {
  super_admin: 'bg-primary/10 text-primary',
  branch_manager: 'bg-success/10 text-success',
  field_staff: 'bg-accent/20 text-accent-foreground',
  accountant: 'bg-warning/10 text-warning',
  inventory_staff: 'bg-muted text-muted-foreground',
};

const allRoles: { value: UserRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'branch_manager', label: 'Branch Manager' },
  { value: 'field_staff', label: 'Field Staff' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'inventory_staff', label: 'Inventory Staff' },
];

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [usersList, setUsersList] = useState(initialUsers);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Edit User state
  const [editUser, setEditUser] = useState<typeof initialUsers[0] | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Change Role state
  const [roleUser, setRoleUser] = useState<typeof initialUsers[0] | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('field_staff');
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  // Delete confirm state
  const [deleteUser, setDeleteUser] = useState<typeof initialUsers[0] | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const filteredUsers = usersList.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBranchName = (branchId?: string) => {
    if (!branchId) return 'All Branches';
    return branches.find(b => b.id === branchId)?.name || 'Unknown';
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleOpenEdit = (user: typeof initialUsers[0]) => {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditBranch(user.branchId || '');
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editUser) return;
    setUsersList(prev =>
      prev.map(u =>
        u.id === editUser.id
          ? { ...u, name: editName, email: editEmail, phone: editPhone, branchId: editBranch || undefined }
          : u
      )
    );
    toast({ title: 'User Updated', description: `${editName} has been updated successfully.` });
    setIsEditOpen(false);
  };

  const handleOpenRoleChange = (user: typeof initialUsers[0]) => {
    setRoleUser(user);
    setNewRole(user.role);
    setIsRoleOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleUser) return;
    setUsersList(prev =>
      prev.map(u =>
        u.id === roleUser.id ? { ...u, role: newRole } : u
      )
    );
    toast({ title: 'Role Changed', description: `${roleUser.name} is now ${getRoleLabel(newRole)}.` });
    setIsRoleOpen(false);
  };

  const handleDelete = () => {
    if (!deleteUser) return;
    setUsersList(prev => prev.filter(u => u.id !== deleteUser.id));
    toast({ title: 'User Deleted', description: `${deleteUser.name} has been removed.`, variant: 'destructive' });
    setIsDeleteOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Users</h1>
            <p className="text-muted-foreground mt-1">Manage system users and their permissions</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div>
                  <Label>Full Name</Label>
                  <Input placeholder="Enter full name" className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="user@email.com" className="mt-1" />
                </div>
                <div>
                  <Label>Role</Label>
                  <select className="input-farm mt-1 w-full">
                    {allRoles.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Assign to Branch</Label>
                  <select className="input-farm mt-1 w-full">
                    <option value="">All Branches (Super Admin only)</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Temporary Password</Label>
                  <Input type="password" placeholder="Create a password" className="mt-1" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Add User</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
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
                          <DropdownMenuItem className="gap-2" onClick={() => handleOpenEdit(user)}>
                            <Edit className="h-4 w-4" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => handleOpenRoleChange(user)}>
                            <Shield className="h-4 w-4" /> Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => navigate('/leave-application')}>
                            <Calendar className="h-4 w-4" /> View Leaves
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive"
                            onClick={() => { setDeleteUser(user); setIsDeleteOpen(true); }}
                          >
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

        {/* Edit User Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit User — {editUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Full Name</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Branch</Label>
                <Select value={editBranch} onValueChange={setEditBranch}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Role Dialog */}
        <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Change Role — {roleUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Current Role</Label>
                <p className="text-sm text-muted-foreground mt-1">{roleUser ? getRoleLabel(roleUser.role) : ''}</p>
              </div>
              <div>
                <Label>New Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allRoles.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRoleOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveRole}>Update Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{deleteUser?.name}</strong>? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Legend */}
        <div className="card-farm p-5">
          <h3 className="font-display font-semibold text-lg mb-4">Role Permissions</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border border-border rounded-lg">
              <Badge className={roleColors.super_admin}>Super Admin</Badge>
              <p className="text-sm text-muted-foreground mt-2">Full access to all branches, users, and system settings.</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className={roleColors.branch_manager}>Branch Manager</Badge>
              <p className="text-sm text-muted-foreground mt-2">Manages assigned branch including staff, inventory, and finances.</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className={roleColors.accountant}>Accountant</Badge>
              <p className="text-sm text-muted-foreground mt-2">Access to financial reports, transactions, and supplier/customer data.</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className={roleColors.inventory_staff}>Inventory Staff</Badge>
              <p className="text-sm text-muted-foreground mt-2">Manages inventory, assets, and supplier relationships.</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className={roleColors.field_staff}>Field Staff</Badge>
              <p className="text-sm text-muted-foreground mt-2">Basic access to attendance and farm activities.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Users;
