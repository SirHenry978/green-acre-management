import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { branches, users, getFarmTypeIcon } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const Branches = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || branch.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getManagerName = (managerId: string) => {
    return users.find(u => u.id === managerId)?.name || 'Unassigned';
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Branch</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Branch Name</label>
                  <input type="text" className="input-farm" placeholder="Enter branch name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input type="text" className="input-farm" placeholder="City, State/Country" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Farm Type</label>
                  <select className="input-farm">
                    <option value="crops">Crops</option>
                    <option value="livestock">Livestock</option>
                    <option value="dairy">Dairy</option>
                    <option value="poultry">Poultry</option>
                    <option value="aquaculture">Aquaculture</option>
                    <option value="mixed">Mixed Farming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <input type="text" className="input-farm" placeholder="e.g., 500 acres" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Assign Manager</label>
                  <select className="input-farm">
                    {users.filter(u => u.role === 'branch_manager').map(manager => (
                      <option key={manager.id} value={manager.id}>{manager.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Create Branch
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                      <Badge
                        className={cn(
                          branch.status === 'active'
                            ? 'bg-success/10 text-success hover:bg-success/20'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {branch.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-muted">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
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
      </div>
    </DashboardLayout>
  );
};

export default Branches;
