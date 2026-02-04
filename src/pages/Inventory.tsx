import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { inventory as initialInventory, branches, InventoryItem } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Package,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  ArrowUpDown,
  Filter
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
import { useToast } from '@/hooks/use-toast';
import { InventoryItemForm } from '@/components/inventory/InventoryItemForm';
import { DeleteConfirmDialog } from '@/components/inventory/DeleteConfirmDialog';
import { AdjustStockDialog } from '@/components/inventory/AdjustStockDialog';

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
  const { toast } = useToast();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const categories = ['all', ...new Set(inventoryItems.map(i => i.category))];

  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'Unknown';
  };

  const lowStockCount = inventoryItems.filter(i => i.quantity <= i.minStock).length;
  const totalValue = inventoryItems.reduce((sum, i) => sum + i.value, 0);

  // CRUD Operations
  const handleAddItem = (data: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...data,
      id: `i${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setInventoryItems([...inventoryItems, newItem]);
    setIsAddDialogOpen(false);
    toast({
      title: 'Item Added',
      description: `${data.name} has been added to inventory.`,
    });
  };

  const handleEditItem = (data: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    if (!selectedItem) return;
    const updatedItems = inventoryItems.map(item =>
      item.id === selectedItem.id
        ? { ...item, ...data, lastUpdated: new Date().toISOString().split('T')[0] }
        : item
    );
    setInventoryItems(updatedItems);
    setIsEditDialogOpen(false);
    setSelectedItem(null);
    toast({
      title: 'Item Updated',
      description: `${data.name} has been updated.`,
    });
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;
    setInventoryItems(inventoryItems.filter(item => item.id !== selectedItem.id));
    setIsDeleteDialogOpen(false);
    toast({
      title: 'Item Deleted',
      description: `${selectedItem.name} has been removed from inventory.`,
    });
    setSelectedItem(null);
  };

  const handleAdjustStock = (itemId: string, adjustment: number, type: 'add' | 'remove') => {
    const updatedItems = inventoryItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = type === 'add' 
          ? item.quantity + adjustment 
          : Math.max(0, item.quantity - adjustment);
        return { 
          ...item, 
          quantity: newQuantity,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return item;
    });
    setInventoryItems(updatedItems);
    toast({
      title: 'Stock Adjusted',
      description: `Stock has been ${type === 'add' ? 'increased' : 'decreased'} by ${adjustment}.`,
    });
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const openAdjustDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsAdjustDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Inventory</h1>
            <p className="text-muted-foreground mt-1">
              Manage seeds, fertilizers, feed, chemicals, and equipment
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary p-3">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold font-display">{inventoryItems.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-warning p-3">
                <AlertTriangle className="h-6 w-6 text-warning-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold font-display">{lowStockCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-success p-3">
                <ArrowUpDown className="h-6 w-6 text-success-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold font-display">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-farm pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {filterCategory === 'all' ? 'All Categories' : filterCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className="capitalize"
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Inventory Table */}
        <div className="card-farm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-farm">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Branch</th>
                  <th>Quantity</th>
                  <th>Min Stock</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const isLowStock = item.quantity <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="font-medium">{item.name}</td>
                      <td>
                        <Badge className={cn("capitalize", categoryColors[item.category] || 'bg-muted')}>
                          {item.category}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground">{getBranchName(item.branchId)}</td>
                      <td>
                        <span className={cn(isLowStock && "text-destructive font-medium")}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="text-muted-foreground">{item.minStock} {item.unit}</td>
                      <td className="font-medium">${item.value.toLocaleString()}</td>
                      <td>
                        <Badge
                          className={cn(
                            isLowStock
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-success/10 text-success'
                          )}
                        >
                          {isLowStock ? 'Low Stock' : 'In Stock'}
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
                            <DropdownMenuItem className="gap-2" onClick={() => openEditDialog(item)}>
                              <Edit className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => openAdjustDialog(item)}>
                              <ArrowUpDown className="h-4 w-4" /> Adjust Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => openDeleteDialog(item)}>
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      No inventory items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <InventoryItemForm
            onSubmit={handleAddItem}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          <InventoryItemForm
            item={selectedItem}
            onSubmit={handleEditItem}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={selectedItem?.name || ''}
        onConfirm={handleDeleteItem}
      />

      {/* Adjust Stock Dialog */}
      <AdjustStockDialog
        open={isAdjustDialogOpen}
        onOpenChange={setIsAdjustDialogOpen}
        item={selectedItem}
        onConfirm={handleAdjustStock}
      />
    </DashboardLayout>
  );
};

export default Inventory;
