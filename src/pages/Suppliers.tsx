import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { suppliers, branches } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Truck,
  Phone,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  DollarSign
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

const Suppliers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'All Branches';
  };

  const totalValue = suppliers.reduce((sum, s) => sum + s.totalValue, 0);
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Suppliers</h1>
            <p className="text-muted-foreground mt-1">
              Manage supplier relationships and deliveries
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Supplier Name</label>
                  <input type="text" className="input-farm" placeholder="Company name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Number</label>
                    <input type="tel" className="input-farm" placeholder="+1-555-0100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input type="email" className="input-farm" placeholder="supplier@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input type="text" className="input-farm" placeholder="e.g., Seeds, Feed, Equipment" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Assigned Branch</label>
                  <select className="input-farm">
                    <option value="">All Branches</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Supplier
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary p-3">
                <Truck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
                <p className="text-2xl font-bold font-display">{suppliers.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-success p-3">
                <Truck className="h-6 w-6 text-success-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Suppliers</p>
                <p className="text-2xl font-bold font-display">{activeSuppliers}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accent p-3">
                <DollarSign className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold font-display">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-farm pl-10"
          />
        </div>

        {/* Suppliers Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="card-farm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{supplier.name}</h3>
                  <Badge variant="secondary" className="mt-1">{supplier.category}</Badge>
                </div>
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
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{supplier.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{supplier.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="font-semibold">{supplier.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="font-semibold">${supplier.totalValue.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">{getBranchName(supplier.branchId)}</span>
                <Badge
                  className={cn(
                    supplier.status === 'active'
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {supplier.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Suppliers;
