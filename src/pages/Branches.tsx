import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { branches as initialBranches, users, getFarmTypeIcon, Branch } from '@/data/dummyData';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  MapPin, 
  Users, 
  MoreVertical,
  Edit,
  Trash2,
  Eye
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
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { BranchForm } from '@/components/branches/BranchForm';
import { DeleteBranchDialog } from '@/components/branches/DeleteBranchDialog';

const Branches = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || branch.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getManagerName = (managerId: string) => {
    return users.find(u => u.id === managerId)?.name || 'Unassigned';
  };

  const handleToggleStatus = (branchId: string) => {
    setBranches(prev => prev.map(b => 
      b.id === branchId 
        ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' }
        : b
    ));
    toast.success('Branch status updated successfully');
  };

  const handleAddBranch = (branchData: Omit<Branch, 'id' | 'totalStaff' | 'monthlyRevenue' | 'monthlyExpenses'>) => {
    const newBranch: Branch = {
      ...branchData,
      id: `b${Date.now()}`,
      totalStaff: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
    };
    setBranches(prev => [...prev, newBranch]);
    setIsAddDialogOpen(false);
    toast.success('Branch created successfully');
  };

  const handleEditBranch = (branchData: Omit<Branch, 'id' | 'totalStaff' | 'monthlyRevenue' | 'monthlyExpenses'>) => {
    if (!selectedBranch) return;
    setBranches(prev => prev.map(b => 
      b.id === selectedBranch.id 
        ? { ...b, ...branchData }
        : b
    ));
    setIsEditDialogOpen(false);
    setSelectedBranch(null);
    toast.success('Branch updated successfully');
  };

  const handleDeleteBranch = () => {
    if (!selectedBranch) return;
    setBranches(prev => prev.filter(b => b.id !== selectedBranch.id));
    setIsDeleteDialogOpen(false);
    setSelectedBranch(null);
    toast.success('Branch deleted successfully');
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsViewDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Branches</h1>
            <p className="text-muted-foreground mt-1">
              Manage all your farm branches and locations
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Branch
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-farm pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  filterStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Branches Table */}
        <div className="card-farm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-farm">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Location</th>
                  <th>Farm Type</th>
                  <th>Manager</th>
                  <th>Staff</th>
                  <th>Revenue</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-muted/30 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFarmTypeIcon(branch.farmType)}</span>
                        <span className="font-medium">{branch.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {branch.location}
                      </div>
                    </td>
                    <td className="capitalize">{branch.farmType}</td>
                    <td>{getManagerName(branch.managerId)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {branch.totalStaff}
                      </div>
                    </td>
                    <td className="font-medium">${branch.monthlyRevenue.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {isSuperAdmin && (
                          <Switch
                            checked={branch.status === 'active'}
                            onCheckedChange={() => handleToggleStatus(branch.id)}
                          />
                        )}
                        <Badge
                          className={cn(
                            branch.status === 'active'
                              ? 'bg-success/10 text-success hover:bg-success/20'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {branch.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-muted">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => openViewDialog(branch)}>
                            <Eye className="h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => openEditDialog(branch)}>
                            <Edit className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive" onClick={() => openDeleteDialog(branch)}>
                            <Trash2 className="h-4 w-4" /> Delete
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

        {/* Add Branch Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Branch</DialogTitle>
            </DialogHeader>
            <BranchForm 
              onSubmit={handleAddBranch}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Branch Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Branch</DialogTitle>
            </DialogHeader>
            <BranchForm 
              branch={selectedBranch}
              onSubmit={handleEditBranch}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedBranch(null);
              }}
              isEdit
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <DeleteBranchDialog
          branch={selectedBranch}
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedBranch(null);
          }}
          onConfirm={handleDeleteBranch}
        />

        {/* View Branch Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Branch Details</DialogTitle>
            </DialogHeader>
            {selectedBranch && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{getFarmTypeIcon(selectedBranch.farmType)}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedBranch.name}</h3>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedBranch.location}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Farm Type</p>
                    <p className="font-medium capitalize">{selectedBranch.farmType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium">{selectedBranch.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Manager</p>
                    <p className="font-medium">{getManagerName(selectedBranch.managerId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Staff</p>
                    <p className="font-medium">{selectedBranch.totalStaff}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="font-medium text-success">${selectedBranch.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                    <p className="font-medium text-destructive">${selectedBranch.monthlyExpenses.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={cn(
                      "mt-1",
                      selectedBranch.status === 'active'
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {selectedBranch.status}
                  </Badge>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      openEditDialog(selectedBranch);
                    }}
                  >
                    Edit Branch
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Branches;
