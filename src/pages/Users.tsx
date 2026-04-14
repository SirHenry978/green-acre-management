import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { users as initialUsers, branches, getRoleLabel, UserRole } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEmployees } from '@/hooks/useEmployees';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Shield,
  Calendar,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Palmtree,
  Stethoscope,
  Home,
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

interface LeaveBalance {
  id: string;
  employee_id: string;
  year: number;
  annual_leave_total: number;
  annual_leave_used: number;
  sick_leave_total: number;
  sick_leave_used: number;
  family_leave_total: number;
  family_leave_used: number;
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string | null;
  status: string;
  is_paid: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [usersList, setUsersList] = useState(initialUsers);
  const { toast } = useToast();
  const { employees } = useEmployees();

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

  // Leave Dashboard state
  const [leaveUser, setLeaveUser] = useState<typeof initialUsers[0] | null>(null);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(false);

  const year = new Date().getFullYear();

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

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown';
  };

  // Find employee matching a dummy user by name
  const findEmployeeForUser = (userName: string) => {
    const parts = userName.toLowerCase().split(' ');
    return employees.find(e =>
      parts.some(p => e.first_name.toLowerCase().includes(p) || e.last_name.toLowerCase().includes(p))
    );
  };

  const fetchLeaveData = useCallback(async (employeeId?: string) => {
    setLeaveLoading(true);
    let balQ = supabase.from('leave_balances').select('*').eq('year', year);
    let reqQ = supabase.from('leave_requests').select('*').order('created_at', { ascending: false });

    if (employeeId) {
      balQ = balQ.eq('employee_id', employeeId);
      reqQ = reqQ.eq('employee_id', employeeId);
    }

    const [balRes, reqRes] = await Promise.all([balQ, reqQ]);
    setLeaveBalances((balRes.data as unknown as LeaveBalance[]) || []);
    setLeaveRequests((reqRes.data as unknown as LeaveRequest[]) || []);
    setLeaveLoading(false);
  }, [year]);

  const handleOpenLeave = (user: typeof initialUsers[0]) => {
    setLeaveUser(user);
    setIsLeaveOpen(true);
    const emp = findEmployeeForUser(user.name);
    fetchLeaveData(emp?.id);
  };

  const handleApprove = async (requestId: string) => {
    const { error } = await supabase.from('leave_requests').update({
      status: 'approved',
      approved_by: leaveUser?.name || 'Admin',
      approved_at: new Date().toISOString(),
    } as any).eq('id', requestId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    // Update used days in balance
    const req = leaveRequests.find(r => r.id === requestId);
    if (req) {
      const bal = leaveBalances.find(b => b.employee_id === req.employee_id);
      if (bal) {
        const updateField =
          req.leave_type === 'annual' ? 'annual_leave_used' :
          req.leave_type === 'sick' ? 'sick_leave_used' :
          req.leave_type === 'family' ? 'family_leave_used' : null;
        if (updateField) {
          const currentUsed = (bal as any)[updateField] || 0;
          await supabase.from('leave_balances').update({
            [updateField]: currentUsed + req.days_count,
          } as any).eq('id', bal.id);
        }
      }
    }

    toast({ title: 'Leave Approved', description: 'The leave request has been approved.' });
    const emp = findEmployeeForUser(leaveUser?.name || '');
    fetchLeaveData(emp?.id);
  };

  const handleReject = async (requestId: string) => {
    const { error } = await supabase.from('leave_requests').update({
      status: 'rejected',
      approved_by: leaveUser?.name || 'Admin',
      approved_at: new Date().toISOString(),
    } as any).eq('id', requestId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Leave Rejected', description: 'The leave request has been rejected.' });
    const emp = findEmployeeForUser(leaveUser?.name || '');
    fetchLeaveData(emp?.id);
  };

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

  // Leave dashboard computed values
  const totalAllocated = leaveBalances.reduce((s, b) => s + b.annual_leave_total + b.sick_leave_total + b.family_leave_total, 0);
  const totalUsed = leaveBalances.reduce((s, b) => s + b.annual_leave_used + b.sick_leave_used + b.family_leave_used, 0);
  const totalRemaining = totalAllocated - totalUsed;
  const pendingRequests = leaveRequests.filter(r => r.status === 'pending');

  const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2; label: string }> = {
    approved: { color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2, label: 'Approved' },
    pending: { color: 'bg-warning/10 text-warning border-warning/20', icon: Clock, label: 'Pending' },
    rejected: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle, label: 'Rejected' },
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
                          <DropdownMenuItem className="gap-2" onClick={() => handleOpenLeave(user)}>
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

        {/* Leave Dashboard Dialog */}
        <Dialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Leave Dashboard — {leaveUser?.name}
              </DialogTitle>
            </DialogHeader>

            {leaveLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading leave data...</p>
            ) : (
              <div className="space-y-5 mt-2">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <CalendarDays className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="text-xl font-bold">{totalAllocated}</p>
                      <p className="text-[10px] text-muted-foreground">Total Allocated</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Clock className="h-5 w-5 mx-auto text-warning mb-1" />
                      <p className="text-xl font-bold">{totalUsed}</p>
                      <p className="text-[10px] text-muted-foreground">Days Used</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <CheckCircle2 className="h-5 w-5 mx-auto text-success mb-1" />
                      <p className="text-xl font-bold">{totalRemaining}</p>
                      <p className="text-[10px] text-muted-foreground">Days Remaining</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Clock className="h-5 w-5 mx-auto text-accent mb-1" />
                      <p className="text-xl font-bold">{pendingRequests.length}</p>
                      <p className="text-[10px] text-muted-foreground">Pending Requests</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Balance Breakdown */}
                {leaveBalances.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Leave Balances — {year}</h3>
                    {leaveBalances.map(bal => {
                      const categories = [
                        { label: 'Annual', total: bal.annual_leave_total, used: bal.annual_leave_used, color: 'text-primary', bg: 'bg-primary/10', Icon: Palmtree },
                        { label: 'Sick', total: bal.sick_leave_total, used: bal.sick_leave_used, color: 'text-warning', bg: 'bg-warning/10', Icon: Stethoscope },
                        { label: 'Family', total: bal.family_leave_total, used: bal.family_leave_used, color: 'text-accent', bg: 'bg-accent/10', Icon: Home },
                      ];
                      return (
                        <div key={bal.id} className="rounded-lg border p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">{getEmployeeName(bal.employee_id)}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {categories.map(cat => {
                              const remaining = cat.total - cat.used;
                              const pct = cat.total > 0 ? (cat.used / cat.total) * 100 : 0;
                              return (
                                <div key={cat.label} className={`rounded-lg p-2 ${cat.bg}`}>
                                  <div className="flex items-center gap-1 mb-1">
                                    <cat.Icon className={`h-3 w-3 ${cat.color}`} />
                                    <span className="text-xs font-medium">{cat.label}</span>
                                  </div>
                                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                    <span>{remaining} left</span>
                                    <span>{cat.used}/{cat.total}</span>
                                  </div>
                                  <Progress value={pct} className="h-1.5" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pending Requests - Approval Section */}
                {pendingRequests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-warning" />
                      Pending Requests — Approve / Reject
                    </h3>
                    <div className="space-y-2">
                      {pendingRequests.map(req => (
                        <div key={req.id} className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">
                                {getEmployeeName(req.employee_id)} — <span className="capitalize">{req.leave_type} Leave</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {req.start_date} → {req.end_date} · {req.days_count} day(s)
                                {req.reason && ` · ${req.reason}`}
                              </p>
                              {!req.is_paid && <Badge variant="destructive" className="text-[10px] mt-1">Unpaid — exceeds allocation</Badge>}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleReject(req.id)}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                              <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleApprove(req.id)}>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Request History */}
                {leaveRequests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">All Leave Requests</h3>
                    <div className="space-y-1.5">
                      {leaveRequests.slice(0, 10).map(req => {
                        const cfg = statusConfig[req.status] || statusConfig.pending;
                        const StatusIcon = cfg.icon;
                        return (
                          <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`h-4 w-4 shrink-0 ${cfg.color.split(' ')[1]}`} />
                              <div>
                                <p className="text-xs font-medium">
                                  {getEmployeeName(req.employee_id)} — <span className="capitalize">{req.leave_type}</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {req.start_date} → {req.end_date} · {req.days_count}d
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {!req.is_paid && <Badge variant="destructive" className="text-[9px] px-1.5 py-0">Unpaid</Badge>}
                              <Badge variant="outline" className={cn("text-[10px]", cfg.color)}>{cfg.label}</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {leaveBalances.length === 0 && leaveRequests.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No leave data found for this user. Make sure an employee record is linked.
                  </p>
                )}
              </div>
            )}
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
