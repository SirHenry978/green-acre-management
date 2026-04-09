import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { inventory, branches } from '@/data/dummyData';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, Package, AlertTriangle, MoreVertical, Edit, Trash2, ArrowUpDown, Filter,
  Warehouse, ArrowRightLeft, FileInput, FileOutput, ClipboardList
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import WarehouseManager from '@/components/inventory/WarehouseManager';
import IssueItems from '@/components/inventory/IssueItems';
import ReceiveItems from '@/components/inventory/ReceiveItems';
import DeliveryNotes from '@/components/inventory/DeliveryNotes';
import CreditNotes from '@/components/inventory/CreditNotes';
import WarehouseTransferReport from '@/components/inventory/WarehouseTransferReport';

const categoryColors: Record<string, string> = {
  seeds: 'bg-success/10 text-success',
  fertilizers: 'bg-warning/10 text-warning',
  chemicals: 'bg-destructive/10 text-destructive',
  feed: 'bg-accent/20 text-accent-foreground',
  machinery: 'bg-primary/10 text-primary',
  tools: 'bg-muted text-muted-foreground',
  livestock: 'bg-success/10 text-success',
};

const Inventory = () => {
  const { user } = useAuth();
  const branchFilteredInventory = useBranchFilter(inventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const categories = ['all', ...new Set(branchFilteredInventory.map(i => i.category))];

  const filteredInventory = branchFilteredInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getBranchName = (branchId: string) => branches.find(b => b.id === branchId)?.name || 'Unknown';
  const lowStockCount = branchFilteredInventory.filter(i => i.quantity <= i.minStock).length;
  const totalValue = branchFilteredInventory.reduce((sum, i) => sum + i.value, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage stock, warehouses, issues, receipts, and documents
          </p>
        </div>

        <Tabs defaultValue="stock" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="stock" className="gap-1"><Package className="h-4 w-4" /> Stock</TabsTrigger>
            <TabsTrigger value="warehouses" className="gap-1"><Warehouse className="h-4 w-4" /> Warehouses</TabsTrigger>
            <TabsTrigger value="issues" className="gap-1"><ArrowRightLeft className="h-4 w-4" /> Issue</TabsTrigger>
            <TabsTrigger value="receipts" className="gap-1"><FileInput className="h-4 w-4" /> Receive</TabsTrigger>
            <TabsTrigger value="delivery-notes" className="gap-1"><FileOutput className="h-4 w-4" /> Delivery Notes</TabsTrigger>
            <TabsTrigger value="credit-notes" className="gap-1"><FileOutput className="h-4 w-4" /> Credit Notes</TabsTrigger>
            <TabsTrigger value="report" className="gap-1"><ClipboardList className="h-4 w-4" /> Transfer Report</TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-6 mt-4">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="stat-card">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary p-3"><Package className="h-6 w-6 text-primary-foreground" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold font-display">{inventory.length}</p>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-warning p-3"><AlertTriangle className="h-6 w-6 text-warning-foreground" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                    <p className="text-2xl font-bold font-display">{lowStockCount}</p>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-success p-3"><ArrowUpDown className="h-6 w-6 text-success-foreground" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold font-display">${totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters + Add */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Search inventory..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-farm pl-10" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      {filterCategory === 'all' ? 'All Categories' : filterCategory}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {categories.map(c => (
                      <DropdownMenuItem key={c} onClick={() => setFilterCategory(c)} className="capitalize">{c}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
                  <form className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Item Name</label>
                      <input type="text" className="input-farm" placeholder="Enter item name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select className="input-farm">
                          {['seeds', 'fertilizers', 'chemicals', 'feed', 'machinery', 'tools', 'livestock'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Branch</label>
                        <select className="input-farm">
                          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Quantity</label>
                        <input type="number" className="input-farm" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Unit</label>
                        <input type="text" className="input-farm" placeholder="kg, liters" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Min Stock</label>
                        <input type="number" className="input-farm" placeholder="0" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Value ($)</label>
                      <input type="number" className="input-farm" placeholder="0.00" />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" className="flex-1">Add Item</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Table */}
            <div className="card-farm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-farm">
                  <thead>
                    <tr>
                      <th>Item Name</th><th>Category</th><th>Branch</th><th>Quantity</th><th>Min Stock</th><th>Value</th><th>Status</th><th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(item => {
                      const isLowStock = item.quantity <= item.minStock;
                      return (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="font-medium">{item.name}</td>
                          <td><Badge className={cn('capitalize', categoryColors[item.category] || 'bg-muted')}>{item.category}</Badge></td>
                          <td className="text-muted-foreground">{getBranchName(item.branchId)}</td>
                          <td><span className={cn(isLowStock && 'text-destructive font-medium')}>{item.quantity} {item.unit}</span></td>
                          <td className="text-muted-foreground">{item.minStock} {item.unit}</td>
                          <td className="font-medium">${item.value.toLocaleString()}</td>
                          <td><Badge className={cn(isLowStock ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success')}>{isLowStock ? 'Low Stock' : 'In Stock'}</Badge></td>
                          <td className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><button className="p-2 rounded-lg hover:bg-muted"><MoreVertical className="h-4 w-4" /></button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="gap-2"><Edit className="h-4 w-4" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem className="gap-2"><ArrowUpDown className="h-4 w-4" /> Adjust Stock</DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="warehouses" className="mt-4"><WarehouseManager /></TabsContent>
          <TabsContent value="issues" className="mt-4"><IssueItems /></TabsContent>
          <TabsContent value="receipts" className="mt-4"><ReceiveItems /></TabsContent>
          <TabsContent value="delivery-notes" className="mt-4"><DeliveryNotes /></TabsContent>
          <TabsContent value="credit-notes" className="mt-4"><CreditNotes /></TabsContent>
          <TabsContent value="report" className="mt-4"><WarehouseTransferReport /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
