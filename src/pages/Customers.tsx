import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { customers, branches } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  ShoppingCart,
  Phone,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  AlertCircle
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

const typeColors: Record<string, string> = {
  wholesale: 'bg-primary/10 text-primary',
  retail: 'bg-success/10 text-success',
  corporate: 'bg-accent/20 text-accent-foreground',
};

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'All Branches';
  };

  const totalPurchases = customers.reduce((sum, c) => sum + c.totalPurchases, 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Customers</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer orders and relationships
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Customer Name</label>
                  <input type="text" className="input-farm" placeholder="Company or individual name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Number</label>
                    <input type="tel" className="input-farm" placeholder="+1-555-0200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input type="email" className="input-farm" placeholder="customer@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Customer Type</label>
                  <select className="input-farm">
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="corporate">Corporate</option>
                  </select>
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
                    Add Customer
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
                <ShoppingCart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold font-display">{customers.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-success p-3">
                <DollarSign className="h-6 w-6 text-success-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Purchases</p>
                <p className="text-2xl font-bold font-display">${totalPurchases.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-xl p-3",
                totalOutstanding > 0 ? "bg-warning/10" : "bg-success/10"
              )}>
                <AlertCircle className={cn(
                  "h-6 w-6",
                  totalOutstanding > 0 ? "text-warning" : "text-success"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <p className={cn(
                  "text-2xl font-bold font-display",
                  totalOutstanding > 0 ? "text-warning" : "text-success"
                )}>${totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-farm pl-10"
          />
        </div>

        {/* Customers Table */}
        <div className="card-farm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-farm">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Branch</th>
                  <th>Total Purchases</th>
                  <th>Outstanding</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                    <td className="font-medium">{customer.name}</td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.contact}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge className={cn("capitalize", typeColors[customer.type])}>
                        {customer.type}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground">{getBranchName(customer.branchId)}</td>
                    <td className="font-medium text-success">${customer.totalPurchases.toLocaleString()}</td>
                    <td>
                      <span className={cn(
                        "font-medium",
                        customer.outstandingBalance > 0 ? "text-warning" : "text-success"
                      )}>
                        ${customer.outstandingBalance.toLocaleString()}
                      </span>
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

export default Customers;
